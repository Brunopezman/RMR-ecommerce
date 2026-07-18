/**
 * Orders routes — GET /orders?userId=:id and POST /orders
 *
 * Matches the API contract shape exactly.
 */

import { Router, Request, Response } from 'express';
import { queryAll, queryOne, run, lastInsertId, persist } from '../db.js';

/**
 * Convert SQLite datetime string to ISO 8601 format.
 * SQLite's datetime('now') returns "2026-07-13 22:10:05"
 * We need "2026-07-13T22:10:05.000Z"
 */
function toIsoDate(sqliteDate: string): string {
  if (sqliteDate.includes('T')) return sqliteDate;
  return sqliteDate.replace(' ', 'T') + '.000Z';
}

const router = Router();

/**
 * GET /orders?userId=:id — orders for a user
 * Returns Order[] matching the API contract.
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string | undefined;

    if (!userId) {
      res.status(400).json({ error: 'userId query parameter is required' });
      return;
    }

    const orderRows = queryAll(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId],
    ) as Array<{
      id: number;
      user_id: number;
      total: number;
      status: string;
      created_at: string;
      shipping_address: string | null;
    }>;

    const orders = orderRows.map((order) => {
      const items = queryAll(
        'SELECT * FROM order_items WHERE order_id = ?',
        [order.id],
      ) as Array<{
        product_id: number;
        nombre: string;
        precio: number;
        cantidad: number;
      }>;

      return {
        id: order.id,
        userId: order.user_id,
        items: items.map((item) => ({
          productId: item.product_id,
          nombre: item.nombre,
          precio: item.precio,
          cantidad: item.cantidad,
        })),
        total: order.total,
        status: order.status,
        createdAt: toIsoDate(order.created_at),
        shippingAddress: order.shipping_address ?? undefined,
      };
    });

    res.json(orders);
  } catch (err) {
    console.error('[orders] Error fetching orders:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /orders — create a new order
 * Request body: { userId, items, total, shippingAddress? }
 * Response: Order (with id, status, createdAt)
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { userId, items, total, shippingAddress } = req.body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'userId and items array are required' });
      return;
    }

    if (typeof total !== 'number' || total <= 0) {
      res.status(400).json({ error: 'total must be a positive number' });
      return;
    }

    // Verify user exists
    const user = queryOne('SELECT id FROM users WHERE id = ?', [userId]);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Validate stock for each item
    for (const item of items) {
      const product = queryOne(
        'SELECT stock FROM products WHERE id = ?',
        [item.productId],
      ) as { stock: number } | undefined;

      if (!product) {
        res.status(404).json({
          error: `Producto ID ${item.productId} no encontrado`,
        });
        return;
      }

      if (product.stock < item.cantidad) {
        res.status(400).json({
          error: `Stock insuficiente para "${item.nombre}". Disponible: ${product.stock}, solicitado: ${item.cantidad}`,
        });
        return;
      }
    }

    // Create order
    run(
      'INSERT INTO orders (user_id, total, shipping_address) VALUES (?, ?, ?)',
      [userId, total, shippingAddress ?? null],
    );

    const orderId = lastInsertId();

    // Insert order items and deduct stock
    for (const item of items) {
      run(
        'INSERT INTO order_items (order_id, product_id, nombre, precio, cantidad) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.productId, item.nombre, item.precio, item.cantidad],
      );
      run(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.cantidad, item.productId],
      );
    }

    persist();

    // Fetch the created order with items
    const orderRow = queryOne('SELECT * FROM orders WHERE id = ?', [orderId]) as {
      id: number;
      user_id: number;
      total: number;
      status: string;
      created_at: string;
      shipping_address: string | null;
    };

    const itemRows = queryAll(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId],
    ) as Array<{
      product_id: number;
      nombre: string;
      precio: number;
      cantidad: number;
    }>;

    const newOrder = {
      id: orderRow.id,
      userId: orderRow.user_id,
      items: itemRows.map((item) => ({
        productId: item.product_id,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
      })),
      total: orderRow.total,
      status: orderRow.status,
      createdAt: toIsoDate(orderRow.created_at),
      shippingAddress: orderRow.shipping_address ?? undefined,
    };

    res.status(201).json(newOrder);
  } catch (err) {
    console.error('[orders] Error creating order:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

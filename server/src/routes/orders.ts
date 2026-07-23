/**
 * Orders routes — GET /orders?userId=:id and POST /orders
 *
 * Matches the API contract shape exactly.
 */

import { Router, Request, Response } from 'express';
import { queryAll, queryOne, run } from '../db.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';
import { generateOrderPDF } from '../services/pdfService.js';

/**
 * Convert datetime to ISO 8601 format.
 */
function toIsoDate(date: string | Date): string {
  if (date instanceof Date) return date.toISOString();
  if (date.includes('T')) return date;
  return date.replace(' ', 'T') + '.000Z';
}

const router = Router();

/**
 * GET /orders?userId=:id — orders for a user
 * Returns Order[] matching the API contract.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string | undefined;

    if (!userId) {
      res.status(400).json({ error: 'userId query parameter is required' });
      return;
    }

    const orderRows = (await queryAll(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId],
    )) as Array<{
      id: number;
      user_id: number;
      total: number;
      status: string;
      created_at: string;
      shipping_address: string | null;
    }>;

    const orders = await Promise.all(
      orderRows.map(async (order) => {
        const items = (await queryAll(
          'SELECT * FROM order_items WHERE order_id = $1',
          [order.id],
        )) as Array<{
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
      }),
    );

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
router.post('/', async (req: Request, res: Response) => {
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
    const user = await queryOne('SELECT id FROM users WHERE id = $1', [userId]);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Validate stock for each item
    for (const item of items) {
      const product = (await queryOne(
        'SELECT stock FROM products WHERE id = $1',
        [item.productId],
      )) as { stock: number } | undefined;

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
    const result = await run(
      'INSERT INTO orders (user_id, total, shipping_address) VALUES ($1, $2, $3) RETURNING id',
      [userId, total, shippingAddress ?? null],
    );
    const orderId = result.rows[0].id as number;

    // Insert order items and deduct stock
    for (const item of items) {
      await run(
        'INSERT INTO order_items (order_id, product_id, nombre, precio, cantidad) VALUES ($1, $2, $3, $4, $5)',
        [orderId, item.productId, item.nombre, item.precio, item.cantidad],
      );
      await run(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.cantidad, item.productId],
      );
    }

    // Fetch the created order with items
    const orderRow = (await queryOne('SELECT * FROM orders WHERE id = $1', [
      orderId,
    ])) as {
      id: number;
      user_id: number;
      total: number;
      status: string;
      created_at: string;
      shipping_address: string | null;
    };

    const itemRows = (await queryAll(
      'SELECT * FROM order_items WHERE order_id = $1',
      [orderId],
    )) as Array<{
      product_id: number;
      nombre: string;
      precio: number;
      cantidad: number;
    }>;

    const newOrder: import('../types.js').Order = {
      id: orderRow.id,
      userId: orderRow.user_id,
      items: itemRows.map((item) => ({
        productId: item.product_id,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad,
      })),
      total: orderRow.total,
      status: orderRow.status as
        | 'pending'
        | 'paid'
        | 'shipped'
        | 'delivered'
        | 'cancelled',
      createdAt: toIsoDate(orderRow.created_at),
      shippingAddress: orderRow.shipping_address ?? undefined,
    };

    res.status(201).json(newOrder);

    // Fire order confirmation email with PDF (non-blocking)
    const orderUser = (await queryOne(
      'SELECT name, email FROM users WHERE id = $1',
      [userId],
    )) as { name: string; email: string } | undefined;
    if (orderUser) {
      generateOrderPDF(newOrder, orderUser)
        .then((pdfBuffer) =>
          sendOrderConfirmationEmail(newOrder, orderUser, pdfBuffer),
        )
        .catch((err: unknown) =>
          console.error('[orders] Error sending confirmation email:', err),
        );
    }
  } catch (err) {
    console.error('[orders] Error creating order:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

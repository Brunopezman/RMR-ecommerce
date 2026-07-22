/**
 * Products routes — GET /products and GET /products/:id
 *
 * Matches the API contract shape exactly.
 */

import { Router, Request, Response } from 'express';
import { queryAll, queryOne, run, persist } from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

/**
 * GET /products — full catalog
 * Returns Product[] matching the API contract.
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const rows = (await queryAll('SELECT * FROM products ORDER BY id')) as Array<{
      id: number;
      nombre: string;
      tipo: string | null;
      img: string;
      descripcion: string | null;
      precio: number;
      stock: number;
    }>;

    const products = rows.map((row) => ({
      id: row.id,
      nombre: row.nombre,
      tipo: row.tipo ?? undefined,
      img: row.img,
      descripcion: row.descripcion ?? undefined,
      precio: row.precio,
      stock: row.stock,
    }));

    res.json(products);
  } catch (err) {
    console.error('[products] Error fetching products:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /products/:id — single product
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const row = (await queryOne('SELECT * FROM products WHERE id = ?', [
      req.params.id,
    ])) as {
      id: number;
      nombre: string;
      tipo: string | null;
      img: string;
      descripcion: string | null;
      precio: number;
      stock: number;
    } | undefined;

    if (!row) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const product = {
      id: row.id,
      nombre: row.nombre,
      tipo: row.tipo ?? undefined,
      img: row.img,
      descripcion: row.descripcion ?? undefined,
      precio: row.precio,
      stock: row.stock,
    };

    res.json(product);
  } catch (err) {
    console.error('[products] Error fetching product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /:id/stock — update product stock (admin only)
 * Body: { stock: number }
 */
router.patch(
  '/:id/stock',
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { stock } = req.body;

      // Validate stock is a non-negative integer
      if (typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0) {
        res.status(400).json({ error: 'stock debe ser un número entero >= 0' });
        return;
      }

      // Check product exists
      const existing = (await queryOne('SELECT * FROM products WHERE id = ?', [
        req.params.id,
      ])) as {
        id: number;
        nombre: string;
        tipo: string | null;
        img: string;
        descripcion: string | null;
        precio: number;
        stock: number;
      } | undefined;

      if (!existing) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }

      // Update stock
      await run('UPDATE products SET stock = ? WHERE id = ?', [
        stock,
        req.params.id,
      ]);
      await persist();

      // Fetch and return the updated product
      const updated = (await queryOne('SELECT * FROM products WHERE id = ?', [
        req.params.id,
      ])) as {
        id: number;
        nombre: string;
        tipo: string | null;
        img: string;
        descripcion: string | null;
        precio: number;
        stock: number;
      };

      const product = {
        id: updated.id,
        nombre: updated.nombre,
        tipo: updated.tipo ?? undefined,
        img: updated.img,
        descripcion: updated.descripcion ?? undefined,
        precio: updated.precio,
        stock: updated.stock,
      };

      res.json(product);
    } catch (err) {
      console.error('[products] Error updating stock:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

export default router;

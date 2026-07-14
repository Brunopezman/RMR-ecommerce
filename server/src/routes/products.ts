/**
 * Products routes — GET /products and GET /products/:id
 *
 * Matches the API contract shape exactly.
 */

import { Router, Request, Response } from 'express';
import { queryAll, queryOne } from '../db.js';

const router = Router();

/**
 * GET /products — full catalog
 * Returns Product[] matching the API contract.
 */
router.get('/', (_req: Request, res: Response) => {
  try {
    const rows = queryAll('SELECT * FROM products ORDER BY id') as Array<{
      id: number;
      nombre: string;
      tipo: string | null;
      img: string;
      descripcion: string | null;
      precio: number;
    }>;

    const products = rows.map((row) => ({
      id: row.id,
      nombre: row.nombre,
      tipo: row.tipo ?? undefined,
      img: row.img,
      descripcion: row.descripcion ?? undefined,
      precio: row.precio,
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
router.get('/:id', (req: Request, res: Response) => {
  try {
    const row = queryOne('SELECT * FROM products WHERE id = ?', [req.params.id]) as {
      id: number;
      nombre: string;
      tipo: string | null;
      img: string;
      descripcion: string | null;
      precio: number;
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
    };

    res.json(product);
  } catch (err) {
    console.error('[products] Error fetching product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

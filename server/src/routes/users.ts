/**
 * Users routes — CRUD operations
 *
 * POST /users     — register a new user (legacy, backward-compatible)
 * GET  /users/:id — get user by ID (requires auth)
 * PATCH /users/:id — update user profile (requires auth, own user only)
 */

import { Router, Request, Response } from 'express';
import { queryAll, queryOne, run } from '../db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

/**
 * Convert datetime to ISO 8601 format.
 */
function toIsoDate(date: string | Date): string {
  if (date instanceof Date) return date.toISOString();
  if (date.includes('T')) return date;
  return date.replace(' ', 'T') + '.000Z';
}

/**
 * Shape a raw DB row into a public User object (no password_hash).
 */
function shapeUser(row: Record<string, unknown>) {
  return {
    id: row.id as number,
    email: row.email as string,
    name: row.name as string,
    role: (row.role as string) || 'user',
    apellido: (row.apellido as string) || '',
    address: (row.address as string | null) ?? undefined,
    codigoPostal: (row.codigo_postal as string) || '',
    sexo: (row.sexo as string) || '',
    telefono: (row.telefono as string) || '',
    createdAt: toIsoDate(row.created_at as string),
  };
}

const router = Router();

/**
 * POST /users — register a new user (legacy)
 * Request body: { email: string; name: string; address?: string }
 * Response: User (with id and createdAt)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, name, address } = req.body;

    if (!email || !name) {
      res.status(400).json({ error: 'email and name are required' });
      return;
    }

    // Check if user already exists
    const existing = (await queryOne('SELECT * FROM users WHERE email = $1', [
      email,
    ])) as Record<string, unknown> | undefined;

    if (existing) {
      // Return existing user (idempotent)
      res.status(200).json(shapeUser(existing));
      return;
    }

    const result = await run(
      'INSERT INTO users (email, name, address) VALUES ($1, $2, $3) RETURNING id',
      [email, name, address ?? null],
    );
    const newId = result.rows[0].id as number;

    const created = await queryOne('SELECT * FROM users WHERE id = $1', [newId]);
    res
      .status(201)
      .json(
        created
          ? shapeUser(created)
          : {
              id: newId,
              email,
              name,
              address: address ?? undefined,
              createdAt: new Date().toISOString(),
            },
      );
  } catch (err) {
    console.error('[users] Error creating user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /users — list all users (admin only)
 */
router.get(
  '/',
  authenticateToken,
  requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const rows = await queryAll('SELECT * FROM users ORDER BY created_at DESC');
      res.json(rows.map(shapeUser));
    } catch (err) {
      console.error('[users] Error listing users:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

/**
 * GET /users/:id — get user profile
 * Requires authentication. Only the own user can access their profile.
 */
router.get(
  '/:id',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const auth = res.locals.auth as { userId: number; email: string };
      const targetId = parseInt(req.params.id, 10);

      if (auth.userId !== targetId) {
        res
          .status(403)
          .json({ error: 'No tienes permiso para ver este perfil' });
        return;
      }

      const row = (await queryOne('SELECT * FROM users WHERE id = $1', [
        targetId,
      ])) as Record<string, unknown> | undefined;

      if (!row) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.json(shapeUser(row));
    } catch (err) {
      console.error('[users] Error fetching user:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

/**
 * PATCH /users/:id — update user profile
 * Requires authentication. Only the own user can update their profile.
 */
router.patch(
  '/:id',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const auth = res.locals.auth as { userId: number; email: string };
      const targetId = parseInt(req.params.id, 10);

      if (auth.userId !== targetId) {
        res
          .status(403)
          .json({ error: 'No tienes permiso para modificar este perfil' });
        return;
      }

      // Check user exists
      const existing = await queryOne('SELECT id FROM users WHERE id = $1', [
        targetId,
      ]);
      if (!existing) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      // Build dynamic SET clause from allowed fields
      const allowedFields = [
        'name',
        'apellido',
        'address',
        'codigo_postal',
        'sexo',
        'telefono',
      ] as const;
      const updates: string[] = [];
      const params: unknown[] = [];
      let paramIndex = 1;

      for (const field of allowedFields) {
        // Map camelCase body fields to snake_case columns
        const bodyKey = field === 'codigo_postal' ? 'codigoPostal' : field;
        const value = req.body[bodyKey];

        if (value !== undefined) {
          updates.push(`${field} = $${paramIndex++}`);
          params.push(value);
        }
      }

      if (updates.length === 0) {
        res
          .status(400)
          .json({ error: 'No se proporcionaron campos para actualizar' });
        return;
      }

      params.push(targetId);
      await run(
        `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
        params,
      );

      // Return updated user
      const updated = (await queryOne('SELECT * FROM users WHERE id = $1', [
        targetId,
      ])) as Record<string, unknown> | undefined;
      res.json(updated ? shapeUser(updated) : { id: targetId });
    } catch (err) {
      console.error('[users] Error updating user:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

export default router;

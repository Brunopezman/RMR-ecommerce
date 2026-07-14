/**
 * Users routes — POST /users
 *
 * Matches the API contract shape exactly.
 */

import { Router, Request, Response } from 'express';
import { queryOne, run, lastInsertId, persist } from '../db.js';

/**
 * Convert SQLite datetime string to ISO 8601 format.
 */
function toIsoDate(sqliteDate: string): string {
  if (sqliteDate.includes('T')) return sqliteDate;
  return sqliteDate.replace(' ', 'T') + '.000Z';
}

const router = Router();

/**
 * POST /users — register a new user
 * Request body: { email: string; name: string; address?: string }
 * Response: User (with id and createdAt)
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { email, name, address } = req.body;

    if (!email || !name) {
      res.status(400).json({ error: 'email and name are required' });
      return;
    }

    // Check if user already exists
    const existing = queryOne('SELECT * FROM users WHERE email = ?', [email]) as {
      id: number;
      email: string;
      name: string;
      address: string | null;
      created_at: string;
    } | undefined;

    if (existing) {
      // Return existing user (idempotent)
      res.status(200).json({
        id: existing.id,
        email: existing.email,
        name: existing.name,
        address: existing.address ?? undefined,
        createdAt: toIsoDate(existing.created_at),
      });
      return;
    }

    run('INSERT INTO users (email, name, address) VALUES (?, ?, ?)', [
      email,
      name,
      address ?? null,
    ]);

    const newId = lastInsertId();
    persist();

    const newUser = {
      id: newId,
      email,
      name,
      address: address ?? undefined,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json(newUser);
  } catch (err) {
    console.error('[users] Error creating user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

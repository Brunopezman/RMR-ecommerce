/**
 * Auth routes — register and login
 *
 * POST /api/auth/register — create account with password
 * POST /api/auth/login    — authenticate and return JWT
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryOne, run, lastInsertId, persist } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'rmr-dev-secret';

const router = Router();

/**
 * Convert SQLite datetime string to ISO 8601 format.
 */
function toIsoDate(sqliteDate: string): string {
  if (sqliteDate.includes('T')) return sqliteDate;
  return sqliteDate.replace(' ', 'T') + '.000Z';
}

/**
 * Build a JWT token for a given user.
 */
function generateToken(userId: number, email: string, role: string): string {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
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

/**
 * POST /api/auth/register
 *
 * Request body: { email, password, name, apellido, address?, codigoPostal?, sexo?, telefono? }
 * Response 201: { user: User, token: string }
 * Response 409: { error: "El email ya está registrado" }
 */
router.post('/register', (req: Request, res: Response) => {
  try {
    const { email, password, name, apellido, address, codigoPostal, sexo, telefono } = req.body;

    // ── Validation ──────────────────────────────
    if (!email || !password || !name) {
      res.status(400).json({ error: 'email, password y name son obligatorios' });
      return;
    }

    if (typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    // ── Check duplicate ─────────────────────────
    const existing = queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      res.status(409).json({ error: 'El email ya está registrado' });
      return;
    }

    // ── Hash password ───────────────────────────
    const passwordHash = bcrypt.hashSync(password, 10);

    // ── Insert user ─────────────────────────────
    run(
      `INSERT INTO users (email, password_hash, name, apellido, address, codigo_postal, sexo, telefono)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        passwordHash,
        name,
        apellido ?? '',
        address ?? null,
        codigoPostal ?? '',
        sexo ?? '',
        telefono ?? '',
      ],
    );

    const newId = lastInsertId();
    persist();

    // ── Fetch created user ──────────────────────
    const created = queryOne('SELECT * FROM users WHERE id = ?', [newId]);
    if (!created) {
      res.status(500).json({ error: 'Error al crear el usuario' });
      return;
    }

    const user = shapeUser(created);
    const token = generateToken(newId, email, user.role);

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('[auth] Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 *
 * Request body: { email, password }
 * Response 200: { user: User, token: string }
 * Response 401: { error: "Credenciales inválidas" }
 */
router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'email y password son obligatorios' });
      return;
    }

    // ── Find user ───────────────────────────────
    const row = queryOne('SELECT * FROM users WHERE email = ?', [email]) as Record<string, unknown> | undefined;

    if (!row) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    // ── Verify password ─────────────────────────
    const passwordHash = row.password_hash as string;
    if (!passwordHash || !bcrypt.compareSync(password, passwordHash)) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const user = shapeUser(row);
    const token = generateToken(row.id as number, email, user.role);

    res.json({ user, token });
  } catch (err) {
    console.error('[auth] Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

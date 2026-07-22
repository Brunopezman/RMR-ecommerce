/**
 * Migration 001 — Initial schema (PostgreSQL).
 *
 * Creates all application tables if they don't already exist.
 * Safe to run multiple times (uses IF NOT EXISTS).
 */

export const name = '001-initial-schema';

/**
 * Apply the migration.
 *
 * @param runSql — Async function to execute a SQL string (with optional params)
 */
export async function up(
  runSql: (sql: string, params?: unknown[]) => Promise<void>,
): Promise<void> {
  // ── products ──────────────────────────────────────────────
  await runSql(`CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    img TEXT NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0
  )`);

  // ── users ────────────────────────────────────────────────
  await runSql(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`);

  // ── orders ───────────────────────────────────────────────
  await runSql(`CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    total NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
    created_at TIMESTAMP DEFAULT NOW(),
    shipping_address TEXT
  )`);

  // ── order_items ──────────────────────────────────────────
  await runSql(`CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    precio NUMERIC(10,2) NOT NULL,
    cantidad INTEGER NOT NULL DEFAULT 1
  )`);

  // ── contact_messages ────────────────────────────────────
  await runSql(`CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    area VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`);
}

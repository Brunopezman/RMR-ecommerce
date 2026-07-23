/**
 * Database seeding module (PostgreSQL).
 *
 * Provides idempotent seeding functions for PostgreSQL backend.
 * Uses the `run()` and `queryAll()` exports from `../db.js`.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { run, queryAll } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Path to the seed JSON file (from repo root data/db.json) */
const SEED_JSON_PATH = join(__dirname, '..', '..', '..', 'data', 'db.json');

// ── Types ───────────────────────────────────────────────

interface SeedProduct {
  id: number;
  nombre: string;
  tipo?: string;
  img: string;
  descripcion?: string;
  precio: number;
  stock?: number;
}

// ── Product seeding ────────────────────────────────────

/**
 * Seed products from `data/db.json` if the products table is empty.
 * Idempotent — skips if any products already exist.
 */
export async function seedProducts(): Promise<void> {
  const rows = await queryAll('SELECT COUNT(*) as count FROM products');
  const count = Number((rows[0]?.count as number) ?? 0);

  if (count > 0) {
    console.log(`[seed] Products table already has ${count} rows, skipping.`);
    return;
  }

  const products = readSeedFile();
  if (!products) return;

  for (const p of products) {
    await run(
      'INSERT INTO products (id, nombre, tipo, img, descripcion, precio, stock) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING',
      [p.id, p.nombre, p.tipo ?? null, p.img, p.descripcion ?? null, p.precio, p.stock ?? 0],
    );
  }

  console.log(`[seed] Inserted ${products.length} products from data/db.json`);

  // Sync the PostgreSQL sequence so subsequent inserts don't clash
  await run("SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))");
}

// ── Admin user seeding ─────────────────────────────────

/**
 * Ensure an admin user exists with the configured credentials.
 *
 * - If the user doesn't exist, creates one.
 * - If the user exists but lacks admin role, promotes them.
 * - If the user exists but lacks a password_hash, sets one.
 *
 * Admin email from ADMIN_EMAIL env var (default: admin@rock.com).
 * Admin password from ADMIN_PASSWORD env var (default: admin123).
 */
export async function seedAdminUser(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@rock.com';

  const existing = await queryAll(
    'SELECT id, role, password_hash FROM users WHERE email = $1',
    [adminEmail],
  );

  if (existing.length > 0) {
    const user = existing[0];
    let updated = false;

    if (user.role !== 'admin') {
      await run('UPDATE users SET role = $1 WHERE email = $2', ['admin', adminEmail]);
      updated = true;
      console.log(`[seed] Promoted ${adminEmail} to admin.`);
    }

    const pwHash = (user.password_hash as string) || '';
    if (!pwHash) {
      const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const newHash = bcrypt.hashSync(defaultPassword, 10);
      await run('UPDATE users SET password_hash = $1 WHERE email = $2', [newHash, adminEmail]);
      updated = true;
      console.log(`[seed] Set default password for ${adminEmail}.`);
    }

    if (updated) {
      console.log(`[seed] Admin user ${adminEmail} updated.`);
    } else {
      console.log(`[seed] Admin user ${adminEmail} already up to date.`);
    }
    return;
  }

  // Create new admin user
  const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = bcrypt.hashSync(defaultPassword, 10);
  await run(
    "INSERT INTO users (email, name, role, password_hash) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING",
    [adminEmail, 'Admin', 'admin', passwordHash],
  );
  console.log(`[seed] Created admin user: ${adminEmail}`);
}

// ── Helpers ────────────────────────────────────────────

/**
 * Read and parse the seed file. Returns null if reading fails or no products.
 */
function readSeedFile(): SeedProduct[] | null {
  try {
    const raw = readFileSync(SEED_JSON_PATH, 'utf-8');
    const data = JSON.parse(raw) as { products?: SeedProduct[] };
    if (!data.products || data.products.length === 0) {
      console.warn('[seed] Seed file has no products, skipping.');
      return null;
    }
    return data.products;
  } catch (err) {
    console.warn(`[seed] Could not read seed file at ${SEED_JSON_PATH}, skipping.`, err);
    return null;
  }
}

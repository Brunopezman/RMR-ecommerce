/**
 * Database abstraction — PostgreSQL-only via pg pool.
 *
 * Public API:
 *   initDb(), queryAll(), queryOne(), run()
 *
 * All functions are async.
 * Placeholders: use `$1`, `$2`, … (PostgreSQL-style) in all queries.
 */

import { query } from './db/pool.js';
import { runMigrations } from './db/migrate.js';
import { seedProducts, seedAdminUser } from './db/seed.js';

/**
 * Initialize the database.
 * Creates pool, runs migrations, seeds data.
 */
export async function initDb(): Promise<void> {
  console.log('[db] PostgreSQL mode active.');

  // In CI/test, truncate all tables so migrations + seeding always run cleanly
  if (process.env.NODE_ENV === 'test' || process.env.CI) {
    console.log('[db] CI/test mode: truncating tables for clean state.');
    try {
      await query(
        'TRUNCATE TABLE products, users, orders, order_items, contact_messages, _migrations RESTART IDENTITY CASCADE',
      );
    } catch (err: any) {
      // If tables don't exist yet (fresh DB), ignore error SQLSTATE 42P01
      if (err?.code === '42P01') {
        console.log('[db] Tables do not exist yet; skipping truncate.');
      } else {
        throw err;
      }
    }
  }

  await runMigrations();
  await seedProducts();
  await seedAdminUser();
  console.log('[db] PostgreSQL initialization complete.');
}

/**
 * Run a query and return all rows as objects.
 */
export async function queryAll(
  sql: string,
  params: unknown[] = [],
): Promise<Record<string, unknown>[]> {
  const result = await query(sql, params);
  return result.rows as Record<string, unknown>[];
}

/**
 * Run a query and return the first row as an object, or undefined.
 */
export async function queryOne(
  sql: string,
  params: unknown[] = [],
): Promise<Record<string, unknown> | undefined> {
  const result = await query(sql, params);
  return result.rows[0] as Record<string, unknown> | undefined;
}

/**
 * Run a write statement (INSERT, UPDATE, DELETE).
 *
 * Returns the QueryResult so callers can access RETURNING clauses.
 */
export async function run(
  sql: string,
  params: unknown[] = [],
): Promise<import('pg').QueryResult> {
  const result = await query(sql, params);
  return result;
}

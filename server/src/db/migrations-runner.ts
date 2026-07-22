/**
 * PostgreSQL migrations runner.
 *
 * Checks which migrations have already been applied (via the _migrations
 * table) and runs any pending ones in order.
 *
 * Each migration module must export:
 *   name: string            – unique identifier (e.g. "001-initial-schema")
 *   up(runSql): Promise<void> – function that applies the migration
 */

import { query } from './pool.js';

interface Migration {
  name: string;
  up: (runSql: (sql: string, params?: unknown[]) => Promise<void>) => Promise<void>;
}

/**
 * Run a list of migrations in order, skipping already-applied ones.
 *
 * @param migrations — Array of migration modules to execute
 */
export async function runMigrations(migrations: Migration[]): Promise<void> {
  // Ensure the _migrations tracker table exists
  await query(`CREATE TABLE IF NOT EXISTS _migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP DEFAULT NOW()
  )`);

  // Fetch already-applied migration names
  const result = await query('SELECT name FROM _migrations');
  const rows = result.rows as Array<{ name: string }>;
  const appliedNames = new Set(rows.map((r) => r.name));

  const runSql = async (sql: string, params?: unknown[]): Promise<void> => {
    await query(sql, params ?? []);
  };

  for (const migration of migrations) {
    if (appliedNames.has(migration.name)) {
      console.log(`[migrations]  ✓ ${migration.name} (already applied)`);
      continue;
    }

    try {
      await migration.up(runSql);
      await query('INSERT INTO _migrations (name) VALUES ($1)', [migration.name]);
      console.log(`[migrations]  ✓ ${migration.name} (applied)`);
    } catch (err) {
      console.error(`[migrations]  ✗ ${migration.name} failed:`, err);
      throw err;
    }
  }

  console.log('[migrations] All pending migrations applied successfully.');
}

/**
 * Database compatibility layer — unifies SQLite and PostgreSQL differences.
 *
 * Provides helper functions so routers don't need to know which backend
 * is active. All functions are async to support both modes.
 */

import { isPostgresConfigured } from '../config/database.js';

/**
 * Returns true when PostgreSQL mode is active.
 */
export function isPostgres(): boolean {
  return isPostgresConfigured();
}

/**
 * Convert SQLite positional placeholders (?) to PostgreSQL positional
 * placeholders ($1, $2, …). No-op in SQLite mode.
 */
export function convertPlaceholders(sql: string): string {
  if (!isPostgresConfigured()) return sql;
  let idx = 0;
  return sql.replace(/\?/g, () => `$${++idx}`);
}

/**
 * Get the last inserted row ID.
 *
 * - SQLite: SELECT last_insert_rowid()
 * - PostgreSQL: throws — use INSERT … RETURNING id instead
 */
export async function getLastInsertId(
  queryAllFn: (sql: string, params?: unknown[]) => Promise<Record<string, unknown>[]>,
): Promise<number> {
  if (isPostgresConfigured()) {
    throw new Error(
      'getLastInsertId() is not available in PostgreSQL mode. Use INSERT … RETURNING id instead.',
    );
  }
  const result = await queryAllFn('SELECT last_insert_rowid() as id');
  return Number(result[0]?.id ?? 0);
}

/**
 * Expression for current timestamp.
 * SQLite: datetime('now')
 * PostgreSQL: NOW()
 */
export function nowExpression(): string {
  return isPostgresConfigured() ? 'NOW()' : "datetime('now')";
}

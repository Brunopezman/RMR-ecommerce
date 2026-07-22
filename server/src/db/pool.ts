/**
 * PostgreSQL connection pool (pg).
 *
 * Singleton pool initialized only when DATABASE_URL or PG variables are set.
 * Exports `query()` and `getClient()` helpers.
 */

import pg from 'pg';
import { getDbConfig, isPostgresConfigured } from '../config/database.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;

/**
 * Get or initialize the connection pool.
 * Throws if PostgreSQL is not configured.
 */
export function getPool(): pg.Pool {
  if (pool) return pool;

  if (!isPostgresConfigured()) {
    throw new Error(
      'PostgreSQL not configured. Set DATABASE_URL or PG* environment variables.',
    );
  }

  const config = getDbConfig()!;

  pool = new Pool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    ssl: config.ssl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    console.error('[pg] Unexpected pool error:', err);
  });

  console.log('[pg] Connection pool created.');
  return pool;
}

/**
 * Execute a query against the PostgreSQL pool.
 *
 * @param text - SQL query text with $1, $2, … placeholders
 * @param params - query parameters
 * @returns QueryResult rows
 */
export async function query(
  text: string,
  params: unknown[] = [],
): Promise<pg.QueryResult> {
  const p = getPool();
  return p.query(text, params);
}

/**
 * Get a dedicated client from the pool (useful for transactions).
 */
export async function getClient(): Promise<pg.PoolClient> {
  const p = getPool();
  return p.connect();
}

/**
 * Gracefully close the pool (call on shutdown).
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('[pg] Pool closed.');
  }
}

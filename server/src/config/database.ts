/**
 * Database configuration — PostgreSQL connection settings.
 *
 * Reads from DATABASE_URL (single connection string, recommended for
 * Render / Neon / Railway) or individual PGHOST / PGPORT / PGDATABASE /
 * PGUSER / PGPASSWORD variables.
 *
 * SSL is enabled automatically in production or when the URL contains
 * `sslmode=require`.
 */

export interface DbConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean | { rejectUnauthorized: boolean };
}

/**
 * Parse a PostgreSQL connection string into its components.
 * Supports the standard format:
 *   postgresql://user:password@host:port/database?sslmode=require
 */
function parseConnectionString(url: string): DbConfig {
  const parsed = new URL(url);

  const host = parsed.hostname || 'localhost';
  const port = parseInt(parsed.port || '5432', 10);
  const database = parsed.pathname.replace(/^\//, '') || 'rockmerch';
  const user = decodeURIComponent(parsed.username) || 'postgres';
  const password = decodeURIComponent(parsed.password) || '';

  const sslMode = parsed.searchParams.get('sslmode');
  const ssl: boolean | { rejectUnauthorized: boolean } =
    sslMode === 'require' || sslMode === 'verify-full' || sslMode === 'prefer'
      ? { rejectUnauthorized: false }
      : false;

  return { host, port, database, user, password, ssl };
}

/**
 * Resolve the database configuration from environment variables.
 *
 * Priority:
 *   1. DATABASE_URL (full connection string)
 *   2. Individual PGHOST / PGPORT / PGDATABASE / PGUSER / PGPASSWORD
 */
export function getDbConfig(): DbConfig | null {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    return parseConnectionString(databaseUrl);
  }

  const host = process.env.PGHOST;
  // If no PG variables at all, return null (SQLite fallback)
  if (!host && !process.env.PGDATABASE && !process.env.PGUSER) {
    return null;
  }

  const isProduction = process.env.NODE_ENV === 'production';

  return {
    host: host || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    database: process.env.PGDATABASE || 'rockmerch',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  };
}

/**
 * Returns true if PostgreSQL is configured (DATABASE_URL or PG variables set).
 */
export function isPostgresConfigured(): boolean {
  return getDbConfig() !== null;
}

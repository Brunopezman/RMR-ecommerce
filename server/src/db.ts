/**
 * Database abstraction — dual-mode SQLite / PostgreSQL.
 *
 * Auto-detects backend:
 *   - DATABASE_URL or PG* env vars → PostgreSQL (pg pool)
 *   - Otherwise → SQLite via sql.js (existing behavior, 100% backward compatible)
 *
 * All exported functions are ASYNC to support PostgreSQL.
 * In SQLite mode they return resolved Promises.
 *
 * Public API:
 *   initDb(), queryAll(), queryOne(), run(), lastInsertId(), persist(), getDb()
 */

import type { SqlJsStatic } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { isPostgresConfigured } from './config/database.js';
import { seedProducts, seedAdminUser } from './db/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Path to the SQLite database file (stored in server/data/) */
const DB_PATH = path.join(__dirname, '..', 'data', 'rockmerch.db');

type SqlJsDatabase = ReturnType<SqlJsStatic['Database']>;

// ── Backend detection ──────────────────────────────

const PG_ENABLED = isPostgresConfigured();

// ── SQLite globals ─────────────────────────────────

let sqlDb: SqlJsDatabase | null = null;
let sqliteInitialized = false;

// ── PostgreSQL pool reference (lazy loaded) ────────

let pgQuery: ((text: string, params?: unknown[]) => Promise<import('pg').QueryResult>) | null = null;
let pgMigrations: (() => Promise<void>) | null = null;

/**
 * Lazily import PostgreSQL modules.
 * This ensures pg is only loaded when actually needed, and doesn't crash
 * if not installed.
 */
async function ensurePgLoaded(): Promise<void> {
  if (pgQuery) return;
  try {
    const poolModule = await import('./db/pool.js');
    const migrateModule = await import('./db/migrate.js');
    pgQuery = poolModule.query;
    pgMigrations = migrateModule.runMigrations;
  } catch (err) {
    console.error('[db] Failed to load PostgreSQL modules:', err);
    throw err;
  }
}

// ── Helpers ────────────────────────────────────────

/**
 * Convert SQLite positional placeholders (?) to PostgreSQL positional
 * placeholders ($1, $2, …).
 */
function convertPlaceholders(sql: string): string {
  let idx = 0;
  return sql.replace(/\?/g, () => {
    idx++;
    return `$${idx}`;
  });
}

// ── Public API ─────────────────────────────────────

/**
 * Initialize the database. Must be called once before any other db function.
 *
 * - PostgreSQL mode: creates pool, runs migrations, seeds data
 * - SQLite mode: creates/loads db file, creates tables, seeds data
 */
export async function initDb(): Promise<void> {
  if (PG_ENABLED) {
    await ensurePgLoaded();
    console.log('[db] PostgreSQL mode active.');
    await pgMigrations!();
    await seedProducts();
    await seedAdminUser();
    console.log('[db] PostgreSQL initialization complete.');
  } else {
    // ── SQLite path (existing behavior, wrapped in Promise) ──
    const sqlJsModule = await import('sql.js');
    const initSqlJs = sqlJsModule.default;
    const SQL = await initSqlJs();

    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      sqlDb = new SQL.Database(buffer);
      console.log('[db] Loaded existing database from disk.');
    } else {
      sqlDb = new SQL.Database();
      console.log('[db] Created new database.');
    }

    createTables();
    migrateUsersTable();
    migrateProductsTable();
    await seedProducts();
    await seedAdminUser();
    persist();
    sqliteInitialized = true;
    console.log('[db] SQLite initialization complete.');
  }
}

/**
 * Get the raw SQLite database instance (only valid in SQLite mode).
 * Throws if PostgreSQL mode is active.
 */
export async function getDb(): Promise<SqlJsDatabase> {
  if (PG_ENABLED) {
    throw new Error('getDb() is not available in PostgreSQL mode. Use queryAll/queryOne/run instead.');
  }
  if (!sqlDb) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return sqlDb;
}

/**
 * Persist the in-memory database to disk (SQLite only).
 * No-op in PostgreSQL mode (Postgres persists automatically).
 */
export async function persist(): Promise<void> {
  if (PG_ENABLED) return;
  if (!sqlDb) return;
  const data = sqlDb.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

/**
 * Run a query and return all rows as objects.
 */
export async function queryAll(
  sql: string,
  params: unknown[] = [],
): Promise<Record<string, unknown>[]> {
  if (PG_ENABLED) {
    const adaptedSql = convertPlaceholders(sql);
    const result = await pgQuery!(adaptedSql, params);
    return result.rows as Record<string, unknown>[];
  }

  // SQLite path
  const db = getDbSync();
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const rows: Record<string, unknown>[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Run a query and return the first row as an object, or undefined.
 */
export async function queryOne(
  sql: string,
  params: unknown[] = [],
): Promise<Record<string, unknown> | undefined> {
  if (PG_ENABLED) {
    const adaptedSql = convertPlaceholders(sql);
    const result = await pgQuery!(adaptedSql, params);
    return result.rows[0] as Record<string, unknown> | undefined;
  }

  // SQLite path
  const db = getDbSync();
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const hasRow = stmt.step();
  if (hasRow) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return undefined;
}

/**
 * Run a write statement (INSERT, UPDATE, DELETE).
 *
 * In PostgreSQL mode, returns the QueryResult so callers can access
 * RETURNING clauses. In SQLite mode, returns void.
 */
export async function run(
  sql: string,
  params: unknown[] = [],
): Promise<import('pg').QueryResult | void> {
  if (PG_ENABLED) {
    const adaptedSql = convertPlaceholders(sql);
    const result = await pgQuery!(adaptedSql, params);
    return result;
  }

  // SQLite path
  const db = getDbSync();
  db.run(sql, params);
}

/**
 * Get the last inserted row ID.
 *
 * - SQLite: SELECT last_insert_rowid()
 * - PostgreSQL: uses lastval() as a fallback (prefer RETURNING instead)
 */
export async function lastInsertId(): Promise<number> {
  if (PG_ENABLED) {
    const result = await pgQuery!('SELECT lastval() as id');
    return (result.rows[0]?.id as number) ?? 0;
  }

  // SQLite path
  const db = getDbSync();
  const result = db.exec('SELECT last_insert_rowid() as id');
  if (result.length > 0 && result[0].values.length > 0) {
    return result[0].values[0][0] as number;
  }
  return 0;
}

/**
 * Execute a raw SQL statement that returns results (SQLite only, multi-statement).
 */
export async function exec(
  sql: string,
): Promise<Array<{ columns: string[]; values: unknown[][] }>> {
  if (PG_ENABLED) {
    throw new Error('exec() is not available in PostgreSQL mode. Use queryAll() instead.');
  }

  const db = getDbSync();
  return db.exec(sql);
}

/**
 * Synchronous accessor for SQLite database (internal use only).
 */
function getDbSync(): SqlJsDatabase {
  if (!sqlDb) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return sqlDb;
}

// ══════════════════════════════════════════════════
//  SQLite table creation & migration
// ══════════════════════════════════════════════════

function createTables(): void {
  if (!sqlDb) return;

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY,
      nombre      TEXT    NOT NULL,
      tipo        TEXT,
      img         TEXT    NOT NULL,
      descripcion TEXT,
      precio      REAL    NOT NULL,
      stock       INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      email      TEXT    NOT NULL UNIQUE,
      name       TEXT    NOT NULL,
      address    TEXT,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id          INTEGER NOT NULL,
      total            REAL    NOT NULL,
      status           TEXT    NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
      created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
      shipping_address TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id   INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      nombre     TEXT    NOT NULL,
      precio     REAL    NOT NULL,
      cantidad   INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL,
      area       TEXT    NOT NULL,
      message    TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function migrateUsersTable(): void {
  const newColumns = [
    'apellido TEXT DEFAULT \'\'',
    'codigo_postal TEXT DEFAULT \'\'',
    'sexo TEXT DEFAULT \'\'',
    'telefono TEXT DEFAULT \'\'',
    'password_hash TEXT DEFAULT \'\'',
    "role TEXT NOT NULL DEFAULT 'user'",
  ];

  for (const colDef of newColumns) {
    try {
      const db = getDbSync();
      db.run(`ALTER TABLE users ADD COLUMN ${colDef}`);
    } catch {
      // Column already exists — safe to ignore
    }
  }
}

function migrateProductsTable(): void {
  try {
    const db = getDbSync();
    db.run('ALTER TABLE products ADD COLUMN stock INTEGER NOT NULL DEFAULT 0');
  } catch {
    // Column already exists — safe to ignore
  }
}

// ══════════════════════════════════════════════════
//  Seeding (delegated to db/seed.ts)
// ══════════════════════════════════════════════════

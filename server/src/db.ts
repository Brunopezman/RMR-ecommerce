/**
 * Database setup — SQLite via sql.js (pure JS, no native compilation).
 *
 * Creates tables on first run and seeds products from react/db.json
 * if the products table is empty. Persists to a file on disk.
 */

import type { SqlJsStatic } from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Path to the SQLite database file (stored in server/data/) */
const DB_PATH = path.join(__dirname, '..', 'data', 'rockmerch.db');

/** Path to the seed JSON file (from data/db.json) */
const SEED_JSON_PATH = path.join(__dirname, '..', '..', 'data', 'db.json');

type SqlJsDatabase = ReturnType<SqlJsStatic['Database']>;

let sqlDb: SqlJsDatabase | null = null;

/**
 * Initialize the database. Must be called once before using getDb().
 */
export async function initDb(): Promise<SqlJsDatabase> {
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
  seedProducts();
  seedAdminUser();
  persist();

  return sqlDb;
}

export function getDb(): SqlJsDatabase {
  if (!sqlDb) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return sqlDb;
}

/**
 * Persist the in-memory database to disk.
 */
export function persist(): void {
  if (!sqlDb) return;
  const data = sqlDb.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

/**
 * Run a query and return all rows as objects.
 */
export function queryAll(sql: string, params: unknown[] = []): Record<string, unknown>[] {
  const database = getDb();
  const stmt = database.prepare(sql);
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
export function queryOne(sql: string, params: unknown[] = []): Record<string, unknown> | undefined {
  const database = getDb();
  const stmt = database.prepare(sql);
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
 */
export function run(sql: string, params: unknown[] = []): void {
  const database = getDb();
  database.run(sql, params);
}

/**
 * Get the last inserted row ID.
 */
export function lastInsertId(): number {
  const database = getDb();
  const result = database.exec('SELECT last_insert_rowid() as id');
  if (result.length > 0 && result[0].values.length > 0) {
    return result[0].values[0][0] as number;
  }
  return 0;
}

/**
 * Create all tables if they don't exist.
 */
function createTables(): void {
  if (!sqlDb) return;

  sqlDb.run(`
    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY,
      nombre      TEXT    NOT NULL,
      tipo        TEXT,
      img         TEXT    NOT NULL,
      descripcion TEXT,
      precio      REAL    NOT NULL
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
  `);
}

/**
 * Migrate the users table adding new columns if they don't exist.
 * SQLite's ALTER TABLE ADD COLUMN is idempotent-safe with try/catch.
 */
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
      run(`ALTER TABLE users ADD COLUMN ${colDef}`);
    } catch {
      // Column already exists — safe to ignore
    }
  }
}

/**
 * Seed admin user from ADMIN_EMAIL env var if set.
 */
function seedAdminUser(): void {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const existing = queryOne('SELECT id, role, password_hash FROM users WHERE email = ?', [adminEmail]);

  if (existing) {
    let updated = false;

    if (existing.role !== 'admin') {
      run('UPDATE users SET role = ? WHERE email = ?', ['admin', adminEmail]);
      updated = true;
      console.log(`[db] Promoted ${adminEmail} to admin.`);
    }

    // If the existing user has no password (empty or null), set a default one
    const pwHash = (existing.password_hash as string) || '';
    if (!pwHash) {
      const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const newHash = bcrypt.hashSync(defaultPassword, 10);
      run('UPDATE users SET password_hash = ? WHERE email = ?', [newHash, adminEmail]);
      updated = true;
      console.log(`[db] Set default password for ${adminEmail} (password: ${defaultPassword})`);
    }

    if (updated) persist();
    return;
  }

  const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const passwordHash = bcrypt.hashSync(defaultPassword, 10);
  run(
    `INSERT INTO users (email, name, role, password_hash)
     VALUES (?, ?, ?, ?)`,
    [adminEmail, 'Admin', 'admin', passwordHash],
  );
  persist();
  console.log(`[db] Created admin user: ${adminEmail} (password: ${defaultPassword})`);
}

/**
 * Seed products from react/db.json if the products table is empty.
 */
function seedProducts(): void {
  if (!sqlDb) return;

  const rows = queryAll('SELECT COUNT(*) as count FROM products');
  const count = (rows[0]?.count as number) ?? 0;

  if (count > 0) {
    console.log(`[db] Products table already has ${count} rows, skipping seed.`);
    return;
  }

  let seedData: { products: Array<{ id: number; nombre: string; tipo?: string; img: string; descripcion?: string; precio: number }> };

  try {
    const raw = fs.readFileSync(SEED_JSON_PATH, 'utf-8');
    seedData = JSON.parse(raw);
  } catch (err) {
    console.warn(`[db] Could not read seed file at ${SEED_JSON_PATH}, skipping seed.`, err);
    return;
  }

  if (!seedData.products || seedData.products.length === 0) {
    console.warn('[db] Seed file has no products, skipping seed.');
    return;
  }

  for (const p of seedData.products) {
    run(
      'INSERT INTO products (id, nombre, tipo, img, descripcion, precio) VALUES (?, ?, ?, ?, ?, ?)',
      [p.id, p.nombre, p.tipo ?? null, p.img, p.descripcion ?? null, p.precio],
    );
  }

  console.log(`[db] Seeded ${seedData.products.length} products from data/db.json`);
}

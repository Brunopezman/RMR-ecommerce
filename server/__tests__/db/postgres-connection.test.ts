/**
 * PostgreSQL connection tests.
 *
 * These tests verify that the PostgreSQL connection works when DATABASE_URL
 * is configured. They are SKIPPED if no DATABASE_URL environment variable
 * is set, so they never block CI on SQLite-only environments.
 *
 * Run with:
 *   DATABASE_URL=postgresql://test:test@localhost:5432/rockmerch_test npm run test:server
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { isPostgresConfigured } from '../../src/config/database.js';

const PG_AVAILABLE = isPostgresConfigured();

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * Dynamically import the db module fresh for each test suite.
 * We use a helper so we can call initDb, queryAll, queryOne, run, etc.
 */
async function getDbModule() {
  return import('../../src/db.js');
}

/**
 * Dynamically import the pool module to close connections.
 */
async function getPoolModule() {
  return import('../../src/db/pool.js');
}

// ── Tests ────────────────────────────────────────────────────────────────

describe('PostgreSQL connection', () => {
  beforeAll(async () => {
    if (!PG_AVAILABLE) {
      console.log('[test] DATABASE_URL not set — skipping PostgreSQL connection tests.');
    }
  });

  it.skipIf(!PG_AVAILABLE)('se conecta a PostgreSQL cuando DATABASE_URL está configurada', async () => {
    const db = await import('../../src/db.js');
    await expect(db.initDb()).resolves.not.toThrow();
  });

  it.skipIf(!PG_AVAILABLE)('queryAll devuelve array de productos después de initDb', async () => {
    const db = await import('../../src/db.js');
    await db.initDb();

    const products = await db.queryAll('SELECT * FROM products');
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);

    // Verify shape matches Product interface
    const product = products[0] as Record<string, unknown>;
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('nombre');
    expect(product).toHaveProperty('tipo');
    expect(product).toHaveProperty('img');
    expect(product).toHaveProperty('precio');
    expect(product).toHaveProperty('stock');
  });

  it.skipIf(!PG_AVAILABLE)('queryOne devuelve un solo registro en PostgreSQL', async () => {
    const db = await import('../../src/db.js');
    await db.initDb();

    const product = await db.queryOne('SELECT * FROM products WHERE id = $1', [1]);
    expect(product).toBeDefined();
    expect(product).toHaveProperty('nombre');
  });

  it.skipIf(!PG_AVAILABLE)('run ejecuta INSERT y RETURNING funciona', async () => {
    const db = await import('../../src/db.js');
    await db.initDb();

    // Insert a temporary product and read it back
    const result = await db.run(
      "INSERT INTO products (nombre, img, precio, stock) VALUES ($1, $2, $3, $4) RETURNING id",
      ['Test PG Product', '/img/test.png', 999, 1],
    );

    // In PostgreSQL mode, run() returns QueryResult
    if (result && 'rows' in result) {
      expect(result.rows.length).toBe(1);
      expect((result.rows[0] as any).id).toBeGreaterThan(0);
    }

    // Verify it was inserted
    const inserted = await db.queryOne('SELECT * FROM products WHERE nombre = $1', ['Test PG Product']);
    expect(inserted).toBeDefined();
    expect(inserted!.nombre).toBe('Test PG Product');
  });

  it.skipIf(!PG_AVAILABLE)('las tablas se crean correctamente (products, users, orders, order_items, contact_messages)', async () => {
    const db = await import('../../src/db.js');
    await db.initDb();

    // Query information_schema to verify all expected tables exist
    const tables = await db.queryAll(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
    );

    const tableNames = tables.map((t) => t.table_name as string);
    expect(tableNames).toContain('products');
    expect(tableNames).toContain('users');
    expect(tableNames).toContain('orders');
    expect(tableNames).toContain('order_items');
    expect(tableNames).toContain('contact_messages');
  });

  it.skipIf(!PG_AVAILABLE)('queryAll/queryOne/run funcionan correctamente en modo pg', async () => {
    const db = await import('../../src/db.js');
    await db.initDb();

    // queryAll
    const allProducts = await db.queryAll('SELECT * FROM products ORDER BY id');
    expect(Array.isArray(allProducts)).toBe(true);

    // queryOne
    const firstProduct = await db.queryOne('SELECT * FROM products ORDER BY id LIMIT 1');
    expect(firstProduct).toBeDefined();
    expect(firstProduct).toHaveProperty('id');
    expect(firstProduct).toHaveProperty('nombre');

    // run with INSERT
    const insertResult = await db.run(
      "INSERT INTO products (nombre, img, precio, stock) VALUES ($1, $2, $3, $4) RETURNING id",
      ['PG Test Cleanup', '/img/cleanup.png', 100, 1],
    );
    expect(insertResult).toBeDefined();
    if (insertResult && 'rowCount' in insertResult) {
      expect(insertResult.rowCount).toBe(1);
    }

    // Cleanup
    await db.run("DELETE FROM products WHERE nombre = $1", ['PG Test Cleanup']);
  });
});

describe('PostgreSQL table creation', () => {
  beforeAll(async () => {
    if (!PG_AVAILABLE) return;
    const db = await import('../../src/db.js');
    await db.initDb();
  });

  it.skipIf(!PG_AVAILABLE)('tabla products tiene las columnas esperadas', async () => {
    const db = await import('../../src/db.js');
    const columns = await db.queryAll(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products' AND table_schema = 'public' ORDER BY ordinal_position",
    );

    const colNames = columns.map((c) => c.column_name as string);
    expect(colNames).toContain('id');
    expect(colNames).toContain('nombre');
    expect(colNames).toContain('tipo');
    expect(colNames).toContain('img');
    expect(colNames).toContain('descripcion');
    expect(colNames).toContain('precio');
    expect(colNames).toContain('stock');
  });

  it.skipIf(!PG_AVAILABLE)('tabla users tiene las columnas esperadas (incluyendo migraciones)', async () => {
    const db = await import('../../src/db.js');
    await db.initDb();

    const columns = await db.queryAll(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND table_schema = 'public' ORDER BY ordinal_position",
    );

    const colNames = columns.map((c) => c.column_name as string);
    expect(colNames).toContain('id');
    expect(colNames).toContain('email');
    expect(colNames).toContain('name');
    expect(colNames).toContain('address');
    expect(colNames).toContain('created_at');
    // Migration 002 columns
    expect(colNames).toContain('apellido');
    expect(colNames).toContain('codigo_postal');
    expect(colNames).toContain('sexo');
    expect(colNames).toContain('telefono');
    expect(colNames).toContain('password_hash');
    expect(colNames).toContain('role');
  });
});

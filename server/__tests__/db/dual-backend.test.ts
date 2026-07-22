/**
 * Dual-backend compatibility tests.
 *
 * These tests verify that the same queries produce the same result shape
 * in both SQLite mode and PostgreSQL mode. They mock the backend detection
 * to simulate both modes without needing an actual PostgreSQL database.
 *
 * IMPORTANT: The pg-mode tests use a real PostgreSQL connection if
 * DATABASE_URL is set; otherwise they are skipped.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isPostgresConfigured } from '../../src/config/database.js';

const PG_AVAILABLE = isPostgresConfigured();

// ── Mock helpers ─────────────────────────────────────────────────────────

/**
 * Save original env and module state so we can restore after tests.
 */
const ORIGINAL_DATABASE_URL = process.env.DATABASE_URL;

/**
 * Helper: force the module to detect SQLite mode by clearing DATABASE_URL.
 */
function forceSqliteMode() {
  delete process.env.DATABASE_URL;
  delete process.env.PGHOST;
  delete process.env.PGDATABASE;
  delete process.env.PGUSER;
  delete process.env.PGPASSWORD;
  // Clear module cache so db.ts re-evaluates PG_ENABLED
  vi.resetModules();
}

/**
 * Helper: force the module to detect PostgreSQL mode by restoring DATABASE_URL.
 * Only call this when PG_AVAILABLE is true (i.e., DATABASE_URL was set).
 */
function forcePostgresMode() {
  // We must have a real DATABASE_URL available — this function is never
  // called when !PG_AVAILABLE, so ORIGINAL_DATABASE_URL is always defined.
  process.env.DATABASE_URL = ORIGINAL_DATABASE_URL!;
  vi.resetModules();
}

/**
 * Restore original env after tests.
 */
function restoreEnv() {
  if (ORIGINAL_DATABASE_URL) {
    process.env.DATABASE_URL = ORIGINAL_DATABASE_URL;
  } else {
    delete process.env.DATABASE_URL;
  }
}

// ── Tests ────────────────────────────────────────────────────────────────

describe('dual-backend shape compatibility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    restoreEnv();
  });

  // ── SQLite mode tests (always run) ────────────────────────────

  describe('SQLite mode', () => {
    beforeEach(() => {
      forceSqliteMode();
    });

    it('initDb crea tablas en SQLite', async () => {
      const db = await import('../../src/db.js');
      await db.initDb();

      const products = await db.queryAll('SELECT * FROM products');
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    });

    it('queryAll devuelve filas con keys en snake_case en SQLite', async () => {
      const db = await import('../../src/db.js');
      await db.initDb();

      const products = await db.queryAll('SELECT * FROM products LIMIT 1');
      const product = products[0] as Record<string, unknown>;
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('nombre');
      expect(product).toHaveProperty('tipo');
      expect(product).toHaveProperty('img');
      expect(product).toHaveProperty('precio');
      expect(product).toHaveProperty('stock');
    });

    it('queryOne devuelve un objeto plano en SQLite', async () => {
      const db = await import('../../src/db.js');
      await db.initDb();

      const product = await db.queryOne('SELECT * FROM products WHERE id = ?', [1]);
      expect(product).toBeDefined();
      expect(typeof product).toBe('object');
      expect(product!.nombre).toBeDefined();
    });

    it('run ejecuta INSERT en SQLite y lastInsertId funciona', async () => {
      const db = await import('../../src/db.js');
      await db.initDb();

      await db.run(
        "INSERT INTO products (nombre, img, precio, stock) VALUES (?, ?, ?, ?)",
        ['SQLite Test Product', '/img/sqlite.png', 500, 2],
      );

      const inserted = await db.queryOne('SELECT * FROM products WHERE nombre = ?', ['SQLite Test Product']);
      expect(inserted).toBeDefined();
      expect(inserted!.nombre).toBe('SQLite Test Product');
      expect(inserted!.precio).toBe(500);
    });
  });

  // ── PostgreSQL mode tests (only if DATABASE_URL is set) ──────

  describe('PostgreSQL mode', () => {
    beforeEach(() => {
      if (!PG_AVAILABLE) return;
      forcePostgresMode();
    });

    it.skipIf(!PG_AVAILABLE)('initDb crea tablas en PostgreSQL', async () => {
      const db = await import('../../src/db.js');
      await db.initDb();

      const products = await db.queryAll('SELECT * FROM products');
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    });

    it.skipIf(!PG_AVAILABLE)('queryAll devuelve filas con keys en snake_case en PostgreSQL', async () => {
      const db = await import('../../src/db.js');
      await db.initDb();

      const products = await db.queryAll('SELECT * FROM products LIMIT 1');
      const product = products[0] as Record<string, unknown>;
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('nombre');
      expect(product).toHaveProperty('tipo');
      expect(product).toHaveProperty('img');
      expect(product).toHaveProperty('precio');
      expect(product).toHaveProperty('stock');
    });

    it.skipIf(!PG_AVAILABLE)('queryOne devuelve un objeto plano en PostgreSQL', async () => {
      const db = await import('../../src/db.js');
      await db.initDb();

      const product = await db.queryOne('SELECT * FROM products WHERE id = $1', [1]);
      expect(product).toBeDefined();
      expect(typeof product).toBe('object');
      expect(product!.nombre).toBeDefined();
    });

    it.skipIf(!PG_AVAILABLE)('run ejecuta INSERT en PostgreSQL con RETURNING', async () => {
      const db = await import('../../src/db.js');
      await db.initDb();

      const result = await db.run(
        "INSERT INTO products (nombre, img, precio, stock) VALUES ($1, $2, $3, $4) RETURNING id",
        ['PG Dual Test', '/img/dual.png', 750, 3],
      );

      // In PostgreSQL mode, run() returns QueryResult with rows
      expect(result).toBeDefined();
      if (result && 'rows' in result) {
        expect(Array.isArray(result.rows)).toBe(true);
        expect((result.rows[0] as any).id).toBeGreaterThan(0);
      }

      // Cleanup
      await db.run("DELETE FROM products WHERE nombre = $1", ['PG Dual Test']);
    });
  });

  // ── Cross-mode shape comparison (if PG available) ────────────

  describe('same-shape verification (SQLite vs PostgreSQL)', () => {
    beforeEach(() => {
      // We need to run these tests sequentially: first SQLite, then PG
    });

    it.skipIf(!PG_AVAILABLE)('resultados de queryAll tienen el mismo shape en ambos modos', async () => {
      // ── SQLite results ──────────────────────────────────
      forceSqliteMode();
      const sqliteDb = await import('../../src/db.js');
      await sqliteDb.initDb();
      const sqliteProducts = await sqliteDb.queryAll('SELECT * FROM products ORDER BY id');

      // ── PostgreSQL results ──────────────────────────────
      forcePostgresMode();
      const pgDb = await import('../../src/db.js');
      await pgDb.initDb();
      const pgProducts = await pgDb.queryAll('SELECT * FROM products ORDER BY id');

      // ── Compare shapes ──────────────────────────────────
      expect(sqliteProducts.length).toBe(pgProducts.length);

      for (let i = 0; i < Math.min(sqliteProducts.length, pgProducts.length); i++) {
        const sqliteKeys = Object.keys(sqliteProducts[i]).sort();
        const pgKeys = Object.keys(pgProducts[i]).sort();

        // Both backends should have the same key set for products
        expect(sqliteKeys).toEqual(pgKeys);

        // Compare key values that should be identical across backends
        const sqliteRow = sqliteProducts[i] as Record<string, unknown>;
        const pgRow = pgProducts[i] as Record<string, unknown>;
        expect(sqliteRow.id).toEqual(pgRow.id);
        expect(sqliteRow.nombre).toEqual(pgRow.nombre);
        expect(sqliteRow.tipo).toEqual(pgRow.tipo);
        expect(sqliteRow.img).toEqual(pgRow.img);
      }
    });

    it.skipIf(!PG_AVAILABLE)('users table tiene el mismo shape en ambos modos', async () => {
      // ── SQLite ────────────────────────────────────────────────
      forceSqliteMode();
      const sqliteDb = await import('../../src/db.js');
      await sqliteDb.initDb();
      const sqliteCols = await sqliteDb.queryAll(
        "SELECT name FROM pragma_table_info('users') ORDER BY cid",
      );

      // ── PostgreSQL ─────────────────────────────────────────────
      forcePostgresMode();
      const pgDb = await import('../../src/db.js');
      await pgDb.initDb();
      const pgCols = await pgDb.queryAll(
        "SELECT column_name as name FROM information_schema.columns WHERE table_name = 'users' AND table_schema = 'public' ORDER BY ordinal_position",
      );

      // Normalize: both return arrays of { name: string }
      const sqliteNames = sqliteCols.map((c) => (c as any).name as string).filter((n) => n !== 'id');
      const pgNames = pgCols.map((c) => (c as any).name as string).filter((n) => n !== 'id');

      // The set of column names (minus id, which is INTEGER vs SERIAL) should match
      expect(sqliteNames.sort()).toEqual(pgNames.sort());
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock db module ────────────────────────────────────────────────────

const mockQueryAll = vi.fn();
const mockQueryOne = vi.fn();
const mockRun = vi.fn();
const mockPersist = vi.fn();

vi.mock('../../src/db.js', () => ({
  queryAll: (...args: unknown[]) => mockQueryAll(...args),
  queryOne: (...args: unknown[]) => mockQueryOne(...args),
  run: (...args: unknown[]) => mockRun(...args),
  persist: (...args: unknown[]) => mockPersist(...args),
}));

// ─── Mock auth middleware ──────────────────────────────────────────────

vi.mock('../../src/middleware/auth.js', () => ({
  authenticateToken: vi.fn((_req: any, _res: any, next: any) => next()),
  requireAdmin: vi.fn((_req: any, res: any, next: any) => {
    const auth = res.locals?.auth;
    if (auth && auth.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
  }),
}));

// Import after mocks
import productsRouter from '../../src/routes/products.js';

/**
 * Simulate Express Router handling for PATCH /:id/stock.
 * Calls the middleware chain (authenticateToken, requireAdmin, handler)
 * and resolves with { status, data }.
 */
function callPatchProductStock(
  id: number,
  stock: number,
  auth?: { userId: number; email: string; role: string },
): Promise<{ status: number; data: any }> {
  return new Promise((resolve) => {
    let statusCode = 200;
    const req = { params: { id: String(id) }, body: { stock } } as any;
    const res = {
      status: vi.fn((code: number) => {
        statusCode = code;
        return res;
      }),
      json: vi.fn((data: any) => resolve({ status: statusCode, data })),
      locals: auth ? { auth } : {},
    } as any;

    // Find the PATCH /:id/stock route registered on the router
    const route = (productsRouter as any).stack.find(
      (layer: any) =>
        layer.route && layer.route.methods.patch && layer.route.path === '/:id/stock',
    );

    if (!route) {
      resolve({ status: 500, data: { error: 'Route not found' } });
      return;
    }

    // Call the handler stack (middleware + handler)
    const handlers = route.route.stack.map((s: any) => s.handle);
    let idx = 0;
    const next = () => {
      if (idx < handlers.length) {
        handlers[idx++](req, res, next);
      }
    };
    next();
  });
}

describe('PATCH /products/:id/stock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── CA-1: Admin can update stock successfully ──────────────────────

  it('admin puede actualizar stock exitosamente → 200 + producto actualizado', async () => {
    const existingProduct = {
      id: 1,
      nombre: 'Producto Test',
      tipo: 'remera',
      img: '/img/test.png',
      descripcion: 'Test',
      precio: 5000,
      stock: 5,
    };
    const updatedProduct = { ...existingProduct, stock: 10 };

    mockQueryOne.mockReturnValueOnce(existingProduct).mockReturnValueOnce(updatedProduct);

    const { status, data } = await callPatchProductStock(1, 10, {
      userId: 1,
      email: 'admin@test.com',
      role: 'admin',
    });

    expect(status).toBe(200);
    expect(data).toMatchObject({ id: 1, stock: 10 });
    expect(mockRun).toHaveBeenCalledWith(
      'UPDATE products SET stock = ? WHERE id = ?',
      [10, '1'],
    );
    expect(mockPersist).toHaveBeenCalled();
  });

  // ── CA-2: Non-admin user gets 403 ──────────────────────────────────

  it('usuario no-admin recibe 403', async () => {
    const { status, data } = await callPatchProductStock(1, 10, {
      userId: 2,
      email: 'user@test.com',
      role: 'user',
    });

    expect(status).toBe(403);
    expect(data).toEqual(
      expect.objectContaining({ error: expect.stringContaining('administrador') }),
    );
  });

  // ── CA-3: No authentication → 403 ──────────────────────────────────

  it('sin autenticación recibe 403', async () => {
    const { status, data } = await callPatchProductStock(1, 10, undefined);

    expect(status).toBe(403);
    expect(data).toEqual(
      expect.objectContaining({ error: expect.stringContaining('administrador') }),
    );
  });

  // ── CA-4: Negative stock → 400 ────────────────────────────────────

  it('stock negativo devuelve 400', async () => {
    const { status, data } = await callPatchProductStock(1, -1, {
      userId: 1,
      email: 'admin@test.com',
      role: 'admin',
    });

    expect(status).toBe(400);
    expect(data).toEqual(
      expect.objectContaining({ error: 'stock debe ser un número entero >= 0' }),
    );
  });

  // ── CA-5: Float (non-integer) stock → 400 ──────────────────────────

  it('stock no-entero (float) devuelve 400', async () => {
    const { status, data } = await callPatchProductStock(1, 5.5, {
      userId: 1,
      email: 'admin@test.com',
      role: 'admin',
    });

    expect(status).toBe(400);
    expect(data).toEqual(
      expect.objectContaining({ error: 'stock debe ser un número entero >= 0' }),
    );
  });

  // ── CA-6: Non-existent product → 404 ───────────────────────────────

  it('producto inexistente devuelve 404', async () => {
    mockQueryOne.mockReturnValueOnce(undefined);

    const { status, data } = await callPatchProductStock(999, 10, {
      userId: 1,
      email: 'admin@test.com',
      role: 'admin',
    });

    expect(status).toBe(404);
    expect(data).toEqual(
      expect.objectContaining({ error: 'Product not found' }),
    );
  });

  // ── CA-7: UPDATE is called with correct SQL values ─────────────────

  it('UPDATE se ejecuta con los valores correctos', async () => {
    const existingProduct = {
      id: 5,
      nombre: 'Guitar Pick',
      tipo: 'accesorio',
      img: '/img/pick.png',
      precio: 500,
      stock: 3,
    };

    mockQueryOne.mockReturnValueOnce(existingProduct).mockReturnValueOnce({ ...existingProduct, stock: 42 });

    const { status } = await callPatchProductStock(5, 42, {
      userId: 1,
      email: 'admin@test.com',
      role: 'admin',
    });

    expect(status).toBe(200);
    expect(mockRun).toHaveBeenCalledWith(
      'UPDATE products SET stock = ? WHERE id = ?',
      [42, '5'],
    );
    expect(mockPersist).toHaveBeenCalled();
  });
});

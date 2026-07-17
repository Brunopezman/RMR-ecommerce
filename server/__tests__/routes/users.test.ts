import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock db module ────────────────────────────────────────────────────

const mockQueryAll = vi.fn();
const mockQueryOne = vi.fn();
const mockRun = vi.fn();
const mockLastInsertId = vi.fn();
const mockPersist = vi.fn();

vi.mock('../../src/db.js', () => ({
  queryAll: (...args: unknown[]) => mockQueryAll(...args),
  queryOne: (...args: unknown[]) => mockQueryOne(...args),
  run: (...args: unknown[]) => mockRun(...args),
  lastInsertId: (...args: unknown[]) => mockLastInsertId(...args),
  persist: (...args: unknown[]) => mockPersist(...args),
}));

// ─── Mock auth middleware ──────────────────────────────────────────────

vi.mock('../../src/middleware/auth.js', () => ({
  authenticateToken: vi.fn((_req: any, _res: any, next: any) => next()),
  requireAdmin: vi.fn((_req: any, res: any, next: any) => {
    // Simulate admin check: if locals.auth.role === 'admin', call next; else 403
    const auth = res.locals?.auth;
    if (auth && auth.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
  }),
}));

// Import after mocks
import usersRouter from '../../src/routes/users.js';

/**
 * Simulate Express Router handling by extracting the route handler
 * for GET / and calling it directly with mock req/res.
 */
function callGetUsers(auth?: { userId: number; email: string; role: string }) {
  return new Promise<any>((resolve) => {
    const req = { params: {} } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockImplementation((data: any) => resolve(data)),
      locals: auth ? { auth } : {},
    } as any;

    // Find the GET '/' handler registered on the router
    // Router stores routes in stack; find the one matching method GET and path '/'
    const route = (usersRouter as any).stack.find(
      (layer: any) => layer.route && layer.route.methods.get && layer.route.path === '/',
    );

    if (!route) {
      resolve(null);
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

describe('GET /users route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve lista de usuarios si el auth es admin', async () => {
    const fakeUsers = [
      { id: 1, email: 'admin@test.com', name: 'Admin', role: 'admin', created_at: '2026-01-01', address: null, apellido: '', codigo_postal: '', sexo: '', telefono: '' },
      { id: 2, email: 'user@test.com', name: 'User', role: 'user', created_at: '2026-01-02', address: null, apellido: '', codigo_postal: '', sexo: '', telefono: '' },
    ];
    mockQueryAll.mockReturnValue(fakeUsers);

    const data = await callGetUsers({ userId: 1, email: 'admin@test.com', role: 'admin' });

    expect(data).toBeInstanceOf(Array);
    expect(data).toHaveLength(2);
    expect(data[0].role).toBe('admin');
    expect(data[1].role).toBe('user');
    expect(mockQueryAll).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY created_at DESC'),
    );
  });

  it('devuelve array vacío si no hay usuarios', async () => {
    mockQueryAll.mockReturnValue([]);

    const data = await callGetUsers({ userId: 1, email: 'admin@test.com', role: 'admin' });

    expect(data).toBeInstanceOf(Array);
    expect(data).toHaveLength(0);
  });

  it('deniega acceso si el usuario no es admin (role user)', async () => {
    const data = await callGetUsers({ userId: 2, email: 'user@test.com', role: 'user' });

    // The requireAdmin mock should have returned 403
    expect(data).toEqual(
      expect.objectContaining({ error: expect.stringContaining('administrador') }),
    );
  });

  it('deniega acceso si no hay auth', async () => {
    const data = await callGetUsers(undefined);

    expect(data).toEqual(
      expect.objectContaining({ error: expect.stringContaining('administrador') }),
    );
  });
});

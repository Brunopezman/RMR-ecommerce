import { describe, it, expect, vi } from 'vitest';
import { requireAdmin } from '../../src/middleware/auth.js';

/**
 * Helper to create mock Express req/res/next.
 * We only care about res.locals.auth for requireAdmin.
 */
function createMockCtx(auth?: { userId: number; email: string; role: string }) {
  const req = {} as any;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    locals: auth ? { auth } : {},
  } as any;
  const next = vi.fn();
  return { req, res, next };
}

describe('requireAdmin middleware', () => {
  it('deniega acceso si no hay auth en locals (falta authenticateToken)', () => {
    const { req, res, next } = createMockCtx(undefined);

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('administrador') }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('deniega acceso si el rol no es admin', () => {
    const { req, res, next } = createMockCtx({
      userId: 2,
      email: 'user@test.com',
      role: 'user',
    });

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('administrador') }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('permite acceso si el rol es admin', () => {
    const { req, res, next } = createMockCtx({
      userId: 1,
      email: 'admin@test.com',
      role: 'admin',
    });

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('deniega acceso si auth está presente pero role es undefined', () => {
    const { req, res, next } = createMockCtx({
      userId: 3,
      email: 'no-role@test.com',
      role: '',
    });

    requireAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});

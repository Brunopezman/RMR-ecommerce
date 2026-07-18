import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login, loadAuthState, saveAuthState, clearAuthState } from '../services/authService';

// ─── Mock localStorage ─────────────────────────────────────────────────

const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    _getStore: () => store,
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
});

// ─── Mock fetch ────────────────────────────────────────────────────────

const mockJsonResponse = (data, status = 200) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });

describe('authService - login (API real contra backend)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    globalThis.fetch = vi.fn();
  });

  it('login exitoso devuelve user y token del backend', async () => {
    const fakeUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test',
      apellido: 'User',
    };
    globalThis.fetch.mockResolvedValue(
      mockJsonResponse({ user: fakeUser, token: 'jwt-token-123' }),
    );

    const result = await login('test@example.com', 'password123');

    expect(result.token).toBe('jwt-token-123');
    expect(result.user.email).toBe('test@example.com');
    expect(result.user.name).toBe('Test');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/login'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('test@example.com'),
      }),
    );
  });

  it('login con credenciales inválidas lanza error', async () => {
    globalThis.fetch.mockResolvedValue(
      mockJsonResponse({ error: 'Credenciales inválidas' }, 401),
    );

    await expect(login('wrong@example.com', 'badpass')).rejects.toThrow(
      'Credenciales inválidas',
    );
  });

  it('login sin email lanza error', async () => {
    await expect(login('', 'password123')).rejects.toThrow(
      'Email y contraseña son obligatorios.',
    );
  });

  it('login sin password lanza error', async () => {
    await expect(login('test@example.com', '')).rejects.toThrow(
      'Email y contraseña son obligatorios.',
    );
  });

  it('login sin credenciales no llama al fetch', async () => {
    globalThis.fetch = vi.fn();

    try {
      await login('', '');
    } catch {
      // esperado
    }

    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('authService - save/load/clear auth state', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  it('saveAuthState guarda token y email en localStorage', () => {
    saveAuthState({ email: 'fan@test.com', name: 'Fan' }, 'test-token-123');

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', 'test-token-123');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('userEmail', 'fan@test.com');
  });

  it('loadAuthState recupera estado guardado', () => {
    mockLocalStorage.setItem('authToken', 'saved-token');
    mockLocalStorage.setItem('userEmail', 'saved@test.com');

    const state = loadAuthState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('saved-token');
    expect(state.user?.email).toBe('saved@test.com');
  });

  it('loadAuthState devuelve no autenticado si no hay datos', () => {
    const state = loadAuthState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  it('clearAuthState limpia token y email', () => {
    mockLocalStorage.setItem('authToken', 'token');
    mockLocalStorage.setItem('userEmail', 'user@test.com');

    clearAuthState();

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('userEmail');
  });
});

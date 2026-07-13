/**
 * Tests de caracterización: Auth module (auth.js)
 *
 * Describe el comportamiento ACTUAL del módulo de autenticación.
 * El módulo usa DOM (formulario de login, modales), localStorage,
 * y Toastify. Mockeamos esas dependencias.
 *
 * Comportamiento actual (con USE_MOCK_AUTH activado en Config):
 * - Login exitoso guarda authToken y userEmail en localStorage
 * - Login sin credenciales muestra error (no lanza excepción)
 */

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

// ─── Mocks globales ──────────────────────────────────────────────────────

// Mock localStorage
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

// Mock Toastify
globalThis.Toastify = vi.fn(() => ({
  showToast: vi.fn(),
}));

// Mock bootstrap global (usado por cerrarModalUsuario)
globalThis.bootstrap = {
  Modal: {
    getInstance: vi.fn(() => ({
      hide: vi.fn(),
    })),
  },
};

// Configuración mock: USE_MOCK_AUTH activado
globalThis.Config = {
  API_URL: 'http://localhost:3000',
  USE_MOCK_AUTH: true,
  MOCK_AUTH_URL: '/mocks/login.json',
};

// ─── Setup DOM ────────────────────────────────────────────────────────────

function setupAuthDOM() {
  document.body.innerHTML = `
    <form id="loginForm">
      <input type="email" id="inputEmail" />
      <input type="password" id="inputPassword" />
      <button type="submit">Iniciar Sesión</button>
    </form>
    <div id="userModal" class="modal fade"></div>
    <div id="auth-ui-container">
      <a id="login-nav-item" href="#" style="display: block;"><i class="bx bx-user"></i></a>
      <a id="logout-nav-item" href="#" style="display: none;">
        <i class="bx bx-log-out align-middle me-1"></i> Cerrar Sesión
      </a>
    </div>
  `;
}

// ─── Tests ────────────────────────────────────────────────────────────────

describe('Auth - manejarLogin', () => {
  beforeAll(async () => {
    setupAuthDOM();

    // Importar auth.js de forma dinámica
    await import('../../src/components/auth.js');

    // Forzar DOMContentLoaded porque en jsdom ya se disparó antes
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();

    // Resetear inputs
    const emailInput = document.getElementById('inputEmail');
    const passwordInput = document.getElementById('inputPassword');
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
  });

  it('login exitoso guarda authToken en localStorage (modo mock)', async () => {
    const emailInput = document.getElementById('inputEmail');
    const passwordInput = document.getElementById('inputPassword');
    emailInput.value = 'test@example.com';
    passwordInput.value = 'password123';

    // Disparamos submit en el form
    const form = document.getElementById('loginForm');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // Esperar a que se procese el async manejarLogin
    await vi.waitFor(() => {
      const stored = mockLocalStorage._getStore();
      expect(stored.authToken).toBeDefined();
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', expect.any(String));
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('userEmail', 'test@example.com');
  });

  it('login sin credenciales muestra error y no lanza excepción', async () => {
    const form = document.getElementById('loginForm');

    // No llenamos los inputs → validación debe fallar
    // sin lanzar excepción
    expect(() => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }).not.toThrow();

    // Debería haber mostrado Toastify con mensaje de error
    await vi.waitFor(() => {
      expect(globalThis.Toastify).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringMatching(/Email y contraseña son obligatorios/i),
        })
      );
    });
  });

  it('login fallido no guarda token', async () => {
    const form = document.getElementById('loginForm');

    // Sin credenciales, el login no debería guardar nada
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // Esperar a que se procese
    await vi.waitFor(() => {
      expect(globalThis.Toastify).toHaveBeenCalled();
    });

    // authToken no debería haberse guardado
    const store = mockLocalStorage._getStore();
    expect(store.authToken).toBeUndefined();
  });
});

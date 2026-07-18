import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { loadAuthState, saveAuthState, clearAuthState } from '../services/authService';
import { fetchAllUsers } from '../services/userService';
import { AdminPanel } from '../components/admin/AdminPanel';

// fetchProducts and updateProductStock are imported via vi.mock below
import { fetchProducts, updateProductStock } from '../services/api';

// ─── Mocks for AdminPanel component tests ────────────────────────────────
// These are declared before vi.mock so the closure captures them.

const mockShowToast = vi.fn();

vi.mock('../services/api', () => ({
  BASE_URL: 'http://localhost:4000',
  fetchProducts: vi.fn(),
  updateProductStock: vi.fn(),
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    token: 'admin-token',
    user: { id: 1, email: 'admin@test.com', name: 'Admin', role: 'admin' },
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock('../components/ui/Toast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

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

// ── Existing tests: authService — role persistence ─────────────────────

describe('authService — role persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
  });

  it('saveAuthState persiste el role del usuario', () => {
    saveAuthState(
      { id: 1, email: 'admin@test.com', name: 'Admin', role: 'admin' },
      'token-123',
    );

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('userRole', 'admin');
  });

  it('loadAuthState recupera el role guardado', () => {
    mockLocalStorage.setItem('authToken', 'token-123');
    mockLocalStorage.setItem('userEmail', 'admin@test.com');
    mockLocalStorage.setItem('userName', 'Admin');
    mockLocalStorage.setItem('userRole', 'admin');

    const state = loadAuthState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.role).toBe('admin');
  });

  it('loadAuthState no incluye role si no está guardado', () => {
    mockLocalStorage.setItem('authToken', 'token-123');
    mockLocalStorage.setItem('userEmail', 'user@test.com');
    mockLocalStorage.setItem('userName', 'User');

    const state = loadAuthState();
    expect(state.user?.role).toBeUndefined();
  });

  it('clearAuthState elimina el role', () => {
    mockLocalStorage.setItem('userRole', 'admin');
    clearAuthState();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('userRole');
  });
});

// ── Existing tests: userService — fetchAllUsers ────────────────────────

describe('userService — fetchAllUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  it('llama a GET /users con token de auth', async () => {
    const fakeUsers = [
      { id: 1, email: 'admin@test.com', name: 'Admin', role: 'admin' },
      { id: 2, email: 'user@test.com', name: 'User', role: 'user' },
    ];

    globalThis.fetch.mockResolvedValue(mockJsonResponse(fakeUsers));

    const result = await fetchAllUsers('admin-token');

    expect(result).toHaveLength(2);
    expect(result[0].role).toBe('admin');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer admin-token',
        }),
      }),
    );
  });

  it('lanza error si la respuesta no es ok', async () => {
    globalThis.fetch.mockResolvedValue(
      mockJsonResponse({ error: 'Acceso denegado' }, 403),
    );

    await expect(fetchAllUsers('user-token')).rejects.toThrow(
      'Acceso denegado',
    );
  });
});

// ── AdminPanel — Stock Management Component Tests ───────────────────────

describe('AdminPanel — Gestión de Stock', () => {
  const mockProducts = [
    {
      id: 1,
      nombre: 'Remera The Beatles',
      tipo: 'remera',
      img: '/img/remerathebeatles.png',
      precio: 4000,
      stock: 5,
    },
    {
      id: 2,
      nombre: 'Buzo AC/DC',
      tipo: 'buzo',
      img: '/img/buzoacdc.png',
      precio: 6000,
      stock: 3,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Provide a working fetch so fetchAllUsers (real function) resolves
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    fetchProducts.mockResolvedValue(mockProducts);
    updateProductStock.mockResolvedValue({ ...mockProducts[0], stock: 10 });
    mockShowToast.mockClear();
  });

  // ── CA-1: AdminPanel renders "Gestión de Stock" section ────────────

  it('renderiza la sección "Gestión de Stock"', async () => {
    render(<AdminPanel />);

    // Wait for loading to finish (users + products effects)
    await waitFor(() => {
      expect(screen.getByText('Gestión de Stock')).toBeInTheDocument();
    });
  });

  // ── CA-2: Products are displayed in the stock table ────────────────

  it('muestra los productos cargados en la tabla de stock', async () => {
    render(<AdminPanel />);

    await waitFor(() => {
      expect(screen.getByText('Remera The Beatles')).toBeInTheDocument();
    });

    expect(screen.getByText('Buzo AC/DC')).toBeInTheDocument();
  });

  // ── CA-3: Input allows changing stock, button enables ──────────────

  it('el input permite cambiar el stock y el botón se habilita', async () => {
    const user = userEvent.setup();
    render(<AdminPanel />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Remera The Beatles')).toBeInTheDocument();
    });

    // Find the first numeric input in the stock table
    const stockInputs = screen.getAllByRole('spinbutton');
    expect(stockInputs.length).toBeGreaterThan(0);

    // All "Actualizar" buttons should be disabled initially (stock unchanged)
    const updateBtns = screen.getAllByRole('button', { name: 'Actualizar' });
    expect(updateBtns.length).toBe(2);
    updateBtns.forEach((btn) => expect(btn).toBeDisabled());

    // Change stock for first product
    fireEvent.change(stockInputs[0], { target: { value: '20' } });

    // Now only the first button should be enabled; the second remains disabled
    const updateBtnsAfter = screen.getAllByRole('button', { name: 'Actualizar' });
    expect(updateBtnsAfter[0]).not.toBeDisabled();
    expect(updateBtnsAfter[1]).toBeDisabled();
  });

  // ── CA-4: Clicking "Actualizar" calls updateProductStock ───────────

  it('al hacer clic en "Actualizar" llama a updateProductStock', async () => {
    const user = userEvent.setup();
    render(<AdminPanel />);

    await waitFor(() => {
      expect(screen.getByText('Remera The Beatles')).toBeInTheDocument();
    });

    const stockInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(stockInputs[0], { target: { value: '15' } });

    const updateBtns = screen.getAllByRole('button', { name: 'Actualizar' });
    await user.click(updateBtns[0]);

    await waitFor(() => {
      expect(updateProductStock).toHaveBeenCalledWith(1, 15);
    });
  });

  // ── CA-5: Success toast is shown after stock update ────────────────

  it('muestra toast de éxito después de actualizar el stock', async () => {
    const user = userEvent.setup();
    render(<AdminPanel />);

    await waitFor(() => {
      expect(screen.getByText('Remera The Beatles')).toBeInTheDocument();
    });

    const stockInputs = screen.getAllByRole('spinbutton');
    fireEvent.change(stockInputs[0], { target: { value: '25' } });

    const updateBtns = screen.getAllByRole('button', { name: 'Actualizar' });
    await user.click(updateBtns[0]);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.stringContaining('Remera The Beatles'),
        'success',
      );
    });
  });
});

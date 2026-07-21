/**
 * Tests for ShoppingConcierge — componente principal del chatbot.
 *
 * Covers: renderizado del FAB, toggle del panel, sugerencias, badge.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShoppingConcierge } from '../components/chat/ShoppingConcierge';
import { CartContext } from '../context/CartContext';
import type { ReactNode } from 'react';

// ──────────────────────────────────────────────
//  Mock data
// ──────────────────────────────────────────────

const mockProducts = [
  { id: 1, nombre: 'Remera The Beatles', tipo: 'remera', img: '/img/remera.jpg', descripcion: 'The Beatles - negra', precio: 4000, tallesDisponibles: ['S', 'M', 'L', 'XL'] },
  { id: 2, nombre: 'Buzo Nirvana', tipo: 'buzo', img: '/img/buzo.jpg', descripcion: 'Nirvana - hoodie', precio: 8000, tallesDisponibles: ['M', 'L', 'XL'] },
  { id: 3, nombre: 'Gorra Metallica', tipo: 'accesorio', img: '/img/gorra.jpg', descripcion: 'Metallica - snapback', precio: 2500 },
  { id: 4, nombre: 'Remera AC/DC', tipo: 'remera', img: '/img/remera-acdc.jpg', descripcion: 'AC/DC - azul', precio: 4500, tallesDisponibles: ['S', 'M', 'L'] },
  { id: 5, nombre: 'Vaso Rock', tipo: 'vaso', img: '/img/vaso.jpg', descripcion: 'Vaso de vidrio', precio: 1500 },
];

// Mock productService URL
vi.mock('../services/productService', () => ({
  PRODUCTS_API_URL: 'http://test.local/products',
}));

// ──────────────────────────────────────────────
//  Cart mock
// ──────────────────────────────────────────────

const mockAddToCart = vi.fn();
const mockRemoveItem = vi.fn();
const mockClearCart = vi.fn();

function createCartWrapper(overrides: Record<string, unknown> = {}) {
  return ({ children }: { children: ReactNode }) => (
    <CartContext.Provider
      value={{
        items: [],
        summary: { totalItems: 0, totalPrice: 0 },
        addToCart: mockAddToCart,
        removeItem: mockRemoveItem,
        clearCart: mockClearCart,
        itemCount: 0,
        ...overrides,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ──────────────────────────────────────────────
//  Tests
// ──────────────────────────────────────────────

describe('ShoppingConcierge', () => {
  let originalFetch: typeof global.fetch;
  const mockFetchResponse = {
    ok: true,
    json: () => Promise.resolve(mockProducts),
  };

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn(() => Promise.resolve(mockFetchResponse)) as unknown as typeof global.fetch;
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('renderiza el FAB (botón flotante)', () => {
    render(<ShoppingConcierge />, { wrapper: createCartWrapper() });

    const fabButton = screen.getByRole('button', { name: /abrir asistente de compra/i });
    expect(fabButton).toBeInTheDocument();
  });

  it('abre el panel al hacer clic en el FAB', async () => {
    render(<ShoppingConcierge />, { wrapper: createCartWrapper() });

    // Click the FAB to open
    const fabButton = screen.getByRole('button', { name: /abrir asistente de compra/i });
    fireEvent.click(fabButton);

    // The chat panel should appear (it uses role="dialog")
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /chat de ventas/i })).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('cierra el panel al hacer clic en el botón de cerrar', async () => {
    render(<ShoppingConcierge />, { wrapper: createCartWrapper() });

    // Open the panel first
    const openButton = screen.getByRole('button', { name: /abrir asistente de compra/i });
    fireEvent.click(openButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /chat de ventas/i })).toBeInTheDocument();
    }, { timeout: 2000 });

    // Now find the close button in the panel header and click it
    // (there are two "Cerrar chat" buttons: the FAB and the header close)
    const closeButtons = screen.getAllByRole('button', { name: /cerrar chat/i });
    // The header close button is the one inside the dialog (second one)
    const headerCloseButton = closeButtons[1];
    fireEvent.click(headerCloseButton);

    // The dialog should disappear (with animation delay)
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /chat de ventas/i })).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('muestra el campo de input cuando el catálogo está cargado', async () => {
    render(<ShoppingConcierge />, { wrapper: createCartWrapper() });

    // Open the panel
    const fabButton = screen.getByRole('button', { name: /abrir asistente de compra/i });
    fireEvent.click(fabButton);

    // Wait for the panel to be visible and catalog to load
    await waitFor(() => {
      const input = screen.getByPlaceholderText(/buscá productos/i);
      expect(input).toBeInTheDocument();
      expect(input).not.toBeDisabled();
    }, { timeout: 3000 });
  });

  it('muestra sugerencias cuando no hay mensajes y catálogo cargado', async () => {
    render(<ShoppingConcierge />, { wrapper: createCartWrapper() });

    // Open the panel
    const fabButton = screen.getByRole('button', { name: /abrir asistente de compra/i });
    fireEvent.click(fabButton);

    // Wait for suggestions buttons
    await waitFor(() => {
      expect(screen.getByText('Remeras de rock')).toBeInTheDocument();
      expect(screen.getByText('Menos de $5000')).toBeInTheDocument();
      expect(screen.getByText('Buzos')).toBeInTheDocument();
      expect(screen.getByText('Accesorios')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

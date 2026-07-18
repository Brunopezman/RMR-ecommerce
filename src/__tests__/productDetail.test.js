import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { ProductDetail } from '../components/product/ProductDetail';
import { CartContext } from '../context/CartContext';

// ─── Mock CartContext ─────────────────────────────────────────────────

const mockAddToCart = vi.fn();
const MockCartProvider = ({ children }) => {
  const value = {
    items: [],
    summary: { totalItems: 0, totalPrice: 0 },
    addToCart: mockAddToCart,
    removeItem: vi.fn(),
    clearCart: vi.fn(),
    itemCount: 0,
  };
  return React.createElement(CartContext.Provider, { value }, children);
};

// ─── Sample products ─────────────────────────────────────────────────

const PRODUCT_CON_TALLES = {
  id: 1,
  nombre: 'Remera The Beatles',
  precio: 4000,
  img: '/img/remerathebeatles.png',
  descripcion: 'The Beatles - negra - lisa',
  tallesDisponibles: ['S', 'M', 'L', 'XL'],
};

const PRODUCT_TALLE_UNICO = {
  id: 14,
  nombre: 'Gorra Nirvana',
  precio: 1500,
  img: '/img/gorranirvana.jpg',
  descripcion: 'Nirvana - blanco - estampado',
  tallesDisponibles: ['Único'],
};

const PRODUCT_SIN_TALLES = {
  id: 99,
  nombre: 'Producto Sin Talle',
  precio: 2000,
  img: '/img/test.png',
  descripcion: 'Sin campo tallesDisponibles',
};

// ─── Helper to render ProductDetail with mock cart ───────────────────

function renderDetail(product, onBack = vi.fn()) {
  return render(
    React.createElement(MockCartProvider, null,
      React.createElement(ProductDetail, { product, onBack })
    )
  );
}

// ─── Tests ───────────────────────────────────────────────────────────

describe('ProductDetail', () => {
  beforeEach(() => {
    mockAddToCart.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renderiza el nombre del producto', () => {
    renderDetail(PRODUCT_CON_TALLES);
    expect(screen.getByText('Remera The Beatles')).toBeDefined();
  });

  it('renderiza el precio del producto', () => {
    renderDetail(PRODUCT_CON_TALLES);
    expect(screen.getByText('$4000')).toBeDefined();
  });

  it('renderiza la imagen del producto', () => {
    renderDetail(PRODUCT_CON_TALLES);
    const img = screen.getByAltText('The Beatles - negra - lisa');
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toBe('/img/remerathebeatles.png');
  });

  it('renderiza la descripción del producto', () => {
    renderDetail(PRODUCT_CON_TALLES);
    expect(screen.getByText('The Beatles - negra - lisa')).toBeDefined();
  });

  it('muestra el selector de talle si hay talles disponibles', () => {
    renderDetail(PRODUCT_CON_TALLES);
    expect(screen.getByText('S')).toBeDefined();
    expect(screen.getByText('M')).toBeDefined();
    expect(screen.getByText('L')).toBeDefined();
    expect(screen.getByText('XL')).toBeDefined();
  });

  it('el botón "Agregar al carrito" está deshabilitado si no se eligió talle (múltiples talles)', () => {
    renderDetail(PRODUCT_CON_TALLES);
    const addButton = screen.getByText('Agregar al carrito');
    expect(addButton.closest('button')?.disabled).toBe(true);
  });

  it('el botón "Agregar al carrito" se habilita al seleccionar un talle', () => {
    renderDetail(PRODUCT_CON_TALLES);
    // Click on size "M"
    const sizeM = screen.getByText('M');
    fireEvent.click(sizeM);

    const addButton = screen.getByText('Agregar al carrito');
    expect(addButton.closest('button')?.disabled).toBe(false);
  });

  it('llama a addToCart con el talle seleccionado al hacer clic en "Agregar"', () => {
    renderDetail(PRODUCT_CON_TALLES);
    // Select talle M
    fireEvent.click(screen.getByText('M'));

    // Click Agregar al carrito
    fireEvent.click(screen.getByText('Agregar al carrito'));

    expect(mockAddToCart).toHaveBeenCalled();
    // The first argument of the first call should have talle='M'
    const calledProduct = mockAddToCart.mock.calls[0][0];
    expect(calledProduct.talle).toBe('M');
  });

  it('muestra "Talle único" para productos con talle único', () => {
    renderDetail(PRODUCT_TALLE_UNICO);
    expect(screen.getByText('Talle único')).toBeDefined();
  });

  it('producto con talle único permite agregar sin seleccionar talle', () => {
    renderDetail(PRODUCT_TALLE_UNICO);
    const addButton = screen.getByText('Agregar al carrito');
    expect(addButton.closest('button')?.disabled).toBe(false);
  });

  it('producto sin tallesDisponibles permite agregar sin seleccionar talle', () => {
    renderDetail(PRODUCT_SIN_TALLES);
    const addButton = screen.getByText('Agregar al carrito');
    expect(addButton.closest('button')?.disabled).toBe(false);
  });

  it('llama a onBack al hacer clic en "Volver a la tienda"', () => {
    const onBack = vi.fn();
    renderDetail(PRODUCT_CON_TALLES, onBack);
    fireEvent.click(screen.getByText('Volver a la tienda'));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('incrementa cantidad con el botón "+"', () => {
    renderDetail(PRODUCT_SIN_TALLES);
    const plusButton = screen.getByLabelText('Aumentar cantidad');
    fireEvent.click(plusButton);

    const input = screen.getByRole('spinbutton');
    expect(input.value).toBe('2');
  });

  it('disminuye cantidad con el botón "-" (mínimo 1)', () => {
    renderDetail(PRODUCT_SIN_TALLES);
    // First increase to 3
    fireEvent.click(screen.getByLabelText('Aumentar cantidad'));
    fireEvent.click(screen.getByLabelText('Aumentar cantidad'));

    // Then decrease once
    fireEvent.click(screen.getByLabelText('Disminuir cantidad'));

    const input = screen.getByRole('spinbutton');
    expect(input.value).toBe('2');
  });

  it('no disminuye cantidad por debajo de 1', () => {
    renderDetail(PRODUCT_SIN_TALLES);
    // Try to decrease from 1
    fireEvent.click(screen.getByLabelText('Disminuir cantidad'));

    const input = screen.getByRole('spinbutton');
    expect(input.value).toBe('1');
  });

  it('muestra hint de selección de talle si no se eligió', () => {
    renderDetail(PRODUCT_CON_TALLES);
    expect(screen.getByText('Seleccioná un talle para continuar')).toBeDefined();
  });
});

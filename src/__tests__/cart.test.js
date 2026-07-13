/**
 * Tests de caracterización: Cart module (cart.js)
 *
 * Describe el comportamiento ACTUAL de las funciones de carrito.
 * NOTA: Muchas funciones de cart.js están acopladas al DOM
 * (document.getElementById, Toastify). Para aislar la lógica de
 * negocio, mockeamos las dependencias del DOM y Toastify.
 *
 * Comportamiento actual documentado:
 * - validarProductoRepetido: agrega producto nuevo; incrementa si ya existe
 * - eliminarProductoCarrito: elimina si cantidad=1; decrementa si >1
 * - vaciarCarrito: vacía window.carrito y limpia localStorage
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Setup de mocks globales ─────────────────────────────────────────────

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

// Reemplazamos localStorage global con nuestro mock
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
});

// Mock de Toastify global
globalThis.Toastify = vi.fn(() => ({
  showToast: vi.fn(),
}));

// Mock de document.getElementById para los tests que lo necesitan
const mockGetElementById = vi.fn();
const originalGetElementById = document.getElementById.bind(document);

// Productos de ejemplo
const PRODUCTOS = [
  { id: '1', nombre: 'Remera The Beatles', precio: 4000, categoria: 'remera' },
  { id: '2', nombre: 'Buzo AC/DC', precio: 5000, categoria: 'buzo' },
  { id: '3', nombre: 'Gorra Nirvana', precio: 1500, categoria: 'accesorio' },
];

// ─── Importamos el módulo (ejecuta el IIFE) ───────────────────────────────
import '../../src/components/cart.js';

describe('validarProductoRepetido', () => {
  beforeEach(() => {
    // Reset carrito global
    window.carrito = [];
    mockLocalStorage.clear();
    vi.clearAllMocks();

    // Mockeamos document.getElementById para que devuelva objetos simulados
    // Cuando se pida "contador-carrito" o "precioTotal", devolvemos un span mockeado
    document.getElementById = vi.fn((id) => {
      if (id === 'contador-carrito' || id === 'precioTotal') {
        return { innerText: '0' };
      }
      // Para otros ids, intentar con el real o devolver null
      const el = originalGetElementById.call(document, id);
      return el || null;
    });
  });

  afterEach(() => {
    document.getElementById = originalGetElementById;
  });

  it('agrega un producto nuevo al carrito si no existe', () => {
    const evento = { target: { id: '1' } };

    window.validarProductoRepetido(evento, PRODUCTOS);

    expect(window.carrito).toHaveLength(1);
    expect(window.carrito[0].id).toBe('1');
    expect(window.carrito[0].cantidad).toBe(1);
  });

  it('incrementa la cantidad si el producto ya existe en el carrito', () => {
    // Primero agregamos el producto
    const evento1 = { target: { id: '1' } };
    window.validarProductoRepetido(evento1, PRODUCTOS);
    expect(window.carrito[0].cantidad).toBe(1);

    // Mockeamos getElementById para que cuando busque `cantidad1` devuelva un span
    document.getElementById = vi.fn((id) => {
      if (id === 'contador-carrito' || id === 'precioTotal') {
        return { innerText: '0' };
      }
      if (id === 'cantidad1') {
        return { innerText: 'Cantidad: 1' };
      }
      return null;
    });

    // Segundo click en el mismo producto
    window.validarProductoRepetido(evento1, PRODUCTOS);

    expect(window.carrito).toHaveLength(1);
    expect(window.carrito[0].cantidad).toBe(2);
  });

  it('no hace nada si el producto no existe en la lista', () => {
    const evento = { target: { id: '999' } };
    window.validarProductoRepetido(evento, PRODUCTOS);

    expect(window.carrito).toHaveLength(0);
  });

  it('guarda en localStorage después de agregar', () => {
    const evento = { target: { id: '2' } };
    window.validarProductoRepetido(evento, PRODUCTOS);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'carrito',
      expect.any(String)
    );
    const saved = JSON.parse(mockLocalStorage._getStore().carrito);
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe('2');
  });
});

describe('eliminarProductoCarrito', () => {
  beforeEach(() => {
    window.carrito = [
      { id: '1', nombre: 'Remera The Beatles', precio: 4000, cantidad: 1 },
      { id: '2', nombre: 'Buzo AC/DC', precio: 5000, cantidad: 3 },
    ];
    mockLocalStorage.clear();
    vi.clearAllMocks();

    document.getElementById = vi.fn((id) => {
      if (id === 'contador-carrito' || id === 'precioTotal') {
        return { innerText: '0' };
      }
      if (id === 'carrito-contenedor') {
        return { innerHTML: '', appendChild: vi.fn(), querySelector: vi.fn() };
      }
      return null;
    });
  });

  afterEach(() => {
    document.getElementById = originalGetElementById;
  });

  it('elimina el producto del carrito si cantidad es 1', () => {
    window.eliminarProductoCarrito('1');

    expect(window.carrito).toHaveLength(1);
    expect(window.carrito[0].id).toBe('2');
  });

  it('decrementa la cantidad si es mayor a 1', () => {
    window.eliminarProductoCarrito('2');

    expect(window.carrito).toHaveLength(2);
    expect(window.carrito[1].id).toBe('2');
    expect(window.carrito[1].cantidad).toBe(2);
  });

  it('no hace nada si el producto no existe', () => {
    window.eliminarProductoCarrito('999');

    expect(window.carrito).toHaveLength(2);
  });

  it('usa comparación no estricta (==) para el ID', () => {
    // El código usa `p.id == productoId` (doble igual)
    window.carrito.push({ id: 3, nombre: 'Gorra', precio: 1500, cantidad: 1 });
    window.eliminarProductoCarrito(3); // number, pero el id en carrito es number también

    // El producto con id 3 debería haberse eliminado
    expect(window.carrito.find(p => p.id == 3)).toBeUndefined();
  });
});

describe('vaciarCarrito', () => {
  beforeEach(() => {
    window.carrito = [
      { id: '1', nombre: 'Remera The Beatles', precio: 4000, cantidad: 1 },
    ];
    mockLocalStorage.clear();
    mockLocalStorage.setItem('carrito', JSON.stringify(window.carrito));
    vi.clearAllMocks();

    document.getElementById = vi.fn((id) => {
      if (id === 'contador-carrito' || id === 'precioTotal') {
        return { innerText: '0' };
      }
      if (id === 'carrito-contenedor') {
        return { innerHTML: '', appendChild: vi.fn(), querySelector: vi.fn() };
      }
      return null;
    });
  });

  afterEach(() => {
    document.getElementById = originalGetElementById;
  });

  it('vacía el array window.carrito', () => {
    window.vaciarCarrito();
    expect(window.carrito).toEqual([]);
  });

  it('remueve el carrito de localStorage', () => {
    window.vaciarCarrito();
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('carrito');
  });

  it('llama a Toastify con "Carrito vacío!"', () => {
    window.vaciarCarrito();
    expect(globalThis.Toastify).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringMatching(/Carrito vacío/i),
      })
    );
  });
});

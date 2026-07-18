import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  addToCart,
  removeFromCart,
  removeAllFromCart,
  calculateSummary,
  saveCartToStorage,
  loadCartFromStorage,
  clearCartStorage,
} from '../services/cartService';

const PRODUCTOS = [
  { id: '1', nombre: 'Remera The Beatles', precio: 4000, categoria: 'remera' },
  { id: '2', nombre: 'Buzo AC/DC', precio: 5000, categoria: 'buzo' },
  { id: '3', nombre: 'Gorra Nirvana', precio: 1500, categoria: 'accesorio' },
];

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

describe('addToCart', () => {
  it('agrega un producto nuevo al carrito si no existe', () => {
    const result = addToCart([], PRODUCTOS[0]);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
    expect(result[0].cantidad).toBe(1);
  });

  it('incrementa la cantidad si el producto ya existe en el carrito', () => {
    const items = [{ ...PRODUCTOS[0], cantidad: 1 }];
    const result = addToCart(items, PRODUCTOS[0]);

    expect(result).toHaveLength(1);
    expect(result[0].cantidad).toBe(2);
  });

  it('no modifica otros productos cuando incrementa uno existente', () => {
    const items = [
      { ...PRODUCTOS[0], cantidad: 1 },
      { ...PRODUCTOS[1], cantidad: 2 },
    ];
    const result = addToCart(items, PRODUCTOS[0]);

    expect(result).toHaveLength(2);
    expect(result[0].cantidad).toBe(2);
    expect(result[1].cantidad).toBe(2);
  });

  it('agrega múltiples productos distintos', () => {
    let items = addToCart([], PRODUCTOS[0]);
    items = addToCart(items, PRODUCTOS[1]);
    items = addToCart(items, PRODUCTOS[2]);

    expect(items).toHaveLength(3);
    expect(items.map(p => p.id)).toEqual(['1', '2', '3']);
  });
});

describe('removeFromCart', () => {
  it('elimina el producto del carrito si cantidad es 1', () => {
    const items = [
      { id: '1', nombre: 'Remera The Beatles', precio: 4000, cantidad: 1 },
      { id: '2', nombre: 'Buzo AC/DC', precio: 5000, cantidad: 3 },
    ];
    const result = removeFromCart(items, '1');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('decrementa la cantidad si es mayor a 1', () => {
    const items = [
      { id: '1', nombre: 'Remera The Beatles', precio: 4000, cantidad: 1 },
      { id: '2', nombre: 'Buzo AC/DC', precio: 5000, cantidad: 3 },
    ];
    const result = removeFromCart(items, '2');

    expect(result).toHaveLength(2);
    expect(result[1].id).toBe('2');
    expect(result[1].cantidad).toBe(2);
  });

  it('no hace nada si el producto no existe', () => {
    const items = [
      { id: '1', nombre: 'Remera', precio: 4000, cantidad: 1 },
      { id: '2', nombre: 'Buzo', precio: 5000, cantidad: 3 },
    ];
    const result = removeFromCart(items, '999');
    expect(result).toHaveLength(2);
  });
});

describe('calculateSummary', () => {
  it('calcula totalItems y totalPrice correctamente', () => {
    const items = [
      { id: '1', nombre: 'Remera', precio: 4000, cantidad: 2 },
      { id: '2', nombre: 'Buzo', precio: 5000, cantidad: 1 },
    ];
    const summary = calculateSummary(items);

    expect(summary.totalItems).toBe(3);
    expect(summary.totalPrice).toBe(13000);
  });

  it('devuelve ceros para carrito vacío', () => {
    const summary = calculateSummary([]);
    expect(summary.totalItems).toBe(0);
    expect(summary.totalPrice).toBe(0);
  });
});

describe('addToCart with talle (size) support', () => {
  const BEATLES = { id: 1, nombre: 'Remera The Beatles', precio: 4000, categoria: 'remera' };
  const BEATLES_M = { ...BEATLES, talle: 'M' };
  const BEATLES_L = { ...BEATLES, talle: 'L' };

  it('agrega producto sin talle (compatibilidad legacy)', () => {
    const result = addToCart([], BEATLES);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
    expect(result[0].talle).toBeUndefined();
    expect(result[0].cantidad).toBe(1);
  });

  it('agrega producto con talle', () => {
    const result = addToCart([], BEATLES_M);
    expect(result).toHaveLength(1);
    expect(result[0].talle).toBe('M');
    expect(result[0].cantidad).toBe(1);
  });

  it('mismo producto con distinto talle son items separados', () => {
    let items = addToCart([], BEATLES_M);
    items = addToCart(items, BEATLES_L);

    expect(items).toHaveLength(2);
    expect(items[0].talle).toBe('M');
    expect(items[0].cantidad).toBe(1);
    expect(items[1].talle).toBe('L');
    expect(items[1].cantidad).toBe(1);
  });

  it('mismo producto con mismo talle incrementa cantidad', () => {
    let items = addToCart([], BEATLES_M);
    items = addToCart(items, BEATLES_M);

    expect(items).toHaveLength(1);
    expect(items[0].talle).toBe('M');
    expect(items[0].cantidad).toBe(2);
  });

  it('mismo producto sin talle y con talle son items separados', () => {
    let items = addToCart([], BEATLES);
    items = addToCart(items, BEATLES_M);

    expect(items).toHaveLength(2);
    // Legacy item should not match the one with talle
    expect(items.filter(i => i.talle === undefined)).toHaveLength(1);
    expect(items.filter(i => i.talle === 'M')).toHaveLength(1);
  });
});

describe('removeFromCart with talle', () => {
  const MOCK_ITEMS = [
    { id: 1, nombre: 'Remera', precio: 4000, cantidad: 2, talle: 'M' },
    { id: 1, nombre: 'Remera', precio: 4000, cantidad: 1, talle: 'L' },
    { id: 2, nombre: 'Buzo', precio: 5000, cantidad: 1, talle: 'M' },
  ];

  it('elimina producto con talle específico si cantidad es 1', () => {
    const result = removeFromCart(MOCK_ITEMS, 1, 'L');
    expect(result).toHaveLength(2);
    expect(result.find(i => i.talle === 'L')).toBeUndefined();
  });

  it('decrementa cantidad del producto con talle específico si > 1', () => {
    const result = removeFromCart(MOCK_ITEMS, 1, 'M');
    expect(result).toHaveLength(3);
    expect(result.find(i => i.talle === 'M').cantidad).toBe(1);
  });

  it('no afecta items con distinto talle', () => {
    const result = removeFromCart(MOCK_ITEMS, 1, 'M');
    expect(result.find(i => i.talle === 'L').cantidad).toBe(1);
    expect(result.find(i => i.id === 2).cantidad).toBe(1);
  });

  it('no hace nada si el talle no existe', () => {
    const result = removeFromCart(MOCK_ITEMS, 1, 'XL');
    expect(result).toHaveLength(3);
  });
});

describe('removeAllFromCart', () => {
  const MOCK_ITEMS = [
    { id: 1, nombre: 'Remera', precio: 4000, cantidad: 2, talle: 'M' },
    { id: 1, nombre: 'Remera', precio: 4000, cantidad: 1, talle: 'L' },
    { id: 2, nombre: 'Buzo', precio: 5000, cantidad: 1, talle: 'M' },
  ];

  it('elimina solo items con el talle específico', () => {
    const result = removeAllFromCart(MOCK_ITEMS, 1, 'M');
    // Should remove {id:1, talle:M} but keep {id:1, talle:L} and {id:2, talle:M}
    expect(result).toHaveLength(2);
    expect(result.find(i => i.id === 1 && i.talle === 'M')).toBeUndefined();
    expect(result.find(i => i.id === 1 && i.talle === 'L')).toBeDefined();
  });

  it('no elimina items con distinto talle del mismo producto', () => {
    const result = removeAllFromCart(MOCK_ITEMS, 1, 'M');
    expect(result.find(i => i.talle === 'L')).toBeDefined();
    expect(result.find(i => i.id === 2 && i.talle === 'M')).toBeDefined();
  });

  it('sin talle: solo elimina items sin talle (legacy)', () => {
    const items = [
      { id: 1, nombre: 'Remera', precio: 4000, cantidad: 2 },
      { id: 1, nombre: 'Remera', precio: 4000, cantidad: 1, talle: 'L' },
      { id: 2, nombre: 'Buzo', precio: 5000, cantidad: 1 },
    ];
    // When talle is not provided, matches items where talle is also undefined
    const result = removeAllFromCart(items, 1);
    // Should remove {id:1, talle: undefined} but keep {id:1, talle:L} and {id:2}
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1); // id=1 with talle:'L' remains
    expect(result[0].talle).toBe('L');
    expect(result[1].id).toBe(2); // id=2 without talle remains
  });
});

describe('localStorage cart operations', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  it('saveCartToStorage persiste los items', () => {
    const items = [{ id: '1', nombre: 'Test', precio: 100, cantidad: 1 }];
    saveCartToStorage(items);

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'carrito',
      JSON.stringify(items),
    );
  });

  it('loadCartFromStorage recupera los items guardados', () => {
    const items = [{ id: '1', nombre: 'Test', precio: 100, cantidad: 1 }];
    mockLocalStorage.setItem('carrito', JSON.stringify(items));

    const loaded = loadCartFromStorage();
    expect(loaded).toEqual(items);
  });

  it('loadCartFromStorage devuelve array vacío si no hay datos', () => {
    const loaded = loadCartFromStorage();
    expect(loaded).toEqual([]);
  });

  it('clearCartStorage remueve el carrito de localStorage', () => {
    mockLocalStorage.setItem('carrito', JSON.stringify([{ id: '1' }]));
    clearCartStorage();

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('carrito');
    expect(loadCartFromStorage()).toEqual([]);
  });
});

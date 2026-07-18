import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchProducts, filterByCategory, filterByCategories, filterByMaxPrice, searchByName } from '../services/productService';

const SAMPLE_PRODUCTS = [
  { id: 1, nombre: 'Remera The Beatles', categoria: 'remera', precio: 4000 },
  { id: 2, nombre: 'Buzo AC/DC', categoria: 'buzo', precio: 5000 },
  { id: 3, nombre: 'Gorra Nirvana', categoria: 'accesorio', precio: 1500 },
  { id: 4, nombre: 'Remera Pink Floyd', categoria: 'remera', precio: 4500 },
];

describe('fetchProducts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('devuelve el array de productos cuando el fetch es exitoso', async () => {
    const mockData = [{ id: 1, nombre: 'Test' }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await fetchProducts('/data/test.json');
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith('/data/test.json');
  });

  it('devuelve array vacío si el fetch falla con HTTP error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await fetchProducts('/data/missing.json');
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('devuelve array vacío si el fetch lanza una excepción de red', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await fetchProducts('/data/fail.json');
    expect(result).toEqual([]);

    consoleSpy.mockRestore();
  });
});

describe('filterByCategory', () => {
  it('filtra productos por categoría exacta (case-insensitive)', () => {
    const result = filterByCategory(SAMPLE_PRODUCTS, 'remera');
    expect(result).toHaveLength(2);
    expect(result.every(p => p.categoria === 'remera')).toBe(true);
  });

  it('filtra sin distinguir mayúsculas/minúsculas', () => {
    const result = filterByCategory(SAMPLE_PRODUCTS, 'REMERA');
    expect(result).toHaveLength(2);
  });

  it('devuelve array vacío si no hay productos que coincidan', () => {
    const result = filterByCategory(SAMPLE_PRODUCTS, 'vinilo');
    expect(result).toEqual([]);
  });

  it('devuelve todos los productos si category es falsy', () => {
    const result1 = filterByCategory(SAMPLE_PRODUCTS, '');
    expect(result1).toEqual(SAMPLE_PRODUCTS);

    const result2 = filterByCategory(SAMPLE_PRODUCTS, null);
    expect(result2).toEqual(SAMPLE_PRODUCTS);

    const result3 = filterByCategory(SAMPLE_PRODUCTS, undefined);
    expect(result3).toEqual(SAMPLE_PRODUCTS);
  });

  it('soporta el campo alternativo "category" si no existe "categoria"', () => {
    const productsWithCategory = [
      { id: 5, nombre: 'Test', category: 'vinilo' },
      { id: 6, nombre: 'Test2', category: 'remera' },
    ];
    const result = filterByCategory(productsWithCategory, 'vinilo');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(5);
  });
});

describe('searchByName', () => {
  it('busca productos por nombre sin distinguir mayúsculas', () => {
    const result = searchByName(SAMPLE_PRODUCTS, 'beatles');
    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('Remera The Beatles');
  });

  it('busca con mayúsculas y encuentra igual', () => {
    const result = searchByName(SAMPLE_PRODUCTS, 'BEATLES');
    expect(result).toHaveLength(1);
  });

  it('busca con términos parciales', () => {
    const result = searchByName(SAMPLE_PRODUCTS, 'Remera');
    expect(result).toHaveLength(2);
  });

  it('devuelve array vacío si no hay coincidencias', () => {
    const result = searchByName(SAMPLE_PRODUCTS, 'ZZZZ');
    expect(result).toEqual([]);
  });

  it('devuelve todos los productos si el término es vacío', () => {
    const result = searchByName(SAMPLE_PRODUCTS, '');
    expect(result).toEqual(SAMPLE_PRODUCTS);
  });

  it('soporta el campo alternativo "name" si no existe "nombre"', () => {
    const productsWithName = [
      { id: 5, name: 'Vinilo Queen', precio: 3000 },
    ];
    const result = searchByName(productsWithName, 'queen');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(5);
  });
});

describe('filterByCategories', () => {
  it('filtra productos por un array de categorías', () => {
    const result = filterByCategories(SAMPLE_PRODUCTS, ['remera']);
    expect(result).toHaveLength(2);
    expect(result.every(p => p.categoria === 'remera')).toBe(true);
  });

  it('filtra por múltiples categorías', () => {
    const result = filterByCategories(SAMPLE_PRODUCTS, ['remera', 'buzo']);
    expect(result).toHaveLength(3);
    expect(result.map(p => p.id)).toEqual([1, 2, 4]);
  });

  it('devuelve todos los productos si el array de categorías está vacío', () => {
    const result = filterByCategories(SAMPLE_PRODUCTS, []);
    expect(result).toEqual(SAMPLE_PRODUCTS);
  });

  it('es case-insensitive con categorías en mayúsculas', () => {
    const result = filterByCategories(SAMPLE_PRODUCTS, ['REMERA', 'BUZO']);
    expect(result).toHaveLength(3);
  });

  it('es case-insensitive con categorías mixtas', () => {
    const result = filterByCategories(SAMPLE_PRODUCTS, ['ReMeRa']);
    expect(result).toHaveLength(2);
  });

  it('devuelve array vacío si ninguna categoría coincide', () => {
    const result = filterByCategories(SAMPLE_PRODUCTS, ['vinilo']);
    expect(result).toEqual([]);
  });

  it('soporta el campo alternativo "category" si no existe "categoria"', () => {
    const productsWithCategory = [
      { id: 5, nombre: 'Vinilo Queen', category: 'vinilo' },
      { id: 6, nombre: 'Remera Queen', category: 'remera' },
    ];
    const result = filterByCategories(productsWithCategory, ['remera']);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(6);
  });

  it('soporta el campo alternativo "tipo" si no existe "categoria" ni "category"', () => {
    const productsWithTipo = [
      { id: 7, nombre: 'Buzo Queen', tipo: 'buzo' },
      { id: 8, nombre: 'Gorra Queen', tipo: 'accesorio' },
    ];
    const result = filterByCategories(productsWithTipo, ['buzo']);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(7);
  });
});

describe('filterByMaxPrice', () => {
  it('filtra productos con precio menor o igual al límite', () => {
    const result = filterByMaxPrice(SAMPLE_PRODUCTS, 4000);
    expect(result).toHaveLength(2);
    expect(result.every(p => p.precio <= 4000)).toBe(true);
    expect(result.map(p => p.id)).toEqual([1, 3]);
  });

  it('filtra con precio límite exacto', () => {
    const result = filterByMaxPrice(SAMPLE_PRODUCTS, 4500);
    expect(result).toHaveLength(3);
    expect(result.find(p => p.id === 4)?.precio).toBe(4500);
  });

  it('devuelve array vacío si ningún producto está dentro del precio', () => {
    const result = filterByMaxPrice(SAMPLE_PRODUCTS, 500);
    expect(result).toEqual([]);
  });

  it('devuelve todos los productos si maxPrice es null', () => {
    const result = filterByMaxPrice(SAMPLE_PRODUCTS, null);
    expect(result).toEqual(SAMPLE_PRODUCTS);
  });
});

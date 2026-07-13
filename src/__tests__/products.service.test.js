/**
 * Tests de caracterización: ProductsService
 *
 * Describe el comportamiento ACTUAL de products.service.js
 * sin modificar el código fuente.
 *
 * Comportamiento actual:
 * - `fetchProducts` devuelve array vacío si falla el fetch
 * - `filterByCategory` filtra por `p.categoria` o `p.category`
 * - `searchByName` busca por `p.nombre` o `p.name`, case-insensitive
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Cargamos el script (IIFE) que expone window.ProductsService
// Al importarlo, el IIFE se ejecuta y setea window.ProductsService
import '../../src/components/products.service.js';

const SAMPLE_PRODUCTS = [
  { id: 1, nombre: 'Remera The Beatles', categoria: 'remera', precio: 4000 },
  { id: 2, nombre: 'Buzo AC/DC', categoria: 'buzo', precio: 5000 },
  { id: 3, nombre: 'Gorra Nirvana', categoria: 'accesorio', precio: 1500 },
  { id: 4, nombre: 'Remera Pink Floyd', categoria: 'remera', precio: 4500 },
];

describe('ProductsService.fetchProducts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('devuelve el array de productos cuando el fetch es exitoso', async () => {
    const mockData = [{ id: 1, nombre: 'Test' }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await window.ProductsService.fetchProducts('/data/test.json');
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith('/data/test.json');
  });

  it('devuelve array vacío si el fetch falla con HTTP error', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });
    // El console.error se dispara internamente; lo silenciamos
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await window.ProductsService.fetchProducts('/data/missing.json');
    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('devuelve array vacío si el fetch lanza una excepción de red', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await window.ProductsService.fetchProducts('/data/fail.json');
    expect(result).toEqual([]);

    consoleSpy.mockRestore();
  });
});

describe('ProductsService.filterByCategory', () => {
  it('filtra productos por categoría exacta (case-insensitive)', () => {
    const result = window.ProductsService.filterByCategory(SAMPLE_PRODUCTS, 'remera');
    expect(result).toHaveLength(2);
    expect(result.every(p => p.categoria === 'remera')).toBe(true);
  });

  it('filtra sin distinguir mayúsculas/minúsculas', () => {
    const result = window.ProductsService.filterByCategory(SAMPLE_PRODUCTS, 'REMERA');
    expect(result).toHaveLength(2);
  });

  it('devuelve array vacío si no hay productos que coincidan', () => {
    const result = window.ProductsService.filterByCategory(SAMPLE_PRODUCTS, 'vinilo');
    expect(result).toEqual([]);
  });

  it('devuelve todos los productos si category es falsy', () => {
    const result1 = window.ProductsService.filterByCategory(SAMPLE_PRODUCTS, '');
    expect(result1).toEqual(SAMPLE_PRODUCTS);

    const result2 = window.ProductsService.filterByCategory(SAMPLE_PRODUCTS, null);
    expect(result2).toEqual(SAMPLE_PRODUCTS);

    const result3 = window.ProductsService.filterByCategory(SAMPLE_PRODUCTS, undefined);
    expect(result3).toEqual(SAMPLE_PRODUCTS);
  });

  it('soporta el campo alternativo "category" si no existe "categoria"', () => {
    const productsWithCategory = [
      { id: 5, nombre: 'Test', category: 'vinilo' },
      { id: 6, nombre: 'Test2', category: 'remera' },
    ];
    const result = window.ProductsService.filterByCategory(productsWithCategory, 'vinilo');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(5);
  });
});

describe('ProductsService.searchByName', () => {
  it('busca productos por nombre sin distinguir mayúsculas', () => {
    const result = window.ProductsService.searchByName(SAMPLE_PRODUCTS, 'beatles');
    expect(result).toHaveLength(1);
    expect(result[0].nombre).toBe('Remera The Beatles');
  });

  it('busca con mayúsculas y encuentra igual', () => {
    const result = window.ProductsService.searchByName(SAMPLE_PRODUCTS, 'BEATLES');
    expect(result).toHaveLength(1);
  });

  it('busca con términos parciales', () => {
    const result = window.ProductsService.searchByName(SAMPLE_PRODUCTS, 'Remera');
    expect(result).toHaveLength(2);
  });

  it('devuelve array vacío si no hay coincidencias', () => {
    const result = window.ProductsService.searchByName(SAMPLE_PRODUCTS, 'ZZZZ');
    expect(result).toEqual([]);
  });

  it('devuelve todos los productos si el término es vacío', () => {
    const result = window.ProductsService.searchByName(SAMPLE_PRODUCTS, '');
    expect(result).toEqual(SAMPLE_PRODUCTS);
  });

  it('soporta el campo alternativo "name" si no existe "nombre"', () => {
    const productsWithName = [
      { id: 5, name: 'Vinilo Queen', precio: 3000 },
    ];
    const result = window.ProductsService.searchByName(productsWithName, 'queen');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(5);
  });
});

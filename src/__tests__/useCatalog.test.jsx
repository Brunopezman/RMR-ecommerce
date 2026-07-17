import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCatalog } from '../hooks/useCatalog';

const SAMPLE_PRODUCTS = [
  { id: 1, nombre: 'Remera The Beatles', categoria: 'remera', precio: 4000 },
  { id: 2, nombre: 'Buzo AC/DC', categoria: 'buzo', precio: 5000 },
  { id: 3, nombre: 'Gorra Nirvana', categoria: 'accesorio', precio: 1500 },
  { id: 4, nombre: 'Remera Pink Floyd', categoria: 'remera', precio: 4500 },
  { id: 5, nombre: 'Vaso Rolling Stones', categoria: 'vaso', precio: 2000 },
];

describe('useCatalog', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(SAMPLE_PRODUCTS),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('carga productos y retorna loading=false al completar', async () => {
    const { result } = renderHook(() => useCatalog('/api/test'));

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.products).toEqual([]);

    // Wait for load to finish
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.products).toHaveLength(5);
    expect(result.current.error).toBeNull();
  });

  it('filterByCategories actualiza los productos mostrados', async () => {
    const { result } = renderHook(() => useCatalog('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.filterByCategories(['remera']);
    });

    expect(result.current.products).toHaveLength(2);
    expect(result.current.products.every(p => p.categoria === 'remera')).toBe(true);
    expect(result.current.activeCategories).toEqual(['remera']);
  });

  it('filterByCategories con múltiples categorías', async () => {
    const { result } = renderHook(() => useCatalog('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.filterByCategories(['remera', 'buzo']);
    });

    expect(result.current.products).toHaveLength(3);
    expect(result.current.activeCategories).toEqual(['remera', 'buzo']);
  });

  it('filterByPrice con precio máximo filtra correctamente', async () => {
    const { result } = renderHook(() => useCatalog('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.filterByPrice(2000);
    });

    expect(result.current.products).toHaveLength(2);
    expect(result.current.products.every(p => p.precio <= 2000)).toBe(true);
    expect(result.current.activeMaxPrice).toBe(2000);
  });

  it('filterByPrice con null muestra todos los productos', async () => {
    const { result } = renderHook(() => useCatalog('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // First apply a filter
    act(() => {
      result.current.filterByPrice(2000);
    });
    expect(result.current.products).toHaveLength(2);

    // Then reset
    act(() => {
      result.current.filterByPrice(null);
    });
    expect(result.current.products).toHaveLength(5);
    expect(result.current.activeMaxPrice).toBeNull();
  });

  it('filterByCategories([]) + filterByPrice(null) resetea todos los filtros', async () => {
    const { result } = renderHook(() => useCatalog('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Apply both filters
    act(() => {
      result.current.filterByCategories(['remera']);
      result.current.filterByPrice(2000);
    });

    // Both active => only products that are remera AND <= 2000
    // remera products: id=1 (4000), id=4 (4500) — none ≤ 2000
    expect(result.current.products).toHaveLength(0);

    // Reset both
    act(() => {
      result.current.filterByCategories([]);
      result.current.filterByPrice(null);
    });

    expect(result.current.products).toHaveLength(5);
    expect(result.current.activeCategories).toEqual([]);
    expect(result.current.activeMaxPrice).toBeNull();
  });

  it('combina filtros de categoría y precio correctamente', async () => {
    const { result } = renderHook(() => useCatalog('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Filter: accesorio (id=3, 1500) + maxPrice 2000
    act(() => {
      result.current.filterByCategories(['accesorio']);
      result.current.filterByPrice(2000);
    });

    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].id).toBe(3);

    // Now widen price to 5000, should still only be accesorio products
    act(() => {
      result.current.filterByPrice(5000);
    });

    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].id).toBe(3);
  });

  it('filterByCategory (single) mantiene retrocompatibilidad', async () => {
    const { result } = renderHook(() => useCatalog('/api/test'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.filterByCategory('buzo');
    });

    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].id).toBe(2);
    expect(result.current.activeCategories).toEqual(['buzo']);
  });

  it('setea error si el array de productos está vacío', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const { result } = renderHook(() => useCatalog('/api/empty'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('No se pudieron cargar los productos.');
    expect(result.current.products).toEqual([]);
  });
});

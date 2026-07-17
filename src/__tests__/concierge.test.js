import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { searchByName, buildIndex, clearIndex } from '../services/productSearch';
import { useConcierge } from '../hooks/useConcierge';

// ─── Sample products (subset of data/db.json) ────────────────────────
const PRODUCTS = [
  { id: 1, nombre: 'Remera The Beatles', tipo: 'remera', precio: 4000, descripcion: 'The Beatles - negra - lisa' },
  { id: 2, nombre: 'Remera AC/DC', tipo: 'remera', precio: 4000, descripcion: 'AC/DC - Negra - lisa' },
  { id: 12, nombre: 'Buzo AC/DC', tipo: 'buzo', precio: 4000, descripcion: 'AC/DC - negro - liso' },
  { id: 14, nombre: 'Gorra Nirvana', tipo: 'accesorio', precio: 1500, descripcion: 'Nirvana - blanco - estampado' },
];

// ──────────────────────────────────────────────────────────────────────
//  searchByName (productSearch.ts)
// ──────────────────────────────────────────────────────────────────────
describe('searchByName (productSearch.ts)', () => {
  it('encuentra producto por nombre exacto (case-insensitive)', () => {
    const result = searchByName('Remera AC/DC', PRODUCTS);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('encuentra producto con nombre en minúsculas', () => {
    const result = searchByName('remera ac/dc', PRODUCTS);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('token-level fallback: filtra ruido "al carrito", encuentra por token "ac/dc"', () => {
    const result = searchByName('ac/dc al carrito', PRODUCTS);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some(p => p.id === 2)).toBe(true);
  });

  it('token-level fallback: encuentra por token individual cuando la query completa no coincide', () => {
    const result = searchByName('remera acdc', PRODUCTS);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some(p => p.id === 2)).toBe(true);
  });

  it('devuelve vacío si no hay coincidencias incluso token-level', () => {
    const result = searchByName('producto inexistente', PRODUCTS);
    expect(result).toEqual([]);
  });

  it('devuelve vacío para query con un solo token que no coincide', () => {
    const result = searchByName('zzzzz', PRODUCTS);
    expect(result).toEqual([]);
  });
});

// ──────────────────────────────────────────────────────────────────────
//  useConcierge — parseIntent (tested via sendMessage with mocked addToCart)
// ──────────────────────────────────────────────────────────────────────
describe('useConcierge — addToCart flow', () => {
  let addToCartMock;
  let consoleWarnSpy;

  beforeEach(() => {
    addToCartMock = vi.fn();

    // Suppress console.warn from safety net
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Use fake timers to control setTimeout-based state updates
    // (typing delay in sendMessage, safety net, abort timeout).
    vi.useFakeTimers();

    // Mock fetch: first call (API, port 4000) fails; second call (fallback /data/db.json) succeeds
    let callCount = 0;
    global.fetch = vi.fn().mockImplementation((url) => {
      callCount++;
      if (callCount === 1 && url === 'http://localhost:4000/products') {
        return Promise.reject(new Error('Connection refused'));
      }
      if (url === '/data/db.json') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ products: PRODUCTS }),
        });
      }
      return Promise.reject(new Error(`Unknown URL: ${url}`));
    });
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    vi.restoreAllMocks();
    vi.useRealTimers();
    clearIndex();
  });

  /**
   * Helper: advance fake timers by ms milliseconds inside act().
   * This fires any due timers and drains the microtask queue (promises),
   * ensuring all async state updates happen inside act().
   */
  async function advanceTimersInsideAct(ms = 100) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(ms);
    });
  }

  it('carga el catálogo desde el fallback /data/db.json cuando la API falla', async () => {
    const { result } = renderHook(() => useConcierge(addToCartMock));

    // Advance timers to drain microtasks from the mocked fetch chain;
    // the promise rejections/resolutions from fetch occur as microtasks,
    // and vi.advanceTimersByTimeAsync processes them inside act().
    await advanceTimersInsideAct(100);

    expect(result.current.catalogLoaded).toBe(true);
    expect(result.current.products.length).toBeGreaterThan(0);
  });

  it('sendMessage con "agregá Remera AC/DC al carrito" llama a addToCart con el producto correcto', async () => {
    const { result } = renderHook(() => useConcierge(addToCartMock));

    // Wait for catalog to load
    await advanceTimersInsideAct(100);
    expect(result.current.catalogLoaded).toBe(true);

    // sendMessage is synchronous for the initial state updates (user message, isTyping)
    act(() => {
      result.current.sendMessage('agregá Remera AC/DC al carrito');
    });

    // Advance past the 600ms typing delay so the timeout callback fires inside act()
    await advanceTimersInsideAct(700);

    expect(addToCartMock).toHaveBeenCalled();

    // Verify the correct product was added
    expect(addToCartMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 2, nombre: 'Remera AC/DC' }),
    );
  });

  it('sendMessage con "agregá Buzo AC/DC" (sin "al carrito") llama a addToCart correctamente', async () => {
    const { result } = renderHook(() => useConcierge(addToCartMock));

    await advanceTimersInsideAct(100);
    expect(result.current.catalogLoaded).toBe(true);

    act(() => {
      result.current.sendMessage('agregá Buzo AC/DC');
    });

    await advanceTimersInsideAct(700);

    expect(addToCartMock).toHaveBeenCalled();

    expect(addToCartMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 12, nombre: 'Buzo AC/DC' }),
    );
  });

  it('sendMessage con producto inexistente muestra mensaje de error, no llama addToCart', async () => {
    const { result } = renderHook(() => useConcierge(addToCartMock));

    await advanceTimersInsideAct(100);
    expect(result.current.catalogLoaded).toBe(true);

    act(() => {
      result.current.sendMessage('agregá Producto Inexistente X al carrito');
    });

    // Advance past the 600ms typing delay
    await advanceTimersInsideAct(700);

    expect(addToCartMock).not.toHaveBeenCalled();

    // The last message should be the error
    const lastMsg = result.current.messages[result.current.messages.length - 1];
    expect(lastMsg.role).toBe('assistant');
    expect(lastMsg.text).toContain('No encontré');
  });

  it('recibe mensaje de bienvenida al abrir el chat después de cargar catálogo', async () => {
    const { result } = renderHook(() => useConcierge(addToCartMock));

    await advanceTimersInsideAct(100);
    expect(result.current.catalogLoaded).toBe(true);

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.messages.length).toBeGreaterThanOrEqual(1);
    expect(result.current.messages[0].text).toContain('Bienvenido');
  });
});

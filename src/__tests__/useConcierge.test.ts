/**
 * Tests for useConcierge — hook del chatbot de ventas.
 *
 * Covers: parseIntent, formatSearchResponse (exportadas),
 * y el hook en sí (toggle, isOpen).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { parseIntent, formatSearchResponse, parseTalle, useConcierge } from '../hooks/useConcierge';
import type { Product } from '../types/product';

// ──────────────────────────────────────────────
//  Mock data
// ──────────────────────────────────────────────

const mockProducts: Product[] = [
  { id: 1, nombre: 'Remera The Beatles', tipo: 'remera', img: '/img/remera.jpg', descripcion: 'The Beatles - negra', precio: 4000, tallesDisponibles: ['S', 'M', 'L', 'XL'] },
  { id: 2, nombre: 'Buzo Nirvana', tipo: 'buzo', img: '/img/buzo.jpg', descripcion: 'Nirvana - hoodie', precio: 8000, tallesDisponibles: ['M', 'L', 'XL'] },
  { id: 3, nombre: 'Gorra Metallica', tipo: 'accesorio', img: '/img/gorra.jpg', descripcion: 'Metallica - snapback', precio: 2500 },
  { id: 4, nombre: 'Remera AC/DC', tipo: 'remera', img: '/img/remera-acdc.jpg', descripcion: 'AC/DC - azul', precio: 4500, tallesDisponibles: ['S', 'M', 'L'] },
  { id: 5, nombre: 'Vaso Rock', tipo: 'vaso', img: '/img/vaso.jpg', descripcion: 'Vaso de vidrio', precio: 1500 },
];

// We also need to mock the productService URL so the hook doesn't make real calls
vi.mock('../services/productService', () => ({
  PRODUCTS_API_URL: 'http://test.local/products',
}));

// ──────────────────────────────────────────────
//  parseIntent
// ──────────────────────────────────────────────

describe('parseIntent', () => {
  it('reconoce saludo como action greeting', () => {
    const result = parseIntent('hola');
    expect(result.action).toBe('greeting');
  });

  it('reconoce "ayuda" como action help', () => {
    const result = parseIntent('ayuda');
    expect(result.action).toBe('help');
  });

  it('reconoce "qué podés hacer" como help', () => {
    const result = parseIntent('qué puedes hacer');
    expect(result.action).toBe('help');
  });

  it('reconoce patrón "agregá X" como add_to_cart', () => {
    const result = parseIntent('agregá Remera AC/DC');
    expect(result.action).toBe('add_to_cart');
    // productName is lowercased because parseIntent lowercases the input
    expect(result.productName).toBe('remera ac/dc');
  });

  it('reconoce "comprá X" como add_to_cart', () => {
    const result = parseIntent('comprá Buzo Nirvana');
    expect(result.action).toBe('add_to_cart');
    // productName is lowercased because parseIntent lowercases the input
    expect(result.productName).toBe('buzo nirvana');
  });

  it('extrae maxPrice de "$5000"', () => {
    const result = parseIntent('remeras por menos de 5000');
    expect(result.maxPrice).toBe(5000);
  });

  it('extrae maxPrice de "máximo 4000"', () => {
    const result = parseIntent('buzos máximo 4000');
    expect(result.maxPrice).toBe(4000);
  });

  it('extrae categoría remera de texto con "remeras"', () => {
    const result = parseIntent('remeras de rock');
    expect(result.category).toBe('remera');
  });

  it('extrae categoría buzo de texto con "buzos"', () => {
    const result = parseIntent('buzos');
    expect(result.category).toBe('buzo');
  });

  it('extrae categoría accesorio de "gorras"', () => {
    const result = parseIntent('gorras');
    expect(result.category).toBe('accesorio');
  });

  it('extrae categoría vaso de texto con "taza"', () => {
    const result = parseIntent('tazas personalizadas');
    expect(result.category).toBe('vaso');
  });

  it('combina maxPrice y category correctamente', () => {
    const result = parseIntent('remeras por menos de 5000');
    expect(result.action).toBe('search');
    expect(result.maxPrice).toBe(5000);
    expect(result.category).toBe('remera');
  });

  it('fallback a action search y query genérica si no hay intención clara', () => {
    const result = parseIntent('algo barato');
    expect(result.action).toBe('search');
    expect(result.query.length).toBeGreaterThan(0);
  });
});

// ──────────────────────────────────────────────
//  formatSearchResponse
// ──────────────────────────────────────────────

describe('formatSearchResponse', () => {
  it('genera mensaje con productos cuando hay resultados', () => {
    const results = [
      { product: mockProducts[0], score: 0.9 },
      { product: mockProducts[3], score: 0.7 },
    ];
    const intent = { query: 'remera', action: 'search' as const };
    const response = formatSearchResponse(results, intent);

    expect(response.text).toContain('Te recomiendo estos productos');
    expect(response.text).toContain('Remera The Beatles');
    expect(response.text).toContain('$4000');
    expect(response.products.length).toBe(2);
  });

  it('genera mensaje de "no encontré" cuando no hay resultados', () => {
    const results: Array<{ product: Product; score: number }> = [];
    const intent = { query: 'algo raro', action: 'search' as const };
    const response = formatSearchResponse(results, intent);

    expect(response.text).toContain('No encontré productos');
    expect(response.products).toEqual([]);
  });

  it('incluye el precio máximo en el mensaje cuando hay maxPrice y categoría', () => {
    const results = [
      { product: mockProducts[0], score: 0.8 },
    ];
    const intent = { query: 'remera', maxPrice: 5000, category: 'remera', action: 'search' as const };
    const response = formatSearchResponse(results, intent);

    expect(response.text).toContain('por hasta $5000');
    expect(response.text).toContain('remeras');
  });

  it('incluye mensaje de categoría cuando solo hay category', () => {
    const results = [
      { product: mockProducts[1], score: 0.9 },
    ];
    const intent = { query: 'buzo', category: 'buzo', action: 'search' as const };
    const response = formatSearchResponse(results, intent);

    expect(response.text).toContain('buzos disponibles');
  });

  it('incluye mensaje de precio cuando solo hay maxPrice', () => {
    const results = [
      { product: mockProducts[0], score: 0.8 },
    ];
    const intent = { query: 'remera', maxPrice: 5000, action: 'search' as const };
    const response = formatSearchResponse(results, intent);

    expect(response.text).toContain('por hasta $5000');
  });

  it('genera mensaje personalizado cuando no hay resultados con category', () => {
    const results: Array<{ product: Product; score: number }> = [];
    const intent = { query: 'buzo', category: 'buzo', action: 'search' as const };
    const response = formatSearchResponse(results, intent);

    expect(response.text).toContain('No tenemos buzos en este momento');
  });

  it('genera mensaje personalizado cuando no hay resultados con maxPrice y category', () => {
    const results: Array<{ product: Product; score: number }> = [];
    const intent = { query: 'remera', maxPrice: 3000, category: 'remera', action: 'search' as const };
    const response = formatSearchResponse(results, intent);

    expect(response.text).toContain('No hay remeras por menos de $3000');
  });
});

// ──────────────────────────────────────────────
//  parseTalle (re-test to ensure cohesión)
// ──────────────────────────────────────────────

describe('parseTalle (re-export consistency)', () => {
  it('parsea "M" como "M"', () => {
    expect(parseTalle('M')).toBe('M');
  });

  it('parsea "mediano" como "M"', () => {
    expect(parseTalle('mediano')).toBe('M');
  });

  it('devuelve null para "XXL"', () => {
    expect(parseTalle('XXL')).toBeNull();
  });

  it('devuelve null para string vacío', () => {
    expect(parseTalle('')).toBeNull();
  });
});

// ──────────────────────────────────────────────
//  Hook (useConcierge)
// ──────────────────────────────────────────────

describe('useConcierge hook', () => {
  const mockAddToCart = vi.fn();
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    // Mock fetch to return products synchronously (well, via promise)
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve(mockProducts),
    };
    global.fetch = vi.fn(() => Promise.resolve(mockResponse)) as unknown as typeof global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('toggle cambia isOpen de false a true', async () => {
    const { result } = renderHook(() => useConcierge(mockAddToCart));

    // Wait for the catalog to load
    await vi.waitFor(
      () => {
        expect(result.current.catalogLoaded).toBe(true);
      },
      { timeout: 2000 },
    );

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('toggle cambia isOpen de true a false', async () => {
    const { result } = renderHook(() => useConcierge(mockAddToCart));

    await vi.waitFor(
      () => {
        expect(result.current.catalogLoaded).toBe(true);
      },
      { timeout: 2000 },
    );

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('envía un mensaje y agrega al historial', async () => {
    const { result } = renderHook(() => useConcierge(mockAddToCart));

    await vi.waitFor(
      () => {
        expect(result.current.catalogLoaded).toBe(true);
      },
      { timeout: 2000 },
    );

    act(() => {
      result.current.sendMessage('hola');
    });

    // After sending, the user message should be added immediately
    expect(result.current.messages.length).toBe(1);
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[0].text).toBe('hola');

    // Wait for the typing delay + response
    await vi.waitFor(
      () => {
        expect(result.current.messages.length).toBeGreaterThanOrEqual(2);
      },
      { timeout: 2000 },
    );

    // The response should be from the assistant
    const lastMsg = result.current.messages[result.current.messages.length - 1];
    expect(lastMsg.role).toBe('assistant');
    expect(lastMsg.text).toBeTruthy();
  });
});

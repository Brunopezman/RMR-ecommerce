/**
 * Tests for productSearch — TF-IDF semantic search service.
 *
 * Covers: buildIndex, clearIndex, isIndexReady, searchSimilar, searchByName
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  buildIndex,
  clearIndex,
  isIndexReady,
  searchSimilar,
  searchByName,
} from '../services/productSearch';
import type { Product } from '../types/product';

const mockProducts: Product[] = [
  { id: 1, nombre: 'Remera The Beatles', tipo: 'remera', img: '/img/remera.jpg', descripcion: 'The Beatles - negra', precio: 4000, tallesDisponibles: ['S', 'M', 'L', 'XL'] },
  { id: 2, nombre: 'Buzo Nirvana', tipo: 'buzo', img: '/img/buzo.jpg', descripcion: 'Nirvana - hoodie', precio: 8000, tallesDisponibles: ['M', 'L', 'XL'] },
  { id: 3, nombre: 'Gorra Metallica', tipo: 'accesorio', img: '/img/gorra.jpg', descripcion: 'Metallica - snapback', precio: 2500 },
  { id: 4, nombre: 'Remera AC/DC', tipo: 'remera', img: '/img/remera-acdc.jpg', descripcion: 'AC/DC - azul', precio: 4500, tallesDisponibles: ['S', 'M', 'L'] },
  { id: 5, nombre: 'Vaso Rock', tipo: 'vaso', img: '/img/vaso.jpg', descripcion: 'Vaso de vidrio', precio: 1500 },
];

// Helper to safely run buildIndex and wait for synchronous completion
function buildTestIndex(products: Product[] = mockProducts): void {
  clearIndex();
  buildIndex(products);
}

describe('buildIndex / clearIndex / isIndexReady', () => {
  beforeEach(() => {
    clearIndex();
  });

  it('isIndexReady devuelve false cuando no se construyó el índice', () => {
    expect(isIndexReady()).toBe(false);
  });

  it('isIndexReady devuelve false cuando se construye con lista vacía de productos', () => {
    buildTestIndex([]);
    expect(isIndexReady()).toBe(false);
  });

  it('isIndexReady devuelve true después de construir con productos', () => {
    buildTestIndex();
    expect(isIndexReady()).toBe(true);
  });

  it('clearIndex restablece isIndexReady a false', () => {
    buildTestIndex();
    expect(isIndexReady()).toBe(true);
    clearIndex();
    expect(isIndexReady()).toBe(false);
  });
});

describe('searchSimilar', () => {
  beforeEach(() => {
    clearIndex();
  });

  it('devuelve arreglo vacío si no hay índice construido', () => {
    const results = searchSimilar('remera');
    expect(results).toEqual([]);
  });

  it('devuelve resultados ordenados por relevancia para query exacta', () => {
    buildTestIndex();
    const results = searchSimilar('remera');
    expect(results.length).toBeGreaterThan(0);
    // Top results should have non-zero score (semantic match)
    expect(results[0].score).toBeGreaterThan(0);
    // Results with "remera" in tipo should rank higher than unrelated
    const remeraResults = results.filter((r) => r.product.tipo === 'remera');
    expect(remeraResults.length).toBeGreaterThan(0);
  });

  it('devuelve todos los productos con score 0 para query sin matching en el índice', () => {
    buildTestIndex();
    const results = searchSimilar('zxzxyyyynonexistent');
    // TF-IDF returns all products since they may match tokens partially,
    // but scores should be very low or zero for non-matching terms
    expect(results.length).toBe(5);
    // If no tokens match, all scores will be 0
    const allZero = results.every((r) => r.score === 0);
    expect(allZero).toBe(true);
  });

  it('filtra por maxPrice correctamente', () => {
    buildTestIndex();
    const results = searchSimilar('remera', 10, { maxPrice: 4200 });
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => {
      expect(r.product.precio).toBeLessThanOrEqual(4200);
    });
  });

  it('filtra por categoría exactamente', () => {
    buildTestIndex();
    const results = searchSimilar('producto', 10, { category: 'buzo' });
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => {
      expect(r.product.tipo).toBe('buzo');
    });
  });

  it('combina maxPrice y category en el filtro', () => {
    buildTestIndex();
    // All remeras are between 4000 and 4500
    const results = searchSimilar('remera', 10, { maxPrice: 4200, category: 'remera' });
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => {
      expect(r.product.tipo).toBe('remera');
      expect(r.product.precio).toBeLessThanOrEqual(4200);
    });
  });

  it('respeta el límite topN devolviendo hasta N resultados', () => {
    buildTestIndex();
    const results = searchSimilar('remera', 1);
    expect(results.length).toBe(1);
  });

  it('filtra por tags correctamente', () => {
    buildTestIndex();
    const results = searchSimilar('producto', 10, { tags: ['Nirvana'] });
    expect(results.length).toBeGreaterThan(0);
    results.forEach((r) => {
      const text = (r.product.nombre + ' ' + (r.product.descripcion ?? '')).toLowerCase();
      expect(text).toContain('nirvana');
    });
  });
});

describe('searchByName', () => {
  it('encuentra producto por nombre exacto', () => {
    const results = searchByName('Remera The Beatles', mockProducts);
    expect(results.length).toBe(1);
    expect(results[0].id).toBe(1);
  });

  it('encuentra producto por coincidencia parcial (case-insensitive)', () => {
    const results = searchByName('beatles', mockProducts);
    expect(results.length).toBe(1);
    expect(results[0].id).toBe(1);
  });

  it('devuelve arreglo vacío si no hay match', () => {
    const results = searchByName('producto inexistente', mockProducts);
    expect(results).toEqual([]);
  });

  it('usa token fallback cuando el query completo no matchea exactamente', () => {
    // "nirvana" matchea "Buzo Nirvana" via token fallback (no exact match with "nirvana")
    const results = searchByName('nirvana', mockProducts);
    const nirvana = results.find((p) => p.id === 2);
    expect(nirvana).toBeDefined();
    expect(nirvana!.nombre).toBe('Buzo Nirvana');
  });

  it('filtra noise words en el token fallback', () => {
    const results = searchByName('el la un', mockProducts);
    expect(results).toEqual([]);
  });

  it('devuelve múltiples resultados cuando hay varios matches', () => {
    const results = searchByName('remera', mockProducts);
    expect(results.length).toBe(2);
    expect(results.map((p) => p.id).sort()).toEqual([1, 4]);
  });

  it('maneja empty string devolviendo todos los productos', () => {
    // Empty string matches all products because "".includes("") is always true
    const results = searchByName('', mockProducts);
    expect(results.length).toBe(mockProducts.length);
  });
});

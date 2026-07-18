import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseTalle } from '../hooks/useConcierge';

// ──────────────────────────────────────────────
//  parseTalle
// ──────────────────────────────────────────────

describe('parseTalle', () => {
  it('parsea "M" como "M"', () => {
    expect(parseTalle('M')).toBe('M');
  });

  it('parsea "mediano" como "M"', () => {
    expect(parseTalle('mediano')).toBe('M');
  });

  it('parsea "mediana" como "M"', () => {
    expect(parseTalle('mediana')).toBe('M');
  });

  it('parsea "talle M" como "M"', () => {
    expect(parseTalle('talle M')).toBe('M');
  });

  it('parsea "talla m" como "M"', () => {
    expect(parseTalle('talla m')).toBe('M');
  });

  it('parsea "medida L" como "L"', () => {
    expect(parseTalle('medida L')).toBe('L');
  });

  it('parsea "grande" como "L"', () => {
    expect(parseTalle('grande')).toBe('L');
  });

  it('parsea "S" como "S"', () => {
    expect(parseTalle('S')).toBe('S');
  });

  it('parsea "chico" como "S"', () => {
    expect(parseTalle('chico')).toBe('S');
  });

  it('parsea "pequeño" como "S"', () => {
    expect(parseTalle('pequeño')).toBe('S');
  });

  it('parsea "XL" como "XL"', () => {
    expect(parseTalle('XL')).toBe('XL');
  });

  it('parsea "extra grande" como "XL"', () => {
    expect(parseTalle('extra grande')).toBe('XL');
  });

  it('parsea "quiero M" como "M"', () => {
    expect(parseTalle('quiero M')).toBe('M');
  });

  it('parsea "quisiera el grande" como "L"', () => {
    expect(parseTalle('quisiera el grande')).toBe('L');
  });

  it('devuelve null para "XXL"', () => {
    expect(parseTalle('XXL')).toBeNull();
  });

  it('devuelve null para "talle único"', () => {
    expect(parseTalle('talle único')).toBeNull();
  });

  it('devuelve null para saludo', () => {
    expect(parseTalle('hola')).toBeNull();
  });

  it('devuelve null para string vacío', () => {
    expect(parseTalle('')).toBeNull();
  });
});

// ──────────────────────────────────────────────
//  looksLikeSizeResponse-derived scenarios
// ──────────────────────────────────────────────

describe('parseTalle integration — tamaño inválido en contexto de talles disponibles', () => {
  const TALLES_DISPONIBLES = ['S', 'M', 'L', 'XL'];

  it('"XXL" no está en talles disponibles', () => {
    const talle = parseTalle('XXL');
    expect(talle).toBeNull();
    if (talle) {
      expect(TALLES_DISPONIBLES).toContain(talle);
    }
  });

  it('"XS" no está en talles disponibles', () => {
    const talle = parseTalle('XS');
    expect(talle).toBeNull();
  });

  it('producto con ["Único"] se considera talle único (parseTalle devuelve null)', () => {
    const talle = parseTalle('único');
    // "único" is not in the size map, should be null
    expect(talle).toBeNull();
  });
});

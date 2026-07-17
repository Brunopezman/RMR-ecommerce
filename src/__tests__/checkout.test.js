import { describe, it, expect } from 'vitest';
import {
  detectCardType,
  validarLuhn,
  formatearNumeroTarjeta,
  calcularTotalConInteres,
  calcularEnvio,
  calcularResumen,
} from '../services/checkoutService';

describe('detectCardType', () => {
  it('reconoce VISA (16 dígitos empezando con 4)', () => {
    expect(detectCardType('4111111111111111')).toBe('VISA');
  });

  it('reconoce Mastercard (16 dígitos empezando con 51-55)', () => {
    expect(detectCardType('5111111111111111')).toBe('MASTERCARD');
    expect(detectCardType('5211111111111111')).toBe('MASTERCARD');
    expect(detectCardType('5511111111111111')).toBe('MASTERCARD');
    expect(detectCardType('5555555555554444')).toBe('MASTERCARD');
  });

  it('reconoce American Express (15 dígitos empezando con 34 o 37)', () => {
    expect(detectCardType('341111111111111')).toBe('AMERICAN EXPRESS');
    expect(detectCardType('371111111111111')).toBe('AMERICAN EXPRESS');
  });

  it('devuelve null para número demasiado corto', () => {
    expect(detectCardType('1234')).toBeNull();
  });

  it('devuelve null para número con formato incorrecto', () => {
    expect(detectCardType('6011111111111117')).toBeNull();
  });
});

describe('validarLuhn', () => {
  it('pasa para VISA válida (4111111111111111)', () => {
    expect(validarLuhn('4111111111111111')).toBe(true);
  });

  it('pasa para Mastercard válida (5555555555554444)', () => {
    expect(validarLuhn('5555555555554444')).toBe(true);
  });

  it('falla para VISA con Luhn inválido', () => {
    expect(validarLuhn('4111111111111112')).toBe(false);
  });

  it('falla para Amex con Luhn inválido', () => {
    expect(validarLuhn('370000000000000')).toBe(false);
  });

  it('pasa para string vacío (suma=0, divisible por 10)', () => {
    expect(validarLuhn('')).toBe(true);
  });

  it('falla para string con caracteres no numéricos', () => {
    expect(validarLuhn('4111-1111-1111-1111')).toBe(false);
  });
});

describe('formatearNumeroTarjeta', () => {
  it('formatea VISA en grupos de 4', () => {
    expect(formatearNumeroTarjeta('4111111111111111', 'VISA')).toBe('4111 1111 1111 1111');
  });

  it('formatea Mastercard en grupos de 4', () => {
    expect(formatearNumeroTarjeta('5555555555554444', 'MASTERCARD')).toBe('5555 5555 5555 4444');
  });

  it('formatea American Express en grupos 4-6-5', () => {
    expect(formatearNumeroTarjeta('341111111111111', 'AMERICAN EXPRESS')).toBe('3411 111111 11111');
  });
});

describe('calcularTotalConInteres', () => {
  it('1 cuota: sin interés', () => {
    expect(calcularTotalConInteres(10000, 1)).toBe(10000);
  });

  it('3 cuotas: 10% interés', () => {
    expect(calcularTotalConInteres(10000, 3)).toBe(11000);
  });

  it('6 cuotas: 15% interés', () => {
    expect(calcularTotalConInteres(10000, 6)).toBe(11500);
  });

  it('cuota desconocida: factor 1.0', () => {
    expect(calcularTotalConInteres(10000, 12)).toBe(10000);
  });
});

describe('calcularEnvio', () => {
  it('retiro en tienda: gratis', () => {
    const result = calcularEnvio(10000, 'tienda', 1, 0);
    expect(result.envioCost).toBe(0);
    expect(result.totalFinal).toBe(10000);
    expect(result.valorCuota).toBe(10000);
    expect(result.freeShipping).toBe(false);
  });

  it('envío estándar: $10000', () => {
    const result = calcularEnvio(10000, 'estandar', 1, 50000);
    expect(result.envioCost).toBe(10000);
    expect(result.totalFinal).toBe(20000);
    expect(result.valorCuota).toBe(20000);
    expect(result.freeShipping).toBe(false);
  });

  it('envío express: $18000', () => {
    const result = calcularEnvio(10000, 'express', 1, 50000);
    expect(result.envioCost).toBe(18000);
    expect(result.totalFinal).toBe(28000);
    expect(result.valorCuota).toBe(28000);
    expect(result.freeShipping).toBe(false);
  });

  it('divide totalFinal entre cantidad de cuotas', () => {
    const result = calcularEnvio(10000, 'tienda', 3, 0);
    expect(result.valorCuota).toBeCloseTo(3333.33, 2);
    expect(result.freeShipping).toBe(false);
  });

  it('envío gratis cuando totalBase >= 100000 (estándar)', () => {
    const result = calcularEnvio(120000, 'estandar', 1, 100000);
    expect(result.freeShipping).toBe(true);
    expect(result.envioCost).toBe(0);
    expect(result.totalFinal).toBe(120000);
  });

  it('envío gratis cuando totalBase >= 100000 (express)', () => {
    const result = calcularEnvio(150000, 'express', 3, 150000);
    expect(result.freeShipping).toBe(true);
    expect(result.envioCost).toBe(0);
    expect(result.totalFinal).toBe(150000);
  });

  it('NO hay envío gratis si totalBase < 100000', () => {
    const result = calcularEnvio(80000, 'estandar', 1, 99999);
    expect(result.freeShipping).toBe(false);
    expect(result.envioCost).toBe(10000);
    expect(result.totalFinal).toBe(90000);
  });

  it('envío gratis exactamente en el umbral de 100000', () => {
    const result = calcularEnvio(110000, 'estandar', 1, 100000);
    expect(result.freeShipping).toBe(true);
    expect(result.envioCost).toBe(0);
  });
});

describe('calcularResumen', () => {
  it('calcula ítems y total base', () => {
    const items = [
      { id: '1', nombre: 'Remera', precio: 4000, cantidad: 2 },
      { id: '2', nombre: 'Buzo', precio: 5000, cantidad: 1 },
    ];

    const result = calcularResumen(items);

    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toEqual({ name: 'Remera', quantity: 2, subtotal: 8000 });
    expect(result.items[1]).toEqual({ name: 'Buzo', quantity: 1, subtotal: 5000 });
    expect(result.totalBase).toBe(13000);
  });

  it('devuelve lista vacía y total 0 si no hay items', () => {
    const result = calcularResumen([]);
    expect(result.items).toEqual([]);
    expect(result.totalBase).toBe(0);
  });
});

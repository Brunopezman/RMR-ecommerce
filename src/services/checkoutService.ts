import type { CartItem } from '../types/cart';

export type CardBrand = 'VISA' | 'MASTERCARD' | 'AMERICAN EXPRESS' | null;

const INTEREST_RATES: Record<number, number> = {
  1: 1.0,
  3: 1.10,
  6: 1.15,
};

const SHIPPING_COSTS: Record<string, number> = {
  tienda: 0,
  estandar: 1500,
  express: 3000,
};

/**
 * Detect card brand from number prefix.
 */
export function detectCardType(numero: string): CardBrand {
  if (/^4\d{15}$/.test(numero)) return 'VISA';
  if (/^5[1-5]\d{14}$/.test(numero)) return 'MASTERCARD';
  if (/^(34|37)\d{13}$/.test(numero)) return 'AMERICAN EXPRESS';
  return null;
}

/**
 * Validate credit card number using Luhn algorithm.
 */
export function validarLuhn(numero: string): boolean {
  let suma = 0;
  let alternar = false;

  for (let i = numero.length - 1; i >= 0; i--) {
    let n = parseInt(numero[i], 10);
    if (isNaN(n)) return false;

    if (alternar) {
      n *= 2;
      if (n > 9) n -= 9;
    }

    suma += n;
    alternar = !alternar;
  }

  return suma % 10 === 0;
}

/**
 * Format card number with spaces for display.
 */
export function formatearNumeroTarjeta(
  numero: string,
  marca: CardBrand,
): string {
  if (marca === 'AMERICAN EXPRESS') {
    return numero
      .replace(/^(\d{4})(\d{6})(\d{0,5}).*/, '$1 $2 $3')
      .trim();
  }
  return numero.replace(/(\d{4})/g, '$1 ').trim();
}

/**
 * Calculate total with interest based on installment count.
 */
export function calcularTotalConInteres(
  totalBase: number,
  cuotas: number,
): number {
  const factor = INTEREST_RATES[cuotas] ?? 1.0;
  return totalBase * factor;
}

/**
 * Calculate installment value and total with shipping.
 */
export function calcularEnvio(
  baseWithInterest: number,
  shippingType: string,
  cuotas: number,
): { envioCost: number; totalFinal: number; valorCuota: number } {
  const envioCost = SHIPPING_COSTS[shippingType] ?? 0;
  const totalFinal = baseWithInterest + envioCost;
  const cuotasCount = cuotas || 1;
  const valorCuota = totalFinal / cuotasCount;

  return { envioCost, totalFinal, valorCuota };
}

/**
 * Calculate subtotal and total from cart items.
 */
export function calcularResumen(
  items: CartItem[],
): { items: Array<{ name: string; quantity: number; subtotal: number }>; totalBase: number } {
  let totalBase = 0;
  const itemsList = items.map((prod) => {
    const subtotal = prod.precio * prod.cantidad;
    totalBase += subtotal;
    return {
      name: prod.nombre,
      quantity: prod.cantidad,
      subtotal,
    };
  });
  return { items: itemsList, totalBase };
}

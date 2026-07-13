/**
 * Tests de caracterización: Checkout (checkout.js)
 *
 * IMPORTANTE: Las funciones `detectarTarjeta` y `validarLuhn` están
 * definidas dentro de un callback de DOMContentLoaded en checkout.js,
 * sin exposición global. Esto las hace inaccesibles para test unitario
 * directo.
 *
 * Estrategia: seteamos el DOM completo que checkout.js espera,
 * luego importamos el script (que registra el DOMContentLoaded listener),
 * disparamos DOMContentLoaded manualmente, y probamos las funciones a
 * través de los event handlers del DOM (input event en #cc-number).
 *
 * Comportamiento actual documentado:
 * - detectarTarjeta reconoce VISA (16 dígitos empezando con 4)
 * - detectarTarjeta reconoce Mastercard (16 dígitos empezando con 51-55)
 * - detectarTarjeta reconoce Amex (15 dígitos empezando con 34 o 37)
 * - detectarTarjeta devuelve null para números inválidos
 * - validarLuhn pasa para números que cumplen el algoritmo
 * - validarLuhn falla para números que no cumplen
 */

import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';

// ─── Setup DOM ────────────────────────────────────────────────────────────

function setupCheckoutDOM() {
  document.body.innerHTML = `
    <ul id="resumen-lista"></ul>
    <strong id="resumen-total">$0</strong>
    <select id="cuotas-select">
      <option value="1">1 cuota</option>
      <option value="3">3 cuotas</option>
      <option value="6">6 cuotas</option>
    </select>
    <p id="valor-cuota">$0</p>
    <form id="form-pago">
      <input type="text" id="cc-name" />
      <input type="text" id="cc-number" />
      <button type="submit">Pagar</button>
    </form>
    <div id="seccion-pago"></div>
    <div id="seccion-exito" style="display:none"></div>
    <span id="timer">15</span>
    <button id="btn-descargar-pdf"></button>
    <div id="tarjeta-resumen">—</div>
    <img id="logo-visa" class="d-none" />
    <img id="logo-mastercard" class="d-none" />
    <img id="logo-amex" class="d-none" />
    <select id="envio-select">
      <option value="0">Retiro en tienda</option>
      <option value="1500">Envío estándar</option>
      <option value="3000">Envío express</option>
    </select>
    <div id="contenedor-direccion" class="d-none">
      <input type="text" id="direccion-envio" />
    </div>
    <li id="resumen-envio">$0</li>
  `;
}

// Mock Toastify
globalThis.Toastify = vi.fn(() => ({
  showToast: vi.fn(),
}));

// Mock localStorage para checkout
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

// Mock jsPDF global (needed by checkout)
globalThis.jspdf = {
  jsPDF: vi.fn().mockReturnValue({
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    text: vi.fn(),
    save: vi.fn(),
    addPage: vi.fn(),
  }),
};

// Helper para disparar input en el campo de tarjeta
function cardInput(value) {
  const input = document.getElementById('cc-number');
  // Set value property and dispatch input event
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('Checkout - detectarTarjeta (vía DOM)', () => {
  beforeAll(async () => {
    setupCheckoutDOM();
    mockLocalStorage.setItem('carrito', JSON.stringify([
      { id: '1', nombre: 'Remera Test', precio: 1000, cantidad: 1 },
    ]));
    mockLocalStorage.setItem('userEmail', 'test@mail.com');

    // Importar checkout.js de forma dinámica
    await import('../../src/components/checkout.js');

    // Forzar DOMContentLoaded porque en jsdom ya se disparó antes del import
    document.dispatchEvent(new Event('DOMContentLoaded'));
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reconoce VISA (16 dígitos empezando con 4)', () => {
    cardInput('4111111111111111');

    const input = document.getElementById('cc-number');
    const logoVisa = document.getElementById('logo-visa');

    // Visa debe estar visible (clase activa agregada, d-none removido)
    const tieneClaseDNone = logoVisa.classList.contains('d-none');
    expect(tieneClaseDNone).toBe(false);
    expect(input.classList.contains('is-invalid')).toBe(false);
  });

  it('reconoce Mastercard (16 dígitos empezando con 51-55)', () => {
    // Usamos un número Mastercard válido que pasa Luhn
    cardInput('5555555555554444');

    const logoMaster = document.getElementById('logo-mastercard');
    expect(logoMaster.classList.contains('d-none')).toBe(false);
  });

  it('reconoce American Express (15 dígitos empezando con 34 o 37)', () => {
    cardInput('341111111111111');

    const logoAmex = document.getElementById('logo-amex');
    expect(logoAmex.classList.contains('d-none')).toBe(false);
  });

  it('marca inválido para número demasiado corto', () => {
    // Reset input state
    const input = document.getElementById('cc-number');
    input.value = '';
    input.classList.remove('is-invalid');

    cardInput('1234');

    expect(input.classList.contains('is-invalid')).toBe(true);
  });

  it('marca inválido para VISA que no pasa Luhn', () => {
    const input = document.getElementById('cc-number');
    input.value = '';
    input.classList.remove('is-invalid');

    // VISA pero último dígito alterado para que no pase Luhn
    cardInput('4111111111111112');

    expect(input.classList.contains('is-invalid')).toBe(true);
  });

  it('marca válido para Mastercard que pasa Luhn', () => {
    const input = document.getElementById('cc-number');
    input.value = '';
    input.classList.remove('is-invalid');

    // Mastercard de prueba válida
    cardInput('5555555555554444');

    expect(input.classList.contains('is-invalid')).toBe(false);
  });

  it('marca inválido para American Express que empieza bien pero falla Luhn', () => {
    const input = document.getElementById('cc-number');
    input.value = '';
    input.classList.remove('is-invalid');

    // Amex con Luhn inválido: 370000000000000 da suma 8 → 8%10≠0
    cardInput('370000000000000');

    expect(input.classList.contains('is-invalid')).toBe(true);
  });
});

/**
 * BLOQUEANTE: test unitario directo de detectarTarjeta y validarLuhn
 *
 * Estas funciones están definidas como `const` dentro del callback de
 * DOMContentLoaded de checkout.js, sin ser exportadas a `window` ni
 * a ningún objeto global. No es posible invocarlas directamente desde
 * un test unitario sin modificar el código fuente.
 *
 * Para migración a React: estas funciones deben extraerse a un módulo
 * independiente (ej: src/services/validators.js) y exportarse como
 * funciones puras.
 */

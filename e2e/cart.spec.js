/**
 * Tests e2e: Carrito de compras
 *
 * IMPORTANTE: Estos tests interactúan con el carrito desde la UI.
 * Dependen de que los productos se hayan cargado desde stock.json.
 */

import { test, expect } from '@playwright/test';

test.describe('Carrito de compras', () => {
  test('el contador del carrito muestra 0 inicialmente', async ({ page }) => {
    await page.goto('/');

    const contador = page.locator('#contador-carrito');
    await expect(contador).toHaveText('0');
  });

  test('agregar un producto al carrito actualiza el contador en shop.html', async ({ page }) => {
    await page.goto('/pages/shop.html');

    // Esperar a que los productos se carguen
    const buyButton = page.locator('.buy-btn').first();
    await expect(buyButton).toBeVisible({ timeout: 10000 });

    // Hacer click en el botón de compra del primer producto
    await buyButton.click();

    // El contador del carrito debería actualizarse a 1
    const contador = page.locator('#contador-carrito');
    await expect(contador).toHaveText('1');
  });

  test('agregar dos veces el mismo producto incrementa la cantidad', async ({ page }) => {
    await page.goto('/pages/shop.html');

    // Esperar productos
    const buyButton = page.locator('.buy-btn').first();
    await expect(buyButton).toBeVisible({ timeout: 10000 });

    // Agregar dos veces
    await buyButton.click();
    await buyButton.click();

    // El contador debería mostrar 2 (mismo producto, cantidad incrementada)
    const contador = page.locator('#contador-carrito');
    await expect(contador).toHaveText('2');
  });
});

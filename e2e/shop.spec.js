/**
 * Tests e2e: Página de shop (pages/shop.html)
 */

import { test, expect } from '@playwright/test';

test.describe('Página de shop (pages/shop.html)', () => {
  test('carga y muestra el título "Productos"', async ({ page }) => {
    await page.goto('/pages/shop.html');

    // Título de la sección
    const sectionTitle = page.locator('h1.font-weight-bold');
    await expect(sectionTitle).toHaveText('Productos');
  });

  test('muestra el título de página correcto', async ({ page }) => {
    await page.goto('/pages/shop.html');
    await expect(page).toHaveTitle('Shop - Rock Merch & Roll');
  });

  test('renderiza productos en el contenedor', async ({ page }) => {
    await page.goto('/pages/shop.html');

    // Esperar a que los productos se rendericen (hay productos en stock.json)
    const productContainer = page.locator('#productosDestacados');
    await expect(productContainer).toBeVisible();

    // Debería haber al menos un producto renderizado
    const products = page.locator('#productosDestacados .product');
    await expect(products).not.toHaveCount(0);
  });

  test('tiene botones de compra en los productos', async ({ page }) => {
    await page.goto('/pages/shop.html');

    // Esperar a que los botones .buy-btn aparezcan
    const buyButtons = page.locator('.buy-btn');
    await expect(buyButtons.first()).toBeVisible({ timeout: 5000 });
  });
});

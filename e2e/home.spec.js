/**
 * Tests e2e: Página principal (index.html)
 */

import { test, expect } from '@playwright/test';

test.describe('Página principal (index.html)', () => {
  test('carga y muestra el título "Rock Merch & Roll"', async ({ page }) => {
    await page.goto('/');

    // El título está en un h1#title
    const title = page.locator('h1#title');
    await expect(title).toHaveText('Rock Merch & Roll');

    // El título de página también
    await expect(page).toHaveTitle('Rock Merch & Roll');
  });

  test('la navbar contiene los links de navegación', async ({ page }) => {
    await page.goto('/');

    const homeLink = page.locator('a.nav-link', { hasText: 'Home' });
    const shopLink = page.locator('a.nav-link', { hasText: 'Shop' });

    await expect(homeLink).toBeVisible();
    await expect(shopLink).toBeVisible();
  });

  test('el botón "Compra Ahora" redirige a shop.html', async ({ page }) => {
    await page.goto('/');

    const buyButton = page.locator('button', { hasText: 'Compra Ahora' });
    await expect(buyButton).toBeVisible();
  });
});

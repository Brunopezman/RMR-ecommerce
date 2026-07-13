/**
 * Tests e2e: Navegación entre páginas
 *
 * NOTA: El servidor `serve` redirige /pages/shop → /pages/shop.html
 * sin mostrar .html en la URL, y /index.html se muestra como /.
 * Por eso los patrones de URL no incluyen .html.
 */

import { test, expect } from '@playwright/test';

test.describe('Navegación', () => {
  test('se puede navegar de index.html a shop.html mediante el link en la navbar', async ({ page }) => {
    await page.goto('/');

    const shopLink = page.locator('.navbar-nav a.nav-link', { hasText: 'Shop' });
    await expect(shopLink).toBeVisible();

    await Promise.all([
      page.waitForURL('**/pages/shop'),
      shopLink.click(),
    ]);

    const sectionTitle = page.locator('h1.font-weight-bold');
    await expect(sectionTitle).toHaveText('Productos');
  });

  test('se puede navegar de shop.html a index.html mediante el link Home', async ({ page }) => {
    await page.goto('/pages/shop');

    const homeLink = page.locator('.navbar-nav a.nav-link', { hasText: 'Home' });
    await expect(homeLink).toBeVisible();

    await Promise.all([
      page.waitForURL('http://localhost:3000/'),
      homeLink.click(),
    ]);

    const title = page.locator('h1#title');
    await expect(title).toHaveText('Rock Merch & Roll');
  });

  test('el botón "Compra Ahora" en index.html redirige a shop.html', async ({ page }) => {
    await page.goto('/');

    const buyButton = page.locator('section#home button', { hasText: 'Compra Ahora' });
    await expect(buyButton).toBeVisible();

    await Promise.all([
      page.waitForURL('**/pages/shop'),
      buyButton.click(),
    ]);

    await expect(page.locator('h1.font-weight-bold')).toHaveText('Productos');
  });
});

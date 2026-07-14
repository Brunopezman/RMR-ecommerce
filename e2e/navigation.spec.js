import { test, expect } from '@playwright/test';

test.describe('Navegación React SPA', () => {
  test('navegar de home a shop mediante botón "Productos" en navbar', async ({ page }) => {
    await page.goto('/');

    await page.locator('button', { hasText: 'Productos' }).click();

    const productSection = page.locator('#destacados');
    await expect(productSection).toBeVisible();
    await expect(productSection.locator('h1')).toHaveText('Productos');
  });

  test('navegar de shop a home mediante botón "Inicio" en navbar', async ({ page }) => {
    await page.goto('/');

    await page.locator('button', { hasText: 'Productos' }).click();
    await expect(page.locator('#destacados')).toBeVisible();

    await page.locator('button', { hasText: 'Inicio' }).click();

    await expect(page.locator('#home')).toBeVisible();
  });

  test('el botón "Comprar Ahora" cambia a vista shop', async ({ page }) => {
    await page.goto('/');

    const buyButton = page.locator('section#home button', { hasText: 'Compra Ahora' });
    await expect(buyButton).toBeVisible();
    await buyButton.click();

    await expect(page.locator('#destacados')).toBeVisible();
    await expect(page.locator('#destacados h1')).toHaveText('Productos');
  });
});

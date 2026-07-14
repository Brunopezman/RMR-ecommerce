import { test, expect } from '@playwright/test';

test.describe('Página principal (React SPA)', () => {
  test('carga y muestra el título "Rock Merch & Roll"', async ({ page }) => {
    await page.goto('/');
    const title = page.locator('section#home h1#title');
    await expect(title).toHaveText('Rock Merch & Roll');
    await expect(page).toHaveTitle('Rock Merch & Roll');
  });

  test('la navbar contiene botones de navegación', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('button', { hasText: 'Inicio' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Productos' })).toBeVisible();
  });

  test('sección banner-services visible en home', async ({ page }) => {
    await page.goto('/');
    const banner = page.locator('#banner-services');
    await expect(banner).toBeVisible();
    await expect(banner.locator('text=Envíos gratis')).toBeVisible();
    await expect(banner.locator('text=Financiación en cuotas')).toBeVisible();
    await expect(banner.locator('text=Compra de manera segura')).toBeVisible();
  });

  test('sección brand con logos de bandas visible en home', async ({ page }) => {
    await page.goto('/');
    const brand = page.locator('#brand');
    await expect(brand).toBeVisible();
    const images = brand.locator('img');
    await expect(images).toHaveCount(6);
  });
});

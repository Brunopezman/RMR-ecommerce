import { test, expect } from '@playwright/test';

test.describe('Vista shop (React SPA)', () => {
  test('muestra productos al hacer clic en "Comprar Ahora"', async ({ page }) => {
    await page.goto('/');

    await page.locator('button', { hasText: 'Compra Ahora' }).click();

    const productSection = page.locator('#destacados');
    await expect(productSection).toBeVisible();
    await expect(productSection.locator('h1')).toHaveText('Productos');
  });

  test('oculta hero y banners al cambiar a vista shop', async ({ page }) => {
    await page.goto('/');
    await page.locator('button', { hasText: 'Compra Ahora' }).click();

    await expect(page.locator('#home')).not.toBeVisible();
    await expect(page.locator('#banner-services')).not.toBeVisible();
    await expect(page.locator('#brand')).not.toBeVisible();
  });

  test('renderiza productos en el grid', async ({ page }) => {
    await page.goto('/');
    await page.locator('button', { hasText: 'Compra Ahora' }).click();

    // Wait for products to load via API
    const productGrid = page.locator('#productosDestacados');
    await expect(productGrid).toBeVisible({ timeout: 10000 });
    const products = productGrid.locator('.product');
    await expect(products).not.toHaveCount(0);
  });

  test('cada producto tiene imagen clickeable que navega al detalle', async ({ page }) => {
    await page.goto('/');
    await page.locator('button', { hasText: 'Compra Ahora' }).click();

    // Wait for a product image to be visible (using data-testid or id-based selector)
    const productImage = page.locator('#product-img-1');
    await expect(productImage).toBeVisible({ timeout: 10000 });
    await productImage.click();

    // Should navigate to product detail page
    await expect(page).toHaveURL(/\/product\/\d+/);
  });
});

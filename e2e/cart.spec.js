import { test, expect } from '@playwright/test';

test.describe('Carrito de compras', () => {
  test('el contador del carrito muestra 0 inicialmente', async ({ page }) => {
    await page.goto('/');
    const contador = page.locator('#contador-carrito');
    await expect(contador).toHaveText('0');
  });

  test('agregar un producto al carrito actualiza el contador', async ({ page }) => {
    await page.goto('/');
    await page.locator('button', { hasText: 'Compra Ahora' }).click();

    const buyButton = page.locator('.buy-btn').first();
    await expect(buyButton).toBeVisible({ timeout: 10000 });
    await buyButton.click();

    const contador = page.locator('#contador-carrito');
    await expect(contador).toHaveText('1');
  });

  test('agregar dos veces el mismo producto incrementa la cantidad', async ({ page }) => {
    await page.goto('/');
    await page.locator('button', { hasText: 'Compra Ahora' }).click();

    const buyButton = page.locator('.buy-btn').first();
    await expect(buyButton).toBeVisible({ timeout: 10000 });
    await buyButton.click();
    await buyButton.click();

    const contador = page.locator('#contador-carrito');
    await expect(contador).toHaveText('2');
  });
});

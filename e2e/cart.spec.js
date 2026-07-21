import { test, expect } from '@playwright/test';

test.describe('Carrito de compras', () => {
  test('el contador del carrito muestra 0 inicialmente', async ({ page }) => {
    await page.goto('/');
    const contador = page.locator('#contador-carrito');
    await expect(contador).toHaveText('0');
  });

  test('agregar un producto al carrito desde el detalle actualiza el contador', async ({ page }) => {
    await page.goto('/');
    await page.locator('button', { hasText: 'Compra Ahora' }).click();

    // Wait for products to load and click first product image
    const productImage = page.locator('#product-img-1');
    await expect(productImage).toBeVisible({ timeout: 10000 });
    await productImage.click();

    // Should be on product detail page
    await expect(page).toHaveURL(/\/product\/\d+/);

    // Wait for product detail to load and select talle "M"
    await page.getByRole('radio', { name: 'Talle M' }).click();

    // Click "Agregar al carrito"
    const addButton = page.locator('button', { hasText: 'Agregar al carrito' });
    await expect(addButton).toBeEnabled({ timeout: 5000 });
    await addButton.click();

    const contador = page.locator('#contador-carrito');
    await expect(contador).toHaveText('1');
  });

  test('agregar dos veces el mismo producto desde el detalle incrementa la cantidad', async ({ page }) => {
    await page.goto('/');
    await page.locator('button', { hasText: 'Compra Ahora' }).click();

    // Wait for products to load and click first product image
    const productImage = page.locator('#product-img-1');
    await expect(productImage).toBeVisible({ timeout: 10000 });
    await productImage.click();

    await expect(page).toHaveURL(/\/product\/\d+/);

    // Wait for product detail to load and select talle "M"
    await page.getByRole('radio', { name: 'Talle M' }).click();

    // Add twice
    const addButton = page.locator('button', { hasText: 'Agregar al carrito' });
    await expect(addButton).toBeEnabled({ timeout: 5000 });
    await addButton.click();
    await addButton.click();

    const contador = page.locator('#contador-carrito');
    await expect(contador).toHaveText('2');
  });
});

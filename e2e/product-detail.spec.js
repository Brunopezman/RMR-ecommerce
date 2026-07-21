import { test, expect } from '@playwright/test';

test.describe('Product Detail Page', () => {
  test('muestra información completa del producto en /product/1', async ({ page }) => {
    await page.goto('/product/1');

    // Wait for product to load (skeleton replaced by real data) — product detail page renders h1 with name
    await expect(page.locator('h1').filter({ hasText: 'Remera The Beatles' })).toBeVisible();

    // Price is rendered using toLocaleString('es-AR') — 28000 → "$28.000"
    await expect(page.getByText('28.000', { exact: false })).toBeVisible({ timeout: 10000 });

    // Check description
    await expect(page.locator('text=The Beatles - negra - lisa')).toBeVisible();

    // Check image
    const img = page.locator('img[alt="The Beatles - negra - lisa"]');
    await expect(img).toBeVisible();

    // Check product type badge
    await expect(page.locator('text=remera').first()).toBeVisible();

    // Check page title
    await expect(page).toHaveTitle('Rock Merch & Roll');
  });

  test('remeras/buzos tienen selector de talle', async ({ page }) => {
    await page.goto('/product/1');
    await expect(page.locator('h1').filter({ hasText: 'Remera The Beatles' })).toBeVisible();

    // Size selector should be visible for remera
    const sizeGroup = page.locator('[role="radiogroup"]');
    await expect(sizeGroup).toBeVisible();
    await expect(sizeGroup).toHaveAttribute('aria-label', 'Seleccionar talle');

    // Should have 4 size buttons: S, M, L, XL
    const sizeButtons = sizeGroup.locator('[role="radio"]');
    await expect(sizeButtons).toHaveCount(4);
    await expect(sizeButtons.nth(0)).toHaveText('M');
    await expect(sizeButtons.nth(1)).toHaveText('L');
    await expect(sizeButtons.nth(2)).toHaveText('XL');
    await expect(sizeButtons.nth(3)).toHaveText('XXL');
  });

  test('accesorios/vasos NO tienen selector de talle', async ({ page }) => {
    // Gorra Nirvana is accesorio (id: 14)
    await page.goto('/product/14');
    await expect(page.locator('h1').filter({ hasText: 'Gorra Nirvana' })).toBeVisible();

    // Size selector should NOT be present
    await expect(page.locator('[role="radiogroup"]')).not.toBeVisible();

    // Also check a vaso — Chop Queen (id: 16)
    await page.goto('/product/16');
    await expect(page.locator('h1').filter({ hasText: 'Chop Queen' })).toBeVisible();
    await expect(page.locator('[role="radiogroup"]')).not.toBeVisible();

    // Verify the "Cantidad" section is present though (all products have quantity)
    await expect(page.locator('[aria-label="Selector de cantidad"]')).toBeVisible();
  });

  test('seleccionar un talle habilita botones de acción', async ({ page }) => {
    await page.goto('/product/1');
    // Wait for product to finish loading (skeleton → real content)
    await page.waitForSelector('img[alt="The Beatles - negra - lisa"]', { timeout: 10000 });

    // Initially add-to-cart should be disabled (size not selected)
    const addButton = page.locator('button[aria-label*="Agregar"]');
    await expect(addButton).toBeDisabled();

    // Click size L
    const sizeButton = page.getByRole('radio', { name: 'Talle L' });
    await sizeButton.click();

    // Verify it's selected
    await expect(sizeButton).toHaveAttribute('aria-checked', 'true');

    // Now the button should be enabled
    await expect(addButton).toBeEnabled();
  });

  test('cambiar cantidad con +/-', async ({ page }) => {
    await page.goto('/product/1');
    await expect(page.locator('h1').filter({ hasText: 'Remera The Beatles' })).toBeVisible();

    // Initial quantity should be 1
    const quantityDisplay = page.getByLabel(/Cantidad/).first();
    await expect(quantityDisplay).toHaveText('1');

    // Click +
    await page.locator('[aria-label="Aumentar cantidad"]').click();
    await expect(quantityDisplay).toHaveText('2');

    // Click + again
    await page.locator('[aria-label="Aumentar cantidad"]').click();
    await expect(quantityDisplay).toHaveText('3');

    // Click -
    await page.locator('[aria-label="Disminuir cantidad"]').click();
    await expect(quantityDisplay).toHaveText('2');

    // Disminuir de 1 → botón se deshabilita
    await page.locator('[aria-label="Disminuir cantidad"]').click();
    await expect(quantityDisplay).toHaveText('1');
    await expect(page.locator('[aria-label="Disminuir cantidad"]')).toBeDisabled();
  });

  test('agregar al carrito actualiza el contador', async ({ page }) => {
    await page.goto('/product/1');
    await expect(page.locator('h1').filter({ hasText: 'Remera The Beatles' })).toBeVisible();

    // Select size first
    await page.getByRole('radio', { name: 'Talle M' }).click();

    // Click "Agregar al carrito"
    await page.locator('button[aria-label*="Agregar"]').first().click();

    // Verify contador updated
    const contador = page.locator('#contador-carrito');
    await expect(contador).toHaveText('1');

    // Verify "Agregado" feedback appears briefly
    await expect(page.locator('text=Agregado')).toBeVisible();
  });

  test('comprar ahora redirige a checkout', async ({ page }) => {
    await page.goto('/product/1');
    await expect(page.locator('h1').filter({ hasText: 'Remera The Beatles' })).toBeVisible();

    // Select size using exact name
    await page.getByRole('radio', { exact: true, name: 'Talle L' }).click();

    // Click "Comprar ahora"
    await page.locator('button[aria-label*="Comprar"]').first().click();

    // Should redirect to /checkout
    await expect(page).toHaveURL(/\/checkout/);

    // Checkout section should be visible
    await expect(page.locator('#seccion-pago')).toBeVisible();

    // The product should appear in the checkout summary
    await expect(page.locator('#resumen-lista')).toContainText('Remera The Beatles');
  });

  test('volver regresa a la tienda', async ({ page }) => {
    await page.goto('/product/1');
    await expect(page.locator('h1').filter({ hasText: 'Remera The Beatles' })).toBeVisible();

    // Click "Volver" link
    await page.locator('[aria-label="Volver a la tienda"]').click();

    // Should be back in the shop view
    await expect(page).toHaveURL(/\/shop/);
    await expect(page.locator('#destacados')).toBeVisible();
  });
});

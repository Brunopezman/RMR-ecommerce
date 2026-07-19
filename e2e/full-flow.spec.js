import { test, expect } from '@playwright/test';

const SIDEBAR = 'aside[aria-label="Filtros de productos"]';

test.describe('Flujo completo de compra', () => {
  test('flujo completo: filtrar → detalle → talle/cantidad → carrito → checkout', async ({ page }) => {
    // ─── Step 1: Navegar a /shop ───────────────────────────────────
    await page.goto('/shop');
    await expect(page.locator('#destacados')).toBeVisible();
    await expect(page.locator('#productosDestacados')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);

    // ─── Step 2: Aplicar filtro de categoría "Remeras" ────────────
    await page.locator(SIDEBAR).locator('label').filter({ hasText: 'Remeras' }).click();
    await page.waitForTimeout(500);

    // Verificar que el filtro funciona
    const filteredCount = await page.locator('.product').count();
    expect(filteredCount).toBe(11);
    const productNames = await page.locator('.product-name').allTextContents();
    for (const name of productNames) {
      expect(name).toContain('Remera');
    }

    // ─── Step 3: Hacer clic en un producto (primer producto) ──────
    await page.locator('#product-img-1').click();

    // Esperar a que cargue la página de detalle
    await expect(page).toHaveURL(/\/product\/\d+/);
    // Verificar que se ve un nombre de producto (no skeleton)
    const detailHeading = page.locator('h1').first();
    await expect(detailHeading).toBeVisible();
    await expect(detailHeading).not.toBeEmpty();

    // ─── Step 4: Seleccionar talle (L) y aumentar cantidad a 2 ──
    const sizeGroup = page.locator('[role="radiogroup"]');
    await expect(sizeGroup).toBeVisible();
    await page.getByRole('radio', { exact: true, name: 'Talle L' }).click();

    // Aumentar cantidad a 2
    await page.locator('[aria-label="Aumentar cantidad"]').click();
    const quantityDisplay = page.getByLabel(/Cantidad/).first();
    await expect(quantityDisplay).toHaveText('2');

    // ─── Step 5: Agregar al carrito ────────────────────────────────
    await page.locator('button[aria-label*="Agregar"]').first().click();

    // Verificar contador del carrito
    const contador = page.locator('#contador-carrito');
    await expect(contador).toHaveText('2');
    await expect(page.locator('text=Agregado')).toBeVisible();

    // ─── Step 6: Ir al checkout ───────────────────────────────────
    await page.locator('button[aria-label*="Comprar"]').first().click();

    // ─── Step 7: Verificar checkout ────────────────────────────────
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.locator('#seccion-pago')).toBeVisible();

    // Verificar que el producto aparece en el resumen del carrito
    const resumen = page.locator('#resumen-lista');
    await expect(resumen).toBeVisible();
    const items = await resumen.locator('li').count();
    expect(items).toBeGreaterThan(0);

    // El título de la página de checkout se muestra
    await expect(page.locator('h2', { hasText: 'Finalizar Compra' })).toBeVisible();
  });

  test('flujo con accesorio (sin talle): detalle → cantidad → comprar ahora', async ({ page }) => {
    // ─── Navegar a detalle de accesorio ────────────────────────────
    await page.goto('/product/14'); // Gorra Nirvana
    await expect(page.locator('h1').filter({ hasText: 'Gorra Nirvana' })).toBeVisible();

    // Verificar que NO hay selector de talle
    await expect(page.locator('[role="radiogroup"]')).not.toBeVisible();

    // Botón de agregar debe estar habilitado (no necesita talle)
    const addButton = page.locator('button[aria-label*="Agregar"]').first();
    await expect(addButton).toBeEnabled();

    // Aumentar cantidad a 3
    const quantityDisplay = page.getByLabel(/Cantidad/).first();
    await expect(quantityDisplay).toHaveText('1');

    await page.locator('[aria-label="Aumentar cantidad"]').click();
    await expect(quantityDisplay).toHaveText('2');
    await page.locator('[aria-label="Aumentar cantidad"]').click();
    await expect(quantityDisplay).toHaveText('3');

    // Agregar al carrito
    await addButton.click();
    await expect(page.locator('#contador-carrito')).toHaveText('3');

    // Comprar ahora
    await page.locator('button[aria-label*="Comprar"]').first().click();

    // Verificar que redirige a checkout
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.locator('#seccion-pago')).toBeVisible();
    await expect(page.locator('#resumen-lista')).toContainText('Gorra Nirvana');
  });
});

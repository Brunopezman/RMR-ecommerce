import { test, expect } from '@playwright/test';

const SIDEBAR = 'aside[aria-label="Filtros de productos"]';

test.describe('Catalog Filters', () => {
  test('sidebar de filtros visible en desktop', async ({ page }) => {
    await page.goto('/shop');

    // Wait for products to load
    await expect(page.locator('#productosDestacados')).toBeVisible({ timeout: 10000 });

    // Filter sidebar should be visible on desktop
    const sidebar = page.locator(SIDEBAR);
    await expect(sidebar).toBeVisible();

    // Should have "Filtros" heading
    await expect(sidebar.locator('h2')).toHaveText('Filtros');

    // Should have all 4 category labels in the sidebar
    await expect(sidebar.locator('label').filter({ hasText: 'Remeras' })).toBeVisible();
    await expect(sidebar.locator('label').filter({ hasText: 'Buzos' })).toBeVisible();
    await expect(sidebar.locator('label').filter({ hasText: 'Accesorios' })).toBeVisible();
    await expect(sidebar.locator('label').filter({ hasText: 'Vasos' })).toBeVisible();

    // Should have price range slider (scoped to sidebar to avoid duplicate ID)
    const priceRange = sidebar.locator('#price-range');
    await expect(priceRange).toBeVisible();
  });

  test('filtrar por categoría "Remeras" muestra solo remeras', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.locator('#productosDestacados')).toBeVisible({ timeout: 10000 });

    // Count initial products (should be 17 — full catalog)
    await page.waitForTimeout(500);
    const initialCount = await page.locator('.product').count();
    expect(initialCount).toBe(17);

    // Click the "Remeras" label in the desktop sidebar
    await page.locator(SIDEBAR).locator('label').filter({ hasText: 'Remeras' }).click();
    await page.waitForTimeout(500);

    // Should now show only remeras (11 products)
    const remeraCount = await page.locator('.product').count();
    expect(remeraCount).toBe(11);

    // All visible products should have "Remera" in their name
    const productNames = await page.locator('.product-name').allTextContents();
    for (const name of productNames) {
      expect(name).toContain('Remera');
    }
  });

  test('filtrar por "Buzos" muestra solo buzos', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.locator('#productosDestacados')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);

    // Click "Buzos" label in sidebar
    await page.locator(SIDEBAR).locator('label').filter({ hasText: 'Buzos' }).click();
    await page.waitForTimeout(500);

    // Should show 2 buzos
    const buzoCount = await page.locator('.product').count();
    expect(buzoCount).toBe(2);

    const productNames = await page.locator('.product-name').allTextContents();
    for (const name of productNames) {
      expect(name).toContain('Buzo');
    }
  });

  test('filtrar por accesorios y vasos simultáneamente', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.locator('#productosDestacados')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);

    // Click "Accesorios" and "Vasos" labels
    await page.locator(SIDEBAR).locator('label').filter({ hasText: 'Accesorios' }).click();
    await page.locator(SIDEBAR).locator('label').filter({ hasText: 'Vasos' }).click();
    await page.waitForTimeout(500);

    // Should show 4 products (2 accesorios + 2 vasos)
    expect(await page.locator('.product').count()).toBe(4);
  });

  test('filtro combinado: Remeras + Buzos = 13 productos', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.locator('#productosDestacados')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);

    // Click both "Remeras" and "Buzos"
    await page.locator(SIDEBAR).locator('label').filter({ hasText: 'Remeras' }).click();
    await page.locator(SIDEBAR).locator('label').filter({ hasText: 'Buzos' }).click();
    await page.waitForTimeout(500);

    // Should show 13 products (11 remeras + 2 buzos)
    expect(await page.locator('.product').count()).toBe(13);
  });

  test('limpiar filtros con botón restaura todos los productos', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.locator('#productosDestacados')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);

    // Apply a category filter
    await page.locator(SIDEBAR).locator('label').filter({ hasText: 'Remeras' }).click();
    await page.waitForTimeout(500);
    expect(await page.locator('.product').count()).toBe(11);

    // Click "Limpiar filtros" button inside the sidebar
    await page.locator(SIDEBAR).locator('button', { hasText: 'Limpiar filtros' }).click();
    await page.waitForTimeout(500);

    // All products should be back
    expect(await page.locator('.product').count()).toBe(17);
  });

  test('deseleccionar categoría remueve el filtro', async ({ page }) => {
    await page.goto('/shop');
    await expect(page.locator('#productosDestacados')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(500);

    // Select Remeras
    await page.locator(SIDEBAR).locator('label').filter({ hasText: 'Remeras' }).click();
    await page.waitForTimeout(500);
    expect(await page.locator('.product').count()).toBe(11);

    // Deselect Remeras (click again on the same label)
    await page.locator(SIDEBAR).locator('label').filter({ hasText: 'Remeras' }).click();
    await page.waitForTimeout(500);

    // All products should be back
    expect(await page.locator('.product').count()).toBe(17);
  });
});

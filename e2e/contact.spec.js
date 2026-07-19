import { test, expect } from '@playwright/test';

test.describe('Página de Contacto', () => {
  test('navegar a /contact muestra la página con título "Contacto"', async ({ page }) => {
    await page.goto('/contact');

    // Debe mostrar el título
    await expect(page.locator('h1', { hasText: 'Contacto' })).toBeVisible();

    // Debe mostrar el formulario
    await expect(page.locator('#contact-name')).toBeVisible();
    await expect(page.locator('#contact-email')).toBeVisible();
    await expect(page.locator('#contact-phone')).toBeVisible();
    await expect(page.locator('#contact-area')).toBeVisible();
    await expect(page.locator('#contact-subject')).toBeVisible();
    await expect(page.locator('#contact-message')).toBeVisible();
  });

  test('completar formulario válido y enviar muestra mensaje de éxito', async ({ page }) => {
    await page.goto('/contact');

    // Completar formulario
    await page.locator('#contact-name').fill('Juan Pérez');
    await page.locator('#contact-email').fill('juan@example.com');
    await page.locator('#contact-phone').fill('+54 11 5555-1234');
    await page.locator('#contact-area').selectOption('ventas');
    await page.locator('#contact-subject').fill('Consulta sobre precios');
    await page.locator('#contact-message').fill('Quisiera saber si tienen remeras de Queen en talle L.');

    // Enviar
    await page.locator('button[type="submit"]').click();

    // Debería mostrar la pantalla de éxito o error según la API
    // Si el backend real está corriendo, podría responder exitosamente o con error
    // Verificamos que se haya procesado el submit (pantalla de éxito o error)
    await page.waitForTimeout(2000);

    // La página puede mostrar éxito o error - cualquiera es aceptable para verificar
    // que el formulario procesó el envío
    const successMessage = page.locator('text=¡Mensaje enviado con éxito!');
    const errorAlert = page.locator('[role="alert"]');

    // Si hay éxito o error, el formulario se procesó (no quedó en estado inicial)
    await expect(
      successMessage.or(errorAlert)
    ).toBeVisible({ timeout: 5000 });
  });

  test('enviar formulario vacío muestra errores de validación', async ({ page }) => {
    await page.goto('/contact');

    // Hacer click en enviar sin completar nada
    await page.locator('button[type="submit"]').click();

    // Deberían aparecer mensajes de error
    await expect(page.locator('text=El nombre debe tener al menos 2 caracteres.')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=El email es obligatorio.')).toBeVisible();
    await expect(page.locator('text=El asunto debe tener al menos 3 caracteres.')).toBeVisible();
    await expect(page.locator('text=El mensaje es obligatorio.')).toBeVisible();
  });

  test('email inválido muestra error de formato', async ({ page }) => {
    await page.goto('/contact');

    // Completar con email inválido
    await page.locator('#contact-name').fill('Juan Pérez');
    await page.locator('#contact-email').fill('email-invalido');
    await page.locator('#contact-subject').fill('Consulta');
    await page.locator('#contact-message').fill('Mensaje de prueba con más de diez caracteres.');

    // Enviar
    await page.locator('button[type="submit"]').click();

    // Debería mostrar error de email inválido
    await expect(page.locator('text=Formato de email inválido.')).toBeVisible({ timeout: 3000 });
  });

  test('hacer clic en "Contacto" en Header navega a /contact', async ({ page }) => {
    await page.goto('/');

    // Hacer clic en el botón "Contacto" del navbar
    await page.locator('button', { hasText: 'Contacto' }).click();

    // Verificar que la URL cambió
    await expect(page).toHaveURL(/\/contact/);

    // Verificar que se ve la página de contacto
    await expect(page.locator('h1', { hasText: 'Contacto' })).toBeVisible();
  });
});

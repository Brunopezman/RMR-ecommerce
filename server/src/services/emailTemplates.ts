/**
 * Email HTML templates for Rock Merch & Roll.
 *
 * All templates are inline-styled HTML (no CSS dependencies) and
 * responsive-friendly for email clients.
 */

import type { Order } from '../types.js';

// ── Helpers ─────────────────────────────────────────────────────────────

const APP_URL = process.env.RMR_APP_URL || 'http://localhost:3000';
const BRAND = '🎸 Rock Merch & Roll';

/** Format a number as locale currency string (e.g. 9500 → "9.500,00"). */
function formatPrice(amount: number): string {
  return amount.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Wraps content in a consistent email layout with header and footer. */
function emailLayout(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;">
    <tr>
      <td align="center" style="padding:20px 10px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a2e;padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#e94560;font-size:24px;font-weight:700;">${BRAND}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;font-size:15px;line-height:1.6;color:#333333;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f8f8;padding:16px 32px;text-align:center;font-size:12px;color:#888888;">
              Rock Merch & Roll &mdash; contacto@rockmerch.com.ar
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Public templates ────────────────────────────────────────────────────

/**
 * Welcome email sent after a successful user registration.
 */
export function welcomeTemplate(name: string): string {
  const body = `
    <h2 style="color:#1a1a2e;margin-top:0;">¡Bienvenido, ${escapeHtml(name)}!</h2>
    <p>Gracias por registrarte en <strong>Rock Merch &amp; Roll</strong>. Ahora podés explorar nuestro catálogo de merchandising oficial de las mejores bandas.</p>
    <p style="text-align:center;margin:32px 0;">
      <a href="${APP_URL}" style="display:inline-block;padding:14px 36px;background-color:#e94560;color:#ffffff;text-decoration:none;border-radius:6px;font-size:16px;font-weight:600;">Ver catálogo</a>
    </p>
    <p>Si tenés alguna consulta, no dudes en escribirnos a <a href="mailto:contacto@rockmerch.com.ar" style="color:#e94560;">contacto@rockmerch.com.ar</a>.</p>
  `;
  return emailLayout(body);
}

/**
 * Order confirmation email with a summary of the purchased items.
 */
export function orderConfirmationTemplate(order: Order, user: { name: string }): string {
  const itemsRows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;">${escapeHtml(item.nombre)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${item.cantidad}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">$${formatPrice(item.precio)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">$${formatPrice(item.cantidad * item.precio)}</td>
    </tr>`,
    )
    .join('');

  const body = `
    <h2 style="color:#1a1a2e;margin-top:0;">¡Gracias por tu compra, ${escapeHtml(user.name)}!</h2>
    <p style="font-size:14px;color:#666;">Orden #${order.id}</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border-collapse:collapse;">
      <thead>
        <tr style="background-color:#f0f0f0;">
          <th style="padding:10px 12px;text-align:left;font-size:13px;text-transform:uppercase;color:#555;">Producto</th>
          <th style="padding:10px 12px;text-align:center;font-size:13px;text-transform:uppercase;color:#555;">Cant.</th>
          <th style="padding:10px 12px;text-align:right;font-size:13px;text-transform:uppercase;color:#555;">Precio</th>
          <th style="padding:10px 12px;text-align:right;font-size:13px;text-transform:uppercase;color:#555;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding:12px;text-align:right;font-weight:700;font-size:16px;">Total</td>
          <td style="padding:12px;text-align:right;font-weight:700;font-size:16px;color:#e94560;">$${formatPrice(order.total)}</td>
        </tr>
      </tfoot>
    </table>

    ${
      order.shippingAddress
        ? `<p><strong>Dirección de envío:</strong><br />${escapeHtml(order.shippingAddress)}</p>`
        : ''
    }

    <p style="color:#888;font-size:13px;">Podés ver los detalles completos en el PDF adjunto a este correo.</p>
    <p>Si tenés dudas sobre tu pedido, respondé este correo o escribinos a <a href="mailto:contacto@rockmerch.com.ar" style="color:#e94560;">contacto@rockmerch.com.ar</a>.</p>
  `;
  return emailLayout(body);
}

/**
 * Staff notification email when a contact form is submitted.
 */
export function contactTemplate(input: { name: string; email: string; area: string; message: string }): string {
  const body = `
    <h2 style="color:#1a1a2e;margin-top:0;">Nuevo mensaje de contacto desde RMR</h2>

    <table role="presentation" cellpadding="6" cellspacing="0" style="margin:16px 0;font-size:14px;">
      <tr>
        <td style="font-weight:600;color:#555;padding-right:16px;">Nombre</td>
        <td>${escapeHtml(input.name)}</td>
      </tr>
      <tr>
        <td style="font-weight:600;color:#555;padding-right:16px;">Email</td>
        <td><a href="mailto:${escapeHtml(input.email)}" style="color:#e94560;">${escapeHtml(input.email)}</a></td>
      </tr>
      <tr>
        <td style="font-weight:600;color:#555;padding-right:16px;">Área</td>
        <td>${escapeHtml(input.area)}</td>
      </tr>
    </table>

    <hr style="border:none;border-top:1px solid #eee;margin:16px 0;" />

    <h3 style="color:#333;">Mensaje</h3>
    <p style="background-color:#f9f9f9;padding:16px;border-radius:6px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(input.message)}</p>
  `;
  return emailLayout(body);
}

// ── Helpers ─────────────────────────────────────────────────────────────

/** Escape HTML special characters to prevent injection in templates. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

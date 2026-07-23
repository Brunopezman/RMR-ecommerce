/**
 * Central email service for Rock Merch & Roll.
 *
 * Provides a unified interface for all email types:
 * - welcome (user registration)
 * - order confirmation (with optional PDF attachment)
 * - contact (staff notification)
 *
 * Falls back to console-only mock mode when SMTP credentials are not set,
 * tagged with `[EMAIL_MOCK]` for easy identification during development.
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { Order } from '../types.js';
import {
  welcomeTemplate,
  orderConfirmationTemplate,
} from './emailTemplates.js';

// ── Transporter (singleton) ─────────────────────────────────────────────

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter !== null) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && port && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: parseInt(port, 10) === 465,
      auth: { user, pass },
    });
    console.log('[email] SMTP transporter configured:', host);
  } else {
    transporter = null;
    console.log('[email] No SMTP credentials — operating in MOCK mode.');
  }

  return transporter;
}

/**
 * Build the From field for emails.
 * If SMTP_FROM includes angle brackets (e.g. "Name <email>"), use it as-is.
 * Otherwise, wrap in "Rock Merch & Roll <SMTP_FROM>".
 */
function buildFrom(): string {
  const raw = process.env.SMTP_FROM || '';
  if (raw.includes('<') && raw.includes('>')) return raw;
  const email = raw || process.env.SMTP_USER || 'noreply@rockmerch.com';
  return `"Rock Merch & Roll" <${email}>`;
}

// ── Base send function ──────────────────────────────────────────────────

/**
 * Send an email via SMTP, or log it to console in mock mode.
 *
 * In mock mode, the email is NOT sent; it is logged with `[EMAIL_MOCK]`
 * tag so the developer can verify the output during development.
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const activeTransporter = getTransporter();

  if (activeTransporter) {
    await activeTransporter.sendMail({
      from: buildFrom(),
      to,
      subject,
      html,
    });
    console.log(`[email] Sent to "${to}" — subject: "${subject}"`);
  } else {
    console.log('[EMAIL_MOCK] Email would be sent:');
    console.log(`  To:      ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  HTML:    (${html.length} chars)`);
  }
}

// ── Specific email types ────────────────────────────────────────────────

/**
 * Send a welcome email after successful registration.
 */
export async function sendWelcomeEmail(
  user: { name: string; email: string },
): Promise<void> {
  const html = welcomeTemplate(user.name);
  await sendEmail(
    user.email,
    '¡Bienvenido a Rock Merch & Roll!',
    html,
  );
}

/**
 * Send an order confirmation email with optional PDF attachment.
 *
 * @param order - The completed order details.
 * @param user  - User name and email.
 * @param pdfBuffer - Optional PDF invoice buffer to attach.
 */
export async function sendOrderConfirmationEmail(
  order: Order,
  user: { name: string; email: string },
  pdfBuffer?: Buffer,
): Promise<void> {
  const html = orderConfirmationTemplate(order, user);
  const activeTransporter = getTransporter();

  const subject = `Compra confirmada — Orden #${order.id}`;

  if (activeTransporter) {
    const mailOptions: nodemailer.SendMailOptions = {
      from: buildFrom(),
      to: user.email,
      subject,
      html,
    };

    if (pdfBuffer) {
      mailOptions.attachments = [
        {
          filename: 'compra-rockmerch.pdf',
          content: pdfBuffer,
        },
      ];
    }

    await activeTransporter.sendMail(mailOptions);
    console.log(`[email] Order confirmation sent to "${user.email}" — order #${order.id}`);
  } else {
    console.log('[EMAIL_MOCK] Order confirmation email would be sent:');
    console.log(`  To:      ${user.email}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  HTML:    (${html.length} chars)`);
    if (pdfBuffer) {
      console.log(`  PDF:     compra-rockmerch.pdf (${pdfBuffer.length} bytes)`);
    }
  }
}



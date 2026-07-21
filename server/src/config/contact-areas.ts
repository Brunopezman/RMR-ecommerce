/**
 * Contact areas configuration — maps form areas to destination emails.
 *
 * Transporter falls back to mock mode (console log) when SMTP env vars
 * are not set, so the feature works in development without a mail server.
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// ── Area definitions ──────────────────────────────────────────────────

export interface ContactArea {
  label: string;
  email: string;
}

const AREAS: Record<string, ContactArea> = {
  ventas: {
    label: 'Ventas',
    email: 'ventas@rockmerch.com',
  },
  soporte: {
    label: 'Soporte Técnico',
    email: 'soporte@rockmerch.com',
  },
  reclamos: {
    label: 'Reclamos',
    email: 'reclamos@rockmerch.com',
  },
  prensa: {
    label: 'Prensa y RRPP',
    email: 'prensa@rockmerch.com',
  },
  otros: {
    label: 'Otros',
    email: 'contacto@rockmerch.com',
  },
};

export function getArea(slug: string): ContactArea | undefined {
  return AREAS[slug];
}

export function getAllAreas(): Record<string, ContactArea> {
  return { ...AREAS };
}

// ── Transporter ───────────────────────────────────────────────────────

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
    console.log('[contact] SMTP transporter configured:', host);
  } else {
    transporter = null;
    console.log('[contact] No SMTP credentials — operating in MOCK mode.');
  }

  return transporter;
}

// ── Send function ─────────────────────────────────────────────────────

export interface ContactMailInput {
  name: string;
  email: string;
  area: string;
  message: string;
}

/**
 * Send a contact email via SMTP, or log to console in mock mode.
 *
 * In mock mode, the email is NOT actually sent; it is logged with a
 * `[CONTACT_MOCK]` tag for development verification.
 */
export async function sendContactEmail(input: ContactMailInput): Promise<void> {
  const areaDef = getArea(input.area);
  const destinationEmail = areaDef?.email ?? 'contacto@rockmerch.com';
  const areaLabel = areaDef?.label ?? input.area;

  const subject = `[Rock Merch] Consulta de ${input.name} — ${areaLabel}`;
  const body = [
    `Nombre: ${input.name}`,
    `Email: ${input.email}`,
    `Área: ${areaLabel}`,
    '',
    'Mensaje:',
    input.message,
  ].join('\n');

  const activeTransporter = getTransporter();

  if (activeTransporter) {
    await activeTransporter.sendMail({
      from: `"Rock Merch Contact" <${process.env.SMTP_USER || 'noreply@rockmerch.com'}>`,
      to: destinationEmail,
      replyTo: input.email,
      subject,
      text: body,
    });
    console.log(`[contact] Email sent to ${destinationEmail} (${areaLabel})`);
  } else {
    console.log('[CONTACT_MOCK] Email would be sent:');
    console.log(`  To:      ${destinationEmail}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body:\n${body}`);
  }
}

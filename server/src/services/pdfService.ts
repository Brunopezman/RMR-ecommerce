/**
 * PDF invoice generation for Rock Merch & Roll.
 *
 * Uses pdfkit to generate an invoice PDF in memory (Buffer).
 * The generated PDF includes:
 *   - Store header (ROCK MERCH & ROLL)
 *   - Invoice metadata (order #, date)
 *   - Customer data (name, email)
 *   - Product table (name, unit price, qty, subtotal)
 *   - Total line
 *   - Thank you message
 */

import PDFDocument from 'pdfkit';
import type { Order } from '../types.js';

/**
 * Generate an order invoice as a PDF Buffer.
 *
 * Uses a Promise to properly wait for the PDF stream to finish.
 *
 * @param order - The completed order (with items).
 * @param user  - Customer name and email.
 * @returns     - A Promise that resolves to a Buffer containing the PDF file.
 */
export function generateOrderPDF(
  order: Order,
  user: { name: string; email: string },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // ── Header ──────────────────────────────────────────────────────────
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('ROCK MERCH & ROLL', { align: 'center' });
    doc.moveDown(0.3);
    doc
      .fontSize(16)
      .font('Helvetica')
      .text('Factura de Compra', { align: 'center' });
    doc.moveDown(1);

    // ── Order metadata ──────────────────────────────────────────────────
    doc.fontSize(12).font('Helvetica-Bold').text(`Orden #${order.id}`);
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(
        `Fecha: ${new Date(order.createdAt).toLocaleDateString('es-AR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`,
      );
    doc.moveDown(1);

    // ── Customer data ───────────────────────────────────────────────────
    doc.fontSize(12).font('Helvetica-Bold').text('Datos del Cliente:');
    doc.fontSize(10).font('Helvetica').text(`Nombre: ${user.name}`);
    doc.text(`Email: ${user.email}`);

    if (order.shippingAddress) {
      doc.text(`Dirección de envío: ${order.shippingAddress}`);
    }
    doc.moveDown(1.5);

    // ── Table header ────────────────────────────────────────────────────
    const tableTop = doc.y;
    const colProduct = 50;
    const colPrice = 310;
    const colQty = 420;
    const colSubtotal = 490;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Producto', colProduct, tableTop);
    doc.text('Precio Unit.', colPrice, tableTop, { width: 90, align: 'right' });
    doc.text('Cant.', colQty, tableTop, { width: 50, align: 'center' });
    doc.text('Subtotal', colSubtotal, tableTop, { width: 80, align: 'right' });

    const headerBottom = doc.y + 4;
    doc.moveTo(50, headerBottom).lineTo(545, headerBottom).stroke();
    doc.y = headerBottom + 8;

    // ── Table rows ──────────────────────────────────────────────────────
    doc.fontSize(10).font('Helvetica');
    for (const item of order.items) {
      const subtotal = item.cantidad * item.precio;
      const rowTop = doc.y;

      doc.text(item.nombre, colProduct, rowTop, { width: 250 });
      doc.text(`$${item.precio.toLocaleString('es-AR')}`, colPrice, rowTop, {
        width: 90,
        align: 'right',
      });
      doc.text(String(item.cantidad), colQty, rowTop, {
        width: 50,
        align: 'center',
      });
      doc.text(`$${subtotal.toLocaleString('es-AR')}`, colSubtotal, rowTop, {
        width: 80,
        align: 'right',
      });

      const lineHeight = doc.currentLineHeight?.() ?? 16;
      doc.y = rowTop + lineHeight + 6;

      // New page if running out of space
      if (doc.y > 720) {
        doc.addPage();
      }
    }

    // ── Total ───────────────────────────────────────────────────────────
    const totalTop = doc.y + 6;
    doc.moveTo(50, totalTop).lineTo(545, totalTop).stroke();
    doc.y = totalTop + 10;

    doc.fontSize(12).font('Helvetica-Bold');
    doc.text(
      `Total: $${order.total.toLocaleString('es-AR')}`,
      colProduct,
      doc.y,
      { align: 'right', width: 480 },
    );
    doc.moveDown(2);

    // ── Thank you ──────────────────────────────────────────────────────
    doc.fontSize(14).font('Helvetica');
    doc.text('¡Gracias por tu compra!', { align: 'center' });

    // Finalize — triggers 'end' event
    doc.end();
  });
}

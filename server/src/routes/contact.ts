/**
 * Contact route — receive messages from the website contact form.
 *
 * POST /api/contact
 *   Body: { name, email, area, message }
 *   Response 201: { success: true, messageId: number }
 *   Response 400: { error: string }
 */

import { Router, Request, Response } from 'express';
import { run, lastInsertId, persist } from '../db.js';
import { getArea, getAllAreas } from '../config/contact-areas.js';
import { sendContactEmail } from '../services/emailService.js';

const router = Router();

/**
 * POST /api/contact
 *
 * Validates fields, inserts into contact_messages, sends notification
 * email (real or mock), and returns the new message ID.
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, email, area, message } = req.body;

    // ── Validation ──────────────────────────────

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'El nombre es obligatorio' });
      return;
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'Email inválido' });
      return;
    }

    if (!area || typeof area !== 'string') {
      res.status(400).json({ error: 'El área es obligatoria' });
      return;
    }

    const areaDef = getArea(area);
    if (!areaDef) {
      res.status(400).json({
        error: `Área inválida. Las áreas disponibles son: ${Object.keys(getAllAreas()).join(', ')}`,
      });
      return;
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      res.status(400).json({ error: 'El mensaje debe tener al menos 10 caracteres' });
      return;
    }

    // ── Insert into DB ──────────────────────────

    run(
      `INSERT INTO contact_messages (name, email, area, message)
       VALUES (?, ?, ?, ?)`,
      [name.trim(), email.trim(), area, message.trim()],
    );

    const newId = lastInsertId();
    persist();

    // ── Send email (fire-and-forget) ────────────

    sendContactEmail({ name: name.trim(), email: email.trim(), area, message: message.trim() })
      .catch((err) => console.error('[contact] Error sending email notification:', err));

    res.status(201).json({ success: true, messageId: newId });
  } catch (err) {
    console.error('[contact] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock db module ────────────────────────────────────────────────────

const mockRun = vi.fn();
const mockLastInsertId = vi.fn();
const mockPersist = vi.fn();

vi.mock('../../src/db.js', () => ({
  run: (...args: unknown[]) => mockRun(...args),
  lastInsertId: (...args: unknown[]) => mockLastInsertId(...args),
  persist: (...args: unknown[]) => mockPersist(...args),
}));

// ─── Mock contact-areas config ─────────────────────────────────────────

vi.mock('../../src/config/contact-areas.js', () => ({
  getArea: vi.fn((slug: string) => {
    const areas: Record<string, { label: string; email: string }> = {
      ventas: { label: 'Ventas', email: 'ventas@rockmerch.com' },
      soporte: { label: 'Soporte Técnico', email: 'soporte@rockmerch.com' },
      reclamos: { label: 'Reclamos', email: 'reclamos@rockmerch.com' },
      prensa: { label: 'Prensa y RRPP', email: 'prensa@rockmerch.com' },
      otros: { label: 'Otros', email: 'contacto@rockmerch.com' },
    };
    return areas[slug];
  }),
  getAllAreas: vi.fn(() => ({
    ventas: { label: 'Ventas', email: 'ventas@rockmerch.com' },
    soporte: { label: 'Soporte Técnico', email: 'soporte@rockmerch.com' },
    reclamos: { label: 'Reclamos', email: 'reclamos@rockmerch.com' },
    prensa: { label: 'Prensa y RRPP', email: 'prensa@rockmerch.com' },
    otros: { label: 'Otros', email: 'contacto@rockmerch.com' },
  })),
}));

// ─── Mock email service ────────────────────────────────────────────────

const mockSendContactEmail = vi.fn().mockResolvedValue(undefined);

vi.mock('../../src/services/emailService.js', () => ({
  sendContactEmail: (...args: unknown[]) => mockSendContactEmail(...args),
}));

// Import after mocks
import contactRouter from '../../src/routes/contact.js';

/**
 * Helper: simulate a POST request to the contact router handler.
 * Calls the POST '/' route handler directly with mock req/res.
 */
function callPostContact(
  body: Record<string, unknown>,
): Promise<{ status: number; data: any }> {
  return new Promise((resolve) => {
    let statusCode = 200;
    const req = { body } as any;
    const res = {
      status: vi.fn((code: number) => {
        statusCode = code;
        return res;
      }),
      json: vi.fn((data: any) => resolve({ status: statusCode, data })),
    } as any;

    // Find the POST '/' route registered on the router
    const route = (contactRouter as any).stack.find(
      (layer: any) => layer.route && layer.route.methods.post && layer.route.path === '/',
    );

    if (!route) {
      resolve({ status: 500, data: { error: 'Route not found' } });
      return;
    }

    // Call the handler stack
    const handlers = route.route.stack.map((s: any) => s.handle);
    let idx = 0;
    const next = () => {
      if (idx < handlers.length) {
        handlers[idx++](req, res, next);
      }
    };
    next();
  });
}

describe('POST /api/contact', () => {
  const validBody = {
    name: 'Juan Pérez',
    email: 'juan@example.com',
    area: 'ventas',
    message: 'Quiero consultar sobre precios de remeras',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLastInsertId.mockReturnValue(42);
  });

  // ── CA-1: Valid input → 201 ─────────────────────────────────────────

  it('datos válidos devuelven 201 con success y messageId', async () => {
    const { status, data } = await callPostContact(validBody);

    expect(status).toBe(201);
    expect(data).toEqual({ success: true, messageId: 42 });
    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO contact_messages'),
      ['Juan Pérez', 'juan@example.com', 'ventas', 'Quiero consultar sobre precios de remeras'],
    );
    expect(mockPersist).toHaveBeenCalled();
    expect(mockSendContactEmail).toHaveBeenCalledWith({
      name: 'Juan Pérez',
      email: 'juan@example.com',
      area: 'ventas',
      message: 'Quiero consultar sobre precios de remeras',
    });
  });

  // ── CA-2: Missing name → 400 ────────────────────────────────────────

  it('nombre faltante devuelve 400', async () => {
    const { status, data } = await callPostContact({
      ...validBody,
      name: '',
    });

    expect(status).toBe(400);
    expect(data).toEqual(expect.objectContaining({ error: expect.stringContaining('nombre') }));
    expect(mockRun).not.toHaveBeenCalled();
  });

  // ── CA-3: Invalid email → 400 ───────────────────────────────────────

  it('email inválido (sin @) devuelve 400', async () => {
    const { status, data } = await callPostContact({
      ...validBody,
      email: 'invalido',
    });

    expect(status).toBe(400);
    expect(data).toEqual(expect.objectContaining({ error: expect.stringContaining('Email') }));
    expect(mockRun).not.toHaveBeenCalled();
  });

  // ── CA-4: Missing email → 400 ───────────────────────────────────────

  it('email faltante devuelve 400', async () => {
    const { status, data } = await callPostContact({
      ...validBody,
      email: '',
    });

    expect(status).toBe(400);
    expect(data).toEqual(expect.objectContaining({ error: expect.stringContaining('Email') }));
    expect(mockRun).not.toHaveBeenCalled();
  });

  // ── CA-5: Invalid area → 400 ────────────────────────────────────────

  it('área inválida devuelve 400', async () => {
    const { status, data } = await callPostContact({
      ...validBody,
      area: 'finanzas',
    });

    expect(status).toBe(400);
    expect(data).toEqual(expect.objectContaining({ error: expect.stringContaining('Área') }));
    expect(mockRun).not.toHaveBeenCalled();
  });

  // ── CA-6: Message too short → 400 ───────────────────────────────────

  it('mensaje muy corto (< 10 caracteres) devuelve 400', async () => {
    const { status, data } = await callPostContact({
      ...validBody,
      message: 'corto',
    });

    expect(status).toBe(400);
    expect(data).toEqual(expect.objectContaining({ error: expect.stringContaining('mensaje') }));
    expect(mockRun).not.toHaveBeenCalled();
  });

  // ── CA-7: Empty body → 400 ──────────────────────────────────────────

  it('body vacío devuelve 400', async () => {
    const { status, data } = await callPostContact({});

    expect(status).toBe(400);
    expect(data).toEqual(expect.objectContaining({ error: expect.any(String) }));
    expect(mockRun).not.toHaveBeenCalled();
  });
});

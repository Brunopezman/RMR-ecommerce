import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { sendContactMessage, getContactAreas } from '../services/contactService';
import { useContact } from '../hooks/useContact';

// ─── Helpers ───────────────────────────────────────────────────────────

const mockJsonResponse = (data, status = 200) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });

const VALID_CONTACT_DATA = {
  name: 'Juan Pérez',
  email: 'juan@example.com',
  area: 'ventas',
  subject: 'Consulta sobre precios',
  message: 'Quisiera saber si tienen remeras de Queen en talle L.',
};

// ───────────────────────────────────────────────────────────────────────
//  contactService — sendContactMessage
// ───────────────────────────────────────────────────────────────────────

describe('sendContactMessage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  // ── Success ──────────────────────────────────────────────────────────

  it('datos válidos devuelven { success, messageId } con HTTP 201', async () => {
    globalThis.fetch.mockResolvedValue(
      mockJsonResponse({ success: true, messageId: 42 }, 201),
    );

    const result = await sendContactMessage(VALID_CONTACT_DATA);

    expect(result).toEqual({ success: true, messageId: 42 });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/contact'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('Juan Pérez'),
      }),
    );
  });

  // ── Validation errors (400) ──────────────────────────────────────────

  it('HTTP 400 con error descriptivo lanza Error', async () => {
    globalThis.fetch.mockResolvedValue(
      mockJsonResponse({ error: 'El nombre es obligatorio' }, 400),
    );

    await expect(sendContactMessage(VALID_CONTACT_DATA)).rejects.toThrow(
      'El nombre es obligatorio',
    );
  });

  it('HTTP 400 con msg alternativo lanza Error', async () => {
    globalThis.fetch.mockResolvedValue(
      mockJsonResponse({ msg: 'Email inválido' }, 400),
    );

    await expect(sendContactMessage(VALID_CONTACT_DATA)).rejects.toThrow(
      'Email inválido',
    );
  });

  // ── Server error (500) ───────────────────────────────────────────────

  it('HTTP 500 sin body parseable lanza Error genérico', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('parse error')),
    });

    await expect(sendContactMessage(VALID_CONTACT_DATA)).rejects.toThrow(
      'Error del servidor',
    );
  });

  // ── Network error ────────────────────────────────────────────────────

  it('error de red lanza Error con mensaje amigable', async () => {
    globalThis.fetch.mockRejectedValue(new Error('Failed to fetch'));

    await expect(sendContactMessage(VALID_CONTACT_DATA)).rejects.toThrow(
      'No se pudo enviar el mensaje',
    );
  });

  it('error de red TypeError se captura correctamente', async () => {
    globalThis.fetch.mockRejectedValue(new TypeError('NetworkError'));

    await expect(sendContactMessage(VALID_CONTACT_DATA)).rejects.toThrow(
      'No se pudo enviar el mensaje',
    );
  });

  // ── Empty body response (no JSON) ────────────────────────────────────

  it('respuesta sin JSON parseable lanza error con HTTP status', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('Unexpected token')),
    });

    await expect(sendContactMessage(VALID_CONTACT_DATA)).rejects.toThrow(
      'Error del servidor',
    );
  });
});

// ───────────────────────────────────────────────────────────────────────
//  contactService — getContactAreas
// ───────────────────────────────────────────────────────────────────────

describe('getContactAreas', () => {
  it('devuelve las 5 áreas de contacto', () => {
    const areas = getContactAreas();
    expect(areas).toHaveLength(5);
    expect(areas.map((a) => a.value)).toEqual([
      'ventas',
      'soporte',
      'reclamos',
      'prensa',
      'otros',
    ]);
  });

  it('cada área tiene value, label y description', () => {
    const areas = getContactAreas();
    areas.forEach((area) => {
      expect(area).toHaveProperty('value');
      expect(area).toHaveProperty('label');
      expect(area).toHaveProperty('description');
    });
  });
});

// ───────────────────────────────────────────────────────────────────────
//  useContact — hook
// ───────────────────────────────────────────────────────────────────────

describe('useContact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  it('estado inicial: loading=false, success=false, error=null, messageId=null', () => {
    const { result } = renderHook(() => useContact());

    expect(result.current.loading).toBe(false);
    expect(result.current.success).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.messageId).toBeNull();
  });

  it('submit exitoso actualiza success y messageId', async () => {
    globalThis.fetch.mockResolvedValue(
      mockJsonResponse({ success: true, messageId: 99 }, 201),
    );

    const { result } = renderHook(() => useContact());

    act(() => {
      result.current.submit(VALID_CONTACT_DATA);
    });

    // Should be loading immediately
    expect(result.current.loading).toBe(true);

    // Wait for completion
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.success).toBe(true);
    expect(result.current.messageId).toBe(99);
    expect(result.current.error).toBeNull();
  });

  it('submit fallido actualiza error', async () => {
    globalThis.fetch.mockResolvedValue(
      mockJsonResponse({ error: 'Email inválido' }, 400),
    );

    const { result } = renderHook(() => useContact());

    act(() => {
      result.current.submit(VALID_CONTACT_DATA);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.success).toBe(false);
    expect(result.current.error).toBe('Email inválido');
    expect(result.current.messageId).toBeNull();
  });

  it('submit con error de red captura excepción', async () => {
    globalThis.fetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useContact());

    act(() => {
      result.current.submit(VALID_CONTACT_DATA);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.success).toBe(false);
    expect(result.current.error).toContain('No se pudo enviar el mensaje');
  });

  it('reset limpia el estado al inicial', async () => {
    globalThis.fetch.mockResolvedValue(
      mockJsonResponse({ success: true, messageId: 42 }, 201),
    );

    const { result } = renderHook(() => useContact());

    // Submit successfully
    act(() => {
      result.current.submit(VALID_CONTACT_DATA);
    });

    await waitFor(() => {
      expect(result.current.success).toBe(true);
    });

    // Now reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.success).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.messageId).toBeNull();
  });
});

/**
 * Unit tests for the central email service and templates.
 *
 * These tests validate that:
 * 1. sendEmail works in mock mode (no SMTP env vars)
 * 2. Templates include expected dynamic content
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock nodemailer ────────────────────────────────────────────────────

vi.mock('nodemailer', () => {
  const mockSendMail = vi.fn().mockResolvedValue({ messageId: 'mock-id' });
  const mockCreateTransport = vi.fn(() => ({
    sendMail: mockSendMail,
  }));
  return {
    default: {
      createTransport: mockCreateTransport,
    },
  };
});

// Import after mocks
import { sendEmail } from '../../src/services/emailService.js';
import {
  welcomeTemplate,
  orderConfirmationTemplate,
  contactTemplate,
} from '../../src/services/emailTemplates.js';

// ─── Test data ──────────────────────────────────────────────────────────

const sampleOrder = {
  id: 101,
  userId: 42,
  items: [
    { productId: 1, nombre: 'Remera The Beatles', precio: 4000, cantidad: 2 },
    { productId: 14, nombre: 'Gorra Nirvana', precio: 1500, cantidad: 1 },
  ],
  total: 9500,
  status: 'pending' as const,
  createdAt: '2026-07-20T10:30:00.000Z',
  shippingAddress: 'Av. Siempre Viva 123, Springfield',
};

const sampleUser = { name: 'Juan Pérez', email: 'juan@example.com' };

const sampleContact = {
  name: 'María García',
  email: 'maria@example.com',
  area: 'Ventas',
  message: 'Hola, quería consultar por el precio de las remeras de AC/DC en talle XL.',
};

// ─── Tests ──────────────────────────────────────────────────────────────

describe('emailService', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Spy on console.log to verify mock output
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    // Clear SMTP env vars so we stay in mock mode
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
  });

  describe('sendEmail', () => {
    it('loguea a consola con tag [EMAIL_MOCK] cuando no hay SMTP configurado', async () => {
      await sendEmail('test@example.com', 'Test Asunto', '<p>Hola</p>');

      // Should have logged the mock message
      const mockCalls = consoleLogSpy.mock.calls;
      const mockTagCall = mockCalls.find(
        ([msg]: string[]) => typeof msg === 'string' && msg.includes('[EMAIL_MOCK]'),
      );
      expect(mockTagCall).toBeDefined();
      expect(mockTagCall![0]).toContain('[EMAIL_MOCK]');
    });

    it('incluye el destinatario y asunto en el log mock', async () => {
      await sendEmail('cliente@test.com', 'Asunto de prueba', '<p>Contenido</p>');

      const mockCalls = consoleLogSpy.mock.calls;
      const logText = mockCalls.map(([msg]: string[]) => msg).join(' ');

      expect(logText).toContain('cliente@test.com');
      expect(logText).toContain('Asunto de prueba');
    });
  });

  describe('sendWelcomeEmail', () => {
    it('envía email mock sin errores', async () => {
      // Dynamic import to get fresh module state
      const { sendWelcomeEmail } = await import('../../src/services/emailService.js');
      await sendWelcomeEmail(sampleUser);

      const mockCalls = consoleLogSpy.mock.calls;
      const mockTagCall = mockCalls.find(
        ([msg]: string[]) => typeof msg === 'string' && msg.includes('[EMAIL_MOCK]'),
      );
      expect(mockTagCall).toBeDefined();
    });
  });

  describe('sendOrderConfirmationEmail', () => {
    it('envía email mock sin errores', async () => {
      const { sendOrderConfirmationEmail } = await import('../../src/services/emailService.js');
      await sendOrderConfirmationEmail(sampleOrder, sampleUser);

      const mockCalls = consoleLogSpy.mock.calls;
      const mockTagCall = mockCalls.find(
        ([msg]: string[]) => typeof msg === 'string' && msg.includes('[EMAIL_MOCK]'),
      );
      expect(mockTagCall).toBeDefined();
    });

    it('incluye el PDF en el log mock cuando se pasa pdfBuffer', async () => {
      const { sendOrderConfirmationEmail } = await import('../../src/services/emailService.js');
      const pdfBuffer = Buffer.from('%PDF-1.4 mock pdf content');
      await sendOrderConfirmationEmail(sampleOrder, sampleUser, pdfBuffer);

      const mockCalls = consoleLogSpy.mock.calls;
      const logText = mockCalls.map(([msg]: string[]) => String(msg)).join(' ');
      expect(logText).toContain('compra-rockmerch.pdf');
      expect(logText).toContain(String(pdfBuffer.length));
    });
  });

  describe('sendContactEmail', () => {
    it('envía email mock sin errores', async () => {
      const { sendContactEmail } = await import('../../src/services/emailService.js');
      await sendContactEmail(sampleContact);

      const mockCalls = consoleLogSpy.mock.calls;
      const mockTagCall = mockCalls.find(
        ([msg]: string[]) => typeof msg === 'string' && msg.includes('[EMAIL_MOCK]'),
      );
      expect(mockTagCall).toBeDefined();
    });
  });
});

describe('emailTemplates', () => {
  describe('welcomeTemplate', () => {
    it('incluye el nombre del usuario en el HTML', () => {
      const html = welcomeTemplate('Carlos López');
      expect(html).toContain('Carlos López');
    });

    it('incluye el link al catálogo con APP_URL', () => {
      const html = welcomeTemplate('Test');
      expect(html).toContain('href="http://localhost:3000"');
    });

    it('incluye el texto de bienvenida', () => {
      const html = welcomeTemplate('Ana');
      expect(html).toContain('Bienvenido');
      expect(html).toContain('Rock Merch');
    });
  });

  describe('orderConfirmationTemplate', () => {
    it('incluye el total de la orden y lo muestra formateado', () => {
      const html = orderConfirmationTemplate(sampleOrder, sampleUser);
      expect(html).toContain('9.500,00');
    });

    it('incluye los items de la orden en la tabla', () => {
      const html = orderConfirmationTemplate(sampleOrder, sampleUser);
      expect(html).toContain('Remera The Beatles');
      expect(html).toContain('Gorra Nirvana');
    });

    it('incluye el nombre del usuario', () => {
      const html = orderConfirmationTemplate(sampleOrder, { name: 'Juan Pérez' });
      expect(html).toContain('Juan Pérez');
    });

    it('incluye el ID de la orden', () => {
      const html = orderConfirmationTemplate(sampleOrder, sampleUser);
      expect(html).toContain('#101');
    });

    it('incluye la dirección de envío cuando está definida', () => {
      const html = orderConfirmationTemplate(sampleOrder, sampleUser);
      expect(html).toContain('Av. Siempre Viva 123');
    });

    it('no incluye dirección de envío si no está definida', () => {
      const orderWithoutShipping = { ...sampleOrder, shippingAddress: undefined };
      const html = orderConfirmationTemplate(orderWithoutShipping, sampleUser);
      expect(html).not.toContain('Dirección de envío');
    });
  });

  describe('contactTemplate', () => {
    it('incluye el área del mensaje', () => {
      const html = contactTemplate(sampleContact);
      expect(html).toContain('Ventas');
    });

    it('incluye el contenido del mensaje', () => {
      const html = contactTemplate(sampleContact);
      expect(html).toContain('remeras de AC/DC');
    });

    it('incluye los datos del remitente', () => {
      const html = contactTemplate(sampleContact);
      expect(html).toContain('María García');
      expect(html).toContain('maria@example.com');
    });

    it('escapa HTML en los valores para prevenir inyección', () => {
      const malicious = {
        name: '<script>alert("xss")</script>',
        email: 'hacker@example.com',
        area: 'Seguridad',
        message: 'Mensaje con <b>HTML</b>',
      };
      const html = contactTemplate(malicious);
      expect(html).toContain('&lt;script&gt;');
      expect(html).not.toContain('<script>');
    });
  });
});

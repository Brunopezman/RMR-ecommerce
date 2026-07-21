import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactPage } from '../components/contact/ContactPage';

// ─── Mocks ──────────────────────────────────────────────────────────────

const mockSubmit = vi.fn();
const mockReset = vi.fn();
const mockShowToast = vi.fn();
const mockNavigate = vi.fn();

let mockLoading = false;
let mockSuccess = false;
let mockError: string | null = null;
let mockMessageId: number | null = null;

vi.mock('../hooks/useContact', () => ({
  useContact: () => ({
    loading: mockLoading,
    success: mockSuccess,
    error: mockError,
    messageId: mockMessageId,
    submit: mockSubmit,
    reset: mockReset,
  }),
}));

vi.mock('../components/ui/Toast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock('../services/router', () => ({
  navigate: (...args: unknown[]) => mockNavigate(...args),
}));

vi.mock('../components/layout/Header', () => ({
  Header: () => <div data-testid="mock-header">Header</div>,
}));

// ─── Helpers ────────────────────────────────────────────────────────────

function renderPage() {
  return render(<ContactPage />);
}

function fillValidForm() {
  const user = userEvent.setup();

  return {
    typeName: async () =>
      await user.type(screen.getByLabelText(/^Nombre/), 'Juan Pérez'),
    typeEmail: async () =>
      await user.type(screen.getByLabelText(/^Email/), 'juan@example.com'),
    typeSubject: async () =>
      await user.type(screen.getByLabelText(/^Asunto/), 'Consulta sobre precios'),
    typeMessage: async () =>
      await user.type(
        screen.getByLabelText(/^Mensaje/),
        'Quisiera saber si tienen remeras de Queen en talle L.',
      ),
    all: async () => {
      await user.type(screen.getByLabelText(/^Nombre/), 'Juan Pérez');
      await user.type(screen.getByLabelText(/^Email/), 'juan@example.com');
      await user.type(screen.getByLabelText(/^Asunto/), 'Consulta sobre precios');
      await user.type(
        screen.getByLabelText(/^Mensaje/),
        'Quisiera saber si tienen remeras de Queen en talle L.',
      );
    },
  };
}

// ────────────────────────────────────────────────────────────────────────
//  ContactPage — Formulario
// ────────────────────────────────────────────────────────────────────────

describe('ContactPage — formulario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading = false;
    mockSuccess = false;
    mockError = null;
    mockMessageId = null;
  });

  // ── 1. Renderiza título ───────────────────────────────────────────────

  it('renderiza el título "Contacto"', () => {
    renderPage();
    expect(
      screen.getByRole('heading', { name: 'Contacto' }),
    ).toBeInTheDocument();
  });

  // ── 2. Renderiza Header ───────────────────────────────────────────────

  it('renderiza el Header', () => {
    renderPage();
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
  });

  // ── 3. Renderiza todos los campos del formulario ──────────────────────

  it('muestra todos los campos del formulario', () => {
    renderPage();

    // Campos requeridos con asterisco
    expect(screen.getByLabelText(/^Nombre/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Email/)).toBeInTheDocument();

    // Campo opcional
    expect(screen.getByLabelText(/^Teléfono/)).toBeInTheDocument();

    // Select de área
    expect(screen.getByLabelText(/^Área/)).toBeInTheDocument();

    // Asunto y Mensaje
    expect(screen.getByLabelText(/^Asunto/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Mensaje/)).toBeInTheDocument();
  });

  // ── 4. Renderiza las 5 áreas de contacto en el select ────────────────

  it('muestra las 5 áreas de contacto en el select', () => {
    renderPage();

    const select = screen.getByLabelText(/^Área/);
    expect(select).toBeInTheDocument();

    // Opciones esperadas
    expect(screen.getByRole('option', { name: 'Ventas' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Soporte' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Reclamos' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Prensa' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Otros' })).toBeInTheDocument();
  });

  // ── 5. Botones de acción ─────────────────────────────────────────────

  it('muestra botón "Enviar mensaje" y "Cancelar"', () => {
    renderPage();

    expect(
      screen.getByRole('button', { name: 'Enviar mensaje' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Cancelar' }),
    ).toBeInTheDocument();
  });
});

// ────────────────────────────────────────────────────────────────────────
//  ContactPage — Validación inline
// ────────────────────────────────────────────────────────────────────────

describe('ContactPage — validación inline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading = false;
    mockSuccess = false;
    mockError = null;
    mockMessageId = null;
  });

  // ── 6. Submit vacío muestra errores requeridos ───────────────────────

  it('submit vacío muestra errores requeridos', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    // Validamos que se muestren los mensajes de error
    await waitFor(() => {
      expect(
        screen.getByText('El nombre debe tener al menos 2 caracteres.'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('El email es obligatorio.'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('El asunto debe tener al menos 3 caracteres.'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('El mensaje es obligatorio.'),
      ).toBeInTheDocument();
    });

    // NO debe llamarse submit
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  // ── 7. Email inválido ────────────────────────────────────────────────

  it('email inválido muestra error de formato', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/^Email/), 'email-invalido');
    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    await waitFor(() => {
      expect(
        screen.getByText('Formato de email inválido.'),
      ).toBeInTheDocument();
    });

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  // ── 8. Nombre muy corto ──────────────────────────────────────────────

  it('nombre de 1 carácter muestra error', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/^Nombre/), 'A');
    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    await waitFor(() => {
      expect(
        screen.getByText('El nombre debe tener al menos 2 caracteres.'),
      ).toBeInTheDocument();
    });
  });

  // ── 9. Asunto muy corto ──────────────────────────────────────────────

  it('asunto de 2 caracteres muestra error', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/^Asunto/), 'AB');
    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    await waitFor(() => {
      expect(
        screen.getByText('El asunto debe tener al menos 3 caracteres.'),
      ).toBeInTheDocument();
    });
  });

  // ── 10. Mensaje muy corto ────────────────────────────────────────────

  it('mensaje de menos de 10 caracteres muestra error', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/^Mensaje/), 'Corto');
    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    await waitFor(() => {
      expect(
        screen.getByText('El mensaje debe tener al menos 10 caracteres.'),
      ).toBeInTheDocument();
    });
  });

  // ── 11. Mensaje con más de 2000 caracteres muestra error ─────────────

  it('mensaje de más de 2000 caracteres muestra error', async () => {
    const user = userEvent.setup();
    renderPage();

    // Usamos fireEvent.change para bypasear maxLength={2000} del textarea
    // (simula un pegado de texto que supera el límite)
    const longMessage = 'A'.repeat(2001);
    const messageInput = screen.getByLabelText(/^Mensaje/);
    fireEvent.change(messageInput, { target: { value: longMessage } });

    await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }));

    await waitFor(() => {
      expect(
        screen.getByText('El mensaje no puede exceder los 2000 caracteres.'),
      ).toBeInTheDocument();
    });
  });
});

// ────────────────────────────────────────────────────────────────────────
//  ContactPage — Submit exitoso
// ────────────────────────────────────────────────────────────────────────

describe('ContactPage — submit exitoso', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading = false;
    mockSuccess = true;
    mockError = null;
    mockMessageId = 123;
  });

  // ── 12. Muestra pantalla de confirmación ─────────────────────────────

  it('submit exitoso muestra pantalla de confirmación con messageId', () => {
    renderPage();

    expect(
      screen.getByText('¡Mensaje enviado con éxito!'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Número de seguimiento: #123'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Volver al inicio' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Enviar otro mensaje' }),
    ).toBeInTheDocument();
  });

  // ── 13. Muestra toast de éxito ───────────────────────────────────────

  it('submit exitoso dispara showToast con mensaje de éxito', () => {
    renderPage();
    expect(mockShowToast).toHaveBeenCalledWith(
      'Mensaje enviado con éxito',
      'success',
    );
  });

  // ── 14. "Enviar otro mensaje" resetea el formulario ──────────────────

  it('clic en "Enviar otro mensaje" llama a reset', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Enviar otro mensaje' }));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  // ── 15. "Volver al inicio" navega a / ────────────────────────────────

  it('clic en "Volver al inicio" navega a /', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Volver al inicio' }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

// ────────────────────────────────────────────────────────────────────────
//  ContactPage — Submit con error
// ────────────────────────────────────────────────────────────────────────

describe('ContactPage — submit con error', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading = false;
    mockSuccess = false;
    mockError = 'Error del servidor: el nombre es obligatorio';
    mockMessageId = null;
  });

  // ── 16. Muestra error en banner rojo ─────────────────────────────────

  it('error muestra banner rojo con el mensaje', () => {
    renderPage();

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent(
      'Error del servidor: el nombre es obligatorio',
    );
  });

  // ── 17. Muestra toast de error ───────────────────────────────────────

  it('error dispara showToast con mensaje de error', () => {
    renderPage();
    expect(mockShowToast).toHaveBeenCalledWith(
      'Error del servidor: el nombre es obligatorio',
      'error',
    );
  });
});

// ────────────────────────────────────────────────────────────────────────
//  ContactPage — Estado loading
// ────────────────────────────────────────────────────────────────────────

describe('ContactPage — estado loading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading = true;
    mockSuccess = false;
    mockError = null;
    mockMessageId = null;
  });

  // ── 18. Botón muestra "Enviando..." y está deshabilitado ─────────────

  it('durante loading, botón muestra "Enviando..." y está deshabilitado', () => {
    renderPage();

    const submitBtn = screen.getByRole('button', { name: 'Enviando...' });
    expect(submitBtn).toBeDisabled();

    const cancelBtn = screen.getByRole('button', { name: 'Cancelar' });
    expect(cancelBtn).toBeDisabled();
  });

  // ── 19. Inputs deshabilitados durante loading ────────────────────────

  it('durante loading, los campos están deshabilitados', () => {
    renderPage();

    expect(screen.getByLabelText(/^Nombre/)).toBeDisabled();
    expect(screen.getByLabelText(/^Email/)).toBeDisabled();
    expect(screen.getByLabelText(/^Teléfono/)).toBeDisabled();
    expect(screen.getByLabelText(/^Área/)).toBeDisabled();
    expect(screen.getByLabelText(/^Asunto/)).toBeDisabled();
    expect(screen.getByLabelText(/^Mensaje/)).toBeDisabled();
  });
});

// ────────────────────────────────────────────────────────────────────────
//  ContactPage — Navegación Cancelar
// ────────────────────────────────────────────────────────────────────────

describe('ContactPage — botón Cancelar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoading = false;
    mockSuccess = false;
    mockError = null;
    mockMessageId = null;
  });

  // ── 20. Cancelar navega a / ──────────────────────────────────────────

  it('clic en Cancelar navega a /', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

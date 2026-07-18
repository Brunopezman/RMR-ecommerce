import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegisterPage } from '../components/auth/RegisterPage';

// ── Mocks ──────────────────────────────────────────────────────────────

const mockRegister = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    register: mockRegister,
    login: vi.fn(),
    logout: vi.fn(),
    user: null,
    token: null,
    isAuthenticated: false,
  }),
}));

vi.mock('../services/router', () => ({
  navigate: (...args) => mockNavigate(...args),
}));

// ── Helper ─────────────────────────────────────────────────────────────

function renderPage() {
  return render(<RegisterPage />);
}

describe('RegisterPage — Página de registro standalone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 1. Renderiza título ─────────────────────────────────────────────

  it('renderiza título "Crear Cuenta"', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Crear Cuenta' })).toBeInTheDocument();
  });

  // ── 2. Renderiza todos los 9 campos ─────────────────────────────────

  it('renderiza todos los 9 campos del formulario', () => {
    renderPage();

    expect(screen.getByLabelText(/^Nombre/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Apellido/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Correo electrónico/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Contraseña/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirmar contraseña/)).toBeInTheDocument();
    expect(screen.getByLabelText('Dirección')).toBeInTheDocument();
    expect(screen.getByLabelText('Código Postal')).toBeInTheDocument();
    expect(screen.getByLabelText('Sexo')).toBeInTheDocument();
    expect(screen.getByLabelText('Teléfono')).toBeInTheDocument();
  });

  // ── 3. Renderiza botones ────────────────────────────────────────────

  it('renderiza botón "Crear Cuenta" y botón "Cancelar"', () => {
    renderPage();

    expect(screen.getByRole('button', { name: 'Crear Cuenta' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
  });

  // ── 4. Error si Nombre vacío ────────────────────────────────────────

  it('muestra error si Nombre está vacío al submit', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument();
    });
  });

  // ── 5. Error si Apellido vacío ──────────────────────────────────────

  it('muestra error si Apellido está vacío al submit', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('El apellido es obligatorio.')).toBeInTheDocument();
    });
  });

  // ── 6. Error si email inválido ──────────────────────────────────────

  it('muestra error si email tiene formato inválido', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/^Nombre/), 'Juan');
    await user.type(screen.getByLabelText(/^Apellido/), 'Pérez');
    await user.type(screen.getByLabelText(/^Correo electrónico/), 'email-invalido');
    await user.type(screen.getByLabelText(/^Contraseña/), '123456');
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), '123456');

    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('Formato de email inválido.')).toBeInTheDocument();
    });
  });

  // ── 7. Error si contraseña < 6 ──────────────────────────────────────

  it('muestra error si contraseña tiene menos de 6 caracteres', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/^Nombre/), 'Juan');
    await user.type(screen.getByLabelText(/^Apellido/), 'Pérez');
    await user.type(screen.getByLabelText(/^Correo electrónico/), 'juan@test.com');
    await user.type(screen.getByLabelText(/^Contraseña/), '12345');
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), '12345');

    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('La contraseña debe tener al menos 6 caracteres.')).toBeInTheDocument();
    });
  });

  // ── 8. Error si confirmación no coincide ─────────────────────────────

  it('muestra error si confirmar contraseña no coincide', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/^Nombre/), 'Juan');
    await user.type(screen.getByLabelText(/^Apellido/), 'Pérez');
    await user.type(screen.getByLabelText(/^Correo electrónico/), 'juan@test.com');
    await user.type(screen.getByLabelText(/^Contraseña/), '123456');
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), '654321');

    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
    });
  });

  // ── 9. Llama a register con datos correctos y navega ────────────────

  it('llama a register con datos correctos y navega a "/" en éxito', async () => {
    mockRegister.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/^Nombre/), 'Juan');
    await user.type(screen.getByLabelText(/^Apellido/), 'Pérez');
    await user.type(screen.getByLabelText(/^Correo electrónico/), 'juan@test.com');
    await user.type(screen.getByLabelText(/^Contraseña/), '123456');
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), '123456');
    await user.type(screen.getByLabelText('Dirección'), 'Av. Siempre Viva 123');
    await user.type(screen.getByLabelText('Código Postal'), '1000');
    await user.type(screen.getByLabelText('Teléfono'), '123456789');

    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'juan@test.com',
        '123456',
        {
          name: 'Juan',
          apellido: 'Pérez',
          address: 'Av. Siempre Viva 123',
          codigoPostal: '1000',
          sexo: undefined,
          telefono: '123456789',
        },
      );
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  // ── 10. Llama a register con sexo seleccionado ──────────────────────

  it('llama a register con sexo seleccionado', async () => {
    mockRegister.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/^Nombre/), 'Ana');
    await user.type(screen.getByLabelText(/^Apellido/), 'García');
    await user.type(screen.getByLabelText(/^Correo electrónico/), 'ana@test.com');
    await user.type(screen.getByLabelText(/^Contraseña/), '123456');
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), '123456');

    await user.selectOptions(screen.getByLabelText('Sexo'), 'Femenino');

    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        'ana@test.com',
        '123456',
        expect.objectContaining({ sexo: 'Femenino' }),
      );
    });
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  // ── 11. Error general si register lanza excepción ───────────────────

  it('muestra error general si register lanza excepción', async () => {
    mockRegister.mockRejectedValueOnce(new Error('El email ya está registrado.'));
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/^Nombre/), 'Juan');
    await user.type(screen.getByLabelText(/^Apellido/), 'Pérez');
    await user.type(screen.getByLabelText(/^Correo electrónico/), 'existente@test.com');
    await user.type(screen.getByLabelText(/^Contraseña/), '123456');
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), '123456');

    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(screen.getByText('El email ya está registrado.')).toBeInTheDocument();
    });
  });

  // ── 12. Deshabilita inputs durante loading ──────────────────────────

  it('deshabilita inputs y botón durante el loading', async () => {
    mockRegister.mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/^Nombre/), 'Juan');
    await user.type(screen.getByLabelText(/^Apellido/), 'Pérez');
    await user.type(screen.getByLabelText(/^Correo electrónico/), 'juan@test.com');
    await user.type(screen.getByLabelText(/^Contraseña/), '123456');
    await user.type(screen.getByLabelText(/^Confirmar contraseña/), '123456');

    await user.click(screen.getByRole('button', { name: 'Crear Cuenta' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Creando cuenta...' })).toBeDisabled();
      expect(screen.getByLabelText(/^Nombre/)).toBeDisabled();
      expect(screen.getByLabelText(/^Apellido/)).toBeDisabled();
      expect(screen.getByLabelText(/^Correo electrónico/)).toBeDisabled();
      expect(screen.getByLabelText(/^Contraseña/)).toBeDisabled();
      expect(screen.getByLabelText(/^Confirmar contraseña/)).toBeDisabled();
    });
  });

  // ── 13. Botón Cancelar navega a "/" ─────────────────────────────────

  it('botón Cancelar navega a "/"', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  // ── 14. No renderiza disclaimer de login demostrativo ───────────────

  it('no renderiza el disclaimer de login demostrativo', () => {
    renderPage();

    expect(
      screen.queryByText('* Login demostrativo (sin validación real)'),
    ).not.toBeInTheDocument();
  });
});

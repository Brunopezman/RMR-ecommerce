import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginModal } from '../components/auth/LoginModal';

// ── Mock useAuth ────────────────────────────────────────────────────────

const mockLogin = vi.fn();

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    logout: vi.fn(),
    user: null,
    token: null,
    isAuthenticated: false,
  }),
}));

// ── Helper to render the modal ──────────────────────────────────────────

function renderModal(isOpen = true, onClose = vi.fn()) {
  return render(<LoginModal isOpen={isOpen} onClose={onClose} />);
}

describe('LoginModal — Modo Login (comportamiento existente)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('no renderiza nada cuando isOpen=false', () => {
    const { container } = renderModal(false);
    expect(container.innerHTML).toBe('');
  });

  it('renderiza el título "Iniciar Sesión"', () => {
    renderModal();
    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
  });

  it('renderiza los campos email y password', () => {
    renderModal();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
  });

  it('renderiza el botón "Iniciar Sesión"', () => {
    renderModal();
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeInTheDocument();
  });

  it('renderiza el link para crear cuenta', () => {
    renderModal();
    expect(screen.getByText('¿No tenés cuenta? Crear una')).toBeInTheDocument();
  });

  it('llama a login con email y password al submit exitoso', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    const onClose = vi.fn();

    renderModal(true, onClose);

    await user.type(screen.getByLabelText('Correo electrónico'), 'test@test.com');
    await user.type(screen.getByLabelText('Contraseña'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('muestra error si login lanza una excepción', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Credenciales inválidas.'));
    const user = userEvent.setup();

    renderModal();

    await user.type(screen.getByLabelText('Correo electrónico'), 'bad@test.com');
    await user.type(screen.getByLabelText('Contraseña'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    expect(await screen.findByText('Credenciales inválidas.')).toBeInTheDocument();
  });

  it('muestra error si email o password están vacíos', async () => {
    const user = userEvent.setup();
    renderModal();

    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    expect(await screen.findByText('Email y contraseña son obligatorios.')).toBeInTheDocument();
  });

  it('deshabilita inputs y botón durante loading', async () => {
    // Never-resolving promise to keep loading=true
    mockLogin.mockImplementation(() => new Promise(() => {}));
    const user = userEvent.setup();

    renderModal();

    await user.type(screen.getByLabelText('Correo electrónico'), 'a@b.com');
    await user.type(screen.getByLabelText('Contraseña'), 'pass');
    await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));

    // findByRole retries up to 5s to avoid flakiness in full suite
    expect(await screen.findByRole('button', { name: 'Ingresando...' }, { timeout: 5000 })).toBeDisabled();
    expect(screen.getByLabelText('Correo electrónico')).toBeDisabled();
    expect(screen.getByLabelText('Contraseña')).toBeDisabled();
  });
});



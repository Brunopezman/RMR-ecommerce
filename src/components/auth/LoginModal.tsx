import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    setTimeout(() => emailInputRef.current?.focus(), 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      prev?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Email y contraseña son obligatorios.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      setEmail('');
      setPassword('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={modalRef}
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="userModalLabel"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title font-display" id="userModalLabel">
              Acceso / Registro
            </h5>
            <button
              type="button"
              className="btn-close focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
              aria-label="Cerrar"
              onClick={onClose}
            />
          </div>
          <div className="modal-body">
            <small className="text-muted d-block mb-3">
              * Login demostrativo (sin validación real)
            </small>

            {error && (
              <div className="alert alert-danger py-2" role="alert" aria-live="polite">
                {error}
              </div>
            )}

            <form id="loginForm" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="inputEmail" className="form-label">
                  Correo electrónico
                </label>
                <input
                  ref={emailInputRef}
                  type="email"
                  className="form-control focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
                  id="inputEmail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="inputPassword" className="form-label">
                  Contraseña
                </label>
                <input
                  type="password"
                  className="form-control focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
                  id="inputPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-black text-white border-none py-3 px-7 font-display uppercase font-bold text-sm transition-colors duration-300 hover:bg-coral-dark cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
                disabled={loading}
              >
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>
            </form>
          </div>
          <div className="modal-footer justify-content-center border-t pt-3">
            <a
              href="#"
              className="btn btn-link text-decoration-none text-black transition-colors duration-300 hover:text-coral-dark focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
              onClick={onClose}
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

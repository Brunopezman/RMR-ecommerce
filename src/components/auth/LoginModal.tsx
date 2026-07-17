import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { navigate } from '../../services/router';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login } = useAuth();

  // ── Login state ──
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  const resetAll = useCallback(() => {
    setLoginEmail('');
    setLoginPassword('');
    setLoginError(null);
    setLoginLoading(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    resetAll();
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
  }, [isOpen, onClose, resetAll]);

  if (!isOpen) return null;

  // ── Login submit ──
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Email y contraseña son obligatorios.');
      return;
    }

    setLoginLoading(true);
    try {
      await login(loginEmail, loginPassword);
      setLoginEmail('');
      setLoginPassword('');
      onClose();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Error al iniciar sesión.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleNavigateRegister = () => {
    onClose();
    navigate('/register');
  };

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="userModalLabel"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h5 className="text-lg font-semibold font-display" id="userModalLabel">
            Iniciar Sesión
          </h5>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none p-1"
            aria-label="Cerrar"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="p-4">
          {loginError && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-3" role="alert" aria-live="polite">
              {loginError}
            </div>
          )}

          <form id="loginForm" onSubmit={handleLoginSubmit}>
            <div className="mb-4">
              <label htmlFor="inputEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                ref={emailInputRef}
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral"
                id="inputEmail"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                disabled={loginLoading}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="inputPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral"
                id="inputPassword"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                disabled={loginLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white border-none py-3 px-7 font-display uppercase font-bold text-sm transition-colors duration-300 hover:bg-coral-dark cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
              disabled={loginLoading}
            >
              {loginLoading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        <div className="flex justify-center p-4 border-t">
          <button
            type="button"
            className="text-sm text-gray-600 hover:text-coral-dark transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none bg-transparent border-none cursor-pointer underline"
            onClick={handleNavigateRegister}
          >
            ¿No tenés cuenta? Crear una
          </button>
        </div>
      </div>
    </div>
  );
}

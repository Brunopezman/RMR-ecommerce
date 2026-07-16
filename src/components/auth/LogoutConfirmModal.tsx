import { useRef, useEffect } from 'react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({ isOpen, onClose, onConfirm }: LogoutConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    setTimeout(() => cancelRef.current?.focus(), 100);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
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

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logoutModalLabel"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="logoutModalLabel"
          className="text-lg font-semibold text-gray-900 mb-2"
        >
          Confirmar cierre de sesión
        </h2>
        <p className="text-gray-600 mb-6">
          ¿Querés cerrar sesión?
        </p>
        <div className="flex justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none cursor-pointer"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="px-4 py-2 border border-transparent rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none cursor-pointer"
            onClick={() => {
              onConfirm();
            }}
          >
            Sí, estoy seguro
          </button>
        </div>
      </div>
    </div>
  );
}

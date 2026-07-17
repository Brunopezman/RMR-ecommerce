import { useRef, useEffect } from 'react';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../ui/Toast';
import { CartItemRow } from './CartItemRow';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, summary, removeItem, clearCart } = useCart();
  const { showToast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

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

  const handleCheckout = () => {
    if (items.length === 0) {
      showToast('Agregá productos al carrito antes de finalizar la compra', 'error');
      return;
    }
    window.location.href = '/checkout';
  };

  return (
    <div
      ref={modalRef}
      className={`modal-contenedor ${isOpen ? 'modal-active' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-modal-title"
    >
      <div className="modal-carrito" onClick={(e) => e.stopPropagation()}>
        <h3 id="cart-modal-title" className="mb-3 font-display font-extrabold text-lg">Carrito</h3>
        <button
          ref={closeButtonRef}
          id="btn-cerrar-carrito"
          className="absolute top-3.5 right-3.5 text-xl text-coral-dark border-none bg-white cursor-pointer p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          onClick={onClose}
          aria-label="Cerrar carrito"
        >
          <i className="bx bxs-x-circle" aria-hidden="true" />
        </button>

        <div id="carrito-contenedor" aria-live="polite" aria-atomic="true">
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-4 font-display">Tu carrito está vacío. Explorá nuestro catálogo y llevate algo piola.</p>
          ) : (
            items.map((item) => (
              <CartItemRow
                key={`${item.id}-${item.talleSeleccionado ?? 'nosize'}`}
                item={item}
                onRemove={removeItem}
              />
            ))
          )}
        </div>

        <p className="mt-3 font-bold font-display text-base">
          Precio Total: $<span id="precioTotal">{summary.totalPrice}</span>
        </p>

        <button
          id="btn-checkout"
          className="w-full bg-black text-white border-none py-3 mt-4 font-display uppercase tracking-wider rounded-lg cursor-pointer transition-colors duration-300 hover:bg-coral-dark text-sm font-bold focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
          onClick={handleCheckout}
        >
          Finalizar Compra
        </button>

        <button
          id="vaciarCarrito"
          className="bg-transparent text-gray-400 border-0 py-1 px-0 mt-2 font-sans text-xs cursor-pointer transition-colors duration-300 hover:text-coral-dark hover:underline focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
          onClick={clearCart}
        >
          Limpiar carrito
        </button>
      </div>
    </div>
  );
}

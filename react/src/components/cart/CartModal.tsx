import { useCart } from '../../hooks/useCart';
import { CartItemRow } from './CartItemRow';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, summary, removeItem, clearCart } = useCart();

  if (!isOpen) return null;

  const handleCheckout = () => {
    if (items.length === 0) {
      // TODO: show toastify notification
      return;
    }
    window.location.href = '/pages/checkout.html';
  };

  return (
    <div
      className={`modal-contenedor ${isOpen ? 'modal-active' : ''}`}
      onClick={onClose}
    >
      <div className="modal-carrito" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-3 font-display font-extrabold text-lg">Carrito</h3>
        <button
          id="btn-cerrar-carrito"
          className="absolute top-3.5 right-3.5 text-xl text-coral border-none bg-white cursor-pointer"
          onClick={onClose}
        >
          <i className="bx bxs-x-circle" />
        </button>

        <div id="carrito-contenedor">
          {items.length === 0 ? (
            <p className="text-muted text-center py-4 font-display">El carrito está vacío</p>
          ) : (
            items.map((item) => (
              <CartItemRow key={item.id} item={item} onRemove={removeItem} />
            ))
          )}
        </div>

        <p className="mt-3 fw-bold font-display text-base">
          Precio Total: $<span id="precioTotal">{summary.totalPrice}</span>
        </p>

        <button
          id="btn-checkout"
          className="w-full bg-black text-white border-none py-3 mt-4 font-display uppercase tracking-wider rounded-md cursor-pointer transition-colors duration-300 hover:bg-coral text-sm font-bold"
          onClick={handleCheckout}
        >
          Finalizar Compra
        </button>

        <button
          id="vaciarCarrito"
          className="w-full bg-transparent text-gray-500 border border-gray-300 py-2 mt-3 font-sans text-xs rounded-md cursor-pointer transition-all duration-300 hover:bg-gray-100 hover:text-coral hover:border-coral"
          onClick={clearCart}
        >
          Limpiar carrito
        </button>
      </div>
    </div>
  );
}

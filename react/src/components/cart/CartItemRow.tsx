import type { CartItem } from '../../types/cart';

interface CartItemRowProps {
  item: CartItem;
  onRemove: (id: number | string) => void;
}

export function CartItemRow({ item, onRemove }: CartItemRowProps) {
  return (
    <div className="productoEnCarrito flex justify-between items-center gap-3 py-2 px-3 my-1 border-l-4 border-blue-200 hover:border-coral rounded-l-sm">
      <p className="mb-0 flex-1 font-display">{item.nombre}</p>
      <p className="mb-0 font-display">Precio: ${item.precio}</p>
      <p className="mb-0 font-display" id={`cantidad${item.id}`}>
        Cantidad: {item.cantidad}
      </p>
      <button
        id="btn-eliminar"
        className="boton-eliminar text-coral border-none text-xl font-display cursor-pointer hover:opacity-80 bg-transparent"
        value={item.id}
        onClick={() => onRemove(item.id)}
      >
        <i className="bx bx-x" />
      </button>
    </div>
  );
}

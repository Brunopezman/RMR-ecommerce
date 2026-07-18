import type { Product } from './product';

/** Item en el carrito — extiende Product con cantidad obligatoria */
export interface CartItem extends Product {
  cantidad: number;
  /** Talle seleccionado al agregar al carrito */
  talle?: string;
}

/** Resumen del carrito */
export interface CartSummary {
  totalItems: number;
  totalPrice: number;
}

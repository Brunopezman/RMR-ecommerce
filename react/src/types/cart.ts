import type { Product } from './product';

/** Item en el carrito — extiende Product con cantidad obligatoria */
export interface CartItem extends Product {
  cantidad: number;
}

/** Resumen del carrito */
export interface CartSummary {
  totalItems: number;
  totalPrice: number;
}

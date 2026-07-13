import type { Product, CartItem, CartSummary } from '../types';

/**
 * Add a product to cart items.
 * If product already exists, increment its quantity.
 * Otherwise, add new item with quantity 1.
 */
export function addToCart(
  items: CartItem[],
  product: Product,
): CartItem[] {
  const existing = items.find((item) => item.id === product.id);
  if (existing) {
    return items.map((item) =>
      item.id === product.id
        ? { ...item, cantidad: item.cantidad + 1 }
        : item,
    );
  }
  return [...items, { ...product, cantidad: 1 }];
}

/**
 * Remove a product from cart items by id.
 * If quantity > 1, decrement it. If quantity === 1, remove entirely.
 */
export function removeFromCart(items: CartItem[], productId: number | string): CartItem[] {
  const existing = items.find((item) => item.id == productId);
  if (!existing) return items;

  if (existing.cantidad === 1) {
    return items.filter((item) => item.id != productId);
  }

  return items.map((item) =>
    item.id == productId
      ? { ...item, cantidad: item.cantidad - 1 }
      : item,
  );
}

/**
 * Remove all instances of a product from cart.
 */
export function removeAllFromCart(items: CartItem[], productId: number | string): CartItem[] {
  return items.filter((item) => item.id != productId);
}

/**
 * Calculate cart summary (total items and total price).
 */
export function calculateSummary(items: CartItem[]): CartSummary {
  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);
  const totalPrice = items.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0,
  );
  return { totalItems, totalPrice };
}

/**
 * Persist cart items to localStorage.
 */
export function saveCartToStorage(items: CartItem[]): void {
  try {
    localStorage.setItem('carrito', JSON.stringify(items));
  } catch {
    // localStorage unavailable (e.g. private browsing)
  }
}

/**
 * Load cart items from localStorage.
 */
export function loadCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem('carrito');
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

/**
 * Clear cart from localStorage.
 */
export function clearCartStorage(): void {
  try {
    localStorage.removeItem('carrito');
  } catch {
    // noop
  }
}

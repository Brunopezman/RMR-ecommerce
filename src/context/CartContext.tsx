import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Product, CartItem, CartSummary } from '../types';
import {
  addToCart as addItem,
  removeFromCart,
  calculateSummary,
  saveCartToStorage,
  loadCartFromStorage,
  clearCartStorage,
} from '../services/cartService';

export interface CartContextValue {
  items: CartItem[];
  summary: CartSummary;
  addToCart: (product: Product) => void;
  removeItem: (productId: number | string) => void;
  clearCart: () => void;
  itemCount: number;
}

export const CartContext = createContext<CartContextValue | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());
  const [summary, setSummary] = useState<CartSummary>(() =>
    calculateSummary(loadCartFromStorage()),
  );

  // Persist to localStorage whenever items change
  useEffect(() => {
    saveCartToStorage(items);
    setSummary(calculateSummary(items));
  }, [items]);

  const addToCart = useCallback((product: Product) => {
    setItems((prev) => addItem(prev, product));
  }, []);

  const removeItem = useCallback((productId: number | string) => {
    setItems((prev) => removeFromCart(prev, productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    clearCartStorage();
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        summary,
        addToCart,
        removeItem,
        clearCart,
        itemCount: summary.totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

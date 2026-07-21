/**
 * ProductMiniCard — Miniatura de producto para recomendaciones en el chat.
 *
 * Renderiza una card compacta con imagen, nombre, precio y botón "+ Carrito".
 * No depende de CartContext directamente; recibe onAddToCart como prop.
 */

import { useCallback } from 'react';
import type { Product } from '../../types/product';

// ──────────────────────────────────────────────
//  Props
// ──────────────────────────────────────────────

export interface ProductMiniCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

// ──────────────────────────────────────────────
//  Helpers
// ──────────────────────────────────────────────

function formatPrice(price: number): string {
  return '$' + price.toLocaleString('es-AR');
}

// ──────────────────────────────────────────────
//  Component
// ──────────────────────────────────────────────

export function ProductMiniCard({ product, onAddToCart }: ProductMiniCardProps) {
  const handleAdd = useCallback(() => {
    onAddToCart(product);
  }, [onAddToCart, product]);

  return (
    <div className="flex items-center gap-3 bg-white rounded-lg p-2.5 border border-gray-200 hover:shadow-md transition-shadow duration-200">
      {/* Product image - 56x56 */}
      <div className="w-14 h-14 flex-shrink-0 rounded overflow-hidden bg-gray-200">
        {product.img ? (
          <img
            src={product.img}
            alt={product.nombre}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-900 truncate">
          {product.nombre}
        </p>
        <p className="text-sm font-semibold text-coral">{formatPrice(product.precio)}</p>
      </div>

      {/* Add to cart button */}
      <button
        onClick={handleAdd}
        className="flex-shrink-0 bg-coral hover:bg-coral-dark text-white text-xs font-medium px-3 py-1.5 rounded-full transition-colors duration-200 border-0 cursor-pointer flex items-center gap-1"
        aria-label={`Agregar ${product.nombre} al carrito`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Carrito
      </button>
    </div>
  );
}

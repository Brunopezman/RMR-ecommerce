import { useState } from 'react';
import type { Product } from '../../types/product';

/* ------------------------------------------------------------------ */
/*  Tipos                                                              */
/* ------------------------------------------------------------------ */

interface ProductDetailPageProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number, size?: string) => void;
  onBuyNow: (product: Product, quantity: number, size?: string) => void;
  onBack: () => void;
}

/* ------------------------------------------------------------------ */
/*  Constantes                                                         */
/* ------------------------------------------------------------------ */

const DEFAULT_SIZES = ['M', 'L', 'XL', 'XXL'] as const;

/** Productos que requieren selección de talle */
const TALLED_TYPES = ['remera', 'buzo'];

/* ------------------------------------------------------------------ */
/*  Componente                                                         */
/* ------------------------------------------------------------------ */

export function ProductDetailPage({
  product,
  onAddToCart,
  onBuyNow,
  onBack,
}: ProductDetailPageProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const needsSize = TALLED_TYPES.includes(product.tipo ?? '');
  const canSubmit = !needsSize || selectedSize !== null;
  const sizeOptions =
    needsSize && product.tallesDisponibles && product.tallesDisponibles.length > 0
      ? product.tallesDisponibles
      : DEFAULT_SIZES;

  const handleAddToCart = () => {
    if (!canSubmit) return;
    onAddToCart(product, quantity, selectedSize ?? undefined);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1500);
  };

  const handleBuyNow = () => {
    if (!canSubmit) return;
    onBuyNow(product, quantity, selectedSize ?? undefined);
  };

  const incrementQuantity = () => setQuantity((prev) => Math.min(prev + 1, 99));
  const decrementQuantity = () => setQuantity((prev) => Math.max(prev - 1, 1));

  const formattedPrice = product.precio.toLocaleString('es-AR');

  /* ---------------------------------------------------------------- */
  /*  Skeleton mientras carga (producto sin datos mínimos)            */
  /* ---------------------------------------------------------------- */

  if (!product.id) {
    return (
      <div className="min-h-screen bg-white" role="status" aria-label="Cargando producto">
        {/* Skeleton: header placeholder */}
        <div className="h-16 bg-gray-100 animate-pulse" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            {/* Imagen skeleton */}
            <div className="w-full md:w-1/2 aspect-square bg-gray-200 animate-pulse rounded-lg" />
            {/* Info skeleton */}
            <div className="w-full md:w-1/2 space-y-6">
              <div className="h-8 bg-gray-200 animate-pulse rounded w-3/4" />
              <div className="h-10 bg-gray-200 animate-pulse rounded w-1/3" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3" />
              </div>
              <div className="flex gap-3">
                {DEFAULT_SIZES.map((s) => (
                  <div key={s} className="w-12 h-12 bg-gray-200 animate-pulse rounded-full" />
                ))}
              </div>
              <div className="h-12 bg-gray-200 animate-pulse rounded w-full" />
              <div className="h-12 bg-gray-200 animate-pulse rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Render principal                                                */
  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-white">
      {/* Back button */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={onBack}
          className="
            inline-flex items-center gap-2
            text-sm text-gray-500 hover:text-coral
            transition-colors duration-200
            bg-transparent border-0 cursor-pointer
            p-2 -ml-2 rounded
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral
          "
          aria-label="Volver a la tienda"
        >
          {/* Flecha izquierda */}
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
      </div>

      {/* Contenido principal */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 pb-16">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* ========== Columna izquierda: Imagen ========== */}
          <div className="w-full md:w-1/2">
            <div className="sticky top-24">
              <div className="
                aspect-square overflow-hidden rounded-xl
                bg-gray-50 border border-gray-100
                shadow-sm
              ">
                <img
                  src={product.img}
                  alt={product.descripcion ?? product.nombre}
                  className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                  loading="eager"
                />
              </div>
            </div>
          </div>

          {/* ========== Columna derecha: Información ========== */}
          <div className="w-full md:w-1/2 flex flex-col gap-6">
            {/* Tipo / Categoria */}
            {product.tipo && (
              <span className="
                inline-block self-start
                text-xs font-semibold uppercase tracking-widest
                text-coral bg-coral/10
                px-3 py-1 rounded-full
              ">
                {product.tipo}
              </span>
            )}

            {/* Nombre */}
            <h1 className="
              text-3xl sm:text-4xl font-bold tracking-wide
              text-gray-900 leading-tight
            ">
              {product.nombre}
            </h1>

            {/* Precio */}
            <p className="
              text-4xl sm:text-5xl font-bold
              text-coral
              tracking-tight
            ">
              ${formattedPrice}
            </p>

            {/* Descripción */}
            {product.descripcion && (
              <p className="
                text-base sm:text-lg
                text-gray-500
                leading-relaxed
              ">
                {product.descripcion}
              </p>
            )}

            <hr className="border-gray-200 my-1" />

            {/* ===== Selector de Talle (solo remeras/buzos) ===== */}
            {needsSize && (
              <div className="space-y-3">
                <span className="text-sm font-semibold uppercase tracking-wider text-gray-900 block">
                  Talle
                </span>
                <div
                  className="flex flex-wrap gap-3"
                  role="radiogroup"
                  aria-label="Seleccionar talle"
                >
                  {sizeOptions.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`
                          relative w-14 h-14 rounded-full
                          text-base font-semibold
                          transition-all duration-200 ease-in-out
                          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral
                          cursor-pointer
                          ${
                            isSelected
                              ? 'bg-coral text-white shadow-md scale-105'
                              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-coral hover:text-coral'
                          }
                        `}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`Talle ${size}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {!selectedSize && (
                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Seleccioná un talle
                  </p>
                )}
              </div>
            )}

            {/* ===== Selector de Cantidad ===== */}
            <div className="space-y-3">
              <span className="text-sm font-semibold uppercase tracking-wider text-gray-900 block">
                Cantidad
              </span>
              <div className="flex items-center gap-0" role="group" aria-label="Selector de cantidad">
                <button
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="
                    w-12 h-12
                    flex items-center justify-center
                    border-2 border-gray-300 rounded-l-lg
                    text-gray-600 font-bold text-lg
                    bg-white
                    transition-all duration-200
                    hover:border-coral hover:text-coral
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-600
                    cursor-pointer
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral
                  "
                  aria-label="Disminuir cantidad"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                  </svg>
                </button>

                <div
                  className="
                    w-16 h-12
                    flex items-center justify-center
                    border-t-2 border-b-2 border-gray-300
                    text-lg font-bold text-gray-900
                    bg-white
                    select-none
                  "
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label={`Cantidad: ${quantity}`}
                >
                  {quantity}
                </div>

                <button
                  onClick={incrementQuantity}
                  disabled={quantity >= 99}
                  className="
                    w-12 h-12
                    flex items-center justify-center
                    border-2 border-gray-300 rounded-r-lg
                    text-gray-600 font-bold text-lg
                    bg-white
                    transition-all duration-200
                    hover:border-coral hover:text-coral
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-600
                    cursor-pointer
                    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral
                  "
                  aria-label="Aumentar cantidad"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            <hr className="border-gray-200 my-1" />

            {/* ===== Botones de acción ===== */}
            <div className="flex flex-col gap-3 pt-2">
              {/* Agregar al carrito */}
              <button
                onClick={handleAddToCart}
                disabled={!canSubmit}
                className={`
                  w-full py-4 px-8 rounded-lg
                  text-base font-bold uppercase tracking-wider
                  transition-all duration-200 ease-in-out
                  cursor-pointer
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral
                  ${
                    !canSubmit
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : addedFeedback
                        ? 'bg-green-500 text-white scale-[0.98]'
                        : 'bg-coral text-white hover:bg-coral-dark hover:shadow-lg active:scale-[0.98]'
                  }
                `}
                aria-label={
                  !canSubmit && needsSize
                    ? 'Agregar al carrito: seleccioná un talle primero'
                    : `Agregar ${product.nombre} al carrito`
                }
              >
                {addedFeedback ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Agregado
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
                      />
                    </svg>
                    Agregar al carrito
                  </span>
                )}
              </button>

              {/* Comprar ahora */}
              <button
                onClick={handleBuyNow}
                disabled={!canSubmit}
                className={`
                  w-full py-4 px-8 rounded-lg
                  text-base font-bold uppercase tracking-wider
                  transition-all duration-200 ease-in-out
                  cursor-pointer
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral
                  ${
                    !canSubmit
                      ? 'border-2 border-dashed border-gray-300 text-gray-400 cursor-not-allowed bg-transparent'
                      : 'border-2 border-coral text-coral bg-transparent hover:bg-coral hover:text-white active:scale-[0.98]'
                  }
                `}
                aria-label={
                  !canSubmit && needsSize
                    ? 'Comprar ahora: seleccioná un talle primero'
                    : `Comprar ${product.nombre} ahora`
                }
              >
                <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Comprar ahora
                  </span>
              </button>

            </div>

            {/* Badge de envío */}
            <div className="flex items-center gap-2 text-sm text-gray-400 pt-1">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                />
              </svg>
              Envíos gratis a partir de $100.000
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;

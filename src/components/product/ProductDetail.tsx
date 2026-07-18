import { useState, useContext } from 'react';
import type { Product } from '../../types/product';
import { CartContext } from '../../context/CartContext';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

export function ProductDetail({ product, onBack }: ProductDetailProps) {
  const { addToCart } = useContext(CartContext)!;
  const [selectedTalle, setSelectedTalle] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const hasMultipleTalles =
    product.tallesDisponibles && product.tallesDisponibles.length > 1;
  const isTalleUnico =
    product.tallesDisponibles &&
    product.tallesDisponibles.length === 1 &&
    product.tallesDisponibles[0] === 'Único';
  const needsTalleSelection = hasMultipleTalles;

  const canAddToCart = !needsTalleSelection || selectedTalle !== null;

  const handleAddToCart = () => {
    if (!canAddToCart) return;
    // Add the product once per quantity
    for (let i = 0; i < quantity; i++) {
      addToCart({ ...product, talle: selectedTalle ?? product.tallesDisponibles?.[0] });
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (val >= 1) {
      setQuantity(val);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors duration-200 bg-transparent border-0 cursor-pointer font-display"
        >
          <i className="bx bx-arrow-back text-xl" />
          <span className="text-sm font-medium">Volver a la tienda</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product image */}
          <div className="flex items-center justify-center bg-gray-50 rounded-lg p-8">
            <img
              src={product.img}
              alt={product.descripcion ?? product.nombre}
              className="w-full max-w-md h-auto object-cover rounded-lg shadow-md"
            />
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-6">
            {/* Name & description */}
            <div>
              <h1 className="text-3xl font-bold font-display text-gray-900">
                {product.nombre}
              </h1>
              {product.descripcion && (
                <p className="mt-2 text-gray-600 font-display text-base">
                  {product.descripcion}
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <span className="text-3xl font-bold text-gray-900 font-display">
                ${product.precio}
              </span>
            </div>

            {/* Size selector */}
            {product.tallesDisponibles && product.tallesDisponibles.length > 0 && (
              <div>
                {isTalleUnico ? (
                  <p className="text-sm text-gray-500 font-display">
                    <i className="bx bx-check-circle text-coral mr-1" />
                    Talle único
                  </p>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2 font-display">
                      Talle <span className="text-red-500">*</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {product.tallesDisponibles.map((talle) => (
                        <button
                          key={talle}
                          onClick={() => setSelectedTalle(talle)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 cursor-pointer font-display ${
                            selectedTalle === talle
                              ? 'bg-coral text-white border-coral'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-coral hover:text-coral'
                          }`}
                        >
                          {talle}
                        </button>
                      ))}
                    </div>
                    {needsTalleSelection && !selectedTalle && (
                      <p className="text-xs text-gray-400 mt-1 font-display">
                        Seleccioná un talle para continuar
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quantity selector */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2 font-display">
                Cantidad
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center bg-white hover:border-coral hover:text-coral transition-colors duration-200 cursor-pointer text-lg font-medium"
                  aria-label="Disminuir cantidad"
                >
                  <i className="bx bx-minus" />
                </button>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-16 h-10 text-center border-2 border-gray-300 rounded-lg font-display text-sm font-medium focus:outline-none focus:border-coral"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 flex items-center justify-center bg-white hover:border-coral hover:text-coral transition-colors duration-200 cursor-pointer text-lg font-medium"
                  aria-label="Aumentar cantidad"
                >
                  <i className="bx bx-plus" />
                </button>
              </div>
            </div>

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className={`w-full py-3 px-6 rounded-lg font-bold uppercase text-sm tracking-wide transition-all duration-200 font-display ${
                canAddToCart
                  ? 'bg-black hover:bg-coral text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <i className="bx bx-cart-add mr-2" />
              Agregar al carrito
            </button>

            {/* Back button (mobile secondary) */}
            <button
              onClick={onBack}
              className="w-full py-2 px-4 rounded-lg border-2 border-gray-300 text-gray-600 hover:border-coral hover:text-coral transition-colors duration-200 bg-transparent cursor-pointer font-display text-sm font-medium md:hidden"
            >
              <i className="bx bx-arrow-back mr-1" />
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

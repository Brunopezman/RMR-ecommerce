import { useState, useContext, useCallback, useEffect } from 'react';
import { CartContext } from '../../context/CartContext';
import { navigate } from '../../services/router';
import { fetchProductById } from '../../services/api';
import { ProductDetailPage } from '../catalog/ProductDetailPage';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';
import type { Product } from '../../types/product';

export function ProductDetailRoute({ productId }: { productId: number }) {
  const { addToCart } = useContext(CartContext)!;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchProductById(productId)
      .then((data) => {
        if (!cancelled) {
          setProduct(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Error al cargar el producto');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [productId]);

  const handleAddToCart = useCallback(
    (p: Product, quantity: number, size?: string) => {
      addToCart(p, quantity, size);
    },
    [addToCart],
  );

  const handleBuyNow = useCallback(
    (p: Product, quantity: number, size?: string) => {
      addToCart(p, quantity, size);
      navigate('/checkout');
    },
    [addToCart],
  );

  const handleBack = useCallback(() => {
    navigate('/shop');
  }, []);

  if (loading) {
    return (
      <>
        <Header onNavigate={(v) => navigate(v === 'shop' ? '/shop' : '/')} />
        <ProductDetailPage
          product={{ id: 0, nombre: '', img: '', precio: 0 } as Product}
          onAddToCart={() => {}}
          onBuyNow={() => {}}
          onBack={handleBack}
        />
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header onNavigate={(v) => navigate(v === 'shop' ? '/shop' : '/')} />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center px-4">
            <div className="text-6xl mb-4 text-gray-300">
              <svg className="w-24 h-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Producto no encontrado
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {error || 'El producto que buscas no existe o fue removido.'}
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="inline-block bg-coral hover:bg-coral-dark text-white px-8 py-3 rounded font-medium transition-colors duration-300 cursor-pointer border-0"
            >
              Volver a la tienda
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header onNavigate={(v) => navigate(v === 'shop' ? '/shop' : '/')} />
      <ProductDetailPage
        product={product}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onBack={handleBack}
      />
      <Footer />
    </>
  );
}

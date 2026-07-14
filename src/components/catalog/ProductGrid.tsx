import type { Product } from '../../types/product';
import { ProductCard } from '../ui/ProductCard';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  loading?: boolean;
  error?: string | null;
}

export function ProductGrid({ products, onAddToCart, loading, error }: ProductGridProps) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando productos...</span>
        </div>
        <p className="mt-2 text-muted font-display">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-warning text-center py-5" role="alert">
        <i className="bx bx-error-circle fs-3" />
        <p className="mt-2 mb-0">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <p className="font-display">No se encontraron productos.</p>
      </div>
    );
  }

  return (
    <div id="productosDestacados" className="row mx-auto container">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}

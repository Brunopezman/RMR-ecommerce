import type { Product } from '../../types/product';
import { ProductCard } from '../ui/ProductCard';

interface ProductGridProps {
  products: Product[];
  onProductClick?: (id: number) => void;
  loading?: boolean;
  error?: string | null;
}

export function ProductGrid({ products, onProductClick, loading, error }: ProductGridProps) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-700 border-t-transparent rounded-full" role="status">
          <span className="sr-only">Cargando productos...</span>
        </div>
        <p className="mt-2 text-gray-500 font-display">Cargando productos...</p>
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
      <div className="text-center py-5 text-gray-500">
        <p className="font-display">No se encontraron productos.</p>
      </div>
    );
  }

  return (
    <div id="productosDestacados" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mx-auto max-w-7xl px-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onProductClick={onProductClick}
        />
      ))}
    </div>
  );
}

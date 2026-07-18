import type { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onProductClick?: (id: number) => void;
}

export function ProductCard({ product, onProductClick }: ProductCardProps) {
  return (
    <div className="product text-center mb-4">
      <button
        onClick={() => onProductClick?.(product.id)}
        className="bg-transparent border-0 cursor-pointer p-0 w-full"
        aria-label={`Ver detalle de ${product.nombre}`}
      >
        <img
          id={`product-img-${product.id}`}
          className="img-fluid mb-3 w-full h-48 object-cover object-center transition-opacity duration-200 hover:opacity-80"
          src={product.img}
          alt={product.descripcion ?? product.nombre}
        />
      </button>
      <div className="star">
        {[...Array(5)].map((_, i) => (
          <i key={i} className="bx bxs-star" />
        ))}
      </div>
      <h5 className="product-name font-display">{product.nombre}</h5>
      <h4 className="product-price font-display">${product.precio}</h4>
    </div>
  );
}

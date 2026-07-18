import type { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  onViewProduct: (productId: number) => void;
}

export function ProductCard({ product, onViewProduct }: ProductCardProps) {
  return (
    <div className="product text-center col-lg-3 col-md-4 col-12 mb-4">
      <button
        onClick={() => onViewProduct(product.id)}
        className="bg-transparent border-0 cursor-pointer p-0 w-full"
        aria-label={`Ver detalle de ${product.nombre}`}
      >
        <img
          id={`product-img-${product.id}`}
          className="img-fluid mb-3 w-full h-auto object-cover transition-opacity duration-200 hover:opacity-80"
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

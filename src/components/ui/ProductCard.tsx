import type { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick?: (id: number) => void;
}

export function ProductCard({ product, onAddToCart, onProductClick }: ProductCardProps) {
  return (
    <div className="product text-center mb-4">
      <div
        className="cursor-pointer"
        onClick={() => onProductClick?.(product.id)}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onProductClick?.(product.id);
          }
        }}
        aria-label={`Ver detalle de ${product.nombre}`}
      >
        <img
          id={`product-img-${product.id}`}
          className="img-fluid mb-3 w-full h-48 object-cover object-center"
          src={product.img}
          alt={product.descripcion ?? product.nombre}
        />
        <h5 className="product-name font-display">{product.nombre}</h5>
      </div>
      <div className="star">
        {[...Array(5)].map((_, i) => (
          <i key={i} className="bx bxs-star" />
        ))}
      </div>
      <h4 className="product-price font-display">${product.precio}</h4>
      <button
        id={`${product.id}`}
        className="buy-btn bx bx-cart-add bx-sm agregar text-white border-none font-bold uppercase text-sm px-7 py-3 cursor-pointer rounded"
        onClick={() => onAddToCart(product)}
      />
    </div>
  );
}

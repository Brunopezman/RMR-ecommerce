import type { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="product text-center col-lg-3 col-md-4 col-12 mb-4">
      <img
        id={`product-img-${product.id}`}
        className="img-fluid mb-3"
        src={product.img}
        alt={product.descripcion ?? product.nombre}
      />
      <div className="star">
        {[...Array(5)].map((_, i) => (
          <i key={i} className="bx bxs-star warning" />
        ))}
      </div>
      <h5 className="product-name">{product.nombre}</h5>
      <h4 className="product price">${product.precio}</h4>
      <button
        id={`${product.id}`}
        className="buy-btn bx bx-cart-add bx-sm agregar"
        onClick={() => onAddToCart(product)}
      />
    </div>
  );
}

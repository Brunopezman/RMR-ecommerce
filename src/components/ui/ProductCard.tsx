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
        className="img-fluid mb-3 w-full h-auto object-cover"
        src={product.img}
        alt={product.descripcion ?? product.nombre}
      />
      <div className="star">
        {[...Array(5)].map((_, i) => (
          <i key={i} className="bx bxs-star" />
        ))}
      </div>
      <h5 className="product-name font-display">{product.nombre}</h5>
      <h4 className="product-price font-display">${product.precio}</h4>
      <button
        id={`${product.id}`}
        className="buy-btn bx bx-cart-add bx-sm agregar text-white border-none font-bold uppercase text-sm px-7 py-3 cursor-pointer rounded"
        onClick={() => onAddToCart(product)}
      />
    </div>
  );
}

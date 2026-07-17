import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductCard } from '../components/ui/ProductCard';

// ─── Sample product (subset of data/db.json) ────────────────────────
const SAMPLE_PRODUCT = {
  id: 1,
  nombre: 'Remera The Beatles',
  tipo: 'remera',
  img: '/img/remerathebeatles.png',
  descripcion: 'The Beatles - negra - lisa',
  precio: 4000,
};

// ──────────────────────────────────────────────────────────────────────
//  ProductCard — renderiza info del producto
// ──────────────────────────────────────────────────────────────────────
describe('ProductCard', () => {
  it('renderiza el nombre del producto', () => {
    render(<ProductCard product={SAMPLE_PRODUCT} onAddToCart={() => {}} />);
    expect(screen.getByText('Remera The Beatles')).toBeInTheDocument();
  });

  it('renderiza el precio del producto con formato $', () => {
    render(<ProductCard product={SAMPLE_PRODUCT} onAddToCart={() => {}} />);
    expect(screen.getByText('$4000')).toBeInTheDocument();
  });

  it('renderiza la imagen del producto con src y alt correctos', () => {
    render(<ProductCard product={SAMPLE_PRODUCT} onAddToCart={() => {}} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/img/remerathebeatles.png');
    expect(img).toHaveAttribute('alt', 'The Beatles - negra - lisa');
  });

  it('usa la descripción como alt text de la imagen cuando existe', () => {
    const productConDesc = {
      ...SAMPLE_PRODUCT,
      descripcion: 'The Beatles - negra - lisa',
    };
    render(<ProductCard product={productConDesc} onAddToCart={() => {}} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'The Beatles - negra - lisa');
  });

  it('usa el nombre como fallback del alt si no hay descripción', () => {
    const productSinDesc = {
      ...SAMPLE_PRODUCT,
      descripcion: undefined,
    };
    render(<ProductCard product={productSinDesc} onAddToCart={() => {}} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Remera The Beatles');
  });

  it('renderiza 5 estrellas', () => {
    render(<ProductCard product={SAMPLE_PRODUCT} onAddToCart={() => {}} />);
    const stars = document.querySelectorAll('.star .bxs-star');
    expect(stars).toHaveLength(5);
  });

  it('tiene un botón de compra con clase buy-btn', () => {
    render(<ProductCard product={SAMPLE_PRODUCT} onAddToCart={() => {}} />);
    const button = document.querySelector('.buy-btn');
    expect(button).toBeInTheDocument();
  });

  it('el botón de compra tiene id igual al id del producto', () => {
    render(<ProductCard product={SAMPLE_PRODUCT} onAddToCart={() => {}} />);
    const button = document.getElementById('1');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('buy-btn');
  });

  it('el botón de compra llama a onAddToCart con el producto al hacer clic', async () => {
    const onAddToCart = vi.fn();
    const user = userEvent.setup();

    render(<ProductCard product={SAMPLE_PRODUCT} onAddToCart={onAddToCart} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(onAddToCart).toHaveBeenCalledWith(SAMPLE_PRODUCT);
  });

  it('el botón de compra pasa el producto correcto (por identidad de objeto)', async () => {
    const product1 = { ...SAMPLE_PRODUCT, id: 1, nombre: 'Remera A' };
    const product2 = { ...SAMPLE_PRODUCT, id: 2, nombre: 'Remera B' };
    const onAddToCart = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(
      <ProductCard product={product1} onAddToCart={onAddToCart} />,
    );

    await user.click(screen.getByRole('button'));
    expect(onAddToCart).toHaveBeenCalledWith(product1);

    // Rerender con otro producto y verificar que ahora pasa ese
    rerender(<ProductCard product={product2} onAddToCart={onAddToCart} />);
    await user.click(screen.getByRole('button'));
    expect(onAddToCart).toHaveBeenCalledWith(product2);
  });
});

// ──────────────────────────────────────────────────────────────────────
//  ProductCard — navegación por clic (onProductClick)
// ──────────────────────────────────────────────────────────────────────
describe('ProductCard — onProductClick navigation', () => {
  it('hace clic en el área del producto (role="link") y llama a onProductClick con el id', async () => {
    const onProductClick = vi.fn();
    const user = userEvent.setup();

    render(
      <ProductCard
        product={SAMPLE_PRODUCT}
        onAddToCart={() => {}}
        onProductClick={onProductClick}
      />,
    );

    const link = screen.getByRole('link');
    await user.click(link);

    expect(onProductClick).toHaveBeenCalledTimes(1);
    expect(onProductClick).toHaveBeenCalledWith(1);
  });

  it('hace clic en la imagen y navega (llama a onProductClick)', async () => {
    const onProductClick = vi.fn();
    const user = userEvent.setup();

    render(
      <ProductCard
        product={SAMPLE_PRODUCT}
        onAddToCart={() => {}}
        onProductClick={onProductClick}
      />,
    );

    const img = screen.getByRole('img');
    await user.click(img);

    expect(onProductClick).toHaveBeenCalledTimes(1);
    expect(onProductClick).toHaveBeenCalledWith(1);
  });

  it('hace clic en el nombre del producto y navega (llama a onProductClick)', async () => {
    const onProductClick = vi.fn();
    const user = userEvent.setup();

    render(
      <ProductCard
        product={SAMPLE_PRODUCT}
        onAddToCart={() => {}}
        onProductClick={onProductClick}
      />,
    );

    const name = screen.getByText('Remera The Beatles');
    await user.click(name);

    expect(onProductClick).toHaveBeenCalledTimes(1);
    expect(onProductClick).toHaveBeenCalledWith(1);
  });

  it('el botón "Agregar" llama a onAddToCart y NO a onProductClick', async () => {
    const onAddToCart = vi.fn();
    const onProductClick = vi.fn();
    const user = userEvent.setup();

    render(
      <ProductCard
        product={SAMPLE_PRODUCT}
        onAddToCart={onAddToCart}
        onProductClick={onProductClick}
      />,
    );

    const button = screen.getByRole('button');
    await user.click(button);

    // onAddToCart debe llamarse
    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(onAddToCart).toHaveBeenCalledWith(SAMPLE_PRODUCT);

    // onProductClick NO debe llamarse
    expect(onProductClick).not.toHaveBeenCalled();
  });

  it('no llama a onProductClick si la prop no está definida', async () => {
    // Si no se pasa onProductClick, el clic en el link no debe romperse
    const user = userEvent.setup();

    render(
      <ProductCard product={SAMPLE_PRODUCT} onAddToCart={() => {}} />,
    );

    const link = screen.getByRole('link');
    await user.click(link);

    // Simplemente no debe lanzar error — no hay nada que verificar
    // (la prop es opcional, usamos ?. en el onClick)
    expect(link).toBeInTheDocument();
  });
});

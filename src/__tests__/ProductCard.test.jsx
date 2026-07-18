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
  stock: 10,
};

// ──────────────────────────────────────────────────────────────────────
//  ProductCard — renderiza info del producto
// ──────────────────────────────────────────────────────────────────────
describe('ProductCard', () => {
  it('renderiza el nombre del producto', () => {
    render(<ProductCard product={SAMPLE_PRODUCT} />);
    expect(screen.getByText('Remera The Beatles')).toBeInTheDocument();
  });

  it('renderiza el precio del producto con formato $', () => {
    render(<ProductCard product={SAMPLE_PRODUCT} />);
    expect(screen.getByText('$4000')).toBeInTheDocument();
  });

  it('renderiza la imagen del producto con src y alt correctos', () => {
    render(<ProductCard product={SAMPLE_PRODUCT} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/img/remerathebeatles.png');
    expect(img).toHaveAttribute('alt', 'The Beatles - negra - lisa');
  });

  it('usa la descripción como alt text de la imagen cuando existe', () => {
    const productConDesc = {
      ...SAMPLE_PRODUCT,
      descripcion: 'The Beatles - negra - lisa',
    };
    render(<ProductCard product={productConDesc} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'The Beatles - negra - lisa');
  });

  it('usa el nombre como fallback del alt si no hay descripción', () => {
    const productSinDesc = {
      ...SAMPLE_PRODUCT,
      descripcion: undefined,
    };
    render(<ProductCard product={productSinDesc} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Remera The Beatles');
  });

  it('renderiza 5 estrellas', () => {
    render(<ProductCard product={SAMPLE_PRODUCT} />);
    const stars = document.querySelectorAll('.star .bxs-star');
    expect(stars).toHaveLength(5);
  });
});

// ──────────────────────────────────────────────────────────────────────
//  ProductCard — navegación por clic (onProductClick)
// ──────────────────────────────────────────────────────────────────────
describe('ProductCard — onProductClick navigation', () => {
  it('hace clic en el botón del producto y llama a onProductClick con el id', async () => {
    const onProductClick = vi.fn();
    const user = userEvent.setup();

    render(
      <ProductCard
        product={SAMPLE_PRODUCT}
        onProductClick={onProductClick}
      />,
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(onProductClick).toHaveBeenCalledTimes(1);
    expect(onProductClick).toHaveBeenCalledWith(1);
  });

  it('hace clic en la imagen y navega (llama a onProductClick)', async () => {
    const onProductClick = vi.fn();
    const user = userEvent.setup();

    render(
      <ProductCard
        product={SAMPLE_PRODUCT}
        onProductClick={onProductClick}
      />,
    );

    const img = screen.getByRole('img');
    await user.click(img);

    expect(onProductClick).toHaveBeenCalledTimes(1);
    expect(onProductClick).toHaveBeenCalledWith(1);
  });

  it('hace clic en el botón de navegación (aria-label) y llama a onProductClick', async () => {
    const onProductClick = vi.fn();
    const user = userEvent.setup();

    render(
      <ProductCard
        product={SAMPLE_PRODUCT}
        onProductClick={onProductClick}
      />,
    );

    const navButton = screen.getByRole('button', { name: /ver detalle de remera the beatles/i });
    await user.click(navButton);

    expect(onProductClick).toHaveBeenCalledTimes(1);
    expect(onProductClick).toHaveBeenCalledWith(1);
  });

  it('no llama a onProductClick si la prop no está definida', async () => {
    // Si no se pasa onProductClick, el clic en el botón no debe romperse
    const user = userEvent.setup();

    render(<ProductCard product={SAMPLE_PRODUCT} />);

    const button = screen.getByRole('button');
    await user.click(button);

    // Simplemente no debe lanzar error — no hay nada que verificar
    // (la prop es opcional, usamos ?. en el onClick)
    expect(button).toBeInTheDocument();
  });
});

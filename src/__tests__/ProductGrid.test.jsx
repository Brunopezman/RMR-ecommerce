import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductGrid } from '../components/catalog/ProductGrid';

// ─── Sample products (subset of data/db.json) ────────────────────────
const SAMPLE_PRODUCTS = [
  { id: 1, nombre: 'Remera The Beatles', tipo: 'remera', img: '/img/remerathebeatles.png', precio: 4000 },
  { id: 2, nombre: 'Remera AC/DC', tipo: 'remera', img: '/img/remeraacdc.png', precio: 4000 },
  { id: 12, nombre: 'Buzo AC/DC', tipo: 'buzo', img: '/img/buzoacdc.png', precio: 4000 },
];

// ──────────────────────────────────────────────────────────────────────
//  ProductGrid — renderiza productos, estados loading/error/empty
// ──────────────────────────────────────────────────────────────────────
describe('ProductGrid — estado loading', () => {
  it('muestra spinner de carga y texto cuando loading=true', () => {
    render(<ProductGrid products={[]} onAddToCart={() => {}} loading={true} />);

    // El texto aparece dos veces: en el span .visually-hidden y en el p
    const loadTexts = screen.getAllByText('Cargando productos...');
    expect(loadTexts).toHaveLength(2);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('NO muestra mensaje de error ni productos cuando está cargando', () => {
    render(
      <ProductGrid
        products={SAMPLE_PRODUCTS}
        onAddToCart={() => {}}
        loading={true}
        error="Error de red"
      />,
    );

    // Prioriza loading sobre error y productos
    const loadTexts = screen.getAllByText('Cargando productos...');
    expect(loadTexts.length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Error de red')).not.toBeInTheDocument();
    expect(screen.queryByText('Remera The Beatles')).not.toBeInTheDocument();
  });
});

describe('ProductGrid — estado error', () => {
  it('muestra el mensaje de error cuando error tiene valor', () => {
    render(<ProductGrid products={[]} onAddToCart={() => {}} error="Error de red" />);

    expect(screen.getByText('Error de red')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('NO muestra loading ni productos cuando hay error', () => {
    render(
      <ProductGrid
        products={SAMPLE_PRODUCTS}
        onAddToCart={() => {}}
        loading={false}
        error="Falló la conexión"
      />,
    );

    expect(screen.getByText('Falló la conexión')).toBeInTheDocument();
    expect(screen.queryByText('Cargando productos...')).not.toBeInTheDocument();
    expect(screen.queryByText('Remera The Beatles')).not.toBeInTheDocument();
  });
});

describe('ProductGrid — estado empty', () => {
  it('muestra "No se encontraron productos." cuando el array está vacío', () => {
    render(<ProductGrid products={[]} onAddToCart={() => {}} />);

    expect(screen.getByText('No se encontraron productos.')).toBeInTheDocument();
  });

  it('NO muestra loading ni error cuando está vacío', () => {
    render(
      <ProductGrid
        products={[]}
        onAddToCart={() => {}}
        loading={false}
        error={null}
      />,
    );

    expect(screen.getByText('No se encontraron productos.')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('ProductGrid — renderizado de productos', () => {
  it('renderiza un ProductCard por cada producto', () => {
    render(<ProductGrid products={SAMPLE_PRODUCTS} onAddToCart={() => {}} />);

    expect(screen.getByText('Remera The Beatles')).toBeInTheDocument();
    expect(screen.getByText('Remera AC/DC')).toBeInTheDocument();
    expect(screen.getByText('Buzo AC/DC')).toBeInTheDocument();
  });

  it('renderiza el grid con id "productosDestacados"', () => {
    const { container } = render(
      <ProductGrid products={SAMPLE_PRODUCTS} onAddToCart={() => {}} />,
    );

    const grid = container.querySelector('#productosDestacados');
    expect(grid).toBeInTheDocument();
  });

  it('cada producto muestra su precio en el grid', () => {
    render(<ProductGrid products={SAMPLE_PRODUCTS} onAddToCart={() => {}} />);

    // Todos los productos cuestan $4000, deben aparecer 3 veces
    const prices = screen.getAllByText('$4000');
    expect(prices).toHaveLength(3);
  });

  it('cada producto tiene un botón de compra en el grid', () => {
    render(<ProductGrid products={SAMPLE_PRODUCTS} onAddToCart={() => {}} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('pasa onAddToCart a cada ProductCard y se dispara al hacer clic', async () => {
    const onAddToCart = vi.fn();
    const user = userEvent.setup();

    render(<ProductGrid products={SAMPLE_PRODUCTS} onAddToCart={onAddToCart} />);

    const buttons = screen.getAllByRole('button');
    // Click al primer botón
    await user.click(buttons[0]);

    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(onAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, nombre: 'Remera The Beatles' }),
    );
  });

  it('dispara onAddToCart con el producto correcto al hacer clic en cualquier card', async () => {
    const onAddToCart = vi.fn();
    const user = userEvent.setup();

    render(<ProductGrid products={SAMPLE_PRODUCTS} onAddToCart={onAddToCart} />);

    const buttons = screen.getAllByRole('button');

    // Click al tercer producto (Buzo AC/DC)
    await user.click(buttons[2]);

    expect(onAddToCart).toHaveBeenCalledWith(
      expect.objectContaining({ id: 12, nombre: 'Buzo AC/DC' }),
    );
  });
});

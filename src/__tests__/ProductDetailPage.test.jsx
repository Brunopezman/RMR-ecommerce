import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductDetailPage } from '../components/catalog/ProductDetailPage';

// ─── Sample products ──────────────────────────────────────────

const REMERA = {
  id: 1,
  nombre: 'Remera The Beatles',
  tipo: 'remera',
  img: '/img/remerathebeatles.png',
  descripcion: 'The Beatles - negra - lisa',
  precio: 4000,
};

const BUZO = {
  id: 2,
  nombre: 'Buzo AC/DC',
  tipo: 'buzo',
  img: '/img/buzoacdc.png',
  descripcion: 'Buzo AC/DC - negro',
  precio: 8000,
};

const VASO = {
  id: 3,
  nombre: 'Vaso Rolling Stones',
  tipo: 'vaso',
  img: '/img/vasorollingstones.png',
  descripcion: 'Vaso de vidrio Rolling Stones',
  precio: 2000,
};

const ACCESORIO = {
  id: 4,
  nombre: 'Gorra Nirvana',
  tipo: 'accesorio',
  img: '/img/gorranirvana.png',
  precio: 1500,
};

const PRODUCT_SIN_DESCRIPCION = {
  id: 5,
  nombre: 'Póster Led Zeppelin',
  img: '/img/posterledzeppelin.png',
  precio: 3000,
};

const PRODUCT_SIN_TIPO = {
  id: 6,
  nombre: 'Póster Pink Floyd',
  img: '/img/posterpinkfloyd.png',
  precio: 3500,
};

const EMPTY = { id: 0, nombre: '', img: '', precio: 0 };

// ──────────────────────────────────────────────────────────────
//  ProductDetailPage — renderizado de datos del producto
// ──────────────────────────────────────────────────────────────

describe('ProductDetailPage — renderizado de datos', () => {
  it('renderiza el nombre del producto', () => {
    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );
    expect(screen.getByText('Remera The Beatles')).toBeInTheDocument();
  });

  it('renderiza el precio formateado con $ y separador de miles', () => {
    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );
    expect(screen.getByText('$4.000')).toBeInTheDocument();
  });

  it('renderiza la descripción del producto', () => {
    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );
    expect(screen.getByText('The Beatles - negra - lisa')).toBeInTheDocument();
  });

  it('no renderiza descripción si no existe', () => {
    render(
      <ProductDetailPage
        product={PRODUCT_SIN_DESCRIPCION}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );
    expect(screen.queryByText('The Beatles - negra - lisa')).not.toBeInTheDocument();
  });

  it('renderiza la imagen con src y alt correctos', () => {
    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/img/remerathebeatles.png');
    expect(img).toHaveAttribute('alt', 'The Beatles - negra - lisa');
  });

  it('usa el nombre como fallback del alt de la imagen si no hay descripción', () => {
    render(
      <ProductDetailPage
        product={PRODUCT_SIN_DESCRIPCION}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('alt', 'Póster Led Zeppelin');
  });

  it('muestra el tipo/categoría como badge cuando existe', () => {
    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );
    expect(screen.getByText('remera')).toBeInTheDocument();
  });

  it('no muestra badge de tipo si el producto no tiene tipo', () => {
    render(
      <ProductDetailPage
        product={PRODUCT_SIN_TIPO}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );
    expect(screen.queryByText('remera')).not.toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────
//  ProductDetailPage — selector de talle
// ──────────────────────────────────────────────────────────────

describe('ProductDetailPage — selector de talle', () => {
  it('muestra el selector de talle (radiogroup) para remera', () => {
    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );
    expect(
      screen.getByRole('radiogroup', { name: 'Seleccionar talle' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Talle M')).toBeInTheDocument();
    expect(screen.getByLabelText('Talle L')).toBeInTheDocument();
    expect(screen.getByLabelText('Talle XL')).toBeInTheDocument();
    expect(screen.getByLabelText('Talle XXL')).toBeInTheDocument();
  });

  it('muestra el selector de talle para buzo', () => {
    render(
      <ProductDetailPage
        product={BUZO}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );
    expect(
      screen.getByRole('radiogroup', { name: 'Seleccionar talle' }),
    ).toBeInTheDocument();
  });

  it('oculta el selector de talle para vaso', () => {
    render(
      <ProductDetailPage
        product={VASO}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });

  it('oculta el selector de talle para accesorio', () => {
    render(
      <ProductDetailPage
        product={ACCESORIO}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });

  it('seleccionar un talle actualiza el estado visual (aria-checked)', async () => {
    const user = userEvent.setup();
    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );

    await user.click(screen.getByLabelText('Talle M'));

    expect(screen.getByLabelText('Talle M')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByLabelText('Talle XXL')).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(screen.getByLabelText('Talle L')).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(screen.getByLabelText('Talle XL')).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('cambiar de talle deselecciona el anterior', async () => {
    const user = userEvent.setup();
    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );

    await user.click(screen.getByLabelText('Talle XXL'));
    expect(screen.getByLabelText('Talle XXL')).toHaveAttribute(
      'aria-checked',
      'true',
    );

    await user.click(screen.getByLabelText('Talle XL'));
    expect(screen.getByLabelText('Talle XL')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByLabelText('Talle XXL')).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  it('muestra hint "Seleccioná un talle" cuando no hay talle seleccionado', () => {
    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );
    // El texto aparece 3 veces: hint <p> + botón Agregar + botón Comprar
    const hints = screen.getAllByText('Seleccioná un talle');
    expect(hints.length).toBeGreaterThanOrEqual(1);
  });

  it('oculta el hint "Seleccioná un talle" tras seleccionar un talle', async () => {
    const user = userEvent.setup();
    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );

    await user.click(screen.getByLabelText('Talle M'));

    expect(
      screen.queryByText('Seleccioná un talle'),
    ).not.toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────
//  ProductDetailPage — selector de cantidad
// ──────────────────────────────────────────────────────────────

describe('ProductDetailPage — selector de cantidad', () => {
  it('muestra cantidad inicial 1', () => {
    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );
    const display = screen.getByLabelText('Cantidad: 1');
    expect(display).toBeInTheDocument();
  });

  it('el botón de disminuir está deshabilitado cuando la cantidad es 1', () => {
    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );
    const decrementBtn = screen.getByLabelText('Disminuir cantidad');
    expect(decrementBtn).toBeDisabled();
  });

  it('el botón de disminuir se habilita tras incrementar la cantidad', async () => {
    const user = userEvent.setup();
    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );

    await user.click(screen.getByLabelText('Aumentar cantidad'));
    expect(screen.getByLabelText('Cantidad: 2')).toBeInTheDocument();

    const decrementBtn = screen.getByLabelText('Disminuir cantidad');
    expect(decrementBtn).not.toBeDisabled();
  });

  it('incrementar cantidad hasta 99 y luego deshabilita el botón +', () => {
    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );

    const incrementBtn = screen.getByLabelText('Aumentar cantidad');

    // Llegar a 99 usando fireEvent (más rápido que userEvent para loops)
    for (let i = 1; i < 99; i++) {
      fireEvent.click(incrementBtn);
    }

    expect(screen.getByLabelText('Cantidad: 99')).toBeInTheDocument();
    expect(incrementBtn).toBeDisabled();

    // Disminuir y verificar que se habilita de nuevo
    fireEvent.click(screen.getByLabelText('Disminuir cantidad'));
    expect(screen.getByLabelText('Cantidad: 98')).toBeInTheDocument();
    expect(incrementBtn).not.toBeDisabled();
  });

  it('disminuir cantidad desde 2 vuelve a 1 y deshabilita el botón -', async () => {
    const user = userEvent.setup();
    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );

    await user.click(screen.getByLabelText('Aumentar cantidad')); // → 2
    await user.click(screen.getByLabelText('Disminuir cantidad')); // → 1

    expect(screen.getByLabelText('Cantidad: 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Disminuir cantidad')).toBeDisabled();
  });
});

// ──────────────────────────────────────────────────────────────
//  ProductDetailPage — botones de acción
// ──────────────────────────────────────────────────────────────

describe('ProductDetailPage — botón "Agregar al carrito"', () => {
  it('llama a onAddToCart con producto, cantidad y talle al hacer clic', async () => {
    const onAddToCart = vi.fn();
    const user = userEvent.setup();

    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={onAddToCart}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );

    await user.click(screen.getByLabelText('Talle M'));
    await user.click(
      screen.getByLabelText('Agregar Remera The Beatles al carrito'),
    );

    expect(onAddToCart).toHaveBeenCalledTimes(1);
    expect(onAddToCart).toHaveBeenCalledWith(REMERA, 1, 'M');
  });

  it('llama a onAddToCart con cantidad 3 si se incrementó antes', async () => {
    const onAddToCart = vi.fn();
    const user = userEvent.setup();

    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={onAddToCart}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );

    await user.click(screen.getByLabelText('Talle L'));
    await user.click(screen.getByLabelText('Aumentar cantidad'));
    await user.click(screen.getByLabelText('Aumentar cantidad'));
    await user.click(
      screen.getByLabelText('Agregar Remera The Beatles al carrito'),
    );

    expect(onAddToCart).toHaveBeenCalledWith(REMERA, 3, 'L');
  });

  it('muestra feedback "Agregado" tras hacer clic', async () => {
    const user = userEvent.setup();

    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );

    await user.click(screen.getByLabelText('Talle M'));

    const addBtn = screen.getByLabelText(
      'Agregar Remera The Beatles al carrito',
    );
    await user.click(addBtn);

    expect(screen.getByText('Agregado')).toBeInTheDocument();
  });

  it('llama a onAddToCart sin talle para producto sin tipo (no talleable)', async () => {
    const onAddToCart = vi.fn();
    const user = userEvent.setup();

    render(
      <ProductDetailPage
        product={PRODUCT_SIN_TIPO}
        onAddToCart={onAddToCart}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );

    await user.click(
      screen.getByLabelText('Agregar Póster Pink Floyd al carrito'),
    );

    expect(onAddToCart).toHaveBeenCalledWith(PRODUCT_SIN_TIPO, 1, undefined);
  });
});

describe('ProductDetailPage — botón "Comprar ahora"', () => {
  it('llama a onBuyNow con producto, cantidad y talle al hacer clic', async () => {
    const onBuyNow = vi.fn();
    const user = userEvent.setup();

    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={onBuyNow}
        onBack={() => {}}
      />,
    );

    await user.click(screen.getByLabelText('Talle XL'));
    await user.click(
      screen.getByLabelText('Comprar Remera The Beatles ahora'),
    );

    expect(onBuyNow).toHaveBeenCalledTimes(1);
    expect(onBuyNow).toHaveBeenCalledWith(REMERA, 1, 'XL');
  });

  it('llama a onBuyNow sin talle para producto no talleable', async () => {
    const onBuyNow = vi.fn();
    const user = userEvent.setup();

    render(
      <ProductDetailPage
        product={VASO}
        onAddToCart={() => {}}
        onBuyNow={onBuyNow}
        onBack={() => {}}
      />,
    );

    await user.click(screen.getByLabelText('Comprar Vaso Rolling Stones ahora'));

    expect(onBuyNow).toHaveBeenCalledWith(VASO, 1, undefined);
  });

  it('no muestra feedback de "Agregado" al hacer clic en Comprar ahora', async () => {
    const user = userEvent.setup();

    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );

    await user.click(screen.getByLabelText('Talle M'));
    await user.click(
      screen.getByLabelText('Comprar Remera The Beatles ahora'),
    );

    expect(screen.queryByText('Agregado')).not.toBeInTheDocument();
  });
});

describe('ProductDetailPage — botón "Volver"', () => {
  it('llama a onBack al hacer clic en Volver', async () => {
    const onBack = vi.fn();
    const user = userEvent.setup();

    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={onBack}
      />,
    );

    await user.click(screen.getByLabelText('Volver a la tienda'));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

// ──────────────────────────────────────────────────────────────
//  ProductDetailPage — estados disabled por talle no seleccionado
// ──────────────────────────────────────────────────────────────

describe('ProductDetailPage — botones deshabilitados sin talle', () => {
  it('deshabilita "Agregar al carrito" si el talle es requerido y no se seleccionó', () => {
    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );

    const addBtn = screen.getByLabelText(
      'Agregar al carrito: seleccioná un talle primero',
    );
    expect(addBtn).toBeDisabled();
  });

  it('deshabilita "Comprar ahora" si el talle es requerido y no se seleccionó', () => {
    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );

    const buyBtn = screen.getByLabelText(
      'Comprar ahora: seleccioná un talle primero',
    );
    expect(buyBtn).toBeDisabled();
  });

  it('habilita ambos botones para producto no talleable (vaso)', () => {
    render(
      <ProductDetailPage
        product={VASO}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );

    const addBtn = screen.getByLabelText('Agregar Vaso Rolling Stones al carrito');
    const buyBtn = screen.getByLabelText('Comprar Vaso Rolling Stones ahora');

    expect(addBtn).not.toBeDisabled();
    expect(buyBtn).not.toBeDisabled();
  });

  it('habilita ambos botones para producto sin tipo', () => {
    render(
      <ProductDetailPage
        product={PRODUCT_SIN_TIPO}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );

    const addBtn = screen.getByLabelText(
      'Agregar Póster Pink Floyd al carrito',
    );
    const buyBtn = screen.getByLabelText(
      'Comprar Póster Pink Floyd ahora',
    );

    expect(addBtn).not.toBeDisabled();
    expect(buyBtn).not.toBeDisabled();
  });

  it('habilita botones tras seleccionar un talle', async () => {
    const user = userEvent.setup();
    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );

    // Antes: deshabilitado
    const addBtnBefore = screen.getByLabelText(
      'Agregar al carrito: seleccioná un talle primero',
    );
    expect(addBtnBefore).toBeDisabled();

    // Seleccionar talle
    await user.click(screen.getByLabelText('Talle XXL'));

    // Después: habilitado
    const addBtnAfter = screen.getByLabelText(
      'Agregar Remera The Beatles al carrito',
    );
    expect(addBtnAfter).not.toBeDisabled();
  });
});

// ──────────────────────────────────────────────────────────────
//  ProductDetailPage — skeleton (loading state)
// ──────────────────────────────────────────────────────────────

describe('ProductDetailPage — skeleton', () => {
  it('muestra skeleton cuando el producto tiene id=0 (sin datos mínimos)', () => {
    render(
      <ProductDetailPage
        product={EMPTY}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );

    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-label', 'Cargando producto');
  });

  it('no renderiza datos del producto durante el skeleton', () => {
    render(
      <ProductDetailPage
        product={EMPTY}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );

    expect(screen.queryByText('Remera The Beatles')).not.toBeInTheDocument();
    expect(screen.queryByRole('radiogroup')).not.toBeInTheDocument();
  });

  it('no muestra skeleton cuando el producto tiene id válido', () => {
    render(
      <ProductDetailPage
        product={REMERA}
        onAddToCart={() => {}}
        onBuyNow={() => {}}
        onBack={() => {}}
      />,
    );

    expect(
      screen.queryByRole('status'),
    ).not.toBeInTheDocument();
  });
});

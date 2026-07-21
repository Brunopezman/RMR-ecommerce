import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// ─── Mock global fetch para evitar llamadas reales ────────────────────
// useCatalog hace fetch a http://localhost:4000/products y fallback a /data/db.json.
// Retornamos un array vacío para aislar el test de la red.

let mockFetchUrlCallback;

// Producto de ejemplo para las pruebas de detalle
const MOCK_PRODUCT_DETAIL = {
  id: 1,
  nombre: 'Remera The Beatles',
  tipo: 'remera',
  img: '/img/remerathebeatles.png',
  descripcion: 'The Beatles - negra - lisa',
  precio: 4000,
};

beforeEach(() => {
  // Mock de fetch que responde a cualquier URL con productos vacíos
  mockFetchUrlCallback = vi.fn((url) => {
    if (url === '/data/db.json') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ products: [] }),
      });
    }
    // Producto individual: /products/:id
    if (/\/products\/\d+$/.test(url)) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(MOCK_PRODUCT_DETAIL),
      });
    }
    // API: devolvemos OK con array vacío
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    });
  });

  global.fetch = vi.fn().mockImplementation(mockFetchUrlCallback);

  // Limpiar localStorage para cada test
  localStorage.clear();

  // Reset window.location a / para aislar tests de navegación previa
  window.history.pushState({}, '', '/');
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ──────────────────────────────────────────────────────────────────────
//  Navegación — App entera
// ──────────────────────────────────────────────────────────────────────
describe('App — renderizado inicial (home)', () => {
  it('renderiza el título principal de la app', async () => {
    render(<App />);

    // El título aparece tanto en la navbar como en el hero
    const titles = await screen.findAllByText('Rock Merch & Roll');
    expect(titles.length).toBeGreaterThanOrEqual(1);
  });

  it('muestra la sección hero con el botón "Compra Ahora" en home', async () => {
    render(<App />);

    // El hero tiene un botón "Compra Ahora"
    const compraAhora = await screen.findByText('Compra Ahora');
    expect(compraAhora).toBeInTheDocument();
    expect(compraAhora.tagName).toBe('BUTTON');
  });

  it('muestra el subtítulo del hero en home', async () => {
    render(<App />);

    const subtitle = await screen.findByText('Contenido para fanáticos');
    expect(subtitle).toBeInTheDocument();
  });

  it('muestra la sección de servicios (banner-services) en home', async () => {
    render(<App />);

    const envios = await screen.findByText('Envíos gratis');
    expect(envios).toBeInTheDocument();

    const cuotas = await screen.findByText('Financiación en cuotas');
    expect(cuotas).toBeInTheDocument();

    const segura = await screen.findByText('Compra de manera segura');
    expect(segura).toBeInTheDocument();
  });

  it('muestra la sección brand con logos de bandas en home', async () => {
    render(<App />);

    // Logos de bandas
    expect(screen.getByAltText('AC/DC')).toBeInTheDocument();
    expect(screen.getByAltText('The Beatles')).toBeInTheDocument();
    expect(screen.getByAltText('Guns N\' Roses')).toBeInTheDocument();
  });

  it('muestra el navbar con botones de navegación', async () => {
    render(<App />);

    // Los botones de navegación son los únicos <button> con estos textos
    const inicioBtn = await screen.findByText('Inicio', { selector: 'button' });
    const productosBtn = await screen.findByText('Productos', { selector: 'button' });
    const contactoBtn = await screen.findByText('Contacto', { selector: 'button' });

    expect(inicioBtn).toBeInTheDocument();
    expect(productosBtn).toBeInTheDocument();
    expect(contactoBtn).toBeInTheDocument();
  });

  it('NO muestra la sección de productos en home', () => {
    render(<App />);

    // El título "Productos" de la sección shop no debería estar visible
    // (solo el link de navegación "Productos")
    expect(screen.queryByText('Aca vas a poder observar los produtos con los mejores precios de la temporada.')).not.toBeInTheDocument();
  });

  it('muestra el footer con enlaces', async () => {
    render(<App />);

    const footerBrand = await screen.findByText('Rock Merch & Roll', { selector: 'h3' });
    expect(footerBrand).toBeInTheDocument();
    expect(screen.getByText('Contacto', { selector: 'h4' })).toBeInTheDocument();
    expect(screen.getByText('Seguinos', { selector: 'h4' })).toBeInTheDocument();
    expect(screen.getByText('+54 11 5555-0123')).toBeInTheDocument();
    expect(screen.getByText('info@rockmerch.com.ar')).toBeInTheDocument();
    expect(screen.getByText(/Designed & Developed by Bruno Pezman/i)).toBeInTheDocument();
  });

  it('muestra la sección FAQ en la App', async () => {
    render(<App />);

    // El título de FAQ debe estar presente
    expect(await screen.findByText('Preguntas Frecuentes')).toBeInTheDocument();

    // Al menos una pregunta del FAQ debe ser visible
    expect(screen.getByText('¿Cuánto tarda el envío?')).toBeInTheDocument();
    expect(screen.getByText('Todo lo que necesitás saber antes de comprar')).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────────
//  Navegación: Contacto desde navbar
// ──────────────────────────────────────────────────────────────────────
describe('Navegación — contacto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('navega a /contact al hacer clic en "Contacto" del navbar', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Click en "Contacto" del navbar
    const contactoBtn = await screen.findByText('Contacto', { selector: 'button' });
    await user.click(contactoBtn);

    // La página de contacto debería renderizarse con el título "Contacto"
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Contacto' }),
      ).toBeInTheDocument();
    });

    // Hero debería estar oculto (ya no estamos en home)
    expect(screen.queryByText('Contenido para fanáticos')).not.toBeInTheDocument();
  });

  it('el botón "Contacto" está presente en la navbar', async () => {
    render(<App />);

    const contactoBtn = await screen.findByText('Contacto', { selector: 'button' });
    expect(contactoBtn).toBeInTheDocument();
    expect(contactoBtn.tagName).toBe('BUTTON');
  });
});

// ──────────────────────────────────────────────────────────────────────
//  Navegación: home → shop → home
// ──────────────────────────────────────────────────────────────────────
describe('Navegación — home/shop', () => {
  it('navega a shop al hacer clic en "Productos" del navbar', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Click en "Productos" del navbar
    const productosBtn = await screen.findByText('Productos', { selector: 'button' });
    await user.click(productosBtn);

    // Ahora debería verse la sección de productos
    await waitFor(() => {
      expect(screen.getByText('Aca vas a poder observar los produtos con los mejores precios de la temporada.')).toBeInTheDocument();
    });

    // Hero debería estar oculto
    expect(screen.queryByText('Contenido para fanáticos')).not.toBeInTheDocument();
  });

  it('navega a shop y vuelve a home al hacer clic en "Inicio"', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Ir a shop
    const productosBtn = await screen.findByText('Productos', { selector: 'button' });
    await user.click(productosBtn);

    await waitFor(() => {
      expect(screen.getByText('Aca vas a poder observar los produtos con los mejores precios de la temporada.')).toBeInTheDocument();
    });

    // Volver a home
    const inicioBtn = await screen.findByText('Inicio', { selector: 'button' });
    await user.click(inicioBtn);

    await waitFor(() => {
      expect(screen.getByText('Contenido para fanáticos')).toBeInTheDocument();
    });

    // Shop debería estar oculto
    expect(screen.queryByText('Aca vas a poder observar los produtos con los mejores precios de la temporada.')).not.toBeInTheDocument();
  });

  it('el botón "Compra Ahora" en hero navega a shop', async () => {
    const user = userEvent.setup();
    render(<App />);

    const compraAhora = await screen.findByText('Compra Ahora');
    await user.click(compraAhora);

    await waitFor(() => {
      expect(screen.getByText('Aca vas a poder observar los produtos con los mejores precios de la temporada.')).toBeInTheDocument();
    });
  });
});

// ──────────────────────────────────────────────────────────────────────
//  Navegación: checkout vía URL
// ──────────────────────────────────────────────────────────────────────
describe('Ruteo — checkout por pathname', () => {
  it('renderiza la página de checkout cuando la ruta es /checkout', async () => {
    // Simular navegación a /checkout antes de renderizar
    act(() => {
      window.history.pushState({}, '', '/checkout');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    render(<App />);

    // El checkout renderiza. Con carrito vacío muestra la pantalla de
    // "Tu carrito está vacío" y un enlace para volver a la tienda
    await waitFor(() => {
      expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
    });
    expect(screen.getByText('Ir a la tienda')).toBeInTheDocument();
  });

  it('renderiza shop normal cuando la ruta no incluye checkout', () => {
    act(() => {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    render(<App />);

    // Debería ver la home
    expect(screen.getByText('Contenido para fanáticos')).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────────
//  Carrito — contador y modal
// ──────────────────────────────────────────────────────────────────────
describe('Carrito — interacción mínima desde App', () => {
  it('el contador del carrito muestra 0 inicialmente', async () => {
    render(<App />);

    const contador = await screen.findByText('0');
    // El contador está dentro del span con id "contador-carrito"
    expect(contador.id).toBe('contador-carrito');
  });

  it('abre el modal del carrito al hacer clic en el icono del carrito', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Buscar el botón del carrito por aria-label
    const cartButton = await screen.findByLabelText('Abrir carrito');
    await user.click(cartButton);

    // El modal del carrito debería abrirse — verificamos que "Carrito" (título del modal) está visible
    await waitFor(() => {
      expect(screen.getByText('Carrito')).toBeInTheDocument();
    });
    // También debería mostrar que está vacío y el botón de finalizar
    expect(screen.getByText('Tu carrito está vacío. Explorá nuestro catálogo y llevate algo piola.')).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────────
//  Navegación: detalle de producto vía /product/:id
// ──────────────────────────────────────────────────────────────────────
describe('Ruteo — /product/:id', () => {
  it('renderiza la página de detalle de producto al navegar a /product/1', async () => {
    // Navegar a /product/1 antes de renderizar
    act(() => {
      window.history.pushState({}, '', '/product/1');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    render(<App />);

    // Debe mostrar el nombre del producto (que viene del fetch mockeado)
    await waitFor(() => {
      expect(screen.getByText('Remera The Beatles')).toBeInTheDocument();
    });

    // Debe mostrar el precio
    await waitFor(() => {
      expect(screen.getByText('$4.000')).toBeInTheDocument();
    });

    // Debe mostrar el selector de talle (es remera)
    expect(
      screen.getByRole('radiogroup', { name: 'Seleccionar talle' }),
    ).toBeInTheDocument();

    // El botón de volver debe estar presente
    expect(
      screen.getByLabelText('Volver a la tienda'),
    ).toBeInTheDocument();
  });

  it('renderiza el detalle de producto para un producto diferente', async () => {
    const otroProducto = {
      ...MOCK_PRODUCT_DETAIL,
      id: 14,
      nombre: 'Gorra Nirvana',
      tipo: 'accesorio',
      img: '/img/gorranirvana.png',
      precio: 1500,
    };

    // Reemplazar mock para este producto específico
    mockFetchUrlCallback = vi.fn((url) => {
      if (/\/products\/14$/.test(url)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(otroProducto),
        });
      }
      if (url === '/data/db.json') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ products: [] }),
        });
      }
      if (/\/products\/\d+$/.test(url)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(MOCK_PRODUCT_DETAIL),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });
    global.fetch = vi.fn().mockImplementation(mockFetchUrlCallback);

    act(() => {
      window.history.pushState({}, '', '/product/14');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Gorra Nirvana')).toBeInTheDocument();
    });

    // Si es accesorio, NO debe tener selector de talle
    expect(
      screen.queryByRole('radiogroup'),
    ).not.toBeInTheDocument();
  });

  it('navega de vuelta a /shop al hacer clic en "Volver" desde el detalle', async () => {
    const user = userEvent.setup();

    act(() => {
      window.history.pushState({}, '', '/product/1');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    render(<App />);

    // Esperar que se cargue el detalle
    await waitFor(() => {
      expect(screen.getByText('Remera The Beatles')).toBeInTheDocument();
    });

    // Hacer clic en Volver
    await user.click(screen.getByLabelText('Volver a la tienda'));

    // Debería mostrar la vista de shop (sección de productos con ese texto)
    await waitFor(() => {
      expect(
        screen.getByText(
          'Aca vas a poder observar los produtos con los mejores precios de la temporada.',
        ),
      ).toBeInTheDocument();
    });

    // El detalle ya no debería estar visible
    expect(screen.queryByText('Remera The Beatles')).not.toBeInTheDocument();
  });
});

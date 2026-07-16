import { useState, useContext, useSyncExternalStore, useMemo, useCallback, useEffect } from 'react';
import { useCatalog } from './hooks/useCatalog';
import { ProductGrid } from './components/catalog/ProductGrid';
import { FilterSidebar } from './components/catalog/FilterSidebar';
import { CartModal } from './components/cart/CartModal';
import { LoginModal } from './components/auth/LoginModal';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { CartProvider, CartContext } from './context/CartContext';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ShoppingConcierge } from './components/chat/ShoppingConcierge';
import { ProductDetailPage } from './components/catalog/ProductDetailPage';
import { fetchProductById } from './services/api';
import type { Product } from './types/product';

function getPath() {
  return window.location.pathname;
}

function navigate(path: string) {
  if (window.location.pathname === path) return;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function Router({ children }: { children: React.ReactNode }) {
  const pathname = useSyncExternalStore(
    (cb) => {
      window.addEventListener('popstate', cb);
      return () => window.removeEventListener('popstate', cb);
    },
    getPath,
  );

  if (pathname.includes('/checkout')) {
    return (
      <>
        <Header onNavigate={(v) => navigate(v === 'shop' ? '/shop' : '/')} />
        <CheckoutPage />
      </>
    );
  }

  const productMatch = pathname.match(/^\/product\/(\d+)/);
  if (productMatch) {
    const productId = parseInt(productMatch[1], 10);
    return <ProductDetailRoute productId={productId} />;
  }

  return <>{children}</>;
}

/* ──────────────────────────────────────────────────────────────
 *  ProductDetailRoute — carga producto por ID y renderiza detalle
 * ────────────────────────────────────────────────────────────── */
function ProductDetailRoute({ productId }: { productId: number }) {
  const { addToCart } = useContext(CartContext)!;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchProductById(productId)
      .then((data) => {
        if (!cancelled) {
          setProduct(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Error al cargar el producto');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [productId]);

  const handleAddToCart = useCallback(
    (p: Product, quantity: number, _size?: string) => {
      for (let i = 0; i < quantity; i++) {
        addToCart(p);
      }
    },
    [addToCart],
  );

  const handleBuyNow = useCallback(
    (p: Product, quantity: number, _size?: string) => {
      for (let i = 0; i < quantity; i++) {
        addToCart(p);
      }
      navigate('/checkout');
    },
    [addToCart],
  );

  const handleBack = useCallback(() => {
    navigate('/shop');
  }, []);

  // Loading — mostrar skeleton de ProductDetailPage
  if (loading) {
    return (
      <>
        <Header onNavigate={(v) => navigate(v === 'shop' ? '/shop' : '/')} />
        <ProductDetailPage
          product={{ id: 0, nombre: '', img: '', precio: 0 } as Product}
          onAddToCart={() => {}}
          onBuyNow={() => {}}
          onBack={handleBack}
        />
        <Footer />
      </>
    );
  }

  // Error — producto no encontrado o error de red
  if (error || !product) {
    return (
      <>
        <Header onNavigate={(v) => navigate(v === 'shop' ? '/shop' : '/')} />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center px-4">
            <div className="text-6xl mb-4 text-gray-300">
              <svg className="w-24 h-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Producto no encontrado
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {error || 'El producto que buscas no existe o fue removido.'}
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="inline-block bg-coral hover:bg-coral-dark text-white px-8 py-3 rounded font-medium transition-colors duration-300 cursor-pointer border-0"
            >
              Volver a la tienda
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Success
  return (
    <>
      <Header onNavigate={(v) => navigate(v === 'shop' ? '/shop' : '/')} />
      <ProductDetailPage
        product={product}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onBack={handleBack}
      />
      <Footer />
    </>
  );
}

function Header({ onNavigate }: { onNavigate: (view: 'home' | 'shop') => void }) {
  const { addToCart, itemCount } = useContext(CartContext)!;
  const { isAuthenticated, user, logout } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-md sticky top-0 left-0 z-40" style={{ boxShadow: '0 5px 10px rgba(0, 0, 0, 0.1)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-16">
            <h1
              className="text-2xl font-bold tracking-tight text-gray-900 font-display flex items-center gap-2 cursor-pointer"
              id="title"
              onClick={() => onNavigate('home')}
            >
              <img src="/img/favicon.ico" alt="Rock Merch & Roll" className="h-8 w-8" />
              Rock Merch & Roll
            </h1>

            {/* Mobile toggle */}
            <button
              className="navbar-toggler border-none outline-none lg:hidden p-2"
              type="button"
              id="bar"
              onClick={() => {
                const el = document.getElementById('navbarNav');
                if (el) el.classList.toggle('hidden');
              }}
            >
              <i className="bx bx-menu" />
            </button>

            {/* Nav links */}
            <div className="hidden lg:flex lg:items-center lg:gap-4" id="navbarNav">
              <ul className="flex items-center gap-4 list-none m-0 p-0">
                <li className="nav-item">
                  <button
                    className="nav-link px-2 py-1 text-black no-underline transition-colors duration-300 hover:text-coral text-base bg-transparent border-0 cursor-pointer"
                    onClick={() => {
                      document.getElementById('navbarNav')?.classList.add('hidden');
                      onNavigate('home');
                    }}
                  >
                    Inicio
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link px-2 py-1 text-black no-underline transition-colors duration-300 hover:text-coral text-base bg-transparent border-0 cursor-pointer"
                    onClick={() => {
                      document.getElementById('navbarNav')?.classList.add('hidden');
                      onNavigate('shop');
                    }}
                  >
                    Productos
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className="nav-link px-2 py-1 text-black no-underline transition-colors duration-300 hover:text-coral text-base bg-transparent border-0 cursor-pointer"
                    onClick={() => {
                      document.getElementById('navbarNav')?.classList.add('hidden');
                      onNavigate('home');
                    }}
                  >
                    Contacto
                  </button>
                </li>
              </ul>

              <div className="flex items-center gap-4 ml-4">
                {/* Auth */}
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-2">
                    <span className="text-dark">
                      {user.name}
                    </span>
                    <button
                      className="nav-link p-0 bg-transparent border-0"
                      onClick={() => {
                        const modalId = 'logoutConfirmModal';
                        const existing = document.getElementById(modalId);
                        if (existing) existing.remove();

                        const modalHtml = `
                          <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered">
                              <div class="modal-content">
                                <div class="modal-header">
                                  <h5 class="modal-title">Confirmar cierre de sesión</h5>
                                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                  <p>¿Desea cerrar sesión?</p>
                                </div>
                                <div class="modal-footer">
                                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                  <button type="button" class="btn btn-danger" id="confirm-logout-btn">Sí, estoy seguro</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        `;
                        const wrapper = document.createElement('div');
                        wrapper.innerHTML = modalHtml;
                        document.body.appendChild(wrapper.firstElementChild!);

                        const modalEl = document.getElementById(modalId);
                        if (modalEl) {
                          const modalInstance = new (window as any).bootstrap.Modal(modalEl, { backdrop: 'static' });
                          modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());
                          modalEl.querySelector('#confirm-logout-btn')?.addEventListener('click', () => {
                            modalInstance.hide();
                            logout();
                          });
                          modalInstance.show();
                        }
                      }}
                      title="Cerrar sesión"
                    >
                      <i className="bi bi-box-arrow-right align-middle logout-trigger navbar-icon text-xl" />
                    </button>
                  </div>
                ) : (
                  <button
                    id="login-nav-item"
                    className="nav-link bg-transparent border-0 p-0"
                    onClick={() => setLoginOpen(true)}
                  >
                    <i className="bx bx-user navbar-icon" />
                  </button>
                )}

                {/* Cart icon */}
                <button
                  id="tienda"
                  className="relative bg-transparent border-0 cursor-pointer p-0"
                  onClick={() => setCartOpen(true)}
                  aria-label="Abrir carrito"
                >
                  <i className="bx bxs-shopping-bag navbar-icon" />
                  <span
                    id="contador-carrito"
                    className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {itemCount}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

function HeroSection({ onShopClick }: { onShopClick: () => void }) {
  return (
    <section
      id="home"
      className="w-full h-screen flex flex-col justify-center items-start bg-cover bg-no-repeat"
      style={{
        backgroundImage:
          'linear-gradient(rgba(155,154,154,0.75),rgba(156,156,156,0.75)), url(/img/fondo-home.jpg)',
        backgroundPosition: 'top 60px center',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <h1 id="title" className="text-4xl font-bold font-garamond text-white">
          Rock Merch & Roll
        </h1>
        <h5 id="subtitle" className="text-white text-lg mt-2 font-display">
          Contenido para fanáticos
        </h5>
        <button
          onClick={onShopClick}
          className="mt-6 inline-block bg-black hover:bg-coral text-white px-8 py-3 rounded font-medium transition-colors duration-300 uppercase tracking-wide font-bold text-sm border-0 cursor-pointer"
        >
          Compra Ahora
        </button>
      </div>
    </section>
  );
}

function BannerServices() {
  return (
    <section id="banner-services" className="bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap">
          {/* Envíos gratis */}
          <div className="service-item-container w-full md:w-1/3 p-0 px-0 md:px-3 py-5">
            <div className="service-item mx-4 md:mx-0">
              <div className="flex items-start mx-0">
                <div className="px-5 flex-shrink-0">
                  <i className="bx bxs-truck bx-md text-2xl" />
                </div>
                <div className="flex-1 p-0">
                  <h4 className="text-lg font-semibold">Envíos gratis</h4>
                  <p className="text-gray-600 text-sm">A partir de compras superiores a $20.000</p>
                </div>
              </div>
            </div>
          </div>

          {/* Financiación en cuotas */}
          <div className="service-item-container w-full md:w-1/3 p-0 px-0 md:px-3 py-5">
            <div className="service-item mx-4 md:mx-0">
              <div className="flex items-start mx-0">
                <div className="px-5 flex-shrink-0">
                  <i className="bx bxs-credit-card bx-md text-2xl" />
                </div>
                <div className="flex-1 p-0">
                  <h4 className="text-lg font-semibold">Financiación en cuotas</h4>
                  <p className="text-gray-600 text-sm">
                    <span className="inline-block bg-coral text-white px-2 py-0.5 rounded text-sm mr-1">
                      3 cuotas &bull; 10%
                    </span>
                    <span className="inline-block bg-black text-white px-2 py-0.5 rounded text-sm mr-1">
                      6 cuotas &bull; 15%
                    </span>
                    <br /><br />
                    Pagando con tarjetas de crédito bancarias.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Compra segura */}
          <div className="service-item-container w-full md:w-1/3 p-0 px-0 md:px-3 py-5">
            <div className="service-item mx-4 md:mx-0">
              <div className="flex items-start mx-0">
                <div className="px-5 flex-shrink-0">
                  <i className="bx bxs-user-check bx-md text-2xl" />
                </div>
                <div className="flex-1 p-0">
                  <h4 className="text-lg font-semibold">Compra de manera segura</h4>
                  <p className="text-gray-600 text-sm">Protegemos tus datos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrandSection() {
  return (
    <section id="brand" className="container mx-auto px-4">
      <div className="flex flex-wrap m-0 py-5">
        <img className="img-fluid w-1/2 md:w-1/4 lg:w-1/6 p-2" src="/img/acdc-logo.jpg" alt="AC/DC" />
        <img className="img-fluid w-1/2 md:w-1/4 lg:w-1/6 p-2" src="/img/aerosmith-logo.png" alt="Aerosmith" />
        <img className="img-fluid w-1/2 md:w-1/4 lg:w-1/6 p-2" src="/img/Logo-Guns-N-Roses.png" alt="Guns N' Roses" />
        <img className="img-fluid w-1/2 md:w-1/4 lg:w-1/6 p-2" src="/img/rolling-stones-logo.jpg" alt="Rolling Stones" />
        <img className="img-fluid w-1/2 md:w-1/4 lg:w-1/6 p-2" src="/img/thebeatles-logo.png" alt="The Beatles" />
        <img className="img-fluid w-1/2 md:w-1/4 lg:w-1/6 p-2" src="/img/thewho-logo.png" alt="The Who" />
      </div>
    </section>
  );
}

function ProductsSection() {
  const {
    products,
    loading,
    error,
    filterByCategories,
    filterByPrice,
    activeCategories,
    activeMaxPrice,
  } = useCatalog();
  const { addToCart } = useContext(CartContext)!;

  // Derive min/max price from all products for the range slider
  const priceRange = useMemo(() => {
    const prices = products.map((p) => p.precio);
    return {
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPriceLimit: prices.length > 0 ? Math.max(...prices) : 10000,
    };
    // NOTE: we don't want this to recompute on every filter change,
    // but the FilterSidebar reads it as static bounds. Since products
    // is already filtered, we compute from the full useCatalog result.
    // In practice, the full catalog doesn't change after mount, so this is fine.
  }, [products]);

  const handleCategoryChange = useCallback(
    (categories: string[]) => {
      filterByCategories(categories);
    },
    [filterByCategories],
  );

  const handlePriceChange = useCallback(
    (maxPrice: number | null) => {
      filterByPrice(maxPrice);
    },
    [filterByPrice],
  );

  const handleClearFilters = useCallback(() => {
    filterByCategories([]);
    filterByPrice(null);
  }, [filterByCategories, filterByPrice]);

  const handleProductClick = useCallback((id: number) => {
    navigate(`/product/${id}`);
  }, []);

  return (
    <section id="destacados" className="my-5 py-5">
      <div className="container mt-2 py-5 mx-auto px-4">
        <h1 className="font-bold text-2xl font-display">Productos</h1>
        <hr />
        <h5 className="text-muted">
          Aca vas a poder observar los produtos con los mejores precios de la temporada.
        </h5>
      </div>

      <div className="flex gap-8 mx-auto max-w-7xl px-4">
        {/* Sidebar — hidden on mobile (FilterSidebar has its own mobile drawer) */}
        <FilterSidebar
          selectedCategories={activeCategories}
          maxPrice={activeMaxPrice}
          minPrice={priceRange.minPrice}
          maxPriceLimit={priceRange.maxPriceLimit}
          onCategoryChange={handleCategoryChange}
          onPriceChange={handlePriceChange}
          onClearFilters={handleClearFilters}
        />

        {/* Product grid — takes remaining space */}
        <div className="flex-1 min-w-0">
          <ProductGrid
            products={products}
            onAddToCart={addToCart}
            onProductClick={handleProductClick}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#d8d8d8] py-5 mt-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h5 className="font-bold text-lg mb-4">Rock Merch & Roll</h5>
            <p className="text-sm">
              Tu tienda de merchandising oficial de las mejores bandas de rock.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-lg mb-4">Productos</h5>
            <ul className="list-none p-0">
              <li className="mb-2">
                <a href="#" className="text-sm text-black no-underline transition-colors duration-300 hover:bg-coral hover:text-white block px-2 py-1 rounded">
                  Remeras
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-sm text-black no-underline transition-colors duration-300 hover:bg-coral hover:text-white block px-2 py-1 rounded">
                  Gorras
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-sm text-black no-underline transition-colors duration-300 hover:bg-coral hover:text-white block px-2 py-1 rounded">
                  Accesorios
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-lg mb-4">Ayuda</h5>
            <ul className="list-none p-0">
              <li className="mb-2">
                <a href="#" className="text-sm text-black no-underline transition-colors duration-300 hover:bg-coral hover:text-white block px-2 py-1 rounded">
                  Preguntas frecuentes
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-sm text-black no-underline transition-colors duration-300 hover:bg-coral hover:text-white block px-2 py-1 rounded">
                  Envíos
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-sm text-black no-underline transition-colors duration-300 hover:bg-coral hover:text-white block px-2 py-1 rounded">
                  Devoluciones
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-lg mb-4">Seguinos</h5>
            <div className="flex gap-2">
              <a href="#" className="w-[38px] h-[38px] bg-[#d8d8d8] rounded-full flex items-center justify-center text-center transition-colors duration-300 hover:bg-coral no-underline text-black" style={{ lineHeight: '38px' }}>
                <i className="bx bxl-facebook" />
              </a>
              <a href="#" className="w-[38px] h-[38px] bg-[#d8d8d8] rounded-full flex items-center justify-center text-center transition-colors duration-300 hover:bg-coral no-underline text-black" style={{ lineHeight: '38px' }}>
                <i className="bx bxl-instagram" />
              </a>
              <a href="#" className="w-[38px] h-[38px] bg-[#d8d8d8] rounded-full flex items-center justify-center text-center transition-colors duration-300 hover:bg-coral no-underline text-black" style={{ lineHeight: '38px' }}>
                <i className="bx bxl-twitter" />
              </a>
            </div>
          </div>
        </div>
        <hr className="my-4 border-gray-400 w-full" />
        <p className="text-center text-sm">
          Rock Merch & Roll &copy; 2022. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

function ShopPage() {
  const [view, setView] = useState<'home' | 'shop'>(
    window.location.pathname === '/shop' ? 'shop' : 'home'
  );

  return (
    <div className="min-h-screen bg-white">
      <Header onNavigate={setView} />
      {view === 'home' ? (
        <>
          <HeroSection onShopClick={() => setView('shop')} />
          <BannerServices />
          <BrandSection />
        </>
      ) : (
        <ProductsSection />
      )}
      <Footer />
      <ShoppingConcierge />
    </div>
  );
}

function AppContent() {
  return (
    <Router>
      <ShopPage />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

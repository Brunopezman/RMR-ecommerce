import { useState, useContext, useCallback, useSyncExternalStore } from 'react';
import { useCatalog } from './hooks/useCatalog';
import { ProductGrid } from './components/catalog/ProductGrid';
import { CartModal } from './components/cart/CartModal';
import { LoginModal } from './components/auth/LoginModal';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { CartProvider, CartContext } from './context/CartContext';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { ShoppingConcierge } from './components/chat/ShoppingConcierge';
import { Toast } from './components/ui/Toast';
import { useToast } from './hooks/useToast';
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

  return pathname.includes('/checkout') ? (
    <>
      <Header onNavigate={(v) => navigate(v === 'shop' ? '/shop' : '/')} />
      <CheckoutPage />
    </>
  ) : (
    <>{children}</>
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
              onClick={() => onNavigate('home')}
            >
              <img src="/img/favicon.ico" alt="Rock Merch & Roll" className="h-8 w-8" />
              Rock Merch & Roll
            </h1>

            {/* Mobile toggle */}
            <button
              className="navbar-toggler border-none lg:hidden p-2 focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
              type="button"
              id="bar"
              aria-label="Abrir menú de navegación"
              onClick={() => {
                const el = document.getElementById('navbarNav');
                if (el) el.classList.toggle('hidden');
              }}
            >
              <i className="bx bx-menu" aria-hidden="true" />
            </button>

            {/* Nav links */}
            <div className="hidden lg:flex lg:items-center lg:gap-4" id="navbarNav">
              <ul className="flex items-center gap-4 list-none m-0 p-0">
                <li className="nav-item">
                  <button
                    className="nav-link px-2 py-1 text-black no-underline transition-colors duration-300 hover:text-coral-dark text-base bg-transparent border-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
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
                    className="nav-link px-2 py-1 text-black no-underline transition-colors duration-300 hover:text-coral-dark text-base bg-transparent border-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
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
                    className="nav-link px-2 py-1 text-black no-underline transition-colors duration-300 hover:text-coral-dark text-base bg-transparent border-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
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
                      className="nav-link p-1.5 bg-transparent border-0 focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
                      aria-label="Cerrar sesión"
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
                                  <p>¿Querés cerrar sesión?</p>
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
                    className="nav-link bg-transparent border-0 p-1.5 focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
                    onClick={() => setLoginOpen(true)}
                    aria-label="Iniciar sesión"
                  >
                    <i className="bx bx-user navbar-icon" aria-hidden="true" />
                  </button>
                )}

                {/* Cart icon */}
                <button
                  id="tienda"
                  className="relative bg-transparent border-0 cursor-pointer p-1.5"
                  onClick={() => setCartOpen(true)}
                  aria-label="Abrir carrito"
                >
                  <i className="bx bxs-shopping-bag navbar-icon" aria-hidden="true" />
              <span
                id="contador-carrito"
                className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                aria-live="polite"
                aria-atomic="true"
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
      id="main-content"
      className="w-full h-screen flex flex-col justify-center items-start bg-cover bg-no-repeat"
      style={{
        backgroundImage:
          'linear-gradient(rgba(155,154,154,0.75),rgba(156,156,156,0.75)), url(/img/fondo-home.jpg)',
        backgroundPosition: 'top 60px center',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <h1 className="text-4xl font-bold font-garamond text-white">
          Rock Merch & Roll
        </h1>
        <p className="text-white text-lg mt-2 font-display">
          Contenido para fanáticos
        </p>
        <button
          onClick={onShopClick}
          className="mt-6 inline-block bg-black hover:bg-coral-dark text-white px-8 py-3 rounded-lg font-medium transition-colors duration-300 uppercase tracking-wide font-bold text-sm border-0 cursor-pointer"
        >
          Comprar ahora
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
                    <span className="inline-block bg-coral-dark text-white px-2 py-0.5 rounded text-sm mr-1">
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

function ProductsSection({ onProductAdded }: { onProductAdded?: (name: string) => void }) {
  const { products, loading, error } = useCatalog();
  const { addToCart } = useContext(CartContext)!;

  const handleAddToCart = useCallback(
    (product: Product) => {
      addToCart(product);
      onProductAdded?.(product.nombre);
    },
    [addToCart, onProductAdded],
  );

  return (
    <section id="destacados" className="my-5 py-5">
      <div className="container mt-2 py-5 mx-auto px-4">
        <h1 className="font-bold text-2xl font-display">Productos</h1>
        <hr />
        <p className="text-muted">
          Acá vas a poder ver los productos con los mejores precios de la temporada.
        </p>
      </div>

      <ProductGrid
        products={products}
        onAddToCart={handleAddToCart}
        loading={loading}
        error={error}
      />
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
                <a href="#" className="text-sm text-black no-underline transition-colors duration-300 hover:bg-coral-dark hover:text-white block px-2 py-1 rounded">
                  Remeras
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-sm text-black no-underline transition-colors duration-300 hover:bg-coral-dark hover:text-white block px-2 py-1 rounded">
                  Gorras
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-sm text-black no-underline transition-colors duration-300 hover:bg-coral-dark hover:text-white block px-2 py-1 rounded">
                  Accesorios
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-lg mb-4">Ayuda</h5>
            <ul className="list-none p-0">
              <li className="mb-2">
                <a href="#" className="text-sm text-black no-underline transition-colors duration-300 hover:bg-coral-dark hover:text-white block px-2 py-1 rounded">
                  Preguntas frecuentes
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-sm text-black no-underline transition-colors duration-300 hover:bg-coral-dark hover:text-white block px-2 py-1 rounded">
                  Envíos
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-sm text-black no-underline transition-colors duration-300 hover:bg-coral-dark hover:text-white block px-2 py-1 rounded">
                  Devoluciones
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-lg mb-4">Seguinos</h5>
            <div className="flex gap-2">
              <a href="#" className="w-11 h-11 bg-[#d8d8d8] rounded-full flex items-center justify-center text-center transition-colors duration-300 hover:bg-coral no-underline text-black" aria-label="Facebook">
                <i className="bx bxl-facebook" aria-hidden="true" />
              </a>
              <a href="#" className="w-11 h-11 bg-[#d8d8d8] rounded-full flex items-center justify-center text-center transition-colors duration-300 hover:bg-coral no-underline text-black" aria-label="Instagram">
                <i className="bx bxl-instagram" aria-hidden="true" />
              </a>
              <a href="#" className="w-11 h-11 bg-[#d8d8d8] rounded-full flex items-center justify-center text-center transition-colors duration-300 hover:bg-coral no-underline text-black" aria-label="Twitter">
                <i className="bx bxl-twitter" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
        <hr className="my-4 border-gray-400 w-full" />
        <p className="text-center text-sm">
          Rock Merch & Roll &copy; 2026. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

function ShopPage() {
  const [view, setView] = useState<'home' | 'shop'>(
    window.location.pathname === '/shop' ? 'shop' : 'home'
  );
  const { toast, showToast, hideToast } = useToast();

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
        <ProductsSection
          onProductAdded={(name) => showToast(`${name} agregado al carrito`)}
        />
      )}
      <Footer />
      <ShoppingConcierge onShowToast={(msg) => showToast(msg)} />
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
}

function AppContent() {
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[60] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:outline-none focus:ring-2 focus:ring-coral">
        Saltar al contenido principal
      </a>
      <Router>
        <ShopPage />
      </Router>
    </>
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

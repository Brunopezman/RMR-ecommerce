import { useState, useContext, useSyncExternalStore } from 'react';
import { useCatalog } from './hooks/useCatalog';
import { ProductGrid } from './components/catalog/ProductGrid';
import { CartModal } from './components/cart/CartModal';
import { LoginModal } from './components/auth/LoginModal';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { CartProvider, CartContext } from './context/CartContext';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

/**
 * Simple location-based router — checks if current path is /checkout.
 */
function getPath() {
  return window.location.pathname;
}

function Router({ children }: { children: React.ReactNode }) {
  const pathname = useSyncExternalStore(
    (cb) => {
      window.addEventListener('popstate', cb);
      return () => window.removeEventListener('popstate', cb);
    },
    getPath,
  );

  return pathname.includes('/checkout') ? <CheckoutPage /> : <>{children}</>;
}

function Header() {
  const { addToCart, itemCount } = useContext(CartContext)!;
  const { isAuthenticated, user, logout } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-md sticky top-0 left-0 z-40" style={{ boxShadow: '0 5px 10px rgba(0, 0, 0, 0.1)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-display" id="title">
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
                  <a
                    className="nav-link px-2 py-1 text-black no-underline transition-colors duration-300 hover:text-coral text-base"
                    href="#home"
                  >
                    Inicio
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link px-2 py-1 text-black no-underline transition-colors duration-300 hover:text-coral text-base"
                    href="#productos"
                  >
                    Productos
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className="nav-link px-2 py-1 text-black no-underline transition-colors duration-300 hover:text-coral text-base"
                    href="#contacto"
                  >
                    Contacto
                  </a>
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

function HeroSection() {
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
        <a
          href="#productos"
          className="mt-6 inline-block bg-black hover:bg-coral text-white px-8 py-3 rounded font-medium transition-colors duration-300 uppercase tracking-wide font-bold text-sm"
        >
          Compra Ahora
        </a>
      </div>
    </section>
  );
}

function ProductsSection() {
  const { products, loading, error } = useCatalog();
  const { addToCart } = useContext(CartContext)!;

  return (
    <section id="destacados" className="my-5 py-5">
      <div className="container mt-2 py-5 mx-auto px-4">
        <h1 className="font-bold text-2xl font-display">Productos</h1>
        <hr />
        <h5 className="text-muted">
          Aca vas a poder observar los produtos con los mejores precios de la temporada.
        </h5>
      </div>

      <ProductGrid
        products={products}
        onAddToCart={addToCart}
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
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <ProductsSection />
      <Footer />
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

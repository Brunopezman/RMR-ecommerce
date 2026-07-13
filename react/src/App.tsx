import { useState, useContext } from 'react';
import { useCatalog } from './hooks/useCatalog';
import { ProductGrid } from './components/catalog/ProductGrid';
import { CartModal } from './components/cart/CartModal';
import { LoginModal } from './components/auth/LoginModal';
import { CartProvider, CartContext } from './context/CartContext';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

function Header() {
  const { addToCart, itemCount } = useContext(CartContext)!;
  const { isAuthenticated, user, logout } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-display">
              Rock Merch & Roll
            </h1>
            <div className="flex items-center gap-4">
              {/* Auth */}
              {isAuthenticated && user ? (
                <div className="d-flex align-items-center gap-2">
                  <span className="user-name-text-sibling text-dark me-2">
                    {user.name}
                  </span>
                  <button
                    className="nav-link p-0 bg-transparent border-0"
                    onClick={logout}
                    title="Cerrar sesión"
                  >
                    <i className="bi bi-box-arrow-right align-middle logout-trigger" />
                  </button>
                </div>
              ) : (
                <button
                  id="login-nav-item"
                  className="nav-link bg-transparent border-0"
                  onClick={() => setLoginOpen(true)}
                >
                  <i className="bx bx-user" />
                </button>
              )}

              {/* Cart */}
              <button
                id="tienda"
                className="relative bg-transparent border-0 cursor-pointer"
                onClick={() => setCartOpen(true)}
                aria-label="Abrir carrito"
              >
                <i className="bx bxs-shopping-bag text-2xl" />
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
      </header>

      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-gray-900 to-gray-700 text-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h1 id="title" className="text-4xl font-bold font-display">
          Rock Merch & Roll
        </h1>
        <p className="mt-2 text-lg text-gray-300">Contenido para fanáticos</p>
        <a
          href="#productos"
          className="mt-6 inline-block bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium transition"
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
      <div className="container mt-2 py-5">
        <h1 className="font-weight-bold text-2xl font-display">Productos</h1>
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
    <footer className="mt-5 py-5 bg-white">
      <div className="mx-auto max-w-7xl px-4 text-center text-gray-500">
        <p>Rock Merch & Roll &copy; 2022. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <HeroSection />
      <ProductsSection />
      <Footer />
    </div>
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

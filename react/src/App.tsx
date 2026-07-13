import { useCatalog } from './hooks/useCatalog';
import { ProductGrid } from './components/catalog/ProductGrid';
import { CartProvider, CartContext } from './context/CartContext';
import { useContext } from 'react';

function AppContent() {
  const { products, loading, error } = useCatalog();
  const { addToCart, itemCount } = useContext(CartContext)!;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header / Navbar */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 font-display">
              Rock Merch & Roll
            </h1>
            <div className="flex items-center gap-4">
              <span className="relative">
                <i className="bx bxs-shopping-bag text-2xl" />
                <span
                  id="contador-carrito"
                  className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {itemCount}
                </span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
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

      {/* Products Section */}
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

      {/* Footer */}
      <footer className="mt-5 py-5 bg-white">
        <div className="mx-auto max-w-7xl px-4 text-center text-gray-500">
          <p>Rock Merch & Roll &copy; 2022. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  );
}

export default App;

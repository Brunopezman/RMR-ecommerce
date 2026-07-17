import { useState, useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import { CartModal } from '../cart/CartModal';
import { LoginModal } from '../auth/LoginModal';

export function Header({ onNavigate }: { onNavigate: (view: 'home' | 'shop') => void }) {
  const { itemCount } = useContext(CartContext)!;
  const { isAuthenticated, user, logout } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

            <button
              className="navbar-toggler border-none outline-none lg:hidden p-2"
              type="button"
              id="bar"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              <i className="bx bx-menu" />
            </button>

            <div
              className={`${mobileMenuOpen ? 'flex' : 'hidden'} lg:flex lg:items-center lg:gap-4`}
            >
              <ul className="flex items-center gap-4 list-none m-0 p-0">
                <li className="nav-item">
                  <button
                    className="nav-link px-2 py-1 text-black no-underline transition-colors duration-300 hover:text-coral text-base bg-transparent border-0 cursor-pointer"
                    onClick={() => {
                      setMobileMenuOpen(false);
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
                      setMobileMenuOpen(false);
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
                      setMobileMenuOpen(false);
                      onNavigate('home');
                    }}
                  >
                    Contacto
                  </button>
                </li>
              </ul>

              <div className="flex items-center gap-4 ml-4">
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-2">
                    <span className="text-dark">
                      {user.name}
                    </span>
                    <button
                      className="nav-link p-0 bg-transparent border-0"
                      onClick={() => setLogoutConfirmOpen(true)}
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

      {logoutConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setLogoutConfirmOpen(false)}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4 w-full" onClick={(e) => e.stopPropagation()}>
            <h5 className="text-lg font-semibold mb-2">Confirmar cierre de sesión</h5>
            <p className="text-gray-600 mb-4">¿Desea cerrar sesión?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setLogoutConfirmOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 border-0 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => { logout(); setLogoutConfirmOpen(false); }}
                className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 border-0 cursor-pointer"
              >
                Sí, estoy seguro
              </button>
            </div>
          </div>
        </div>
      )}

      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

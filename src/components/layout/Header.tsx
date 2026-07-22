import { useState, useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import { navigate } from '../../services/router';
import { CartModal } from '../cart/CartModal';
import { LoginModal } from '../auth/LoginModal';
import { LogoutConfirmModal } from '../auth/LogoutConfirmModal';

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
                      navigate('/contact');
                    }}
                  >
                    Contacto
                  </button>
                </li>
                {isAuthenticated && user?.role === 'admin' && (
                  <li className="nav-item">
                    <a
                      href="/admin"
                      className="nav-link px-2 py-1 text-purple-700 no-underline transition-colors duration-300 hover:text-purple-500 text-base bg-transparent border-0 cursor-pointer font-semibold"
                      onClick={(e) => {
                        e.preventDefault();
                        setMobileMenuOpen(false);
                        window.history.pushState({}, '', '/admin');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                      }}
                    >
                      Admin
                    </a>
                  </li>
                )}
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

      <LogoutConfirmModal
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirm={() => { logout(); setLogoutConfirmOpen(false); }}
      />

      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}

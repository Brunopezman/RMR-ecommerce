import { useSyncExternalStore } from 'react';
import { getPath, navigate } from '../../services/router';
import { Header } from '../layout/Header';
import { CheckoutPage } from '../checkout/CheckoutPage';
import { ProductDetailRoute } from './ProductDetailRoute';
import { RegisterPage } from '../auth/RegisterPage';
import { AdminPanel } from '../admin/AdminPanel';
import { useAuth } from '../../hooks/useAuth';

function AdminRoute() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-red-600 text-lg">Acceso denegado. Se requiere rol de administrador.</div>
      </div>
    );
  }

  return (
    <>
      <Header onNavigate={(v) => navigate(v === 'shop' ? '/shop' : '/')} />
      <AdminPanel />
    </>
  );
}

export function Router({ children }: { children: React.ReactNode }) {
  const pathname = useSyncExternalStore(
    (cb) => {
      window.addEventListener('popstate', cb);
      return () => window.removeEventListener('popstate', cb);
    },
    getPath,
  );

  if (pathname === '/register') {
    return <RegisterPage />;
  }

  if (pathname === '/admin') {
    return <AdminRoute />;
  }

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

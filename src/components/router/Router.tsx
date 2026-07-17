import { useSyncExternalStore } from 'react';
import { getPath, navigate } from '../../services/router';
import { Header } from '../layout/Header';
import { CheckoutPage } from '../checkout/CheckoutPage';
import { ProductDetailRoute } from './ProductDetailRoute';

export function Router({ children }: { children: React.ReactNode }) {
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

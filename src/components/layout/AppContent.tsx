import { Router } from '../router/Router';
import { ShopPage } from './ShopPage';

export function AppContent() {
  return (
    <Router>
      <ShopPage />
    </Router>
  );
}

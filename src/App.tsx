import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/ui/Toast';
import { AppContent } from './components/layout/AppContent';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

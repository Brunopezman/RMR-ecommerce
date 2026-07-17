import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { HeroSection } from '../home/HeroSection';
import { BannerServices } from '../home/BannerServices';
import { BrandSection } from '../home/BrandSection';
import { ProductsSection } from '../catalog/ProductsSection';
import { ShoppingConcierge } from '../chat/ShoppingConcierge';

export function ShopPage() {
  const [view, setView] = useState<'home' | 'shop'>(
    window.location.pathname === '/shop' ? 'shop' : 'home'
  );

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
        <ProductsSection />
      )}
      <Footer />
      <ShoppingConcierge />
    </div>
  );
}

export function HeroSection({ onShopClick }: { onShopClick: () => void }) {
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
        <button
          onClick={onShopClick}
          className="mt-6 inline-block bg-black hover:bg-coral text-white px-8 py-3 rounded font-medium transition-colors duration-300 uppercase tracking-wide font-bold text-sm border-0 cursor-pointer"
        >
          Compra Ahora
        </button>
      </div>
    </section>
  );
}

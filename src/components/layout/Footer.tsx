export function Footer() {
  return (
    <footer className="bg-[#d8d8d8] py-5 mt-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h5 className="font-bold text-lg mb-4">Rock Merch & Roll</h5>
            <p className="text-sm">
              Tu tienda de merchandising oficial de las mejores bandas de rock.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-lg mb-4">Productos</h5>
            <ul className="list-none p-0">
              <li className="mb-2">
                <a href="#" className="text-sm text-black no-underline transition-colors duration-300 hover:bg-coral hover:text-white block px-2 py-1 rounded">
                  Remeras
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-sm text-black no-underline transition-colors duration-300 hover:bg-coral hover:text-white block px-2 py-1 rounded">
                  Gorras
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-sm text-black no-underline transition-colors duration-300 hover:bg-coral hover:text-white block px-2 py-1 rounded">
                  Accesorios
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-lg mb-4">Ayuda</h5>
            <ul className="list-none p-0">
              <li className="mb-2">
                <a href="#" className="text-sm text-black no-underline transition-colors duration-300 hover:bg-coral hover:text-white block px-2 py-1 rounded">
                  Preguntas frecuentes
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-sm text-black no-underline transition-colors duration-300 hover:bg-coral hover:text-white block px-2 py-1 rounded">
                  Envíos
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-sm text-black no-underline transition-colors duration-300 hover:bg-coral hover:text-white block px-2 py-1 rounded">
                  Devoluciones
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-lg mb-4">Seguinos</h5>
            <div className="flex gap-2">
              <a href="#" className="w-[38px] h-[38px] bg-[#d8d8d8] rounded-full flex items-center justify-center text-center transition-colors duration-300 hover:bg-coral no-underline text-black" style={{ lineHeight: '38px' }}>
                <i className="bx bxl-facebook" />
              </a>
              <a href="#" className="w-[38px] h-[38px] bg-[#d8d8d8] rounded-full flex items-center justify-center text-center transition-colors duration-300 hover:bg-coral no-underline text-black" style={{ lineHeight: '38px' }}>
                <i className="bx bxl-instagram" />
              </a>
              <a href="#" className="w-[38px] h-[38px] bg-[#d8d8d8] rounded-full flex items-center justify-center text-center transition-colors duration-300 hover:bg-coral no-underline text-black" style={{ lineHeight: '38px' }}>
                <i className="bx bxl-twitter" />
              </a>
            </div>
          </div>
        </div>
        <hr className="my-4 border-gray-400 w-full" />
        <p className="text-center text-sm">
          Rock Merch & Roll &copy; 2022. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

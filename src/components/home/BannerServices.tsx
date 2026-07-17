export function BannerServices() {
  return (
    <section id="banner-services" className="bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap">
          <div className="service-item-container w-full md:w-1/3 p-0 px-0 md:px-3 py-5">
            <div className="service-item mx-4 md:mx-0">
              <div className="flex items-start mx-0">
                <div className="px-5 flex-shrink-0">
                  <i className="bx bxs-truck bx-md text-2xl" />
                </div>
                <div className="flex-1 p-0">
                  <h4 className="text-lg font-semibold">Envíos gratis</h4>
                  <p className="text-gray-600 text-sm">A partir de compras superiores a $100.000</p>
                </div>
              </div>
            </div>
          </div>

          <div className="service-item-container w-full md:w-1/3 p-0 px-0 md:px-3 py-5">
            <div className="service-item mx-4 md:mx-0">
              <div className="flex items-start mx-0">
                <div className="px-5 flex-shrink-0">
                  <i className="bx bxs-credit-card bx-md text-2xl" />
                </div>
                <div className="flex-1 p-0">
                  <h4 className="text-lg font-semibold">Financiación en cuotas</h4>
                  <p className="text-gray-600 text-sm">
                    <span className="inline-block bg-coral text-white px-2 py-0.5 rounded text-sm mr-1">
                      3 cuotas &bull; 10%
                    </span>
                    <span className="inline-block bg-black text-white px-2 py-0.5 rounded text-sm mr-1">
                      6 cuotas &bull; 15%
                    </span>
                    <br /><br />
                    Pagando con tarjetas de crédito bancarias.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="service-item-container w-full md:w-1/3 p-0 px-0 md:px-3 py-5">
            <div className="service-item mx-4 md:mx-0">
              <div className="flex items-start mx-0">
                <div className="px-5 flex-shrink-0">
                  <i className="bx bxs-user-check bx-md text-2xl" />
                </div>
                <div className="flex-1 p-0">
                  <h4 className="text-lg font-semibold">Compra de manera segura</h4>
                  <p className="text-gray-600 text-sm">Protegemos tus datos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useCart } from '../../hooks/useCart';
import {
  detectCardType,
  validarLuhn,
  formatearNumeroTarjeta,
  calcularTotalConInteres,
  calcularEnvio,
  calcularResumen,
  type CardBrand,
} from '../../services/checkoutService';

export function CheckoutPage() {
  const { items, summary, clearCart } = useCart();

  // Form state
  const [ccName, setCcName] = useState('');
  const [ccNumber, setCcNumber] = useState('');
  const [cuotas, setCuotas] = useState(1);
  const [shippingType, setShippingType] = useState('tienda');
  const [direccion, setDireccion] = useState('');
  const [cardBrand, setCardBrand] = useState<CardBrand>(null);
  const [tarjetaValida, setTarjetaValida] = useState(false);
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [submitting, setSubmitting] = useState(false);

  const { items: resumenItems, totalBase } = useMemo(
    () => calcularResumen(items),
    [items],
  );

  const totalConInteres = useMemo(
    () => calcularTotalConInteres(totalBase, cuotas),
    [totalBase, cuotas],
  );

  const { envioCost, totalFinal, valorCuota } = useMemo(
    () => calcularEnvio(totalConInteres, shippingType, cuotas),
    [totalConInteres, shippingType, cuotas],
  );

  // Card input handler
  const handleCardInput = useCallback(
    (value: string) => {
      const raw = value.replace(/\D/g, '');
      const marca = detectCardType(raw);

      if (!marca) {
        setCardBrand(null);
        setTarjetaValida(false);
        setCcNumber(raw);
        return;
      }

      const formatted = formatearNumeroTarjeta(raw, marca);
      setCardBrand(marca);
      setCcNumber(formatted);

      if (!validarLuhn(raw)) {
        setTarjetaValida(false);
        return;
      }

      setTarjetaValida(true);
    },
    [],
  );

  // Shipping change handler
  const handleShippingChange = useCallback(
    (value: string) => {
      setShippingType(value);
    },
    [],
  );

  // Form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!tarjetaValida) {
        return;
      }

      setSubmitting(true);

      // Simulate payment processing
      setTimeout(() => {
        setPagoExitoso(true);
        clearCart();
        localStorage.removeItem('carrito');
      }, 2000);
    },
    [tarjetaValida, clearCart],
  );

  // Countdown redirect
  useEffect(() => {
    if (!pagoExitoso) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pagoExitoso]);

  // PDF download handler
  const handleDownloadPdf = useCallback(() => {
    const { jsPDF } = window.jspdf;

    if (!jsPDF) return;

    const pdf = new jsPDF();
    const nroTarjeta = ccNumber.replace(/\D/g, '');
    const shippingLabel =
      shippingType === 'tienda'
        ? 'Retiro en tienda'
        : shippingType === 'estandar'
          ? 'Envío estándar'
          : 'Envío express';

    let y = 20;
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(11);

    pdf.text('COMPROBANTE DE PAGO - RMR', 20, y);
    y += 10;
    pdf.text(`Fecha: ${new Date().toLocaleString()}`, 20, y);
    y += 8;
    pdf.text(`Cliente: ${ccName}`, 20, y);
    y += 8;
    pdf.text(`Tarjeta: **** **** **** ${nroTarjeta.slice(-4)}`, 20, y);
    y += 8;
    pdf.text(`Dirección de entrega: ${shippingLabel}`, 20, y);
    y += 10;

    pdf.text('Detalle de productos:', 20, y);
    y += 8;

    resumenItems.forEach((item) => {
      const line = `- ${item.name} x${item.quantity} $${item.subtotal.toFixed(2)}`;
      pdf.text(line, 20, y);
      y += 7;

      if (y > 270) {
        pdf.addPage();
        y = 20;
      }
    });

    y += 5;
    pdf.text('------------------------------------', 20, y);
    y += 8;
    pdf.text(`Total Pagado: $${totalFinal.toFixed(2)}`, 20, y);
    y += 10;
    pdf.text('¡Gracias por su compra!', 20, y);

    pdf.save(`Comprobante_RMR_${Date.now()}.pdf`);
  }, [ccNumber, ccName, shippingType, resumenItems, totalFinal]);

  if (pagoExitoso) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-5 py-5 text-center">
        <i
          className="bx bx-check-circle text-green-500 my-5"
          style={{ fontSize: '5rem' }}
        />
        <h2 className="mt-3 font-display">¡Compra Realizada con Éxito!</h2>
        <p className="text-lg font-display">
          Hemos enviado el comprobante a tu correo electrónico.
        </p>
        <div className="mt-4">
          <button
            id="btn-descargar-pdf"
            className="bg-transparent border border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-4 py-2 rounded-lg mr-2 font-display uppercase text-sm font-bold transition-colors duration-300"
            onClick={handleDownloadPdf}
          >
            <i className="bx bx-download" /> Descargar Comprobante
          </button>
          <a
            href="/"
            className="bg-black hover:bg-coral-dark text-white px-4 py-2 rounded-lg no-underline font-display uppercase text-sm font-bold transition-colors duration-300 inline-block"
          >
            Volver a la Tienda
          </a>
        </div>
        <p className="text-gray-500 mt-5 font-display">
          Serás redireccionado automáticamente en{' '}
          <span id="timer">{countdown}</span> segundos...
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-5 py-5 text-center">
        <h2 className="font-display">Tu carrito está vacío</h2>
        <p className="text-gray-500 font-display">Agregá productos antes de finalizar la compra.</p>
        <a
          href="/"
className="bg-black hover:bg-coral-dark text-white px-4 py-2 rounded-lg no-underline font-display uppercase text-sm font-bold transition-colors duration-300 inline-block"
          >
            Volver a la Tienda
          </a>
        </div>
    );
  }

  return (
    <div id="seccion-pago" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-5 py-5">
      <h2 className="mb-4 font-display">Finalizar Compra</h2>
      <div className="grid grid-cols-12 gap-4">
        {/* Order Summary */}
        <div className="md:col-span-4 md:order-2 mb-4">
          <h4 className="flex justify-between items-center mb-3 font-display">
            <span className="text-gray-500">Tu Carrito</span>
          </h4>
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg mb-3" id="resumen-lista">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between leading-tight px-4 py-3"
              >
                <div>
                  <h6 className="my-0 font-display">{item.nombre}</h6>
                  <small className="text-gray-500">
                    Cantidad: {item.cantidad}
                  </small>
                </div>
                <span className="text-gray-500">
                  ${(item.precio * item.cantidad).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <li className="flex justify-between px-4 py-3 border border-gray-200 rounded-lg mt-2">
            <span className="font-display">Total final a pagar</span>
            <strong id="resumen-total">${totalFinal.toFixed(2)}</strong>
          </li>
        </div>

        {/* Payment Form */}
        <div className="md:col-span-8 md:order-1">
          <h4 className="mb-3 font-display">Método de Pago</h4>
          <form id="form-pago" onSubmit={handleSubmit}>
            <div className="grid grid-cols-12 gap-4">
              <div className="md:col-span-6 mb-3">
                <label htmlFor="cc-name" className="block text-sm font-medium text-gray-700 mb-1 font-display">Nombre en la tarjeta</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral"
                  id="cc-name"
                  required
                  placeholder="Juan Perez"
                  value={ccName}
                  onChange={(e) => setCcName(e.target.value)}
                />
              </div>
              <div className="md:col-span-6 mb-3">
                <label htmlFor="cc-number" className="block text-sm font-medium text-gray-700 mb-1 font-display">Número de tarjeta</label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-coral ${!tarjetaValida && ccNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  id="cc-number"
                  required
                  placeholder="XXXX XXXX XXXX XXXX"
                  value={ccNumber}
                  onChange={(e) => handleCardInput(e.target.value)}
                />
              </div>
              <div className="col-span-12">
                <div id="logos" className="flex justify-start items-center gap-2 mt-2">
                {(['VISA', 'MASTERCARD', 'AMERICAN EXPRESS'] as const).map(
                  (brand) => (
                    <img
                      key={brand}
                      src={`/img/${brand === 'AMERICAN EXPRESS' ? 'amex' : brand.toLowerCase()}.png`}
                      id={`logo-${brand === 'AMERICAN EXPRESS' ? 'amex' : brand.toLowerCase()}`}
                      className={`h-8 ${cardBrand === brand ? 'opacity-100 scale-105' : 'opacity-90'}`}
                      alt={brand}
                    />
                  ),
                )}
              </div>
              </div>
              <div className="mb-3 mt-2 col-span-12">
                <small className="text-gray-500">Tarjeta seleccionada:</small>
                <p id="tarjeta-resumen" className="font-bold mb-0 font-display">
                  {tarjetaValida && cardBrand
                    ? `${cardBrand} •••• ${ccNumber.replace(/\D/g, '').slice(-4)}`
                    : '—'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="md:col-span-6 mb-3">
                <label htmlFor="cuotas" className="block text-sm font-medium text-gray-700 mb-1 font-display">Cuotas</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral"
                  id="cuotas-select"
                  value={cuotas}
                  onChange={(e) => setCuotas(Number(e.target.value))}
                >
                  <option value={1}>1 cuota (Sin interés)</option>
                  <option value={3}>3 cuotas (10% interés)</option>
                  <option value={6}>6 cuotas (15% interés)</option>
                </select>
              </div>
              <div className="md:col-span-6 mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1 font-display">Valor de la cuota:</label>
                <p id="valor-cuota" className="font-bold mt-2 font-display">
                  ${valorCuota.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Shipping */}
            <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg mb-3">
              <li className="px-4 py-3">
                <label htmlFor="envio-select" className="block text-sm font-medium text-gray-700 mb-1 font-display">
                  Tipo de envío
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral"
                  id="envio-select"
                  value={shippingType}
                  onChange={(e) => handleShippingChange(e.target.value)}
                >
                  <option value="tienda">Retiro en tienda (Gratis)</option>
                  <option value="estandar">Envío estándar ($1.500)</option>
                  <option value="express">Envío express ($3.000)</option>
                </select>

                {shippingType !== 'tienda' && (
                  <div id="contenedor-direccion" className="mt-3">
                    <label htmlFor="direccion-envio" className="block text-sm font-medium text-gray-700 mb-1 font-display">
                      Dirección de entrega
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral"
                      id="direccion-envio"
                      placeholder="Calle, Número, Piso, Localidad"
                      required
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                    />
                    <small className="text-gray-500">
                      Los envíos se realizan de 9 a 18 hs.
                    </small>
                  </div>
                )}
              </li>

              <li className="flex justify-between my-3 py-3 px-4">
                <span className="font-display">Envío</span>
                <strong id="resumen-envio">${envioCost.toFixed(2)}</strong>
              </li>
            </ul>

            <div className="col-span-12 mt-3">
              <button
                type="submit"
                className="w-full bg-black text-white border-none py-3 px-4 font-display uppercase text-sm font-bold rounded-lg cursor-pointer transition-colors duration-300 hover:bg-coral-dark disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-coral focus-visible:outline-none"
                disabled={submitting}
              >
                {submitting ? 'Procesando pago...' : 'Pagar Ahora'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

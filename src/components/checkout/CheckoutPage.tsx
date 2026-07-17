import { useState, useCallback, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useToast } from '../ui/Toast';
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
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuth();

  // Form state
  const [ccName, setCcName] = useState(
    isAuthenticated && user ? `${user.name} ${user.apellido || ''}`.trim() : ''
  );
  const [ccNumber, setCcNumber] = useState('');
  const [cuotas, setCuotas] = useState(1);
  const [shippingType, setShippingType] = useState('tienda');
  const [direccion, setDireccion] = useState(
    isAuthenticated && user?.address ? user.address : ''
  );
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

  const { envioCost, totalFinal, valorCuota, freeShipping } = useMemo(
    () => calcularEnvio(totalConInteres, shippingType, cuotas, totalBase),
    [totalConInteres, shippingType, cuotas, totalBase],
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
        showToast('Revisá los datos de la tarjeta', 'error');
        return;
      }

      setSubmitting(true);

      // Simulate payment processing
      setTimeout(() => {
        setPagoExitoso(true);
        clearCart();
      }, 2000);
    },
    [tarjetaValida, clearCart, showToast],
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

  // PDF download handler — receipt with full user info
  const handleDownloadPdf = useCallback(() => {
    const pdf = new jsPDF();
    const nroTarjeta = ccNumber.replace(/\D/g, '');
    const nroRecibo = `RMR-${Date.now().toString(36).toUpperCase()}`;
    const fecha = new Date().toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const shippingLabel =
      shippingType === 'tienda'
        ? 'Retiro en tienda'
        : shippingType === 'estandar'
          ? 'Envío estándar'
          : 'Envío express';

    const shippingAddressStr =
      shippingType === 'tienda'
        ? 'Av. Corrientes 1234, CABA'
        : direccion || (user?.address ?? '—');

    const rightMargin = 190;
    let y = 20;

    // ── Header ────────────────────────────────────
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(16);
    pdf.text('ROCK MERCH & ROLL', 105, y, { align: 'center' });
    y += 7;
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(8);
    pdf.text('Tu tienda de merchandising rock', 105, y, { align: 'center' });
    y += 10;

    // Separator line
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.5);
    pdf.line(14, y, rightMargin, y);
    y += 8;

    // Receipt header
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(11);
    pdf.text('COMPROBANTE DE PAGO', 105, y, { align: 'center' });
    y += 8;

    pdf.setFont('courier', 'normal');
    pdf.setFontSize(9);
    pdf.text(`Nro. Recibo: ${nroRecibo}`, 20, y);
    pdf.text(`Fecha: ${fecha}`, rightMargin, y, { align: 'right' });
    y += 10;

    // ── Customer info ─────────────────────────────
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(9);
    pdf.text('DATOS DEL CLIENTE', 20, y);
    y += 6;
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(8.5);
    pdf.text(`Nombre: ${user?.name || ccName} ${user?.apellido || ''}`.trim(), 20, y);
    y += 5;
    pdf.text(`Email: ${user?.email || '—'}`, 20, y);
    y += 5;
    pdf.text(
      `Dirección: ${shippingType === 'tienda' ? shippingAddressStr : `${shippingAddressStr} (${shippingLabel})`}`,
      20, y,
    );
    y += 8;

    // ── Payment info ──────────────────────────────
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(9);
    pdf.text('DATOS DEL PAGO', 20, y);
    y += 6;

    pdf.setFont('courier', 'normal');
    pdf.setFontSize(8.5);
    pdf.text(`Tarjeta: **** **** **** ${nroTarjeta.slice(-4)}`, 20, y);
    pdf.text(`Titular: ${ccName}`, 75, y);
    y += 5;
    pdf.text(`Cuotas: ${cuotas} ${cuotas === 1 ? '(Sin interés)' : `(${(cuotas - 1) * 5}% interés)`}`, 20, y);
    pdf.text(`Valor cuota: $${valorCuota.toFixed(2)}`, 75, y);
    y += 10;

    // ── Products table ────────────────────────────
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.3);
    pdf.line(14, y, rightMargin, y);
    y += 5;

    // Table header
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(8.5);
    pdf.text('Producto', 20, y);
    pdf.text('Cant.', 120, y);
    pdf.text('P. Unit.', 145, y);
    pdf.text('Subtotal', rightMargin, y, { align: 'right' });
    y += 4;
    pdf.setDrawColor(180);
    pdf.line(14, y, rightMargin, y);
    y += 4;

    // Table rows
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(8);

    resumenItems.forEach((item) => {
      if (y > 265) {
        pdf.addPage();
        y = 20;
      }

      const name =
        item.name.length > 28 ? item.name.slice(0, 26) + '..' : item.name;
      pdf.text(name, 20, y);
      pdf.text(String(item.quantity), 120, y);
      pdf.text(`$${(item.total / item.quantity).toFixed(0)}`, 145, y);
      pdf.text(`$${item.subtotal.toFixed(2)}`, rightMargin, y, { align: 'right' });
      y += 5;
    });

    // ── Summary ───────────────────────────────────
    y += 3;
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.3);
    pdf.line(14, y, rightMargin, y);
    y += 6;

    pdf.setFont('courier', 'normal');
    pdf.setFontSize(8.5);
    pdf.text('Subtotal', 20, y);
    pdf.text(`$${totalBase.toFixed(2)}`, rightMargin, y, { align: 'right' });
    y += 5;

    if (cuotas > 1) {
      const interesPorcentaje = (cuotas - 1) * 5;
      pdf.text(`Interés (${interesPorcentaje}% / ${cuotas} cuotas)`, 20, y);
      pdf.text(
        `+ $${(totalConInteres - totalBase).toFixed(2)}`,
        rightMargin, y, { align: 'right' },
      );
      y += 5;
    }

    pdf.text('Envío', 20, y);
    pdf.text(
      freeShipping ? '¡Gratis!' : `$${envioCost.toFixed(2)}`,
      rightMargin, y, { align: 'right' },
    );
    y += 6;

    // Total row (bold)
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.5);
    pdf.line(14, y, rightMargin, y);
    y += 6;
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(11);
    pdf.text('TOTAL', 20, y);
    pdf.text(`$${totalFinal.toFixed(2)}`, rightMargin, y, { align: 'right' });
    y += 4;
    pdf.setLineWidth(0.5);
    pdf.line(14, y, rightMargin, y);
    y += 10;

    // ── Footer ────────────────────────────────────
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(8);
    pdf.text('¡Gracias por tu compra!', 105, y, { align: 'center' });
    y += 5;
    pdf.setFontSize(7);
    pdf.text('Ante cualquier consulta, respondé este comprobante.', 105, y, { align: 'center' });

    pdf.save(`Comprobante_RMR_${nroRecibo}.pdf`);
  }, [
    ccNumber, ccName, shippingType, direccion, resumenItems,
    totalFinal, totalBase, totalConInteres, envioCost, cuotas,
    valorCuota, freeShipping, user,
  ]);

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
          Ir a la tienda
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
                  <option value="estandar">Envío estándar ($10.000)</option>
                  <option value="express">Envío express ($18.000)</option>
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
                <strong id="resumen-envio">
                  {freeShipping ? (
                    <span className="text-green-500">¡Envío gratis!</span>
                  ) : (
                    `$${envioCost.toFixed(2)}`
                  )}
                </strong>
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

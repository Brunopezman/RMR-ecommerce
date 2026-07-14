# Reporte de deuda técnica – Rock Merch & Roll

**Fecha:** 13 de julio de 2026
**Autor:** @auditor
**Versión del código analizado:** v1.0.0 (pre-migración, vanilla JS)

---

## Resumen ejecutivo

El proyecto es funcional pero tiene deuda técnica significativa para encarar la migración a React. Los 5 riesgos principales están en: acoplamiento DOM/lógica, funciones inaccesibles para tests, dependencias CDN sin integrity, ausencia total de tests, y seguridad frágil en el manejo de tarjetas.

---

## Hallazgos

| # | Hallazgo | Archivo(s) | Severidad | Impacto |
|---|---|---|---|---|
| 1 | **Funciones de checkout.js atrapadas en closure de DOMContentLoaded** | `src/components/checkout.js` | 🔴 Alta | `detectarTarjeta`, `validarLuhn` y otras 5 funciones no son accesibles desde tests ni desde otros módulos. No hay `window.*` exportado. Obliga a testear indirectamente vía DOM o a refactorizar. |
| 2 | **Lógica de negocio y DOM mezclados en cart.js** | `src/components/cart.js` | 🔴 Alta | `pintarTotalCarrito`, `actualizarCarrito`, `pintarProductoCarrito` usan `document.getElementById` + `Toastify` directo. No se puede testear la lógica del carrito sin mockear el DOM completo. |
| 3 | **Código duplicado en renderizado del carrito** | `src/components/cart.js:31-66` | 🟡 Media | `pintarProductoCarrito` (línea 31) y `actualizarCarrito` (línea 48) tienen HTML templates casi idénticos. Cambiar el markup requiere actualizar ambos. |
| 4 | **Login mock con token hardcodeado** | `src/components/auth.js:59` | 🟡 Media | `localStorage.setItem('authToken', 'demo-token')` — token fijo, sin expiración,任何 usuario loguea. Aceptable para demo, pero riesgoso si alguien asume que es seguro. |
| 5 | **Validación de tarjetas en cliente (Luhn)** | `src/components/checkout.js:105-110, 229-246` | 🟡 Media | El número de tarjeta se valida en el navegador con Luhn, pero viaja en texto plano por el formulario. No hay backend que registre el pago realmente. |
| 6 | **Dependencias CDN sin integridad (SRI)** | `index.html`, `pages/shop.html`, `pages/checkout.html` | 🟡 Media | Bootstrap 5.2.2, Toastify, BoxIcons, Google Fonts, jsPDF — todas cargadas desde CDN. Solo Bootstrap CSS/JS tienen `integrity`. Un ataque al CDN podría inyectar código. |
| 7 | **Orden de carga de scripts frágil** | `index.html:253-261`, `shop.html:202-209` | 🟡 Media | Si un script se mueve de orden, las dependencias de `window.*` se rompen en silencio. No hay herramienta que lo valide. |
| 8 | **checkout.js no usa IIFE ni encapsulamiento** | `src/components/checkout.js` | 🟢 Baja | Es el único módulo que no usa patrón IIFE. No tiene impacto funcional pero es inconsistente con el resto del código. |
| 9 | **Cobertura de tests: 0% (pre-Fase 1)** | Todo el proyecto | 🔴 Alta | Antes de esta fase no existía ni configuración de tests ni un solo test. Cualquier cambio manual implica alto riesgo de regresión. |
| 10 | **Sin tipado ni validación de esquemas** | `data/stock.json`, `src/components/` | 🟡 Media | Los productos en JSON no tienen schema ni validación. Un campo faltante (ej. `precio`) se arrastra silenciosamente hasta el render. |

---

## Recomendaciones ordenadas por prioridad

1. **Extraer funciones de checkout.js** a `src/services/validators.js` (o equivalente post-migración): `detectarTarjeta` y `validarLuhn` son funciones puras que deberían ser exportables y testeadas sin DOM.
2. **Separar lógica de presentación en cart.js**: mover manipulación del array del carrito a un servicio/hook; dejar solo render en los componentes.
3. **Configurar SRI (Subresource Integrity)** en todas las etiquetas `<script>` y `<link>` de CDN.
4. **Reemplazar autenticación mock por flujo real** o al menos documentar explícitamente que no hay validación.
5. **Agregar validación de schema para `data/stock.json`** (ej. Zod en Fase 2, o un simple assert en Fase 1).
- **Visible en `npm test`**: las funciones bloqueadas en checkout.js obligan a tests indirectos vía DOM, lo que es frágil. Refactorizar esto debería ser lo primero en Fase 2.

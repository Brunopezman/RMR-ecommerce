# Mapa de dependencias – Rock Merch & Roll

**Fecha:** 13 de julio de 2026
**Autor:** @auditor
**Versión del código analizado:** v1.0.0 (pre-migración, vanilla JS)

---

## Módulos / archivos

| Archivo | Exporta / expone en `window.*` | Importa / depende de (funciones globales esperadas) | Dependencias externas | Notas |
|---|---|---|---|---|
| `src/config/env.js` | `window.Config` (objeto con `API_URL`, `APP_NAME`, `ITEMS_PER_PAGE`, `DATA_URL`, `USE_MOCK_AUTH`, `MOCK_AUTH_URL`) | Ninguna del proyecto | Ninguna | Se carga 3º en index.html y shop.html. 1º en checkout.html |
| `src/components/modal.js` | Nada | `window.eliminarProductoCarrito` (desde cart.js) | Bootstrap JS (eventos), DOM: `#tienda`, `#btn-cerrar-carrito`, `.modal-contenedor`, `.modal-carrito` | No es IIFE. No expone nada. Delegación de eventos en `.modal-carrito` |
| `src/components/navbar.js` | Nada | Ninguna del proyecto | Bootstrap JS, DOM: `#bar`, `.navbar-toggler`, `.nav-link` | Manipulación de navbar toggle + active class |
| `src/components/cart.js` | `window.carrito` (array), `window.guardarCarritoStorage`, `window.obtenerCarritoStorage`, `window.pintarTotalCarrito`, `window.actualizarTotalCarrito`, `window.pintarProductoCarrito`, `window.actualizarCarrito`, `window.alertaCarritoVacio`, `window.eliminarProductoCarrito`, `window.vaciarCarrito`, `window.validarProductoRepetido` | `Toastify` (CDN global), DOM: `#contador-carrito`, `#precioTotal`, `#carrito-contenedor`, `#vaciarCarrito`, `.boton-eliminar`, `.productoEnCarrito` | Toastify CDN, Bootstrap | Contiene la lógica principal de la gestión del carrito de compras y almacenamiento local. |
| `src/components/checkout.js` | Nada | `window.Config`, `window.carrito`, `window.obtenerCarritoStorage` | DOM: `.tarjeta-logo`, `.tarjeta-logo.activa` | Gestiona el proceso de pago y validación de formularios en la página de checkout. |
| `src/components/auth.js` | Nada | `window.Config` | DOM: `.user-name-text-sibling`, `.logout-trigger` (creados dinámicamente) | Controla el estado de sesión del usuario, login, logout y renderizado dinámico de la interfaz de autenticación. |
| `src/components/products.service.js` | `window.ProductsService` (objeto con `fetchProducts`, `filterByCategory`, `searchByName`) | `fetch` (API nativa) | Ninguna | Se carga 5º. IIFE. Sin dependencias del proyecto. |
| `src/components/products.view.js` | `window.pintarProductos` (función) | `window.validarProductoRepetido` (desde cart.js), DOM: `#productosDestacados`, `.buy-btn` | Ninguna | Se carga 6º. IIFE. Renderiza productos en el DOM y asigna click handlers. |
| `src/index.js` | Nada | `window.Config`, `window.ProductsService.fetchProducts`, `window.pintarProductos`, `window.carrito`, `window.obtenerCarritoStorage`, `window.actualizarCarrito`, `window.actualizarTotalCarrito` | `fetch` (API nativa), `localStorage` | Entry point principal. No es IIFE. Carga productos desde DATA_URL y restaura carrito desde localStorage. |

## Archivos CSS cuyas clases/IDs son referenciados desde JS

| Selector CSS | Archivo(s) JS que lo usan |
|---|---|
| `.modal-contenedor` | modal.js |
| `.modal-carrito` | modal.js |
| `.boton-eliminar` | modal.js, cart.js |
| `.productoEnCarrito` | cart.js |
| `.tarjeta-logo` | checkout.js |
| `.tarjeta-logo.activa` | checkout.js |
| `#contador-carrito` | cart.js |
| `#precioTotal` | cart.js |
| `#carrito-contenedor` | cart.js |
| `.user-name-text-sibling` | auth.js (creado dinámicamente) |
| `.logout-trigger` | auth.js (creado dinámicamente) |
| `#productosDestacados` | products.view.js |
| `.buy-btn` | products.view.js |

## Estado global detectado

| Variable / key | Dónde vive | Quién lo escribe | Quién lo lee |
|---|---|---|---|
| `window.carrito` (array) | Memoria (window) | cart.js (validarProductoRepetido, eliminarProductoCarrito, vaciarCarrito) | cart.js, index.js, checkout.js |
| `localStorage.carrito` (JSON string) | localStorage | cart.js (guardarCarritoStorage), checkout.js (removeItem al pagar) | cart.js (obtenerCarritoStorage), index.js, checkout.js |
| `localStorage.authToken` | localStorage | auth.js (manejarLogin) | auth.js (actualizarInterfazUsuario, manejarLogout) |
| `localStorage.userEmail` | localStorage | auth.js (manejarLogin) | auth.js (actualizarInterfazUsuario) |
| `window.Config` (objeto) | Memoria (window) | env.js | index.js, auth.js, checkout.js |

## Flujo: "agregar al carrito"

1. Usuario hace clic en `.buy-btn` en `products.view.js`.
2. `pintarProductos` asignó un event listener que llama a `window.validarProductoRepetido(e, data)`.
3. `validarProductoRepetido` (en cart.js) busca el `e.target.id` en `window.carrito`:
   - **Si no existe**: agrega el producto con `cantidad: 1` al array, llama a `window.pintarProductoCarrito`, `window.guardarCarritoStorage`, `window.actualizarTotalCarrito`.
   - **Si ya existe**: incrementa `cantidad`, actualiza el texto en el DOM (`cantidad{id}`), llama a `window.actualizarTotalCarrito`.
4. `actualizarTotalCarrito` recalcula totalCantidad + totalCompra, llama a `pintarTotalCarrito` (actualiza `#contador-carrito` y `#precioTotal`), y persiste a localStorage.
5. El modal del carrito se actualiza en vivo (si está abierto).

## Flujo: "checkout"

1. Usuario hace clic en `#btn-checkout` (en modal.js o cart.js).
2. cart.js verifica `window.obtenerCarritoStorage()` — si vacío, muestra Toastify de error.
3. Si hay productos, redirige a `pages/checkout.html`.
4. checkout.js lee `localStorage.carrito`, renderiza el resumen en `#resumen-lista`, calcula total.
5. Usuario completa formulario (tarjeta, cuotas, envío). La UI muestra logos de tarjeta y calcula cuotas + interés.
6. Al submit: si tarjeta válida, muestra Toastify "Procesando pago...", tras 2s oculta formulario, muestra `#seccion-exito`, elimina `localStorage.carrito`.
7. Tras 15s de cuenta regresiva, redirige a `index.html`.

## Flujo: "login"

1. Usuario abre modal (`#userModal`) desde navbar, completa email + password, hace submit.
2. auth.js (`manejarLogin`):
   - Si `Config.USE_MOCK_AUTH === true` o no hay `API_LOGIN_ENDPOINT`: guarda `authToken = 'demo-token'` + `userEmail` en localStorage, muestra bienvenida, cierra modal, llama a `actualizarInterfazUsuario`.
   - Si hay endpoint real: hace POST a `${API_URL}/api/auth/login`, guarda token si response.ok.
3. `actualizarInterfazUsuario` oculta `#login-nav-item`, muestra `#logout-nav-item` con nombre de usuario.
4. Logout: clic en icono de logout → modal de confirmación → `manejarLogout` → limpia localStorage, actualiza UI.

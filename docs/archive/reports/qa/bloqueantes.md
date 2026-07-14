# Bloqueantes de testing (Fase 1)

Este archivo documenta las dificultades encontradas al escribir tests de
caracterización sobre el código actual, sin modificar el código fuente.

---

## 1. Funciones de checkout.js atrapadas en closure de DOMContentLoaded

**Archivo:** `src/components/checkout.js`

**Problema:**
Las funciones `detectarTarjeta`, `validarLuhn`, `mostrarErrorTarjeta`,
`marcarTarjetaInvalida`, `marcarTarjetaValida`, `mostrarLogo`, `ocultarLogos`,
y `formatearNumeroTarjeta` están definidas como `const` o declaraciones
`function` dentro del callback de `document.addEventListener('DOMContentLoaded', ...)`.

Ninguna de estas funciones se exporta a `window`, por lo que no es posible
invocarlas directamente desde un test unitario sin modificar el código fuente.

**Tests aplicables (workaround):**
Se pueden testear indirectamente disparando eventos del DOM (ej: `input` en
`#cc-number`) y verificando los cambios en el DOM (clases CSS, textos, logos).
Esto es frágil porque depende del markup HTML.

**Recomendación para Fase 2 (refactor):**
Extraer `detectarTarjeta` y `validarLuhn` a un módulo independiente
(por ej. `src/services/validators.js`) y exportarlas como funciones puras.
El resto de funciones de UI pueden ir a un hook o componente React.

---

## 2. Funciones de cart.js acopladas al DOM

**Archivo:** `src/components/cart.js`

**Problema:**
Funciones como `pintarTotalCarrito`, `pintarProductoCarrito`,
`actualizarCarrito`, `alertaCarritoVacio` usan `document.getElementById()`
y `Toastify()` directamente. No se pueden testear sin mockear el DOM.

**Tests aplicables:**
Las funciones de lógica pura (`validarProductoRepetido`,
`eliminarProductoCarrito`, `vaciarCarrito`) son testeadas mockeando
`document.getElementById`, `localStorage` y `Toastify`.

**Recomendación para Fase 2:**
Separar la lógica de negocio (manejo del array del carrito) de la
presentación (manejo del DOM). La lógica debería vivir en un hook
o servicio que no dependa de `document`.

---

## 3. Auth.js depende de estructura DOM exacta y bootstrap modal

**Archivo:** `src/components/auth.js`

**Problema:**
`manejarLogin` espera que existan `#inputEmail`, `#inputPassword`,
`#loginForm`, `#userModal`, etc. También depende de `bootstrap.Modal`
para cerrar el modal. La prueba requiere setup completo del DOM.

**Tests aplicables:**
Se puede testear disparando eventos `submit` y verificando `localStorage`
y `Toastify`. Ver `src/__tests__/auth.test.js`.

---

## 4. JS vanilla sin ES modules (IIFE + window.*)

**Todos los archivos en `src/components/`**

**Problema:**
El código usa patrón IIFE y expone todo en `window.*`. Esto requiere que
los tests importen los scripts directamente, lo que ejecuta los IIFEs
y registra event listeners en el documento global de jsdom.

**Consecuencia:**
Los efectos secundarios de importar un script (registro de
event listeners, manipulación de DOM si existe) pueden interferir
entre tests. Se requiere aislamiento con `vi.stubGlobal` y reseteo
de mocks entre tests.

**Recomendación para Fase 2:**
Migrar a ES modules con import/export explícitos. Cada módulo solo
exporta lo necesario sin efectos secundarios al importarse.

---

## 5. Tests e2e: jsPDF no disponible offline

**Archivo:** `pages/checkout.html`

**Problema:**
El botón "Descargar Comprobante" en checkout.html depende de
`jspdf.umd.min.js` cargado desde CDN. En modo offline o en CI
sin acceso a CDN, el test e2e de checkout podría fallar.

---

## Resumen de cobertura

| Flujo crítico | Tests unitarios | Tests e2e | Bloqueante |
|---|---|---|---|
| Catálogo (ProductsService) | ✅ 12 tests | ✅ 3 tests | No |
| Carrito (lógica) | ✅ 10 tests | ✅ 3 tests | Parcial (DOM acoplado) |
| Checkout (validación tarjeta) | ⚠️ Indirecto vía DOM | ❌ No implementado | Sí (funciones no exportadas) |
| Auth (login mock) | ✅ 3 tests | ❌ No implementado | Parcial (DOM acoplado) |
| Navegación | — | ✅ 3 tests | No |

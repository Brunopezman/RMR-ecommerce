# Mapa de dependencias – Rock Merch & Roll

**Fecha:** 14 de julio de 2026
**Autor:** @refactor-architect
**Versión del código analizado:** v1.1.0 (React + TypeScript + Vite + Tailwind)

---

## Árbol de componentes (React)

```
App
└── AuthProvider (context/AuthContext.tsx)
    └── CartProvider (context/CartProvider.tsx)
        └── AppContent
            └── Router (SPA casero via useSyncExternalStore)
                ├── [pathname = "/register"]
                │   └── RegisterPage (components/auth/RegisterPage.tsx)
                │
                ├── [pathname = "/admin"]
                │   └── AdminRoute (inline en Router.tsx)
                │       ├── verifica isAuthenticated + role === 'admin'
                │       ├── [ok] → Header + AdminPanel
                │       └── [denied] → "Acceso denegado"
                │           └── AdminPanel (components/admin/AdminPanel.tsx)
                │               └── importa: userService.fetchAllUsers
                │
                ├── [pathname incluye "/checkout"]
                │   └── CheckoutPage (components/checkout/CheckoutPage.tsx)
                │       ├── importa: checkoutService
                │       └── usa: jsPDF (CDN global)
                │
                ├── [pathname = "/product/:id"]
                │   └── ProductDetailRoute (components/router/ProductDetailRoute.tsx)
                │
                └── [caso contrario]
                    └── ShopPage (state: view = 'home' | 'shop')
                        ├── Header (props: onNavigate)
                        │   ├── [admin] link "Admin" condicional
                        │   ├── CartModal (components/cart/CartModal.tsx)
                        │   │   └── CartItemRow[] (components/cart/CartItemRow.tsx)
                        │   │       └── importa: cartService
                        │   └── LoginModal (components/auth/LoginModal.tsx)
                        │       └── importa: authService
                        │
                        ├── [view=home] HeroSection (props: onShopClick)
                        ├── [view=home] BannerServices
                        ├── [view=home] BrandSection
                        │
                        ├── [view=shop] ProductsSection
                        │   └── ProductGrid (components/catalog/ProductGrid.tsx)
                        │       └── ProductCard[] (components/ui/ProductCard.tsx)
                        │           └── importa: types/product
                        │
                        └── Footer
```

## Servicios (lógica pura, sin dependencias del DOM)

| Archivo | Exporta | Dependencias |
|---|---|---|
| `src/services/productService.ts` | `fetchProducts()`, `filterByCategory()`, `searchByName()` | `api.ts` (BASE_URL), `fetch` |
| `src/services/cartService.ts` | `validarProductoRepetido()`, `eliminarProductoCarrito()`, `vaciarCarrito()`, `actualizarTotal()`, `guardarCarritoStorage()`, `obtenerCarritoStorage()` | `localStorage`, tipos `CartItem` |
| `src/services/checkoutService.ts` | `detectCardType()`, `validarLuhn()`, `formatearNumeroTarjeta()`, `calcularTotalConInteres()`, `calcularEnvio()`, `calcularResumen()` | Ninguna (funciones puras) |
| `src/services/authService.ts` | `login()`, `loadAuthState()`, `saveAuthState()`, `clearAuthState()` | `localStorage`, `api.ts` |
| `src/services/userService.ts` | `fetchAllUsers(token)` | `api.ts` (BASE_URL), `fetch` |
| `src/services/api.ts` | `BASE_URL`, `PRODUCTS_API_URL` | Ninguna (constantes) |

## Hooks

| Archivo | Exporta | Usa |
|---|---|---|
| `src/hooks/useCatalog.ts` | `{ products, loading, error }` | `productService.fetchProducts` |
| `src/hooks/useCart.ts` | lógica de carrito (add, remove, clear, count) | `cartService`, `CartContext` |
| `src/hooks/useAuth.ts` | `{ isAuthenticated, user, login, logout }` | `authService`, `AuthContext` |

## Contextos

| Archivo | Estado | Persistencia |
|---|---|---|
| `src/context/CartContext.tsx` | `items: CartItem[]`, `addToCart()`, `removeFromCart()`, `clearCart()`, `itemCount` | `localStorage` (`carrito`) |
| `src/context/AuthContext.tsx` | `user: User \| null`, `isAuthenticated`, `login()`, `logout()` | `localStorage` (`authToken`, `userEmail`) |

## Estado global

| Variable / key | Dónde vive | Quién lo escribe | Quién lo lee |
|---|---|---|---|
| `localStorage.carrito` (JSON) | localStorage | `CartContext` (via `cartService.guardarCarritoStorage`) | `CartContext` init, `checkoutService` |
| `localStorage.authToken` | localStorage | `AuthContext` (via `authService`) | `AuthContext` init |
| `localStorage.userEmail` | localStorage | `AuthContext` (via `authService`) | `AuthContext` init |

## Flujo: "agregar al carrito"

1. Usuario hace clic en `.buy-btn` en `ProductCard`.
2. `ProductCard.onClick` llama a `addToCart(product)` provisto por `CartContext`.
3. `CartContext.addToCart`:
   - Busca el producto en `items` por `id`.
   - **Si no existe**: agrega `{ ...product, cantidad: 1 }`.
   - **Si existe**: incrementa `cantidad`.
   - Actualiza estado React + persiste a `localStorage`.
4. `CartContext.itemCount` se recalcula automáticamente.
5. El contador en `Header` (`#contador-carrito`) se actualiza por contexto.
6. Si `CartModal` está abierto, se actualiza en vivo.

## Flujo: "checkout"

1. Usuario hace clic en `Finalizar Compra` dentro de `CartModal`.
2. `CartContext` verifica si hay items — si vacío, muestra error.
3. Si hay productos, navega a `/checkout` via `window.location.pathname`.
4. `Router` detecta `/checkout` y renderiza `CheckoutPage`.
5. `CheckoutPage` lee items del `CartContext` y renderiza resumen + formulario.
6. Usuario completa formulario (tarjeta, cuotas, envío). Se ejecuta `detectCardType`, `validarLuhn`, `calcularEnvio`.
7. Al submit exitoso: limpia carrito del contexto + localStorage, muestra confirmación con cuenta regresiva.
8. Tras 15s redirige a `/`.

## Flujo: "login"

1. Usuario hace clic en icono de usuario en `Header` → abre `LoginModal`.
2. Completa email + password, hace submit.
3. `LoginModal` llama a `AuthContext.login(email, password)`.
4. `login()` (en `authService`):
   - Si `USE_MOCK_AUTH`: guarda `authToken = 'demo-token'` + `userEmail` en localStorage.
   - Si hay endpoint real: POST a `${API_URL}/api/auth/login`.
5. `AuthContext` actualiza estado → UI muestra nombre de usuario + botón logout.
6. Logout: clic en icono de logout → modal de confirmación → `AuthContext.logout()` → limpia localStorage + actualiza UI.

---

## Flujo: "admin — listar usuarios"

1. Usuario admin navega a `/admin` (o clic en link "Admin" en Header).
2. `Router` detecta `/admin` y renderiza `AdminRoute`.
3. `AdminRoute` verifica `isAuthenticated` + `user.role === 'admin'` — si no, muestra "Acceso denegado".
4. Si es admin, renderiza `Header` + `AdminPanel`.
5. `AdminPanel` llama a `userService.fetchAllUsers(token)`.
6. `fetchAllUsers` hace `GET /users` con `Authorization: Bearer <token>`.
7. Backend: `authenticateToken` verifica JWT → `requireAdmin` verifica role → `queryAll('SELECT * FROM users ORDER BY created_at DESC')` → devuelve array.
8. `AdminPanel` renderiza tabla con todos los usuarios.

## ⚠️ Problemas de arquitectura detectados (Auditoría Fase 1 — 2026-07-16)

1. **CheckoutPage** hace bypass directo a localStorage (línea 91): `localStorage.removeItem('carrito')` en vez de usar `clearCart()` del contexto.
2. **ToastContext** creado en `src/components/ui/Toast.tsx` pero nunca integrado en el árbol de componentes (`App.tsx`).
3. **Header** y otros 5 componentes (HeroSection, BannerServices, BrandSection, ProductsSection, Footer) definidos inline en `App.tsx` (~450 líneas totales).
4. **jsPDF** cargado desde CDN global (`index.html`) en vez de `npm install`, sin manejo de error si el CDN falla.
5. **`(window as any).bootstrap.Modal`** — manipulación DOM imperativa dentro de React, viola TypeScript `strict: true`.

> 📄 Ver reporte completo en `docs/reports/auditor/auditoria-fase1-2026-07-16.md`

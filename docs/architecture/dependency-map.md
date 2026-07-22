# Mapa de dependencias – Rock Merch & Roll

**Fecha:** 22 de julio de 2026
**Autor:** @refactor-architect
**Versión del código analizado:** v1.2.0 (React + TypeScript + Vite + Tailwind + PostgreSQL)

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

## Módulos del backend (nuevos en v1.2.0)

| Archivo | Exporta | Dependencias | Descripción |
|---|---|---|---|
| `server/src/config/database.ts` | `getDbConfig()`, `isPostgresConfigured()`, `parseConnectionString()` | `process.env` | Configuración de conexión PostgreSQL desde `DATABASE_URL` o variables individuales |
| `server/src/db/pool.ts` | `getPool()`, `query()`, `getClient()`, `closePool()` | `pg` (Pool), `database.ts` | Singleton pool de PostgreSQL con helpers query/getClient |
| `server/src/db/compat.ts` | `isPostgres()`, `convertPlaceholders()`, `getLastInsertId()`, `nowExpression()` | `database.ts` | Capa de compatibilidad: abstrae diferencias SQL `?` vs `$N`, timestamps, last insert ID |
| `server/src/db/seed.ts` | `seedProducts()`, `seedAdminUser()` | `fs`, `bcryptjs`, `../db.js` | Seeding dual-mode desde `data/db.json` (idempotente) |
| `server/src/db/migrate.ts` | `runMigrations()` | `migrations-runner`, migrations `001`, `002` | Entry point de migraciones PostgreSQL (lazy import, solo en modo PG) |
| `server/src/db/migrations-runner.ts` | `runMigrations(migrations)` | `pool.ts`, `_migrations` table | Runner genérico: ejecuta pendientes, registra en `_migrations` |
| `server/src/db/migrations/001-initial-schema.ts` | `name`, `up()` | — | Crea tablas: products, users, orders, order_items, contact_messages |
| `server/src/db/migrations/002-add-user-fields.ts` | `name`, `up()` | — | Agrega columnas: apellido, codigo_postal, sexo, telefono, password_hash, role |

## Servicios del backend (Express)

| Archivo | Exporta | Dependencias |
|---|---|---|
| `server/src/routes/products.ts` | `GET /products`, `GET /products/:id` | `../db.js` (queryAll, queryOne) |
| `server/src/routes/users.ts` | `POST /users`, `GET /users`, `GET /users/:id`, `PATCH /users/:id` | `../db.js`, middleware auth |
| `server/src/routes/orders.ts` | `GET /orders?userId=`, `POST /orders` | `../db.js`, middleware auth |
| `server/src/routes/contact.ts` | `POST /api/contact` | `../db.js`, email service |
| `server/src/routes/auth.ts` | `POST /api/auth/login` | `../db.js`, `bcryptjs`, `jsonwebtoken` |
| `server/src/middleware/auth.ts` | `authenticateToken`, `requireAdmin` | `jsonwebtoken` |
| `server/src/services/emailService.ts` | `sendContactConfirmation()`, `sendOrderConfirmation()` | `nodemailer`, `jsPDF` |

## Base de datos — dual-mode

| Modo | Driver | Activación | Archivo de entrada |
|---|---|---|---|
| SQLite (dev) | sql.js | Por defecto (`DATABASE_URL` no seteada) | `server/src/db.ts` |
| PostgreSQL (prod) | pg (node-postgres) | `DATABASE_URL` presente en env | `server/src/db.ts` → `pool.ts` |

**Flujo de inicialización:**
1. `db.ts` evalúa `isPostgresConfigured()` desde `database.ts`
2. En modo PG: importa dinámicamente `pool.ts` + `migrate.ts` → corre migraciones → seeding
3. En modo SQLite: inicializa sql.js desde archivo local → corre schema DDL → seeding

## Estado de arquitectura (post-migración PostgreSQL)

Todos los issues de la Auditoría Fase 1 (2026-07-16) han sido corregidos. Ver `docs/reports/auditor/auditoria-fase2-2026-07-22.md` para detalle.

Resumen de mejoras arquitectónicas en v1.2.0:
- **Dual-mode DB**: SQLite en dev, PostgreSQL en prod, detección automática por `DATABASE_URL`
- **Migraciones versionadas**: esquemas trackeados en tabla `_migrations`
- **Capa de compatibilidad**: abstracción sobre placeholders, timestamps, last insert ID
- **Seeding idempotente**: mismo `data/db.json` funciona en ambos motores
- **Tests de compatibilidad cross-mode**: 14 tests que verifican mismo shape en SQLite y PostgreSQL

# Rock Merch & Roll — E-commerce

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vitest](https://img.shields.io/badge/Vitest-1-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev)
[![Playwright](https://img.shields.io/badge/Playwright-1-45BA4B?style=flat-square&logo=playwright&logoColor=white)](https://playwright.dev)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

E-commerce de merchandising de bandas de rock con frontend React, backend Express + SQLite y un asistente de compras conversacional con búsqueda semántica local.

[Stack](#stack) • [Scripts](#scripts) • [Estructura](#estructura-del-proyecto) • [Arquitectura](#arquitectura) • [API](#api) • [Testing](#testing) • [Desarrollo](#desarrollo)

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18, TypeScript (`strict: true`), Vite 5, Tailwind CSS 3 |
| Backend | Express 4, TypeScript, SQLite (sql.js) |
| Testing | Vitest (unitario), Playwright (E2E) |
| Mock API | json-server (`data/db.json`) |

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo Vite (puerto 3000) |
| `npm run build` | TypeScript check + build de producción |
| `npm test` | Tests unitarios (Vitest) |
| `npm run test:e2e` | Tests end-to-end (Playwright) |
| `npm run mock:api` | json-server con `data/db.json` (puerto 3001) |
| `npm run server` | Backend real Express (puerto 4000) |

## Estructura del proyecto

```
/
├── index.html                    # Entry point HTML
├── src/
│   ├── main.tsx                  # Punto de entrada React
│   ├── App.tsx                   # Componente raíz + router SPA
│   ├── components/
│   │   ├── auth/                 # LoginModal, LogoutConfirmModal
│   │   ├── cart/                 # CartModal, CartItemRow
│   │   ├── catalog/              # ProductGrid
│   │   ├── chat/                 # ShoppingConcierge (chatbot)
│   │   ├── checkout/             # CheckoutPage
│   │   └── ui/                   # ProductCard, Toast
│   ├── context/
│   │   ├── AuthContext.tsx       # Estado de autenticación
│   │   └── CartContext.tsx       # Estado del carrito + localStorage
│   ├── hooks/
│   │   ├── useAuth.ts            # Login/logout
│   │   ├── useCart.ts            # Operaciones del carrito
│   │   ├── useCatalog.ts         # Fetch de productos
│   │   └── useConcierge.ts       # Lógica del chatbot
│   ├── services/
│   │   ├── api.ts                # Cliente HTTP (fetch)
│   │   ├── authService.ts        # Autenticación mock/real
│   │   ├── cartService.ts        # CRUD carrito + localStorage
│   │   ├── checkoutService.ts    # Validación de tarjeta, cálculos
│   │   ├── productSearch.ts      # Búsqueda semántica TF-IDF
│   │   └── productService.ts     # Catálogo: fetch, filtros, búsqueda
│   ├── types/                    # Interfaces TypeScript
│   └── __tests__/                # Tests unitarios
├── server/                       # Backend Express + SQLite
│   └── src/
│       ├── index.ts              # Servidor Express (puerto 4000)
│       ├── db.ts                 # Inicialización SQLite
│       ├── routes/               # products, users, orders
│       └── types.ts              # Tipos del backend
├── data/db.json                  # Datos semilla para json-server
├── public/img/                   # Imágenes del catálogo
└── e2e/                          # Tests Playwright
```

## Arquitectura

### Frontend

La aplicación es una SPA construida con React 18 que se organiza en torno a contextos y un router casero:

- **App.tsx** renderiza `AuthProvider` → `CartProvider` → `Router`
- **Router** utiliza `useSyncExternalStore` para escuchar cambios de ruta. Si la URL contiene `/checkout` renderiza `CheckoutPage`, de lo contrario `ShopPage`.
- **ShopPage** maneja dos vistas mediante estado local (`home` | `shop`):
  - Vista `home`: HeroSection, BannerServices, BrandSection
  - Vista `shop`: ProductsSection con `ProductGrid` + `ProductCard`
- **Contextos**: `CartContext` maneja items del carrito con persistencia en localStorage, `AuthContext` maneja autenticación mock y real.
- **Servicios**: Lógica de negocio pura en `src/services/` — ningún componente contiene lógica compleja.

### Backend

El backend está en `server/` con Express + TypeScript + SQLite (sql.js):

- Tablas: `products`, `users`, `orders`, `order_items`
- Seeding automático desde `data/db.json` al primer inicio
- Contrato de API idéntico al mock json-server

### Shopping Concierge

El asistente de compras es un chatbot embebido en la UI accesible desde un FAB flotante. Utiliza:

- **Búsqueda semántica local**: Índice TF-IDF + similitud de coseno sobre nombre, descripción y tipo del producto. No requiere API externa ni conexión a internet.
- **Parseo de intención**: detecta saludos, pedidos de ayuda, búsquedas y solicitudes de agregar al carrito.
- **Filtros exactos**: por precio máximo y categoría (remera, buzo, accesorio, vaso).
- **Integración directa con el carrito**: agrega productos mediante `CartContext`.

> [!NOTE]
> El chatbot funciona completamente offline y sin dependencias externas. No utiliza LLM ni APIs de terceros.

## API

### Endpoints

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/products` | Catálogo completo |
| `GET` | `/products/:id` | Producto individual |
| `POST` | `/users` | Registrar usuario |
| `GET` | `/orders?userId=:id` | Órdenes de un usuario |
| `POST` | `/orders` | Crear orden |
| `GET` | `/health` | Health check |

### Conmutación mock / real

El frontend se conecta al backend real (Express, puerto 4000) por defecto. Para usar json-server:

1. Ejecutar `npm run mock:api`
2. Cambiar `BASE_URL` en `src/services/api.ts` a `http://localhost:3001`

## Testing

### Unitarios / Integración (Vitest) — 70 tests

```bash
npm test              # Ejecuta toda la suite
npm run test:watch    # Modo watch
```

| Suite | Tests | Cobertura |
|---|---|---|
| `checkout.test.js` | 24 | detectCardType, validarLuhn, formatearNumeroTarjeta, calcularTotalConInteres, calcularEnvio, calcularResumen |
| `products.service.test.js` | 14 | fetchProducts, filterByCategory, searchByName |
| `cart.test.js` | 13 | validarProductoRepetido, eliminarProductoCarrito, vaciarCarrito, actualizarTotal |
| `auth.test.js` | 8 | login mock, loadAuthState, saveAuthState, clearAuthState |

### End-to-End (Playwright) — 14 tests

```bash
npm run test:e2e
```

| Suite | Tests | Flujo |
|---|---|---|
| `home.spec.js` | 4 | Carga SPA, navbar, banner-services visible, brand con 6 logos |
| `shop.spec.js` | 4 | Click "Compra Ahora" → productos visibles, banners ocultos, grid con botones |
| `cart.spec.js` | 3 | Contador inicial 0, agregar producto, incrementar cantidad |
| `navigation.spec.js` | 3 | Nav "Productos"/"Inicio", botón "Compra Ahora" |

## Desarrollo

### Requisitos

- Node.js >= 18
- npm >= 9

### Instalación

```bash
git clone <repo-url>
cd <repo-name>
npm install
```

### Inicio rápido

```bash
# Terminal 1 — Backend real
npm run server

# Terminal 2 — Frontend
npm run dev
```

Para desarrollo con mock API:

```bash
# Terminal 1 — Mock API
npm run mock:api

# Terminal 2 — Frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

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

E-commerce de merchandising de bandas de rock con frontend React y backend Express + SQLite.

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
├── src/                          # Código fuente del frontend React
│   ├── components/               # Componentes React organizados por dominio
│   │   ├── auth/                 # Login, registro, logout
│   │   ├── cart/                 # Modal del carrito
│   │   ├── catalog/              # Grilla de productos
│   │   ├── checkout/             # Página de finalización de compra
│   │   └── ui/                   # Componentes reutilizables (ProductCard, Toast)
│   ├── context/                  # Contextos React con estado global (Auth, Cart)
│   ├── hooks/                    # Custom hooks con lógica de negocio
│   ├── services/                 # Lógica pura sin dependencias del DOM (API, auth, cart, checkout)
│   ├── types/                    # Interfaces y tipos TypeScript compartidos
│   ├── __tests__/                # Tests unitarios (Vitest)
│   └── test/                     # Utilidades y helpers de testing
├── server/                       # Backend Express + SQLite
│   └── src/
│       ├── routes/               # Rutas: products, users, orders, auth
│       └── types.ts              # Tipos del backend
├── data/                         # Datos semilla (db.json) para json-server
├── public/img/                   # Imágenes del catálogo
├── docs/                         # Documentación técnica (arquitectura, API, reportes)
└── e2e/                          # Tests end-to-end (Playwright)
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

> **Nota:** El Shopping Concierge (chatbot con búsqueda semántica TF-IDF) fue eliminado en julio 2026 para simplificar la UX. El historial de commits y el reporte de cobertura en `docs/reports/qa/` conservan el registro histórico.

### Backend

El backend está en `server/` con Express + TypeScript + SQLite (sql.js):

- Tablas: `products`, `users`, `orders`, `order_items`
- Seeding automático desde `data/db.json` al primer inicio
- Contrato de API idéntico al mock json-server

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

### Unitarios / Integración (Vitest)

```bash
npm test              # Ejecuta toda la suite
npm run test:watch    # Modo watch
```

| Área | Suites | Cobertura |
|---|---|---|
| **Checkout** | `checkout.test.js` | detectCardType, validarLuhn, formatearNumeroTarjeta, cálculos de cuotas y envío, resumen |
| **Catálogo** | `products.service.test.js`, `FilterSidebar.test.jsx`, `ProductGrid.test.jsx`, `ProductCard.test.jsx`, `ProductDetailPage.test.jsx` | fetch, filtros, búsqueda, renderizado de grilla y cards |
| **Carrito** | `cart.test.js` | agregar/eliminar/vaciar productos, persistencia localStorage |
| **Auth** | `auth.test.js`, `LoginModal.test.jsx`, `RegisterPage.test.jsx` | login contra API, registro, formularios, estados de carga/error |
| **Catálogo hook** | `useCatalog.test.jsx` | fetch con loading/error, datos de productos |
| **Navegación** | `navigation.test.jsx` | router SPA, cambio de vistas |

### End-to-End (Playwright)

```bash
npm run test:e2e
```

| Área | Suites | Flujo |
|---|---|---|
| **Home** | `home.spec.js` | Carga SPA, navbar, banner-services visible, brand con logos |
| **Tienda** | `shop.spec.js` | Navegación a productos, grilla visible, botones de compra |
| **Carrito** | `cart.spec.js` | Contador, agregar producto, incrementar cantidad |
| **Navegación** | `navigation.spec.js` | Nav "Productos"/"Inicio", botón "Compra Ahora" |
| **Checkout** | `checkout.spec.js` | Flujo completo de compra con formulario de pago |
| **Filtros** | `filters.spec.js` | Filtros de catálogo por categoría |
| **Full flow** | `full-flow.spec.js` | Recorrido completo: home → shop → carrito → checkout → confirmación |

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
# Terminal 1 — Backend real (crea la DB automáticamente)
npm run server

# Terminal 2 — Frontend
npm run dev
```

### Acceso al Panel Admin

Al arrancar el servidor por primera vez, se crea automáticamente una cuenta administradora:

| Campo | Valor por defecto |
|---|---|
| Email | `admin@rock.com` |
| Contraseña | `admin123` |

**Personalizar credenciales del admin** (opcional):

```bash
ADMIN_EMAIL=admin@midominio.com ADMIN_PASSWORD=secreto123 npm run server
```

Una vez logueado, aparecerá un link **"Admin"** (púrpura) en el header para acceder al panel de administración, donde podrás gestionar usuarios y el stock de productos.

Para desarrollo con mock API:

```bash
# Terminal 1 — Mock API
npm run mock:api

# Terminal 2 — Frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

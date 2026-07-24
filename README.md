# Rock Merch & Roll — E-commerce

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vitest](https://img.shields.io/badge/Vitest-1-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev)
[![Playwright](https://img.shields.io/badge/Playwright-1-45BA4B?style=flat-square&logo=playwright&logoColor=white)](https://playwright.dev)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)
[![Built with opencode](https://img.shields.io/badge/Built_with-opencode_agents-8A2BE2?style=flat-square&logo=sparkles&logoColor=white)](./AGENTS.md)
[![Tests](https://img.shields.io/badge/Tests-247_passing-4CAF50?style=flat-square&logo=vitest&logoColor=white)](./docs/reports/qa/)

E-commerce de merchandising de bandas de rock con frontend React, backend Express y base de datos PostgreSQL.

[Stack](#stack) • [Scripts](#scripts) • [Estructura](#estructura-del-proyecto) • [Arquitectura](#arquitectura) • [API](#api) • [Testing](#testing) • [Desarrollo](#desarrollo)

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 18, TypeScript (`strict: true`), Vite 5, Tailwind CSS 3 |
| Backend | Express 4, TypeScript, PostgreSQL 16 |
| Testing | Vitest (unitario), Playwright (E2E) |
| Mock API | json-server (`data/db.json`) |
| DB | PostgreSQL 16 via Neon (serverless, free tier sin expiración) |

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo Vite (puerto 3000) |
| `npm run build` | TypeScript check + build de producción |
| `npm test` | Tests unitarios (Vitest) |
| `npm run test:e2e` | Tests end-to-end (Playwright) |
| `npm run test:server` | Tests del backend (Vitest, server config) |
| `npm run test:all` | Frontend + backend tests completos |
| `npm run mock:api` | json-server con `data/db.json` (puerto 3001) |
| `npm run server` | Backend real Express (puerto 4000) |

## Estructura del proyecto

```
/
├── src/                          # Código fuente del frontend React
│   ├── components/               # Componentes React organizados por dominio
│   │   ├── admin/                # Panel de administración
│   │   ├── auth/                 # Login, registro, logout
│   │   ├── cart/                 # Modal del carrito
│   │   ├── catalog/              # Grilla y detalle de productos
│   │   ├── checkout/             # Página de finalización de compra
│   │   ├── home/                 # Hero, servicios, marcas
│   │   ├── layout/               # AppContent, Header, Footer, ShopPage, FAQ
│   │   ├── router/               # Router SPA y rutas de detalle
│   │   └── ui/                   # Componentes reutilizables (ProductCard, Toast)
│   ├── context/                  # Contextos React con estado global (Auth, Cart)
│   ├── hooks/                    # Custom hooks con lógica de negocio
│   ├── services/                 # Lógica pura sin dependencias del DOM (API, auth, cart, checkout)
│   ├── types/                    # Interfaces y tipos TypeScript compartidos
│   ├── __tests__/                # Tests unitarios (Vitest)
│   └── test/                     # Utilidades y helpers de testing
├── server/                       # Backend Express + PostgreSQL
│   └── src/
│       ├── config/               # Configuración (database.ts)
│       ├── db/                   # Base de datos (pool, seed, migrations)
│       ├── routes/               # Rutas: products, users, orders, auth
│       └── types.ts              # Tipos del backend
├── data/                         # Datos semilla (db.json) para json-server
├── public/img/                   # Imágenes del catálogo
├── docs/                         # Documentación técnica (arquitectura, API, reportes)
└── e2e/                          # Tests end-to-end (Playwright)
```

## Flujo de trabajo con agentes de IA

Este proyecto se desarrolló utilizando un ecosistema de agentes (opencode), 
coordinados bajo un conjunto de directrices y skills especializados por dominio 
(frontend, testing, seguridad, base de datos, etc.).

- **Directrices globales**: [`AGENTS.md`](./AGENTS.md) — convenciones de código, 
  proceso de tareas, reglas de commits y seguridad que todo agente sigue antes 
  de intervenir en el repo.
- **Skills especializados**: cada agente puede apoyarse en skills específicos 
   (`coding-standards`, `testing-workflow`, `ui-ux-review`, `accessibility`, 
   `jwt-security`, `express-typescript`, entre otros) según el dominio de 
  la tarea.
- **Trazabilidad**: cada fase de desarrollo queda documentada en `docs/architecture/`, 
  `docs/reports/auditor/` (deuda técnica) y `docs/reports/qa/` (cobertura de tests), 
  y se cierra con un commit aprobado por el usuario.

Este enfoque permite mantener consistencia arquitectónica y de calidad a lo largo 
de todo el desarrollo, incluso con múltiples agentes trabajando en distintas capas 
del proyecto (frontend, backend, testing, documentación).

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

El backend está en `server/` con Express + TypeScript y base de datos PostgreSQL como único motor.

- **PostgreSQL 16**: conexión via `DATABASE_URL` (Neon o cualquier servidor PostgreSQL 16+)
- **Migraciones versionadas**: `server/src/db/migrations/` con tabla `_migrations` de tracking.
- **Queries nativas**: sintaxis PostgreSQL pura (`$1`, `$2`, `INSERT ... RETURNING id`)
- Tablas: `products`, `users`, `orders`, `order_items`
- Seeding automático desde `data/db.json` al primer inicio.
- Contrato de API idéntico al mock json-server.

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

## Deploy

### Render (backend) + Neon (PostgreSQL)

Guía completa en [`docs/deployment/render-neon.md`](./docs/deployment/render-neon.md).

Resumen rápido:

1. Crear base de datos en [Neon](https://neon.tech) (free tier, sin expiración, 500MB storage)
2. Copiar connection string `DATABASE_URL`
3. Conectar repo a [Render](https://render.com) — detecta `render.yaml` automáticamente
4. Setear `DATABASE_URL`, `JWT_SECRET` y opcionales en Environment Variables
5. Deploy automático — health check en `/health`

## Testing

### Unitarios / Integración (Vitest)

Actualmente: **247 tests unitarios/de integración (todos en frontend) + 29 tests de backend + 31 tests E2E = 307 tests totales**.

```bash
npm test              # Ejecuta toda la suite frontend
npm run test:server   # Tests del backend
npm run test:all      # Frontend + backend
npm run test:watch    # Modo watch
```

| Área | Suites | Cobertura |
|---|---|---|
| **Checkout** | `checkout.test.js` | detectCardType, validarLuhn, formatearNumeroTarjeta, cálculos de cuotas y envío, resumen |
| **Catálogo** | `products.service.test.js`, `FilterSidebar.test.jsx`, `ProductGrid.test.jsx`, `ProductCard.test.jsx`, `ProductDetailPage.test.jsx` | fetch, filtros, búsqueda, renderizado de grilla y cards |
| **Carrito** | `cart.test.js` | agregar/eliminar/vaciar productos, persistencia localStorage |
| **Auth** | `auth.test.js`, `LoginModal.test.jsx`, `RegisterPage.test.jsx` | login contra API, registro, formularios, estados de carga/error |
| **Admin** | `admin.test.jsx` | CRUD usuarios, panel admin |
| **Footer** | `Footer.test.tsx` | renderizado completo |
| **FAQ** | `FaqSection.test.tsx` | accordion, contenido |
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
| **Product detail** | `product-detail.spec.js` | Vista detalle, selector de talle |
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
# Terminal 1 — Backend real (requiere DATABASE_URL configurada o Neon)
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

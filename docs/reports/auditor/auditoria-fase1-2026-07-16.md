# Auditoría de Código — Fase 1

**Fecha:** 2026-07-16
**Auditor:** @auditor
**Versión del código:** v1.1.0 (React 18 + TypeScript + Vite + Tailwind)

---

## Resumen ejecutivo

Se analizó la totalidad del código fuente en `src/` (32 archivos TypeScript/TSX/JS) más
`index.html`, `tsconfig.json`, `package.json` y `vite.config.ts`. La aplicación es un
e-commerce de merchandising de rock con React 18 + TypeScript strict + Vite + Tailwind.

### Estado general: 🟡 Moderado riesgo

- **Puntos fuertes:** Buena separación de servicios/hooks/componentes en general,
  tipado fuerte en la mayoría del código, tests unitarios presentes (suite Vitest).
- **Riesgos principales:** Uso de `any` en TypeScript strict mode, dependencias globales
  de CDN frágiles (jsPDF, Bootstrap JS), lógica de negocio mezclada en JSX, TODOs sin
  implementar en flujos críticos (pago, carrito vacío), y duplicación de claves de
  localStorage que rompe encapsulación.

---

## 1. Mapa de dependencias actualizado

### 1.1 Árbol de componentes (React)

```
index.html
└── src/main.tsx
    └── <App> (src/App.tsx)
        └── AuthProvider (src/context/AuthContext.tsx)
            └── CartProvider (src/context/CartContext.tsx)
                └── <AppContent>
                    └── <Router> (SPA casero via useSyncExternalStore)
                        ├── [pathname incluye "/checkout"]
                        │   └── <Header>
                        │       ├── <CartModal> (src/components/cart/CartModal.tsx)
                        │       │   └── <CartItemRow>[] (src/components/cart/CartItemRow.tsx)
                        │       └── <LoginModal> (src/components/auth/LoginModal.tsx)
                        │   └── <CheckoutPage> (src/components/checkout/CheckoutPage.tsx)
                        │
                        └── [caso contrario]
                            └── <ShopPage>
                                ├── <Header> (inline en App.tsx líneas 41-199)
                                │   ├── <CartModal>
                                │   └── <LoginModal>
                                ├── [view=home] <HeroSection>
                                ├── [view=home] <BannerServices>
                                ├── [view=home] <BrandSection>
                                ├── [view=shop] <ProductsSection>
                                │   └── <ProductGrid> (src/components/catalog/ProductGrid.tsx)
                                │       └── <ProductCard>[] (src/components/ui/ProductCard.tsx)
                                └── <Footer>
                └── <ShoppingConcierge> (src/components/chat/ShoppingConcierge.tsx)
                    └── <ChatBubble>[]
                        └── <ProductMiniCard>[]
```

> **Nota:** Header, HeroSection, BannerServices, BrandSection, ProductsSection y Footer
> están definidos como componentes inline en `App.tsx`.

### 1.2 Servicios y sus dependencias

| Archivo | Exporta | Dependencias internas | Dependencias externas |
|---|---|---|---|
| `src/services/api.ts` | `fetchProducts()`, `fetchProductById()`, `registerUser()`, `fetchOrdersByUser()`, `createOrder()` | `BASE_URL` (constante) | `fetch` |
| `src/services/productService.ts` | `fetchProducts()`, `filterByCategory()`, `searchByName()` | `PRODUCTS_API_URL` | `fetch` |
| `src/services/cartService.ts` | `addToCart()`, `removeFromCart()`, `removeAllFromCart()`, `calculateSummary()`, `saveCartToStorage()`, `loadCartFromStorage()`, `clearCartStorage()` | tipos `CartItem`, `CartSummary` | `localStorage` |
| `src/services/checkoutService.ts` | `detectCardType()`, `validarLuhn()`, `formatearNumeroTarjeta()`, `calcularTotalConInteres()`, `calcularEnvio()`, `calcularResumen()` | Ninguna (funciones puras) | Ninguna |
| `src/services/authService.ts` | `login()`, `loadAuthState()`, `saveAuthState()`, `clearAuthState()` | tipos `AuthUser`, `AuthState` | `localStorage`, `fetch` |
| `src/services/productSearch.ts` | `buildIndex()`, `clearIndex()`, `isIndexReady()`, `searchSimilar()`, `searchByCategory()`, `searchByPriceRange()`, `getProductById()`, `searchByName()` | tipos `Product`, módulo interno `_index`, `_idfMap` | Ninguna |

> **Nota:** `searchByCategory()`, `searchByPriceRange()` y `getProductById()` son código muerto — no importados por ningún módulo.

### 1.3 Hooks

| Archivo | Exporta | Usa servicios | Usa contextos |
|---|---|---|---|
| `src/hooks/useCatalog.ts` | `{ products, loading, error, filterByCategory, searchByName }` | `productService.fetchProducts`, `productService.filterByCategory`, `productService.searchByName` | Ninguno |
| `src/hooks/useCart.ts` | wrapper de CartContext | — | `CartContext` |
| `src/hooks/useAuth.ts` | wrapper de AuthContext | — | `AuthContext` |
| `src/hooks/useConcierge.ts` | estado del chat + acciones | `productSearch.buildIndex`, `productSearch.searchSimilar`, `productSearch.searchByName` | Recibe addToCartFn por parámetro |

### 1.4 Flujo de datos entre contextos y componentes

```
AuthContext (src/context/AuthContext.tsx)
  Estado: { user, token, isAuthenticated }
  Persistencia: localStorage (authToken, userEmail)
  Consumido por: Header, LoginModal

CartContext (src/context/CartContext.tsx)
  Estado: { items: CartItem[], summary }
  Persistencia: localStorage (carrito)
  Consumido por: Header, CartModal, CheckoutPage, ShoppingConcierge, ProductsSection

ToastContext (src/components/ui/Toast.tsx)
  Estado: { toasts [] }
  Sin persistencia
  *** NUNCA integrado en App.tsx — useToast() lanza error si se usa ***

Flujo crítico: CheckoutPage bypass del contexto
  En CheckoutPage.tsx línea 91:
    localStorage.removeItem('carrito');
  Esto accede directamente a localStorage con la clave hardcodeada 'carrito',
  violando la encapsulación de CartContext.
```

### 1.5 Estado global

| Variable / key | Dónde vive | Quién lo escribe | Quién lo lee |
|---|---|---|---|
| `localStorage.carrito` | localStorage | CartContext (via cartService), **CheckoutPage (bypass directo línea 91)** | CartContext init |
| `localStorage.authToken` | localStorage | AuthContext (via authService) | AuthContext init |
| `localStorage.userEmail` | localStorage | AuthContext (via authService) | AuthContext init |
| `_index` (módulo) | Módulo `productSearch.ts` | `buildIndex()` | `searchSimilar()`, `isIndexReady()` |
| `_idfMap` (módulo) | Módulo `productSearch.ts` | `buildIndex()` | `searchSimilar()` |
| `messageCounter` (módulo) | Módulo `useConcierge.ts` | `nextId()` | `nextId()` |

---

## 2. Deuda Técnica — Hallazgos Priorizados

### 🚨 [ALTA] Riesgo 1: Uso de `any` y manipulación DOM imperativa en componentes React

**Archivo:** `src/App.tsx:151`
```typescript
const modalInstance = new (window as any).bootstrap.Modal(modalEl, { backdrop: 'static' });
```
**Problemas:**
1. **`as any`**: TypeScript está configurado con `strict: true` (tsconfig.json línea 14). Esta línea lo viola directamente.
2. **Manipulación DOM imperativa**: Las líneas 120-158 inyectan HTML como string para crear un modal de confirmación de logout. Práctica antagónica a React.
3. **Dependencia global Bootstrap JS**: Accede a `window.bootstrap` cargado desde CDN. Si falla, todo el logout se rompe.

**Archivo:** `src/services/authService.ts:13-14`
```typescript
(window as unknown as Record<string, unknown>).Config != null
```
**Problema:** Evasión del sistema de tipos para acceder a `window.Config`.

**Impacto:** 🚨 Alto — viola la configuración central del proyecto (strict mode), es frágil, y puede causar crashes inesperados.

---

### 🚨 [ALTA] Riesgo 2: Dependencia de CDN global para funcionalidad core (jsPDF)

**Archivos:**
- `index.html:29` — jsPDF desde CDN
- `src/components/checkout/CheckoutPage.tsx:117` — acceso a `window.jspdf`

```typescript
const { jsPDF } = window.jspdf;
if (!jsPDF) return;
const pdf = new jsPDF();
// ... generación del PDF
pdf.save(`Comprobante_RMR_${Date.now()}.pdf`);
```
**Problemas:**
1. jsPDF no está en `package.json` — es dependencia global de CDN.
2. Si el CDN falla, la descarga del comprobante se rompe silenciosamente.
3. `if (!jsPDF) return;` falla sin feedback al usuario.
4. Tipos manuales (`jspdf.d.ts`) pueden quedar desactualizados.

**Impacto:** 🚨 Alto — funcionalidad core del checkout depende de recurso externo no controlado.

---

### 🚨 [ALTA] Riesgo 3: Lógica de negocio y estructura UI mezcladas

**`src/App.tsx`** — 450 líneas totales, contiene 7 componentes inline:

| Componente | Líneas | Problema |
|---|---|---|
| Header | 159 (41-199) | Navegación, auth, carrito + **logout modal con DOM injection** |
| HeroSection | 27 | UI pura (aceptable) |
| BannerServices | 61 | UI pura (aceptable) |
| BrandSection | 15 | UI pura (aceptable) |
| ProductsSection | 24 | Lógica de catálogo + UI |
| Footer | 73 | UI pura (aceptable) |

**`src/components/checkout/CheckoutPage.tsx`** — 384 líneas:
- Formulario de pago (JSX) + 11 useState + validación Luhn + cálculos + PDF generation + countdown

**Violación AGENTS.md:** "Toda la lógica de negocio debe vivir en hooks personalizados (src/hooks/) o servicios de JS puro (src/services/). Nunca mezclar lógica compleja en el JSX."

**Impacto:** 🚨 Alto — dificulta testing, mantenimiento, viola la arquitectura definida.

---

### ⚠️ [MEDIA] Riesgo 4: TODOs sin implementar y manejo de errores ausente

**`src/components/cart/CartModal.tsx:15-17`**:
```typescript
if (items.length === 0) {
  // TODO: show toastify notification
  return;
}
```
**`src/components/checkout/CheckoutPage.tsx:82-84`**:
```typescript
if (!tarjetaValida) {
  // TODO: show toast error
  return;
}
```
**`src/components/ui/Toast.tsx`**: ToastProvider creado pero **NUNCA integrado** en App.tsx.

**Además:**
- Sin Error Boundaries en React
- `authService.ts` login no discrimina error de red vs 401
- `productService.fetchProducts()` silencia errores con `console.error`

**Impacto:** ⚠️ Medio — afecta UX en flujos de pago y compra.

---

### ⚠️ [MEDIA] Riesgo 5: Duplicación de clave localStorage y fuga de abstracción

**`src/components/checkout/CheckoutPage.tsx:91`**:
```typescript
localStorage.removeItem('carrito');
```
**Problemas:**
1. Acceso directo a localStorage con clave hardcodeada, cuando ya se llama a `clearCart()`.
2. Si la clave `'carrito'` cambia en `cartService.ts`, este código queda inconsistente.
3. La misma clave aparece en 5 lugares en el código.

**Impacto:** ⚠️ Medio — riesgo de bugs silenciosos por inconsistencia.

---

### ℹ️ [BAJA] Riesgo 6: Código muerto

**Archivo:** `src/services/productSearch.ts`

| Función | Línea | Estado |
|---|---|---|
| `searchByCategory()` | 266 | Nunca importada |
| `searchByPriceRange()` | 280 | Nunca importada |
| `getProductById()` | 290 | Nunca importada |

**Impacto:** Bajo — no afecta funcionalidad.

---

### ℹ️ [BAJA] Riesgo 7: Variable mutable global fuera de React

**`src/hooks/useConcierge.ts:105`**: `let messageCounter = 0;`

Variable global mutable en módulo ES. Riesgo práctico bajo, pero mala práctica en React.

---

### ℹ️ [BAJA] Riesgo 8: Tests en JS (no TS)

Los tests en `src/__tests__/` son archivos `.js`. No se benefician del type-checking de TypeScript.

---

## 3. Resumen de hallazgos

| # | Riesgo | Severidad | Archivo(s) | Tipo |
|---|---|---|---|---|
| 1 | `any` y DOM injection en React | 🚨 ALTA | `App.tsx`, `authService.ts` | Violación TS strict + práctica React |
| 2 | CDN global jsPDF (sin fallback) | 🚨 ALTA | `index.html`, `CheckoutPage.tsx`, `jspdf.d.ts` | Dependencia frágil |
| 3 | Componentes monolíticos (lógica en JSX) | 🚨 ALTA | `App.tsx`, `CheckoutPage.tsx` | Violación AGENTS.md |
| 4 | TODOs sin implementar + manejo errores ausente | ⚠️ MEDIA | `CartModal.tsx`, `CheckoutPage.tsx`, `Toast.tsx` | UX/Estabilidad |
| 5 | Duplicación clave localStorage 'carrito' | ⚠️ MEDIA | `CheckoutPage.tsx`, `cartService.ts` | Encapsulación |
| 6 | Código muerto (3 funciones) | ℹ️ BAJA | `productSearch.ts` | Mantenibilidad |
| 7 | Variable mutable global `messageCounter` | ℹ️ BAJA | `useConcierge.ts` | Buena práctica |
| 8 | Tests en JS en proyecto TS | ℹ️ BAJA | `__tests__/*.js` | Consistencia |

---

## 4. Recomendaciones (alto nivel, sin detalle de implementación)

1. **Eliminar `any`**: Reemplazar `(window as any)` con tipos propios para `window.bootstrap` o migrar el modal de logout a un componente React puro.
2. **Empaquetar jsPDF**: Mover jsPDF de CDN a `npm install jspdf` e importarlo como módulo ES.
3. **Refactorizar componentes grandes**: Extraer Header a `src/components/ui/Header.tsx`, separar lógica de logout modal en hook. Refactorizar CheckoutPage extrayendo lógica de formulario a hook personalizado.
4. **Integrar ToastProvider** en App.tsx e implementar los TODOs pendientes.
5. **Eliminar acceso directo a localStorage** en CheckoutPage; usar solo `clearCart()` del contexto.
6. **Agregar Error Boundaries** para checkout y catálogo.
7. **Evaluar si `messageCounter`** puede reemplazarse con `useRef` o `crypto.randomUUID()`.

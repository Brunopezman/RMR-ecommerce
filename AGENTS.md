# AGENTS.md — E-Commerce Vanilla JS → Squad de Agentes

Este archivo lo lee todo agente/subagente de opencode antes de trabajar. Contiene las
reglas globales del repo. Las reglas específicas de cada rol viven en `.opencode/agent/*.md`.

## Qué es este repo
E-commerce que arranca en HTML/CSS/JS vanilla (sin build step). No hay backend ni base de
datos: los productos están hardcodeados en `data/stock.json`. Todo el JS se comunica a
través de `window.*` globales (IIFE, sin ES modules ni bundler). Objetivo del squad:
auditar → testear → **migrar a React + TypeScript + Vite + Tailwind CSS** → migrar a API
mock → migrar a backend real → sumar features de IA (shopping assistant, optimizador de
conversión).

**Stack objetivo (post Fase 2):** React 18+, TypeScript (`strict: true`), Vite, Tailwind
CSS. Ver skill `coding-standards` para estructura de carpetas y convenciones detalladas.

## Orden de fases (NO saltear pasos)
1. **Fase 1 — Diagnóstico**: `auditor` genera el mapa de dependencias y el reporte de
   deuda técnica. `qa-tester` levanta la suite de tests y escribe tests de caracterización
   sobre el código ACTUAL (sin tocarlo). Fase 2 no arranca hasta que estos tests estén en verde.
2. **Fase 2 — Migración a React**: `refactor-architect` scaffolde el proyecto con Vite +
   React + TypeScript + Tailwind, y migra en tandem con `qa-tester`: migra una
   feature/vista (ej. catálogo) → corre tests → si fallan, corrige → si pasan, sigue con
   la próxima. Nunca migra más de una feature sin correr la suite.
3. **Fase 3 — Datos**: `data-integration` reemplaza arrays hardcodeados por una API mock
   (json-server / MSW) y luego diseña el backend real (schemas + endpoints).
4. **Fase 4 — Producto/IA**: `shopping-concierge` y `conversion-optimizer` solo arrancan
   cuando Fase 3 Paso A (mock API) está funcionando.

## Convenciones de código
- Pre-migración (JS vanilla, mientras dura Fase 1): tocar lo mínimo indispensable, no
  refactorizar de paso.
- **Respetar el orden de carga de scripts** en cada HTML: modal → navbar → env → cart →
  products.service → products.view → auth → index → checkout. Los módulos dependen de
  `window.*` definido por scripts previos. Romper el orden rompe la app.
- La mayoría del JS actual usa **patrón IIFE + `window.*` globales** (excepciones: modal.js y checkout.js). No convertir a ES modules hasta Fase 2.
- Post-migración (React + TypeScript): componentes funcionales, lógica de negocio en
  hooks/`services/`, nunca mezclada con JSX. `strict: true` en TypeScript, sin `any`.
  Ver skill `coding-standards` para el detalle completo de estructura y naming.
- Todo cambio de comportamiento visible (no solo refactor) requiere un test nuevo o
  actualizado en la misma tarea.
- No borrar código sin antes confirmar con `auditor` o `qa-tester` que no rompe nada.

## Arquitectura actual (pre-migración)

### Entry points
Tres páginas HTML con conjuntos de scripts distintos:
| Archivo | Scripts que carga |
|---|---|
| `index.html` | modal, navbar, env, cart, service, view, auth, index, checkout |
| `pages/shop.html` | modal, navbar, env, cart, service, view, auth, index |
| `pages/checkout.html` | env, checkout, auth, jsPDF (CDN) |

### Sistema de módulos (pre-Fase 2)
- **No hay bundler ni ES modules**. Cada archivo es un `<script>` global suelto.
- Todo se expone en `window.*`: `window.carrito`, `window.ProductsService`,
  `window.pintarProductos`, `window.validarProductoRepetido`, `window.Config`, etc.
- La mayoría usa patrón IIFE (`(function(){ ... window.X = X; })()`).

### Configuración (`src/config/env.js`)
- `window.Config.DATA_URL` — ruta al JSON de productos (default `../data/stock.json`).
- `window.Config.USE_MOCK_AUTH` — default `false`; cambiar a `true` para login demo local.
- `window.Config.API_URL` — endpoint base para backend real (hoy sin backend).

### Estado global
- Carrito: `localStorage.getItem('carrito')` + `window.carrito` en memoria.
- Auth: `localStorage.getItem('authToken')` + `localStorage.getItem('userEmail')`.

## Testing
- Unit/integration: Vitest + React Testing Library (componentes y hooks).
- Flujos end-to-end de usuario (agregar al carrito, checkout, búsqueda): Playwright.
- **Setup necesario**: `npm install` en la raíz instala Vitest y Playwright.
  `qa-tester` debe configurar `vitest.config.*` y `playwright.config.*` en Fase 1.
- Comandos: `npm test` (vitest), `npm run test:e2e` (Playwright). Cualquier agente
  que toque `src/` DEBE correr `npm test` antes de dar la tarea por terminada.
- Desarrollo local: `npm run dev` levanta un servidor estático con `serve`.

## Dónde escribe cada agente sus entregables
- `docs/architecture/` — mapas de dependencias, decisiones de arquitectura (ADRs).
- `docs/reports/auditor/` — reportes de deuda técnica.
- `docs/reports/qa/` — cobertura, tests agregados, flakiness.
- `docs/reports/conversion/` — hallazgos de copy/UX y experimentos.

## Reglas de seguridad para todos los agentes
- Nunca commitear credenciales, API keys ni `.env`.
- Nunca hacer `git push --force` ni reescribir historia sin pedir confirmación explícita.
- Cambios en `main`/`master` van por rama + PR, nunca commit directo.

## Skills disponibles (se cargan on-demand, ver `.opencode/skill/`)
- `testing-workflow` — cómo configurar y correr Vitest/Playwright en este repo.
- `refactor-tandem` — protocolo de refactor-y-testear paso a paso.
- `api-mock-transition` — cómo pasar de arrays hardcodeados a json-server/MSW.
- `rag-product-catalog` — cómo indexar el catálogo para el shopping assistant (RAG/function calling).
- `coding-standards` — reglas de estilo detalladas (naming, estructura de carpetas `src/`).

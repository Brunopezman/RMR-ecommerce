# AGENTS.md — E-Commerce Vanilla JS → Squad de Agentes

Este archivo lo lee todo agente/subagente de opencode antes de trabajar. Contiene las
reglas globales del repo. Las reglas específicas de cada rol viven en `.opencode/agent/*.md`.

## Qué es este repo
E-commerce que arranca en HTML/CSS/JS vanilla (sin build step). No hay backend ni base de
datos: los productos están hardcodeados en arrays JS. Objetivo del squad: auditar →
testear → **migrar a React + TypeScript + Vite + Tailwind CSS** → migrar a API mock →
migrar a backend real → sumar features de IA (shopping assistant, optimizador de
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
- Post-migración (React + TypeScript): componentes funcionales, lógica de negocio en
  hooks/`services/`, nunca mezclada con JSX. `strict: true` en TypeScript, sin `any`.
  Ver skill `coding-standards` para el detalle completo de estructura y naming.
- Todo cambio de comportamiento visible (no solo refactor) requiere un test nuevo o
  actualizado en la misma tarea.
- No borrar código sin antes confirmar con `auditor` o `qa-tester` que no rompe nada.

## Testing
- Unit/integration: Vitest + React Testing Library (componentes y hooks).
- Flujos end-to-end de usuario (agregar al carrito, checkout, búsqueda): Playwright.
- Comando estándar: `npm test` (unit) y `npm run test:e2e` (Playwright). Cualquier agente
  que toque `src/` DEBE correr `npm test` antes de dar la tarea por terminada.

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

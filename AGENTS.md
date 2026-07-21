# AGENTS.md — E-Commerce Rock Merch & Roll (Squad de Agentes)

Este archivo contiene las directrices globales de desarrollo para todo agente o subagente de opencode antes de comenzar una tarea.

## Qué es este repo

E-commerce de merchandising de rock. **Stack actual:** React 18+, TypeScript (`strict: true`), Vite, Tailwind CSS. El frontend carga datos desde `data/db.json` (mock API) o se conecta al backend real en `server/` (Express + SQLite).

## Convenciones de código y Estándares

- **Separación de responsabilidades**: Componentes puramente funcionales. Toda la lógica de negocio debe vivir en hooks personalizados (`src/hooks/`) o servicios de JS puro (`src/services/`). Nunca mezclar lógica compleja en el JSX.
- **TypeScript**: `strict: true`, prohibido el uso de `any`.
- Ver el skill `coding-standards` para el detalle de la estructura de carpetas y nomenclatura.

## Arquitectura y Contratos de API

La documentación técnica detallada se mantiene centralizada y debe usarse como única fuente de verdad:
- **Flujos y Mapa de Dependencias**: `docs/architecture/dependency-map.md`
- **Contrato de API y Base de Datos**: `docs/architecture/api-contract.md`

## Proceso de Tareas y Entrega

- **Falsabilidad**: Todo plan de desarrollo debe incluir criterios de aceptación claros y falsables (Given/When/Then o checklist).
- **Cobertura de Tests**: Cualquier cambio en el comportamiento de la app requiere escribir un test correspondiente (unitario o de integración) y validar que pasa.
- **Commit por fase/inciso**: Al terminar cada fase o sub-inciso, hacer commit con mensaje claro. Pedir aprobación del usuario antes de pushear. Actualizar `.opencode-handoff.md` al finalizar cada fase.
- **Entregables**:
  - Decisiones de arquitectura y mapas: `docs/architecture/`
  - Reportes de deuda técnica incremental: `docs/reports/auditor/`
  - Métricas de cobertura y tests: `docs/reports/qa/`

## Testing y Calidad

- **Unitarios / Integración (Vitest + jsdom)**: `npm test` para correr la suite completa.
- **End-to-End (Playwright)**: `npm run test:e2e` para levantar la app y correr flujos complejos (14 tests).
- **Obligatorio**: Todo agente que modifique código en `src/` debe correr `npm test` exitosamente antes de finalizar.

## Reglas de Seguridad y Commits

- **Aprobación de Commits**: Todos los commits deben ser explicados y aprobados por el usuario antes de ejecutarse.
- **Control de Cambios**: Trabajar siempre sobre ramas de feature y crear PRs hacia `develop`/`main`. Nunca hacer commits directos ni `push --force` sin autorización.
- **Secretos**: Prohibido commitear credenciales, variables `.env`, tokens o claves API.

## Skills Disponibles

- `coding-standards` — Guía de estilo de código, estructura y nomenclatura de archivos.
- `testing-workflow` — Flujo de ejecución y escritura de tests unitarios y E2E.
- `ui-ux-review` — Revisión de interfaces: consistencia visual, jerarquía, micro-interacciones.
- `accessibility` — Auditoría WCAG: contraste, roles ARIA, navegación por teclado.
- `tailwind-design-system` — Sistema de diseño estructurado con Tailwind utility classes.
- `responsive-design` — Verificación responsive Mobile-First (320px → 1280px+).
- `react-best-practices` — Estándares React y arquitectura de componentes.
- `performance-audit` — Web Vitals, bundle analysis, lazy loading y optimización de assets.
- `ux-writing` — Microcopy, CTAs, tono de voz consistente en la interfaz.
- `express-typescript` — Arquitectura, patrones y mejores prácticas para APIs RESTful con Express y TypeScript.
- `jwt-security` — Auditoría e implementación segura de autenticación y autorización basada en JWT (JSON Web Tokens).
- `sqlite-database-expert` — Diseño de esquemas, optimización de consultas, migraciones y gestión de bases de datos SQLite.

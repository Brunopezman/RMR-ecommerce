# Índice de Reportes — Rock Merch & Roll

> **Propósito:** Trazabilidad entre fases de desarrollo y sus reportes asociados.
> **Formato:** `YYYY-MM-DD-tipo-descripcion.md`

---

## Mapa de trazabilidad Fase → Reporte

| Fase | Descripción | Reportes |
|------|-------------|----------|
| **Fase 1** | Diagnóstico inicial + tests de caracterización (v1.0.0) | `docs/archive/reports/auditor/2026-07-13-auditoria-fase1.md` ← Deuda técnica (10 hallazgos) |
| | | `docs/archive/reports/qa/2026-07-13-qa-bloqueantes.md` ← Bloqueantes de testing |
| **—** | Migración a React SPA + refactor catálogo | *(cubierto por reportes de Fase 1 y QA intermedio)* |
| **Fase 2** | PostgreSQL-only + deploy Render/Neon (v1.1.0 → v1.2.0) | `docs/reports/qa/2026-07-18-qa-cobertura.md` ← Cobertura post-cambios (101 → 364 tests) |
| | | `docs/reports/auditor/2026-07-22-auditoria-fase2.md` ← Issues Fase 1 corregidos + nuevos hallazgos |
| | | `docs/reports/qa/2026-07-22-qa-calidad.md` ← Reporte de calidad v1.2.0 |

---

## Detalle de Fases

| Archivo de fase | Propósito |
|---|---|
| `.opencode/command/fase1-eliminar-sqlite-db.md` | Eliminar `sql.js` y dual-mode SQLite/PostgreSQL |
| `.opencode/command/fase2-simplificar-routes.md` | Simplificar routers eliminando branching dual-mode |
| `.opencode/command/fase3-limpiar-bootstrap.md` | Limpiar referencias legacy y archivos muertos |
| `.opencode/command/fase4-actualizar-tests.md` | Actualizar tests para PostgreSQL-only |
| `.opencode/command/fase5-limpiar-dependencias.md` | Limpiar dependencias muertas (`sql.js`, `bootstrap`) |

---

## Reportes archivados (históricos)

Los reportes de Fase 1 (v1.0.0) se mantienen en `docs/archive/reports/` como referencia histórica. Los reportes activos viven en `docs/reports/{auditor,qa}/`.

| Archivo | Contenido |
|---|---|
| `docs/archive/reports/auditor/2026-07-13-auditoria-fase1.md` | Deuda técnica pre-migración: 10 hallazgos (5 🔴, 4 🟡, 1 🟢) |
| `docs/archive/reports/qa/2026-07-13-qa-bloqueantes.md` | Bloqueantes de testing en código vanilla JS |

---

## Historial de cambios

| Fecha | Cambio |
|------|--------|
| 2026-07-23 | Estandarización de nombres: formato `YYYY-MM-DD-tipo-descripcion.md` |
| 2026-07-23 | Creación de este índice de trazabilidad |
| 2026-07-22 | Reportes de Fase 2 (v1.1.0 → v1.2.0) |
| 2026-07-18 | Reporte de cobertura intermedio |
| 2026-07-13 | Reportes iniciales de Fase 1 (v1.0.0) |

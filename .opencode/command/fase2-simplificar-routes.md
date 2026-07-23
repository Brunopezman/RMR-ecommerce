---
description: "✅ COMPLETADA — Simplificar routers eliminando branching dual-mode"
agent: backend-dev
---

Esta fase fue completada exitosamente.

- ✅ Cero referencias a `isPostgres()` en routers
- ✅ Cero placeholders `?` en queries SQL
- ✅ `dual-backend.test.ts` eliminado
- ✅ `db.ts` simplificado: solo `initDb`, `queryAll`, `queryOne`, `run`
- ✅ 41 tests backend pasan, 283 frontend pasan
- ✅ Server compila sin errores

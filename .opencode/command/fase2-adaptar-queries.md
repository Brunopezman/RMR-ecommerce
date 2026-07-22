---
description: "✅ COMPLETADA — Adaptar queries SQL a PostgreSQL"
agent: backend-dev
---

Esta fase fue completada exitosamente.

**Archivos creados:** `server/src/db/compat.ts` (convertPlaceholders, nowExpression, isPostgres)
**Archivos modificados:** `db.ts` (run retorna QueryResult en pg), `routes/auth.ts`, `routes/orders.ts`, `routes/contact.ts`, `routes/users.ts` (INSERT...RETURNING id en pg)
**Tests flaky corregidos:** `LoginModal.test.jsx` — 3 pases consecutivos ✅
**Resultado:** 283 frontend + 41 backend = 324 tests, 0 fallos

---
description: "✅ COMPLETADA — Eliminar sql.js y modo SQLite, PostgreSQL como único backend"
agent: backend-dev
---

Esta fase fue completada exitosamente.

- ✅ `sql.js` eliminado de server/package.json
- ✅ `db.ts` reescrito: 379→70 líneas, sin código SQLite ni dual-mode
- ✅ `compat.ts` eliminado
- ✅ `sql.js.d.ts` eliminado
- ✅ Routers unificados con placeholders `$N` y `RETURNING id`
- ✅ Seed y migraciones simplificados
- ✅ Server compila, 41 tests pasan

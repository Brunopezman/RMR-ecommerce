---
description: "🟡 Eliminar sql.js y todo el modo SQLite — PostgreSQL como único backend"
agent: backend-dev
---

## Objetivo

Eliminar el soporte dual-mode (SQLite + PostgreSQL) y dejar PostgreSQL como único backend de base de datos.

### Tareas

1. **Remover sql.js de dependencias**
   - `npm uninstall sql.js` en `server/package.json`
   - Eliminar `@types/sql.js` si existe en devDependencies

2. **Eliminar código SQLite en `server/src/db.ts`**
   - Remover import y detección de `sql.js`
   - Eliminar bloque `if (!isPostgresConfigured())` — todo el path SQLite
   - Dejar solo el path PostgreSQL via `pool.ts`
   - Simplificar `queryAll`, `queryOne`, `run` — sin switch de modo

3. **Eliminar `server/src/db/compat.ts`**
   - Ya no necesario: no hay placeholders `?` que convertir, no hay `sql.js` que abstraer
   - Los routers quedan con sintaxis PostgreSQL pura (`$1`, `$2`, ...)

4. **Simplificar `server/src/db/seed.ts`**
   - Remover branch SQLite (sql.js bulk insert)
   - Dejar solo lógica PostgreSQL con `INSERT ... ON CONFLICT`

5. **Simplificar migraciones**
   - `migrate.ts` ya no necesita detectar modo — solo corre migraciones PostgreSQL
   - `migrations-runner.ts` sin compat layer

6. **Verificar que `npm test` pase en server y frontend**

### Criterios de aceptación
- [ ] `sql.js` no está en `package.json` ni `node_modules`
- [ ] `server/src/db.ts` no tiene referencias a `sql.js` ni lógica dual-mode
- [ ] `compat.ts` eliminado
- [ ] Todos los tests backend pasan sin skip (no más "skipped sin DATABASE_URL")
- [ ] 283 frontend + todos backend = suite completa

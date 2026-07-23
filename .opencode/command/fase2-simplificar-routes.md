---
description: "🟡 Simplificar routers eliminando branching dual-mode"
agent: backend-dev
---

## Objetivo

Una vez eliminado SQLite, limpiar los routers de toda lógica condicional entre modos.

### Tareas

1. **Revisar routers en `server/src/routes/`**
   - `auth.ts`, `orders.ts`, `contact.ts`, `users.ts`, `products.ts`
   - Eliminar cualquier `if (isPostgres())` / `if (!isPostgres())`
   - Todas las queries usan sintaxis PostgreSQL (`$1`, `$2`, `INSERT ... RETURNING`)

2. **Estandarizar queries**
   - Unificar `run()` sin parámetro de modo
   - Unificar `queryAll()` / `queryOne()` sin compat layer
   - Sacar `lastInsertId` — usar `RETURNING id` directo

3. **Simplificar `server/src/db.ts`**
   - Eliminar `isPostgres()` de exports (o mantener como constante `true`)
   - Exportar solo `queryAll`, `queryOne`, `run`, `getPool`
   - Eliminar `convertPlaceholders`, `nowExpression` si `compat.ts` fue eliminado

4. **Verificar que no queden strings con `?` placeholder**
   - `rg '\\?' server/src/routes/` — debe dar 0 matches (salvo strings literales)

5. **Verificar que `npm test` pase en server y frontend**

### Criterios de aceptación
- [ ] Ningún router contiene `isPostgres()` o `isPostgresConfigured()`
- [ ] Todas las queries SQL usan `$N` placeholders y `RETURNING`
- [ ] `db.ts` simplificado sin branching de modo
- [ ] Tests pasando

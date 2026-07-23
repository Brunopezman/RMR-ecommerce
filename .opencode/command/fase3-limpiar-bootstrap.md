---
description: "🟡 Limpiar referencias legacy y archivos muertos tras migración PostgreSQL"
agent: backend-dev
---

## Objetivo

Eliminar archivos y referencias legacy que quedaron obsoletos tras la migración a PostgreSQL-only. Bootstrap no está presente en el proyecto, pero pueden existir otros residuos.

### Tareas

1. **Verificar que no queden residuos de sql.js en el código**
   - `server/src/sql.js.d.ts` — eliminar si existe (type declaration legacy)
   - Buscar imports de `sql.js` en cualquier archivo `.ts`
   - Buscar referencias a `rockmerch.db` en el código

2. **Eliminar archivos de datos SQLite**
   - `server/data/rockmerch.db` — eliminar si existe
   - `server/data/` — mantener solo si hay otros archivos necesarios

3. **Verificar que no haya código muerto en el frontend**
   - Buscar referencias a `USE_MOCK_AUTH`, `demo-token` u otros legados
   - Verificar que `src/services/api.ts` no tenga configuraciones obsoletas

4. **Correr tests**
   - `npm test` frontend sin errores
   - `npm run test:server` backend sin errores
   - `npm run build` exitoso

### Criterios de aceptación
- [ ] `server/src/sql.js.d.ts` eliminado
- [ ] `server/data/rockmerch.db` eliminado
- [ ] Cero referencias a `sql.js` o `rockmerch.db` en el código
- [ ] Build exitoso, tests pasando

---
description: "🟡 Limpiar dependencias muertas tras eliminar SQLite y Bootstrap"
agent: backend-dev
---

## Objetivo

Eliminar dependencias que ya no se usan tras la migración a PostgreSQL-only y la limpieza de Bootstrap.

### Tareas

1. **server/package.json**
   - `sql.js` — eliminado (fase1)
   - Verificar que no queden `@types/sql.js` o `@types/sql.js` en devDependencies
   - Revisar si `compat.ts` al eliminarse deja alguna dependencia muerta
   - `npm prune` para remover módulos no referenciados

2. **package.json (frontend)**
   - `bootstrap`, `react-bootstrap` — eliminados (fase3)
   - Verificar que no queden tipos de Bootstrap
   - Verificar que no queden imports a Bootstrap en CSS/JS

3. **Verificar dependencias no usadas con herramienta**
   - `npx depcheck` en server/ y en raíz
   - Revisar manualmente cualquier dependencia marcada como no usada

4. **package-lock.json**
   - Regenerar con `npm install` limpio (borrar `node_modules` y `package-lock.json`, reinstalar)
   - Commit de `package-lock.json` actualizado

5. **Verificar builds**
   - `npm run build` en server → exitoso
   - `npm run build` en raíz → exitoso
   - `npm test` en ambos → todos pasando

### Criterios de aceptación
- [ ] `sql.js` no está en server/package.json ni lockfile
- [ ] `bootstrap` / `react-bootstrap` no están en package.json ni lockfile
- [ ] `npm prune` no elimina dependencias necesarias
- [ ] Builds y tests pasando

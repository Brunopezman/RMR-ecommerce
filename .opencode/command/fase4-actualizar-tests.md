---
description: "🟡 Actualizar tests para reflejar PostgreSQL-only y Bootstrap eliminado"
agent: qa
---

## Objetivo

Actualizar todos los tests para que reflejen la nueva realidad del código: PostgreSQL como único backend y sin Bootstrap en frontend.

### Tareas

1. **Tests backend**
   - Eliminar tests que solo aplicaban a SQLite
   - Tests que verificaban dual-mode → simplificar a un solo modo
   - Eliminar `describe.skip` / `it.skip` condicional por `DATABASE_URL`
   - Todos los tests deben correr sin necesidad de variables de entorno
   - El job `test-sqlite` del CI se elimina (solo queda `test-postgres`)

2. **Tests de integración**
   - `dual-backend.test.ts` → renombrar a `postgres-backend.test.ts`
   - Eliminar verificación de mismo shape entre SQLite y PostgreSQL
   - Agregar setup/teardown con `beforeAll` / `afterAll` para pool de PG

3. **Tests frontend**
   - Si se eliminaron clases Bootstrap de componentes, actualizar selectores en tests
   - Si se eliminaron modales Bootstrap, actualizar tests que los referenciaban
   - Verificar que `Footer.test.tsx`, `FaqSection.test.tsx` y `ContactPage.test.tsx` sigan pasando

4. **CI/GitHub Actions**
   - `.github/workflows/test.yml` — eliminar job `test-sqlite`
   - Dejar solo un job `test` que corre contra PostgreSQL (vía service container o Neon)
   - Simplificar matrix/build

5. **Correr suite completa**
   - `npm test` en frontend → todos ✅
   - `npm test` en server → todos ✅ (sin skips)
   - `npm run test:e2e` → todos ✅

### Criterios de aceptación
- [ ] Cero tests skippeados por `DATABASE_URL`
- [ ] `dual-backend.test.ts` reemplazado por `postgres-backend.test.ts`
- [ ] CI con un solo job PostgreSQL
- [ ] Suite completa pasando: 283 frontend + N backend + 36 E2E

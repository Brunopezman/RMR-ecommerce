---
description: Frontend — servicios y contexto de auth extendidos (register + login real + tipos)
agent: feature-dev
---

Ejecutá la Fase 2 del squad sobre este repo.

1. Extendé `src/types/user.ts`:
   - Agregar `apellido: string`, `codigoPostal?: string`, `sexo?: string`, `telefono?: string`
2. Extendé `src/types/auth.ts`:
   - `AuthUser` agregar `id: number | string`, `apellido: string`, `address?: string`, `codigoPostal?: string`, `sexo?: string`, `telefono?: string`
3. Agregá `register()` a `src/services/authService.ts`:
   - POST a `${apiBase}/api/auth/register` con todos los campos + password
   - Guardar token + user completo (con id) en localStorage via `saveAuthState()`
   - Devolver `{ user, token }`
4. Actualizá `login()` en authService:
   - En modo mock: mantener comportamiento actual
   - En modo real: POST a `${apiBase}/api/auth/login`, guardar `id` en localStorage (nueva clave `userId`)
5. Agregá `updateProfile()` a authService → PATCH `/users/:id` con `Authorization` header
6. Agregá `register()` y `updateProfile()` a `src/context/AuthContext.tsx`
7. Actualizá `saveAuthState()` y `loadAuthState()` para persistir/recuperar `id` y nuevos campos
8. Opcional: agregá `loginUser()` en `src/services/api.ts` (si se necesita separado)

Criterio de aceptación:
- `register()` ejecuta POST a `/api/auth/register`, persiste token + user completo en localStorage
- `loadAuthState()` reconstruye `AuthUser` con `id` y todos los campos desde localStorage
- `npm test` pasa sin errores

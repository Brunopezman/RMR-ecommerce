---
description: Backend — infraestructura de auth (bcryptjs + JWT + tabla users extendida + rutas auth)
agent: backend-dev
---

Ejecutá la Fase 1 del squad sobre este repo.

1. Instalá `bcryptjs` y `jsonwebtoken` (con sus @types) en `server/`.
2. Extendé la tabla `users` en `server/src/db.ts`:
   - Agregar columnas: `apellido`, `codigo_postal`, `sexo`, `telefono`, `password_hash`
   - Usar `ALTER TABLE` secuenciales con try/catch por si ya existen.
3. Creá `server/src/routes/auth.ts`:
   - `POST /api/auth/register` — crear usuario con todos los campos + password hasheado (bcryptjs.hashSync), devolver `{ user: {...}, token: jwt }`
   - `POST /api/auth/login` — validar email + password con bcryptjs.compareSync, devolver `{ user: {...}, token: jwt }`
   - Usar `jwt.sign({ userId, email }, SECRET, { expiresIn: '7d' })` donde SECRET viene de `process.env.JWT_SECRET || 'rmr-dev-secret'`
4. Agregá middleware `authenticateToken` en `server/src/middleware/auth.ts` que verifique `Authorization: Bearer <token>`.
5. Montá el auth router en `server/src/index.ts` en `/api/auth`.
6. Actualizá `server/src/routes/users.ts`:
   - `GET /users/:id` — obtener usuario (requiere auth)
   - `PATCH /users/:id` — actualizar perfil (requiere auth, solo el propio usuario)
7. Actualizá `server/src/db.ts` tipo `User` para reflejar nuevos campos.
8. Actualizá `server/src/types.ts` con los campos extendidos.

Criterio de aceptación:
- `curl -X POST http://localhost:4000/api/auth/register` con body JSON crea usuario y devuelve JWT
- `curl -X POST http://localhost:4000/api/auth/login` con credenciales válidas devuelve JWT
- `curl -X POST http://localhost:4000/api/auth/login` con credenciales inválidas devuelve 401
- `GET /users/:id` requiere token válido
- `PATCH /users/:id` actualiza perfil del usuario autenticado

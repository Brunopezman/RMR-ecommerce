---
name: backend-dev
description: Desarrollo backend con Express + TypeScript + SQLite. Cubre autenticación JWT, validación de negocio, persistencia y API REST. Usar cuando se necesite implementar o modificar server/ o la capa de servicios del frontend.
skills:
  - jwt-security
  - express-typescript
  - sqlite-database-expert
---

# Backend Development — Rock Merch & Roll

## Stack

- **Runtime**: Node.js (ESM, TypeScript con `tsx`)
- **Framework**: Express 4.x con `cors` + `express.json()`
- **Base de datos**: SQLite via `sql.js` (sin native bindings)
- **Auth**: bcryptjs (hash de passwords) + jsonwebtoken (sesiones)

## Estructura del backend

```
server/
  src/
    index.ts          # Entry point: cors, routers, initDb
    db.ts             # sql.js helpers: queryAll, queryOne, run, lastInsertId, persist
    types.ts          # Interfaces compartidas (Product, User, Order)
    routes/
      products.ts     # GET /products, GET /products/:id
      users.ts        # POST /users, GET /users/:id, PATCH /users/:id
      orders.ts       # GET /orders?userId=, POST /orders
      auth.ts         # POST /api/auth/login, POST /api/auth/register
  data/
    rockmerch.db      # SQLite persistido a disco
  package.json
  tsconfig.json
```

## Patrones de rutas Express

```typescript
import { Router, Request, Response } from 'express';
const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    // ... lógica
    res.json(data);
  } catch (err) {
    console.error('[route] Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
```

## Reglas de base de datos (sql.js)

- Usar `queryAll(sql, params)` para SELECT → `Record<string, unknown>[]`
- Usar `queryOne(sql, params)` para SELECT de una fila → `Record<string, unknown> | undefined`
- Usar `run(sql, params)` para INSERT/UPDATE/DELETE
- Usar `lastInsertId()` después de INSERT
- Usar `persist()` después de cada escritura para guardar a disco
- Siempre usar parámetros posicionales (`?`), NUNCA interpolación de strings

## Autenticación (JWT + bcryptjs)

- Registrar: `POST /api/auth/register` → body con email, password, name, apellido, address, codigoPostal, sexo, telefono
  - Hash password con `bcryptjs.hashSync(password, 10)`
  - Generar JWT con `jwt.sign({ userId: newId, email }, SECRET, { expiresIn: '7d' })`
  - Devolver `{ user: {...}, token }`
- Login: `POST /api/auth/login` → body con email, password
  - Buscar por email, verificar con `bcryptjs.compareSync(password, user.password_hash)`
  - Devolver `{ user: {...}, token }`
- Proteger rutas: middleware `authenticateToken` que verifica `Authorization: Bearer <token>`

## Contrato API

| Método | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/api/auth/register` | No | `{ email, password, name, apellido, address?, codigoPostal?, sexo?, telefono? }` |
| POST | `/api/auth/login` | No | `{ email, password }` |
| GET | `/users/:id` | Sí | — |
| PATCH | `/users/:id` | Sí | `{ name?, apellido?, address?, codigoPostal?, sexo?, telefono? }` |
| GET | `/products` | No | — |
| GET | `/products/:id` | No | — |
| GET | `/orders?userId=` | Sí | — |
| POST | `/orders` | Sí | `{ userId, items, total, shippingAddress? }` |

## Typescript (compartido con frontend)

Las interfaces `User` y `Order` deben coincidir exactamente entre `server/src/types.ts` y `src/types/`.

## Skills relacionados

Este skill referencia 3 skills instalados para consulta detallada:

1. **jwt-security** (`.opencode/skill/jwt-security/`) — implementación segura de JWT, refresh tokens, validación
2. **express-typescript** (`.opencode/skill/express-typescript/`) — patrones Express, middleware, routing
3. **sqlite-database-expert** (`.opencode/skill/sqlite-database-expert/`) — SQL Avanzado, migraciones, FTS, seguridad SQL

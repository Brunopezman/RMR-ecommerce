# API Contract — Rock Merch & Roll

> **Última actualización:** 2026-07-22
> **Propósito:** Documento de contrato entre frontend y backend. El shape aquí descrito es el que debe respetar tanto la mock API (json-server, Paso A) como la API real (Paso B).

---

## Base URL

| Entorno | URL |
|---|---|
| Mock (json-server) | `http://localhost:3001` |
| Real (backend) | `http://localhost:4000` |

---

## Recursos

### `Product`

Endpoint: `GET /products` → `Product[]`
Endpoint: `GET /products/:id` → `Product`

```typescript
interface Product {
  id: number;
  nombre: string;
  tipo?: string;
  img: string;
  descripcion?: string;
  precio: number;
  stock?: number;
  cantidad?: number;
}
```

**Ejemplo:**
```json
{
  "id": 1,
  "nombre": "Remera The Beatles",
  "tipo": "remera",
  "img": "/img/remerathebeatles.png",
  "descripcion": "The Beatles - negra - lisa",
  "precio": 4000,
  "stock": 10,
  "cantidad": 1
}
```

---

### `User`

Endpoint: `POST /users` → `User`
Endpoint: `GET /users` → `User[]` (requiere auth + role admin)
Endpoint: `GET /users/:id` → `User` (requiere auth, propio usuario)
Endpoint: `PATCH /users/:id` → `User` (requiere auth, propio usuario)

```typescript
interface User {
  id: number | string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  apellido?: string;
  address?: string;
  codigoPostal?: string;
  sexo?: string;
  telefono?: string;
  createdAt?: string;
}
```

**Ejemplo (response GET /users):**
```json
{
  "id": 1,
  "email": "admin@rock.com",
  "name": "Admin",
  "role": "admin",
  "apellido": "",
  "address": null,
  "codigoPostal": "",
  "sexo": "",
  "telefono": "",
  "createdAt": "2026-07-13T12:00:00.000Z"
}
```

---

### `Order`

Endpoint: `GET /orders?userId=:id` → `Order[]`
Endpoint: `POST /orders` → `Order`

```typescript
interface Order {
  id: number;
  userId: number | string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress?: string;
}

interface OrderItem {
  productId: number;
  nombre: string;
  precio: number;
  cantidad: number;
}
```

**Ejemplo (request POST /orders):**
```json
{
  "userId": 1,
  "items": [
    { "productId": 1, "nombre": "Remera The Beatles", "precio": 4000, "cantidad": 2 },
    { "productId": 14, "nombre": "Gorra Nirvana", "precio": 1500, "cantidad": 1 }
  ],
  "total": 9500,
  "shippingAddress": "Av. Siempre Viva 123"
}
```

**Ejemplo (response):**
```json
{
  "id": 1,
  "userId": 1,
  "items": [
    { "productId": 1, "nombre": "Remera The Beatles", "precio": 4000, "cantidad": 2 },
    { "productId": 14, "nombre": "Gorra Nirvana", "precio": 1500, "cantidad": 1 }
  ],
  "total": 9500,
  "status": "pending",
  "createdAt": "2026-07-13T12:00:00.000Z",
  "shippingAddress": "Av. Siempre Viva 123"
}
```

---

## Backend real (Paso B)

El backend real está implementado en `server/` con Express + TypeScript y soporte dual-mode.

### Arranque

```bash
# Modo SQLite (desarrollo local)
npm run server

# Modo PostgreSQL (producción)
export DATABASE_URL=postgresql://user:password@host:5432/db?sslmode=require
export ADMIN_EMAIL=admin@rock.com
npm run server
```

### Conexión del frontend React

Para conectar el frontend React al backend real, cambiar en `src/services/api.ts`:

```typescript
// Antes (mock):
export const BASE_URL = 'http://localhost:3001';

// Después (real):
export const BASE_URL = 'http://localhost:4000';
```

### Base de datos — dual-mode

El backend opera en dos modos según la presencia de la variable `DATABASE_URL`:

| Modo | Driver | Activación |
|---|---|---|
| SQLite (dev) | sql.js | Por defecto (sin `DATABASE_URL`) |
| PostgreSQL (prod) | pg (node-postgres) | `DATABASE_URL` presente en env |

- En modo SQLite: persistencia a disco en `server/data/rockmerch.db`
- En modo PostgreSQL: conexión a Neon o cualquier servidor PostgreSQL 16+
- Migraciones versionadas con tracking en tabla `_migrations`
- Seeding automático desde `data/db.json` al primer inicio en ambos modos

### Esquema de tablas

```sql
products        (id, nombre, tipo, img, descripcion, precio, stock)
users           (id, email, name, address, created_at, apellido, codigo_postal, sexo, telefono, password_hash, role)
orders          (id, user_id, total, status, created_at, shipping_address)
order_items     (id, order_id, product_id, nombre, precio, cantidad)
contact_messages (id, name, email, phone, area, subject, message, created_at)
```

### Endpoint adicional

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/contact` | Enviar mensaje de contacto (requiere `name`, `email`, `area`, `message`) |
| `GET` | `/health` | Health check — retorna `{ "status": "ok", "db": "sqlite" \| "postgresql" }` |

## Reglas de transición a Paso B

1. **Solo cambia `BASE_URL`** en `src/services/api.ts`.
2. Los nombres de campo, tipos y estructura de la respuesta NO cambian.
3. Los endpoints (`/products`, `/users`, `/orders`) se mantienen idénticos.
4. Si el backend real requiere autenticación, se agrega un header `Authorization` sin modificar el contrato de datos.
5. Para modo PostgreSQL: setear `DATABASE_URL` como variable de entorno. El backend lo detecta automáticamente.

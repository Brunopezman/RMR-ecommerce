# API Contract — Rock Merch & Roll

> **Última actualización:** 2026-07-13
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
  cantidad?: number;
}
```

**Ejemplo:**
```json
{
  "id": 1,
  "nombre": "Remera The Beatles",
  "tipo": "remera",
  "img": "../img/remerathebeatles.png",
  "descripcion": "The Beatles - negra - lisa",
  "precio": 4000,
  "cantidad": 1
}
```

---

### `User`

Endpoint: `POST /users` → `User`

```typescript
interface User {
  id: number | string;
  email: string;
  name: string;
  address?: string;
  createdAt?: string;
}
```

**Ejemplo (request):**
```json
{
  "email": "fan@example.com",
  "name": "Rock Fan",
  "address": "Av. Siempre Viva 123"
}
```

**Ejemplo (response):**
```json
{
  "id": 1,
  "email": "fan@example.com",
  "name": "Rock Fan",
  "address": "Av. Siempre Viva 123",
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

El backend real está implementado en `server/` con Express + TypeScript + SQLite (sql.js).

### Arranque

```bash
# Desde la raíz del proyecto
npm run server

# O desde la carpeta server/
cd server && npm run dev
```

### Conexión del frontend React

Para conectar el frontend React al backend real, cambiar en `react/src/services/api.ts`:

```typescript
// Antes (mock):
export const BASE_URL = 'http://localhost:3001';

// Después (real):
export const BASE_URL = 'http://localhost:4000';
```

Y en `react/src/services/productService.ts`:

```typescript
// Antes (mock):
export const PRODUCTS_API_URL = 'http://localhost:3001/products';

// Después (real):
export const PRODUCTS_API_URL = 'http://localhost:4000/products';
```

### Base de datos

El backend usa SQLite (sql.js) con persistencia a disco en `server/data/rockmerch.db`.
Las tablas se crean automáticamente al primer inicio. Los productos se seedan desde
`react/db.json` si la tabla está vacía.

### Esquema de tablas

```sql
products (id, nombre, tipo, img, descripcion, precio)
users    (id, email, name, address, created_at)
orders   (id, user_id, total, status, created_at, shipping_address)
order_items (id, order_id, product_id, nombre, precio, cantidad)
```

## Reglas de transición a Paso B

1. **Solo cambia `BASE_URL`** en `react/src/services/api.ts`.
2. Los nombres de campo, tipos y estructura de la respuesta NO cambian.
3. Los endpoints (`/products`, `/users`, `/orders`) se mantienen idénticos.
4. Si el backend real requiere autenticación, se agrega un header `Authorization` sin modificar el contrato de datos.

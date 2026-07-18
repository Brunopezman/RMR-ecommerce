---
description: Panel admin para gestionar stock de productos — backend + frontend + tests
agent: feature-dev
---

Ejecutá la Fase 5 del squad sobre la branch `feature/admin-stock-management`.

### 5a — Backend: endpoint PATCH /products/:id/stock (a cargo de backend-dev)

1. En `server/src/routes/products.ts`:
   - Agregar `router.patch('/:id/stock', ...)` que:
     - Requiera autenticación via middleware `authenticateToken` y `requireAdmin`
     - Acepte en el body `{ stock: number }`
     - Valide que `stock` sea un número entero >= 0
     - Ejecute `UPDATE products SET stock = ? WHERE id = ?`
     - Retorne el producto actualizado
     - Maneje errores: producto no encontrado (404), stock inválido (400)

2. En `server/src/index.ts`:
   - Verificar que el middleware `express.json()` está presente (ya lo está)

### 5b — Frontend: UI de gestión de stock en AdminPanel (a cargo de feature-dev)

1. En `src/components/admin/AdminPanel.tsx` (o un nuevo componente `src/components/admin/StockManager.tsx`):
   - Agregar una sección "Gestión de Stock" dentro del panel admin
   - Mostrar una tabla con todos los productos (id, nombre, stock actual)
   - Cada fila tiene un input numérico para editar el stock y un botón "Actualizar"
   - Al hacer clic en "Actualizar":
     - Hacer `PATCH /products/:id/stock` con el nuevo valor
     - Mostrar feedback visual (spinner + toast de éxito/error)
     - Actualizar la fila con el nuevo stock sin recargar toda la tabla

2. Consumir el endpoint desde el frontend:
   - Agregar función `updateProductStock(id, stock)` en `src/services/api.ts` que haga `PATCH` con `Authorization: Bearer <token>`

3. Validaciones frontend:
   - Input solo acepta números enteros >= 0
   - Botón deshabilitado si el valor no cambió o es inválido

### 5c — Tests (a cargo de qa)

1. Backend tests:
   - Test que un admin puede actualizar stock exitosamente
   - Test que un usuario no-admin recibe 403
   - Test que stock negativo devuelve 400
   - Test que producto inexistente devuelve 404
   - Test que el stock se persiste correctamente (GET /products/:id lo refleja)

2. Frontend tests:
   - Test que AdminPanel muestra la sección de stock
   - Test que se puede cambiar el stock y enviar el PATCH
   - Test que muestra error si la API falla

3. Correr `npm run test:all` y verificar que siga en verde

### 5d — Cierre

- Verificar que `npm test` y `npm run test:server` corren completos en verde
- Verificar `npx tsc --noEmit` en frontend y server sin errores
- Actualizar `.opencode-handoff.md`
- Commit por cada sub-inciso con mensajes claros

Criterio de aceptación:
- Admin autenticado puede modificar stock desde el panel
- Usuario no-admin recibe 403 si intenta llamar al endpoint
- Stock no puede ser negativo (validado en backend y frontend)
- Feedback visual de éxito/error en la UI
- Todos los tests pasan

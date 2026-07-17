---
description: Checkout + perfil + tests de integración del flujo completo registro → login → compra
agent: feature-dev
---

Ejecutá la Fase 4 del squad sobre este repo.

### 4a — Checkout con datos del usuario

1. En `CheckoutPage.tsx`:
   - Importar `useAuth()`, si `isAuthenticated`:
     - Pre-completar `ccName` con `name + apellido`
     - Pre-completar `direccion` con `address` del usuario
     - Mostrar indicación "Estás comprando como: email"
   - Si no está autenticado: comportamiento actual (campos vacíos)

### 4b — Tests (a cargo de qa)

1. Unitarios:
   - `authService.register()` con mock fetch → verifica POST + persistencia
   - `authService.login()` en modo real → verifica POST + persistencia de `id`
   - `AuthContext.register()` → verifica que actualiza estado correctamente
2. Integración:
   - `LoginModal` renderiza formulario de registro en modo register
   - Validación de campos: password corto, email inválido, mismatch confirmación
   - Submit exitoso de registro → modal se cierra, usuario autenticado
   - Toggle login ↔ register mantiene estado limpio
3. E2E (Playwright):
   - Flujo: abrir modal → toggle a registro → completar formulario → submit → verificar autenticación
   - Flujo: registro → cerrar sesión → login con credenciales creadas

### 4c — Limpieza final

- Verificar que `npm test` corre completo en verde (193 unitarios + nuevos)
- Verificar `npm run test:e2e` corre completo (31 + nuevos)
- Actualizar `.opencode-handoff.md`
- Commit por cada sub-inciso

Criterio de aceptación:
- Checkout pre-carga datos del usuario autenticado
- Tests unitarios nuevos pasan
- Tests E2E del flujo registro→login→checkout pasan
- `npm test` y `npm run test:e2e` en verde

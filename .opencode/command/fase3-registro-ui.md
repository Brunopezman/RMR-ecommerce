---
description: Frontend — UI de registro con formulario completo y toggle login/register
agent: feature-dev
---

Ejecutá la Fase 3 del squad sobre este repo.

1. Refactorizá `src/components/auth/LoginModal.tsx` para soportar dos modos:
   - `modo = 'login'` — formulario actual (email + password) + link "¿No tenés cuenta? Crear una"
   - `modo = 'register'` — nuevo formulario con:
     - Nombre, Apellido, Email
     - Contraseña + Confirmar contraseña
     - Dirección, Código Postal
     - Sexo (select: Masculino / Femenino / Otro / Prefiero no decirlo)
     - Teléfono
     - Link "Ya tengo cuenta, iniciar sesión"
2. Implementá validación de formulario:
   - Email formato válido
   - Password >= 6 caracteres
   - Confirmación de password coincide
   - Nombre y Apellido requeridos
   - Mostrar errores inline por campo
3. Al submit en modo registro:
   - Llamar a `register()` del `AuthContext` con todos los campos
   - Si éxito: cerrar modal, el usuario queda autenticado
   - Si error (ej: email ya registrado): mostrar error inline
4. Mantener comportamiento actual del login (no romper funcionalidad existente)
5. El modal debe:
   - Resetear errores al cambiar de modo
   - Enfocar el primer campo al abrir
   - Mantener focus trap y cierre con Escape/backdrop

Criterio de aceptación:
- Modal tiene dos vistas toggleables con link
- Registro exitoso → usuario autenticado → modal se cierra
- Errores de validación se muestran inline
- Login existente sigue funcionando igual
- `npm test` pasa

---
description: "F4 — UX copy, estados vacíos y responsive polish"
agent: ui-ux
---

## Fase 4 — UX Copy, Estados Vacíos y Polish Responsive

### Objetivo
Mejorar la experiencia de usuario con textos claros, buenos estados vacíos/de error, capability transparency, y pulido responsive para móviles.

### Tareas

1. **Revisar y reescribir UX copy (sin emojis)**
   - Mensaje de bienvenida: claro, directo, sin emojis
     - Antes: "¡Hola! Soy tu **Asistente de Compra**..."
     - Después: texto limpio enumerando capacidades con viñetas `•`
   - Mensajes de ayuda: estructura clara, categorías con viñetas
   - Mensajes de error: amigables pero sin emojis
   - Confirmación de add-to-cart: "Agregado: [producto] ($[precio]) al carrito"
   - Revisar `formatSearchResponse` para que use viñetas en vez de números

2. **Capability transparency**
   - En el mensaje de bienvenida, listar claramente 3-4 cosas que el bot SÍ puede hacer
   - Agregar un footer sutíl en el input: "Presioná Enter para enviar"
   - Placeholder del input más descriptivo: "Buscá productos, ej: remeras económicas"

3. **Estados de carga y error**
   - **Catálogo cargando**: FAB visible pero con indicator de que no está listo (dot gris + texto "Conectando...")
   - **Catálogo falló**: Mensaje amigable, ofrecer recarga manual, no dejar el input deshabilitado para siempre
   - **Red offine**: Detectar `navigator.onLine` y mostrar mensaje específico
   - **Error en búsqueda**: Mensaje claro, sugerir reformular

4. **Empty states**
   - **Sin resultados de búsqueda**: "No encontré productos con esos criterios. Algunas ideas:"
     - Mostrar 2-3 chips con sugerencias de búsquedas populares
   - **Chat vacío**: Ya cubierto por bienvenida, pero asegurar que no se ve raro

5. **Responsive polish fino**
   - Probar visualmente en 320px, 375px, 768px, 1024px
   - En mobile: asegurar que el input no se tapa con el teclado virtual
   - En mobile: reducir padding del panel a `px-3` (vs `px-4` en desktop)
   - En desktop: el panel puede ser un poco más ancho (`w-96` → `md:w-[420px]`)
   - Altura: en mobile que no exceda `85vh`, en desktop `600px`

6. **Accessibility check básico**
   - `aria-label` en todos los botones (ya existen, verificar que sean descriptivos)
   - `role="dialog"` y `aria-label="Chat de ventas"` (ya existe)
   - Focus trap dentro del panel cuando está abierto (Tab no sale del panel)
   - Cerrar con Escape
   - Contraste suficiente en todos los textos

### Criterios de aceptación

- [ ] Todos los textos del concierge sin emojis, con viñetas claras
- [ ] Placeholder del input descriptivo
- [ ] Mensaje de error amigable cuando el catálogo no carga
- [ ] Chips de sugerencias en estado "sin resultados"
- [ ] Panel se ve bien en 320px, 375px, 768px, 1024px
- [ ] Se cierra con tecla Escape
- [ ] Focus trap dentro del panel
- [ ] `npm test` pasa completo
- [ ] `npx tsc --noEmit` sin errores

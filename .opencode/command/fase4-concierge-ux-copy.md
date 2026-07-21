---
description: "✅ COMPLETADA — UX copy, estados vacíos y responsive polish"
agent: ui-ux
---

Esta fase fue completada exitosamente.

## Resultado

- **304 tests pasan** ✅
- **0 errores TypeScript** ✅

### Archivos modificados
- `src/hooks/useConcierge.ts` — welcome, greeting, formatSearchResponse con viñetas `•`
- `src/components/chat/ShoppingConcierge.tsx` — placeholder, footer hint, empty state con spinner, responsive widths, Escape key, aria-labels

### Detalle
- Copy mejorada: welcome con "esto es lo que puedo hacer", "decime", "hoy"
- Viñetas `•` en resultados de búsqueda en vez de números
- Placeholder más descriptivo: "Buscá productos, ej: remeras económicas"
- Footer hint: "Presioná Enter para enviar"
- Empty state con spinner si catálogo cargando
- Panel más ancho en desktop (md:w-[420px])
- Padding responsive (px-3 sm:px-4)
- Cerrar con Escape
- aria-label en chips, aria-hidden en dot de status

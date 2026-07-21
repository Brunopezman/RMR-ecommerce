---
description: "F3 — Animaciones y micro-interacciones del concierge"
agent: ui-ux
---

## Fase 3 — Animaciones y Micro-interacciones

### Objetivo
Agregar animaciones suaves y feedback visual en todas las interacciones del concierge: apertura/cierre del panel, aparición de mensajes, typing indicator, y transiciones de estado.

### Tareas

1. **Animación de apertura/cierre del panel**
   - Reemplazar el montaje condicional (`{isOpen && (...)}`) por animación con CSS `transition`
   - Usar un contenedor con `opacity` + `transform: translateY(20px)` → `translateY(0)`
   - Duración: 300ms, easing `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo)
   - Al cerrar: fade out + slide down
   - Implementar con un wrapper que tenga `transition-all duration-300 ease-out`

2. **Animación de aparición de mensajes**
   - Cada nuevo mensaje (usuario y asistente) aparece con fade-in + sutil slide-up
   - `animate-[fadeIn_0.3s_ease-out]` o clase `animate-slide-up`
   - Definir keyframes en el CSS global o Tailwind config:
     ```css
     @keyframes slide-up {
       from { opacity: 0; transform: translateY(12px); }
       to { opacity: 1; transform: translateY(0); }
     }
     ```
   - Usuario: `animation-delay: 0ms`
   - Asistente: `animation-delay: 100ms` (aparece después)

3. **Mejorar Typing Indicator**
   - Mantener 3 dots animados pero con colores coral en vez de gray-400
   - Dots más grandes: `w-2.5 h-2.5`
   - Animación más fluida (bounce con escala, no solo translateY)
   - Asegurar que el typing indicator no hace scroll brusco

4. **FAB micro-interacciones**
   - Escala suave en hover (`hover:scale-110`) ya existe, mantener
   - En open: rotación del ícono (chat → X) con `rotate-90` transition
   - Sutil glow/pulse animado cuando hay mensajes no leídos

5. **Scroll suave automático**
   - Al aparecer nuevo mensaje o typing indicator, scroll suave al fondo
   - Usar `scrollIntoView({ behavior: 'smooth', block: 'end' })` (ya existe, verificar)
   - Si existe, asegurar que funciona con las nuevas animaciones (timing correcto)

6. **Transición de chips de sugerencias**
   - Chips aparecen con stagger delay (50ms entre cada uno)
   - Cada chip hace fade-in + slide-up desde abajo

### Criterios de aceptación

- [ ] Panel se abre con animación fade + slide (300ms, ease-out-expo)
- [ ] Panel se cierra con animación inversa antes de desmontar
- [ ] Cada mensaje nuevo aparece con fade-in + slide-up
- [ ] Typing indicator con dots coral, animación fluida, sin scroll brusco
- [ ] FAB rota su ícono al abrir/cerrar chat
- [ ] Chips de sugerencias con stagger animation
- [ ] `npm test` pasa completo
- [ ] `npx tsc --noEmit` sin errores

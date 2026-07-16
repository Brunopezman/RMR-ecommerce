---
name: ui-ux-review
description: Usar cuando se necesite revisar la interfaz de usuario, consistencia visual, jerarquía, espaciado, alineación y micro-interacciones. Trigger en 'revisar UI', 'review visual', 'consistencia', 'mejorar interfaz'.
---

# Revisión de UI/UX

## Áreas de inspección

### 1. Consistencia visual
- Mismos tamaños de fuente para elementos equivalentes (h1, h2, body, button).
- Espaciados uniformes (padding, margin, gap) — preferí usar espaciados de la escala de Tailwind.
- Bordes y border-radius consistentes en componentes similares.
- Paleta de colores respetada (primary, secondary, accent, neutral).
- Hover, focus, active states definidos en todos los interactivos.

### 2. Jerarquía visual
- El contenido más importante debe ser visualmente dominante (tamaño, peso, contraste).
- Espaciado entre secciones debe reflejar su relación semántica.
- CTAs principales deben destacar sobre acciones secundarias.
- Uso de color para atraer atención, no solo decoración.

### 3. Micro-interacciones
- Feedback visual inmediato en hover (sombra, escala, color).
- Transiciones suaves en apertura/cierre de modales y menús.
- Loading states en todas las operaciones asíncronas.
- Animaciones con `transition` de Tailwind, duración 150-300ms.

### 4. Alignment y grilla
- Elementos alineados a una grilla invisible consistente.
- Márgenes y paddings laterales uniformes en toda la app.
- Texto alineado consistentemente (izquierda en layouts de lectura, centro en hero banners).

## Checklist de revisión

- [ ] Paleta de colores coherente en toda la app.
- [ ] Tipografía consistente (tamaños, pesos, line-height).
- [ ] Espaciados uniformes entre componentes equivalentes.
- [ ] Hover/focus/active en botones, links, inputs.
- [ ] CTAs primarios claramente distinguibles de secundarios.
- [ ] Transiciones suaves (150-300ms) en interactivos.
- [ ] Loading/skeleton states visibles mientras se carga data.
- [ ] Sin superposiciones ni elementos cortados en ningún viewport.
- [ ] Feedback visual en acciones del usuario (add to cart, submit, error).
- [ ] Sin fugas de estilo inline o CSS global no controlado.

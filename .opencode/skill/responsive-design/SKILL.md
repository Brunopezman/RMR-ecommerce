---
name: responsive-design
description: Usar cuando se necesite verificar o implementar diseño responsive Mobile-First. Trigger en 'responsive', 'adaptar a mobile', 'breakpoints', 'viewport', '320px'.
---

# Diseño Responsive Mobile-First

## Filosofía

Diseñar primero para mobile (320px), luego escalar hacia arriba. Cada breakpoint resuelve restricciones del viewport anterior.

## Breakpoints recomendados (Tailwind)

| Alias | Min-width | Target |
|---|---|---|
| `(base)` | 0 | Mobile portrait |
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop wide |

## Patrones Mobile-First

### Grilla responsive
```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
```

### Layout de navegación
- Mobile: hamburger menu (oculto, toggle con JS).
- Tablet+: menú horizontal visible.

### Cards y listas
- Mobile: stack vertical (1 columna).
- Tablet: 2 columnas.
- Desktop: 3-4 columnas según contenido.

## Checklist de verificación

- [ ] La app funciona en 320px sin scroll horizontal.
- [ ] Todos los botones/links son tappables (≥ 44×44px).
- [ ] Texto legible sin zoom en mobile (≥ 16px body).
- [ ] Navegación usable en mobile (hamburger o similar).
- [ ] Imágenes adaptativas (max-width: 100%).
- [ ] Tablas con scroll horizontal en mobile.
- [ ] Formularios full-width en mobile.
- [ ] Modales ocupan el viewport completo en mobile.
- [ ] Sin contenido cortado ni superpuesto en ningún breakpoint.
- [ ] Touch targets con espaciado suficiente (≥ 8px entre elementos).

## Viewports a probar
- 320×568 (iPhone SE)
- 375×667 (iPhone 6/7/8)
- 768×1024 (iPad)
- 1024×768 (iPad landscape)
- 1280×720 (Desktop HD)
- 1920×1080 (Full HD)

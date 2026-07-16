---
name: accessibility
description: Usar cuando se necesite auditar o corregir accesibilidad web (WCAG 2.2). Trigger en 'auditar accesibilidad', 'WCAG', 'contraste', 'ARIA', 'navegación por teclado', 'a11y'.
---

# Accesibilidad Web (WCAG 2.2) — Nivel AA

## Principios y pautas

### Perceptible
- **Contraste de color**:
  - Texto normal: ≥ 4.5:1 sobre fondo.
  - Texto grande (≥18px bold o ≥24px): ≥ 3:1.
  - Componentes UI (bordes de input, iconos): ≥ 3:1.
- **Text alternatives** (`alt`) en todas las imágenes decorativas (alt="") e informativas.
- **Subtítulos** en contenido multimedia.

### Operable
- **Teclado**: Toda funcionalidad operable sin mouse.
- **Skip link**: Enlace "Saltar al contenido" como primer elemento focusable.
- **Foco visible**: Outline claro en `:focus-visible` (nunca `outline: none` sin reemplazo).
- **Trampas de foco**: Modales y flyouts deben atrapar y liberar el foco correctamente.
- **Target size**: Elementos clickeables ≥ 24×24px (ideal 44×44px).

### Comprensible
- **Labels**: Todo `<input>`, `<select>`, `<textarea>` con `<label>` asociado.
- **Mensajes de error**: Claros, específicos, visibles cerca del campo.
- **Idioma**: `<html lang="es">` y `lang` en contenido en otros idiomas.

### Robusto
- **Rol ARIA**: Cuando el HTML nativo no alcanza. Preferir HTML semántico sobre ARIA.
- **Landmarks**: `<nav>`, `<main>`, `<aside>`, `<footer>` correctamente anidados.
- **Anuncios dinámicos**: `aria-live` en regiones que se actualizan sin recarga.

## Checklist de verificación

- [ ] `lang="es"` en `<html>`.
- [ ] Alt text relevante en imágenes, alt="" en decorativas.
- [ ] Skip link como primer elemento focusable.
- [ ] Navegación completa por teclado (Tab, Enter, Escape).
- [ ] Foco visible (`:focus-visible`) en todos los elementos.
- [ ] Contraste de color ≥ 4.5:1 en textos.
- [ ] Labels en todos los inputs de formulario.
- [ ] Mensajes de error asociados al campo.
- [ ] Rol ARIA correcto en modales (`dialog`, `aria-modal`).
- [ ] Landmarks semánticos (`<main>`, `<nav>`, etc.).
- [ ] `aria-live` en regiones dinámicas (carrito, alertas).
- [ ] Modales atrapan el foco y lo restauran al cerrarse.

## Herramientas recomendadas
- axe DevTools — auditoría automatizada en Chrome.
- Lighthouse → Accessibility section.
- NVDA (Windows) / VoiceOver (macOS) — prueba manual con lector de pantalla.
- Navegación por teclado — Tab + Shift+Tab + Enter + Escape + Arrow keys.

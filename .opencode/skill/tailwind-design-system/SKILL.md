---
name: tailwind-design-system
description: Usar cuando se necesite definir o mantener un sistema de diseño estructurado con Tailwind CSS. Trigger en 'sistema de diseño', 'tailwind design tokens', 'componentes base'.
---

# Sistema de Diseño con Tailwind CSS

## Principios

- Utility-first: componer desde clases atómicas, no desde CSS personalizado.
- Consistencia a través de la configuración de Tailwind, no de reglas CSS ad-hoc.
- Design tokens centralizados en `tailwind.config.js`.

## Configuración de tokens

```js
// tailwind.config.js — personalización recomendada
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { /* paleta */ },
        secondary: { /* paleta */ },
        accent: { /* paleta */ },
        neutral: { /* paleta */ },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        // Mantener escala consistente: 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16
      },
      borderRadius: {
        // Valores fijos: sm, md, lg, xl, full
      },
    },
  },
}
```

## Patrones de componentes

### Botones
```
<button class="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition">
<button class="bg-transparent border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition">
<button class="text-primary hover:underline px-2 py-1">
```

### Cards
```
<div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
```

### Form inputs
```
<input class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none">
```

## Reglas

1. No usar CSS personalizado salvo animaciones complejas o keyframes.
2. Extraer a componentes en `components/ui/` si 3+ repeticiones.
3. Usar `@apply` solo en componentes base globales, nunca en estilos de página.
4. `transition` en todos los interactivos (150-200ms, ease-in-out).
5. Mobile-First: clases base sin prefijo, variantes `sm:`, `md:`, `lg:` para breakpoints.

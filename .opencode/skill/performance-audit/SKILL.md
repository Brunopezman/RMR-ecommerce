---
name: performance-audit
description: Usar cuando se necesite auditar el rendimiento frontend: Web Vitals, bundle size, lazy loading, optimización de assets. Trigger en 'auditar performance', 'Web Vitals', 'Lighthouse', 'bundle size', 'carga lenta'.
---

# Performance Audit — Frontend

## Métricas clave (Web Vitals)

| Métrica | Qué mide | Bueno | Regular | Malo |
|---|---|---|---|---|
| LCP | Carga del contenido principal | ≤ 2.5s | ≤ 4.0s | > 4.0s |
| FID / INP | Responsividad a interacción | ≤ 100ms | ≤ 300ms | > 300ms |
| CLS | Estabilidad visual | ≤ 0.1 | ≤ 0.25 | > 0.25 |

## Áreas de auditoría

### 1. Bundle size
- Verificar tamaño de JS bundles (`vite build` → `dist/`).
- Identificar dependencias pesadas con `rollup-plugin-visualizer` o analizando `dist/`.
- Code splitting: `React.lazy()` para rutas que no están en la vista inicial.
- Tree shaking: imports nombrados, no `import *` de librerías grandes.

### 2. Assets
- Imágenes en formato moderno (WebP, AVIF).
- Lazy loading con `loading="lazy"` en imágenes below the fold.
- Dimensiones explícitas en `<img>` para evitar CLS.
- SVG inline para iconos pequeños.
- Fuentes: `font-display: swap` para evitar FOIT/FOUT.

### 3. Renderizado
- Evitar re-renders innecesarios (key correctos, memoización justificada).
- `useEffect` con dependencias explícitas, sin correr en cada render.
- Virtual scrolling para listas largas.

### 4. Red
- Minificación y compresión (gzip / brotli).
- CDN para assets estáticos.
- Preconnect / prefetch para recursos críticos de terceros.
- HTTP caching headers para JS/CSS versionados.

## Checklist de auditoría

- [ ] `npm run build` produce bundles razonables (< 200kB JS gzip).
- [ ] Imágenes en WebP con fallback.
- [ ] `loading="lazy"` en imágenes no críticas.
- [ ] Dimensiones en todas las imágenes (width/height).
- [ ] Lazy loading de rutas con `React.lazy`.
- [ ] Sin `useEffect` innecesarios o sin deps.
- [ ] Fuentes con `font-display: swap`.
- [ ] CLS ≤ 0.1 en Lighthouse.
- [ ] LCP ≤ 2.5s en 3G simulado.
- [ ] Sin dependencias duplicadas en el bundle.

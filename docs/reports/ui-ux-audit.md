# Auditoría UI/UX + Accesibilidad — Rock Merch & Roll

**Fecha:** 2026-07-15  
**Auditor:** ui-ux agent  
**Skills aplicados:** `ui-ux-review`, `accessibility`, `responsive-design`, `tailwind-design-system`, `ux-writing`  
**Alcance:** `index.html`, `src/App.tsx`, todos los componentes en `src/components/`, `pages/checkout.html`, `pages/shop.html`, `src/index.css`, `tailwind.config.js`

---

## Resumen ejecutivo

Se auditaron **12 archivos** entre componentes React, HTML legacy, CSS y configuración. Se identificaron **28 hallazgos** (17 UI/UX + 11 accesibilidad). El sitio tiene una base sólida con micro-interacciones en botones y navegación, pero presenta problemas de **consistencia de frameworks CSS**, **mezcla de Bootstrap y Tailwind**, **accesibilidad de teclado** y **contraste de color** que deben priorizarse.

---

## Hallazgos de UI/UX

### 1. Consistencia visual

| # | Hallazgo | Archivo(s) | Severidad |
|---|---|---|---|
| **UX-01** | **Doble framework CSS: Bootstrap + Tailwind.** El `index.html` carga Bootstrap 5 (CSS + JS) mientras los componentes React usan mayormente Tailwind. Esto genera conflictos de estilo, pesos específicos duplicados y clases redundantes. Ej: `navbar navbar-expand-lg navbar-light` (BS) combinado con `flex items-center justify-between` (TW). | `index.html:19-26`, `App.tsx:49` | 🔴 Alta |
| **UX-02** | **Tamaños de fuente definidos en CSS personalizado en vez de Tailwind.** `index.css` define h1–h5 con valores fijos. Algunos componentes usan `text-2xl`, `text-lg` de Tailwind, generando duplicación. | `index.css:11-15` | 🟡 Media |
| **UX-03** | **Mezcla de clases Bootstrap y Tailwind en el mismo elemento.** El `<nav>` en `App.tsx` usa `navbar navbar-expand-lg navbar-light bg-white shadow-md sticky top-0 left-0 z-40` — las primeras 4 son de Bootstrap, el resto de Tailwind. | `App.tsx:49` | 🔴 Alta |
| **UX-04** | **IDs duplicados.** `id="title"` aparece tanto en el `<h1>` del Header (línea 53) como en el `<h1>` del HeroSection (línea 214). `id="bar"` aparece en el navbar-toggler y en iconos legacy. | `App.tsx:53,214`, `index.html` | 🟡 Media |
| **UX-05** | **Bordes y border-radius inconsistentes.** Botones tipo CTA usan `rounded`, `rounded-lg`, `rounded-md`, `rounded-xl` en distintos componentes sin un criterio unificado. | Múltiples componentes | 🟡 Media |
| **UX-06** | **Inconsistencia en hover de íconos sociales del footer.** Usan `style={{ lineHeight: '38px' }}` inline en vez de clases Tailwind. Además, el hover cambia a `bg-coral` sin transición suave definida en el inline style (solo en la clase `transition-colors duration-300`). | `App.tsx:388-396` | 🟢 Baja |

### 2. Jerarquía visual

| # | Hallazgo | Archivo(s) | Severidad |
|---|---|---|---|
| **UX-07** | **Salto de jerarquía heading.** HeroSection usa `<h1>` para "Rock Merch & Roll" y `<h5>` para "Contenido para fanáticos", saltándose h2–h4. Semánticamente incorrecto. | `App.tsx:214-218` | 🟡 Media |
| **UX-08** | **Uso semántico incorrecto de h5 para párrafo.** En `ProductsSection`, la descripción "Aca vas a poder observar los produtos..." está en un `<h5>` cuando debería ser un `<p>`. | `App.tsx:319-321` | 🟡 Media |
| **UX-09** | **CTAs principales no se distinguen claramente de secundarios.** "Limpiar carrito" usa el mismo ancho completo que "Finalizar Compra", solo diferenciado por color. Un CTA secundario debería ser visualmente menos prominente. | `CartModal.tsx:51-65` | 🟢 Baja |

### 3. Micro-interacciones

| # | Hallazgo | Archivo(s) | Severidad |
|---|---|---|---|
| **UX-10** | **Sin feedback visual al agregar al carrito.** No hay toast, tooltip ni animación que confirme la acción. El código tiene `// TODO: show toastify notification`. | `CartModal.tsx:16` | 🟡 Media |
| **UX-11** | **Sin loading spinner en submit de checkout.** El `setTimeout` de 2s simula procesamiento pero el botón no muestra estado de carga ni se deshabilita. El usuario puede hacer clic múltiples veces. | `CheckoutPage.tsx:88-92` | 🟡 Media |
| **UX-12** | **Transiciones suaves implementadas correctamente en la mayoría de botones** (`transition-colors duration-300`). Especialmente bien resuelto en ShoppingConcierge FAB con `hover:scale-110 active:scale-95`. | `ShoppingConcierge.tsx:169` | ✅ Bueno |
| **UX-13** | **CartModal usa transiciones CSS para aparecer/desaparecer** (opacity + visibility + margin-top con 0.5s). Correcto, pero `transition: all 0.5s` es demasiado lento para la sensación moderna (150-300ms ideal). | `index.css:60-84` | 🟢 Baja |

### 4. Grilla y espaciado

| # | Hallazgo | Archivo(s) | Severidad |
|---|---|---|---|
| **UX-14** | **Mezcla de sistemas de grilla.** ProductGrid usa `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6` (Tailwind). CheckoutPage usa `row` / `col-md-*` (Bootstrap). Sin consistencia. | `ProductGrid.tsx:41`, `CheckoutPage.tsx:221-252` | 🟡 Media |
| **UX-15** | **Espaciado lateral inconsistente entre secciones.** HeroSection usa `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`. BannerServices usa `container mx-auto px-4` (Bootstrap container tiene su propio padding). | `App.tsx:213,234` | 🟢 Baja |

### 5. Responsive

| # | Hallazgo | Archivo(s) | Severidad |
|---|---|---|---|
| **UX-16** | **Navbar toggle en mobile funciona manipulando clases manualmente** (`classList.toggle('hidden')`). Bootstrap ya tiene `data-bs-toggle="collapse"` — se está duplicando la lógica. | `App.tsx:62-72` | 🟡 Media |
| **UX-17** | **ProductCard sin variantas responsive.** La imagen usa `w-full h-48 object-cover` fijo. En mobile 320px, `h-48` (192px) puede ser excesivo para el ancho limitado. | `ProductCard.tsx:13` | 🟢 Baja |

---

## Hallazgos de Accesibilidad (WCAG 2.2 Nivel AA)

### A. Perceptible

| # | Hallazgo | Principio | Severidad |
|---|---|---|---|
| **A11Y-01** | **`lang="en"` en lugar de `lang="es"`.** Todo el contenido está en español, pero `<html lang="en">`. Esto afecta lectores de pantalla que aplicarían pronunciación en inglés. | 3.1.1 Idioma | 🔴 Alta |
| **A11Y-02** | **Contraste insuficiente del color coral (`rgb(245,146,109)`) sobre fondo blanco.** Ratio ~2.3:1, no alcanza 4.5:1 para texto normal ni 3:1 para texto grande. Se usa en hover de links y badges. | 1.4.3 Contraste | 🟡 Media |
| **A11Y-03** | **Iconos decorativos sin `aria-hidden="true"`.** Los `<i>` de Boxicons/Bootstrap Icons en navegación, footer, y botones no tienen `aria-hidden`, por lo que lectores de pantalla los leerán como "bx bxs-truck" etc. | 1.1.1 Contenido no textual | 🟡 Media |
| **A11Y-04** | **Imagen de fondo del HeroSection sin alternativa textual.** El fondo `url(/img/fondo-home.jpg)` es puramente decorativo, correcto. Pero la hero section no tiene un `role="img"` ni `aria-label` descriptivo. | 1.1.1 Alternativas textuales | 🟢 Baja |

### B. Operable

| # | Hallazgo | Principio | Severidad |
|---|---|---|---|
| **A11Y-05** | **Sin skip link.** No hay un enlace "Saltar al contenido" al inicio de la página, obligando a usuarios de teclado a tabular toda la navegación. | 2.4.1 Saltar bloques | 🔴 Alta |
| **A11Y-06** | **Foco visible no garantizado.** Hay múltiples usos de `outline: none` / `outline-none` (navbar-toggler, varios botones) sin proporcionar un reemplazo `:focus-visible` visible. | 2.4.7 Foco visible | 🟡 Media |
| **A11Y-07** | **Modales sin trapping de foco.** `LoginModal` y `CartModal` (versión React) no atrapan el foco: al tabular, el foco sale del modal al fondo de la página. Tampoco restauran el foco al cerrarse. | 2.1.2 Sin trampas | 🔴 Alta |
| **A11Y-08** | **Target size insuficiente en iconos clickeables.** Botones como el cerrar carrito (`<i className="bx bxs-x-circle" />`), logout trigger, y botón eliminar item tienen targets < 44×44px. | 2.5.8 Tamaño de objetivo (AA) | 🟡 Media |
| **A11Y-09** | **CartItemRow: botón eliminar sin aria-label.** El `<button>` solo contiene un `<i>` icono, sin texto accesible ni `aria-label`. | 2.1.1 Teclado / 4.1.2 Nombre | 🟡 Media |

### C. Comprensible

| # | Hallazgo | Principio | Severidad |
|---|---|---|---|
| **A11Y-10** | **Sin región `aria-live` para contenido dinámico.** El carrito, los mensajes de error del login, y el chat del concierge no tienen `aria-live="polite"`. Los cambios no se anuncian a lectores de pantalla. | 4.1.3 Mensajes de estado | 🟡 Media |
| **A11Y-11** | **Checkout: Sin `<main>` landmark.** No hay un elemento `<main>` que delimite el contenido principal de la página en el routing de React. | 4.1.2 Roles ARIA | 🟢 Baja |

### D. ARIA y landmarks

| # | Hallazgo | Archivo(s) | Severidad |
|---|---|---|---|
| **A11Y-12** | **LoginModal: `aria-modal` no definido.** Usa `role="dialog"` pero no incluye `aria-modal="true"` ni `aria-labelledby` apuntando al título. | `LoginModal.tsx:42-44` | 🟡 Media |
| **A11Y-13** | **CartModal: mismo problema que LoginModal.** `role="dialog"` sin `aria-modal` ni `aria-labelledby`. El backdrop `onClick={onClose}` puede cerrar el modal involuntariamente. | `CartModal.tsx:23-27` | 🟡 Media |
| **A11Y-14** | **ShoppingConcierge: el panel de chat no tiene `role="complementary"` o `role="dialog"`.** No se identifica como un punto de referencia para navegación por landmarks. | `ShoppingConcierge.tsx:186-188` | 🟢 Baja |

---

## Hallazgos de UX Writing (Microcopy)

| # | Hallazgo | Texto actual | Texto recomendado | Severidad |
|---|---|---|---|---|
| **COPY-01** | **Typos en ProductsSection** | "Aca vas a poder observar los produtos" | "Acá vas a poder ver los productos con los mejores precios de la temporada." | 🟡 Media |
| **COPY-02** | **Mensaje carrito vacío sin tono de marca** | "El carrito está vacío" | "Tu carrito está vacío. Explorá nuestro catálogo y llevate algo piola." | 🟢 Baja |
| **COPY-03** | **Logout modal en tono formal ("Desea")** | "¿Desea cerrar sesión?" | "¿Querés cerrar sesión?" (consistente con tono "vos") | 🟢 Baja |
| **COPY-04** | **Hero CTA podría ser más descriptivo** | "Compra Ahora" | "Ver Productos" o "Comprar ahora" (sutil, minúscula, más natural) | 🟢 Baja |
| **COPY-05** | **Año del copyright desactualizado** | "© 2022" | "© 2026" | 🟢 Baja |

---

## Recomendaciones priorizadas

### 🔴 Alta prioridad (impacto en accesibilidad y experiencia crítica)

| # | Recomendación | Hallazgos relacionados | Esfuerzo |
|---|---|---|---|
| R1 | **Agregar skip link** como primer elemento focusable en `App.tsx` antes del `<Router>`. | A11Y-05 | Bajo |
| R2 | **Implementar focus trapping en modales** (LoginModal, CartModal). Usar `useEffect` para mover foco al abrir y restaurarlo al cerrar. | A11Y-07, A11Y-12, A11Y-13 | Medio |
| R3 | **Cambiar `lang="en"` a `lang="es"`** en `index.html`. | A11Y-01 | Bajo |
| R4 | **Eliminar dependencia de Bootstrap CSS/JS** del `index.html`. Migrar completamente a Tailwind. Eliminar clases Bootstrap de los componentes React. | UX-01, UX-03, UX-14 | Alto |
| R5 | **Agregar feedback visual al agregar al carrito** (toast/notificación). | UX-10 | Medio |

### 🟡 Media prioridad

| # | Recomendación | Hallazgos relacionados | Esfuerzo |
|---|---|---|---|
| R6 | **Agregar `aria-live="polite"` en regiones dinámicas**: contador del carrito, área de mensajes del chat, mensajes de error del login. | A11Y-10 | Bajo |
| R7 | **Asegurar foco visible en todos los elementos interactivos.** Reemplazar `outline-none` por `focus-visible:ring-2 focus-visible:ring-coral`. | A11Y-06 | Bajo |
| R8 | **Agregar `aria-label` a botones icon-only**: eliminar item del carrito, cerrar carrito, logout, redes sociales. | A11Y-09, A11Y-03 | Bajo |
| R9 | **Corregir jerarquía de headings**: HeroSection (h1 → h2 para el tagline), ProductsSection (h5 → p). | UX-07, UX-08 | Bajo |
| R10 | **Unificar IDs duplicados**: `#title`, `#bar`. | UX-04 | Bajo |
| R11 | **Agregar loading state al submit del checkout** (deshabilitar botón + spinner). | UX-11 | Bajo |
| R12 | **Aumentar target size de iconos clickeables** a mínimo 44×44px con padding adecuado. | A11Y-08 | Medio |
| R13 | **Agregar `aria-modal="true"` y `aria-labelledby` a modales** apuntando a sus títulos. | A11Y-12, A11Y-13 | Bajo |
| R14 | **Corregir typos en ProductsSection** y revisar microcopy general. | COPY-01 | Bajo |

### 🟢 Baja prioridad

| # | Recomendación | Hallazgos relacionados | Esfuerzo |
|---|---|---|---|
| R15 | **Agregar `role="complementary"` o `role="dialog"` al panel del concierge.** | A11Y-14 | Bajo |
| R16 | **Normalizar border-radius** en componentes: elegir un valor fijo (ej: `rounded-lg`) para todos los botones CTA. | UX-05 | Bajo |
| R17 | **Mejorar contraste del color coral** usándolo solo para acentos grandes (>24px) o backgrounds, no para texto. | A11Y-02 | Medio |
| R18 | **Actualizar año del copyright** a 2026. | COPY-05 | Bajo |
| R19 | **Revisar velocidad de transición del CartModal** (cambiar de 0.5s a 0.2-0.3s). | UX-13 | Bajo |
| R20 | **Considerar responsive de ProductCard image height** (`h-36` en mobile, `h-48` en desktop). | UX-17 | Bajo |

---

## Resumen de checklists

### UI/UX Review Checklist
- [x] Paleta de colores coherente en toda la app. — **Parcial**: coral + black + white consistentes, pero Bootstrap agrega colores del sistema.
- [x] Tipografía consistente (tamaños, pesos, line-height). — **No**: mezcla de definiciones CSS + Tailwind + Bootstrap.
- [x] Espaciados uniformes entre componentes equivalentes. — **No**: Bootstrap container vs Tailwind max-w-7xl.
- [x] Hover/focus/active en botones, links, inputs. — **Parcial**: hover definido, focus no garantizado.
- [x] CTAs primarios claramente distinguibles de secundarios. — **Parcial**: "Limpiar carrito" compite visualmente.
- [x] Transiciones suaves (150-300ms) en interactivos. — **Parcial**: 300ms correcto, CartModal usa 500ms.
- [x] Loading/skeleton states visibles mientras se carga data. — **Parcial**: ProductGrid sí, checkout submit no.
- [x] Sin superposiciones ni elementos cortados en ningún viewport. — **Requiere prueba visual**.
- [x] Feedback visual en acciones del usuario (add to cart, submit, error). — **No**: falta feedback al agregar al carrito.
- [x] Sin fugas de estilo inline o CSS global no controlado. — **Parcial**: hay CSS global en index.css e inline styles.

### Accessibility Checklist (WCAG 2.2 AA)
- [x] `lang="es"` en `<html>`. — **NO** (`lang="en"`).
- [x] Alt text relevante en imágenes, alt="" en decorativas. — **Parcial**: iconos sin `aria-hidden`.
- [x] Skip link como primer elemento focusable. — **NO**.
- [x] Navegación completa por teclado (Tab, Enter, Escape). — **Parcial**: modales sin focus trapping.
- [x] Foco visible (`:focus-visible`) en todos los elementos. — **NO**: `outline-none` sin reemplazo.
- [x] Contraste de color ≥ 4.5:1 en textos. — **Parcial**: coral sobre blanco no cumple.
- [x] Labels en todos los inputs de formulario. — **Sí**: todos los inputs tienen label asociado. ✅
- [x] Mensajes de error asociados al campo. — **Parcial**: login sí, checkout no muestra errores de validación.
- [x] Rol ARIA correcto en modales (`dialog`, `aria-modal`). — **Parcial**: falta `aria-modal`.
- [x] Landmarks semánticos (`<main>`, `<nav>`, etc.). — **Parcial**: falta `<main>`.
- [x] `aria-live` en regiones dinámicas (carrito, alertas). — **NO**.
- [x] Modales atrapan el foco y lo restauran al cerrarse. — **NO**.

---

## Archivos legacy (`pages/`)

Los archivos `pages/checkout.html` y `pages/shop.html` son páginas HTML estáticas legacy que:
- Usan Bootstrap 5 con JS inline (`<script src="...">`) que ya no existe como archivo físico
- Citan scripts en `../src/components/` que pertenecen a la versión anterior (no Vite)
- Tienen los mismos problemas de accesibilidad (`lang="en"`, sin skip link, sin focus)
- Tienen estructura HTML inválida (p.ej., `<li>` directo dentro de `<div>` en `checkout.html:80`)
- **No deberían estar en producción** si la app React es la interfaz activa

---

## Notas finales

1. **Fortalezas**: El ShoppingConcierge es el componente mejor diseñado (micro-interacciones, ARIA labels, responsive, estados). Los botones CTA tienen transiciones consistentes. La grilla de productos es responsive correctamente.
2. **Deuda técnica principal**: La convivencia de Bootstrap + Tailwind es la fuente de la mayoría de las inconsistencias. Migrar completamente a Tailwind resolvería ~40% de los hallazgos.
3. **Accesibilidad**: Los problemas más críticos (skip link, focus trapping, lang) son de baja complejidad técnica y alto impacto en usuarios de lectores de pantalla.
4. **Testing recomendado**: Ejecutar Lighthouse Accessibility audit y axe DevTools después de implementar las correcciones de alta prioridad.

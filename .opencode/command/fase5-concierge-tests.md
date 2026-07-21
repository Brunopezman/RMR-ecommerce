---
description: "F5 — Tests unitarios y de integración del concierge"
agent: qa
---

## Fase 5 — Tests Unitarios y de Integración

### Objetivo
Llevar la cobertura de tests del concierge de ~1 archivo (solo `parseTalle`) a cobertura completa de todas las funciones del hook, servicio de búsqueda, y componentes.

### Tareas

1. **Tests para `productSearch.ts`**
   - `buildIndex()` con productos vacíos, productos normales
   - `clearIndex()` y `isIndexReady()`
   - `searchSimilar()` con query exacta, query parcial, query sin matching
   - `searchSimilar()` con filters: `maxPrice`, `category`, combinados
   - `searchByName()` con match exacto, match parcial, sin match, token fallback
   - Edge cases: query vacía, productos sin nombre, stop words como query

2. **Tests para `parseIntent()` en `useConcierge.ts`**
   - `parseIntent("hola")` → `{ action: 'greeting' }`
   - `parseIntent("ayuda")` → `{ action: 'help' }`
   - `parseIntent("agregá Remera AC/DC")` → `{ action: 'add_to_cart', productName: 'Remera AC/DC' }`
   - `parseIntent("remeras por menos de 5000")` → `{ action: 'search', maxPrice: 5000, category: 'remera' }`
   - `parseIntent("buzos")` → `{ action: 'search', category: 'buzo' }`
   - `parseIntent("algo barato")` → `{ action: 'search' }` (fallback)
   - Price parsing: "$4000", "menos de 3000", "máximo 2000", "hasta 1500"

3. **Tests para `formatSearchResponse()`**
   - Con resultados: formato correcto, productos incluidos en response
   - Sin resultados: mensaje contextual según category/maxPrice
   - Con resultados y filtros: texto refleja "remeras por hasta $5000"
   - Con resultados mixtos: lista numerada correcta

4. **Tests para el hook `useConcierge`**
   - `toggle()` abre y cierra el chat
   - `sendMessage()` agrega mensaje del usuario + respuesta del asistente
   - `sendMessage()` con intent `greeting` responde apropiadamente
   - `sendMessage()` con intent `add_to_cart` busca producto
   - `sendMessage()` dispara `isTyping` durante la respuesta
   - Mockear `loadProductsWithFallback` para tests predecibles

5. **Tests para componentes**
   - `ChatBubble` renderiza texto del asistente correctamente
   - `ChatBubble` renderiza products cuando existen
   - `ProductMiniCard` llama a `onAddToCart` al hacer clic en botón
   - `ShoppingConcierge` renderiza FAB, al hacer clic abre el panel
   - Chips de sugerencias: al hacer clic se envía el mensaje

### Criterios de aceptación

- [ ] `productSearch.test.ts` con ≥10 tests cubriendo buildIndex, searchSimilar, searchByName
- [ ] `useConcierge.test.ts` con ≥8 tests cubriendo parseIntent, formatSearchResponse, hook flow
- [ ] `ChatBubble.test.tsx` con ≥2 tests de renderizado
- [ ] `ShoppingConcierge.test.tsx` con ≥3 tests de interacción
- [ ] Suite completa: `npm test` pasa (sin romper tests existentes)
- [ ] `npx tsc --noEmit` sin errores

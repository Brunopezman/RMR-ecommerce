# Shopping Concierge — Chatbot de Ventas

> **Fecha:** 14 de julio de 2026
> **Autor:** @shopping-concierge
> **Estado:** Implementado ✅

---

## Arquitectura

```
┌─────────────────────────────────────────────────┐
│                   App.tsx                        │
│  ┌───────────────────────────────────────────┐   │
│  │                ShopPage                    │   │
│  │  ┌─────────┐ ┌──────────┐ ┌───────────┐   │   │
│  │  │ Header  │ │  Hero/   │ │  Footer   │   │   │
│  │  │         │ │ Products │ │           │   │   │
│  │  └─────────┘ └──────────┘ └───────────┘   │   │
│  │                                           │   │
│  │  ┌─────────────────────────────────────┐   │   │
│  │  │     ShoppingConcierge (FAB + Chat)   │   │   │
│  │  └─────────────────────────────────────┘   │   │
│  └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘

                        │
                        ▼
┌─────────────────────────────────────────────────┐
│              useConcierge (hook)                 │
│  ┌──────────────┐  ┌────────────────────────┐   │
│  │  Chat state  │  │  Intent Parser         │   │
│  │  (messages,  │  │  (parseIntent)         │   │
│  │   isTyping)  │  └────────────────────────┘   │
│  └──────────────┘                               │
│  ┌────────────────────────────────────────┐     │
│  │  productSearch (RAG index)             │     │
│  │  ┌──────────┐  ┌──────────────────┐    │     │
│  │  │ TF-IDF   │  │ Cosine Similarity│    │     │
│  │  │ Index    │  │ Search           │    │     │
│  │  └──────────┘  └──────────────────┘    │     │
│  └────────────────────────────────────────┘     │
│                        │                        │
│                        ▼                        │
│  ┌────────────────────────────────────────┐     │
│  │  CartContext.addToCart                  │     │
│  │  (integra con el carrito existente)     │     │
│  └────────────────────────────────────────┘     │
└─────────────────────────────────────────────────┘
```

### Componentes

| Archivo | Responsabilidad |
|---|---|
| `src/components/chat/ShoppingConcierge.tsx` | UI del chatbot: FAB flotante + panel de chat + burbujas + cards de producto |
| `src/hooks/useConcierge.ts` | Lógica de conversación: estado del chat, parseo de intención, envío de búsquedas |
| `src/services/productSearch.ts` | Índice semántico TF-IDF + búsqueda por similitud de coseno + filtros exactos |

---

## Búsqueda Semántica (RAG local)

### Enfoque

En lugar de depender de una API externa de LLM o embeddings, implementamos un sistema RAG local:

1. **Indexación**: Al cargar el catálogo, se construye un índice TF-IDF en memoria.
   - Texto indexado: `nombre + descripción + tipo` de cada producto
   - Tokenización con split por caracteres no alfanuméricos + filtro de stop words en español
   - Cálculo de IDF (Inverse Document Frequency) con suavizado

2. **Vectorización**: Cada producto se representa como un vector TF-IDF donde cada dimensión es un término y el peso es `tf * idf`.

3. **Búsqueda**: Dada una consulta del usuario:
   - Se tokeniza y vectoriza igual que los productos
   - Se calcula similitud de coseno contra todos los productos indexados
   - Se devuelven los top N resultados

4. **Filtros exactos**: Después de la búsqueda semántica se aplican filtros exactos:
   - `maxPrice`: precio máximo
   - `category`: tipo exacto (remera, buzo, accesorio, vaso)
   - `tags`: tags de búsqueda textual adicional

### Por qué TF-IDF en vez de embeddings de OpenAI

- **0 dependencias externas**: No necesita API key, no hay latencia de red, funciona offline
- **Catálogo pequeño** (17 productos): Con pocos documentos, TF-IDF captura bien la relevancia
- **Dominio acotado**: Los nombres de productos son descriptivos y las categorías son limitadas
- **Costo cero**: Sin consumo de tokens ni llamadas HTTP

### Si el catálogo escala (>1000 productos)

Para un catálogo grande, reemplazar TF-IDF por embeddings reales (OpenAI, Cohere, o sentence-transformers embebidos en el backend) siguiendo la skill `rag-product-catalog`:

1. Backend genera embeddings de cada producto y los almacena en la DB
2. Frontend llama a un endpoint `/api/search?q=...` que hace la búsqueda semántica server-side
3. Se mantiene la misma interfaz `searchSimilar(query, topN, filters)`

---

## Parseo de Intención

El hook `useConcierge` incluye un parser de intención (`parseIntent`) que analiza el mensaje del usuario para determinar:

| Intención | Patrón | Ejemplo |
|---|---|---|
| `greeting` | saludos | "Hola", "Buenas" |
| `help` | pedido de ayuda | "Qué podés hacer", "Ayuda" |
| `add_to_cart` | agregar producto | "Agregá Remera AC/DC al carrito" |
| `search` | búsqueda (default) | "Remeras económicas", "Buzos por menos de 5000" |

### Extracción de parámetros

- **Presupuesto máximo**: Se detectan patrones como `$5000`, `menos de 4000`, `máximo 3000`
- **Categoría**: Se mapean términos coloquiales a tipos: "remera" → `remera`, "gorra" → `accesorio`
- **Query de búsqueda**: Se eliminan palabras de precio/acción/cortesía y se usa el resto para búsqueda semántica

---

## Integración con la UI

### Posicionamiento

- **FAB (Floating Action Button)**: Fixed en bottom-right (`bottom-6 right-6`), z-index 50
- **Panel de chat**: Se abre sobre el FAB (`bottom-24 right-6`), con 380px de ancho (responsive: 320px en mobile)
- El componente se renderiza dentro de `ShopPage`, siempre visible (en home y en shop)

### Estados

| Estado | Comportamiento |
|---|---|
| **Catálogo cargando** | FAB visible, chat muestra "Cargando...", input deshabilitado |
| **Catálogo listo** | FAB visible, al abrir muestra mensaje de bienvenida |
| **Chat cerrado** | Solo el FAB es visible |
| **Chat abierto** | Panel con historial, typing indicator, input activo |
| **Buscando** | Typing indicator de 3 puntitos animados (delay de 600ms simulado) |

### Responsive

- Desktop: panel de 384px de ancho (`w-96`)
- Mobile: panel de 320px de ancho (`w-80`), ocupa menos espacio
- El FAB se mantiene en la misma posición en todos los viewports

---

## Archivos modificados/creados

| Archivo | Acción |
|---|---|
| `src/components/chat/ShoppingConcierge.tsx` | **Creado** — Componente del chatbot (FAB + panel + burbujas) |
| `src/hooks/useConcierge.ts` | **Creado** — Hook con lógica de conversación y parseo de intención |
| `src/services/productSearch.ts` | **Creado** — Servicio de búsqueda semántica TF-IDF + cosine similarity |
| `src/App.tsx` | **Modificado** — Se importa y renderiza `ShoppingConcierge` en `ShopPage` |
| `docs/architecture/shopping-concierge.md` | **Creado** — Este documento |

---

## Limitaciones y próximos pasos

### Limitaciones actuales

1. **Sin LLM externo**: Las respuestas son plantillas fijas, no hay generación de lenguaje natural real. Esto limita la variedad de respuestas y la capacidad de mantener contexto complejo.
2. **TF-IDF básico**: El modelo de búsqueda semántica es simple (TF-IDF unigramas). No captura sinónimos ni relaciones semánticas profundas.
3. **Sin memoria de conversación**: El chatbot no recuerda el contexto de mensajes anteriores más allá de la búsqueda inmediata.
4. **Sin recomendaciones personalizadas**: No hay perfil de usuario ni historial de compras para personalizar recomendaciones.
5. **Sin soporte de pago**: El chatbot declara explícitamente que no puede tomar pagos.

### Próximos pasos

1. **Integrar LLM real** (OpenAI / Claude API vía backend propio para no exponer keys):
   - Reemplazar `formatSearchResponse` con un prompt al LLM que recibe los resultados de búsqueda como contexto
   - Mejorar la comprensión de lenguaje natural y la variedad de respuestas
   
2. **Mejorar parseo de intención**:
   - Usar expresiones regulares más robustas o un modelo de clasificación simple
   - Soporte para consultas complejas: "2 remeras de AC/DC y un buzo"

3. **Memoria conversacional**:
   - Mantener un historial de interacciones en el hook
   - Permitir referencias anafóricas: "ese" → último producto mencionado

4. **Embeddings reales**:
   - Para el backend real (Express + SQLite), agregar columna `embedding` en la tabla `products`
   - Servir búsqueda semántica desde el backend con pgvector o sql.js + cosine distance

5. **Analytics**:
   - Tracking de consultas frecuentes, productos más recomendados, tasa de conversión del chat

---

## Testing

Para testear el concierge:

1. **Unit tests** para `productSearch.ts`:
   ```bash
   npx vitest run src/services/productSearch.ts
   ```

2. **Unit tests** para `parseIntent` en `useConcierge.ts`

3. **Integration tests** para el flujo completo: usuario envía mensaje → se buscan productos → se muestran recomendaciones

4. **E2E** con Playwright: abrir chat, enviar mensaje, verificar que aparecen productos, agregar al carrito

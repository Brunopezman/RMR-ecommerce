---
name: rag-product-catalog
description: Usar cuando shopping-concierge necesite responder consultas semánticas sobre el catálogo (ej. "algo elegante para regalo bajo $20000") en vez de filtros exactos. Trigger en "indexá el catálogo", "búsqueda semántica de productos".
---

# RAG sobre el catálogo de productos

1. Por cada producto, generar un embedding de `nombre + descripción + categoría + tags`.
2. Guardar embeddings junto al `product_id` (una tabla/columna extra en la DB real, o un
   índice en memoria si el catálogo es chico, <1000 productos).
3. En cada consulta del usuario: embeber la consulta, buscar los N productos más similares
   (coseno), pasarle esos N como contexto al LLM para que arme la recomendación en lenguaje
   natural — nunca dejar que el LLM invente productos que no vinieron de esta búsqueda.
4. Para filtros exactos (presupuesto máximo, stock > 0) usar function calling / filtros SQL
   normales combinados con el resultado del RAG, no todo vía embeddings.

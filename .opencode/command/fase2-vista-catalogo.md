---
description: Ejecutá Fase 2 (Vista de Catálogo y Filtros) invocando ui-ux, feature-dev y qa-tester en secuencia.
agent: orchestrator
---
Ejecutá la Fase 2 del squad sobre este repo:
1. Invocá a @ui-ux para validar y optimizar los estilos (ej. Tailwind, CSS) de la barra lateral de filtros, asegurando que sea responsiva y colapse correctamente en dispositivos móviles.
2. Invocá a @feature-dev para modificar la vista de productos actual, reestructurarla en dos columnas (filtros a la izquierda, grilla de productos a la derecha) e implementar la lógica de filtrado reactiva por talle, precio o categoría.
3. Invocá a @qa-tester para escribir pruebas unitarias y de integración que verifiquen que los filtros actualizan la grilla de productos en tiempo real sin romper la interfaz.
4. Al terminar todos, resumime el estado: confirmá si los filtros son completamente funcionales, si el diseño responsivo se comporta según lo esperado y si las pruebas de catálogo están en verde.
---
description: Ejecutá Fase 4 (Integración, Auditoría y Cierre) invocando qa-tester y auditor en secuencia.
agent: orchestrator
---
Ejecutá la Fase 4 del squad sobre este repo:
1. Invocá a @qa-tester para ejecutar la suite completa de pruebas de extremo a extremo (E2E) con Playwright, simulando todo el recorrido del usuario: filtrar un producto, ver su detalle, seleccionar variantes, agregarlo al carrito y finalizar la compra.
2. Invocá a @auditor para realizar una revisión de código (Code Review) final, verificando el manejo de estado del carrito, optimización de renderizados en las nuevas vistas, legibilidad del código y ausencia de deuda técnica nueva.
3. Al terminar ambos, resumime el estado: confirmá que el 100% de la suite de pruebas esté en verde, detallá las optimizaciones sugeridas por el auditor y certificá si el desarrollo está listo para producción.
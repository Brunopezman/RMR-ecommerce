---
description: Ejecutá Fase 3 (Detalle de Producto y Flujo de Compra) invocando ui-ux, feature-dev y qa-tester en secuencia.
agent: orchestrator
---
Ejecutá la Fase 3 del squad sobre este repo:
1. Invocá a @ui-ux para definir los detalles de la nueva ventana de producto, garantizando la correcta jerarquía visual de la información (Nombre, precio, stock, selector de talle) y la prominencia de los botones de acción.
2. Invocá a @feature-dev para crear la nueva ruta/pantalla de "Detalle de Producto", renderizar la información dinámica a la derecha, estructurar los botones "Agregar al carrito" (con persistencia del estado) y "Comprar ahora" (este último debe redirigir a la ventana de finalización de compra existente arrastrando los datos del producto seleccionado).
3. Invocá a @qa-tester para validar el flujo de redirección, la transferencia de datos de compra entre pantallas, y asegurar que los campos mandatorios (como la selección de talle) se validen correctamente antes de avanzar.
4. Al terminar todos, resumime el estado: confirmá que la nueva vista de detalle cargue correctamente, que la integración con la ventana de checkout preexistente funcione de extremo a extremo y que todas las pruebas pasen con éxito.
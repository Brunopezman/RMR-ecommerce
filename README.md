# 🛒 Rock Merch & Roll – E-commerce

**Rock Merch & Roll (RMR)** es una aplicación web de e-commerce orientada a la venta de merchandising de bandas de rock. Permite a los usuarios explorar un catálogo de productos y simular una experiencia de compra completa, aplicando buenas prácticas de organización y desarrollo frontend.

---

## 🚀 Tecnologías utilizadas

* **JavaScript (ES6+)** – Lógica de la aplicación y manipulación del DOM.
* **HTML5** – Estructura semántica de las vistas.
* **CSS3** – Estilos personalizados.
* **Bootstrap** – Diseño responsive y componentes UI.
* **JSON** – Simulación de base de datos para productos y stock.

---

## ⚙️ Funcionalidades principales

* 🎸 **Catálogo dinámico de productos** (remeras, gorras, tazas, pósters, etc.).
* 🛒 **Carrito de compras** con persistencia de datos.
* 📦 **Simulación del proceso de compra**.
* 📱 **Diseño responsive**, adaptable a dispositivos móviles y desktop.
* 🧩 **Arquitectura modular**, con separación de responsabilidades por componentes.

---

## 🧱 Estructura del proyecto

El proyecto está organizado de forma modular para facilitar el mantenimiento y la escalabilidad:

* `components/` → lógica reutilizable (carrito, productos, autenticación, UI).
* `data/` → datos en formato JSON.
* `pages/` → vistas HTML.
* `css/` → estilos globales.
* `src/index.js` → punto de entrada de la aplicación.

---

## 🎯 Objetivo del proyecto

Aplicar conceptos fundamentales del desarrollo frontend como:

* Manipulación del DOM.
* Modularización del código.
* Persistencia de estado en el navegador.
* Organización de proyectos web.

---

## 📌 Estado del proyecto

El proyecto se encuentra en desarrollo y puede extenderse con funcionalidades como autenticación de usuarios, integración con un backend real o pasarela de pagos.

---

## 🧪 Testing

### Unitarios / Integración (Vitest)

Los tests de caracterización capturan el comportamiento actual del código
para prevenir regresiones durante la migración a React (Fase 2).

```bash
npm test              # Ejecuta todos los tests unitarios (vitest run)
npm run test:watch    # Modo watch durante desarrollo
```

Cobertura actual: **35 tests** en 4 suites:

| Suite | Tests | Descripción |
|---|---|---|
| `products.service.test.js` | 14 | fetchProducts, filterByCategory, searchByName |
| `cart.test.js` | 11 | validarProductoRepetido, eliminarProductoCarrito, vaciarCarrito |
| `checkout.test.js` | 7 | detectarTarjeta, validarLuhn (vía DOM) |
| `auth.test.js` | 3 | login mock exitoso/fallido |

### End-to-End (Playwright)

Pruebas de flujo real en navegador usando las páginas HTML estáticas.

```bash
npm run test:e2e      # Ejecuta todos los tests e2e (playwright test)
```

Cobertura actual: **13 tests** en 4 suites:

| Suite | Tests | Flujo |
|---|---|---|
| `home.spec.js` | 3 | Carga de index.html, navbar visible, botón Compra Ahora |
| `shop.spec.js` | 4 | Carga de shop.html, título de página, renderizado de productos, botones de compra |
| `navigation.spec.js` | 3 | Navegación entre index ↔ shop |
| `cart.spec.js` | 3 | Contador inicial 0, agregar producto, incrementar cantidad |

### Servidor de desarrollo

```bash
npm run dev           # Sirve archivos estáticos con `serve` en el puerto 3000
```

---
name: refactor-tandem
description: Usar durante la Fase 2 (modularización) cuando refactor-architect necesite el protocolo exacto de refactorizar-y-validar paso a paso con qa-tester. Trigger en "refactorizá X", "modularizá esta función".
---

# Protocolo de refactor en tandem

1. Elegí UNA función/responsabilidad a extraer (ej: "cálculo de total del carrito").
2. Copiá la lógica a un módulo nuevo `*.logic.js` con `export`, sin tocar el DOM.
3. Reemplazá el uso original por un `import` del nuevo módulo.
4. Corré `npm test` (y `npm run test:e2e` si el cambio toca un flujo de usuario visible).
5. Si falla: leé el diff exacto del fallo, corregí el módulo nuevo (no el test), repetí paso 4.
6. Si pasa: commit atómico con mensaje `refactor: extraer <nombre> a módulo ES6`, seguí con
   la próxima función.

No agrupar más de un refactor por commit. No mezclar refactor con features nuevas.

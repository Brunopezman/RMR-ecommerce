---
name: testing-workflow
description: Usar cuando haya que configurar o correr la suite de tests del e-commerce (Vitest + React Testing Library para componentes/hooks, Playwright para flujos de usuario tipo agregar-al-carrito). Trigger en pedidos como "configurá los tests", "corré la suite", "escribí un test para X".
---

# Testing workflow de este repo (React + TypeScript + Vite)

## Setup
```bash
npm install -D vitest @vitest/ui jsdom
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

`vite.config.ts` debe incluir:
```ts
test: {
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
  globals: true,
}
```
`src/test/setup.ts`:
```ts
import '@testing-library/jest-dom'
```

## Estructura esperada
```
src/
  components/
    cart/
      CartItem.tsx
      CartItem.test.tsx     # Vitest + RTL, junto al componente
tests/
  e2e/                       # Playwright, flujos reales en navegador
```

## Comandos
- `npm test` → Vitest en modo run (no watch) para CI.
- `npm run test:watch` → Vitest en watch para desarrollo.
- `npm run test:e2e` → Playwright headless.

## Reglas
- Tests de componentes: usar React Testing Library, consultar por rol/texto visible
  (`getByRole`, `getByText`), nunca por clase CSS ni test-id salvo último recurso.
- Tests de hooks con lógica de negocio (`useCart`, etc.): `renderHook` de RTL, sin
  necesidad de montar un componente completo.
- Tests e2e: simulan la interacción real del usuario y verifican el resultado visible.

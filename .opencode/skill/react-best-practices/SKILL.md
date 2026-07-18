---
name: react-best-practices
description: Usar cuando se necesiten estándares de código, arquitectura de componentes y buenas prácticas de React. Trigger en 'buenas prácticas React', 'arquitectura de componentes', 'código limpio React'.
---

# React Best Practices (React 18+)

## Componentes

- Funcionales solamente. No hay clases.
- Props tipadas con `interface` o `type`, sin `React.FC` genérico.
- Un componente por archivo, export nombrado.
- Componentes puros: mismo input → mismo output, sin efectos secundarios.

```tsx
interface ButtonProps {
  label: string
  variant?: 'primary' | 'secondary'
  onClick: () => void
}

export function Button({ label, variant = 'primary', onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg ${variant === 'primary' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
    >
      {label}
    </button>
  )
}
```

## Hooks

- Custom hooks para lógica reutilizable.
- Hooks nombrados con prefijo `use`.
- Cada hook con una única responsabilidad.

```tsx
export function useCart() {
  const { items, addToCart, removeFromCart } = useContext(CartContext)
  const itemCount = items.reduce((sum, item) => sum + item.cantidad, 0)
  return { items, addToCart, removeFromCart, itemCount }
}
```

## Separación de responsabilidades

| Capa | Qué va | Dónde |
|---|---|---|
| Presentación | JSX + Tailwind, eventos que llaman a hooks | Componentes (`components/`) |
| Lógica de estado | useState, useContext, custom hooks | Hooks (`hooks/`) |
| Lógica de negocio | Cálculos, validaciones, fetch | Servicios (`services/`) |
| Tipos | Interfaces y types compartidos | Types (`types/`) |

## Estado global

- Context + hooks para estado compartido (carrito, auth).
- Evitar prop drilling de más de 2 niveles.
- No agregar librerías de estado externas (Redux, Zustand) sin justificación.

## Performance

- `useMemo` / `useCallback` solo cuando hay medición de problema real.
- Evitar re-renders innecesarios: memoizar props que cambian por referencia.
- Lazy loading de rutas con `React.lazy` + `Suspense`.
- Listas con `key` estable y único.

## Testing

- Probar comportamiento, no implementación.
- Preferir `getByRole`, `getByText`, `getByLabelText` sobre clases CSS.
- `renderHook` para hooks sin montar componente.

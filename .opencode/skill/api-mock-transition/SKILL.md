---
name: api-mock-transition
description: Usar en Fase 3 Paso A cuando data-integration necesite pasar de arrays hardcodeados a una API simulada con json-server o Mock Service Worker. Trigger en "mockeá la API de productos", "sacá el array hardcodeado".
---

# Transición a API mock

## Opción A: json-server (rápida, servidor real en localhost)
```bash
npm install -D json-server
```
`db.json`:
```json
{ "products": [ /* mismo shape que hoy tenés hardcodeado */ ] }
```
```bash
npx json-server --watch db.json --port 3001
```
El frontend pasa de `import { products } from './data.js'` a
`fetch('http://localhost:3001/products').then(r => r.json())`.

## Opción B: MSW (intercepta fetch en el propio browser, sin servidor aparte)
Útil si más adelante se quiere testear offline o en CI sin levantar un puerto extra.

## Regla clave
El shape de la respuesta mock DEBE ser idéntico al que va a devolver el backend real
(mismos nombres de campo, mismos tipos) para que el swap a la API real en el Paso B sea
solo cambiar la base URL, no reescribir el consumo.

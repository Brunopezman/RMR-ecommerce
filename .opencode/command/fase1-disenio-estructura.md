---
description: Arranca Fase 1 (Auditoría + Setup de Tests) invocando auditor y qa-tester en paralelo/secuencia.
agent: orchestrator
---
Ejecutá la Fase 1 del squad sobre este repo:
1. Invocá a @auditor para generar el mapa de dependencias y el reporte de deuda técnica.
2. Invocá a @qa-tester para configurar Vitest + Playwright y escribir tests de
   caracterización sobre el código actual, sin modificarlo.
3. Al terminar ambos, resumime el estado: qué tan verde está la suite y cuáles son los
   3-5 riesgos más importantes que encontró el auditor.
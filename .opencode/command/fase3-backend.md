---
description: Arranca Fase 3 (Mock API -> Backend real) solo si Fase 2 terminó.
agent: orchestrator
---
Invocá a @data-integration para el Paso A (API mock con json-server o MSW, ver skill
`api-mock-transition`). Una vez validado por @qa-tester, preguntame si quiero avanzar al
Paso B (backend real) antes de invocarlo, porque implica decisiones de stack (Postgres vs
Mongo, Express vs serverless) que quiero confirmar.

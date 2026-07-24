# Decisión Arquitectónica — Envío de Emails (SMTP)

**Fecha:** 24 de julio de 2026
**Autor:** @refactor-architect
**Versión del código analizado:** v2.0.0

---

## Contexto

El backend implementa un servicio de emails centralizado en `server/src/services/emailService.ts` usando **nodemailer + SMTP (Gmail)**. Se envían dos tipos de correos:

1. **Welcome email** — tras registrarse un usuario (`POST /api/auth/register`)
2. **Order confirmation** — tras crear una orden (`POST /api/orders`), con PDF adjunto opcional

Ambos envíos son **no-bloqueantes**: se disparan con `.catch()` y nunca interrumpen la respuesta al cliente.

---

## Problema

En el entorno de producción actual (Render free tier), los puertos SMTP convencionales (25, 465, 587) están bloqueados para salida. Esto fue confirmado por el equipo de Render:

> [Free Web Services will no longer allow outbound traffic to SMTP ports](https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports)

**Consecuencia:** cualquier intento de conexión SMTP desde la app desplegada en Render free termina en `ETIMEDOUT` o `ENETUNREACH`. El código captura estos errores correctamente — se loguean con prefijo `[EMAIL_FAIL]` — pero el email simplemente no se entrega.

Esto **no es un bug del software**. Es una limitación conocida de la plataforma de hosting elegida para el plan gratuito.

---

## Decisión

| Entorno | Comportamiento |
|---|---|
| **Desarrollo local** | SMTP funciona normalmente. Los emails se entregan al destinatario real. |
| **Producción (Render free tier)** | SMTP no está disponible. El error se captura y loguea con prefijo `[EMAIL_FAIL]`. La request principal (registro / creación de orden) continúa sin afectarse. |

**Principios aplicados:**
- Degradación graceful: el sistema opera sin emails sin crashear ni bloquear al usuario.
- Transparencia: los fallos se loguean con prefijo `[EMAIL_FAIL]` identificable en logs de Render.
- Separación de concerns: el servicio de email no tiene acoplamiento con la lógica de negocio.

---

## Rutas de solución futura

| Opción | Cambio requerido | Costo | Confiabilidad | Impacto en código |
|---|---|---|---|---|
| **A — Upgrade de Render a plan pago** ($7+/mes) | Desbloquea puertos SMTP. | $7–25/mes | Alta (SMTP directo) | **Ninguno.** El código actual funciona sin cambios. |
| **B — Migrar a proveedor HTTP API** (Resend, SendGrid, Mailgun) | Requiere dominio propio verificado. Sustituir `nodemailer` por API HTTP. | Gratis hasta ~100 emails/día | Muy alta (HTTP > SMTP en PaaS) | Medio: reemplazar `emailService.ts` por cliente HTTP. |

**Recomendación:** la Opción A es la más rápida si se dispone de presupuesto. La Opción B es más robusta a largo plazo y evita depender de puertos SMTP, pero requiere configuración adicional (dominio, DNS, verificaciones).

Mientras ninguna de las dos opciones se implemente, el envío de emails en producción queda como **funcionalidad desactivada por limitación de plataforma**.

---

## Referencias

- [Render changelog — SMTP port blocking on free plans](https://render.com/changelog/free-web-services-will-no-longer-allow-outbound-traffic-to-smtp-ports)
- [Código del servicio de email](https://github.com/anomalyco/rock-merch/blob/main/server/src/services/emailService.ts)
- [API en producción](https://rockmerch-api.onrender.com/health)

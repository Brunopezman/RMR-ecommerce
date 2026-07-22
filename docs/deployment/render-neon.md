# Deploy: Render (backend) + Neon (PostgreSQL)

> Fecha: 22 de julio de 2026

---

## Prerrequisitos

- Cuenta en GitHub con el repo del proyecto
- Cuenta en [Render](https://render.com)
- Cuenta en [Neon](https://neon.tech)

---

## 1. Base de datos en Neon

1. Crear cuenta en neon.tech (free tier, sin expiración).
2. Crear proyecto en la región `us-east` (cerca de los servidores de Render en Ohio para menor latencia).
3. Crear base de datos `rockmerch-db`.
4. Copiar el connection string:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/rockmerch-db?sslmode=require
   ```

   > Neon free tier: 500MB storage, sin fecha de expiración, ideal para proyectos en etapa temprana.

---

## 2. Backend en Render

Render detecta automaticamente `render.yaml` en la raiz del repositorio. Si prefieres configuracion manual, sigue estos pasos:

### Configuracion manual

1. Ir a [dashboard.render.com](https://dashboard.render.com) → New + → Web Service.
2. Conectar el repositorio de GitHub.
3. Render detecta automaticamente el runtime Node y los campos `buildCommand` y `startCommand` desde `render.yaml`.

### Variables de entorno

Configurar en Render (o via `render.yaml`):

| Variable | Valor | Requerido |
|---|---|---|
| `DATABASE_URL` | Connection string de Neon | Si |
| `JWT_SECRET` | Valor secreto unico (Render puede generarlo) | Si |
| `ADMIN_EMAIL` | `admin@rock.com` | No (default) |
| `RMR_APP_URL` | URL del frontend (ej: `https://rockmerch.vercel.app`) | No |
| `SMTP_HOST` | Host SMTP para envio de emails | No |
| `SMTP_PORT` | Puerto SMTP (`587`) | No |
| `SMTP_USER` | Usuario SMTP | No |
| `SMTP_PASS` | Password SMTP | No |

### Deploy

4. Hacer clic en **Deploy**.
5. Render ejecuta `npm install` y `npm run build` automaticamente.
6. El servidor arranca en el puerto asignado por Render (variable `PORT`).

---

## 3. Verificar deploy

Una vez desplegado, verificar:

```bash
# Health check
curl https://tu-app.onrender.com/health
# Respuesta esperada:
# { "status": "ok", "db": "postgresql" }

# Productos
curl https://tu-app.onrender.com/products
# Deberia devolver el array de productos del seed

# Login
curl -X POST https://tu-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "admin@rock.com", "password": "admin123" }'
# Deberia devolver un token JWT
```

### Logs

Revisar los logs de build en Render para confirmar:

```
[migrate] Running PostgreSQL migrations...
[migrations]  ✓ 001-initial-schema (applied)
[migrations]  ✓ 002-add-user-fields (applied)
[migrations] All pending migrations applied successfully.
[seed] Inserted 17 products from data/db.json
[seed] Created admin user: admin@rock.com
[db] PostgreSQL initialization complete.
```

---

## 4. Consideraciones

### Cold start (Render free tier)

Render free tier pone el servicio en sleep tras 15 minutos de inactividad. El primer request tras el sleep demora ~60 segundos (cold start). Para evitar esto en produccion, considerar el plan Starter de Render ($7/mes, sin cold start).

### Conexion segura

Neon requiere `sslmode=require` en el connection string. El backend lo detecta automaticamente y configura SSL con `rejectUnauthorized: false` (compatible con Neon).

### Actualizar frontend

Si el frontend se despliega por separado (Vercel, Netlify), actualizar `BASE_URL` en `src/services/api.ts` a la URL de Render:

```typescript
export const BASE_URL = 'https://tu-app.onrender.com';
```

---

## Referencias

- [render.yaml](../../render.yaml) — configuracion de servicio en Render
- [API Contract](../architecture/api-contract.md) — contrato de endpoints
- [Dependency Map](../architecture/dependency-map.md) — arquitectura del proyecto

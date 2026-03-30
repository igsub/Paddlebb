# Paddlebb — Guía de configuración

Este documento explica todo lo que necesitás configurar para que la aplicación funcione en producción.

---

## 1. Supabase (Base de datos + Auth)

### Crear el proyecto

1. Ir a [supabase.com](https://supabase.com) y crear una cuenta gratuita
2. Crear un nuevo proyecto (elegir región más cercana a tus usuarios, ej: South America)
3. Guardar la contraseña de la base de datos

### Ejecutar las migraciones

Una vez creado el proyecto, ir a **SQL Editor** en el panel de Supabase y ejecutar en orden:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_add_location_and_improvements.sql`

### Obtener las API keys

En **Settings → API**:

| Variable | Dónde encontrarla |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | "Project URL" |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | "anon public" |
| `SUPABASE_SERVICE_ROLE_KEY` | "service_role secret" ⚠️ Nunca exponer públicamente |

### Configurar Auth

En **Authentication → Settings**:
- **Site URL**: `https://tu-dominio.com`
- **Redirect URLs**: `https://tu-dominio.com/**`
- Deshabilitar "Email confirmations" si querés que los jugadores entren inmediatamente (opcional)

---

## 2. Variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto (copiar de `.env.local.example`):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Web Push (ver instrucciones abajo)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BNxxxxxxx...
VAPID_PRIVATE_KEY=xxxxxxx...
VAPID_SUBJECT=mailto:admin@tupagina.com

# App URL
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

---

## 3. Push Notifications (VAPID Keys)

Generar las claves VAPID para las notificaciones push:

```bash
npx web-push generate-vapid-keys
```

Copiar el output en las variables de entorno:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` → "Public Key"
- `VAPID_PRIVATE_KEY` → "Private Key"
- `VAPID_SUBJECT` → tu email de contacto (ej: `mailto:admin@tupagina.com`)

> **Importante:** Las notificaciones push solo funcionan en HTTPS. En desarrollo local, usar `next dev --experimental-https`.

---

## 4. Crear el usuario administrador

El primer administrador se crea directamente en Supabase (no hay registro público de admins):

1. Ir a **Authentication → Users** en el panel de Supabase
2. Hacer click en **"Add user"**
3. Ingresar email y contraseña
4. Después de crearlo, ir a **SQL Editor** y ejecutar:

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'tu-admin@email.com';
```

5. Acceder al admin en: `https://tu-dominio.com/admin/login`

---

## 5. Onboarding de complejos (flujo manual)

Este es el flujo para dar de alta un nuevo complejo:

1. **Crear el dueño del complejo:**
   - Ir a `/admin/owners/new`
   - Ingresar nombre, email y contraseña del encargado del complejo
   - Guardar las credenciales para comunicárselas al dueño

2. **Crear el complejo:**
   - Ir a `/admin/complexes/new`
   - Seleccionar el dueño recién creado
   - Completar nombre, dirección, ciudad
   - Hacer click en "Geocodificar dirección" para obtener lat/lng automáticamente (requiere internet)
   - O ingresar lat/lng manualmente (obtenerlos de Google Maps)
   - Configurar política de cancelación (horas antes)

3. **Comunicar acceso al dueño:**
   - URL del portal: `https://tu-dominio.com/owner/login`
   - Email y contraseña creados en el paso 1

4. **El dueño desde su portal puede:**
   - Crear canchas (`/owner/courts`)
   - Crear turnos en bulk (`/owner/courts/[id]/slots/new`)
   - Ver reservas (`/owner/bookings`)

---

## 6. Hosting en Vercel (recomendado)

1. Crear cuenta en [vercel.com](https://vercel.com)
2. Conectar el repositorio de GitHub
3. En **Settings → Environment Variables**, agregar todas las variables del `.env.local`
4. Deploy automático en cada push a `main`

### Configuración adicional en Vercel:
- **Framework Preset**: Next.js (detectado automáticamente)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

> Las funciones serverless de Vercel son **gratis** en el plan Hobby para proyectos personales.

---

## 7. Dominio personalizado

En Vercel:
1. Settings → Domains → Add Domain
2. Configurar los DNS según las instrucciones de Vercel
3. Actualizar `NEXT_PUBLIC_APP_URL` y las Redirect URLs en Supabase

---

## 8. Iconos PWA

Para que la app sea instalable con íconos correctos, agregar en `public/icons/`:
- `icon-192.png` (192×192 px)
- `icon-512.png` (512×512 px)

Usar [realfavicongenerator.net](https://realfavicongenerator.net) para generarlos fácilmente desde un logo.

---

## 9. Costos estimados (escala inicial)

| Servicio | Plan | Costo |
|---|---|---|
| Supabase | Free tier | $0/mes (hasta 500 MB DB, 50k auth users) |
| Vercel | Hobby | $0/mes (proyectos personales) |
| Nominatim geocoding | OpenStreetMap | $0 (uso justo) |
| Leaflet maps | OSM tiles | $0 |

Para escalar (>500 bookings/día):
| Servicio | Plan | Costo |
|---|---|---|
| Supabase | Pro | ~$25/mes |
| Vercel | Pro | ~$20/mes |

---

## 10. Seguridad — checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` nunca debe estar en el cliente (solo en server-side)
- [ ] `VAPID_PRIVATE_KEY` nunca debe estar en el cliente
- [ ] Las migraciones de Supabase incluyen Row Level Security (RLS) en todas las tablas
- [ ] El endpoint `/api/admin/create-owner` valida que el caller sea admin
- [ ] Configurar HTTPS (Vercel lo hace automáticamente)

---

## 11. Probar localmente

```bash
# 1. Instalar dependencias
npm install

# 2. Crear .env.local (copiar de .env.local.example y completar)
cp .env.local.example .env.local

# 3. Correr el servidor de desarrollo
npm run dev

# Para probar push notifications (requiere HTTPS):
npm run dev -- --experimental-https
```

---

## Resumen de URLs de la plataforma

| URL | Descripción |
|---|---|
| `/` | Redirect según rol del usuario |
| `/login` | Login de jugadores |
| `/register` | Registro de jugadores |
| `/explore` | Explorar complejos (lista + mapa) |
| `/explore/[id]` | Ver canchas y reservar |
| `/bookings` | Mis reservas (jugadores) |
| `/owner/login` | Login exclusivo para dueños de complejos |
| `/owner/dashboard` | Panel principal del complejo |
| `/owner/courts` | Gestión de canchas |
| `/owner/slots` | Vista general de turnos |
| `/owner/bookings` | Reservas recibidas |
| `/admin/login` | Login de administradores |
| `/admin` | Dashboard admin |
| `/admin/complexes/new` | Crear nuevo complejo |
| `/admin/owners/new` | Crear dueño de complejo |

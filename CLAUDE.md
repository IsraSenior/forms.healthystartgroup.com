# forms.healthystartgroup.com

Sistema de formularios dinámicos para HealthyStart Group. Permite a pacientes completar formularios médicos multi-paso con generación automática de PDF evidencia.

## Stack

- **Framework**: Nuxt 3.17.1 (Nuxt UI, Pinia, FormKit auto-animate)
- **Estilos**: Tailwind CSS 4 + NuxtUI — colores: `primary` (#0eaa95 teal), `secondary` (#002d74 azul)
- **CMS/Backend**: Directus en `https://admin.healthystartgroup.com`
- **PDF**: Puppeteer + @sparticuz/chromium (Vercel-compatible)
- **Deploy**: Vercel

## Estructura

```
pages/
  index.vue          # Landing/formulario estático hardcodeado (pendiente reimplementar)
  login.vue          # Login con useAuth (middleware: guest)
  dashboard.vue      # Dashboard de usuario autenticado (middleware: auth)
  pdf.vue            # Render de PDF para Puppeteer
  forms/[form].vue   # Formulario dinámico desde Directus ← CORE del sistema

components/
  Logo.vue
  Form/SignaturePad.vue   # Captura firma → upload a Directus
  PDF/Page.vue            # Wrapper de página A4 para PDFs

composables/
  useAuth.ts         # Login/logout/token con Directus authentication('json')

middleware/
  auth.ts            # Redirige a /login si no autenticado
  guest.ts           # Redirige a /dashboard si ya autenticado

plugins/
  directus.js        # Cliente Directus global (provee: directus, readItem, readItems, createItem, updateItem, uploadFiles)

server/api/
  pdf.post.ts        # Genera PDF con Puppeteer y retorna base64
```

## Variables de entorno requeridas

```env
DIRECTUS_URL=https://admin.healthystartgroup.com
BASE_URL=https://forms.healthystartgroup.com   # URL pública del sitio
UPLOADS_FOLDER_ID=1b22fd7c-d86f-4ab8-be78-482df5693f4a  # Folder Directus para archivos
```

> Ver `.env.example` para referencia completa.

## Flujo principal (forms/[form].vue)

1. Lee formulario desde `forms` con sus `fields` en Directus
2. Renderiza campos dinámicamente por tipo (input/tel/email/textarea/toggle/checkbox/radio/select/signature)
3. Al enviar: crea `form_submissions` → genera PDF vía `/api/pdf` → sube PDF a Directus → actualiza submission con `evidence`
4. La firma se captura con `SignaturePad.vue` y se sube como SVG antes del submit

## Directus Schema

Ver `.claude/context/directus-schema.md`

## Issues conocidos

Ver `.claude/context/known-issues.md`

## Convenciones

- **No hardcodear URLs**: usar `useRuntimeConfig()` → `config.public.directusUrl`
- **No hardcodear el folder ID**: usar variable de entorno `UPLOADS_FOLDER_ID`
- **Plugin directus.js**: debe tener `.with(rest()).with(authentication())` — ambos
- **useAuth.ts**: usa `authentication('json')` con cookie `auth-token`
- **PDF Layout**: usar layout `pdf` (layouts/pdf.vue) — sin navbar ni UI
- **Estilos PDF**: clase `.page` define hoja A4 landscape (8.3in × 11.7in)
- **Pinia**: instalado — usar para estado global persistente si se necesita

## Comandos

```bash
yarn dev         # Desarrollo
yarn build       # Build producción
yarn preview     # Preview del build
```

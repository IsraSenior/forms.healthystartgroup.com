# HealthyStart Group — Forms System

Dynamic form builder powered by **Nuxt 3** and **Directus CMS**. Patients complete multi-step forms, sign digitally, and receive auto-generated PDF evidence — all managed from the Directus admin panel.

**Production**: https://forms.healthystartgroup.com  
**Directus Admin**: https://admin.healthystartgroup.com

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [How to Create a Form (Step by Step)](#how-to-create-a-form-step-by-step)
- [Supported Field Types](#supported-field-types)
- [Form Submission Flow](#form-submission-flow)
- [PDF Evidence Generation](#pdf-evidence-generation)
- [Authentication System](#authentication-system)
- [Deployment (Vercel)](#deployment-vercel)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 3.17.1 (Vue 3) |
| UI Components | Nuxt UI |
| Styling | Tailwind CSS 4 (Poppins font) |
| State | Pinia |
| CMS / Backend | Directus (REST API + SDK 19.1.0) |
| PDF Generation | Puppeteer + @sparticuz/chromium |
| Animations | FormKit Auto Animate |
| Signature Capture | nuxt-signature-pad |
| Hosting | Vercel |

**Brand Colors**:
- Primary (Teal): `#0eaa95`
- Secondary (Navy Blue): `#002d74`

---

## Getting Started

```bash
# 1. Install dependencies
yarn install

# 2. Copy environment file
cp .env.example .env
# Edit .env with your values

# 3. Start dev server
yarn dev
# → http://localhost:3000
```

### Commands

| Command | Description |
|---------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Build for production |
| `yarn preview` | Preview production build locally |

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DIRECTUS_URL` | Directus instance URL | `https://admin.healthystartgroup.com` |
| `BASE_URL` | Public URL of this app | `https://forms.healthystartgroup.com` |
| `UPLOADS_FOLDER_ID` | Directus folder UUID for file uploads | `1b22fd7c-d86f-4ab8-be78-482df5693f4a` |

These are exposed via `useRuntimeConfig().public` throughout the app.

---

## Project Structure

```
pages/
  forms/[form].vue       # Dynamic form renderer (core of the system)
  pdf.vue                # PDF template rendered by Puppeteer
  login.vue              # Admin login page
  dashboard.vue          # Admin dashboard

components/
  Logo.vue               # HSG logo (SVG)
  Form/SignaturePad.vue   # Digital signature capture + upload
  PDF/Page.vue            # A4 page wrapper for PDF rendering

composables/
  useAuth.ts             # Authentication (login, logout, token management)

middleware/
  auth.ts                # Protects routes requiring authentication
  guest.ts               # Redirects authenticated users away from login

plugins/
  directus.js            # Directus SDK client (REST + Auth)

server/api/
  pdf.post.ts            # PDF generation endpoint (Puppeteer)

layouts/
  default.vue            # App shell layout
  pdf.vue                # Minimal layout for PDF rendering (no UI chrome)
```

---

## Architecture Overview

```
                    ┌──────────────────────┐
                    │   Directus CMS       │
                    │ (admin.healthystart  │
                    │  group.com)          │
                    └──────────┬───────────┘
                               │ REST API
                               │
┌──────────────────────────────┼──────────────────────────────┐
│  Nuxt 3 App                  │                              │
│  (forms.healthystartgroup.com)                              │
│                              │                              │
│  ┌────────────┐    ┌────────┴────────┐    ┌──────────────┐ │
│  │ /forms/:id │───▶│ plugins/        │───▶│ Directus SDK │ │
│  │ (Vue page) │    │ directus.js     │    │ REST calls   │ │
│  └─────┬──────┘    └─────────────────┘    └──────────────┘ │
│        │                                                    │
│        │ on submit                                          │
│        ▼                                                    │
│  ┌─────────────┐    ┌─────────────┐    ┌────────────────┐  │
│  │ Create      │───▶│ /api/pdf    │───▶│ Puppeteer      │  │
│  │ submission  │    │ (POST)      │    │ renders /pdf   │  │
│  └─────────────┘    └──────┬──────┘    │ as PDF         │  │
│                            │           └────────────────┘  │
│                            ▼                                │
│                     ┌──────────────┐                        │
│                     │ Upload PDF   │                        │
│                     │ to Directus  │                        │
│                     │ (evidence)   │                        │
│                     └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## How to Create a Form (Step by Step)

### Step 1: Create the Form in Directus

1. Go to **Directus Admin** → Content → **Forms**
2. Click **"+ Create Item"**
3. Fill in:
   - **Title**: Name shown to the user (e.g. "Permission to Contact")
   - **Description**: Explanatory text shown below the title
   - **Status**: Set to `published` when ready
4. Save the form — note the **UUID** from the URL (e.g. `703de9db-ce43-4daa-a224-f7743fc8b9b1`)

### Step 2: Add Fields to the Form

Inside the form item, scroll to the **Fields** section and add fields one by one:

| Property | Required | Description |
|----------|----------|-------------|
| **Type** | Yes | Field type (see [Supported Field Types](#supported-field-types)) |
| **Label** | Yes | Question text shown to the user |
| **Slug** | Yes | Unique identifier used in submissions (e.g. `firstname`, `email`) |
| **Placeholder** | No | Input placeholder text |
| **Note** | No | Extended description (shown as heading for `toggle` fields) |
| **Required** | No | If checked, the user must fill this field to proceed |
| **Options** | No | For `select`, `radio`, `checkbox` — array of `{ label, value }` |
| **Sort** | Yes | Display order (1, 2, 3...). Fields are shown one per step |

**Important**: Each field = one step in the multi-step form. Order them by the `sort` value.

### Step 3: Configure Options (for select/radio/checkbox)

For fields with type `select`, `radio`, or `checkbox`, add options:

```json
[
  { "label": "Yes", "value": "yes" },
  { "label": "No",  "value": "no" }
]
```

Each option needs both a `label` (what the user sees) and a `value` (what gets saved).

### Step 4: Access the Form

The form is instantly available at:

```
https://forms.healthystartgroup.com/forms/<FORM-UUID>
```

No code changes or deployments needed. Just create the form in Directus and share the link.

### Step 5: View Submissions

1. Go to **Directus Admin** → Content → **Form Submissions**
2. Each submission shows:
   - Which form it belongs to
   - When it was started/submitted
   - All individual answers
   - The PDF evidence file (if generated)

---

## Supported Field Types

Each field type maps to a specific UI component:

| Type | Component | Use Case | Options Required |
|------|-----------|----------|-----------------|
| `input` | UInput | Short text (names, IDs, ZIP codes) | No |
| `email` | UInput (email) | Email address with validation | No |
| `tel` | UInput (tel) | Phone number | No |
| `textarea` | UTextarea | Long text (addresses, notes) | No |
| `select` | USelect | Dropdown single selection | Yes: `[{label, value}]` |
| `radio` | URadioGroup | Single choice, all visible | Yes: `[{label, value}]` |
| `checkbox` | UCheckboxGroup | Multiple choice | Yes: `[{label, value}]` |
| `toggle` | UCheckbox | Yes/No confirmation | No |
| `signature` | SignaturePad | Digital signature capture (SVG) | No |

### Field Behavior

- **One field per step**: The form shows one field at a time with Back/Next navigation
- **Required fields**: When `required` is checked, the "Next" button is disabled until the user fills the field
- **Toggle fields**: The `Note` property is shown as the heading (instead of `label`); `label` is shown next to the checkbox
- **Signature fields**: The user draws on a canvas; the signature is saved as an SVG file in Directus before form submission

---

## Form Submission Flow

When a user completes all steps and clicks **Submit**:

```
1. CREATE form_submission
   → { form: <form-id>, date_started, answers: [{ field, value }, ...] }

2. GENERATE PDF
   → POST /api/pdf { id: <submission-id> }
   → Puppeteer opens /pdf?submission=<id>, renders A4 landscape PDF

3. UPLOAD PDF to Directus
   → Saved as file in uploads folder
   → Returns file UUID

4. UPDATE submission
   → { evidence: <file-uuid> }

5. SHOW confirmation
   → "Thank you" screen with download link
```

### Directus Data Model

```
forms                    form_fields              form_submissions         form_answers
┌──────────────┐         ┌──────────────┐         ┌──────────────┐        ┌──────────────┐
│ id (uuid)    │──┐      │ id (uuid)    │         │ id (uuid)    │──┐     │ id (uuid)    │
│ title        │  │      │ form (m2o)   │◀──┐     │ form (m2o)   │  │     │ submissions  │◀─┐
│ description  │  │      │ type         │   │     │ status       │  │     │ field (m2o)  │  │
│ status       │  │      │ label        │   │     │ evidence     │  │     │ value        │  │
│ fields (o2m) │──┼─────▶│ slug         │   │     │ date_started │  │     │ sort         │  │
│ submissions  │──┼──┐   │ placeholder  │   │     │ answers(o2m) │──┼────▶│              │  │
└──────────────┘  │  │   │ Note         │   │     └──────────────┘  │     └──────────────┘  │
                  │  │   │ required     │   │                       │                       │
                  │  │   │ options      │   │                       └───────────────────────┘
                  │  │   │ sort         │   │
                  │  │   │ answers(o2m) │   │
                  │  │   └──────────────┘   │
                  │  │                      │
                  │  └──────────────────────┘
                  └─────────────────────────┘
```

---

## PDF Evidence Generation

The system generates PDF evidence for each submission:

1. **Endpoint**: `POST /api/pdf` with body `{ id: "<submission-uuid>" }`
2. **Process**: Puppeteer launches a headless browser, navigates to `/pdf?submission=<id>`, and renders the page as a PDF
3. **Output**: A4 landscape, single page, returned as base64
4. **Template**: `pages/pdf.vue` defines the PDF layout using the `pdf` layout (no app chrome)

### PDF Template

The PDF template (`pages/pdf.vue`) is a hardcoded layout specific to "Permission to Contact". It displays:
- Patient consent checkbox
- Medicare/Medicaid status
- Personal information (name, address, city, state, ZIP, phone, email)
- Legal disclaimer
- Digital signature
- Form/Submission IDs in footer

### Customizing the PDF Template

Currently the PDF template is specific to the "Permission to Contact" form. To support different forms, you would need to create a dynamic template or add form-specific templates.

### Technical Notes

- **Development**: Uses local Chrome (`/Applications/Google Chrome.app/...`)
- **Production (Vercel)**: Uses `@sparticuz/chromium` (serverless-compatible)
- Elements with class `.noshow-pdf` are removed before PDF generation
- The content must have `id="report-content"` for the renderer to detect page readiness

---

## Authentication System

The admin area (`/login`, `/dashboard`) uses Directus authentication:

| Component | Purpose |
|-----------|---------|
| `composables/useAuth.ts` | Login, logout, token management, user state |
| `middleware/auth.ts` | Protects admin routes — redirects to `/login` if unauthenticated |
| `middleware/guest.ts` | Redirects to `/dashboard` if already authenticated |

### Auth Flow

1. User submits credentials on `/login`
2. `useAuth.login()` authenticates against Directus API
3. JWT token stored in `auth-token` cookie (7 days, secure, sameSite: strict)
4. User data fetched via `readMe()` from Directus
5. Subsequent requests use the stored token

### Protecting a Page

```vue
<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>
```

---

## Deployment (Vercel)

### Environment Variables

Set these in **Vercel Dashboard** → Settings → Environment Variables:

| Variable | Production Value |
|----------|-----------------|
| `DIRECTUS_URL` | `https://admin.healthystartgroup.com` |
| `BASE_URL` | `https://forms.healthystartgroup.com` |
| `UPLOADS_FOLDER_ID` | `1b22fd7c-d86f-4ab8-be78-482df5693f4a` |

### Build Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Nuxt.js |
| Build Command | `yarn build` |
| Output Directory | `.output` |
| Install Command | `yarn install` |

### Considerations

- **Chromium size**: `@sparticuz/chromium` is ~50MB compressed. This is near the Vercel serverless function size limit. Monitor function sizes during deployment.
- **PDF timeout**: The `/api/pdf` endpoint has a 60-second timeout. Vercel Pro allows up to 60s; the free tier limits to 10s.
- **CORS**: The `/api/**` routes have CORS headers configured in `nuxt.config.ts` allowing all origins.

---

## Quick Reference

### Add a New Form
1. Directus → Forms → Create
2. Add title + description + fields with sort order
3. Set status to `published`
4. Share link: `https://forms.healthystartgroup.com/forms/<uuid>`

### View Submissions
Directus → Form Submissions → Filter by form

### Download Evidence PDF
Directus → Form Submissions → Select submission → Click evidence file

---

*Powered by [ZunamiCorp](https://zunamicorp.com)*

<script setup>
definePageMeta({ layout: 'pdf' })
useHead({ title: 'Documentation — HSG Forms' })

const generatedDate = new Date().toLocaleDateString('en-US', {
  year: 'numeric', month: 'long', day: 'numeric',
})

const fieldTypes = [
  { type: 'input',     name: 'Text Input',     color: 'secondary', desc: 'Single-line text. For names, cities, ZIP codes.' },
  { type: 'email',     name: 'Email',           color: 'secondary', desc: 'Email input with built-in format validation.' },
  { type: 'tel',       name: 'Phone Number',    color: 'secondary', desc: 'Phone input — triggers numeric keyboard on mobile.' },
  { type: 'textarea',  name: 'Long Text',       color: 'secondary', desc: 'Multi-line. For addresses, notes, freeform.' },
  { type: 'select',    name: 'Dropdown',        color: 'primary',   desc: 'Single selection from a dropdown. Requires Options (JSON).' },
  { type: 'radio',     name: 'Single Choice',   color: 'primary',   desc: 'All options visible as cards. Patient picks one. Requires Options.' },
  { type: 'checkbox',  name: 'Multi Choice',    color: 'primary',   desc: 'All options visible as cards. Patient picks many. Requires Options.' },
  { type: 'toggle',    name: 'Yes / No',        color: 'secondary', desc: 'Single confirmation checkbox. Uses Note as heading, Label as text.' },
  { type: 'signature', name: 'Signature',       color: 'secondary', desc: 'Patient draws on canvas. Saved as SVG file in Directus.' },
]

const createFormSteps = [
  { title: 'Log in to Directus', body: 'Go to https://admin.healthystartgroup.com and sign in with your admin credentials.' },
  { title: 'Open the Forms collection', body: 'In the left sidebar, click Content → Forms. You\'ll see a list of existing forms.' },
  { title: 'Create a new form', body: 'Click the + button. Fill in the Title (shown to patients) and Description. Leave Status as draft for now.' },
  { title: 'Add fields', body: 'Scroll down to the Fields section. Click Create New for each field. Set: Type, Label, Slug (unique key like "firstname"), Placeholder, Required toggle, and Sort order.' },
  { title: 'Set sort order carefully', body: 'The Sort value determines which step the field appears on (1 = first). Every field becomes one step in the patient wizard.' },
]

const schemaCollections = [
  {
    name: 'forms',
    description: 'Form definitions — one record per form.',
    fields: [
      { field: 'id',          type: 'UUID',   description: 'Unique identifier — used in the public URL' },
      { field: 'title',       type: 'String', description: 'Name shown to the patient on the intro screen' },
      { field: 'description', type: 'Text',   description: 'Explanatory text below the title' },
      { field: 'status',      type: 'Enum',   description: 'published | draft | archived' },
      { field: 'fields',      type: 'O2M',    description: '→ form_fields (ordered by sort)' },
      { field: 'submissions', type: 'O2M',    description: '→ form_submissions' },
    ],
  },
  {
    name: 'form_fields',
    description: 'Individual fields belonging to a form — each field is one step.',
    fields: [
      { field: 'id',          type: 'UUID',    description: 'Unique identifier' },
      { field: 'form',        type: 'M2O',     description: '→ forms' },
      { field: 'sort',        type: 'Integer', description: 'Display order (1 = first step)' },
      { field: 'type',        type: 'Enum',    description: 'input | email | tel | textarea | select | radio | checkbox | toggle | signature' },
      { field: 'label',       type: 'String',  description: 'Question text shown to the patient' },
      { field: 'slug',        type: 'String',  description: 'Identifier used as key in form_answers' },
      { field: 'placeholder', type: 'String',  description: 'Input placeholder text (optional)' },
      { field: 'Note',        type: 'Text',    description: 'Heading above the field (main heading for toggle type)' },
      { field: 'required',    type: 'Boolean', description: 'Whether the field must be filled to proceed' },
      { field: 'options',     type: 'JSON',    description: 'Array of {label, value} for select/radio/checkbox' },
    ],
  },
  {
    name: 'form_submissions',
    description: 'Each completed (or in-progress) form submission.',
    fields: [
      { field: 'id',           type: 'UUID',      description: 'Unique identifier' },
      { field: 'form',         type: 'M2O',       description: '→ forms' },
      { field: 'status',       type: 'Enum',      description: 'published | draft | archived' },
      { field: 'date_started', type: 'Timestamp', description: 'When the patient opened the form' },
      { field: 'evidence',     type: 'File',      description: '→ directus_files (the generated PDF)' },
      { field: 'answers',      type: 'O2M',       description: '→ form_answers' },
    ],
  },
  {
    name: 'form_answers',
    description: 'Individual answer values for each field in a submission.',
    fields: [
      { field: 'id',          type: 'UUID',    description: 'Unique identifier' },
      { field: 'submissions', type: 'M2O',     description: '→ form_submissions' },
      { field: 'field',       type: 'M2O',     description: '→ form_fields (which field this answer belongs to)' },
      { field: 'value',       type: 'String',  description: "The patient's answer (arrays stored as JSON string)" },
      { field: 'sort',        type: 'Integer', description: 'Order of answers' },
    ],
  },
]

const archSteps = [
  { label: 'Admin creates Form + Fields in Directus', sub: 'admin.healthystartgroup.com', color: 'bg-[#002d74] text-white' },
  { label: 'Patient opens public URL', sub: 'forms.healthystartgroup.com/forms/<uuid>', color: 'bg-gray-100 text-gray-700' },
  { label: 'Nuxt fetches form data from Directus REST API', sub: 'GET /items/forms/<id>?fields=…', color: 'bg-gray-100 text-gray-700' },
  { label: 'Patient completes multi-step wizard', sub: 'One field per step — Next / Back navigation', color: 'bg-gray-100 text-gray-700' },
  { label: 'Submit: form_submission + form_answers created', sub: 'POST /items/form_submissions  •  POST /items/form_answers', color: 'bg-[#0eaa95]/10 text-[#0eaa95] border border-[#0eaa95]/30' },
  { label: 'POST /api/pdf → Puppeteer renders /pdf?submission=ID', sub: 'Chromium opens the page, generates A4 landscape PDF, returns base64', color: 'bg-[#0eaa95]/10 text-[#0eaa95] border border-[#0eaa95]/30' },
  { label: 'PDF uploaded to Directus File Library', sub: 'POST /files  →  returns file UUID', color: 'bg-[#0eaa95]/10 text-[#0eaa95] border border-[#0eaa95]/30' },
  { label: 'form_submission.evidence updated with file UUID', sub: 'PATCH /items/form_submissions/<id>  {evidence: <uuid>}', color: 'bg-[#002d74] text-white' },
  { label: 'Patient downloads PDF evidence', sub: 'admin.healthystartgroup.com/assets/<file-uuid>', color: 'bg-[#002d74] text-white' },
]

const faqItems = [
  { q: 'My form is not appearing at its URL', a: "Make sure the form's Status is set to published in Directus. Draft forms return a 404. Also verify the UUID in the URL matches the form's ID field exactly." },
  { q: 'Options are not showing for select / radio / checkbox', a: 'The Options field must contain valid JSON — an array of objects with "label" and "value" keys. Common mistake: trailing comma after the last item, or missing quotes around keys.' },
  { q: 'My fields appear in the wrong order', a: 'Each field has a Sort property in Directus. Fields are shown in ascending sort order (1, 2, 3…). Update Sort values in the form\'s Fields section to match the desired order.' },
  { q: 'My toggle field shows the wrong text', a: 'The Toggle type uses two text properties: the Note field is the heading above the checkbox, and the Label field is the text beside the checkbox. Make sure both are filled in.' },
  { q: 'The signature is not saving', a: 'Check that UPLOADS_FOLDER_ID is set correctly in Vercel and that the Directus folder exists. The folder ID must match an existing folder in Directus → File Library.' },
  { q: 'PDF evidence is not generating', a: 'Verify that BASE_URL is set to https://forms.healthystartgroup.com in Vercel environment variables. On Vercel Free the serverless function timeout is 10s; on Pro it is 60s.' },
  { q: 'How do I make a field optional?', a: 'In Directus, open the field and turn off the Required toggle. Optional fields show Next enabled without requiring a value.' },
]
</script>

<template>
  <div class="font-sans text-gray-800 bg-white" style="font-family: 'Poppins', system-ui, sans-serif;">

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- COVER PAGE                                                      -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div class="cover-page" style="min-height: 100vh; display: flex; flex-direction: column; background: #002d74;">

      <!-- Top accent bar -->
      <div style="height: 6px; background: #0eaa95;"></div>

      <!-- Main cover content -->
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding: 72px 80px;">

        <!-- Logo -->
        <div style="margin-bottom: 56px;">
          <Logo style="height: 52px; width: auto;" />
        </div>

        <!-- Label -->
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
          <div style="width: 40px; height: 3px; background: #0eaa95; border-radius: 99px;"></div>
          <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #0eaa95;">Technical Documentation</span>
        </div>

        <!-- Title -->
        <h1 style="font-size: 48px; font-weight: 800; color: #ffffff; line-height: 1.1; margin: 0 0 16px;">
          Forms System
        </h1>
        <h2 style="font-size: 28px; font-weight: 400; color: rgba(255,255,255,0.7); margin: 0 0 48px;">
          Administrator Guide
        </h2>

        <!-- Description -->
        <p style="font-size: 15px; color: rgba(255,255,255,0.6); line-height: 1.8; max-width: 480px; margin: 0 0 64px;">
          Complete reference for building and managing dynamic patient-facing forms using the Directus CMS — including field configuration, submission review, data schema, and troubleshooting.
        </p>

        <!-- Meta row -->
        <div style="display: flex; gap: 48px;">
          <div>
            <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.4); margin: 0 0 4px;">Generated</p>
            <p style="font-size: 13px; color: rgba(255,255,255,0.8); margin: 0;">{{ generatedDate }}</p>
          </div>
          <div>
            <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.4); margin: 0 0 4px;">Platform</p>
            <p style="font-size: 13px; color: rgba(255,255,255,0.8); margin: 0;">forms.healthystartgroup.com</p>
          </div>
          <div>
            <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.4); margin: 0 0 4px;">Backend</p>
            <p style="font-size: 13px; color: rgba(255,255,255,0.8); margin: 0;">Directus CMS</p>
          </div>
        </div>
      </div>

      <!-- Cover footer -->
      <div style="padding: 24px 80px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between;">
        <p style="font-size: 11px; color: rgba(255,255,255,0.4); margin: 0;">HealthyStart Group — Internal Use</p>
        <p style="font-size: 11px; color: rgba(255,255,255,0.4); margin: 0;">Powered by Zunami Corp</p>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- TABLE OF CONTENTS                                              -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div class="pdf-section" style="padding: 64px 72px; background: #F8FAFC;">
      <!-- Section header -->
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <div style="width: 4px; height: 28px; background: #0eaa95; border-radius: 4px;"></div>
        <h2 style="font-size: 24px; font-weight: 700; color: #002d74; margin: 0;">Table of Contents</h2>
      </div>
      <p style="font-size: 13px; color: #6b7280; margin: 0 0 40px 14px;">Navigate through this documentation</p>

      <div style="display: flex; flex-direction: column; gap: 8px;">

        <div v-for="(chapter, ci) in [
          { num: '01', title: 'Getting Started', sub: 'Overview of the system, core features, and high-level flow', items: ['Overview', 'System Features', 'High-level Flow'] },
          { num: '02', title: 'Building Forms', sub: 'Step-by-step guide to creating and configuring forms', items: ['Create a Form', 'Field Types (9 types)', 'Configure Options (JSON)', 'Publish & Share'] },
          { num: '03', title: 'Managing Data', sub: 'Where to find submissions, download PDFs, and understand the schema', items: ['Review Submissions', 'Data Management', 'Collection Schema'] },
          { num: '04', title: 'Reference', sub: 'Technical architecture and troubleshooting guide', items: ['Architecture & Tech Stack', 'End-to-end Flow', 'FAQ & Troubleshooting'] },
        ]" :key="ci"
          class="pdf-card"
          style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px 24px; display: flex; gap: 20px; align-items: flex-start;">
          <div style="font-size: 28px; font-weight: 800; color: #0eaa95; opacity: 0.4; line-height: 1; min-width: 40px; margin-top: 2px;">
            {{ chapter.num }}
          </div>
          <div style="flex: 1;">
            <p style="font-size: 15px; font-weight: 700; color: #002d74; margin: 0 0 4px;">{{ chapter.title }}</p>
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 12px;">{{ chapter.sub }}</p>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              <span v-for="item in chapter.items" :key="item"
                style="font-size: 11px; background: #F1F5F9; color: #475569; padding: 3px 10px; border-radius: 99px; font-weight: 500;">
                {{ item }}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- CHAPTER 01 — OVERVIEW                                          -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div class="pdf-section" style="padding: 64px 72px;">

      <!-- Chapter label -->
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #0eaa95;">Chapter 01</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <div style="width: 4px; height: 28px; background: #0eaa95; border-radius: 4px;"></div>
        <h2 style="font-size: 24px; font-weight: 700; color: #002d74; margin: 0;">Getting Started</h2>
      </div>
      <p style="font-size: 13px; color: #6b7280; margin: 0 0 36px 14px;">What this system is and how it works</p>

      <!-- Description -->
      <p style="font-size: 14px; color: #374151; line-height: 1.8; margin: 0 0 32px;">
        The <strong style="color: #002d74;">HealthyStart Group Forms System</strong> is a dynamic form builder that allows administrators to create patient-facing forms entirely from the Directus CMS — no code changes required. Each form is a multi-step wizard where patients answer one question at a time. Upon submission, a signed PDF evidence document is automatically generated and stored.
      </p>

      <!-- Feature grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 40px;">
        <div v-for="feat in [
          { icon: '≡', title: 'Multi-step wizard', desc: 'One question per screen. Patients focus on each answer without being overwhelmed.' },
          { icon: '⌨', title: '9 field types', desc: 'Text, email, phone, dropdowns, radio, checkboxes, toggles, and digital signature.' },
          { icon: '📄', title: 'Automatic PDF evidence', desc: 'A signed PDF is generated on every submission and stored in Directus for download.' },
          { icon: '⚙', title: 'Directus-powered', desc: 'All forms, fields, and submissions are managed from the Directus admin panel.' },
        ]" :key="feat.title"
          class="pdf-card"
          style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; background: white; display: flex; gap: 14px; align-items: flex-start;">
          <div style="width: 40px; height: 40px; background: rgba(14,170,149,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; shrink: 0;">
            {{ feat.icon }}
          </div>
          <div>
            <p style="font-size: 13px; font-weight: 700; color: #002d74; margin: 0 0 4px;">{{ feat.title }}</p>
            <p style="font-size: 12px; color: #6b7280; line-height: 1.6; margin: 0;">{{ feat.desc }}</p>
          </div>
        </div>
      </div>

      <!-- High-level flow -->
      <div class="pdf-card" style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; background: white;">
        <p style="font-size: 13px; font-weight: 700; color: #002d74; margin: 0 0 20px;">High-level flow</p>
        <div style="display: flex; align-items: flex-start; gap: 0;">
          <div v-for="(step, i) in [
            { label: 'Admin creates form', sub: 'in Directus CMS', bg: '#002d74', text: '#ffffff' },
            { label: 'Patient opens URL', sub: 'public form link', bg: '#f3f4f6', text: '#002d74' },
            { label: 'Completes wizard', sub: 'one field per step', bg: '#f3f4f6', text: '#002d74' },
            { label: 'PDF auto-generated', sub: 'stored in Directus', bg: '#0eaa95', text: '#ffffff' },
          ]" :key="step.label" style="flex: 1; display: flex; align-items: flex-start; gap: 0;">
            <div style="display: flex; flex-direction: column; align-items: center; flex: 1; text-align: center;">
              <div :style="`width: 48px; height: 48px; border-radius: 12px; background: ${step.bg}; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;`">
                <span :style="`color: ${step.text}; font-size: 18px;`">{{ ['⚙', '🌐', '✓', '📄'][i] }}</span>
              </div>
              <p style="font-size: 11px; font-weight: 700; color: #1f2937; margin: 0 0 2px; line-height: 1.3;">{{ step.label }}</p>
              <p style="font-size: 10px; color: #9ca3af; margin: 0;">{{ step.sub }}</p>
            </div>
            <div v-if="i < 3" style="display: flex; align-items: flex-start; padding-top: 20px; padding-left: 4px; padding-right: 4px; shrink: 0;">
              <span style="font-size: 14px; color: #d1d5db;">›</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- CHAPTER 02 — BUILDING FORMS                                    -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div class="pdf-section" style="padding: 64px 72px;">

      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #0eaa95;">Chapter 02</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <div style="width: 4px; height: 28px; background: #0eaa95; border-radius: 4px;"></div>
        <h2 style="font-size: 24px; font-weight: 700; color: #002d74; margin: 0;">Building Forms</h2>
      </div>
      <p style="font-size: 13px; color: #6b7280; margin: 0 0 36px 14px;">Step-by-step guide to creating and configuring forms in Directus</p>

      <!-- Create a Form -->
      <h3 style="font-size: 15px; font-weight: 700; color: #002d74; margin: 0 0 16px; display: flex; align-items: center; gap: 8px;">
        <span style="display: inline-flex; width: 24px; height: 24px; background: #0eaa95; color: white; border-radius: 50%; font-size: 12px; font-weight: 800; align-items: center; justify-content: center;">+</span>
        Create a Form
      </h3>

      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px;">
        <div v-for="(step, i) in createFormSteps" :key="i" class="pdf-card" style="display: flex; gap: 16px; align-items: flex-start;">
          <div style="display: flex; flex-direction: column; align-items: center; flex-shrink: 0;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: #002d74; color: white; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center;">
              {{ i + 1 }}
            </div>
            <div v-if="i < 4" style="width: 1px; height: 20px; background: #e5e7eb; margin-top: 4px;"></div>
          </div>
          <div class="pdf-card" style="flex: 1; background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 18px; margin-bottom: 4px;">
            <p style="font-size: 13px; font-weight: 700; color: #002d74; margin: 0 0 4px;">{{ step.title }}</p>
            <p style="font-size: 12px; color: #4b5563; line-height: 1.6; margin: 0;">{{ step.body }}</p>
          </div>
        </div>
      </div>

      <!-- Tip box -->
      <div class="pdf-card" style="background: rgba(14,170,149,0.08); border: 1px solid rgba(14,170,149,0.25); border-radius: 10px; padding: 14px 18px; display: flex; gap: 10px; margin-bottom: 36px;">
        <span style="font-size: 16px; flex-shrink: 0; margin-top: 1px;">💡</span>
        <div>
          <p style="font-size: 12px; font-weight: 700; color: #002d74; margin: 0 0 2px;">One field = one step</p>
          <p style="font-size: 12px; color: #374151; line-height: 1.6; margin: 0;">Every field you add to a form becomes its own step in the patient-facing wizard. If you want multiple questions on one screen, that's not currently supported — each field is always shown individually.</p>
        </div>
      </div>

      <!-- Field Types -->
      <h3 style="font-size: 15px; font-weight: 700; color: #002d74; margin: 0 0 16px;">Field Types</h3>
      <p style="font-size: 12px; color: #6b7280; margin: 0 0 16px;">9 types available — use secondary (blue) for basic inputs, primary (teal) for option-based fields</p>

      <div class="pdf-card" style="border: 1px solid #e5e7eb; border-radius: 12px; margin-bottom: 32px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; border-radius: 12px; overflow: hidden;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1px solid #e5e7eb;">
              <th style="text-align: left; padding: 10px 16px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; width: 100px;">Type</th>
              <th style="text-align: left; padding: 10px 16px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; width: 120px;">Name</th>
              <th style="text-align: left; padding: 10px 16px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280;">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ft, i) in fieldTypes" :key="ft.type" :style="i % 2 === 0 ? 'background: white;' : 'background: #fafafa;'">
              <td style="padding: 10px 16px; border-bottom: 1px solid #f3f4f6;">
                <span :style="`font-family: monospace; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 6px; ${ft.color === 'primary' ? 'background: rgba(14,170,149,0.12); color: #0eaa95;' : 'background: rgba(0,45,116,0.08); color: #002d74;'}`">
                  {{ ft.type }}
                </span>
              </td>
              <td style="padding: 10px 16px; border-bottom: 1px solid #f3f4f6; font-weight: 600; color: #1f2937;">{{ ft.name }}</td>
              <td style="padding: 10px 16px; border-bottom: 1px solid #f3f4f6; color: #4b5563; line-height: 1.5;">{{ ft.desc }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Configure Options -->
      <h3 style="font-size: 15px; font-weight: 700; color: #002d74; margin: 0 0 8px;">Configure Options</h3>
      <p style="font-size: 12px; color: #6b7280; margin: 0 0 16px;">Required for <code style="background: #f3f4f6; padding: 1px 6px; border-radius: 4px; font-size: 11px;">select</code>, <code style="background: #f3f4f6; padding: 1px 6px; border-radius: 4px; font-size: 11px;">radio</code>, and <code style="background: #f3f4f6; padding: 1px 6px; border-radius: 4px; font-size: 11px;">checkbox</code> field types</p>

      <div class="pdf-card" style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; background: white; margin-bottom: 16px;">
        <p style="font-size: 12px; font-weight: 700; color: #002d74; margin: 0 0 8px;">Format</p>
        <p style="font-size: 12px; color: #4b5563; line-height: 1.6; margin: 0 0 12px;">The Options field in Directus must contain a valid JSON array. Each item has a <code style="background: #f3f4f6; padding: 1px 5px; border-radius: 3px; font-size: 11px;">label</code> (what the patient sees) and a <code style="background: #f3f4f6; padding: 1px 5px; border-radius: 3px; font-size: 11px;">value</code> (what gets stored).</p>
        <pre style="background: #111827; color: #34d399; border-radius: 10px; padding: 16px; font-family: monospace; font-size: 12px; line-height: 1.6; margin: 0; overflow-x: auto;">[
  { "label": "Yes",      "value": "yes"      },
  { "label": "No",       "value": "no"       },
  { "label": "Not sure", "value": "not_sure" }
]</pre>
      </div>

      <div class="pdf-card" style="background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.25); border-radius: 10px; padding: 14px 18px; margin-bottom: 32px;">
        <p style="font-size: 12px; font-weight: 700; color: #b45309; margin: 0 0 6px;">⚠ Common mistakes to avoid</p>
        <ul style="font-size: 12px; color: #374151; margin: 0; padding-left: 18px; line-height: 1.9;">
          <li>Trailing comma after the last item: <code style="background: #fef3c7; padding: 1px 5px; border-radius: 3px; font-size: 11px;">{"value":"no"},</code> — invalid JSON</li>
          <li>Missing quotes around keys: <code style="background: #fef3c7; padding: 1px 5px; border-radius: 3px; font-size: 11px;">{label: "Yes"}</code> — must use double quotes</li>
          <li>Using single quotes: <code style="background: #fef3c7; padding: 1px 5px; border-radius: 3px; font-size: 11px;">{'label': 'Yes'}</code> — only double quotes are valid JSON</li>
        </ul>
      </div>

      <!-- Publish & Share -->
      <h3 style="font-size: 15px; font-weight: 700; color: #002d74; margin: 0 0 16px;">Publish & Share</h3>

      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
        <div v-for="(step, i) in [
          { title: 'Open the form in Directus', body: 'Navigate to Content → Forms and click the form you want to publish.' },
          { title: 'Change status to Published', body: 'In the Status field at the top, change from draft → published, then Save the item.' },
          { title: 'Copy the form ID', body: 'The form\'s UUID is visible in the Directus URL bar or in the ID field. It looks like: 703de9db-ce43-4daa-a224-f7743fc8b9b1' },
        ]" :key="i" style="display: flex; gap: 14px; align-items: flex-start;">
          <div style="width: 28px; height: 28px; border-radius: 50%; background: #002d74; color: white; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            {{ i + 1 }}
          </div>
          <div class="pdf-card" style="flex: 1; background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 16px;">
            <p style="font-size: 13px; font-weight: 700; color: #002d74; margin: 0 0 3px;">{{ step.title }}</p>
            <p style="font-size: 12px; color: #4b5563; line-height: 1.6; margin: 0;">{{ step.body }}</p>
          </div>
        </div>
      </div>

      <div class="pdf-card" style="background: rgba(14,170,149,0.08); border: 1px solid rgba(14,170,149,0.25); border-radius: 10px; padding: 14px 18px;">
        <p style="font-size: 11px; font-weight: 700; color: #0eaa95; margin: 0 0 6px;">Public URL pattern — share this link with patients:</p>
        <pre style="background: #111827; color: #34d399; border-radius: 8px; padding: 12px 16px; font-family: monospace; font-size: 13px; margin: 0;">https://forms.healthystartgroup.com/forms/<span style="color: #fbbf24;">&lt;form-uuid&gt;</span></pre>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- CHAPTER 03 — MANAGING DATA                                     -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div class="pdf-section" style="padding: 64px 72px;">

      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #0eaa95;">Chapter 03</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <div style="width: 4px; height: 28px; background: #0eaa95; border-radius: 4px;"></div>
        <h2 style="font-size: 24px; font-weight: 700; color: #002d74; margin: 0;">Managing Data</h2>
      </div>
      <p style="font-size: 13px; color: #6b7280; margin: 0 0 36px 14px;">Where to find submissions and understand the data schema</p>

      <!-- Review Submissions -->
      <h3 style="font-size: 15px; font-weight: 700; color: #002d74; margin: 0 0 16px;">Review Submissions</h3>

      <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px;">

        <div class="pdf-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px;">
          <p style="font-size: 13px; font-weight: 700; color: #002d74; margin: 0 0 6px;">Where to find submissions</p>
          <p style="font-size: 12px; color: #4b5563; line-height: 1.6; margin: 0;">In the Directus admin panel, go to <strong>Content → Form Submissions</strong>. You'll see a list of all submissions across all forms, ordered by most recent first.</p>
        </div>

        <div class="pdf-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px;">
          <p style="font-size: 13px; font-weight: 700; color: #002d74; margin: 0 0 10px;">What each submission contains</p>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <th style="text-align: left; padding: 6px 0; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9ca3af; width: 120px;">Field</th>
                <th style="text-align: left; padding: 6px 0; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9ca3af;">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in [
                { field: 'ID',           desc: 'Unique UUID of this submission' },
                { field: 'Form',         desc: 'Which form was filled out' },
                { field: 'Status',       desc: 'published / draft / archived' },
                { field: 'Date Started', desc: 'When the patient opened the form' },
                { field: 'Evidence',     desc: 'The generated PDF file (click to download)' },
                { field: 'Answers',      desc: 'Nested list of all field answers' },
              ]" :key="row.field">
                <td style="padding: 7px 0; border-bottom: 1px solid #f9fafb; font-family: monospace; font-size: 11px; font-weight: 600; color: #002d74;">{{ row.field }}</td>
                <td style="padding: 7px 0; border-bottom: 1px solid #f9fafb; color: #4b5563;">{{ row.desc }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pdf-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px;">
          <p style="font-size: 13px; font-weight: 700; color: #002d74; margin: 0 0 6px;">How to download the PDF evidence</p>
          <p style="font-size: 12px; color: #4b5563; line-height: 1.6; margin: 0;">Inside a submission, click the <strong>Evidence</strong> file field. The PDF will open in a new tab or trigger a download. You can also find all PDFs in <strong>File Library</strong> inside Directus.</p>
        </div>

        <div class="pdf-card" style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px;">
          <p style="font-size: 13px; font-weight: 700; color: #002d74; margin: 0 0 6px;">Filtering submissions</p>
          <p style="font-size: 12px; color: #4b5563; line-height: 1.6; margin: 0;">Use Directus built-in filters. Common filters: <strong>by form</strong> (filter where form equals a specific form ID), <strong>by date</strong> (date_started after/before a date), or <strong>by status</strong>.</p>
        </div>

      </div>

      <!-- Schema -->
      <h3 style="font-size: 15px; font-weight: 700; color: #002d74; margin: 0 0 8px;">Collection Relationships</h3>
      <div class="pdf-card" style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; background: white; margin-bottom: 24px;">
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div v-for="rel in [
            { from: 'forms', rel: 'one-to-many', to: 'form_fields' },
            { from: 'forms', rel: 'one-to-many', to: 'form_submissions' },
            { from: 'form_submissions', rel: 'one-to-many', to: 'form_answers' },
            { from: 'form_answers', rel: 'many-to-one', to: 'form_fields' },
          ]" :key="rel.from + rel.to" style="display: flex; align-items: center; gap: 12px; font-size: 12px;">
            <span style="font-family: monospace; font-weight: 700; padding: 4px 10px; border-radius: 8px; background: rgba(0,45,116,0.07); color: #002d74; border: 2px solid rgba(0,45,116,0.15);">{{ rel.from }}</span>
            <span style="color: #9ca3af; font-size: 10px; background: #f3f4f6; padding: 2px 8px; border-radius: 4px; white-space: nowrap;">{{ rel.rel }}</span>
            <span style="color: #9ca3af;">→</span>
            <span style="font-family: monospace; font-weight: 700; padding: 4px 10px; border-radius: 8px; background: rgba(14,170,149,0.08); color: #0eaa95; border: 2px solid rgba(14,170,149,0.2);">{{ rel.to }}</span>
          </div>
        </div>
      </div>

      <!-- Collection schema tables -->
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div v-for="col in schemaCollections" :key="col.name" class="pdf-card" style="border: 1px solid #e5e7eb; border-radius: 12px; background: white;">
          <div style="padding: 12px 20px; background: #f8fafc; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; gap: 8px;">
            <span style="font-family: monospace; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 6px; background: rgba(0,45,116,0.08); color: #002d74;">{{ col.name }}</span>
            <span style="font-size: 11px; color: #6b7280;">{{ col.description }}</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 1px solid #e5e7eb;">
                <th style="text-align: left; padding: 8px 16px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; width: 110px;">Field</th>
                <th style="text-align: left; padding: 8px 16px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; width: 70px;">Type</th>
                <th style="text-align: left; padding: 8px 16px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af;">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(f, fi) in col.fields" :key="f.field" :style="fi % 2 === 0 ? '' : 'background: #fafafa;'">
                <td style="padding: 8px 16px; border-bottom: 1px solid #f3f4f6; font-family: monospace; font-size: 11px; font-weight: 600; color: #002d74;">{{ f.field }}</td>
                <td style="padding: 8px 16px; border-bottom: 1px solid #f3f4f6;">
                  <span :style="`font-size: 10px; padding: 2px 7px; border-radius: 5px; font-weight: 600; ${f.type === 'O2M' || f.type === 'M2O' ? 'background: rgba(14,170,149,0.12); color: #0eaa95;' : 'background: #f3f4f6; color: #6b7280;'}`">
                    {{ f.type }}
                  </span>
                </td>
                <td style="padding: 8px 16px; border-bottom: 1px solid #f3f4f6; color: #4b5563; line-height: 1.5;">{{ f.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════ -->
    <!-- CHAPTER 04 — REFERENCE                                         -->
    <!-- ═══════════════════════════════════════════════════════════════ -->
    <div class="pdf-section" style="padding: 64px 72px;">

      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #0eaa95;">Chapter 04</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <div style="width: 4px; height: 28px; background: #0eaa95; border-radius: 4px;"></div>
        <h2 style="font-size: 24px; font-weight: 700; color: #002d74; margin: 0;">Reference</h2>
      </div>
      <p style="font-size: 13px; color: #6b7280; margin: 0 0 36px 14px;">Technical architecture and troubleshooting</p>

      <!-- Architecture -->
      <h3 style="font-size: 15px; font-weight: 700; color: #002d74; margin: 0 0 16px;">End-to-end Architecture</h3>

      <div class="pdf-card" style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; background: white; margin-bottom: 24px;">
        <div style="display: flex; flex-direction: column; gap: 0;">
          <div v-for="(node, i) in archSteps" :key="i" style="display: flex; align-items: flex-start; gap: 12px;">
            <div style="display: flex; flex-direction: column; align-items: center; flex-shrink: 0;">
              <div :style="`width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; ${node.color}`">
                {{ i + 1 }}
              </div>
              <div v-if="i < 8" style="width: 1px; height: 18px; background: #e5e7eb; margin: 2px 0;"></div>
            </div>
            <div style="padding-top: 6px; padding-bottom: 4px;">
              <p style="font-size: 12px; font-weight: 600; color: #1f2937; margin: 0 0 2px; line-height: 1.3;">{{ node.label }}</p>
              <p style="font-size: 10px; color: #9ca3af; font-family: monospace; margin: 0;">{{ node.sub }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tech stack -->
      <h3 style="font-size: 15px; font-weight: 700; color: #002d74; margin: 0 0 16px;">Tech Stack</h3>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 36px;">
        <div v-for="item in [
          { layer: 'Frontend',  tech: 'Nuxt 3 + Vue 3 + NuxtUI' },
          { layer: 'Styles',    tech: 'Tailwind CSS v4 + Poppins' },
          { layer: 'CMS / API', tech: 'Directus + REST SDK v19' },
          { layer: 'PDF',       tech: 'Puppeteer + @sparticuz/chromium' },
          { layer: 'Hosting',   tech: 'Vercel (serverless)' },
          { layer: 'Auth',      tech: 'Directus JWT + cookie' },
        ]" :key="item.layer"
          class="pdf-card"
          style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 14px;">
          <p style="font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #9ca3af; margin: 0 0 3px;">{{ item.layer }}</p>
          <p style="font-size: 12px; font-weight: 600; color: #002d74; margin: 0;">{{ item.tech }}</p>
        </div>
      </div>

      <!-- FAQ -->
      <h3 style="font-size: 15px; font-weight: 700; color: #002d74; margin: 0 0 16px;">FAQ & Troubleshooting</h3>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div v-for="(item, i) in faqItems" :key="i"
          class="pdf-card"
          style="background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px;">
          <p style="font-size: 12px; font-weight: 700; color: #002d74; margin: 0 0 6px; display: flex; gap: 8px; align-items: flex-start;">
            <span style="color: #0eaa95; flex-shrink: 0;">Q.</span>
            {{ item.q }}
          </p>
          <p style="font-size: 12px; color: #4b5563; line-height: 1.7; margin: 0; padding-left: 20px;">{{ item.a }}</p>
        </div>
      </div>

    </div>

  </div>
</template>

<style>
/* ── Page margins ───────────────────────────────────────────────── */

/* All pages get vertical breathing room */
@page {
  margin: 48px 0;
}

/* First page (cover): full bleed, no margins */
@page :first {
  margin: 0;
}

/* ── Section page breaks ────────────────────────────────────────── */
.pdf-section {
  break-before: page;
}

/* ── Prevent orphaned headings and subtitles ────────────────────── */
/* Never allow a page break immediately after a heading */
h1, h2, h3, h4 {
  break-after: avoid;
  page-break-after: avoid;
}

/* Also keep the subtitle paragraph glued to what follows */
h3 + p, h2 + p {
  break-after: avoid;
  page-break-after: avoid;
}

/* ── Prevent Chromium from splitting elements across pages ─────── */

/* Tables: never split header from body, never split a row */
table, thead, tbody, tr, pre {
  break-inside: avoid;
  page-break-inside: avoid;
}

/* Any direct child div/section that looks like a card */
.pdf-card {
  break-inside: avoid;
  page-break-inside: avoid;
}
</style>

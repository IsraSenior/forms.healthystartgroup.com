<script setup>
useHead({ title: 'Documentation — HSG Forms' })

// ─── Navigation sections ───────────────────────────────────────────────────
const sections = [
  { id: 'overview',            label: 'Overview',              icon: 'i-lucide-info' },
  { id: 'create-form',         label: 'Create a Form',         icon: 'i-lucide-plus-circle' },
  { id: 'field-types',         label: 'Field Types',           icon: 'i-lucide-text-cursor-input' },
  { id: 'configure-options',   label: 'Configure Options',     icon: 'i-lucide-settings-2' },
  { id: 'publish-share',       label: 'Publish & Share',       icon: 'i-lucide-share-2' },
  { id: 'review-submissions',  label: 'Review Submissions',    icon: 'i-lucide-clipboard-list' },
  { id: 'data-management',     label: 'Data Management',       icon: 'i-lucide-database' },
  { id: 'architecture',        label: 'Architecture',          icon: 'i-lucide-workflow' },
  { id: 'faq',                 label: 'FAQ',                   icon: 'i-lucide-help-circle' },
]

// ─── Field types reference ─────────────────────────────────────────────────
const fieldTypes = [
  { type: 'input',     label: 'Text Input',     description: 'Single-line text. Use for names, cities, ZIP codes, and general short answers.', requiresOptions: false, note: null },
  { type: 'email',     label: 'Email',          description: 'Email input with built-in validation. Shows an email keyboard on mobile devices.', requiresOptions: false, note: null },
  { type: 'tel',       label: 'Phone Number',   description: 'Phone number input. Triggers the numeric keyboard on mobile devices.', requiresOptions: false, note: null },
  { type: 'textarea',  label: 'Long Text',      description: 'Multi-line text field. Use for addresses, notes, or longer answers.', requiresOptions: false, note: null },
  { type: 'select',    label: 'Dropdown',       description: 'Single selection from a collapsible dropdown list. Requires the Options field.', requiresOptions: true, note: null },
  { type: 'radio',     label: 'Single Choice',  description: 'Displays all options as visible card buttons. Patient picks exactly one. Requires Options.', requiresOptions: true, note: null },
  { type: 'checkbox',  label: 'Multi Choice',   description: 'Displays all options as card buttons. Patient can pick multiple. Requires Options.', requiresOptions: true, note: null },
  { type: 'toggle',    label: 'Yes / No',       description: 'A single checkbox confirmation. Uses the Note field as the question heading above, and Label as the checkbox text beside it.', requiresOptions: false, note: 'The Note field becomes the heading; the Label field becomes the checkbox text.' },
  { type: 'signature', label: 'Signature',      description: 'Digital signature pad. The patient draws their signature, which is saved as an SVG file in Directus.', requiresOptions: false, note: null },
]

// ─── Preview mock data ─────────────────────────────────────────────────────
const previewSelect = ref(null)
const previewRadio  = ref(null)
const previewCheck  = ref([])
const previewToggle = ref(false)

const stateOptions = [
  { label: 'Florida', value: 'FL' },
  { label: 'New York', value: 'NY' },
  { label: 'California', value: 'CA' },
  { label: 'Texas', value: 'TX' },
]
const medicaidOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No',  value: 'no'  },
]
const medicareOptions = [
  { label: 'Plan A', value: 'plan-a' },
  { label: 'Plan B', value: 'plan-b' },
]

// ─── FAQ items ─────────────────────────────────────────────────────────────
const faqItems = [
  {
    label: 'My form is not appearing at its URL',
    content: 'Make sure the form\'s Status is set to "published" in Directus. Draft forms return a 404. Also verify the UUID in the URL matches the form\'s ID field exactly.',
  },
  {
    label: 'Options are not showing for my select / radio / checkbox field',
    content: 'The Options field must contain valid JSON — an array of objects with "label" and "value" keys. Common mistake: trailing comma after the last item, or missing quotes around keys. Example: [{"label":"Yes","value":"yes"},{"label":"No","value":"no"}]',
  },
  {
    label: 'My fields appear in the wrong order',
    content: 'Each field has a Sort property in Directus. Fields are shown in ascending sort order (1, 2, 3…). Go to the form\'s Fields section in Directus and update the Sort values to match the desired order.',
  },
  {
    label: 'My toggle field shows the wrong text',
    content: 'The Toggle type uses two different text properties: the Note field is shown as a heading above the checkbox, and the Label field is shown as the text beside the checkbox itself. Make sure both are filled in.',
  },
  {
    label: 'The signature is not saving',
    content: 'Check that the UPLOADS_FOLDER_ID environment variable is set correctly in Vercel and that the Directus folder exists. The folder ID must match an existing folder in Directus → File Library.',
  },
  {
    label: 'PDF evidence is not generating',
    content: 'Verify that BASE_URL is set to https://forms.healthystartgroup.com in Vercel environment variables. The PDF endpoint navigates to that URL internally using Puppeteer, so it must be the live production URL. On Vercel Pro, the serverless function has a 60s timeout; on Free it is 10s.',
  },
  {
    label: 'How do I make a field optional?',
    content: 'In Directus, open the field and turn off the Required toggle. Optional fields show "Next" enabled without requiring a value. Required fields keep "Next" disabled until the patient fills the field.',
  },
]

// ─── Schema tables ─────────────────────────────────────────────────────────
const schemaCollections = [
  {
    name: 'forms',
    description: 'Form definitions — one record per form.',
    fields: [
      { field: 'id', type: 'UUID', description: 'Unique identifier — used in the public URL' },
      { field: 'title', type: 'String', description: 'Name shown to the patient on the intro screen' },
      { field: 'description', type: 'Text', description: 'Explanatory text below the title' },
      { field: 'status', type: 'Enum', description: 'published | draft | archived' },
      { field: 'fields', type: 'O2M', description: '→ form_fields (ordered by sort)' },
      { field: 'submissions', type: 'O2M', description: '→ form_submissions' },
    ],
  },
  {
    name: 'form_fields',
    description: 'Individual fields belonging to a form — each field is one step.',
    fields: [
      { field: 'id', type: 'UUID', description: 'Unique identifier' },
      { field: 'form', type: 'M2O', description: '→ forms' },
      { field: 'sort', type: 'Integer', description: 'Display order (1 = first step)' },
      { field: 'type', type: 'Enum', description: 'input | email | tel | textarea | select | radio | checkbox | toggle | signature' },
      { field: 'label', type: 'String', description: 'Question text shown to the patient' },
      { field: 'slug', type: 'String', description: 'Identifier used as key in form_answers' },
      { field: 'placeholder', type: 'String', description: 'Input placeholder text' },
      { field: 'Note', type: 'Text', description: 'Heading above the field (used as main heading for toggle)' },
      { field: 'required', type: 'Boolean', description: 'Whether the field must be filled to proceed' },
      { field: 'options', type: 'JSON', description: 'Array of {label, value} for select/radio/checkbox' },
    ],
  },
  {
    name: 'form_submissions',
    description: 'Each completed (or in-progress) form submission.',
    fields: [
      { field: 'id', type: 'UUID', description: 'Unique identifier' },
      { field: 'form', type: 'M2O', description: '→ forms' },
      { field: 'status', type: 'Enum', description: 'published | draft | archived' },
      { field: 'date_started', type: 'Timestamp', description: 'When the patient opened the form' },
      { field: 'evidence', type: 'File', description: '→ directus_files (the generated PDF)' },
      { field: 'answers', type: 'O2M', description: '→ form_answers' },
    ],
  },
  {
    name: 'form_answers',
    description: 'Individual answer values for each field in a submission.',
    fields: [
      { field: 'id', type: 'UUID', description: 'Unique identifier' },
      { field: 'submissions', type: 'M2O', description: '→ form_submissions' },
      { field: 'field', type: 'M2O', description: '→ form_fields (which field this answer belongs to)' },
      { field: 'value', type: 'String', description: 'The patient\'s answer (arrays stored as JSON string)' },
      { field: 'sort', type: 'Integer', description: 'Order of answers' },
    ],
  },
]

// ─── Create form steps ────────────────────────────────────────────────────
const createFormSteps = [
  { title: 'Log in to Directus', body: 'Go to https://admin.healthystartgroup.com and sign in with your admin credentials.' },
  { title: 'Open the Forms collection', body: 'In the left sidebar, click on Content → Forms. You\'ll see a list of existing forms.' },
  { title: 'Create a new form', body: 'Click the + button. Fill in the Title (shown to patients on the intro screen) and Description (shown below the title). Leave Status as draft for now.' },
  { title: 'Add fields', body: 'Scroll down to the Fields section. Click "Create New" to add each field. For every field, set: Type, Label, Slug (a unique identifier like firstname or email), Placeholder (optional), Required toggle, and Sort order.' },
  { title: 'Set the sort order carefully', body: 'The Sort value determines which step each field appears on. Field with sort=1 appears first, sort=2 second, and so on. Every field = one step in the patient wizard.' },
]

// ─── Scroll-spy ────────────────────────────────────────────────────────────
const activeSection  = ref('overview')
const mobileMenuOpen = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activeSection.value = entry.target.id
      })
    },
    { rootMargin: '-56px 0px -65% 0px', threshold: 0 }
  )
  sections.forEach((s) => {
    const el = document.getElementById(s.id)
    if (el) observer.observe(el)
  })
})

const scrollTo = (id) => {
  mobileMenuOpen.value = false
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC]">

    <!-- ── HEADER ───────────────────────────────────────────────────────── -->
    <header class="fixed top-0 inset-x-0 z-50 h-14 bg-white/90 backdrop-blur-lg border-b border-gray-200">
      <div class="h-full max-w-screen-xl mx-auto px-5 sm:px-8 flex items-center gap-3">
        <Logo variant="dark" class="h-7 w-auto shrink-0" />
        <div class="w-px h-5 bg-gray-200 shrink-0" />
        <span class="text-sm font-semibold text-secondary tracking-wide">Documentation</span>
      </div>
    </header>

    <!-- ── BODY: empuja todo el contenido debajo del header fijo ─────────── -->
    <div class="pt-14">

      <!-- ── MOBILE NAV BAR ──────────────────────────────────────────────── -->
      <div class="lg:hidden sticky top-14 z-40 h-10 bg-white/90 backdrop-blur border-b border-gray-200 flex items-center gap-2 px-5">
        <UButton variant="ghost" color="neutral" icon="i-lucide-menu" label="Navigation" size="xs" @click="mobileMenuOpen = true" />
      </div>

      <!-- ── MOBILE SLIDEOVER ────────────────────────────────────────────── -->
      <USlideover v-model:open="mobileMenuOpen" side="left">
        <div class="flex flex-col h-full">
          <div class="px-5 pt-6 pb-4 border-b border-gray-100">
            <Logo variant="dark" class="h-6 w-auto" />
          </div>
          <div class="flex-1 overflow-y-auto px-4 py-5">
            <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3 px-2">On this page</p>
            <nav class="space-y-px">
              <button
                v-for="section in sections"
                :key="section.id"
                @click="scrollTo(section.id)"
                :class="[
                  'w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors',
                  activeSection === section.id
                    ? 'text-primary bg-primary/5 font-semibold'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                ]"
              >
                {{ section.label }}
              </button>
            </nav>
          </div>
        </div>
      </USlideover>

      <!-- ── LAYOUT ──────────────────────────────────────────────────────── -->
      <div class="flex min-h-[calc(100vh-3.5rem)]">

        <!-- Sidebar — desktop ─────────────────────────────────────────── -->
        <aside class="hidden lg:flex flex-col fixed top-14 left-0 w-60 h-[calc(100vh-3.5rem)] border-r border-gray-200 bg-white">
          <div class="flex-1 overflow-y-auto py-8 px-4">
            <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4 px-2">On this page</p>
            <nav class="space-y-px">
              <button
                v-for="section in sections"
                :key="section.id"
                @click="scrollTo(section.id)"
                :class="[
                  'w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors',
                  activeSection === section.id
                    ? 'text-primary bg-primary/5 font-semibold'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                ]"
              >
                {{ section.label }}
              </button>
            </nav>
          </div>
          <div class="shrink-0 border-t border-gray-100 p-5">
            <Logo variant="dark" class="h-5 w-auto opacity-30" />
          </div>
        </aside>

        <!-- ── MAIN CONTENT ─────────────────────────────────────────────── -->
        <main class="flex-1 min-w-0 lg:pl-60">
          <div class="max-w-[756px] mx-auto px-6 sm:px-10">

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- SECTION 1: OVERVIEW                                            -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <section id="overview" class="scroll-mt-24 py-14 border-b border-gray-100">
          <div class="flex items-center gap-2.5 mb-3">
            <UIcon name="i-lucide-info" class="size-5 text-primary shrink-0" />
            <h1 class="text-xl font-bold text-secondary">Overview</h1>
          </div>
          <p class="text-gray-500 text-sm leading-relaxed mb-6">What this system is and how it works</p>

          <p class="text-gray-700 leading-relaxed mb-8">
            The <strong class="text-secondary">HealthyStart Group Forms System</strong> is a dynamic form builder that allows administrators to create patient-facing forms entirely from the Directus CMS — no code changes required. Each form is a multi-step wizard where patients answer one question at a time. Upon submission, a signed PDF evidence document is automatically generated and stored.
          </p>

          <!-- Feature cards -->
          <div class="grid sm:grid-cols-2 gap-4 mb-8">
            <UCard>
              <div class="flex items-start gap-3">
                <div class="p-2 bg-primary/10 rounded-lg shrink-0">
                  <UIcon name="i-lucide-list-ordered" class="size-5 text-primary" />
                </div>
                <div>
                  <p class="font-semibold text-secondary">Multi-step wizard</p>
                  <p class="text-sm text-gray-500 mt-1">One question per screen. Patients focus on each answer without being overwhelmed.</p>
                </div>
              </div>
            </UCard>
            <UCard>
              <div class="flex items-start gap-3">
                <div class="p-2 bg-primary/10 rounded-lg shrink-0">
                  <UIcon name="i-lucide-text-cursor-input" class="size-5 text-primary" />
                </div>
                <div>
                  <p class="font-semibold text-secondary">9 field types</p>
                  <p class="text-sm text-gray-500 mt-1">Text, email, phone, dropdowns, radio, checkboxes, toggles, and digital signature.</p>
                </div>
              </div>
            </UCard>
            <UCard>
              <div class="flex items-start gap-3">
                <div class="p-2 bg-primary/10 rounded-lg shrink-0">
                  <UIcon name="i-lucide-file-check" class="size-5 text-primary" />
                </div>
                <div>
                  <p class="font-semibold text-secondary">Automatic PDF evidence</p>
                  <p class="text-sm text-gray-500 mt-1">A signed PDF is generated on every submission and stored in Directus for download.</p>
                </div>
              </div>
            </UCard>
            <UCard>
              <div class="flex items-start gap-3">
                <div class="p-2 bg-primary/10 rounded-lg shrink-0">
                  <UIcon name="i-lucide-database" class="size-5 text-primary" />
                </div>
                <div>
                  <p class="font-semibold text-secondary">Directus-powered</p>
                  <p class="text-sm text-gray-500 mt-1">All forms, fields, and submissions are managed from the Directus admin panel.</p>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Quick flow -->
          <UCard>
            <p class="text-sm font-semibold text-secondary mb-4">High-level flow</p>
            <div class="flex flex-wrap items-center gap-2 text-sm">
              <span class="px-3 py-1.5 bg-secondary text-white rounded-full font-medium">Admin creates form in Directus</span>
              <UIcon name="i-lucide-arrow-right" class="text-gray-400 size-4" />
              <span class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full font-medium">Patient opens public URL</span>
              <UIcon name="i-lucide-arrow-right" class="text-gray-400 size-4" />
              <span class="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full font-medium">Completes multi-step form</span>
              <UIcon name="i-lucide-arrow-right" class="text-gray-400 size-4" />
              <span class="px-3 py-1.5 bg-primary text-white rounded-full font-medium">PDF evidence generated & stored</span>
            </div>
          </UCard>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- SECTION 2: CREATE A FORM                                       -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <section id="create-form" class="scroll-mt-24 py-14 border-b border-gray-100">
          <div class="flex items-center gap-2.5 mb-3">
            <UIcon name="i-lucide-plus-circle" class="size-5 text-primary shrink-0" />
            <h2 class="text-xl font-bold text-secondary">Create a Form</h2>
          </div>
          <p class="text-gray-500 text-sm leading-relaxed mb-6">Step-by-step guide to building a new form in Directus</p>

          <div class="space-y-4">
            <div v-for="(step, i) in createFormSteps" :key="i" class="flex gap-4">
              <div class="flex flex-col items-center">
                <div class="size-8 rounded-full bg-secondary text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {{ i + 1 }}
                </div>
                <div v-if="i < 4" class="w-px flex-1 bg-gray-200 mt-2 mb-0"></div>
              </div>
              <UCard class="flex-1 mb-1">
                <p class="font-semibold text-secondary mb-1">{{ step.title }}</p>
                <p class="text-sm text-gray-600 leading-relaxed">{{ step.body }}</p>
              </UCard>
            </div>
          </div>

          <UAlert
            class="mt-6"
            icon="i-lucide-lightbulb"
            color="primary"
            variant="soft"
            title="One field = one step"
            description="Every field you add to a form becomes its own step in the patient-facing wizard. If you want multiple questions on one screen, that's not currently supported — each field is always shown individually."
          />
        </section>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- SECTION 3: FIELD TYPES                                         -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <section id="field-types" class="scroll-mt-24 py-14 border-b border-gray-100">
          <div class="flex items-center gap-2.5 mb-3">
            <UIcon name="i-lucide-text-cursor-input" class="size-5 text-primary shrink-0" />
            <h2 class="text-xl font-bold text-secondary">Field Types</h2>
          </div>
          <p class="text-gray-500 text-sm leading-relaxed mb-6">9 types available — the preview shows exactly what patients see</p>

          <div class="grid sm:grid-cols-2 gap-5">

            <!-- input -->
            <UCard>
              <div class="flex items-center justify-between mb-3">
                <p class="font-semibold text-secondary">Text Input</p>
                <UBadge label="input" color="secondary" variant="soft" size="sm" />
              </div>
              <p class="text-sm text-gray-500 mb-4">Single-line text. For names, cities, ZIP codes.</p>
              <UInput placeholder="e.g. John Doe" size="xl" class="w-full" />
            </UCard>

            <!-- email -->
            <UCard>
              <div class="flex items-center justify-between mb-3">
                <p class="font-semibold text-secondary">Email</p>
                <UBadge label="email" color="secondary" variant="soft" size="sm" />
              </div>
              <p class="text-sm text-gray-500 mb-4">Email input with validation.</p>
              <UInput type="email" placeholder="e.g. john@example.com" size="xl" class="w-full" />
            </UCard>

            <!-- tel -->
            <UCard>
              <div class="flex items-center justify-between mb-3">
                <p class="font-semibold text-secondary">Phone Number</p>
                <UBadge label="tel" color="secondary" variant="soft" size="sm" />
              </div>
              <p class="text-sm text-gray-500 mb-4">Phone input. Triggers numeric keyboard on mobile.</p>
              <UInput type="tel" placeholder="e.g. 477-472-9122" size="xl" class="w-full" />
            </UCard>

            <!-- textarea -->
            <UCard>
              <div class="flex items-center justify-between mb-3">
                <p class="font-semibold text-secondary">Long Text</p>
                <UBadge label="textarea" color="secondary" variant="soft" size="sm" />
              </div>
              <p class="text-sm text-gray-500 mb-4">Multi-line. For addresses, notes.</p>
              <UTextarea placeholder="e.g. 667 Ruben Ferry, Port Ahmad, SD 39427" size="xl" class="w-full" />
            </UCard>

            <!-- select -->
            <UCard>
              <div class="flex items-center justify-between mb-3">
                <p class="font-semibold text-secondary">Dropdown</p>
                <UBadge label="select" color="primary" variant="soft" size="sm" />
              </div>
              <p class="text-sm text-gray-500 mb-4">Single selection from a dropdown. <strong>Requires Options.</strong></p>
              <USelect v-model="previewSelect" :items="stateOptions" placeholder="Select your state" size="xl" class="w-full" />
            </UCard>

            <!-- radio -->
            <UCard>
              <div class="flex items-center justify-between mb-3">
                <p class="font-semibold text-secondary">Single Choice</p>
                <UBadge label="radio" color="primary" variant="soft" size="sm" />
              </div>
              <p class="text-sm text-gray-500 mb-4">All options visible as cards. Pick one. <strong>Requires Options.</strong></p>
              <URadioGroup v-model="previewRadio" :items="medicaidOptions" orientation="horizontal" variant="card" class="w-full justify-center" />
            </UCard>

            <!-- checkbox -->
            <UCard>
              <div class="flex items-center justify-between mb-3">
                <p class="font-semibold text-secondary">Multi Choice</p>
                <UBadge label="checkbox" color="primary" variant="soft" size="sm" />
              </div>
              <p class="text-sm text-gray-500 mb-4">All options visible as cards. Pick multiple. <strong>Requires Options.</strong></p>
              <UCheckboxGroup v-model="previewCheck" :items="medicareOptions" orientation="horizontal" variant="card" class="w-full justify-center" />
            </UCard>

            <!-- toggle -->
            <UCard>
              <div class="flex items-center justify-between mb-3">
                <p class="font-semibold text-secondary">Yes / No</p>
                <UBadge label="toggle" color="secondary" variant="soft" size="sm" />
              </div>
              <p class="text-sm text-gray-500 mb-4">Single confirmation checkbox.</p>
              <UAlert variant="soft" color="neutral" class="mb-3 text-xs" description='The Note field is the heading. The Label field is the text beside the checkbox.' />
              <UCheckbox
                v-model="previewToggle"
                label="Yes, please contact me with more information about HealthyStart Group Plans."
                variant="card"
                class="w-full"
              />
            </UCard>

            <!-- signature -->
            <UCard class="sm:col-span-2">
              <div class="flex items-center justify-between mb-3">
                <p class="font-semibold text-secondary">Signature</p>
                <UBadge label="signature" color="secondary" variant="soft" size="sm" />
              </div>
              <p class="text-sm text-gray-500 mb-4">Patient draws their signature on a canvas. Saved as an SVG file in Directus.</p>
              <div class="border border-dashed border-gray-300 rounded-xl bg-gray-50 h-28 flex items-center justify-center">
                <div class="text-center text-gray-400">
                  <UIcon name="i-lucide-pen-line" class="size-8 mb-1" />
                  <p class="text-sm">Signature canvas — draws here</p>
                </div>
              </div>
            </UCard>

          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- SECTION 4: CONFIGURE OPTIONS                                   -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <section id="configure-options" class="scroll-mt-24 py-14 border-b border-gray-100">
          <div class="flex items-center gap-2.5 mb-3">
            <UIcon name="i-lucide-settings-2" class="size-5 text-primary shrink-0" />
            <h2 class="text-xl font-bold text-secondary">Configure Options</h2>
          </div>
          <p class="text-gray-500 text-sm leading-relaxed mb-6">For <code class="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">select</code>, <code class="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">radio</code>, and <code class="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">checkbox</code> field types</p>

          <UCard class="mb-6">
            <p class="font-semibold text-secondary mb-3">Format</p>
            <p class="text-sm text-gray-600 mb-4">The Options field in Directus must contain a valid JSON array. Each item has a <code class="bg-gray-100 px-1 rounded text-xs font-mono">label</code> (what the patient sees) and a <code class="bg-gray-100 px-1 rounded text-xs font-mono">value</code> (what gets stored in the submission).</p>
            <pre class="bg-gray-900 text-green-400 rounded-xl p-5 font-mono text-sm overflow-x-auto leading-relaxed"><code>[
  { "label": "Yes", "value": "yes" },
  { "label": "No",  "value": "no"  },
  { "label": "Not sure", "value": "not_sure" }
]</code></pre>
          </UCard>

          <UCard class="mb-6">
            <p class="font-semibold text-secondary mb-3">US States example (select)</p>
            <pre class="bg-gray-900 text-green-400 rounded-xl p-5 font-mono text-sm overflow-x-auto leading-relaxed"><code>[
  { "label": "Florida",    "value": "FL" },
  { "label": "New York",   "value": "NY" },
  { "label": "California", "value": "CA" },
  { "label": "Texas",      "value": "TX" }
]</code></pre>
          </UCard>

          <UAlert
            icon="i-lucide-triangle-alert"
            color="warning"
            variant="soft"
            title="Common mistakes to avoid"
            class="mb-6"
          >
            <template #description>
              <ul class="list-disc list-inside space-y-1 text-sm mt-1">
                <li>Trailing comma after the last item: <code class="bg-yellow-100 px-1 rounded font-mono text-xs">{"value":"no"},</code> ← invalid</li>
                <li>Missing quotes around keys: <code class="bg-yellow-100 px-1 rounded font-mono text-xs">{label: "Yes"}</code> ← invalid, must be <code class="bg-yellow-100 px-1 rounded font-mono text-xs">{"label": "Yes"}</code></li>
                <li>Using single quotes: <code class="bg-yellow-100 px-1 rounded font-mono text-xs">{'label': 'Yes'}</code> ← invalid JSON (only double quotes)</li>
              </ul>
            </template>
          </UAlert>

          <UCard>
            <p class="font-semibold text-secondary mb-3">Special case: Toggle field</p>
            <p class="text-sm text-gray-600 mb-3">The <code class="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">toggle</code> type does <strong>not</strong> use the Options field. Instead:</p>
            <div class="grid sm:grid-cols-2 gap-3">
              <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Note field</p>
                <p class="text-sm text-gray-700">Shown as the heading <strong>above</strong> the checkbox</p>
                <p class="text-xs text-gray-400 mt-1 italic">e.g. "We can help you find a policy that's right for you."</p>
              </div>
              <div class="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p class="text-xs font-semibold text-gray-500 uppercase mb-1">Label field</p>
                <p class="text-sm text-gray-700">Shown as the text <strong>beside</strong> the checkbox</p>
                <p class="text-xs text-gray-400 mt-1 italic">e.g. "Yes, please contact me with more information…"</p>
              </div>
            </div>
          </UCard>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- SECTION 5: PUBLISH & SHARE                                     -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <section id="publish-share" class="scroll-mt-24 py-14 border-b border-gray-100">
          <div class="flex items-center gap-2.5 mb-3">
            <UIcon name="i-lucide-share-2" class="size-5 text-primary shrink-0" />
            <h2 class="text-xl font-bold text-secondary">Publish & Share</h2>
          </div>
          <p class="text-gray-500 text-sm leading-relaxed mb-6">Make a form accessible to patients</p>

          <div class="space-y-4 mb-6">
            <UCard>
              <div class="flex gap-4 items-start">
                <div class="size-8 rounded-full bg-secondary text-white text-sm font-bold flex items-center justify-center shrink-0">1</div>
                <div>
                  <p class="font-semibold text-secondary">Open the form in Directus</p>
                  <p class="text-sm text-gray-600 mt-1">Navigate to Content → Forms and click the form you want to publish.</p>
                </div>
              </div>
            </UCard>
            <UCard>
              <div class="flex gap-4 items-start">
                <div class="size-8 rounded-full bg-secondary text-white text-sm font-bold flex items-center justify-center shrink-0">2</div>
                <div>
                  <p class="font-semibold text-secondary">Change status to Published</p>
                  <p class="text-sm text-gray-600 mt-1">In the Status field at the top, change from</p>
                  <div class="flex items-center gap-2 mt-2">
                    <UBadge label="draft" color="neutral" variant="soft" />
                    <UIcon name="i-lucide-arrow-right" class="size-4 text-gray-400" />
                    <UBadge label="published" color="primary" variant="soft" />
                  </div>
                  <p class="text-sm text-gray-600 mt-2">Save the item.</p>
                </div>
              </div>
            </UCard>
            <UCard>
              <div class="flex gap-4 items-start">
                <div class="size-8 rounded-full bg-secondary text-white text-sm font-bold flex items-center justify-center shrink-0">3</div>
                <div>
                  <p class="font-semibold text-secondary">Copy the form ID</p>
                  <p class="text-sm text-gray-600 mt-1">The form's UUID is visible in the Directus URL bar or in the ID field. It looks like: <code class="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">703de9db-ce43-4daa-a224-f7743fc8b9b1</code></p>
                </div>
              </div>
            </UCard>
          </div>

          <UAlert
            icon="i-lucide-link"
            color="primary"
            variant="soft"
            title="Public URL pattern"
            description="Share this link with patients — replace <form-uuid> with your form's ID:"
            class="mb-4"
          />
          <pre class="bg-gray-900 text-green-400 rounded-xl px-5 py-4 font-mono text-sm overflow-x-auto">https://forms.healthystartgroup.com/forms/<span class="text-yellow-300">&lt;form-uuid&gt;</span></pre>

          <UAlert
            class="mt-6"
            icon="i-lucide-eye-off"
            color="neutral"
            variant="soft"
            title="Draft forms are not publicly accessible"
            description="If a patient tries to access a form with status 'draft', the page will not load. Only published forms are visible."
          />
        </section>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- SECTION 6: REVIEW SUBMISSIONS                                  -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <section id="review-submissions" class="scroll-mt-24 py-14 border-b border-gray-100">
          <div class="flex items-center gap-2.5 mb-3">
            <UIcon name="i-lucide-clipboard-list" class="size-5 text-primary shrink-0" />
            <h2 class="text-xl font-bold text-secondary">Review Submissions</h2>
          </div>
          <p class="text-gray-500 text-sm leading-relaxed mb-6">Where to find and manage patient responses</p>

          <div class="space-y-4 mb-8">
            <UCard>
              <p class="font-semibold text-secondary mb-3">Where to find submissions</p>
              <p class="text-sm text-gray-600 leading-relaxed">In the Directus admin panel, go to <strong>Content → Form Submissions</strong>. You'll see a list of all submissions across all forms, ordered by most recent first.</p>
            </UCard>

            <UCard>
              <p class="font-semibold text-secondary mb-3">What each submission contains</p>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-100">
                      <th class="text-left py-2 pr-4 font-semibold text-gray-500 text-xs uppercase">Field</th>
                      <th class="text-left py-2 font-semibold text-gray-500 text-xs uppercase">Description</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    <tr v-for="row in [
                      { field: 'ID', desc: 'Unique UUID of this submission' },
                      { field: 'Form', desc: 'Which form was filled out' },
                      { field: 'Status', desc: 'published / draft / archived' },
                      { field: 'Date Started', desc: 'When the patient opened the form' },
                      { field: 'Evidence', desc: 'The generated PDF file (click to download)' },
                      { field: 'Answers', desc: 'Nested list of all field answers' },
                    ]" :key="row.field">
                      <td class="py-2.5 pr-4 font-mono text-xs text-secondary font-medium">{{ row.field }}</td>
                      <td class="py-2.5 text-gray-600">{{ row.desc }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </UCard>

            <UCard>
              <p class="font-semibold text-secondary mb-3">How to see the answers</p>
              <p class="text-sm text-gray-600 leading-relaxed">Click on any submission to open it. Scroll down to the <strong>Answers</strong> section — you'll see each answer with its corresponding field reference and the patient's value.</p>
            </UCard>

            <UCard>
              <p class="font-semibold text-secondary mb-3">How to download the PDF evidence</p>
              <p class="text-sm text-gray-600 leading-relaxed">Inside a submission, click the <strong>Evidence</strong> file field. The PDF will open in a new tab or trigger a download. You can also find all PDFs in <strong>File Library</strong> inside Directus.</p>
            </UCard>

            <UCard>
              <p class="font-semibold text-secondary mb-3">Filtering submissions</p>
              <p class="text-sm text-gray-600 leading-relaxed">Use the Directus built-in filters to narrow down submissions. Common filters: <strong>by form</strong> (filter where form equals a specific form ID), <strong>by date</strong> (date_started after/before a date), or <strong>by status</strong>.</p>
            </UCard>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- SECTION 7: DATA MANAGEMENT                                     -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <section id="data-management" class="scroll-mt-24 py-14 border-b border-gray-100">
          <div class="flex items-center gap-2.5 mb-3">
            <UIcon name="i-lucide-database" class="size-5 text-primary shrink-0" />
            <h2 class="text-xl font-bold text-secondary">Data Management</h2>
          </div>
          <p class="text-gray-500 text-sm leading-relaxed mb-6">Directus collections and their relationships</p>

          <!-- Relationship diagram -->
          <UCard class="mb-8">
            <p class="font-semibold text-secondary mb-4">Collection relationships</p>
            <div class="overflow-x-auto">
              <div class="flex items-start gap-3 min-w-[560px] text-xs font-mono">
                <div class="border-2 border-secondary rounded-lg px-3 py-2 bg-secondary/5 text-secondary font-semibold">forms</div>
                <div class="flex flex-col justify-around h-16 text-gray-400">
                  <div class="flex items-center gap-1"><span>──(o2m)──▶</span></div>
                  <div class="flex items-center gap-1"><span>──(o2m)──▶</span></div>
                </div>
                <div class="flex flex-col gap-3">
                  <div class="border-2 border-primary rounded-lg px-3 py-2 bg-primary/5 text-primary font-semibold">form_fields</div>
                  <div class="border-2 border-primary rounded-lg px-3 py-2 bg-primary/5 text-primary font-semibold">form_submissions</div>
                </div>
                <div class="flex items-end pb-0.5 text-gray-400 mt-9">
                  <span>──(o2m)──▶</span>
                </div>
                <div class="flex flex-col justify-end h-16">
                  <div class="border-2 border-gray-400 rounded-lg px-3 py-2 bg-gray-50 text-gray-600 font-semibold">form_answers</div>
                </div>
                <div class="flex items-end pb-0.5 text-gray-400 mt-9 text-[10px] flex-col justify-end h-16 gap-1">
                  <span class="text-gray-300">◀──(m2o)──</span>
                  <span class="text-gray-300 text-[9px] italic">(references form_fields)</span>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Collection tables -->
          <div class="space-y-6">
            <UCard v-for="collection in schemaCollections" :key="collection.name">
              <div class="flex items-center gap-2 mb-1">
                <UBadge :label="collection.name" color="secondary" variant="soft" class="font-mono" />
              </div>
              <p class="text-sm text-gray-500 mb-4">{{ collection.description }}</p>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-100">
                      <th class="text-left py-2 pr-4 font-semibold text-gray-500 text-xs uppercase w-32">Field</th>
                      <th class="text-left py-2 pr-4 font-semibold text-gray-500 text-xs uppercase w-20">Type</th>
                      <th class="text-left py-2 font-semibold text-gray-500 text-xs uppercase">Description</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    <tr v-for="f in collection.fields" :key="f.field">
                      <td class="py-2 pr-4 font-mono text-xs text-secondary font-medium">{{ f.field }}</td>
                      <td class="py-2 pr-4">
                        <UBadge
                          :label="f.type"
                          :color="f.type === 'O2M' || f.type === 'M2O' ? 'primary' : 'neutral'"
                          variant="soft"
                          size="xs"
                        />
                      </td>
                      <td class="py-2 text-gray-600 text-xs leading-relaxed">{{ f.description }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </UCard>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- SECTION 8: ARCHITECTURE                                        -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <section id="architecture" class="scroll-mt-24 py-14 border-b border-gray-100">
          <div class="flex items-center gap-2.5 mb-3">
            <UIcon name="i-lucide-workflow" class="size-5 text-primary shrink-0" />
            <h2 class="text-xl font-bold text-secondary">Architecture</h2>
          </div>
          <p class="text-gray-500 text-sm leading-relaxed mb-6">Full technical flow from form creation to PDF evidence</p>

          <UCard class="mb-8">
            <p class="font-semibold text-secondary mb-6">End-to-end submission flow</p>
            <div class="overflow-x-auto">
              <div class="min-w-[560px] space-y-2">

                <div v-for="(node, i) in [
                  { label: 'Admin creates Form + Fields in Directus', sub: 'admin.healthystartgroup.com', color: 'bg-secondary text-white', icon: 'i-lucide-user-cog' },
                  { label: 'Patient opens public URL', sub: 'forms.healthystartgroup.com/forms/<uuid>', color: 'bg-gray-100 text-gray-700', icon: 'i-lucide-globe' },
                  { label: 'Nuxt fetches form data from Directus REST API', sub: 'GET /items/forms/<id>?fields=…', color: 'bg-gray-100 text-gray-700', icon: 'i-lucide-arrow-left-right' },
                  { label: 'Patient completes multi-step wizard', sub: 'One field per step — Next / Back navigation', color: 'bg-gray-100 text-gray-700', icon: 'i-lucide-list-checks' },
                  { label: 'Submit: form_submission + form_answers created', sub: 'POST /items/form_submissions  •  POST /items/form_answers', color: 'bg-primary/10 text-primary border border-primary/30', icon: 'i-lucide-send' },
                  { label: 'POST /api/pdf → Puppeteer renders /pdf?submission=ID', sub: 'Chromium opens the page, generates A4 landscape PDF, returns base64', color: 'bg-primary/10 text-primary border border-primary/30', icon: 'i-lucide-file-text' },
                  { label: 'PDF uploaded to Directus File Library', sub: 'POST /files  →  returns file UUID', color: 'bg-primary/10 text-primary border border-primary/30', icon: 'i-lucide-upload-cloud' },
                  { label: 'form_submission.evidence updated with file UUID', sub: 'PATCH /items/form_submissions/<id>  {evidence: <uuid>}', color: 'bg-secondary text-white', icon: 'i-lucide-check-circle' },
                  { label: 'Patient downloads PDF evidence', sub: 'admin.healthystartgroup.com/assets/<file-uuid>', color: 'bg-secondary text-white', icon: 'i-lucide-download' },
                ]" :key="i" class="flex items-start gap-3">
                  <div class="flex flex-col items-center shrink-0">
                    <div :class="['size-9 rounded-full flex items-center justify-center shrink-0', node.color]">
                      <UIcon :name="node.icon" class="size-4" />
                    </div>
                    <div v-if="i < 8" class="w-px h-6 bg-gray-200 mt-1"></div>
                  </div>
                  <div class="pt-1.5">
                    <p class="text-sm font-semibold text-gray-800">{{ node.label }}</p>
                    <p class="text-xs text-gray-400 font-mono mt-0.5">{{ node.sub }}</p>
                  </div>
                </div>

              </div>
            </div>
          </UCard>

          <UCard>
            <p class="font-semibold text-secondary mb-4">Tech stack</p>
            <div class="grid sm:grid-cols-3 gap-3">
              <div v-for="item in [
                { layer: 'Frontend', tech: 'Nuxt 3 + Vue 3 + NuxtUI', icon: 'i-lucide-layout' },
                { layer: 'Styles', tech: 'Tailwind CSS v4 + Poppins', icon: 'i-lucide-paintbrush' },
                { layer: 'CMS / API', tech: 'Directus + REST SDK v19', icon: 'i-lucide-database' },
                { layer: 'PDF', tech: 'Puppeteer + @sparticuz/chromium', icon: 'i-lucide-file-text' },
                { layer: 'Hosting', tech: 'Vercel (serverless)', icon: 'i-lucide-cloud' },
                { layer: 'Auth', tech: 'Directus JWT + cookie', icon: 'i-lucide-lock' },
              ]" :key="item.layer" class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div class="p-2 bg-white rounded-lg shadow-sm shrink-0">
                  <UIcon :name="item.icon" class="size-4 text-primary" />
                </div>
                <div>
                  <p class="text-xs font-semibold text-gray-400 uppercase">{{ item.layer }}</p>
                  <p class="text-sm font-medium text-secondary">{{ item.tech }}</p>
                </div>
              </div>
            </div>
          </UCard>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- SECTION 9: FAQ                                                 -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <section id="faq" class="scroll-mt-24 py-14">
          <div class="flex items-center gap-2.5 mb-3">
            <UIcon name="i-lucide-help-circle" class="size-5 text-primary shrink-0" />
            <h2 class="text-xl font-bold text-secondary">FAQ & Troubleshooting</h2>
          </div>
          <p class="text-gray-500 text-sm leading-relaxed mb-6">Common questions and how to solve them</p>

          <UAccordion :items="faqItems" class="space-y-2" />
        </section>

        <!-- Footer -->
        <div class="border-t border-gray-100 py-10 text-center">
          <Logo variant="dark" class="h-5 w-auto mx-auto mb-3 opacity-30" />
          <p class="text-xs text-gray-400">
            HealthyStart Group Forms System ·
            Powered by <a href="https://zunamicorp.com" target="_blank" rel="noopener" class="text-primary hover:underline">ZunamiCorp</a>
          </p>
        </div>

          </div>
        </main>
      </div>
    </div>

  </div>
</template>

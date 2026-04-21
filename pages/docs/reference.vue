<script setup>
useHead({ title: 'Reference — HSG Forms Docs' })

const activeSection = useState('docsActiveSection')

// ─── FAQ items ────────────────────────────────────────────────────────────
const faqItems = [
  { label: 'My form is not appearing at its URL', slot: 'faq-status' },
  { label: 'Options are not showing for my select / radio / checkbox field', content: 'The Options field must contain valid JSON — an array of objects with "label" and "value" keys. Common mistake: trailing comma after the last item, or missing quotes around keys. Example: [{"label":"Yes","value":"yes"},{"label":"No","value":"no"}]' },
  { label: 'My fields appear in the wrong order', slot: 'faq-sort' },
  { label: 'My toggle field shows the wrong text', slot: 'faq-toggle' },
  { label: 'The signature is not saving', slot: 'faq-signature' },
  { label: 'PDF evidence is not generating', slot: 'faq-pdf' },
  { label: 'How do I make a field optional?', slot: 'faq-optional' },
]

// ─── Scroll spy ───────────────────────────────────────────────────────────
const sections = ['architecture', 'faq']

onMounted(() => {
  activeSection.value = 'architecture'

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => { if (e.isIntersecting) activeSection.value = e.target.id })
    },
    { rootMargin: '-56px 0px -65% 0px', threshold: 0 }
  )

  sections.forEach((id) => {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  })

  const hash = window.location.hash.slice(1)
  if (hash && sections.includes(hash)) {
    activeSection.value = hash
    nextTick(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
})
</script>

<template>
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- ARCHITECTURE                                                       -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <section id="architecture" class="scroll-mt-4 py-14 border-b border-gray-100">
    <div class="flex items-center gap-2.5 mb-3">
      <UIcon name="i-lucide-workflow" class="size-5 text-primary shrink-0" />
      <h1 class="text-xl font-bold text-secondary">Architecture</h1>
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
          { layer: 'Frontend', tech: 'Nuxt 3 + Vue 3 + NuxtUI',          icon: 'i-lucide-layout' },
          { layer: 'Styles',   tech: 'Tailwind CSS v4 + Poppins',         icon: 'i-lucide-paintbrush' },
          { layer: 'CMS / API',tech: 'Directus + REST SDK v19',           icon: 'i-lucide-database' },
          { layer: 'PDF',      tech: 'Puppeteer + @sparticuz/chromium',   icon: 'i-lucide-file-text' },
          { layer: 'Hosting',  tech: 'Vercel (serverless)',               icon: 'i-lucide-cloud' },
          { layer: 'Auth',     tech: 'Directus JWT + cookie',             icon: 'i-lucide-lock' },
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

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- FAQ                                                                -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <section id="faq" class="scroll-mt-4 py-14">
    <div class="flex items-center gap-2.5 mb-3">
      <UIcon name="i-lucide-help-circle" class="size-5 text-primary shrink-0" />
      <h2 class="text-xl font-bold text-secondary">FAQ & Troubleshooting</h2>
    </div>
    <p class="text-gray-500 text-sm leading-relaxed mb-6">Common questions and how to solve them</p>

    <UAccordion :items="faqItems" class="space-y-2">
      <template #faq-status>
        <p class="px-3 pb-3 text-sm text-gray-600 leading-relaxed">Make sure the form's <strong>Status</strong> is set to <strong>published</strong> in Directus. Draft forms return a 404. Also verify the UUID in the URL matches the form's <strong>ID</strong> field exactly.</p>
      </template>
      <template #faq-sort>
        <p class="px-3 pb-3 text-sm text-gray-600 leading-relaxed">Each field has a <strong>Sort</strong> property in Directus. Fields are shown in ascending sort order (1, 2, 3…). Go to the form's <strong>Fields</strong> section in Directus and update the <strong>Sort</strong> values to match the desired order.</p>
      </template>
      <template #faq-toggle>
        <p class="px-3 pb-3 text-sm text-gray-600 leading-relaxed">The Toggle type uses two different text properties: the <strong>Note</strong> field is shown as a heading above the checkbox, and the <strong>Label</strong> field is shown as the text beside the checkbox itself. Make sure both are filled in.</p>
      </template>
      <template #faq-signature>
        <p class="px-3 pb-3 text-sm text-gray-600 leading-relaxed">Check that the <strong>UPLOADS_FOLDER_ID</strong> environment variable is set correctly in Vercel and that the Directus folder exists. The folder ID must match an existing folder in <strong>Directus → File Library</strong>.</p>
      </template>
      <template #faq-pdf>
        <p class="px-3 pb-3 text-sm text-gray-600 leading-relaxed">Verify that <strong>BASE_URL</strong> is set to <a href="https://forms.healthystartgroup.com" target="_blank" rel="noopener" class="text-primary underline underline-offset-2 hover:opacity-80">https://forms.healthystartgroup.com</a> in Vercel environment variables. The PDF endpoint navigates to that URL internally using Puppeteer, so it must be the live production URL. On Vercel Pro, the serverless function has a 60s timeout; on Free it is 10s.</p>
      </template>
      <template #faq-optional>
        <p class="px-3 pb-3 text-sm text-gray-600 leading-relaxed">In Directus, open the field and turn off the <strong>Required</strong> toggle. Optional fields show <strong>Next</strong> enabled without requiring a value. Required fields keep <strong>Next</strong> disabled until the patient fills the field.</p>
      </template>
    </UAccordion>
  </section>
</template>

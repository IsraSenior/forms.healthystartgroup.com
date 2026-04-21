<script setup>
useHead({ title: 'Managing Data — HSG Forms Docs' })

const activeSection = useState('docsActiveSection')

// ─── Schema collections ───────────────────────────────────────────────────
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
      { field: 'placeholder', type: 'String',  description: 'Input placeholder text' },
      { field: 'Note',        type: 'Text',    description: 'Heading above the field (used as main heading for toggle)' },
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
      { field: 'value',       type: 'String',  description: 'The patient\'s answer (arrays stored as JSON string)' },
      { field: 'sort',        type: 'Integer', description: 'Order of answers' },
    ],
  },
]

// ─── Scroll spy ───────────────────────────────────────────────────────────
const sections = ['review-submissions', 'data-management']

onMounted(() => {
  activeSection.value = 'review-submissions'

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
  <!-- REVIEW SUBMISSIONS                                                 -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <section id="review-submissions" class="scroll-mt-4 py-14 border-b border-gray-100">
    <div class="flex items-center gap-2.5 mb-3">
      <UIcon name="i-lucide-clipboard-list" class="size-5 text-primary shrink-0" />
      <h1 class="text-xl font-bold text-secondary">Review Submissions</h1>
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
                { field: 'ID',           desc: 'Unique UUID of this submission' },
                { field: 'Form',         desc: 'Which form was filled out' },
                { field: 'Status',       desc: 'published / draft / archived' },
                { field: 'Date Started', desc: 'When the patient opened the form' },
                { field: 'Evidence',     desc: 'The generated PDF file (click to download)' },
                { field: 'Answers',      desc: 'Nested list of all field answers' },
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

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- DATA MANAGEMENT                                                    -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <section id="data-management" class="scroll-mt-4 py-14 border-b border-gray-100">
    <div class="flex items-center gap-2.5 mb-3">
      <UIcon name="i-lucide-database" class="size-5 text-primary shrink-0" />
      <h2 class="text-xl font-bold text-secondary">Data Management</h2>
    </div>
    <p class="text-gray-500 text-sm leading-relaxed mb-6">Directus collections and their relationships</p>

    <!-- Relationship diagram -->
    <UCard class="mb-8">
      <p class="font-semibold text-secondary mb-5">Collection relationships</p>
      <div class="space-y-2">
        <div v-for="rel in [
          { from: 'forms',            fromColor: 'border-secondary bg-secondary/5 text-secondary', rel: 'one-to-many', to: 'form_fields',      toColor: 'border-primary bg-primary/5 text-primary' },
          { from: 'forms',            fromColor: 'border-secondary bg-secondary/5 text-secondary', rel: 'one-to-many', to: 'form_submissions',  toColor: 'border-primary bg-primary/5 text-primary' },
          { from: 'form_submissions', fromColor: 'border-primary bg-primary/5 text-primary',       rel: 'one-to-many', to: 'form_answers',      toColor: 'border-gray-300 bg-gray-50 text-gray-600' },
          { from: 'form_answers',     fromColor: 'border-gray-300 bg-gray-50 text-gray-600',       rel: 'many-to-one', to: 'form_fields',       toColor: 'border-primary bg-primary/5 text-primary' },
        ]" :key="rel.from + rel.to" class="flex items-center gap-2 text-xs">
          <span :class="['font-mono font-semibold px-2.5 py-1 rounded-lg border-2 shrink-0', rel.fromColor]">{{ rel.from }}</span>
          <div class="flex items-center gap-1 shrink-0">
            <div class="h-px w-5 bg-gray-300"></div>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500 whitespace-nowrap">{{ rel.rel }}</span>
            <div class="h-px w-5 bg-gray-300"></div>
            <UIcon name="i-lucide-chevron-right" class="size-3 text-gray-400 -ml-1" />
          </div>
          <span :class="['font-mono font-semibold px-2.5 py-1 rounded-lg border-2 shrink-0', rel.toColor]">{{ rel.to }}</span>
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
</template>

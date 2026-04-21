<script setup>
useHead({ title: 'Building Forms — HSG Forms Docs' })

const activeSection = useState('docsActiveSection')

// ─── Create form steps ────────────────────────────────────────────────────
const createFormSteps = [
  { title: 'Log in to Directus', body: 'Go to <a href="https://admin.healthystartgroup.com" target="_blank" rel="noopener" class="text-primary underline underline-offset-2 hover:opacity-80">https://admin.healthystartgroup.com</a> and sign in with your admin credentials.' },
  { title: 'Open the Forms collection', body: 'In the left sidebar, click on <strong>Content → Forms</strong>. You\'ll see a list of existing forms.' },
  { title: 'Create a new form', body: 'Click the <strong>+</strong> button. Fill in the <strong>Title</strong> (shown to patients on the intro screen) and <strong>Description</strong> (shown below the title). Leave <strong>Status</strong> as draft for now.' },
  { title: 'Add fields', body: 'Scroll down to the <strong>Fields</strong> section. Click <strong>Create New</strong> to add each field. For every field, set: <strong>Type</strong>, <strong>Label</strong>, <strong>Slug</strong> (a unique identifier like firstname or email), <strong>Placeholder</strong> (optional), <strong>Required</strong> toggle, and <strong>Sort</strong> order.' },
  { title: 'Set the sort order carefully', body: 'The Sort value determines which step each field appears on. Field with sort=1 appears first, sort=2 second, and so on. Every field = one step in the patient wizard.' },
]

// ─── Preview mock data ────────────────────────────────────────────────────
const previewSelect    = ref(null)
const previewRadio     = ref(null)
const previewCheck     = ref([])
const previewToggle    = ref(false)
const previewSignature = ref(null)

const clearSignature = () => previewSignature.value?.clearCanvas()

const stateOptions = [
  { label: 'Florida',    value: 'FL' },
  { label: 'New York',   value: 'NY' },
  { label: 'California', value: 'CA' },
  { label: 'Texas',      value: 'TX' },
]
const medicaidOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No',  value: 'no'  },
]
const medicareOptions = [
  { label: 'Plan A', value: 'plan-a' },
  { label: 'Plan B', value: 'plan-b' },
]

// ─── Scroll spy ───────────────────────────────────────────────────────────
const sections = ['create-form', 'field-types', 'configure-options', 'publish-share']

onMounted(() => {
  activeSection.value = 'create-form'

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
  <!-- CREATE A FORM                                                      -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <section id="create-form" class="scroll-mt-4 py-14 border-b border-gray-100">
    <div class="flex items-center gap-2.5 mb-3">
      <UIcon name="i-lucide-plus-circle" class="size-5 text-primary shrink-0" />
      <h1 class="text-xl font-bold text-secondary">Create a Form</h1>
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
          <p class="text-sm text-gray-600 leading-relaxed" v-html="step.body"></p>
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

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- FIELD TYPES                                                        -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <section id="field-types" class="scroll-mt-4 py-14 border-b border-gray-100">
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
        <div class="w-full rounded-md ring ring-inset ring-accented bg-default px-2.5 py-1.5">
          <NuxtSignaturePad
            ref="previewSignature"
            height="140px"
            width="100%"
            :options="{ penColor: 'rgb(0,0,0)', backgroundColor: 'rgb(255,255,255)', maxWidth: 2, minWidth: 2 }"
          />
        </div>
        <div class="flex justify-center mt-3">
          <UButton size="xs" color="secondary" @click="clearSignature">Clear</UButton>
        </div>
      </UCard>

    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- CONFIGURE OPTIONS                                                  -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <section id="configure-options" class="scroll-mt-4 py-14 border-b border-gray-100">
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

  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- PUBLISH & SHARE                                                    -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <section id="publish-share" class="scroll-mt-4 py-14 border-b border-gray-100">
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
            <p class="text-sm text-gray-600 mt-1">Navigate to <strong>Content → Forms</strong> and click the form you want to publish.</p>
          </div>
        </div>
      </UCard>
      <UCard>
        <div class="flex gap-4 items-start">
          <div class="size-8 rounded-full bg-secondary text-white text-sm font-bold flex items-center justify-center shrink-0">2</div>
          <div>
            <p class="font-semibold text-secondary">Change status to Published</p>
            <p class="text-sm text-gray-600 mt-1">In the <strong>Status</strong> field at the top, change from</p>
            <div class="flex items-center gap-2 mt-2">
              <UBadge label="draft" color="neutral" variant="soft" />
              <UIcon name="i-lucide-arrow-right" class="size-4 text-gray-400" />
              <UBadge label="published" color="primary" variant="soft" />
            </div>
            <p class="text-sm text-gray-600 mt-2"><strong>Save</strong> the item.</p>
          </div>
        </div>
      </UCard>
      <UCard>
        <div class="flex gap-4 items-start">
          <div class="size-8 rounded-full bg-secondary text-white text-sm font-bold flex items-center justify-center shrink-0">3</div>
          <div>
            <p class="font-semibold text-secondary">Copy the form ID</p>
            <p class="text-sm text-gray-600 mt-1">The form's UUID is visible in the Directus URL bar or in the <strong>ID</strong> field. It looks like: <code class="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">703de9db-ce43-4daa-a224-f7743fc8b9b1</code></p>
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
</template>

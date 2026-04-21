<script setup>
useHead({ title: 'Overview — HSG Forms Docs' })

const activeSection = useState('docsActiveSection')

onMounted(() => {
  activeSection.value = 'overview'

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => { if (e.isIntersecting) activeSection.value = e.target.id })
    },
    { rootMargin: '-56px 0px -65% 0px', threshold: 0 }
  )

  const el = document.getElementById('overview')
  if (el) observer.observe(el)

  const hash = window.location.hash.slice(1)
  if (hash) {
    activeSection.value = hash
    nextTick(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }
})
</script>

<template>
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <!-- OVERVIEW                                                           -->
  <!-- ═══════════════════════════════════════════════════════════════════ -->
  <section id="overview" class="scroll-mt-4 py-14 border-b border-gray-100">
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
      <p class="text-sm font-semibold text-secondary mb-6">High-level flow</p>

      <!-- Desktop: horizontal stepper -->
      <div class="hidden sm:flex items-start">
        <template v-for="(step, i) in [
          { icon: 'i-lucide-user-cog',    label: 'Admin creates form',   sub: 'in Directus CMS',       bg: 'bg-secondary', text: 'text-white' },
          { icon: 'i-lucide-globe',        label: 'Patient opens URL',    sub: 'public form link',       bg: 'bg-gray-100',  text: 'text-secondary' },
          { icon: 'i-lucide-list-checks',  label: 'Completes wizard',     sub: 'one field per step',     bg: 'bg-gray-100',  text: 'text-secondary' },
          { icon: 'i-lucide-file-check-2', label: 'PDF auto-generated',   sub: 'stored in Directus',     bg: 'bg-primary',   text: 'text-white' },
        ]" :key="i">
          <div class="flex flex-col items-center flex-1 min-w-0 text-center">
            <div :class="['size-12 rounded-xl flex items-center justify-center mb-3 shadow-sm', step.bg]">
              <UIcon :name="step.icon" :class="['size-5', step.text]" />
            </div>
            <p class="text-xs font-semibold text-secondary leading-snug">{{ step.label }}</p>
            <p class="text-[11px] text-gray-400 mt-0.5">{{ step.sub }}</p>
          </div>
          <div v-if="i < 3" class="flex items-start pt-5 px-1 shrink-0">
            <div class="flex items-center gap-0.5">
              <div class="w-5 h-px bg-gray-200"></div>
              <UIcon name="i-lucide-chevron-right" class="size-3.5 text-gray-300 -ml-1" />
            </div>
          </div>
        </template>
      </div>

      <!-- Mobile: vertical timeline -->
      <div class="flex sm:hidden flex-col gap-0">
        <div v-for="(step, i) in [
          { icon: 'i-lucide-user-cog',    label: 'Admin creates form',   sub: 'in Directus CMS',       bg: 'bg-secondary', text: 'text-white' },
          { icon: 'i-lucide-globe',        label: 'Patient opens URL',    sub: 'public form link',       bg: 'bg-gray-100',  text: 'text-secondary' },
          { icon: 'i-lucide-list-checks',  label: 'Completes wizard',     sub: 'one field per step',     bg: 'bg-gray-100',  text: 'text-secondary' },
          { icon: 'i-lucide-file-check-2', label: 'PDF auto-generated',   sub: 'stored in Directus',     bg: 'bg-primary',   text: 'text-white' },
        ]" :key="i" class="flex items-start gap-3">
          <div class="flex flex-col items-center shrink-0">
            <div :class="['size-9 rounded-lg flex items-center justify-center shadow-sm', step.bg]">
              <UIcon :name="step.icon" :class="['size-4', step.text]" />
            </div>
            <div v-if="i < 3" class="w-px h-6 bg-gray-200 mt-1"></div>
          </div>
          <div class="pt-1.5 pb-2">
            <p class="text-xs font-semibold text-secondary leading-snug">{{ step.label }}</p>
            <p class="text-[11px] text-gray-400 mt-0.5">{{ step.sub }}</p>
          </div>
        </div>
      </div>
    </UCard>
  </section>
</template>

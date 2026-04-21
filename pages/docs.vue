<script setup>
useHead({ title: 'Documentation — HSG Forms' })

const route  = useRoute()
const router = useRouter()

// ─── Navigation groups (with page routes) ────────────────────────────────
const navGroups = [
  {
    label: 'Getting Started',
    route: '/docs',
    items: [
      { id: 'overview', label: 'Overview', icon: 'i-lucide-info' },
    ],
  },
  {
    label: 'Building Forms',
    route: '/docs/building-forms',
    items: [
      { id: 'create-form',       label: 'Create a Form',      icon: 'i-lucide-plus-circle' },
      { id: 'field-types',       label: 'Field Types',        icon: 'i-lucide-text-cursor-input' },
      { id: 'configure-options', label: 'Configure Options',  icon: 'i-lucide-settings-2' },
      { id: 'publish-share',     label: 'Publish & Share',    icon: 'i-lucide-share-2' },
    ],
  },
  {
    label: 'Managing Data',
    route: '/docs/managing-data',
    items: [
      { id: 'review-submissions', label: 'Review Submissions', icon: 'i-lucide-clipboard-list' },
      { id: 'data-management',    label: 'Data Management',    icon: 'i-lucide-database' },
    ],
  },
  {
    label: 'Reference',
    route: '/docs/reference',
    items: [
      { id: 'architecture', label: 'Architecture', icon: 'i-lucide-workflow' },
      { id: 'faq',          label: 'FAQ',          icon: 'i-lucide-help-circle' },
    ],
  },
]

// ─── Right panel data ──────────────────────────────────────────────────────
const quickTips = [
  'Each field becomes one step in the patient wizard',
  'Form status must be "published" for patients to access it',
  'Options fields require valid JSON — no trailing commas',
  'The Sort value controls the order of steps (1 = first)',
  'Toggle type uses Note as heading, Label as checkbox text',
]

const directusLinks = [
  { label: 'Filter Rules',        url: 'https://directus.io/docs/guides/connect/filter-rules',         icon: 'i-lucide-filter' },
  { label: 'Data Model',          url: 'https://directus.io/docs/guides/data-model',                    icon: 'i-lucide-boxes' },
  { label: 'Collections',         url: 'https://directus.io/docs/guides/data-model/collections',        icon: 'i-lucide-table-2' },
  { label: 'Fields & Types',      url: 'https://directus.io/docs/guides/data-model/fields',             icon: 'i-lucide-columns-3' },
  { label: 'Relations',           url: 'https://directus.io/docs/guides/data-model/relations',          icon: 'i-lucide-git-branch' },
  { label: 'File Library',        url: 'https://directus.io/docs/guides/files/upload',                  icon: 'i-lucide-folder-open' },
  { label: 'Roles & Permissions', url: 'https://directus.io/docs/guides/access-control/permissions',   icon: 'i-lucide-shield-check' },
  { label: 'Flows & Automation',  url: 'https://directus.io/docs/guides/flows',                        icon: 'i-lucide-zap' },
]

// ─── Shared active section state (child pages update via scroll-spy) ──────
const activeSection  = useState('docsActiveSection', () => 'overview')
const mobileMenuOpen = ref(false)

// ─── Active forms ─────────────────────────────────────────────────────────
const activeForms = ref([])
const { $directus, $readItems } = useNuxtApp()
const config = useRuntimeConfig()

try {
  activeForms.value = await $directus.request(
    $readItems('forms', {
      fields: ['id', 'title'],
      filter: { status: { _eq: 'published' } },
      sort: ['title'],
    })
  )
} catch { /* silently skip if unauthenticated */ }

// ─── Navigation handlers ──────────────────────────────────────────────────
function handleNavItem(item, group) {
  mobileMenuOpen.value = false
  if (route.path === group.route) {
    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } else {
    router.push({ path: group.route, hash: '#' + item.id })
  }
}

function scrollTo(id) {
  mobileMenuOpen.value = false
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC]">

    <!-- ── MOBILE NAV BAR ──────────────────────────────────────────────── -->
    <div class="lg:hidden sticky top-0 z-40 h-12 bg-white/90 backdrop-blur border-b border-gray-200 flex items-center justify-between px-4">
      <Logo icon-only class="h-7 w-auto" />
      <UButton variant="ghost" color="neutral" icon="i-lucide-menu" size="sm" @click="mobileMenuOpen = true" />
    </div>

    <!-- ── MOBILE SLIDEOVER ────────────────────────────────────────────── -->
    <USlideover v-model:open="mobileMenuOpen" side="left" title="Navigation" description="Main navigation menu" :ui="{ title: 'sr-only', description: 'sr-only' }">
      <template #content>
        <div class="flex flex-col h-full bg-secondary">
          <div class="shrink-0 px-5 py-4 border-b border-white/10 flex items-start justify-between gap-3">
            <div>
              <Logo class="h-8 w-auto" />
              <p class="text-[11px] text-white mt-2 font-medium tracking-wide">Forms System — Docs</p>
            </div>
            <button @click="mobileMenuOpen = false" class="mt-1 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors shrink-0">
              <UIcon name="i-lucide-x" class="size-4" />
            </button>
          </div>
          <nav class="flex-1 overflow-y-auto py-5 px-3">
            <div v-for="group in navGroups" :key="group.label" class="mb-5">
              <p class="text-[10px] font-bold text-white/60 uppercase tracking-widest px-3 mb-1.5">{{ group.label }}</p>
              <div class="space-y-px">
                <button
                  v-for="item in group.items"
                  :key="item.id"
                  @click="handleNavItem(item, group)"
                  :class="[
                    'w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
                    activeSection === item.id && route.path === group.route
                      ? 'text-white bg-white/15 font-semibold'
                      : 'text-white hover:bg-white/10'
                  ]"
                >
                  <UIcon
                    :name="item.icon"
                    :class="['size-3.5 shrink-0', activeSection === item.id && route.path === group.route ? 'text-primary' : 'text-white']"
                  />
                  {{ item.label }}
                </button>
              </div>
            </div>
            <div class="mt-2 pt-4 border-t border-white/10">
              <p class="text-[10px] font-bold text-white/60 uppercase tracking-widest px-3 mb-1.5">More</p>
              <button
                @click="scrollTo('resources')"
                class="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 text-white hover:bg-white/10"
              >
                <UIcon name="i-lucide-layout-panel-left" class="size-3.5 shrink-0 text-white" />
                Resources & Links
              </button>
            </div>
          </nav>
          <div class="shrink-0 border-t border-white/10 px-5 py-4">
            <p class="text-[10px] text-white leading-relaxed">
              Powered by
              <a href="https://www.zunamicorp.com" target="_blank" rel="noopener" class="font-semibold text-white transition-colors">Zunami Corp</a>
            </p>
          </div>
        </div>
      </template>
    </USlideover>

    <!-- ── LAYOUT ──────────────────────────────────────────────────────── -->
    <div class="flex min-h-[calc(100vh-3.5rem)]">

      <!-- Sidebar — desktop ──────────────────────────────────────────── -->
      <aside class="hidden lg:flex flex-col fixed top-0 left-0 w-64 h-screen bg-secondary">

        <div class="shrink-0 px-5 py-5 border-b border-white/10">
          <Logo class="h-8 w-auto" />
          <p class="text-[11px] text-white mt-2 font-medium tracking-wide">Forms System — Docs</p>
        </div>

        <nav class="flex-1 overflow-y-auto py-5 px-3">
          <div v-for="group in navGroups" :key="group.label" class="mb-5">
            <p :class="[
              'text-[10px] font-bold uppercase tracking-widest px-3 mb-1.5 transition-colors',
              route.path === group.route ? 'text-primary' : 'text-white/60'
            ]">
              {{ group.label }}
            </p>
            <div class="space-y-px">
              <button
                v-for="item in group.items"
                :key="item.id"
                @click="handleNavItem(item, group)"
                :class="[
                  'w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
                  activeSection === item.id && route.path === group.route
                    ? 'text-white bg-white/15 font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                ]"
              >
                <UIcon
                  :name="item.icon"
                  :class="['size-3.5 shrink-0', activeSection === item.id && route.path === group.route ? 'text-primary' : 'text-white/50']"
                />
                {{ item.label }}
              </button>
            </div>
          </div>
        </nav>

        <div class="shrink-0 border-t border-white/10 px-5 py-4">
          <p class="text-[10px] text-white leading-relaxed">
            Powered by
            <a href="https://www.zunamicorp.com" target="_blank" rel="noopener" class="font-semibold text-white transition-colors">Zunami Corp</a>
          </p>
        </div>

      </aside>

      <!-- ── MAIN CONTENT ─────────────────────────────────────────────── -->
      <main class="flex-1 min-w-0 lg:pl-64">
        <div class="max-w-screen-xl mx-auto px-6 sm:px-8 flex gap-10 items-start">

          <!-- Content column -->
          <div class="flex-1 min-w-0">

            <!-- Child page renders here -->
            <NuxtPage />

            <!-- ── RESOURCES (mobile only) ─────────────────────────── -->
            <section id="resources" class="scroll-mt-4 xl:hidden py-14 border-t border-gray-100">
              <div class="flex items-center gap-2.5 mb-3">
                <UIcon name="i-lucide-layout-panel-left" class="size-5 text-primary shrink-0" />
                <h2 class="text-xl font-bold text-secondary">Resources & Links</h2>
              </div>
              <p class="text-gray-500 text-sm leading-relaxed mb-8">Quick access, active forms, and external documentation</p>

              <div class="grid sm:grid-cols-2 gap-4">

                <div class="rounded-xl border border-gray-200 bg-white p-4">
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Access</p>
                  <div class="space-y-2.5">
                    <a href="https://admin.healthystartgroup.com" target="_blank" rel="noopener"
                       class="flex items-center gap-2 text-[13px] text-secondary hover:text-primary transition-colors">
                      <UIcon name="i-lucide-layout-dashboard" class="size-3.5 text-gray-400 shrink-0" />
                      Directus Admin
                    </a>
                  </div>
                </div>

                <div v-if="activeForms.length" class="rounded-xl border border-gray-200 bg-white p-4">
                  <div class="flex items-center justify-between mb-3">
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Forms</p>
                    <UBadge :label="`${activeForms.length}`" color="primary" variant="soft" size="xs" />
                  </div>
                  <div class="space-y-1.5">
                    <a
                      v-for="form in activeForms"
                      :key="form.id"
                      :href="`${config.public.baseUrl}/forms/${form.id}`"
                      target="_blank"
                      rel="noopener"
                      class="flex items-center gap-2 text-[12px] text-gray-600 hover:text-primary transition-colors group"
                    >
                      <UIcon name="i-lucide-file-text" class="size-3 text-gray-300 group-hover:text-primary/60 shrink-0 transition-colors" />
                      <span class="flex-1 leading-snug">{{ form.title }}</span>
                      <UIcon name="i-lucide-arrow-up-right" class="size-2.5 text-gray-300 group-hover:text-primary/40 shrink-0 transition-colors" />
                    </a>
                  </div>
                </div>

                <div class="rounded-xl border border-gray-200 bg-white p-4">
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Directus Docs</p>
                  <div class="space-y-1.5">
                    <a
                      v-for="link in directusLinks"
                      :key="link.url"
                      :href="link.url"
                      target="_blank"
                      rel="noopener"
                      class="flex items-center gap-2 text-[12px] text-gray-500 hover:text-primary transition-colors group"
                    >
                      <UIcon :name="link.icon" class="size-3 text-gray-300 group-hover:text-primary/60 shrink-0 transition-colors" />
                      {{ link.label }}
                      <UIcon name="i-lucide-arrow-up-right" class="size-2.5 ml-auto text-gray-300 group-hover:text-primary/40 shrink-0 transition-colors" />
                    </a>
                  </div>
                </div>

                <div class="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <p class="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-3">Key Reminders</p>
                  <ul class="space-y-2">
                    <li v-for="tip in quickTips" :key="tip" class="flex items-start gap-2">
                      <UIcon name="i-lucide-check" class="size-3 text-primary mt-0.5 shrink-0" />
                      <span class="text-[12px] text-gray-600 leading-relaxed">{{ tip }}</span>
                    </li>
                  </ul>
                </div>

              </div>
            </section>

            <div class="border-t border-gray-100 py-10"></div>

          </div><!-- end content column -->

          <!-- ── RIGHT PANEL ──────────────────────────────────────────── -->
          <div class="hidden xl:block w-56 shrink-0 sticky top-8 self-start max-h-[calc(100vh-2rem)] overflow-y-auto pt-14 pb-4">
            <div class="space-y-4">

              <div class="rounded-xl border border-gray-200 bg-white p-4">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Access</p>
                <div class="space-y-2">
                  <a href="https://admin.healthystartgroup.com" target="_blank" rel="noopener"
                     class="flex items-center gap-2 text-[13px] text-secondary hover:text-primary transition-colors">
                    <UIcon name="i-lucide-layout-dashboard" class="size-3.5 text-gray-400 shrink-0" />
                    Directus Admin
                  </a>
                </div>
              </div>

              <div v-if="activeForms.length" class="rounded-xl border border-gray-200 bg-white p-4">
                <div class="flex items-center justify-between mb-3">
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Forms</p>
                  <UBadge :label="`${activeForms.length}`" color="primary" variant="soft" size="xs" />
                </div>
                <div class="space-y-1.5">
                  <a
                    v-for="form in activeForms"
                    :key="form.id"
                    :href="`${config.public.baseUrl}/forms/${form.id}`"
                    target="_blank"
                    rel="noopener"
                    class="flex items-center gap-2 text-[12px] text-gray-600 hover:text-primary transition-colors group"
                  >
                    <UIcon name="i-lucide-file-text" class="size-3 text-gray-300 group-hover:text-primary/60 shrink-0 transition-colors" />
                    <span class="flex-1 leading-snug">{{ form.title }}</span>
                    <UIcon name="i-lucide-arrow-up-right" class="size-2.5 text-gray-300 group-hover:text-primary/40 shrink-0 transition-colors" />
                  </a>
                </div>
              </div>

              <div class="rounded-xl border border-gray-200 bg-white p-4">
                <div class="flex items-center gap-2 mb-3">
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Directus Docs</p>
                </div>
                <div class="space-y-1.5">
                  <a
                    v-for="link in directusLinks"
                    :key="link.url"
                    :href="link.url"
                    target="_blank"
                    rel="noopener"
                    class="flex items-center gap-2 text-[12px] text-gray-500 hover:text-primary transition-colors group"
                  >
                    <UIcon :name="link.icon" class="size-3 text-gray-300 group-hover:text-primary/60 shrink-0 transition-colors" />
                    {{ link.label }}
                    <UIcon name="i-lucide-arrow-up-right" class="size-2.5 ml-auto text-gray-300 group-hover:text-primary/40 shrink-0 transition-colors" />
                  </a>
                </div>
              </div>

              <div class="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p class="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-3">Key Reminders</p>
                <ul class="space-y-2">
                  <li v-for="tip in quickTips" :key="tip" class="flex items-start gap-2">
                    <UIcon name="i-lucide-check" class="size-3 text-primary mt-0.5 shrink-0" />
                    <span class="text-[12px] text-gray-600 leading-relaxed">{{ tip }}</span>
                  </li>
                </ul>
              </div>

            </div>
          </div><!-- end right panel -->

        </div><!-- end flex row -->
      </main>
    </div>

  </div>
</template>

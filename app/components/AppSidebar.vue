<script setup lang="ts">
  const route = useRoute()

  const links = [
    { label: 'Home', to: '/', icon: 'i-heroicons-home' },
    { label: 'Exercises', to: '/coloring', icon: 'i-heroicons-paint-brush' },
    { label: 'My Progress', to: '#', icon: 'i-heroicons-chart-bar' },
    { label: 'Learn', to: '#', icon: 'i-heroicons-book-open' },
    { label: 'Caregiver Corner', to: '#', icon: 'i-heroicons-hand-raised' },
  ]

  function isActive(to: string) {
    if (to === '/coloring') {
      return route.path.startsWith('/coloring')
    }
    return route.path === to
  }
</script>

<template>
  <aside
    class="flex w-64 shrink-0 flex-col bg-[#26215C] text-white"
    aria-label="Main navigation"
  >
    <div class="px-5 py-8">
      <NuxtLink to="/coloring" class="block" aria-label="BeyondNeuro home">
        <img
          src="/images/beyondneuro-logo-white.png"
          alt="BeyondNeuro"
          class="h-12 w-auto max-w-full object-contain object-left mix-blend-screen"
        />
      </NuxtLink>
    </div>

    <nav class="flex flex-1 flex-col gap-2 px-4" aria-label="Primary">
      <NuxtLink
        v-for="link in links"
        :key="link.label"
        :to="link.to"
        class="flex items-center gap-3 rounded-full px-4 py-3 text-lg transition-colors"
        :class="
          isActive(link.to)
            ? 'bg-white font-semibold text-slate-900'
            : 'text-white hover:bg-white/10'
        "
      >
        <UIcon :name="link.icon" class="h-6 w-6 shrink-0" aria-hidden="true" />
        <span>{{ link.label }}</span>
      </NuxtLink>
    </nav>

    <div class="m-4 rounded-2xl bg-white/10 p-4 text-lg text-white/90">
      <p>Take your time. Pause whenever you need. Your progress is saved.</p>
    </div>
  </aside>
</template>

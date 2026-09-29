<script setup lang="ts">
  definePageMeta({
    layout: 'beyond',
  })

  const route = useRoute()

  const activities = [
    { label: 'Mirrored coloring', to: '/coloring' },
    { label: 'Paint by number', to: '/coloring/paint-by-number' },
  ]
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <p class="text-lg font-medium text-emerald-700">Cognitive exercise module</p>
    <h1 class="mt-1 font-serif text-4xl font-semibold text-[#26215C]">Coloring &amp; Visual Art</h1>

    <nav class="mt-6 flex flex-wrap gap-3" aria-label="Coloring activities">
      <NuxtLink
        v-for="activity in activities"
        :key="activity.to"
        :to="activity.to"
        class="rounded-full px-5 py-3 text-lg font-medium transition-colors focus-visible:ring-4 focus-visible:ring-violet-300 focus-visible:outline-none"
        :class="
          route.path === activity.to
            ? 'bg-[#26215C] text-white'
            : 'bg-white text-slate-800 shadow-sm hover:bg-slate-100'
        "
      >
        {{ activity.label }}
      </NuxtLink>
    </nav>

    <div class="mt-6">
      <NuxtPage />
    </div>
  </div>
</template>

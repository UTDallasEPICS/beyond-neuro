<script setup lang="ts">
  definePageMeta({
    layout: 'activity',
  })

  useHead({
    title: 'Coloring & Visual Art | BeyondNeuro',
  })

  const tabs = [
    { label: 'Mirrored coloring', to: '/coloring' },
    { label: 'Paint by number', to: '/coloring/paint-by-number' },
  ]
</script>

<template>
  <ActivitiesActivityModulePage
    tag="Visual Art"
    title="Coloring & Visual Art"
    subtitle="Calm, untimed coloring. Take as long as you like — there are no wrong answers."
    tabs-label="Coloring activities"
    :tabs="tabs"
  >
    <NuxtPage />
  </ActivitiesActivityModulePage>
</template>

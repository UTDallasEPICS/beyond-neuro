<script setup lang="ts">
  definePageMeta({
    layout: 'activity',
  })

  useHead({
    title: 'Horticultural Therapy | BeyondNeuro',
  })

  const tabs = [
    { label: 'Plant care', to: '/activities/horticulture' },
    { label: 'Garden matching', to: '/activities/horticulture/garden' },
  ]
</script>

<template>
  <ActivitiesActivityModulePage
    tag="Sensory"
    title="Horticultural Therapy"
    subtitle="Gentle hands-on plant care and a flower matching game. Take your time."
    tabs-label="Horticulture activities"
    :tabs="tabs"
  >
    <NuxtPage />
  </ActivitiesActivityModulePage>
</template>

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
    { label: 'Tree trimming', to: '/activities/horticulture/tree-trimming' },
  ]
</script>

<template>
  <ActivitiesActivityModulePage
    tag="Sensory"
    title="Horticultural Therapy"
    subtitle="Gentle hands-on plant care, a flower bed matching game, and tree trimming. Take your time."
    tabs-label="Horticulture activities"
    :tabs="tabs"
  >
    <NuxtPage />
  </ActivitiesActivityModulePage>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'activity',
  })

  useHead({
    title: 'Writing & Calligraphy | BeyondNeuro',
  })

  const tabs = [
    { label: 'Writing practice', to: '/writing' },
    { label: 'Calligraphy', to: '/writing/calligraphy' },
  ]
</script>

<template>
  <ActivitiesActivityModulePage
    tag="Language & Fine Motor"
    title="Writing & Calligraphy"
    subtitle="Practice words and handwriting at your own pace. There are no timers and no pressure."
    tabs-label="Writing and calligraphy activities"
    :tabs="tabs"
  >
    <NuxtPage />
  </ActivitiesActivityModulePage>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'activity',
  })

  useHead({
    title: 'Writing & Calligraphy | BeyondNeuro',
  })

  const tabs = [
    { label: 'Calligraphy', to: '/activities/writing' },
    { label: 'Writing Practice', to: '/activities/writing/writing-prompt' },
    { label: 'Sentence Completion', to: '/activities/writing/sentence-completion' }
  ]
</script>

<template>
  <ActivitiesActivityModulePage
    tag="Fine Motor"
    title="Writing & Calligraphy"
    subtitle="Pen, paper, and the steady work of cognition."
    tabs-label="Writing and calligraphy activities"
    :tabs="tabs"
  >
    <NuxtPage />
  </ActivitiesActivityModulePage>
</template>

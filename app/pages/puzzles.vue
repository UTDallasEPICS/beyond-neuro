<script setup lang="ts">
  definePageMeta({
    layout: 'activity',
  })

  useHead({
    title: 'Puzzles & Games | BeyondNeuro',
  })

  const tabs = [
    { label: 'Matching game', to: '/puzzles' },
    { label: 'Word search', to: '/puzzles/word-search' },
  ]
</script>

<template>
  <ActivitiesActivityModulePage
    tag="Cognitive"
    title="Puzzles & Games"
    subtitle="Playful memory and attention practice. No timers and no scores — play at your own pace."
    tabs-label="Puzzle activities"
    :tabs="tabs"
  >
    <NuxtPage />
  </ActivitiesActivityModulePage>
</template>

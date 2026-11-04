
<script setup lang="ts">
  definePageMeta({
    layout: 'activity',
  })

  useHead({
    title: 'Digital & VR Training | BeyondNeuro',
  })

  const tabs = [
    { label: 'Reaction Time', to: '/activities/digital-vr' },
    { label: 'Counting Money', to: '/activities/digital-vr/counting-money' },
    { label: 'Rhythm Tiles', to: '/activities/digital-vr/rhythm-tiles' },
  ]
</script>

<template>
  <ActivitiesActivityModulePage
    tag="Cognitive"
    title="Digital & VR Training"
    subtitle="Adaptive training for reaction time, rhythm, and everyday money skills, in short daily sessions."
    tabs-label="Digital and VR activities"
    :tabs="tabs"
  >
    <NuxtPage />
  </ActivitiesActivityModulePage>
</template>

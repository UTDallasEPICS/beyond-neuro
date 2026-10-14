
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
  ]
</script>

<template>
  <ActivitiesActivityModulePage
    tag="Cognitive"
    title="Digital & VR Training"
    subtitle="Practice reaction time and everyday money skills at your own pace."
    tabs-label="Digital and VR activities"
    :tabs="tabs"
  >
    <NuxtPage />
  </ActivitiesActivityModulePage>
</template>

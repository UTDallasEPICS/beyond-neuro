<script setup lang="ts">
  definePageMeta({
    layout: 'activity',
  })

  useHead({
    title: 'Music Therapy & Rhythm | BeyondNeuro',
  })

  const tabs = [
    { label: 'Rhythm exercise', to: '/music' },
    { label: 'Sing along', to: '/music/sing-along' },
  ]
</script>

<template>
  <ActivitiesActivityModulePage
    tag="Sensory-Motor"
    title="Music Therapy & Rhythm"
    subtitle="Rhythm and music that activate memory. Go at whatever pace feels good."
    tabs-label="Music activities"
    :tabs="tabs"
  >
    <NuxtPage />
  </ActivitiesActivityModulePage>
</template>

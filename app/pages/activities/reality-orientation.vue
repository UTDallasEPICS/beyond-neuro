<script setup lang="ts">
  definePageMeta({
    layout: 'activity',
  })

  useHead({
    title: 'Reality Orientation | BeyondNeuro',
  })

  const tabs = [
    { label: 'Clock & Today’s Plan', to: '/activities/reality-orientation' },
    { label: 'My Week', to: '/activities/reality-orientation/whiteboard' },
  ]
</script>

<template>
  <ActivitiesActivityModulePage
    tag="Reality Orientation"
    title="Reality Orientation"
    subtitle="Check today's date and time, and make plans for your day or week."
    tabs-label="Reality orientation activities"
    :tabs="tabs"
  >
    <NuxtPage />
  </ActivitiesActivityModulePage>
</template>
<script setup lang="ts">
  definePageMeta({
    layout: 'activity',
  })

  useHead({
    title: 'Reality Orientation — BeyondNeuro',
  })

  const tabs = [
    { label: 'Today’s Plan', to: '/activities/reality-orientation' },
    { label: 'Calendar', to: '/activities/reality-orientation/whiteboard' },
    { label: 'Find the object', to: '/activities/reality-orientation/findObject' },
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
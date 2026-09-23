<script setup lang="ts">
  definePageMeta({
    layout: 'beyond',
  })

  useSeoMeta({
    title: 'Coloring & Visual Art — BeyondNeuro',
    description:
      'Tap or drag across a mirrored coloring canvas. A quiet, low-pressure way to focus the mind.',
  })
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <ColoringCanvas />
  </div>
</template>

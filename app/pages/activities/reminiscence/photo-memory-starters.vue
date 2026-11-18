<script setup lang="ts">
  useHead({
    title: 'Photo Memory Starters | BeyondNeuro',
  })
</script>

<template>
  <section aria-labelledby="photo-memory-title">
    <h2 id="photo-memory-title" class="bn-font-display text-3xl font-bold text-[var(--bn-navy)]">
      Photo Memory Starters
    </h2>
    <p class="mt-3 text-xl leading-relaxed text-[var(--bn-navy)]">
      Find the pictures that match, then talk about what they bring to mind. You get new pictures every time you play. Take your time.
    </p>

    <ActivitiesReminiscencePhotoMemoryFlow />
  </section>
</template>

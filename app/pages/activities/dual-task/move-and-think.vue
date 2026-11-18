<script setup lang="ts">
  useHead({
    title: 'Walking + Counting Drills | BeyondNeuro',
  })
</script>

<template>
  <section aria-labelledby="move-and-think-title">
    <h2 id="move-and-think-title" class="bn-font-display text-3xl font-bold text-[var(--bn-navy)]">
      Walking + counting drills
    </h2>
    <p class="mt-3 text-xl leading-relaxed text-[var(--bn-navy)]">
      Walk while counting backward by 3s or 7s.
    </p>

    <ActivitiesDualTaskMoveAndThinkFlow />
  </section>
</template>

<script setup lang="ts">
  useHead({
    title: 'Walking + Counting Drills | BeyondNeuro',
  })
</script>

<template>
  <section aria-labelledby="walking-counting-title">
    <h2 id="walking-counting-title" class="bn-font-display text-3xl font-bold text-[var(--bn-navy)]">
      Walking + Counting Drills
    </h2>
    <p class="mt-3 text-xl leading-relaxed text-[var(--bn-navy)]">
      Move your body while you count backward. Go at your own pace.
    </p>

    <ActivitiesDualTaskWalkingCountingFlow />
  </section>
</template>

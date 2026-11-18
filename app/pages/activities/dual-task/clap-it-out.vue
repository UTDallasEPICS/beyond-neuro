<script setup lang="ts">
  useHead({
    title: 'Clap It Out | BeyondNeuro',
  })
</script>

<template>
  <section aria-labelledby="clap-it-out-title">
    <h2 id="clap-it-out-title" class="bn-font-display text-3xl font-bold text-[var(--bn-navy)]">
      Clap It Out
    </h2>
    <p class="mt-3 text-xl leading-relaxed text-[var(--bn-navy)]">
      Clap once for each part of a word. Go at your own pace.
    </p>

    <ActivitiesDualTaskClapItOut />
  </section>
</template>

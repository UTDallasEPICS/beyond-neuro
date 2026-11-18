<script setup lang="ts">
  useHead({
    title: 'Reminiscence Journal | BeyondNeuro',
  })
</script>

<template>
  <section aria-labelledby="journal-title">
    <h2 id="journal-title" class="bn-font-display text-3xl font-bold text-[var(--bn-navy)]">
      Reminiscence Journal
    </h2>
    <p class="mt-3 text-xl leading-relaxed text-[var(--bn-navy)]">
      Fill in short journal pages about your favorite people, places, and stories. Your pages are saved so you can read or print them later.
    </p>

    <ActivitiesReminiscenceJournalFlow />
  </section>
</template>

<script setup lang="ts">
  useHead({
    title: 'Life Story Prompts | BeyondNeuro',
  })
</script>

<template>
  <section aria-labelledby="life-story-title">
    <h2 id="life-story-title" class="bn-font-display text-3xl font-bold text-[var(--bn-navy)]">
      Life Story Prompts
    </h2>
    <p class="mt-3 text-xl leading-relaxed text-[var(--bn-navy)]">
      Share the moments that make you who you are. There are no wrong answers.
    </p>

    <ActivitiesReminiscenceLifeStoryPromptFlow />
  </section>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'activity',
  })

  useHead({
    title: 'Reminiscence Journal | BeyondNeuro',
  })
</script>

<template>
  <div class="bn-font-body flex min-h-screen flex-col bg-[var(--bn-cream)] md:flex-row">
    <ActivitiesActivityModuleSidebar />

    <main class="flex-1 overflow-x-hidden">
      <div class="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-8 lg:px-[60px] lg:py-[60px]">
        <NuxtLink
          to="/activities/reminiscence/life-story"
          class="inline-flex min-h-[72px] items-center gap-2 text-2xl font-semibold text-orange-800"
        >
          <img src="/activities/icon-arrow-left.svg" alt="" class="size-6" width="24" height="24" />
          Back to Reminiscence Therapy
        </NuxtLink>

        <h1 class="bn-font-display mt-6 text-4xl font-bold text-[var(--bn-navy)]">
          Reminiscence Journal
        </h1>
        <p class="mt-4 text-2xl leading-relaxed text-[var(--bn-navy)]">
          Fill in short journal pages about your favorite people, places, and stories. Your pages
          are saved so you can read or print them later.
        </p>

        <ActivitiesReminiscenceJournalFlow />
      </div>
    </main>
  </div>
</template>

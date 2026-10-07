<script setup lang="ts">
  definePageMeta({
    layout: 'activity',
  })

  useHead({
    title: 'Activities | BeyondNeuro',
  })

  const activities = [
    {
      title: 'Reminiscence Therapy',
      description: 'Reconnect with identity through photos, stories, and life-story prompts.',
      icon: '/activities/icon-book-orange.svg',
      to: '/activities/reminiscence/life-story',
    },
    {
      title: 'Coloring & Visual Art',
      description:
        'Calm, untimed coloring — mirrored patterns and paint-by-number pictures from around the world.',
      icon: '/activities/icon-image.svg',
      to: '/coloring',
    },
    {
      title: 'Puzzles & Games',
      description: 'A flower matching game and a large-letter word search. No timers, no scores.',
      icon: '/activities/icon-grid.svg',
      to: '/puzzles',
    },
    {
      title: 'Music Therapy & Rhythm',
      description: 'Follow a calming rhythm, or sing along to a favorite song from your device.',
      icon: '/activities/icon-activity-green.svg',
      to: '/music',
    },
    {
      title: 'Writing & Calligraphy',
      description: 'Practice typing and handwriting with guided words and letter tracing at your own pace.',
      icon: '/activities/icon-book-orange.svg',
      to: '/writing',
    },
  ]
</script>

<template>
  <div class="bn-font-body flex min-h-screen flex-col bg-[var(--bn-cream)] md:flex-row">
    <ActivitiesActivityModuleSidebar />

    <main class="flex-1 overflow-x-hidden">
      <div class="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-8 lg:px-[60px] lg:py-[60px]">
        <header class="max-w-[800px]">
          <h1
            class="bn-font-display text-3xl font-bold text-[var(--bn-navy)] sm:text-[40px] sm:leading-[48px]"
          >
            Activities
          </h1>
          <p class="mt-2 text-lg text-[var(--bn-navy)] sm:text-[19px] sm:leading-[29px]">
            Choose an activity to begin. Take your time — there is no rush.
          </p>
        </header>

        <ul class="mt-10 flex list-none flex-col gap-4 p-0">
          <li v-for="activity in activities" :key="activity.to">
            <NuxtLink
              :to="activity.to"
              class="flex min-h-[72px] gap-5 rounded-2xl border border-[var(--bn-border)] bg-white p-6 hover:border-orange-700 focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
            >
              <div
                class="flex size-14 shrink-0 items-center justify-center rounded-xl bg-[var(--bn-peach)]"
              >
                <img :src="activity.icon" alt="" class="size-7" width="28" height="28" />
              </div>
              <div>
                <h2 class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">
                  {{ activity.title }}
                </h2>
                <p class="mt-1 text-lg leading-normal text-[var(--bn-muted)]">
                  {{ activity.description }}
                </p>
              </div>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'activity',
  })

  useHead({
    title: 'Dual-Task Physical Exercise | BeyondNeuro',
  })

  const NuxtLink = resolveComponent('NuxtLink')

  const exercises = [
    {
      title: 'Walking + counting drills',
      description: 'Walk or March while counting backward by 1s, 2s, 3s or 7s',
      icon: '/activities/icon-activity-green.svg',
      to: '/activities/dual-task/walking-counting',
    },
    {
      title: 'Seated balance work',
      description: 'Reach and reflect — naming categories while moving',
      icon: '/activities/icon-grid.svg',
      to: null,
    },
    {
      title: 'Resistance + recall',
      description: 'Light bands paired with memory recall tasks',
      icon: '/activities/icon-book-orange.svg',
      to: null,
    },
    {
      title: 'Tai chi and slow movement',
      description: 'Mindful sequences that load attention and motor systems',
      icon: '/activities/icon-hash.svg',
      to: null,
    },
  ] as const

  const resources = [
    {
      title: 'Exercise Cards',
      description: 'Printable movement + brain task cards',
      icon: '/activities/icon-file.svg',
    },
    {
      title: 'Caregiver Guide',
      description: 'Safety tips and seated modifications',
      icon: '/activities/icon-book-green.svg',
    },
    {
      title: 'Weekly Tracker',
      description: 'Session log for dual-task practice',
      icon: '/activities/icon-activity-green.svg',
    },
  ] as const

  const relatedModules = [
    {
      tag: 'Sensory-Motor',
      tagClass: 'bg-[#f5f3ff] text-[#8b5cf6]',
      title: 'Music Therapy & Rhythm',
      description: 'Clapping and tapping to a beat pairs movement with timing and memory.',
    },
    {
      tag: 'Cognitive',
      tagClass: 'bg-[#fff3eb] text-[var(--bn-orange)]',
      title: 'Puzzles & Games',
      description: 'Attention and memory practice that builds on dual-task skills.',
    },
    {
      tag: 'Sensory',
      tagClass: 'bg-[#ecfeff] text-[#0891b2]',
      title: 'Horticultural Therapy',
      description: 'Gentle hands-on movement through plant care and gardening.',
    },
  ] as const

  const benefits = ['Attention', 'Balance & gait', 'Motor coordination', 'Neuroplasticity'] as const
</script>

<template>
  <div class="bn-font-body flex min-h-screen flex-col bg-[var(--bn-cream)] lg:flex-row">
    <ActivitiesActivityModuleSidebar />

    <main class="flex-1 overflow-x-hidden">
      <div class="mx-auto w-full max-w-[1170px] px-4 py-8 sm:px-8 lg:px-[60px] lg:py-[60px]">
        <!-- Module Header -->
        <header class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div class="max-w-[800px]">
            <span
              class="inline-flex rounded-md bg-[var(--bn-peach)] px-3 py-1.5 text-xs font-bold tracking-wide text-[var(--bn-orange)] uppercase"
            >
              Module 08
            </span>
            <h1
              class="bn-font-display mt-2 text-3xl font-bold text-[var(--bn-navy)] sm:text-[40px] sm:leading-[48px]"
            >
              Dual-Task Physical Exercise
            </h1>
            <p class="mt-2 text-lg text-[var(--bn-navy)] sm:text-[19px] sm:leading-[29px]">
              Move the body and train the brain at the same time.
            </p>
          </div>

          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--bn-orange)]"
          >
            <img
              src="/activities/icon-arrow-left.svg"
              alt=""
              class="size-[18px]"
              width="18"
              height="18"
            />
            Back to activities
          </NuxtLink>
        </header>

        <hr class="my-12 border-0 border-t border-[var(--bn-border)]" />

        <!-- The Research -->
        <section aria-labelledby="research-title">
          <h2 id="research-title" class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">
            The Research
          </h2>
          <p class="mt-4 max-w-[1050px] text-base leading-[1.45] text-[var(--bn-muted)] sm:text-lg">
            Pairing movement with a mental task — counting backward while walking, naming animals
            while balancing — drives neuroplastic change after stroke. The combined load is what
            makes the brain rewire.
          </p>
          <div class="mt-6">
            <p class="text-sm font-bold tracking-wide text-[var(--bn-muted)] uppercase">
              Clinical Benefits:
            </p>
            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="benefit in benefits"
                :key="benefit"
                class="rounded-lg border border-[var(--bn-border)] bg-white px-4 py-2 text-[15px] text-[var(--bn-navy)]"
              >
                {{ benefit }}
              </span>
            </div>
          </div>
        </section>

        <hr class="my-12 border-0 border-t border-[var(--bn-border)]" />

        <!-- Recommended Exercises -->
        <section aria-labelledby="exercises-title">
          <h2 id="exercises-title" class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">
            Recommended Exercises
          </h2>
          <ul class="mt-6 flex list-none flex-col gap-4 p-0">
            <li v-for="exercise in exercises" :key="exercise.title">
              <component
                :is="exercise.to ? NuxtLink : 'div'"
                :to="exercise.to ?? undefined"
                class="flex gap-4 rounded-2xl border border-[var(--bn-border)] bg-white p-5"
                :class="
                  exercise.to
                    ? 'min-h-[72px] hover:border-orange-700 focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:outline-none'
                    : ''
                "
              >
                <div
                  class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[var(--bn-peach)]"
                >
                  <img :src="exercise.icon" alt="" class="size-6" width="24" height="24" />
                </div>
                <div>
                  <h3 class="bn-font-display text-lg font-bold text-[var(--bn-navy)]">
                    {{ exercise.title }}
                  </h3>
                  <p class="mt-1 text-[15px] leading-normal text-[var(--bn-muted)]">
                    {{ exercise.description }}
                  </p>
                </div>
              </component>
            </li>
          </ul>
        </section>

        <hr class="my-12 border-0 border-t border-[var(--bn-border)]" />

        <!-- Try It Now -->
        <ActivitiesDualTaskMoveAndThinkTryItNow />

        <hr class="my-12 border-0 border-t border-[var(--bn-border)]" />

        <!-- Printable Resources -->
        <section aria-labelledby="resources-title">
          <div class="flex flex-col gap-2">
            <h2
              id="resources-title"
              class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]"
            >
              Printable Resources
            </h2>
            <p class="text-[15px] leading-normal text-[var(--bn-muted)]">
              Download resources specifically styled for physical printouts and caregiver-guided
              sessions.
            </p>
          </div>
          <div class="mt-6 grid gap-4 md:grid-cols-3">
            <div
              v-for="resource in resources"
              :key="resource.title"
              class="flex items-center gap-4 rounded-xl border border-[var(--bn-border)] bg-white p-[18px]"
            >
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--bn-success-bg)]"
              >
                <img :src="resource.icon" alt="" class="size-5" width="20" height="20" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-[15px] font-bold text-[var(--bn-navy)]">{{ resource.title }}</p>
                <p class="text-[15px] leading-normal text-[var(--bn-muted)]">
                  {{ resource.description }}
                </p>
              </div>
              <img
                src="/activities/icon-download.svg"
                alt="Download"
                class="size-5 shrink-0"
                width="20"
                height="20"
              />
            </div>
          </div>
        </section>

        <hr class="my-12 border-0 border-t border-[var(--bn-border)]" />

        <!-- Related Modules -->
        <section aria-labelledby="related-title" class="pb-8">
          <h2 id="related-title" class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">
            Related Modules
          </h2>
          <div class="mt-6 grid gap-6 md:grid-cols-3">
            <article
              v-for="mod in relatedModules"
              :key="mod.title"
              class="flex flex-col gap-5 rounded-[20px] border border-[var(--bn-border)] bg-white p-7"
            >
              <span
                class="inline-flex w-fit rounded-md px-3 py-1.5 text-xs font-bold uppercase"
                :class="mod.tagClass"
              >
                {{ mod.tag }}
              </span>
              <div class="flex flex-col gap-3">
                <h3 class="bn-font-display text-[22px] font-bold text-[var(--bn-navy)]">
                  {{ mod.title }}
                </h3>
                <p class="text-[15px] leading-normal text-[var(--bn-muted)]">
                  {{ mod.description }}
                </p>
              </div>
              <button
                type="button"
                class="mt-auto flex h-12 w-full items-center justify-center rounded-[10px] border-[1.5px] border-[var(--bn-navy)] text-sm font-bold text-[var(--bn-navy)]"
              >
                Explore Module
              </button>
            </article>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

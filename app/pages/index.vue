<script setup lang="ts">
  import type { Directive } from 'vue'

  definePageMeta({
    layout: 'activity',
  })

  useHead({
    title: 'BeyondNeuro | Gentle brain exercises for every day',
  })

  // Fades sections in as they scroll into view. The hidden state is only added in the
  // browser, so content is never invisible without JavaScript.
  const vReveal: Directive<HTMLElement, number | undefined> = {
    mounted(el, binding) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      el.classList.add('bn-reveal')
      el.style.transitionDelay = `${binding.value ?? 0}ms`
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            el.classList.add('bn-reveal-in')
            observer.disconnect()
          }
        },
        { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
      )
      observer.observe(el)
    },
  }

  const stats = [
    { value: '9', label: 'kinds of activities' },
    { value: '7', label: 'levels to grow into' },
    { value: '0', label: 'accounts or passwords' },
  ]

  const steps = [
    { title: 'Pick an activity', body: 'Choose from memory, movement, music, art, and more.' },
    { title: 'Choose a level', body: 'Start gently. Move up only when it feels right.' },
    { title: 'Take your time', body: 'No timers and no scores. Skip or ask for a hint anytime.' },
  ]

  const promises = [
    {
      title: 'No sign-up, ever',
      body: 'No account and no password. Tap an activity and begin.',
      icon: '/activities/icon-activity-green.svg',
    },
    {
      title: 'Calm and untimed',
      body: 'No countdowns and no scores. Gentle hints instead of red X’s.',
      icon: '/activities/icon-image.svg',
    },
    {
      title: 'Easy to see and tap',
      body: 'Large text, big buttons, and strong colors. Works with screen readers.',
      icon: '/activities/icon-grid.svg',
    },
    {
      title: 'Private by default',
      body: 'Your answers stay on this device. Print a copy to keep or share.',
      icon: '/activities/icon-book-orange.svg',
    },
  ]

  const modules = [
    {
      title: 'Reminiscence Therapy',
      blurb: 'Photos, stories, and a journal',
      icon: '/activities/icon-book-orange.svg',
      to: '/activities/reminiscence/life-story',
    },
    {
      title: 'Reality Orientation',
      blurb: 'Today’s date, plans, and a whiteboard',
      icon: '/activities/icon-hash.svg',
      to: '/activities/reality-orientation',
    },
    {
      title: 'Coloring & Visual Art',
      blurb: 'Mirrored coloring, paint by number, color mixing',
      icon: '/activities/icon-image.svg',
      to: '/activities/coloring',
    },
    {
      title: 'Puzzles & Games',
      blurb: 'Matching, word search, picture puzzle',
      icon: '/activities/icon-grid.svg',
      to: '/activities/puzzles',
    },
    {
      title: 'Music Therapy & Rhythm',
      blurb: 'Follow a rhythm or sing along',
      icon: '/activities/icon-activity-green.svg',
      to: '/activities/music',
    },
    {
      title: 'Digital & VR Training',
      blurb: 'Reaction time, rhythm tiles, counting money',
      icon: '/activities/icon-activity-green.svg',
      to: '/activities/digital-vr',
    },
    {
      title: 'Writing & Calligraphy',
      blurb: 'Tracing, handwriting, and sentences',
      icon: '/activities/icon-book-green.svg',
      to: '/activities/writing',
    },
    {
      title: 'Dual-Task Exercise',
      blurb: 'Move your body while you think',
      icon: '/activities/icon-hash.svg',
      to: '/activities/dual-task',
    },
    {
      title: 'Horticultural Therapy',
      blurb: 'Plant care and garden matching',
      icon: '/activities/icon-activity-green.svg',
      to: '/activities/horticulture',
    },
  ]

  const focusRing = 'focus-visible:ring-4 focus-visible:ring-offset-4 focus-visible:outline-none'
  const primaryBtn = `${focusRing} inline-flex min-h-[72px] items-center justify-center gap-3 rounded-2xl bg-orange-700 px-10 text-2xl font-bold text-white shadow-lg shadow-orange-900/20 transition hover:-translate-y-0.5 hover:bg-orange-800`
</script>

<template>
  <div class="bn-font-body overflow-x-hidden">
    <!-- Hero -->
    <header class="relative isolate overflow-hidden bg-[var(--bn-cream)] text-[var(--bn-navy)]">
      <div
        aria-hidden="true"
        class="absolute top-24 -left-24 -z-10 size-72 rounded-full bg-[var(--bn-peach)]"
      />
      <div
        aria-hidden="true"
        class="absolute -top-20 right-[30%] -z-10 size-56 rounded-full bg-orange-100/70"
      />

      <div class="mx-auto max-w-[1180px] px-6 sm:px-10">
        <nav
          aria-label="Site"
          class="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--bn-border)] py-5"
        >
          <NuxtLink
            to="/"
            aria-label="Beyond Neuro home"
            :class="[
              focusRing,
              'inline-flex min-h-14 items-center rounded-2xl bg-[var(--bn-sidebar)] px-5 focus-visible:ring-[var(--bn-navy)]',
            ]"
          >
            <img
              src="/activities/logo-white.png"
              alt=""
              class="h-[40px] w-[124px] object-contain"
              width="124"
              height="40"
            />
          </NuxtLink>
          <ul class="flex list-none flex-wrap items-center gap-2 p-0 text-lg font-semibold">
            <li>
              <a
                href="#how-it-works"
                :class="[
                  focusRing,
                  'inline-flex min-h-14 items-center rounded-full px-5 hover:bg-[var(--bn-peach)] focus-visible:ring-[var(--bn-navy)]',
                ]"
                >How it works</a
              >
            </li>
            <li>
              <a
                href="#activities"
                :class="[
                  focusRing,
                  'inline-flex min-h-14 items-center rounded-full px-5 hover:bg-[var(--bn-peach)] focus-visible:ring-[var(--bn-navy)]',
                ]"
                >Activities</a
              >
            </li>
            <li>
              <NuxtLink
                to="/activities"
                :class="[
                  focusRing,
                  'inline-flex min-h-14 items-center rounded-full border-2 border-[var(--bn-navy)] px-6 hover:bg-[var(--bn-navy)] hover:text-white focus-visible:ring-[var(--bn-navy)]',
                ]"
              >
                Start
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <div
          class="grid items-center gap-14 pt-12 pb-16 lg:grid-cols-[1.2fr_1fr] lg:pt-16 lg:pb-20"
        >
          <div>
            <p
              v-reveal
              class="inline-flex items-center gap-2 rounded-full bg-[var(--bn-peach)] px-4 py-2 text-lg font-semibold text-orange-800"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" class="size-5 fill-current">
                <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
              </svg>
              Free · No sign-up · Made for every ability
            </p>
            <h1
              v-reveal="80"
              class="bn-font-display mt-6 text-[44px] leading-[1.08] font-bold sm:text-[68px]"
            >
              <span class="block text-orange-700">Gentle brain</span>
              <span class="block">exercises for every day</span>
            </h1>
            <p
              v-reveal="160"
              class="mt-6 max-w-[580px] text-xl leading-relaxed text-[var(--bn-muted)] sm:text-[22px]"
            >
              Memory, movement, and creative activities for stroke survivors, people living with
              dementia, and the people who care for them.
            </p>
            <div v-reveal="240" class="mt-10 flex flex-col gap-4 sm:flex-row">
              <NuxtLink
                to="/activities"
                :class="[primaryBtn, 'focus-visible:ring-[var(--bn-navy)]']"
              >
                Start an activity
                <span aria-hidden="true">→</span>
              </NuxtLink>
              <a
                href="#how-it-works"
                :class="[
                  focusRing,
                  'inline-flex min-h-[72px] items-center justify-center rounded-2xl border-2 border-[var(--bn-navy)] px-10 text-2xl font-semibold transition hover:bg-[var(--bn-navy)] hover:text-white focus-visible:ring-[var(--bn-navy)]',
                ]"
              >
                How it works
              </a>
            </div>

            <dl
              v-reveal="320"
              class="mt-12 grid max-w-[560px] grid-cols-3 divide-x divide-[var(--bn-border)] rounded-3xl border border-[var(--bn-border)] bg-white py-6"
            >
              <div
                v-for="stat in stats"
                :key="stat.label"
                class="flex flex-col px-4 text-center sm:px-6"
              >
                <dt class="text-base leading-snug text-[var(--bn-muted)] sm:text-lg">
                  {{ stat.label }}
                </dt>
                <dd class="bn-font-display order-first text-4xl font-bold text-[var(--bn-navy)]">
                  {{ stat.value }}
                </dd>
              </div>
            </dl>
          </div>

          <div v-reveal="200" class="relative mx-auto w-full max-w-[440px]">
            <div
              aria-hidden="true"
              class="absolute -right-5 -bottom-5 h-[55%] w-[60%] rounded-3xl bg-[var(--bn-sidebar)]"
            />
            <div
              aria-hidden="true"
              class="absolute -top-6 -left-8 grid grid-cols-5 gap-2.5 text-orange-700"
            >
              <span v-for="n in 15" :key="n" class="size-1.5 rounded-full bg-current" />
            </div>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              class="absolute top-10 -right-8 size-8 fill-orange-700"
            >
              <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
            </svg>
            <div
              class="relative overflow-hidden rounded-t-[220px] rounded-b-3xl border-[6px] border-white bg-[var(--bn-peach)] shadow-[var(--bn-navy)]/10 shadow-xl"
            >
              <img
                src="/landing/friends-laughing.jpg"
                alt="Illustration of two older friends laughing together while doing a puzzle on a tablet."
                class="aspect-[3/4] w-full object-cover"
                width="720"
                height="960"
              />
            </div>
          </div>
        </div>
      </div>
    </header>

    <main>
      <!-- How it works -->
      <section
        id="how-it-works"
        aria-labelledby="steps-heading"
        class="mx-auto max-w-[1180px] scroll-mt-6 px-6 pt-16 pb-8 sm:px-10"
      >
        <p v-reveal class="text-lg font-bold tracking-wide text-orange-800 uppercase">
          How it works
        </p>
        <h2
          id="steps-heading"
          v-reveal="80"
          class="bn-font-display mt-2 text-3xl font-bold text-[var(--bn-navy)] sm:text-[42px] sm:leading-tight"
        >
          Three easy steps
        </h2>
        <ol class="mt-10 grid list-none gap-6 p-0 md:grid-cols-3">
          <li
            v-for="(step, i) in steps"
            :key="step.title"
            v-reveal="i * 140"
            class="relative rounded-3xl border border-[var(--bn-border)] bg-white p-8 shadow-sm"
          >
            <span
              aria-hidden="true"
              class="bn-font-display flex size-14 items-center justify-center rounded-2xl bg-orange-700 text-2xl font-bold text-white"
            >
              {{ i + 1 }}
            </span>
            <h3 class="bn-font-display mt-6 text-2xl font-bold text-[var(--bn-navy)]">
              {{ step.title }}
            </h3>
            <p class="mt-2 text-lg leading-normal text-[var(--bn-muted)]">{{ step.body }}</p>
          </li>
        </ol>
      </section>

      <!-- Promises -->
      <section
        aria-labelledby="promises-heading"
        class="mx-auto max-w-[1180px] px-6 py-16 sm:px-10"
      >
        <div class="grid gap-12 lg:grid-cols-[0.9fr_1.4fr] lg:items-start">
          <div v-reveal class="lg:sticky lg:top-10">
            <p class="text-lg font-bold tracking-wide text-orange-800 uppercase">Our promise</p>
            <h2
              id="promises-heading"
              class="bn-font-display mt-2 text-3xl font-bold text-[var(--bn-navy)] sm:text-[42px] sm:leading-tight"
            >
              Made to feel easy
            </h2>
            <p class="mt-4 text-xl leading-relaxed text-[var(--bn-muted)]">
              Every screen is designed for tired eyes, unsteady hands, and days when focus is hard.
            </p>
          </div>
          <ul class="grid list-none gap-5 p-0 sm:grid-cols-2">
            <li
              v-for="(item, i) in promises"
              :key="item.title"
              v-reveal="i * 100"
              class="rounded-3xl border border-[var(--bn-border)] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div
                class="flex size-14 items-center justify-center rounded-2xl bg-[var(--bn-peach)]"
              >
                <img :src="item.icon" alt="" class="size-7" width="28" height="28" />
              </div>
              <h3 class="bn-font-display mt-5 text-2xl font-bold text-[var(--bn-navy)]">
                {{ item.title }}
              </h3>
              <p class="mt-2 text-lg leading-normal text-[var(--bn-muted)]">{{ item.body }}</p>
            </li>
          </ul>
        </div>
      </section>

      <!-- Modules -->
      <section
        id="activities"
        aria-labelledby="modules-heading"
        class="mx-auto max-w-[1180px] px-6 py-20 sm:px-10"
      >
        <p v-reveal class="text-lg font-bold tracking-wide text-orange-800 uppercase">Activities</p>
        <h2
          id="modules-heading"
          v-reveal="80"
          class="bn-font-display mt-2 text-3xl font-bold text-[var(--bn-navy)] sm:text-[42px] sm:leading-tight"
        >
          Something for every day
        </h2>
        <ul class="mt-10 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
          <li v-for="(mod, i) in modules" :key="mod.to" v-reveal="(i % 3) * 110">
            <NuxtLink
              :to="mod.to"
              :class="[
                focusRing,
                'group flex h-full min-h-[72px] items-start gap-4 rounded-3xl border border-[var(--bn-border)] bg-white p-6 transition hover:-translate-y-1 hover:border-orange-700 hover:shadow-lg focus-visible:ring-[var(--bn-navy)]',
              ]"
            >
              <span
                class="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--bn-peach)]"
              >
                <img :src="mod.icon" alt="" class="size-7" width="28" height="28" />
              </span>
              <span class="flex-1">
                <span class="bn-font-display block text-xl font-bold text-[var(--bn-navy)]">
                  {{ mod.title }}
                </span>
                <span class="mt-1 block text-lg leading-snug text-[var(--bn-muted)]">{{
                  mod.blurb
                }}</span>
              </span>
              <span
                aria-hidden="true"
                class="mt-1 text-2xl text-orange-700 transition group-hover:translate-x-1"
              >
                →
              </span>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </main>

    <footer class="border-t border-[var(--bn-border)]">
      <div
        class="mx-auto flex max-w-[1180px] flex-col gap-2 px-6 py-8 text-lg text-[var(--bn-muted)] sm:flex-row sm:justify-between sm:px-10"
      >
        <p>BeyondNeuro · A UT Dallas EPICS project</p>
        <p>Take your time — there is no rush.</p>
      </div>
    </footer>
  </div>
</template>

<style>
  .bn-reveal {
    opacity: 0;
    transform: translateY(28px);
    transition:
      opacity 0.8s ease,
      transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .bn-reveal.bn-reveal-in {
    opacity: 1;
    transform: none;
  }
</style>

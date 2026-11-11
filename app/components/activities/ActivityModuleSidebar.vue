<script setup lang="ts">
  interface NavLink {
    label: string
    href: string
    /** Route prefix that marks this link as the current section. */
    match: string
  }

  const route = useRoute()

  const activities: NavLink[] = [
    {
      label: 'Reminiscence Therapy',
      href: '/activities/reminiscence/life-story',
      match: '/activities/reminiscence',
    },
    {
      label: 'Reality Orientation',
      href: '/activities/reality-orientation',
      match: '/activities/reality-orientation',
    },
    {
      label: 'Coloring & Visual Art',
      href: '/activities/coloring',
      match: '/activities/coloring',
    },
    { label: 'Puzzles & Games', href: '/activities/puzzles', match: '/activities/puzzles' },
    { label: 'Music Therapy & Rhythm', href: '/activities/music', match: '/activities/music' },
    {
      label: 'Digital & VR Training',
      href: '/activities/digital-vr',
      match: '/activities/digital-vr',
    },
    {
      label: 'Writing & Calligraphy',
      href: '/activities/writing',
      match: '/activities/writing',
    },
    {
      label: 'Dual-Task Exercise',
      href: '/activities/dual-task',
      match: '/activities/dual-task',
    },
    {
      label: 'Horticultural Therapy',
      href: '/activities/horticulture',
      match: '/activities/horticulture',
    },
  ]

  const comingSoon = [
    { label: 'My Progress', icon: '/activities/icon-progress.svg' },
    { label: 'Learn', icon: '/activities/icon-learn.svg' },
    { label: 'Caregiver Corner', icon: '/activities/icon-users.svg' },
  ]

  const home: NavLink = { label: 'All activities', href: '/', match: '/' }

  function isCurrent(link: NavLink) {
    return link.match === '/' ? route.path === '/' : route.path.startsWith(link.match)
  }

  const activeClass = 'bg-orange-700 font-bold'
  const idleClass = 'hover:bg-white/10'

  const menuOpen = ref(false)
  const menuButton = ref<HTMLButtonElement | null>(null)

  // Close the menu after navigating so the new page is visible straight away.
  watch(
    () => route.fullPath,
    () => {
      menuOpen.value = false
    }
  )

  function closeMenu() {
    if (!menuOpen.value) return
    menuOpen.value = false
    menuButton.value?.focus()
  }
</script>

<template>
  <!-- Desktop sidebar -->
  <aside
    class="bn-font-display relative hidden w-[310px] shrink-0 flex-col overflow-y-auto border border-black bg-[var(--bn-sidebar)] lg:sticky lg:top-0 lg:flex lg:h-screen xl:w-[342px]"
    aria-label="Main navigation"
  >
    <div class="px-6 pt-14">
      <img
        src="/activities/logo-white.png"
        alt="Beyond Neuro"
        class="mx-auto h-[55px] w-[170px] object-contain"
        width="170"
        height="55"
      />
    </div>

    <nav class="mt-12 flex flex-col gap-2.5 px-4 xl:px-6" aria-label="Primary">
      <div>
        <NuxtLink
          id="sidebar-activities-heading"
          :to="home.href"
          class="flex w-full items-center gap-3 rounded-full px-3.5 py-3 text-[20px] leading-[30px] font-medium text-white focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none"
          :class="isCurrent(home) ? activeClass : idleClass"
          :aria-current="isCurrent(home) ? 'page' : undefined"
        >
          <img
            src="/activities/icon-activity.svg"
            alt=""
            class="size-5 shrink-0"
            width="20"
            height="20"
          />
          Activities
        </NuxtLink>
        <ul
          class="ml-3 flex list-none flex-col gap-1.5 border-l-2 border-white/30 p-0 pl-2 xl:ml-5 xl:pl-3"
          aria-labelledby="sidebar-activities-heading"
        >
          <li v-for="link in activities" :key="link.href">
            <NuxtLink
              :to="link.href"
              class="flex w-full items-center rounded-3xl px-3.5 py-3 text-[19px] leading-7 text-white focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none"
              :class="isCurrent(link) ? activeClass : idleClass"
              :aria-current="isCurrent(link) ? 'page' : undefined"
            >
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <span
        v-for="item in comingSoon"
        :key="item.label"
        class="flex w-full items-center gap-3 rounded-full px-3.5 py-3 text-[20px] leading-[30px] text-white/80"
      >
        <img :src="item.icon" alt="" class="size-5 shrink-0 opacity-80" width="20" height="20" />
        <span class="font-medium">{{ item.label }}</span>
        <span class="sr-only">(coming soon)</span>
      </span>
    </nav>

    <InstallAppButton class="mt-auto px-4 pt-8 pb-10 xl:px-6" />
  </aside>

  <!-- Phone / tablet top bar with collapsible menu -->
  <header
    class="bn-font-body sticky top-0 z-40 border-b border-black/10 bg-[var(--bn-sidebar)] lg:hidden"
    @keydown.esc="closeMenu"
  >
    <div class="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <NuxtLink
        to="/"
        class="rounded-lg focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none"
      >
        <img
          src="/activities/logo-white.png"
          alt="Beyond Neuro, all activities"
          class="h-10 w-auto object-contain"
          width="122"
          height="40"
        />
      </NuxtLink>

      <div class="flex items-center gap-2">
        <InstallAppButton compact class="hidden sm:block" />
        <button
          ref="menuButton"
          type="button"
          class="flex min-h-12 items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-lg font-medium text-white hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none"
          :aria-expanded="menuOpen"
          aria-controls="mobile-nav-panel"
          @click="menuOpen = !menuOpen"
        >
          <svg class="size-6 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              v-if="menuOpen"
              d="M6 6l12 12M18 6 6 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
            <path
              v-else
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
          {{ menuOpen ? 'Close' : 'Menu' }}
        </button>
      </div>
    </div>

    <nav
      v-show="menuOpen"
      id="mobile-nav-panel"
      class="max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-white/15 px-4 pt-3 pb-6 sm:px-6"
      aria-label="Main navigation"
    >
      <ul class="grid list-none gap-2 p-0 sm:grid-cols-2">
        <li v-for="link in [home, ...activities]" :key="`m-${link.href}`">
          <NuxtLink
            :to="link.href"
            class="flex min-h-12 w-full items-center rounded-2xl px-4 py-3 text-lg text-white focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none"
            :class="isCurrent(link) ? activeClass : 'hover:bg-white/10'"
            :aria-current="isCurrent(link) ? 'page' : undefined"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>

      <ul class="mt-4 grid list-none gap-1 border-t border-white/15 p-0 pt-4 sm:grid-cols-3">
        <li
          v-for="item in comingSoon"
          :key="`m-${item.label}`"
          class="flex items-center gap-3 px-4 py-2 text-lg text-white/80"
        >
          <img :src="item.icon" alt="" class="size-5 shrink-0 opacity-80" width="20" height="20" />
          {{ item.label }}
          <span class="sr-only">(coming soon)</span>
        </li>
      </ul>

      <InstallAppButton compact class="mt-4 sm:hidden" />
    </nav>
  </header>
</template>

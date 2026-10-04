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
    { label: 'Coloring & Visual Art', href: '/coloring', match: '/coloring' },
    { label: 'Puzzles & Games', href: '/puzzles', match: '/puzzles' },
    { label: 'Music Therapy & Rhythm', href: '/music', match: '/music' },
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
</script>

<template>
  <!-- Tablet / desktop sidebar -->
  <aside
    class="bn-font-display relative hidden min-h-screen w-[310px] shrink-0 flex-col border border-black bg-[var(--bn-sidebar)] md:flex lg:w-[342px]"
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

    <nav class="mt-12 flex flex-col gap-2.5 px-4 lg:px-6" aria-label="Primary">
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
          class="ml-3 flex list-none flex-col gap-1.5 border-l-2 border-white/30 p-0 pl-2 lg:ml-5 lg:pl-3"
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
  </aside>

  <!-- Phone top nav -->
  <header
    class="bn-font-body flex flex-col gap-3 border-b border-black/10 bg-[var(--bn-sidebar)] px-4 py-4 md:hidden"
    aria-label="Main navigation"
  >
    <img
      src="/activities/logo-white.png"
      alt="Beyond Neuro"
      class="h-10 w-auto self-start object-contain"
      width="122"
      height="40"
    />
    <nav aria-label="Primary">
      <ul class="flex list-none flex-wrap gap-2 p-0">
        <li v-for="link in [home, ...activities]" :key="`m-${link.href}`">
          <NuxtLink
            :to="link.href"
            class="flex min-h-12 items-center rounded-full px-4 py-2 text-lg text-white focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none"
            :class="isCurrent(link) ? activeClass : 'border border-white/40 hover:bg-white/10'"
            :aria-current="isCurrent(link) ? 'page' : undefined"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

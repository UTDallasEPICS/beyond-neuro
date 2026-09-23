<script setup lang="ts">
  const navItems: Array<{
    label: string
    icon: string
    href: string
    active?: boolean
  }> = [
    { label: 'Home', icon: '/activities/icon-home.svg', href: '/' },
    {
      label: 'Activities',
      icon: '/activities/icon-activity.svg',
      href: '/activities/reminiscence/life-story',
      active: true,
    },
    { label: 'My Progress', icon: '/activities/icon-progress.svg', href: '#' },
    { label: 'Learn', icon: '/activities/icon-learn.svg', href: '#' },
    { label: 'Caregiver Corner', icon: '/activities/icon-users.svg', href: '#' },
  ]

  function isInternal(href: string) {
    return href.startsWith('/') && href !== '#'
  }
</script>

<template>
  <!-- Desktop sidebar -->
  <aside
    class="bn-font-display relative hidden min-h-screen w-[342px] shrink-0 flex-col border border-black bg-[var(--bn-sidebar)] lg:flex"
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

    <nav class="mt-12 flex flex-col gap-2.5 px-6" aria-label="Primary">
      <template v-for="item in navItems" :key="item.label">
        <NuxtLink
          v-if="isInternal(item.href)"
          :to="item.href"
          class="flex w-full items-center gap-3 rounded-full px-3.5 py-3 text-[20px] leading-[30px] text-white"
          :class="item.active ? 'bg-[var(--bn-orange)]' : ''"
        >
          <img :src="item.icon" alt="" class="size-5 shrink-0" width="20" height="20" />
          <span :class="item.label === 'Learn' ? 'font-bold' : 'font-medium'">{{ item.label }}</span>
        </NuxtLink>
        <span
          v-else
          class="flex w-full items-center gap-3 rounded-full px-3.5 py-3 text-[20px] leading-[30px] text-white"
          :class="item.active ? 'bg-[var(--bn-orange)]' : ''"
        >
          <img :src="item.icon" alt="" class="size-5 shrink-0" width="20" height="20" />
          <span :class="item.label === 'Learn' ? 'font-bold' : 'font-medium'">{{ item.label }}</span>
        </span>
      </template>
    </nav>

    <p class="mt-auto px-6 pb-10 pt-16 text-[18px] leading-7 font-medium text-white/80">
      Logged in as Caregiver Eleanor
    </p>
  </aside>

  <!-- Mobile / tablet top nav -->
  <header
    class="bn-font-body flex items-center gap-3 border-b border-black/10 bg-[var(--bn-sidebar)] px-4 py-3 lg:hidden"
    aria-label="Main navigation"
  >
    <img
      src="/activities/logo-white.png"
      alt="Beyond Neuro"
      class="h-9 w-auto object-contain"
      width="110"
      height="36"
    />
    <nav class="ml-auto flex items-center gap-1 overflow-x-auto" aria-label="Primary">
      <template v-for="item in navItems" :key="`m-${item.label}`">
        <NuxtLink
          v-if="isInternal(item.href)"
          :to="item.href"
          class="flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm text-white"
          :class="item.active ? 'bg-[var(--bn-orange)]' : ''"
          :aria-label="item.label"
        >
          <img :src="item.icon" alt="" class="size-[18px]" width="18" height="18" />
          <span class="hidden sm:inline">{{ item.label }}</span>
        </NuxtLink>
        <span
          v-else
          class="flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm text-white"
          :class="item.active ? 'bg-[var(--bn-orange)]' : ''"
          :aria-label="item.label"
        >
          <img :src="item.icon" alt="" class="size-[18px]" width="18" height="18" />
          <span class="hidden sm:inline">{{ item.label }}</span>
        </span>
      </template>
    </nav>
  </header>
</template>

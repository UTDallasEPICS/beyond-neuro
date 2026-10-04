<script setup lang="ts">
  defineProps<{
    tag: string
    title: string
    subtitle: string
    tabsLabel: string
    tabs: Array<{ label: string; to: string }>
  }>()

  const route = useRoute()
</script>

<template>
  <div class="bn-font-body flex min-h-screen flex-col bg-[var(--bn-cream)] md:flex-row">
    <ActivitiesActivityModuleSidebar />

    <main class="flex-1 overflow-x-hidden">
      <div class="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-8 lg:px-[60px] lg:py-[60px]">
        <header class="max-w-[800px]">
          <span
            class="inline-flex rounded-md bg-[var(--bn-peach)] px-3 py-1.5 text-lg font-bold tracking-wide text-orange-800 uppercase"
          >
            {{ tag }}
          </span>
          <h1
            class="bn-font-display mt-2 text-3xl font-bold text-[var(--bn-navy)] sm:text-[40px] sm:leading-[48px]"
          >
            {{ title }}
          </h1>
          <p class="mt-2 text-lg text-[var(--bn-navy)] sm:text-[19px] sm:leading-[29px]">
            {{ subtitle }}
          </p>
        </header>

        <nav class="mt-8" :aria-label="tabsLabel">
          <ul class="flex list-none flex-wrap gap-3 p-0">
            <li v-for="tab in tabs" :key="tab.to">
              <NuxtLink
                :to="tab.to"
                class="flex min-h-[56px] items-center rounded-full border-2 px-6 py-3 text-lg font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
                :class="
                  route.path === tab.to
                    ? 'border-[var(--bn-navy)] bg-[var(--bn-navy)] text-white'
                    : 'border-[var(--bn-border)] bg-white text-[var(--bn-navy)] hover:border-orange-700'
                "
                :aria-current="route.path === tab.to ? 'page' : undefined"
              >
                {{ tab.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <div class="mt-8 pb-8">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>

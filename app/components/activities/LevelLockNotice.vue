<script setup lang="ts">
  // Tells a logged-out person that the higher levels need an account. Renders nothing once they
  // are logged in, or when the game has no locked levels.
  const props = defineProps<{ total: number }>()

  const { isLoggedIn, FREE_LEVEL_COUNT } = useLevelAccess()
  const firstLocked = FREE_LEVEL_COUNT + 1
  const range = computed(() =>
    props.total === firstLocked ? `Level ${firstLocked} needs` : `Levels ${firstLocked}–${props.total} need`
  )
  const linkText = computed(() =>
    props.total === firstLocked ? 'Log in to unlock it' : 'Log in to unlock them'
  )
</script>

<template>
  <p
    v-if="!isLoggedIn && total > FREE_LEVEL_COUNT"
    class="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-[var(--bn-border)] bg-white px-4 py-3 text-lg text-[var(--bn-navy)]"
  >
    <svg
      class="size-5 shrink-0 text-[var(--bn-muted)]"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <rect x="4" y="9" width="12" height="9" rx="2" />
      <path d="M7 9V6a3 3 0 0 1 6 0v3" stroke-linecap="round" />
    </svg>
    <span>{{ range }} an account.</span>
    <NuxtLink
      to="/auth"
      class="font-semibold text-orange-800 underline underline-offset-4 hover:text-orange-900 focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:outline-none"
    >
      {{ linkText }}
    </NuxtLink>
  </p>
</template>

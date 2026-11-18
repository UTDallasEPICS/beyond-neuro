<script setup lang="ts">
  import type { authClient } from '~/utils/auth-client'

  const { data: session } = await useFetch<typeof authClient.$Infer.Session | null>(
    '/api/auth/get-session'
  )
</script>

<template>
  <span
    v-if="session"
    class="inline-flex min-h-14 max-w-full items-center rounded-full px-5 font-semibold wrap-anywhere"
  >
    {{ session.user.name || session.user.email }}
  </span>
  <NuxtLink
    v-else
    to="/auth"
    class="inline-flex min-h-14 items-center rounded-full px-5 font-semibold hover:bg-[var(--bn-peach)] focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
  >
    Login
  </NuxtLink>
</template>

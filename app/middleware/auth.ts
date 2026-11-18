import type { authClient } from '~/utils/auth-client'

export default defineNuxtRouteMiddleware(async () => {
  const requestFetch = useRequestFetch()
  const session = await requestFetch<typeof authClient.$Infer.Session | null>(
    '/api/auth/get-session'
  )

  if (!session) {
    return navigateTo('/auth')
  }
})

import { authClient } from '../utils/auth-client'

export default defineNuxtRouteMiddleware(async (to) => {
  // Coloring & Visual Art is public — no login required.
  if (to.path === '/coloring' || to.path.startsWith('/coloring/')) {
    return
  }

  const { data: session } = await authClient.useSession(useFetch)

  if (session.value) {
    if (to.path === '/auth') {
      return navigateTo('/')
    }
  } else {
    if (to.path !== '/auth') {
      return navigateTo('/auth')
    }
  }
})

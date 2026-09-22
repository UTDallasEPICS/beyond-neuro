import { authClient } from '../utils/auth-client'

const publicPaths = ['/auth', '/activities/reminiscence-therapy']

export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await authClient.useSession(useFetch)

  if (session.value) {
    if (to.path === '/auth') {
      return navigateTo('/')
    }
  } else {
    if (!publicPaths.includes(to.path)) {
      return navigateTo('/auth')
    }
  }
})
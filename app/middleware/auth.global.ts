import { authClient } from '../utils/auth-client'

// TEMP: activity pages are public per HDGU no-login spec. Team to decide real approach.
const publicPrefixes = ['/activities']

export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await authClient.useSession(useFetch)

  const isPublic =
    to.path === '/auth' ||
    publicPrefixes.some((p) => to.path.startsWith(p))

  if (session.value) {
    if (to.path === '/auth') {
      return navigateTo('/')
    }
  } else {
    if (!isPublic) {
      return navigateTo('/auth')
    }
  }
})

import { authClient } from '../utils/auth-client'

const PUBLIC_PATHS = new Set([
  '/auth',
  '/activities/reminiscence/life-story',
  '/activities/reminiscence/life-story-prompts',
])
export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await authClient.useSession(useFetch)

  if (session.value) {
    if (to.path === '/auth') {
      return navigateTo('/')
    }
  } else {
    if (!PUBLIC_PATHS.has(to.path)) {
      return navigateTo('/auth')
    }
  }
})

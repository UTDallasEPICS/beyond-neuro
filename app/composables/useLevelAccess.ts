// Which game levels a person can play. Without an account only the first few levels of each game
// are open; signing in unlocks the rest. Login itself lives in ~/utils/auth-client.
export const FREE_LEVEL_COUNT = 3

export function useLevelAccess() {
  // Logged out until the session has loaded, so the server render and the first client render
  // agree (no hydration mismatch). The session store is shared, so this is one request per page.
  const isLoggedIn = useState('bn-logged-in', () => false)

  if (import.meta.client) {
    const session = authClient.useSession()
    watchEffect(() => {
      isLoggedIn.value = Boolean(session.value.data)
    })
  }

  /** `position` is 0-based: 0 is the first level. */
  function isLevelLocked(position: number) {
    return !isLoggedIn.value && position >= FREE_LEVEL_COUNT
  }

  return { isLoggedIn, isLevelLocked, FREE_LEVEL_COUNT }
}

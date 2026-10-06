export const REACH_AND_REFLECT_CATEGORIES = [
  'animals',
  'fruits',
  'cities',
  'colors',
  'musical instruments',
  'tools',
  'vegetables',
  'countries',
  'movies',
  'books',
] as const

export type ReachCategory = (typeof REACH_AND_REFLECT_CATEGORIES)[number]
export type ReachSide = 'left' | 'right'

export const ROUND_SECONDS = 60
export const SIDE_SWITCH_MS = 800

export function nextSide(side: ReachSide): ReachSide {
  return side === 'left' ? 'right' : 'left'
}

export function nextSecond(secondsLeft: number): { secondsLeft: number; finished: boolean } {
  if (secondsLeft <= 1) return { secondsLeft: 0, finished: true }
  return { secondsLeft: secondsLeft - 1, finished: false }
}

export function pickCategory(random: number = Math.random()): ReachCategory {
  const index = Math.min(
    REACH_AND_REFLECT_CATEGORIES.length - 1,
    Math.floor(random * REACH_AND_REFLECT_CATEGORIES.length)
  )
  return REACH_AND_REFLECT_CATEGORIES[index]!
}

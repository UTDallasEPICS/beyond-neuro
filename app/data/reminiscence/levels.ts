export const REMINISCENCE_LEVELS = [1, 2, 3, 4, 5, 6, 7] as const

export type ReminiscenceLevel = (typeof REMINISCENCE_LEVELS)[number]

export function nextLevel(level: ReminiscenceLevel): ReminiscenceLevel | null {
  return REMINISCENCE_LEVELS.find((l) => l === level + 1) ?? null
}

export type MovementId = 'walk' | 'march'

export interface Movement {
  id: MovementId
  label: string
  instruction: string
}

export interface CountLevel {
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7
  label: string
  description: string
  start: number
  step: number
}

export const movements: Movement[] = [
  {
    id: 'walk',
    label: 'Walk',
    instruction: 'Walk slowly around the room.',
  },
  {
    id: 'march',
    label: 'March in place',
    instruction: 'Stand and lift your knees one at a time.',
  },
]

export const countLevels: CountLevel[] = [
  { level: 1, label: 'Level 1', description: 'Count back by 1s from 20', start: 20, step: 1 },
  { level: 2, label: 'Level 2', description: 'Count back by 2s from 30', start: 30, step: 2 },
  { level: 3, label: 'Level 3', description: 'Count back by 3s from 50', start: 50, step: 3 },
  { level: 4, label: 'Level 4', description: 'Count back by 4s from 60', start: 60, step: 4 },
  { level: 5, label: 'Level 5', description: 'Count back by 5s from 80', start: 80, step: 5 },
  { level: 6, label: 'Level 6', description: 'Count back by 6s from 90', start: 90, step: 6 },
  { level: 7, label: 'Level 7', description: 'Count back by 7s from 100', start: 100, step: 7 },
]

export const COUNT_STEP_MS = 2000

export function nextCount(current: number, step: number): { current: number; finished: boolean } {
  const next = current - step
  if (next < 0) return { current, finished: true }
  return { current: next, finished: false }
}
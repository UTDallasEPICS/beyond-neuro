export type MovementId = 'walk' | 'march'

export interface Movement {
  id: MovementId
  label: string
  instruction: string
}

export interface CountLevel {
  level: 1 | 2 | 3 | 4
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
  { level: 4, label: 'Level 4', description: 'Count back by 7s from 100', start: 100, step: 7 },
]

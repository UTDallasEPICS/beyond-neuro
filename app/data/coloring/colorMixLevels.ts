import type { PaintId, Recipe } from '~/utils/colorMixing'

export interface Paint {
  id: PaintId
  hex: string
  name: string
}

export interface ColorMixLevel {
  level: string
  name: string // name of the target color
  recipe: Recipe // the answer — target color is computed from this
  palette: PaintId[] // paints the user can choose from
  maxDrops: number // bowl size
  skill: string // what's new at this level (shown under the level title)
}

export const PAINTS: Record<PaintId, Paint> = {
  red: { id: 'red', hex: '#ff0000', name: 'Red' },
  yellow: { id: 'yellow', hex: '#ffff00', name: 'Yellow' },
  blue: { id: 'blue', hex: '#2a5f99', name: 'Blue' },
  white: { id: 'white', hex: '#ffffff', name: 'White' },
  black: { id: 'black', hex: '#1a1a1c', name: 'Black' },
}

export const COLOR_MIX_LEVELS: ColorMixLevel[] = [
  {
    level: 'Level 1',
    name: 'Orange',
    recipe: { red: 1, yellow: 1 },
    palette: ['red', 'yellow', 'blue'],
    maxDrops: 6,
    skill: 'Mix two colors',
  },
  {
    level: 'Level 2',
    name: 'Pink',
    recipe: { red: 1, white: 1 },
    palette: ['red', 'yellow', 'blue', 'white'],
    maxDrops: 6,
    skill: 'White makes colors lighter',
  },
  {
    level: 'Level 3',
    name: 'Golden Yellow',
    recipe: { red: 1, yellow: 2 },
    palette: ['red', 'yellow', 'blue', 'white'],
    maxDrops: 8,
    skill: 'Use more of one color',
  },
  {
    level: 'Level 4',
    name: 'Lavender',
    recipe: { red: 1, blue: 1, white: 2 },
    palette: ['red', 'yellow', 'blue', 'white'],
    maxDrops: 10,
    skill: 'Mix three colors',
  },
  {
    level: 'Level 5',
    name: 'Brown',
    recipe: { red: 2, yellow: 2, blue: 1 },
    palette: ['red', 'yellow', 'blue', 'white', 'black'],
    maxDrops: 10,
    skill: 'Red, yellow, and blue together',
  },
  {
    level: 'Level 6',
    name: 'Stormy Blue',
    recipe: { blue: 2, white: 2, black: 1 },
    palette: ['red', 'yellow', 'blue', 'white', 'black'],
    maxDrops: 12,
    skill: 'Black makes colors darker',
  },
  {
    level: 'Level 7',
    name: 'Sage Green',
    recipe: { yellow: 2, blue: 1, white: 2, black: 1 },
    palette: ['red', 'yellow', 'blue', 'white', 'black'],
    maxDrops: 12,
    skill: 'Mix four colors',
  },
]

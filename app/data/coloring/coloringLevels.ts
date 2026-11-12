export interface PbnColor {
  n: number
  name: string
  hex: string
}

export interface PbnLevel {
  level: number
  title: string
  file: string
  pairsWith: string
  colors: PbnColor[]
}

// Color names match the keys printed on LV's SVGs.
const HEX: Record<string, string> = {
  Red: '#E53935',
  Green: '#43A047',
  Brown: '#8D5A3B',
  'Dark Brown': '#5D3A1A',
  'Light Blue': '#8ECDF0',
  Blue: '#1E6FD9',
  Navy: '#1F2A6B',
  Teal: '#14A098',
  Yellow: '#FDD835',
  Gold: '#D4A017',
  Orange: '#FB8C00',
  Pink: '#F48FB1',
  Purple: '#7E57C2',
  Lavender: '#C5B3E6',
  'Light Green': '#A5D6A7',
  'Dark Green': '#2E7D32',
  Peach: '#FFCBA4',
  Gray: '#9E9E9E',
  'Dark Gray': '#555B61',
}

const palette = (names: string[]): PbnColor[] =>
  names.map((name, i) => ({ n: i + 1, name, hex: HEX[name] ?? '#CCCCCC' }))

const dir = '/activities/coloring'

export const coloringLevels: PbnLevel[] = [
  {
    level: 1,
    title: 'The Apple',
    file: `${dir}/level-1-the-apple.svg`,
    pairsWith: 'Reminiscence Therapy',
    colors: palette(['Red', 'Green', 'Brown', 'Light Blue']),
  },
  {
    level: 2,
    title: 'Morning Coffee',
    file: `${dir}/level-2-morning-coffee.svg`,
    pairsWith: 'Reality Orientation',
    colors: palette(['Yellow', 'Brown', 'Blue', 'Red', 'Gray']),
  },
  {
    level: 3,
    title: 'Tulip in a Pot',
    file: `${dir}/level-3-tulip-in-a-pot.svg`,
    pairsWith: 'Horticultural Therapy',
    colors: palette(['Light Blue', 'Yellow', 'Brown', 'Red', 'Pink', 'Green']),
  },
  {
    level: 4,
    title: 'Home Sweet Home',
    file: `${dir}/level-4-home-sweet-home.svg`,
    pairsWith: 'Reminiscence Therapy',
    colors: palette(['Light Blue', 'Yellow', 'Red', 'Dark Gray', 'Brown', 'Green', 'Gray', 'Pink']),
  },
  {
    level: 5,
    title: 'Garden Butterfly',
    file: `${dir}/level-5-garden-butterfly.svg`,
    pairsWith: 'Horticultural Therapy',
    colors: palette([
      'Light Blue',
      'Light Green',
      'Orange',
      'Yellow',
      'Purple',
      'Pink',
      'Dark Brown',
      'Red',
      'Dark Green',
      'Blue',
    ]),
  },
  {
    level: 6,
    title: 'Garden Mandala',
    file: `${dir}/level-6-garden-mandala.svg`,
    pairsWith: 'Music Therapy & Rhythm',
    colors: palette([
      'Light Blue',
      'Navy',
      'Yellow',
      'Orange',
      'Red',
      'Pink',
      'Purple',
      'Light Green',
      'Dark Green',
      'Teal',
      'Brown',
      'Gold',
    ]),
  },
  {
    level: 7,
    title: 'Rose Window',
    file: `${dir}/level-7-rose-window.svg`,
    pairsWith: 'Writing & Calligraphy',
    colors: palette([
      'Light Blue',
      'Navy',
      'Teal',
      'Gold',
      'Red',
      'Orange',
      'Yellow',
      'Pink',
      'Purple',
      'Lavender',
      'Light Green',
      'Dark Green',
      'Brown',
      'Peach',
    ]),
  },
]

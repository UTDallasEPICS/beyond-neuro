export type PaintLevelId = 1 | 2 | 3

export interface PaintRegion {
  id: string
  d: string
  number: number
  labelX: number
  labelY: number
}

export interface PaintLevel {
  palette: readonly string[]
  regions: PaintRegion[]
  decorations?: string[]
}

export interface Illustration {
  id: string
  title: string
  origin: string
  description: string
  viewBox: string
  levels: Record<PaintLevelId, PaintLevel>
}

export const paintLevels: readonly { id: PaintLevelId; name: string; hint: string }[] = [
  { id: 1, name: 'Level 1', hint: 'Big shapes, few colors' },
  { id: 2, name: 'Level 2', hint: 'More shapes' },
  { id: 3, name: 'Level 3', hint: 'Small details' },
]

const round = (n: number) => Math.round(n * 10) / 10

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return { x: round(cx + r * Math.cos(rad)), y: round(cy + r * Math.sin(rad)) }
}

function circle(
  id: string,
  number: number,
  cx: number,
  cy: number,
  r: number,
  label = { x: cx, y: cy }
): PaintRegion {
  return {
    id,
    number,
    d: `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`,
    labelX: label.x,
    labelY: label.y,
  }
}

function ellipse(
  id: string,
  number: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number
): PaintRegion {
  return {
    id,
    number,
    d: `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`,
    labelX: cx,
    labelY: cy,
  }
}

function rect(
  id: string,
  number: number,
  x: number,
  y: number,
  w: number,
  h: number,
  label = { x: x + w / 2, y: y + h / 2 }
): PaintRegion {
  return {
    id,
    number,
    d: `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`,
    labelX: label.x,
    labelY: label.y,
  }
}

function sector(
  id: string,
  number: number,
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number,
  labelR: number
): PaintRegion {
  const start = polar(cx, cy, r, startDeg)
  const end = polar(cx, cy, r, endDeg)
  const label = polar(cx, cy, labelR, (startDeg + endDeg) / 2)
  return {
    id,
    number,
    d: `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y} Z`,
    labelX: label.x,
    labelY: label.y,
  }
}

function petalPoints(
  cx: number,
  cy: number,
  deg: number,
  innerR: number,
  outerR: number,
  halfWidth: number
) {
  const base = polar(cx, cy, innerR, deg)
  const tip = polar(cx, cy, outerR, deg)
  const mid = polar(cx, cy, (innerR + outerR) / 2, deg)
  const rad = (deg * Math.PI) / 180

  const ox = -Math.sin(rad) * halfWidth * 2
  const oy = Math.cos(rad) * halfWidth * 2
  return { base, tip, mid, ox, oy }
}

function petal(
  id: string,
  number: number,
  cx: number,
  cy: number,
  deg: number,
  innerR: number,
  outerR: number,
  halfWidth: number
): PaintRegion {
  const { base, tip, mid, ox, oy } = petalPoints(cx, cy, deg, innerR, outerR, halfWidth)
  return {
    id,
    number,
    d:
      `M ${base.x} ${base.y} ` +
      `Q ${round(mid.x + ox)} ${round(mid.y + oy)} ${tip.x} ${tip.y} ` +
      `Q ${round(mid.x - ox)} ${round(mid.y - oy)} ${base.x} ${base.y} Z`,
    labelX: mid.x,
    labelY: mid.y,
  }
}

// The petal cut down its middle into two halves.
function petalHalves(
  id: string,
  numbers: [number, number],
  cx: number,
  cy: number,
  deg: number,
  innerR: number,
  outerR: number,
  halfWidth: number
): PaintRegion[] {
  const { base, tip, mid, ox, oy } = petalPoints(cx, cy, deg, innerR, outerR, halfWidth)
  return [
    {
      id: `${id}-a`,
      number: numbers[0],
      d:
        `M ${base.x} ${base.y} ` +
        `Q ${round(mid.x + ox)} ${round(mid.y + oy)} ${tip.x} ${tip.y} ` +
        `L ${base.x} ${base.y} Z`,
      labelX: round(mid.x + ox / 4),
      labelY: round(mid.y + oy / 4),
    },
    {
      id: `${id}-b`,
      number: numbers[1],
      d:
        `M ${base.x} ${base.y} L ${tip.x} ${tip.y} ` +
        `Q ${round(mid.x - ox)} ${round(mid.y - oy)} ${base.x} ${base.y} Z`,
      labelX: round(mid.x - ox / 4),
      labelY: round(mid.y - oy / 4),
    },
  ]
}

function lanternSegment(
  id: string,
  number: number,
  innerRx: number,
  outerRx: number,
  side: 'left' | 'right'
): PaintRegion {
  const out = side === 'right' ? 1 : 0
  const back = side === 'right' ? 0 : 1
  const direction = side === 'right' ? 1 : -1
  return {
    id,
    number,
    d: `M 200 90 A ${outerRx} 100 0 0 ${out} 200 290 A ${innerRx} 100 0 0 ${back} 200 90 Z`,
    labelX: 200 + direction * ((innerRx + outerRx) / 2),
    labelY: 190,
  }
}

// lantern band cut across its widest point into a top and bottom half.
function lanternHalf(
  id: string,
  number: number,
  innerRx: number,
  outerRx: number,
  side: 'left' | 'right',
  half: 'top' | 'bottom'
): PaintRegion {
  const out = side === 'right' ? 1 : 0
  const back = side === 'right' ? 0 : 1
  const direction = side === 'right' ? 1 : -1
  const outerX = 200 + direction * outerRx
  const innerX = 200 + direction * innerRx
  const d =
    half === 'top'
      ? `M 200 90 A ${outerRx} 100 0 0 ${out} ${outerX} 190 L ${innerX} 190 A ${innerRx} 100 0 0 ${back} 200 90 Z`
      : `M ${outerX} 190 A ${outerRx} 100 0 0 ${out} 200 290 A ${innerRx} 100 0 0 ${back} ${innerX} 190 Z`
  return {
    id,
    number,
    d,
    labelX: round(200 + direction * 0.866 * ((innerRx + outerRx) / 2)),
    labelY: half === 'top' ? 140 : 240,
  }
}

const eightWays = [0, 1, 2, 3, 4, 5, 6, 7]
const fourWays = [-90, 0, 90, 180]

// Rangoli

const rangoliPalette = ['#f59e0b', '#db2777', '#0d9488', '#7c3aed', '#fde68a']

const rangoliPetalsAndCenter: PaintRegion[] = [
  ...eightWays.map((i) => petal(`outer-${i}`, 4, 200, 200, -90 + i * 45, 45, 170, 36)),
  ...eightWays.map((i) =>
    petal(`inner-${i}`, i % 2 === 0 ? 2 : 3, 200, 200, -67.5 + i * 45, 40, 115, 20)
  ),
  circle('center', 1, 200, 200, 40),
]

const rangoli: Illustration = {
  id: 'rangoli',
  title: 'Rangoli',
  origin: 'India',
  description: 'A festive floor pattern made to welcome guests during Diwali.',
  viewBox: '0 0 400 400',
  levels: {
    1: {
      palette: ['#f59e0b', '#db2777', '#fde68a'],
      regions: [
        circle('backdrop', 3, 200, 200, 185, polar(200, 200, 150, -45)),
        ...fourWays.map((deg, i) => petal(`petal-${i}`, 2, 200, 200, deg, 40, 170, 50)),
        circle('center', 1, 200, 200, 40),
      ],
    },
    2: {
      palette: rangoliPalette,
      regions: [
        circle('backdrop', 5, 200, 200, 185, polar(200, 200, 150, -67.5)),
        ...rangoliPetalsAndCenter,
      ],
    },
    3: {
      palette: [...rangoliPalette, '#38bdf8'],
      regions: [
        ...eightWays.map((i) =>
          sector(
            `backdrop-${i}`,
            i % 2 === 0 ? 5 : 6,
            200,
            200,
            185,
            -90 + i * 45,
            -45 + i * 45,
            150
          )
        ),
        ...rangoliPetalsAndCenter,
      ],
    },
  },
}

// Paper Lantern

const lanternPalette = ['#d97706', '#dc2626', '#fb7185', '#7f1d1d', '#059669']

function tassel(number: number): PaintRegion {
  return {
    id: 'tassel',
    number,
    d: 'M 186 342 L 214 342 L 232 408 L 168 408 Z',
    labelX: 200,
    labelY: 378,
  }
}

const lanternBands = [
  { name: 'inner', innerRx: 0, outerRx: 50, top: 2, bottom: 3 },
  { name: 'middle', innerRx: 50, outerRx: 95, top: 3, bottom: 2 },
  { name: 'outer', innerRx: 95, outerRx: 130, top: 2, bottom: 3 },
] as const

const lantern: Illustration = {
  id: 'lantern',
  title: 'Paper Lantern',
  origin: 'China',
  description: 'Lanterns like this light up streets for the Lunar New Year.',
  viewBox: '0 0 400 420',
  levels: {
    1: {
      palette: ['#d97706', '#dc2626', '#059669'],
      decorations: ['M 200 16 V 62', 'M 200 314 V 342'],
      regions: [
        rect('top-cap', 1, 145, 62, 110, 26),
        ellipse('body', 2, 200, 190, 130, 100),
        rect('bottom-cap', 1, 150, 290, 100, 24),
        tassel(3),
      ],
    },
    2: {
      palette: lanternPalette,
      decorations: ['M 200 16 V 62'],
      regions: [
        rect('top-cap', 1, 145, 62, 110, 26),
        lanternSegment('left-inner', 2, 0, 50, 'left'),
        lanternSegment('left-middle', 3, 50, 95, 'left'),
        lanternSegment('left-outer', 2, 95, 130, 'left'),
        lanternSegment('right-inner', 2, 0, 50, 'right'),
        lanternSegment('right-middle', 3, 50, 95, 'right'),
        lanternSegment('right-outer', 2, 95, 130, 'right'),
        rect('bottom-cap', 1, 150, 290, 100, 24),
        circle('knot', 4, 200, 328, 14),
        tassel(5),
      ],
    },
    3: {
      palette: lanternPalette,
      decorations: ['M 200 16 V 62'],
      regions: [
        rect('top-cap', 1, 145, 62, 110, 26),
        ...(['left', 'right'] as const).flatMap((side) =>
          lanternBands.flatMap((band) => [
            lanternHalf(
              `${side}-${band.name}-top`,
              band.top,
              band.innerRx,
              band.outerRx,
              side,
              'top'
            ),
            lanternHalf(
              `${side}-${band.name}-bottom`,
              band.bottom,
              band.innerRx,
              band.outerRx,
              side,
              'bottom'
            ),
          ])
        ),
        rect('bottom-cap', 1, 150, 290, 100, 24),
        circle('knot', 4, 200, 328, 14),
        tassel(5),
      ],
    },
  },
}

// Talavera Tile

const talaveraPalette = ['#1d4ed8', '#facc15', '#ea580c', '#16a34a', '#fef3c7']

const talaveraFrame: PaintRegion = {
  id: 'frame',
  number: 1,
  d: 'M 20 20 H 380 V 380 H 20 Z M 50 50 V 350 H 350 V 50 Z',
  labelX: 200,
  labelY: 35,
}

const talaveraCorners: PaintRegion[] = [
  { id: 'corner-tl', number: 2, d: 'M 50 50 H 112 A 62 62 0 0 1 50 112 Z', labelX: 72, labelY: 72 },
  {
    id: 'corner-tr',
    number: 2,
    d: 'M 350 50 V 112 A 62 62 0 0 1 288 50 Z',
    labelX: 328,
    labelY: 72,
  },
  {
    id: 'corner-br',
    number: 2,
    d: 'M 350 350 H 288 A 62 62 0 0 1 350 288 Z',
    labelX: 328,
    labelY: 328,
  },
  {
    id: 'corner-bl',
    number: 2,
    d: 'M 50 350 V 288 A 62 62 0 0 1 112 350 Z',
    labelX: 72,
    labelY: 328,
  },
]

const talaveraLeaves = [45, 135, 225, 315].map((deg) =>
  petal(`leaf-${deg}`, 4, 200, 200, deg, 40, 118, 18)
)

const talavera: Illustration = {
  id: 'talavera',
  title: 'Talavera Tile',
  origin: 'Mexico',
  description: 'Hand-painted tiles from Puebla, known for bold blue and sunny yellow.',
  viewBox: '0 0 400 400',
  levels: {
    1: {
      palette: ['#1d4ed8', '#facc15', '#fef3c7'],
      regions: [
        talaveraFrame,
        rect('field', 3, 50, 50, 300, 300, { x: 130, y: 75 }),
        ...fourWays.map((deg) => petal(`petal-${deg}`, 2, 200, 200, deg, 30, 132, 50)),
        circle('center', 1, 200, 200, 34),
      ],
    },
    2: {
      palette: talaveraPalette,
      regions: [
        talaveraFrame,
        rect('field', 5, 50, 50, 300, 300, { x: 130, y: 75 }),
        ...talaveraCorners,
        ...talaveraLeaves,
        ...fourWays.map((deg) => petal(`petal-${deg}`, 3, 200, 200, deg, 30, 132, 42)),
        circle('center', 1, 200, 200, 34),
      ],
    },
    3: {
      palette: talaveraPalette,
      regions: [
        { id: 'frame-top', number: 1, d: 'M 20 20 H 380 L 350 50 H 50 Z', labelX: 200, labelY: 35 },
        {
          id: 'frame-right',
          number: 4,
          d: 'M 380 20 V 380 L 350 350 V 50 Z',
          labelX: 365,
          labelY: 200,
        },
        {
          id: 'frame-bottom',
          number: 1,
          d: 'M 380 380 H 20 L 50 350 H 350 Z',
          labelX: 200,
          labelY: 365,
        },
        {
          id: 'frame-left',
          number: 4,
          d: 'M 20 380 V 20 L 50 50 V 350 Z',
          labelX: 35,
          labelY: 200,
        },
        rect('field', 5, 50, 50, 300, 300, { x: 130, y: 75 }),
        ...talaveraCorners,
        ...talaveraLeaves,
        ...fourWays.flatMap((deg) =>
          petalHalves(`petal-${deg}`, [3, 2], 200, 200, deg, 30, 132, 42)
        ),
        circle('center', 1, 200, 200, 34),
      ],
    },
  },
}

// Kente Cloth

const kentePalette = ['#eab308', '#15803d', '#dc2626', '#1f2937']

function kenteGrid(rows: number, cols: number, withBars: boolean): PaintRegion[] {
  const w = 360 / cols
  const h = 360 / rows
  return Array.from({ length: rows }, (_, row) => row).flatMap((row) =>
    Array.from({ length: cols }, (_, col) => col).flatMap((col) => {
      const x = 20 + col * w
      const y = 20 + row * h
      const id = `block-${row}-${col}`
      const cornerLabel = { x: x + 16, y: y + h / 6 }
      if ((row + col) % 2 === 0) {
        return withBars
          ? [rect(id, 1, x, y, w, h, cornerLabel), rect(`${id}-bar`, 4, x, y + h / 3, w, h / 3)]
          : [rect(id, 1, x, y, w, h)]
      }
      const cx = x + w / 2
      const cy = y + h / 2
      const dx = w * 0.3
      const dy = h / 3
      return [
        rect(id, 2, x, y, w, h, cornerLabel),
        {
          id: `${id}-diamond`,
          number: 3,
          d: `M ${cx} ${cy - dy} L ${cx + dx} ${cy} L ${cx} ${cy + dy} L ${cx - dx} ${cy} Z`,
          labelX: cx,
          labelY: cy,
        },
      ]
    })
  )
}

const kente: Illustration = {
  id: 'kente',
  title: 'Kente Cloth',
  origin: 'Ghana',
  description: 'Inspired by kente, the woven cloth of the Ashanti and Ewe peoples.',
  viewBox: '0 0 400 400',
  levels: {
    1: { palette: ['#eab308', '#15803d', '#dc2626'], regions: kenteGrid(3, 2, false) },
    2: { palette: kentePalette, regions: kenteGrid(4, 2, true) },
    3: { palette: kentePalette, regions: kenteGrid(5, 3, true) },
  },
}

export const illustrations: Illustration[] = [rangoli, lantern, talavera, kente]

export interface PaintRegion {
  id: string
  d: string
  number: number
  labelX: number
  labelY: number
}

export interface Illustration {
  id: string
  title: string
  origin: string
  description: string
  viewBox: string
  palette: readonly string[]
  regions: PaintRegion[]
  decorations?: string[]
}

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
  label = { x: cx, y: cy },
): PaintRegion {
  return {
    id,
    number,
    d: `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`,
    labelX: label.x,
    labelY: label.y,
  }
}

function rect(
  id: string,
  number: number,
  x: number,
  y: number,
  w: number,
  h: number,
  label = { x: x + w / 2, y: y + h / 2 },
): PaintRegion {
  return {
    id,
    number,
    d: `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`,
    labelX: label.x,
    labelY: label.y,
  }
}

function petal(
  id: string,
  number: number,
  cx: number,
  cy: number,
  deg: number,
  innerR: number,
  outerR: number,
  halfWidth: number,
): PaintRegion {
  const base = polar(cx, cy, innerR, deg)
  const tip = polar(cx, cy, outerR, deg)
  const mid = polar(cx, cy, (innerR + outerR) / 2, deg)
  const rad = (deg * Math.PI) / 180
  // A quadratic curve passes halfway to its control point, so double the offset
  // to make the petal reach `halfWidth` at its widest point.
  const ox = -Math.sin(rad) * halfWidth * 2
  const oy = Math.cos(rad) * halfWidth * 2
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

function lanternSegment(
  id: string,
  number: number,
  innerRx: number,
  outerRx: number,
  side: 'left' | 'right',
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

const eightWays = [0, 1, 2, 3, 4, 5, 6, 7]

const rangoli: Illustration = {
  id: 'rangoli',
  title: 'Rangoli',
  origin: 'India',
  description: 'A festive floor pattern made to welcome guests during Diwali.',
  viewBox: '0 0 400 400',
  palette: ['#f59e0b', '#db2777', '#0d9488', '#7c3aed', '#fde68a'],
  regions: [
    circle('backdrop', 5, 200, 200, 185, polar(200, 200, 150, -67.5)),
    ...eightWays.map((i) => petal(`outer-${i}`, 4, 200, 200, -90 + i * 45, 45, 170, 36)),
    ...eightWays.map((i) =>
      petal(`inner-${i}`, i % 2 === 0 ? 2 : 3, 200, 200, -67.5 + i * 45, 40, 115, 20),
    ),
    circle('center', 1, 200, 200, 40),
  ],
}

const lantern: Illustration = {
  id: 'lantern',
  title: 'Paper Lantern',
  origin: 'China',
  description: 'Lanterns like this light up streets for the Lunar New Year.',
  viewBox: '0 0 400 420',
  palette: ['#d97706', '#dc2626', '#fb7185', '#7f1d1d', '#059669'],
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
    {
      id: 'tassel',
      number: 5,
      d: 'M 186 342 L 214 342 L 232 408 L 168 408 Z',
      labelX: 200,
      labelY: 378,
    },
  ],
}

const talavera: Illustration = {
  id: 'talavera',
  title: 'Talavera Tile',
  origin: 'Mexico',
  description: 'Hand-painted tiles from Puebla, known for bold blue and sunny yellow.',
  viewBox: '0 0 400 400',
  palette: ['#1d4ed8', '#facc15', '#ea580c', '#16a34a', '#fef3c7'],
  regions: [
    {
      id: 'frame',
      number: 1,
      d: 'M 20 20 H 380 V 380 H 20 Z M 50 50 V 350 H 350 V 50 Z',
      labelX: 200,
      labelY: 35,
    },
    rect('field', 5, 50, 50, 300, 300, { x: 130, y: 75 }),
    { id: 'corner-tl', number: 2, d: 'M 50 50 H 112 A 62 62 0 0 1 50 112 Z', labelX: 72, labelY: 72 },
    { id: 'corner-tr', number: 2, d: 'M 350 50 V 112 A 62 62 0 0 1 288 50 Z', labelX: 328, labelY: 72 },
    { id: 'corner-br', number: 2, d: 'M 350 350 H 288 A 62 62 0 0 1 350 288 Z', labelX: 328, labelY: 328 },
    { id: 'corner-bl', number: 2, d: 'M 50 350 V 288 A 62 62 0 0 1 112 350 Z', labelX: 72, labelY: 328 },
    ...[45, 135, 225, 315].map((deg) => petal(`leaf-${deg}`, 4, 200, 200, deg, 40, 118, 18)),
    ...[-90, 0, 90, 180].map((deg) => petal(`petal-${deg}`, 3, 200, 200, deg, 30, 132, 42)),
    circle('center', 1, 200, 200, 34),
  ],
}

const kenteRows = [0, 1, 2, 3, 4]
const kenteColumns = [0, 1, 2]

const kente: Illustration = {
  id: 'kente',
  title: 'Kente Cloth',
  origin: 'Ghana',
  description: 'Inspired by kente, the woven cloth of the Ashanti and Ewe peoples.',
  viewBox: '0 0 400 400',
  palette: ['#eab308', '#15803d', '#dc2626', '#1f2937'],
  regions: kenteRows.flatMap((row) =>
    kenteColumns.flatMap((col) => {
      const x = 20 + col * 120
      const y = 20 + row * 72
      const id = `block-${row}-${col}`
      if ((row + col) % 2 === 0) {
        return [
          rect(id, 1, x, y, 120, 72, { x: x + 16, y: y + 12 }),
          rect(`${id}-bar`, 4, x, y + 24, 120, 24),
        ]
      }
      return [
        rect(id, 2, x, y, 120, 72, { x: x + 14, y: y + 14 }),
        {
          id: `${id}-diamond`,
          number: 3,
          d: `M ${x + 60} ${y + 12} L ${x + 96} ${y + 36} L ${x + 60} ${y + 60} L ${x + 24} ${y + 36} Z`,
          labelX: x + 60,
          labelY: y + 36,
        },
      ]
    }),
  ),
}

export const illustrations: Illustration[] = [rangoli, lantern, talavera, kente]

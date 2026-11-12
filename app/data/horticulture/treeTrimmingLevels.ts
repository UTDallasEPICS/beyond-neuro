// Tree trimming levels. Shapes are SVG path strings in the tree canvas's 600 × 540 drawing space.
// The leafy crown spans roughly x 80–520 and y 30–375 (trunk centred on x = 300), so every
// shape sits inside it and leaves something to trim all the way around.

export type ClipperSize = 'small' | 'medium' | 'large'

export interface TrimLevel {
  title: string
  /** Shown under the title: what to make. */
  goal: string
  /** One or more closed paths; the target shape is their union. */
  shape: string[]
  /** Tint the leaves outside the shape so it is clear what to trim. */
  tint: boolean
  /** Leaves within this distance of the outline count neither way, so shaky cuts are not penalised. */
  band: number
  /** Share of the leaves outside the outline that must be trimmed to finish the level. */
  target: number
  /** Clipper size picked when the level starts. */
  startSize: ClipperSize
}

function circle(cx: number, cy: number, r: number) {
  return `M${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} Z`
}

function roundedRect(x: number, y: number, w: number, h: number, r: number) {
  return `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`
}

export const TRIM_LEVELS: TrimLevel[] = [
  {
    title: 'A tidy crown',
    goal: 'Trim the orange leaves so the tree is a neat round crown.',
    shape: [circle(300, 205, 160)],
    tint: true,
    band: 22,
    target: 0.85,
    startSize: 'large',
  },
  {
    title: 'A round ball',
    goal: 'Trim the orange leaves to make a smaller round ball.',
    shape: [circle(300, 200, 120)],
    tint: true,
    band: 20,
    target: 0.88,
    startSize: 'large',
  },
  {
    title: 'A box hedge',
    goal: 'Trim the orange leaves to make a square box.',
    shape: [roundedRect(175, 85, 250, 250, 22)],
    tint: true,
    band: 18,
    target: 0.9,
    startSize: 'medium',
  },
  {
    title: 'A tall cone',
    goal: 'Trim around the outline to make a tall, pointed cone.',
    shape: ['M300 45 L428 345 Q300 362 172 345 Z'],
    tint: false,
    band: 18,
    target: 0.9,
    startSize: 'medium',
  },
  {
    title: 'A mushroom',
    goal: 'Trim around the outline to make a mushroom with a round cap.',
    shape: [
      'M140 218 C140 110 220 55 300 55 C380 55 460 110 460 218 C400 236 200 236 140 218 Z',
      roundedRect(252, 210, 96, 155, 14),
    ],
    tint: false,
    band: 15,
    target: 0.9,
    startSize: 'medium',
  },
  {
    title: 'A heart',
    goal: 'Trim around the outline to make a heart.',
    shape: [
      'M300 352 C230 300 150 245 155 160 C160 95 250 70 300 130 C350 70 440 95 445 160 C450 245 370 300 300 352 Z',
    ],
    tint: false,
    band: 14,
    target: 0.92,
    startSize: 'medium',
  },
  {
    title: 'A two-tier topiary',
    goal: 'Trim around the outline to make one ball sitting on top of another.',
    shape: [circle(300, 108, 62), circle(300, 263, 95)],
    tint: false,
    band: 12,
    target: 0.95,
    startSize: 'medium',
  },
]

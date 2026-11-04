export type PaintId = 'red' | 'yellow' | 'blue' | 'white' | 'black'
export type Recipe = Partial<Record<PaintId, number>>
export type RGB = [number, number, number]

const WHITE: RGB = [1, 1, 1]
const BLACK: RGB = [0.1, 0.1, 0.11]

// Corners of the RYB cube
const C000: RGB = [1, 1, 1] //          white
const C100: RGB = [1, 0, 0] //          red
const C010: RGB = [1, 1, 0] //          yellow
const C001: RGB = [0.163, 0.373, 0.6] // blue
const C110: RGB = [1, 0.5, 0] //        orange
const C101: RGB = [0.5, 0, 0.5] //      purple
const C011: RGB = [0, 0.66, 0.2] //     green
const C111: RGB = [0.2, 0.094, 0] //    dark brown

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function rybToRgb(r: number, y: number, b: number): RGB {
  const out: RGB = [0, 0, 0]
  for (let i = 0; i < 3; i++) {
    const x00 = lerp(C000[i]!, C100[i]!, r)
    const x10 = lerp(C010[i]!, C110[i]!, r)
    const x01 = lerp(C001[i]!, C101[i]!, r)
    const x11 = lerp(C011[i]!, C111[i]!, r)
    const y0 = lerp(x00, x10, y)
    const y1 = lerp(x01, x11, y)
    out[i] = lerp(y0, y1, b)
  }
  return out
}

export function totalDrops(recipe: Recipe): number {
  return Object.values(recipe).reduce((sum, n) => sum + (n ?? 0), 0)
}

/** Mix drops of paint. Returns null when the bowl is empty. */
export function mixPaints(recipe: Recipe): RGB | null {
  const r = recipe.red ?? 0
  const y = recipe.yellow ?? 0
  const b = recipe.blue ?? 0
  const w = recipe.white ?? 0
  const k = recipe.black ?? 0

  const chroma = r + y + b
  const total = chroma + w + k
  if (total === 0) return null

  // Only white and/or black → a gray
  if (chroma === 0) {
    return blend([
      [WHITE, w],
      [BLACK, k],
    ])
  }

  const max = Math.max(r, y, b)
  const base = rybToRgb(r / max, y / max, b / max)

  return blend([
    [base, chroma],
    [WHITE, w],
    [BLACK, k],
  ])
}

function blend(parts: [RGB, number][]): RGB {
  const total = parts.reduce((s, [, n]) => s + n, 0)
  const out: RGB = [0, 0, 0]
  for (const [color, n] of parts) {
    for (let i = 0; i < 3; i++) out[i]! += (color[i]! * n) / total
  }
  return out
}

export function rgbToHex([r, g, b]: RGB): string {
  const h = (v: number) =>
    Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

/** sRGB (0–1) → CIE L*a*b* */
function rgbToLab([r, g, b]: RGB): [number, number, number] {
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const R = lin(r)
  const G = lin(g)
  const B = lin(b)
  const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047
  const Y = R * 0.2126 + G * 0.7152 + B * 0.0722
  const Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const fx = f(X)
  const fy = f(Y)
  const fz = f(Z)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

export function deltaE(a: RGB, b: RGB): number {
  const [l1, a1, b1] = rgbToLab(a)
  const [l2, a2, b2] = rgbToLab(b)
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2)
}

// Anything under this counts as a match.
export const MATCH_THRESHOLD = 3

export function closenessSteps(mix: RGB | null, target: RGB): number {
  if (!mix) return 0
  const d = deltaE(mix, target)
  if (d < MATCH_THRESHOLD) return 4
  if (d < 10) return 3
  if (d < 25) return 2
  if (d < 45) return 1
  return 0
}

export function sameProportions(a: Recipe, b: Recipe): boolean {
  const ta = totalDrops(a)
  const tb = totalDrops(b)
  if (ta === 0 || tb === 0) return false
  const ids: PaintId[] = ['red', 'yellow', 'blue', 'white', 'black']
  return ids.every((id) => Math.abs((a[id] ?? 0) / ta - (b[id] ?? 0) / tb) < 1e-9)
}

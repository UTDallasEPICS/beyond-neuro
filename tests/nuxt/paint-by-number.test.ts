import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { coloringLevels } from '../../app/data/coloringLevels'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import PaintByNumberCanvas from '../../app/components/PaintByNumberCanvas.vue'
import { flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'

describe('paint-by-number levels', () => {
  // a group of related tests
  it('has 7 levels numbered 1 to 7', () => {
    // one test: a sentence describing what should be true
    const numbers = coloringLevels.map((l) => l.level)
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7]) // the check
  })

  it('does not lower colors as levels go up', () => {
    const counts = coloringLevels.map((l) => l.colors.length)

    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeGreaterThanOrEqual(counts[i-1]!)
    }
  })
  it.each(coloringLevels)('Level $level has a picture file', (level) => {
    const relativePath = level.file.slice(1)
    const fullPath = resolve(process.cwd(), 'public', relativePath)
    expect(existsSync(fullPath)).toBe(true)
  })

  it.each(coloringLevels)('Level $level picture shows its title and colors', (level) => {
    const relativePath = level.file.slice(1)
    const fullPath = resolve(process.cwd(), 'public', relativePath)

    const svg = readFileSync(fullPath, 'utf8')
    expect(svg).toContain(`Level ${level.level} · ${level.title}`)
    for (const color of level.colors) {
      // `color` is one color, like { n: 1, name: 'Red', hex: '#E53935' }
      expect(svg).toContain(`>${color.name}</text>`)
    }
  })

  it.each(coloringLevels)('Level $level has no duplicate colors', (level) => {
    const names = level.colors.map((c) => c.name)
    expect(new Set(names).size).toBe(names.length)
  })
})

// A tiny stand-in picture: three squares.
// Square 0 shows number 1, square 1 shows number 2, square 2 has no number (free choice).
const testSvg = (levelNumber: number) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 816 1056">
  <text x="408" y="56">Level ${levelNumber} · Test picture</text>
  <g clip-path="url(#f)">
    <rect x="100" y="200" width="200" height="200" fill="#fff"/>
    <rect x="400" y="200" width="200" height="200" fill="#fff"/>
    <rect x="100" y="500" width="200" height="200" fill="#fff"/>
  </g>
  <text x="200" y="300">1</text>
  <text x="500" y="300">2</text>
</svg>`

for (const level of coloringLevels) {
  registerEndpoint(level.file, () => testSvg(level.level))
}

// Stand-in #2: the test browser can't tell if a number sits inside a shape,
// so we answer with rectangle math.
function insideRect(this: SVGGeometryElement, p?: DOMPointInit) {
  const n = (attr: string) => Number(this.getAttribute(attr) ?? 0)
  const x = p?.x ?? 0
  const y = p?.y ?? 0
  return x >= n('x') && x <= n('x') + n('width') && y >= n('y') && y <= n('y') + n('height')
}

// Wait until the picture has finished loading.
async function untilLoaded(wrapper: Awaited<ReturnType<typeof mountSuspended>>) {
  await vi.waitFor(() => expect(wrapper.text()).not.toContain('Loading picture…'))
  await flushPromises()
  await nextTick()
}

beforeEach(() => {
  vi.spyOn(SVGGeometryElement.prototype, 'isPointInFill').mockImplementation(insideRect)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Paint by Number screen', () => {
  it('Shows 7 levels with Level 1 selected', async () => {
    const wrapper = await mountSuspended(PaintByNumberCanvas)

    const levelButtons = wrapper.findAll('[aria-label="Difficulty level"] button')
    expect(levelButtons).toHaveLength(7)
    expect(levelButtons[0]!.attributes('aria-pressed')).toBe('true')
    expect(levelButtons[1]!.attributes('aria-pressed')).toBe('false')

    wrapper.unmount()
  })

  it('Shows the right colors for each level', async () => {
    const wrapper = await mountSuspended(PaintByNumberCanvas)
    const palette = wrapper.findAll('[aria-label="Color palette"] button')
    expect(palette).toHaveLength(4)

    expect(palette[0]!.attributes('aria-label')).toBe('Color number 1, Red')

    const levelButtons = wrapper.findAll('[aria-label="Difficulty level"] button')
    await levelButtons[1]!.trigger('click')

    const newPalette = wrapper.findAll('[aria-label="Color palette"] button')
    expect(newPalette).toHaveLength(coloringLevels[1]!.colors.length)

    wrapper.unmount()
  })

  it('loads the pic and counts the numbered shapes', async () => {
    const wrapper = await mountSuspended(PaintByNumberCanvas)
    await untilLoaded(wrapper)
    const status = wrapper.get('[aria-live="polite"]')
    expect(status.text()).toBe('0 of 2 shapes colored')

    wrapper.unmount()
  })
})

describe('extra', () => {
  it('colors with matching number', async () => {
    const w = await mountSuspended(PaintByNumberCanvas); await untilLoaded(w)
    await w.get('[data-idx="0"]').trigger('click')
    expect(w.get('[aria-live="polite"]').text()).toContain('1 of 2 shapes colored')
    expect((w.get('[data-idx="0"]').element as SVGElement).style.fill).not.toBe('')
    w.unmount()
  })

  it('warns when the color does not match the shape number', async () => {
    const w = await mountSuspended(PaintByNumberCanvas)
    await untilLoaded(w)

    // Shape 0 needs color 1 (Red). Pick color 2 (Green) first.
    await w.get('[aria-label="Color number 2, Green"]').trigger('click')
    await w.get('[data-idx="0"]').trigger('click')

    const shape = w.get('[data-idx="0"]').element as SVGElement
    expect(shape.style.fill).toBe('#43A047') // Green was applied
    expect(shape.style.fill).not.toBe('#E53935') // not the matching Red

    // Progress stays at 0, the live message explains the correct number instead.
    const status = w.get('[aria-live="polite"]').text()
    expect(status).toContain('number 1')
    expect(status).toContain('Red')
    expect(status).not.toContain('1 of 2 shapes colored')

    w.unmount()
  })

  it('lets you color a free-choice shape with any color', async () => {
    const w = await mountSuspended(PaintByNumberCanvas)
    await untilLoaded(w)

    // Shape 2 has no number in the stand-in SVG, so any palette color is fine.
    await w.get('[data-idx="2"]').trigger('click')

    const shape = w.get('[data-idx="2"]').element as SVGElement
    expect(shape.style.fill).toBe('#E53935') // Level 1 starts on Red

    const status = w.get('[aria-live="polite"]').text()
    expect(status).toMatch(/Nice!|Lovely color!|Great job!|Beautiful!/)
    expect(status).toContain('0 of 2 shapes colored') 
    expect(status).not.toContain('This shape shows number')

    w.unmount()
  })

  it('undoes the last color', async () => {
    const w = await mountSuspended(PaintByNumberCanvas)
    await untilLoaded(w)

    const undoBtn = w.findAll('button').find((b) => b.text() === 'Undo')!
    expect(undoBtn.attributes('disabled')).toBeDefined()

    await w.get('[data-idx="0"]').trigger('click')
    expect((w.get('[data-idx="0"]').element as SVGElement).style.fill).toBe('#E53935')
    expect(undoBtn.attributes('disabled')).toBeUndefined()

    await undoBtn.trigger('click')

    expect((w.get('[data-idx="0"]').element as SVGElement).style.fill).toBe('')
    expect(w.get('[aria-live="polite"]').text()).toBe('Undone.')
    expect(undoBtn.attributes('disabled')).toBeDefined()

    w.unmount()
  })
})
import { describe, it, expect } from 'vitest'
import { coloringLevels } from '../../app/data/coloringLevels'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
// import { C } from 'vue-router/dist/index-BN0B0y8a.js'

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
      expect(counts[i - 1]).toBeGreaterThanOrEqual(i - 1)
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

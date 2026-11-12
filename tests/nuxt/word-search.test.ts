// @vitest-environment nuxt
//
// Proves the word search recognises a word when its letters are tapped in order,
// and gently resets when the taps can't spell any remaining word.

import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import WordSearch from '../../app/components/activities/puzzles/WordSearch.vue'

type Wrapper = Awaited<ReturnType<typeof mountSuspended>>

function tile(wrapper: Wrapper, row: number, col: number) {
  return wrapper.get(`button[aria-label^="Row ${row}, column ${col},"]`)
}

// The board is reshuffled on every mount, so read the letters back from the tiles
// and find where a word landed (Level 1 words always read left to right).
function findAcross(wrapper: Wrapper, word: string) {
  const rows = new Map<number, string[]>()
  for (const button of wrapper.findAll('button[aria-label^="Row "]')) {
    const match = /^Row (\d+), column (\d+), letter (\w)/.exec(button.attributes('aria-label')!)
    if (!match) continue
    const [, row, col, letter] = match
    const cells = rows.get(Number(row)) ?? []
    cells[Number(col) - 1] = letter!
    rows.set(Number(row), cells)
  }
  for (const [row, cells] of rows) {
    const col = cells.join('').indexOf(word)
    if (col >= 0) return { row, col: col + 1 }
  }
  throw new Error(`${word} is not on the board`)
}

// The first mount compiles the component on demand, which can take far longer
// than the default timeouts on a cold machine.
vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

describe('WordSearch', () => {
  it('finds BLUE when its letters are tapped in order', async () => {
    const wrapper = await mountSuspended(WordSearch)
    const { row, col } = findAcross(wrapper, 'BLUE')

    for (let i = 0; i < 'BLUE'.length; i++) {
      await tile(wrapper, row, col + i).trigger('click')
    }

    expect(wrapper.get('[aria-live="polite"]').text()).toBe('You found BLUE!')
    expect(tile(wrapper, row, col).attributes('aria-label')).toContain('part of a found word')
  })

  it('resets the selection when the taps cannot spell a word', async () => {
    const wrapper = await mountSuspended(WordSearch)

    await tile(wrapper, 1, 1).trigger('click')
    await tile(wrapper, 4, 4).trigger('click')

    expect(wrapper.get('[aria-live="polite"]').text()).toBe("Nice try! Let's look again.")
    expect(tile(wrapper, 1, 1).attributes('aria-pressed')).toBe('false')
  })
})

// @vitest-environment nuxt
//
// Proves the word search recognises a word when its letters are tapped in order,
// and gently resets when the taps can't spell any remaining word.

import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import WordSearch from '../../app/components/activities/puzzles/WordSearch.vue'

function tile(wrapper: Awaited<ReturnType<typeof mountSuspended>>, row: number, col: number) {
  return wrapper.get(`button[aria-label^="Row ${row}, column ${col},"]`)
}

// The first mount compiles the component on demand, which can take far longer
// than the default timeouts on a cold machine.
vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

describe('WordSearch', () => {
  it('finds CAT when C, A, T are tapped in order', async () => {
    const wrapper = await mountSuspended(WordSearch)

    await tile(wrapper, 1, 1).trigger('click')
    await tile(wrapper, 1, 2).trigger('click')
    await tile(wrapper, 1, 3).trigger('click')

    expect(wrapper.get('[aria-live="polite"]').text()).toBe('You found CAT!')
    expect(tile(wrapper, 1, 1).attributes('aria-label')).toContain('part of a found word')
  })

  it('resets the selection when the taps cannot spell a word', async () => {
    const wrapper = await mountSuspended(WordSearch)

    await tile(wrapper, 1, 1).trigger('click')
    await tile(wrapper, 4, 4).trigger('click')

    expect(wrapper.get('[aria-live="polite"]').text()).toBe("Nice try! Let's look again.")
    expect(tile(wrapper, 1, 1).attributes('aria-pressed')).toBe('false')
  })
})

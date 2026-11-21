// MatchingGame.ui.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import MatchingGame from '../../app/components/activities/puzzles/MatchingGame.vue' 

const LEVEL_CARD_COUNTS = [6, 8, 10, 12, 16, 18, 20]
const LEVEL_PAIR_COUNTS = [3, 4, 5, 6, 8, 9, 10]

type TestCard = { emoji: string; isFlipped: boolean; isMatched: boolean }

// ---------- helpers ----------
const answerKey = (w: VueWrapper) => (w.vm as any).cards as TestCard[]
const cardButtons = (w: VueWrapper) => w.findAll('button[aria-label]')
const labels = (w: VueWrapper) => cardButtons(w).map((b) => b.attributes('aria-label'))
const btn = (w: VueWrapper, text: string) =>
  w.findAll('button').find((b) => b.text().trim() === text)
const click = async (w: VueWrapper, text: string) => {
  const b = btn(w, text)
  if (!b) throw new Error(`Button "${text}" not found`)
  await b.trigger('click')
}
const clickCard = (w: VueWrapper, i: number) => cardButtons(w)[i]!.trigger('click')

function findPair(w: VueWrapper, shouldMatch: boolean): [number, number] {
  const cards = answerKey(w)
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      if (cards[i]!.isMatched || cards[j]!.isMatched) continue
      if ((cards[i]!.emoji === cards[j]!.emoji) === shouldMatch) return [i, j]
    }
  }
  throw new Error('No pair found')
}

async function matchOnePair(w: VueWrapper) {
  const [a, b] = findPair(w, true)
  await clickCard(w, a)
  await clickCard(w, b)
  return [a, b] as const
}

async function completeLevel(w: VueWrapper) {
  const groups = new Map<string, number[]>()
  answerKey(w).forEach((c, i) => groups.set(c.emoji, [...(groups.get(c.emoji) ?? []), i]))
  for (const [a, b] of groups.values()) {
    await clickCard(w, a!)
    await clickCard(w, b!)
  }
}

const allFaceDown = (w: VueWrapper) => labels(w).every((l) => l!.endsWith('face down'))

describe('MatchingGame UI', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mount(MatchingGame)
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })

  // ---------- CARD CLICKS ----------
  describe('clicking cards', () => {
    it('clicking a face-down card turns it face up', async () => {
      expect(labels(wrapper)[0]).toBe('Card 1, face down')
      await clickCard(wrapper, 0)
      expect(labels(wrapper)[0]).not.toContain('face down')
      expect(cardButtons(wrapper)[0]!.find('span').exists()).toBe(true) // emoji rendered
    })

    it('clicking the same face-up card again does nothing', async () => {
      await clickCard(wrapper, 0)
      const before = labels(wrapper)
      await clickCard(wrapper, 0)
      expect(labels(wrapper)).toEqual(before)
    })

    it('a matching pair becomes "matched" and shows the success message', async () => {
      const [a, b] = await matchOnePair(wrapper)
      expect(labels(wrapper)[a]).toMatch(/, matched$/)
      expect(labels(wrapper)[b]).toMatch(/, matched$/)
      expect(wrapper.text()).toContain('Nice job, that is a match!')
    })

    it('a mismatched pair stays face up with a hint message', async () => {
      const [a, b] = findPair(wrapper, false)
      await clickCard(wrapper, a)
      await clickCard(wrapper, b)
      expect(wrapper.text()).toContain('Not a match')
      expect(labels(wrapper)[a]).not.toContain('face down')
      expect(labels(wrapper)[b]).not.toContain('face down')
    })

    it('tapping a third card flips the mismatched pair back down', async () => {
      const [a, b] = findPair(wrapper, false)
      const c = answerKey(wrapper).findIndex((_, i) => i !== a && i !== b)
      await clickCard(wrapper, a)
      await clickCard(wrapper, b)
      await clickCard(wrapper, c)

      expect(labels(wrapper)[a]).toContain('face down')
      expect(labels(wrapper)[b]).toContain('face down')
      expect(labels(wrapper)[c]).not.toContain('face down')
      expect(wrapper.text()).not.toContain('Not a match') // message cleared
    })

    it('clicking a matched card does not change anything', async () => {
      const [a] = await matchOnePair(wrapper)
      const before = labels(wrapper)
      await clickCard(wrapper, a)
      expect(labels(wrapper)).toEqual(before)
    })

    it('does not show the win message until the final pair is matched', async () => {
      await matchOnePair(wrapper)
      expect(wrapper.text()).not.toContain('Wonderful work')
      expect(btn(wrapper, 'Next level')).toBeUndefined()
    })
  })

  // ---------- PAUSE / RESUME ----------
  describe('Pause button', () => {
    it('hides the board, shows "Game paused.", and the button becomes Resume', async () => {
      await click(wrapper, 'Pause')
      expect(wrapper.text()).toContain('Game paused.')
      expect(cardButtons(wrapper)).toHaveLength(0)
      expect(btn(wrapper, 'Pause')).toBeUndefined()
      expect(btn(wrapper, 'Resume')!.attributes('aria-pressed')).toBe('true')
    })

    it('Resume brings the board back with progress preserved', async () => {
      const [a, b] = await matchOnePair(wrapper)
      await click(wrapper, 'Pause')
      await click(wrapper, 'Resume')

      expect(wrapper.text()).not.toContain('Game paused.')
      expect(cardButtons(wrapper)).toHaveLength(6)
      expect(labels(wrapper)[a]).toMatch(/matched$/)
      expect(labels(wrapper)[b]).toMatch(/matched$/)
      expect(btn(wrapper, 'Pause')!.attributes('aria-pressed')).toBe('false')
    })

    it('hides Next level while paused on a completed board', async () => {
      await completeLevel(wrapper)
      expect(btn(wrapper, 'Next level')).toBeDefined()
      await click(wrapper, 'Pause')
      expect(btn(wrapper, 'Next level')).toBeUndefined()
      await click(wrapper, 'Resume')
      expect(btn(wrapper, 'Next level')).toBeDefined()
    })
  })

  // ---------- NEW GAME ----------
  describe('New game button', () => {
    it('resets every card to face down and clears the message', async () => {
      await matchOnePair(wrapper)
      await click(wrapper, 'New game')
      expect(allFaceDown(wrapper)).toBe(true)
      expect(wrapper.text()).not.toContain('Nice job')
    })

    it('stays on the same level', async () => {
      await click(wrapper, 'Level 4')
      await click(wrapper, 'New game')
      expect(wrapper.text()).toContain('Level 4 of 7')
      expect(cardButtons(wrapper)).toHaveLength(12)
    })

    it('reshuffles the cards', async () => {
      await click(wrapper, 'Level 7') // 20 cards so an identical shuffle is practically impossible
      const before = answerKey(wrapper).map((c) => c.emoji).join()
      await click(wrapper, 'New game')
      const after = answerKey(wrapper).map((c) => c.emoji).join()
      expect(after).not.toBe(before)
    })

    it('unpauses the game', async () => {
      await click(wrapper, 'Pause')
      await click(wrapper, 'New game')
      expect(wrapper.text()).not.toContain('Game paused.')
      expect(cardButtons(wrapper)).toHaveLength(6)
    })

    it('works after completing a level (hides Next level)', async () => {
      await completeLevel(wrapper)
      await click(wrapper, 'New game')
      expect(btn(wrapper, 'Next level')).toBeUndefined()
      expect(allFaceDown(wrapper)).toBe(true)
    })
  })

  // ---------- LEVEL PICKER ----------
  describe('Level picker buttons', () => {
    it('renders 7 level buttons', () => {
      for (let n = 1; n <= 7; n++) expect(btn(wrapper, `Level ${n}`)).toBeDefined()
    })

    it('Level 1 is highlighted on load', () => {
      expect(btn(wrapper, 'Level 1')!.attributes('aria-pressed')).toBe('true')
      expect(btn(wrapper, 'Level 2')!.attributes('aria-pressed')).toBe('false')
    })

    it.each(LEVEL_CARD_COUNTS.map((count, i) => [i + 1, count, LEVEL_PAIR_COUNTS[i]]))(
      'clicking Level %i gives %i face-down cards with %i unique flowers',
      async (level, cardCount, pairCount) => {
        await click(wrapper, `Level ${level}`)

        expect(wrapper.text()).toContain(`Level ${level} of 7`)
        expect(wrapper.text()).toContain(`Level ${level}. Good luck!`)
        expect(cardButtons(wrapper)).toHaveLength(cardCount as number)
        expect(allFaceDown(wrapper)).toBe(true)
        expect(new Set(answerKey(wrapper).map((c) => c.emoji)).size).toBe(pairCount)
        expect(btn(wrapper, `Level ${level}`)!.attributes('aria-pressed')).toBe('true')
      },
    )

    it('only one level button is highlighted at a time', async () => {
      await click(wrapper, 'Level 5')
      const pressed = wrapper
        .findAll('fieldset button')
        .filter((b) => b.attributes('aria-pressed') === 'true')
      expect(pressed).toHaveLength(1)
      expect(pressed[0]!.text()).toBe('Level 5')
    })

    it('can jump backwards and forwards between levels', async () => {
      await click(wrapper, 'Level 6')
      expect(cardButtons(wrapper)).toHaveLength(18)
      await click(wrapper, 'Level 2')
      expect(cardButtons(wrapper)).toHaveLength(8)
      await click(wrapper, 'Level 7')
      expect(cardButtons(wrapper)).toHaveLength(20)
    })

    it('clicking the current level again reshuffles to a fresh board', async () => {
      await click(wrapper, 'Level 7')
      const before = answerKey(wrapper).map((c) => c.emoji).join()
      await click(wrapper, 'Level 7')
      expect(answerKey(wrapper).map((c) => c.emoji).join()).not.toBe(before)
      expect(allFaceDown(wrapper)).toBe(true)
    })

    it('uses the right grid columns for each level', async () => {
      const expected = [3, 4, 5, 4, 4, 6, 5]
      for (let i = 0; i < 7; i++) {
        await click(wrapper, `Level ${i + 1}`)
        const grid = wrapper.find('div.grid')
        expect(grid.attributes('style')).toContain(`repeat(${expected[i]}`)
      }
    })

    it('unpauses when a level is chosen', async () => {
      await click(wrapper, 'Pause')
      await click(wrapper, 'Level 3')
      expect(wrapper.text()).not.toContain('Game paused.')
      expect(cardButtons(wrapper)).toHaveLength(10)
    })
  })

  // ---------- CONFIRM DIALOG WHEN SWITCHING LEVELS ----------
  describe('switching levels with progress', () => {
    it('asks for confirmation and keeps the board if cancelled', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
      const [a] = await matchOnePair(wrapper)

      await click(wrapper, 'Level 3')

      expect(confirmSpy).toHaveBeenCalledOnce()
      expect(wrapper.text()).toContain('Level 1 of 7')
      expect(labels(wrapper)[a]).toMatch(/matched$/)
      expect(btn(wrapper, 'Level 1')!.attributes('aria-pressed')).toBe('true')
    })

    it('switches and resets the board if confirmed', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      await matchOnePair(wrapper)

      await click(wrapper, 'Level 3')

      expect(wrapper.text()).toContain('Level 3 of 7')
      expect(cardButtons(wrapper)).toHaveLength(10)
      expect(allFaceDown(wrapper)).toBe(true)
    })

    it('does not ask when nothing is matched yet', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm')
      await clickCard(wrapper, 0) // flipped but not matched
      await click(wrapper, 'Level 2')
      expect(confirmSpy).not.toHaveBeenCalled()
      expect(wrapper.text()).toContain('Level 2 of 7')
    })

    it('does not ask after the level is completed', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm')
      await completeLevel(wrapper)
      await click(wrapper, 'Level 4')
      expect(confirmSpy).not.toHaveBeenCalled()
      expect(wrapper.text()).toContain('Level 4 of 7')
    })
  })

  // ---------- PROGRESSION ----------
  describe('level progression', () => {
    it('finishing level 1 shows the win message and a Next level button', async () => {
      await completeLevel(wrapper)
      expect(wrapper.text()).toContain('You matched them all! Wonderful work!')
      expect(btn(wrapper, 'Next level')).toBeDefined()
      expect(btn(wrapper, 'Play again')).toBeUndefined()
      expect(labels(wrapper).every((l) => l!.endsWith('matched'))).toBe(true)
    })

    it('Next level advances one level with a fresh board', async () => {
      await completeLevel(wrapper)
      await click(wrapper, 'Next level')

      expect(wrapper.text()).toContain('Level 2 of 7')
      expect(cardButtons(wrapper)).toHaveLength(8)
      expect(allFaceDown(wrapper)).toBe(true)
      expect(btn(wrapper, 'Next level')).toBeUndefined()
      expect(btn(wrapper, 'Level 2')!.attributes('aria-pressed')).toBe('true')
    })

    it('plays through all 7 levels in order using Next level', async () => {
      for (let i = 0; i < 7; i++) {
        expect(wrapper.text()).toContain(`Level ${i + 1} of 7`)
        expect(cardButtons(wrapper)).toHaveLength(LEVEL_CARD_COUNTS[i]!)
        await completeLevel(wrapper)
        expect(wrapper.text()).toContain('Wonderful work')

        if (i < 6) {
          expect(btn(wrapper, 'Next level')).toBeDefined()
          await click(wrapper, 'Next level')
        }
      }
    })

    it('the last level shows Play again instead of Next level', async () => {
      await click(wrapper, 'Level 7')
      await completeLevel(wrapper)
      expect(btn(wrapper, 'Next level')).toBeUndefined()
      expect(btn(wrapper, 'Play again')).toBeDefined()
    })

    it('Play again returns to level 1 with a fresh board', async () => {
      await click(wrapper, 'Level 7')
      await completeLevel(wrapper)
      await click(wrapper, 'Play again')

      expect(wrapper.text()).toContain('Level 1 of 7')
      expect(cardButtons(wrapper)).toHaveLength(6)
      expect(allFaceDown(wrapper)).toBe(true)
      expect(btn(wrapper, 'Play again')).toBeUndefined()
      expect(btn(wrapper, 'Level 1')!.attributes('aria-pressed')).toBe('true')
    })

    it('a mismatch mid-level does not block finishing the level', async () => {
      const [a, b] = findPair(wrapper, false)
      await clickCard(wrapper, a)
      await clickCard(wrapper, b)
      await completeLevel(wrapper) // first click flips the mismatch back down
      expect(wrapper.text()).toContain('Wonderful work')
    })
  })
})
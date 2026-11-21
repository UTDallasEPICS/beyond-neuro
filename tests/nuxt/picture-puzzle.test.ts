// PicturePuzzle.small.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import PicturePuzzle from '../../app/components/activities/puzzles/PicturePuzzle.vue' 

const pieces = (w: VueWrapper) => w.findAll('button[aria-label^="Row "]')
const levels = (w: VueWrapper) => w.findAll('[aria-label="Difficulty level"] button')
const btn = (w: VueWrapper, text: string) =>
  w.findAll('button').find((b) => b.text().trim() === text)!
const solve = async (w: VueWrapper) => {
  while (btn(w, 'Place one piece for me').attributes('disabled') === undefined) {
    await btn(w, 'Place one piece for me').trigger('click')
  }
}

describe('PicturePuzzle', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = mount(PicturePuzzle)
    await nextTick()
  })

  it('shows check marks only on placed pieces', async () => {
    expect(pieces(wrapper).filter((p) => p.find('svg').exists())).toHaveLength(0)
    await btn(wrapper, 'Place one piece for me').trigger('click')
    expect(pieces(wrapper).filter((p) => p.find('svg').exists()).length).toBeGreaterThan(0)
  })

  it('every piece uses the level picture', () => {
    pieces(wrapper).forEach((p) => expect(p.attributes('style')).toContain('cat-1.jpg'))
  })

  it.each([[1, 9], [2, 16], [3, 25], [4, 36], [5, 49], [6, 64], [7, 81]])(
    'level %i has %i pieces',
    async (level, count) => {
      await levels(wrapper)[level - 1]!.trigger('click')
      expect(pieces(wrapper)).toHaveLength(count)
      expect(levels(wrapper)[level - 1]!.attributes('aria-pressed')).toBe('true')
    },
  )

  it('finishing level 1 lets you go to level 2', async () => {
    await solve(wrapper)
    expect(wrapper.text()).toContain('You finished the puzzle!')
    await btn(wrapper, 'Try level 2').trigger('click')
    expect(pieces(wrapper)).toHaveLength(16)
  })
})
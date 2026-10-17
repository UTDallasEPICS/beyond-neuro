import { describe, it, expect, vi, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import LifeStoryPromptFlow from '../../app/components/activities/reminiscence/LifeStoryPromptFlow.vue'
import PhotoMemoryFlow from '../../app/components/activities/reminiscence/PhotoMemoryFlow.vue'
import { REMINISCENCE_LEVELS, nextLevel } from '../../app/data/reminiscence/levels'
import { lifeStoryPrompts } from '../../app/data/reminiscence/life-story-prompts'
import { photoMemoryPrompts } from '../../app/data/reminiscence/photo-memory-prompts'

vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

function button(wrapper: VueWrapper, text: string) {
  const found = wrapper.findAll('button').find((b) => b.text().startsWith(text))
  if (!found) throw new Error(`No button starting with "${text}"`)
  return found
}

describe('reminiscence levels', () => {
  afterEach(() => {
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('has photos and life story questions for every level', () => {
    for (const level of REMINISCENCE_LEVELS) {
      expect(photoMemoryPrompts.some((p) => p.level === level)).toBe(true)
      expect(lifeStoryPrompts.some((p) => p.level === level)).toBe(true)
    }
    expect(lifeStoryPrompts.filter((p) => p.level === 1).every((p) => p.kind === 'yes-no')).toBe(
      true
    )
    expect(lifeStoryPrompts.filter((p) => p.level === 7).every((p) => p.kind === 'open')).toBe(true)
    expect(REMINISCENCE_LEVELS).toHaveLength(7)
    expect(nextLevel(1)).toBe(2)
    expect(nextLevel(7)).toBeNull()
  })

  it('moves on after a yes or no, and offers choices on Levels 2 and 3', async () => {
    const wrapper = await mountSuspended(LifeStoryPromptFlow)
    expect(wrapper.text()).toContain('Question 1 of 5')
    expect(wrapper.text()).not.toMatch(/seconds/i)

    await button(wrapper, 'Yes').trigger('click')
    expect(wrapper.text()).toContain('Question 2 of 5')

    await button(wrapper, 'Level 2').trigger('click')
    expect(wrapper.text()).toContain('Do you prefer coffee or tea?')
    await button(wrapper, 'Tea').trigger('click')
    expect(wrapper.text()).toContain('Question 2 of 4')

    await button(wrapper, 'Level 3').trigger('click')
    await button(wrapper, 'Yes').trigger('click')
    expect(wrapper.text()).toContain('What kind of pet?')
    await button(wrapper, 'A dog').trigger('click')
    expect(wrapper.text()).toContain('Question 2 of 4')
    expect(wrapper.text()).toContain('A dog')

    wrapper.unmount()
  })

  it('moves from everyday photos to North Texas photos, with no timer', async () => {
    const wrapper = await mountSuspended(PhotoMemoryFlow)
    expect(wrapper.text()).toContain('Level 1 · Photo 1 of 3 · Everyday things')
    expect(wrapper.text()).toContain('A cup of coffee')

    await button(wrapper, 'Level 7').trigger('click')
    expect(wrapper.text()).toContain('Level 7 · Photo 1 of 3 · Close to home')
    expect(wrapper.text()).toContain('The State Fair of Texas')
    expect(wrapper.text()).not.toMatch(/seconds|time is up/i)

    wrapper.unmount()
  })
})

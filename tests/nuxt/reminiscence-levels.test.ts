import { nextTick } from 'vue'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import LifeStoryPromptFlow from '../../app/components/activities/reminiscence/LifeStoryPromptFlow.vue'
import PhotoMemoryFlow from '../../app/components/activities/reminiscence/PhotoMemoryFlow.vue'
import JournalFlow from '../../app/components/activities/reminiscence/JournalFlow.vue'
import { journalPrompts } from '../../app/data/reminiscence/journal-prompts'
import { REMINISCENCE_LEVELS, nextLevel } from '../../app/data/reminiscence/levels'
import { lifeStoryPrompts } from '../../app/data/reminiscence/life-story-prompts'
import {
  ROUNDS_PER_LEVEL,
  buildLevel,
  photoLevels,
  photoObjects,
} from '../../app/data/reminiscence/photo-memory-prompts'

vi.setConfig({ testTimeout: 120_000, hookTimeout: 120_000 })

function button(wrapper: VueWrapper, text: string) {
  const found = wrapper.findAll('button').find((b) => b.text().startsWith(text))
  if (!found) throw new Error(`No button starting with "${text}"`)
  return found
}

function photoTiles(wrapper: VueWrapper) {
  return wrapper.findAll('button[aria-pressed]').filter((b) => b.find('img').exists())
}

describe('reminiscence levels', () => {
  afterEach(() => {
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('has life story questions and journal pages for every level', () => {
    for (const level of REMINISCENCE_LEVELS) {
      expect(lifeStoryPrompts.some((p) => p.level === level)).toBe(true)
      expect(journalPrompts.some((p) => p.level === level)).toBe(true)
    }
    expect(
      journalPrompts.filter((p) => p.level === 1).every((p) => p.fields[0]?.suggestions?.length)
    ).toBe(true)
    expect(
      journalPrompts.filter((p) => p.level === 7).every((p) => p.fields.some((f) => f.long))
    ).toBe(true)
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

  it('builds rounds that get harder with each level', () => {
    for (const level of REMINISCENCE_LEVELS) {
      const rule = photoLevels[level]
      const rounds = buildLevel(level)
      expect(rounds).toHaveLength(ROUNDS_PER_LEVEL)
      expect(new Set(rounds.map((r) => r.target.id)).size).toBe(ROUNDS_PER_LEVEL)
      for (const { target, tiles } of rounds) {
        expect(tiles).toHaveLength(rule.tiles)
        expect(new Set(tiles.map((t) => t.key)).size).toBe(rule.tiles)
        expect(tiles.filter((t) => t.isTarget)).toHaveLength(rule.targets)
        expect(tiles.filter((t) => t.objectId === target.lookAlike)).toHaveLength(rule.lookAlikes)
      }
    }
    for (const object of photoObjects) {
      expect(object.photos).toHaveLength(3)
      expect(object.photos.every((alt) => alt.toLowerCase().includes(object.name))).toBe(true)
    }
  })

  it('asks a memory question once you find the right pictures', async () => {
    const wrapper = await mountSuspended(PhotoMemoryFlow)
    await nextTick()
    expect(wrapper.text()).toContain('Level 1 · Round 1 of 3 · A first look')
    expect(photoTiles(wrapper)).toHaveLength(4)

    const name = wrapper.get('h2').text().replace('Tap the picture of a ', '')
    const object = photoObjects.find((o) => o.name === name)!
    const tiles = photoTiles(wrapper)
    const wrong = tiles.find((t) => !object.photos.includes(t.get('img').attributes('alt')!))!
    const right = tiles.find((t) => object.photos.includes(t.get('img').attributes('alt')!))!

    await wrong.trigger('click')
    await button(wrapper, 'Check my answer').trigger('click')
    expect(wrapper.text()).toContain('Not quite.')

    await wrong.trigger('click')
    await right.trigger('click')
    await button(wrapper, 'Check my answer').trigger('click')
    expect(wrapper.text()).toContain(`You found the ${object.name}`)
    expect(object.memoryPrompts).toContain(wrapper.get('h2').text())
    expect(wrapper.text()).not.toMatch(/seconds|time is up/i)

    await button(wrapper, 'Level 7').trigger('click')
    expect(photoTiles(wrapper)).toHaveLength(9)

    wrapper.unmount()
  })

  it('saves journal pages from tapped or typed answers', async () => {
    const wrapper = await mountSuspended(JournalFlow)
    expect(wrapper.text()).toContain('Level 1 · Page 1 of 3 · My favorites')
    expect(wrapper.text()).toContain('What is your favorite time of year?')

    await button(wrapper, 'Summer').trigger('click')
    expect(button(wrapper, 'Summer').attributes('aria-pressed')).toBe('true')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.text()).toContain('Saved to your journal.')
    expect(wrapper.text()).toContain('Page 2 of 3')
    expect(wrapper.text()).toContain('My journal (1 page)')
    expect(wrapper.text()).toContain('Summer')

    await button(wrapper, 'Skip this one').trigger('click')
    expect(wrapper.text()).toContain('Page 3 of 3')

    await button(wrapper, 'Level 2').trigger('click')
    await wrapper.get('#journal-name').setValue('Aunt Rose')
    await button(wrapper, 'Family').trigger('click')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.text()).toContain('My journal (2 pages)')
    expect(wrapper.text()).toContain('Aunt Rose')
    expect(JSON.parse(localStorage.getItem('bn-reminiscence-journal')!)).toHaveProperty(
      'person-close'
    )

    await button(wrapper, 'Level 7').trigger('click')
    expect(wrapper.find('textarea').exists()).toBe(true)

    wrapper.unmount()
  })
})

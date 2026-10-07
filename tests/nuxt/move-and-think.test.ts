import { describe, it, expect, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MoveAndThinkFlow from '../../app/components/activities/dual-task/MoveAndThinkFlow.vue'
import { answerChoices, nextCount } from '../../app/data/dual-task/move-and-think'

describe('walking and counting round', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('counts backward by the chosen step and offers the real next number', () => {
    expect(nextCount(100, 3)).toBe(97)
    expect(nextCount(100, 7)).toBe(93)
    expect(nextCount(3, 3)).toBe(100)
    expect(answerChoices(100, 3, true).map((choice) => choice.value)).toEqual([97, 94])
    expect(answerChoices(100, 3, false).some((choice) => choice.correct)).toBe(true)
  })

  it('scores a correct count after the walk starts', async () => {
    const wrapper = await mountSuspended(MoveAndThinkFlow)
    expect(wrapper.text()).not.toContain('coming soon')
    expect(wrapper.text()).not.toMatch(/\bLeft\b/)
    expect(wrapper.text()).not.toMatch(/\bRight\b/)
    expect(wrapper.text()).toContain('Start 60s walk')

    const answers = wrapper.findAll('button').filter((button) => button.text() === '97')
    expect(answers[0]?.attributes('disabled')).toBeDefined()

    await wrapper.get('button[aria-pressed="false"]').trigger('click')
    expect(wrapper.text()).toContain('Count back by 7')

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Start 60s walk')!
      .trigger('click')
    expect(wrapper.text()).toContain('Restart')

    await wrapper
      .findAll('button')
      .find((button) => button.text() === '93')!
      .trigger('click')
    expect(wrapper.text()).toContain('Yes. 93.')
    expect(wrapper.get('strong:last-of-type').text()).toBe('1')

    wrapper.unmount()
  })
})

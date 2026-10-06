import { describe, it, expect, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ReachAndReflectFlow from '../../app/components/activities/dual-task/ReachAndReflectFlow.vue'
import { nextSecond, nextSide, pickCategory } from '../../app/data/dual-task/reach-and-reflect'

describe('reach and reflect round', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('switches sides and ends the round on the last second', () => {
    expect(nextSide('left')).toBe('right')
    expect(nextSide('right')).toBe('left')
    expect(nextSecond(60)).toEqual({ secondsLeft: 59, finished: false })
    expect(nextSecond(1)).toEqual({ secondsLeft: 0, finished: true })
    expect(pickCategory(0)).toBe('animals')
    expect(pickCategory(0.99)).toBe('books')
  })

  it('lets you name items only after the round starts', async () => {
    const wrapper = await mountSuspended(ReachAndReflectFlow)
    const input = wrapper.get('input')
    expect(input.attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('animals')
    expect(wrapper.text()).toContain('Start 60s round')

    await wrapper.get('button[type="button"]').trigger('click')
    expect(input.attributes('disabled')).toBeUndefined()
    expect(wrapper.text()).toContain('Restart')

    await input.setValue('  carrot  ')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.text()).toContain('carrot')
    expect(wrapper.text()).toContain('Named:')
    expect(wrapper.get('strong:last-of-type').text()).toBe('1')

    wrapper.unmount()
  })
})

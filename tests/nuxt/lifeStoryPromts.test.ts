import { describe, it, expect, vi, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import LifeStoryFlow from '../../app/components/activities/reminiscence/LifeStoryPromptFlow.vue'

vi.mock('../../app/data/reminiscence/life-story-prompts', () => ({
  lifeStoryLevels: {
    1: { label: 'Early life' },
    2: { label: 'Later life' },
  },
  lifeStoryPrompts: [
    { id: 'q1', level: 1, kind: 'yes-no', question: 'Did you grow up in a house?' },
    {
      id: 'q2',
      level: 1,
      kind: 'story',
      question: 'Did you have a favorite meal?',
      followUpYes: 'What was it?',
      followUpNo: 'What would you have liked?',
    },
    {
      id: 'q3',
      level: 1,
      kind: 'choice',
      question: 'Did you have a pet?',
      choiceQuestion: 'What kind of pet?',
      choices: ['Dog', 'Cat'],
    },
    {
      id: 'q4',
      level: 1,
      kind: 'pick',
      question: 'Which season do you like best?',
      choices: ['Spring', 'Summer'],
    },
    { id: 'q5', level: 1, kind: 'open', question: 'Tell me about your first job.' },
    { id: 'q6', level: 2, kind: 'yes-no', question: 'Did you travel as an adult?' },
  ],
}))

vi.mock('../../app/data/reminiscence/levels', () => ({
  REMINISCENCE_LEVELS: [1, 2],
  nextLevel: (l: number) => (l === 1 ? 2 : undefined),
}))

type Wrapper = Awaited<ReturnType<typeof mountFlow>>

function mountFlow() {
  return mountSuspended(LifeStoryFlow, {
    global: { stubs: { ActivitiesReminiscenceLevelPicker: true } },
  })
}

const labels = (wrapper: Wrapper) => wrapper.findAll('button').map((b) => b.text())

async function click(wrapper: Wrapper, label: string) {
  const button = wrapper.findAll('button').find((b) => b.text() === label)
  if (!button) throw new Error(`No button labelled "${label}"`)
  await button.trigger('click')
}

async function skip(wrapper: Wrapper, times = 1) {
  for (let i = 0; i < times; i++) await click(wrapper, 'Skip this one')
}

const heading = (wrapper: Wrapper) => wrapper.find('h2').text()

afterEach(() => {
  vi.restoreAllMocks()
})


describe('yes-no question buttons (q1)', () => {
  it('shows exactly Yes, No and Skip this one', async () => {
    const wrapper = await mountFlow()

    expect(labels(wrapper)).toEqual(['Yes', 'No', 'Skip this one'])
  })

  it('Yes: says thank you, moves to question 2, and lists "Yes" as the answer', async () => {
    const wrapper = await mountFlow()

    await click(wrapper, 'Yes')

    expect(wrapper.text()).toContain('Thank you.')
    expect(wrapper.text()).toContain('Question 2 of 5')
    expect(wrapper.find('li').text()).toContain('Did you grow up in a house?')
    expect(wrapper.find('li').text()).toContain('Yes')
  })

  it('No: says thank you, moves to question 2, and lists "No" as the answer', async () => {
    const wrapper = await mountFlow()

    await click(wrapper, 'No')

    expect(wrapper.text()).toContain('Thank you.')
    expect(wrapper.text()).toContain('Question 2 of 5')
    expect(wrapper.find('li').text()).toContain('No')
  })

  it('Skip this one: moves to question 2 with no message and nothing listed', async () => {
    const wrapper = await mountFlow()

    await skip(wrapper)

    expect(wrapper.text()).toContain('Question 2 of 5')
    expect(wrapper.text()).not.toContain('Thank you.')
    expect(wrapper.findAll('li')).toHaveLength(0)
  })
})


describe('story question buttons (q2)', () => {
  async function onQ2() {
    const wrapper = await mountFlow()
    await skip(wrapper)
    return wrapper
  }

  it('shows Yes, No and Skip this one first', async () => {
    const wrapper = await onQ2()

    expect(heading(wrapper)).toBe('Did you have a favorite meal?')
    expect(labels(wrapper)).toEqual(['Yes', 'No', 'Skip this one'])
  })

  it('Yes: opens the "yes" follow-up with a text box', async () => {
    const wrapper = await onQ2()

    await click(wrapper, 'Yes')

    expect(heading(wrapper)).toBe('What was it?')
    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(labels(wrapper)).toEqual(['Save and continue', 'Skip this one'])
  })

  it('No: opens the "no" follow-up with a text box', async () => {
    const wrapper = await onQ2()

    await click(wrapper, 'No')

    expect(heading(wrapper)).toBe('What would you have liked?')
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('Skip this one (first screen): moves to question 3', async () => {
    const wrapper = await onQ2()

    await skip(wrapper)

    expect(wrapper.text()).toContain('Question 3 of 5')
  })

  it('Save and continue: saves the text, shows the story message, moves on', async () => {
    const wrapper = await onQ2()
    await click(wrapper, 'Yes')
    await wrapper.find('textarea').setValue('Lasagna')

    await click(wrapper, 'Save and continue')

    expect(wrapper.text()).toContain('Story saved. Thank you for sharing.')
    expect(wrapper.text()).toContain('Question 3 of 5')
    expect(wrapper.find('li').text()).toContain('What was it?')
    expect(wrapper.find('li').text()).toContain('Lasagna')
  })

  it('Save and continue with an empty box: moves on, lists nothing', async () => {
    const wrapper = await onQ2()
    await click(wrapper, 'Yes')

    await click(wrapper, 'Save and continue')

    expect(wrapper.text()).toContain('Thank you for sharing.')
    expect(wrapper.text()).toContain('Question 3 of 5')
    expect(wrapper.findAll('li')).toHaveLength(0)
  })

  it('Skip this one (on the follow-up): moves on without saving the text', async () => {
    const wrapper = await onQ2()
    await click(wrapper, 'Yes')
    await wrapper.find('textarea').setValue('Not saved')

    await skip(wrapper)

    expect(wrapper.text()).toContain('Question 3 of 5')
    expect(wrapper.text()).not.toContain('Not saved')
    expect(wrapper.findAll('li')).toHaveLength(0)
  })
})


describe('choice question buttons (q3)', () => {
  async function onQ3() {
    const wrapper = await mountFlow()
    await skip(wrapper, 2)
    return wrapper
  }

  it('No: records "No" and moves to question 4', async () => {
    const wrapper = await onQ3()

    await click(wrapper, 'No')

    expect(wrapper.text()).toContain('Question 4 of 5')
    expect(wrapper.find('li').text()).toContain('No')
  })

  it('Yes: shows Dog, Cat and Skip this one', async () => {
    const wrapper = await onQ3()

    await click(wrapper, 'Yes')

    expect(heading(wrapper)).toBe('What kind of pet?')
    expect(labels(wrapper)).toEqual(['Dog', 'Cat', 'Skip this one'])
  })

  it('Dog: saves "Dog" and moves to question 4', async () => {
    const wrapper = await onQ3()
    await click(wrapper, 'Yes')

    await click(wrapper, 'Dog')

    expect(wrapper.text()).toContain('Thank you.')
    expect(wrapper.text()).toContain('Question 4 of 5')
    expect(wrapper.find('li').text()).toContain('Did you have a pet? What kind of pet?')
    expect(wrapper.find('li').text()).toContain('Dog')
  })

  it('Cat: saves "Cat" and moves to question 4', async () => {
    const wrapper = await onQ3()
    await click(wrapper, 'Yes')

    await click(wrapper, 'Cat')

    expect(wrapper.text()).toContain('Question 4 of 5')
    expect(wrapper.find('li').text()).toContain('Cat')
  })

  it('Skip this one (on the choices): moves on and saves nothing', async () => {
    const wrapper = await onQ3()
    await click(wrapper, 'Yes')

    await skip(wrapper)

    expect(wrapper.text()).toContain('Question 4 of 5')
    expect(wrapper.findAll('li')).toHaveLength(0)
  })
})


describe('pick question buttons (q4)', () => {
  async function onQ4() {
    const wrapper = await mountFlow()
    await skip(wrapper, 3)
    return wrapper
  }

  it('shows Spring, Summer and Skip this one', async () => {
    const wrapper = await onQ4()

    expect(labels(wrapper)).toEqual(['Spring', 'Summer', 'Skip this one'])
  })

  it('Spring: saves "Spring" and moves to question 5', async () => {
    const wrapper = await onQ4()

    await click(wrapper, 'Spring')

    expect(wrapper.text()).toContain('Question 5 of 5')
    expect(wrapper.find('li').text()).toContain('Which season do you like best?')
    expect(wrapper.find('li').text()).toContain('Spring')
  })

  it('Summer: saves "Summer" and moves to question 5', async () => {
    const wrapper = await onQ4()

    await click(wrapper, 'Summer')

    expect(wrapper.text()).toContain('Question 5 of 5')
    expect(wrapper.find('li').text()).toContain('Summer')
  })

  it('Skip this one: moves to question 5 and saves nothing', async () => {
    const wrapper = await onQ4()

    await skip(wrapper)

    expect(wrapper.text()).toContain('Question 5 of 5')
    expect(wrapper.findAll('li')).toHaveLength(0)
  })
})


describe('open question buttons (q5)', () => {
  async function onQ5() {
    const wrapper = await mountFlow()
    await skip(wrapper, 4)
    return wrapper
  }

  it('shows only Save and continue and Skip this one', async () => {
    const wrapper = await onQ5()

    expect(labels(wrapper)).toEqual(['Save and continue', 'Skip this one'])
  })

  it('Save and continue: saves the text and finishes the level', async () => {
    const wrapper = await onQ5()
    await wrapper.find('textarea').setValue('Bakery')

    await click(wrapper, 'Save and continue')

    expect(heading(wrapper)).toBe('You finished Level 1')
    expect(wrapper.find('li').text()).toContain('Bakery')
  })

  it('Skip this one: finishes the level without saving the text', async () => {
    const wrapper = await onQ5()
    await wrapper.find('textarea').setValue('Not saved')

    await skip(wrapper)

    expect(heading(wrapper)).toBe('You finished Level 1')
    expect(wrapper.findAll('li')).toHaveLength(0)
  })
})

describe('done screen buttons', () => {
  it('with nothing saved: shows Go to Level 2, Do this level again and Start over (no Print)', async () => {
    const wrapper = await mountFlow()

    await skip(wrapper, 5)

    expect(labels(wrapper)).toEqual(['Go to Level 2', 'Do this level again', 'Start over'])
  })

  it('with a saved story: also shows Print my stories', async () => {
    const wrapper = await mountFlow()
    await click(wrapper, 'Yes')
    await skip(wrapper, 4)

    expect(labels(wrapper)).toEqual([
      'Go to Level 2',
      'Print my stories',
      'Do this level again',
      'Start over',
    ])
  })

  it('Go to Level 2: opens level 2, question 1', async () => {
    const wrapper = await mountFlow()
    await skip(wrapper, 5)

    await click(wrapper, 'Go to Level 2')

    expect(wrapper.text()).toContain('Level 2 · Question 1 of 1 · Later life')
    expect(heading(wrapper)).toBe('Did you travel as an adult?')
  })

  it('Go to Level 2: clears the thank-you message from before', async () => {
    const wrapper = await mountFlow()
    await click(wrapper, 'Yes')
    await skip(wrapper, 4)

    await click(wrapper, 'Go to Level 2')

    expect(wrapper.text()).not.toContain('Thank you.')
  })

  it('level 2 finished: has no Go to Level button', async () => {
    const wrapper = await mountFlow()
    await skip(wrapper, 5)
    await click(wrapper, 'Go to Level 2')

    await skip(wrapper)

    expect(heading(wrapper)).toBe('You finished Level 2')
    expect(labels(wrapper)).toEqual(['Do this level again', 'Start over'])
  })

  it('Do this level again: restarts level 1 at question 1', async () => {
    const wrapper = await mountFlow()
    await skip(wrapper, 5)

    await click(wrapper, 'Do this level again')

    expect(wrapper.text()).toContain('Level 1 · Question 1 of 5')
    expect(heading(wrapper)).toBe('Did you grow up in a house?')
  })

  it('Do this level again: keeps stories that were already saved', async () => {
    const wrapper = await mountFlow()
    await click(wrapper, 'Yes')
    await skip(wrapper, 4)

    await click(wrapper, 'Do this level again')

    expect(wrapper.findAll('li')).toHaveLength(1)
  })

  it('Print my stories: calls the browser print once', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    const wrapper = await mountFlow()
    await click(wrapper, 'Yes')
    await skip(wrapper, 4)

    await click(wrapper, 'Print my stories')

    expect(print).toHaveBeenCalledTimes(1)
  })
})


describe('start over buttons', () => {
  async function onDoneWithStory() {
    const wrapper = await mountFlow()
    await click(wrapper, 'Yes')
    await skip(wrapper, 4)
    return wrapper
  }

  it('Start over: opens the confirmation with Keep my stories and Yes, start over', async () => {
    const wrapper = await onDoneWithStory()

    await click(wrapper, 'Start over')

    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(true)
    expect(labels(wrapper)).toEqual(['Keep my stories', 'Yes, start over'])
  })

  it('Start over: erases nothing by itself', async () => {
    const wrapper = await onDoneWithStory()

    await click(wrapper, 'Start over')

    expect(wrapper.findAll('li')).toHaveLength(1)
  })

  it('Keep my stories: closes the dialog, keeps stories, shows the done buttons again', async () => {
    const wrapper = await onDoneWithStory()
    await click(wrapper, 'Start over')

    await click(wrapper, 'Keep my stories')

    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(false)
    expect(wrapper.findAll('li')).toHaveLength(1)
    expect(labels(wrapper)).toContain('Print my stories')
  })

  it('Yes, start over: clears all stories and returns to level 1, question 1', async () => {
    const wrapper = await onDoneWithStory()
    await click(wrapper, 'Start over')

    await click(wrapper, 'Yes, start over')

    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(false)
    expect(wrapper.findAll('li')).toHaveLength(0)
    expect(wrapper.text()).toContain('Level 1 · Question 1 of 5')
    expect(heading(wrapper)).toBe('Did you grow up in a house?')
  })

  it('Yes, start over (from level 2): goes back to level 1', async () => {
    const wrapper = await mountFlow()
    await skip(wrapper, 5)
    await click(wrapper, 'Go to Level 2')
    await skip(wrapper)
    await click(wrapper, 'Start over')

    await click(wrapper, 'Yes, start over')

    expect(wrapper.text()).toContain('Level 1 · Question 1 of 5')
  })
})

describe('level picker', () => {
  const picker = (wrapper: Wrapper) =>
    wrapper.findComponent({ name: 'ActivitiesReminiscenceLevelPicker' })

  it('is given every level and the current one', async () => {
    const wrapper = await mountFlow()

    expect(picker(wrapper).props('current')).toBe(1)
    expect(picker(wrapper).props('levels')).toEqual([
      { level: 1, label: 'Early life' },
      { level: 2, label: 'Later life' },
    ])
  })

  it('selecting level 2 starts level 2 at question 1', async () => {
    const wrapper = await mountFlow()

    await picker(wrapper).vm.$emit('select', 2)

    expect(wrapper.text()).toContain('Level 2 · Question 1 of 1 · Later life')
    expect(heading(wrapper)).toBe('Did you travel as an adult?')
  })

  it('selecting level 1 again restarts level 1 even mid-level', async () => {
    const wrapper = await mountFlow()
    await skip(wrapper, 2)

    await picker(wrapper).vm.$emit('select', 1)

    expect(wrapper.text()).toContain('Level 1 · Question 1 of 5')
  })

  it('selecting a level from the done screen opens that level', async () => {
    const wrapper = await mountFlow()
    await skip(wrapper, 5)

    await picker(wrapper).vm.$emit('select', 2)

    expect(heading(wrapper)).toBe('Did you travel as an adult?')
  })

  it('selecting a level closes an open start-over dialog', async () => {
    const wrapper = await mountFlow()
    await skip(wrapper, 5)
    await click(wrapper, 'Start over')

    await picker(wrapper).vm.$emit('select', 1)

    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(false)
  })

  
})
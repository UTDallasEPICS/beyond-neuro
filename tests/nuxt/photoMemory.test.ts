import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import PhotoMemoryFlow from '../../app/components/activities/reminiscence/PhotoMemoryFlow.vue'

// Fake data: p1 has an image and two follow-ups, p2 has no image and one
// follow-up, p3 is the only photo in level 2.
vi.mock('~/data/reminiscence/photo-memory-prompts', () => ({
  photoLevels: {
    1: { label: 'Early photos' },
    2: { label: 'Later photos' },
  },
  photoMemoryPrompts: [
    {
      id: 'p1',
      level: 1,
      title: 'Family dinner',
      image: '/photos/dinner.jpg',
      alt: 'A family eating dinner',
      followUps: ['Who is at the table?', 'What food do you see?'],
    },
    {
      id: 'p2',
      level: 1,
      title: 'Old bicycle',
      image: '',
      alt: 'A red bicycle',
      followUps: ['Did you ever ride a bike?'],
    },
    {
      id: 'p3',
      level: 2,
      title: 'Beach day',
      image: '/photos/beach.jpg',
      alt: 'A sunny beach',
      followUps: ['Where is this beach?'],
    },
  ],
}))

vi.mock('~/data/reminiscence/levels', () => ({
  REMINISCENCE_LEVELS: [1, 2],
  nextLevel: (l: number) => (l === 1 ? 2 : undefined),
}))

const STORAGE_KEY = 'bn-photo-memories'
const ASK = 'Does this photo remind you of anything?'

type Wrapper = Awaited<ReturnType<typeof mountFlow>>

function mountFlow() {
  return mountSuspended(PhotoMemoryFlow, {
    global: { stubs: { ActivitiesReminiscenceLevelPicker: true } },
  })
}

async function click(wrapper: Wrapper, label: string) {
  const button = wrapper.findAll('button').find((b) => b.text() === label)
  if (!button) throw new Error(`No button labelled "${label}"`)
  await button.trigger('click')
}

const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
const heading = (wrapper: Wrapper) => wrapper.find('h2').text()
const buttonLabels = (wrapper: Wrapper) => wrapper.findAll('button').map((b) => b.text())

// Answers "No" on every level 1 photo, which ends up on the done screen
async function reachDone(wrapper: Wrapper) {
  await click(wrapper, 'No')
  await click(wrapper, 'No')
}

beforeEach(() => {
  localStorage.clear()
})

describe('initial render', () => {
  it('starts on level 1, photo 1, with the ask question', async () => {
    const wrapper = await mountFlow()

    expect(wrapper.text()).toContain('Level 1 · Photo 1 of 2 · Early photos')
    expect(wrapper.find('figcaption').text()).toBe('Family dinner')
    expect(heading(wrapper)).toBe(ASK)
  })

  it('shows Yes and No, but no "Previous photo" on the first photo', async () => {
    const wrapper = await mountFlow()

    expect(buttonLabels(wrapper)).toEqual(['Yes', 'No'])
  })
})

describe('photo image', () => {
  it('shows the photo when it has an image', async () => {
    const wrapper = await mountFlow()
    const img = wrapper.find('img[alt="A family eating dinner"]')

    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/photos/dinner.jpg')
  })

  it('shows a placeholder with the alt text when there is no image', async () => {
    const wrapper = await mountFlow()
    await click(wrapper, 'No') // go to p2, which has no image

    expect(wrapper.find('img[alt="A red bicycle"]').exists()).toBe(false)
    expect(wrapper.find('[role="img"]').attributes('aria-label')).toBe('A red bicycle')
  })

  it('falls back to the placeholder when the image fails to load', async () => {
    const wrapper = await mountFlow()

    await wrapper.find('img[alt="A family eating dinner"]').trigger('error')

    expect(wrapper.find('img[alt="A family eating dinner"]').exists()).toBe(false)
    expect(wrapper.find('[role="img"]').attributes('aria-label')).toBe('A family eating dinner')
  })
})

describe('answering No', () => {
  it('moves to the next photo with a kind message and saves nothing', async () => {
    const wrapper = await mountFlow()

    await click(wrapper, 'No')

    expect(wrapper.text()).toContain('That is okay. Here is another photo.')
    expect(wrapper.text()).toContain('Photo 2 of 2')
    expect(wrapper.find('figcaption').text()).toBe('Old bicycle')
    expect(stored()).toEqual({})
  })
})

describe('answering Yes', () => {
  it('shows the first follow-up question and a text box', async () => {
    const wrapper = await mountFlow()

    await click(wrapper, 'Yes')

    expect(heading(wrapper)).toBe('Who is at the table?')
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('"Ask a different question" cycles through the follow-ups and wraps around', async () => {
    const wrapper = await mountFlow()
    await click(wrapper, 'Yes')

    await click(wrapper, 'Ask a different question')
    expect(heading(wrapper)).toBe('What food do you see?')

    await click(wrapper, 'Ask a different question')
    expect(heading(wrapper)).toBe('Who is at the table?')
  })

  it('hides "Ask a different question" when a photo has only one follow-up', async () => {
    const wrapper = await mountFlow()
    await click(wrapper, 'No') // go to p2
    await click(wrapper, 'Yes')

    expect(buttonLabels(wrapper)).not.toContain('Ask a different question')
  })

  it('saves the trimmed memory with the question and moves on', async () => {
    const wrapper = await mountFlow()
    await click(wrapper, 'Yes')

    await wrapper.find('textarea').setValue('  Sunday dinners at grandma\'s  ')
    await click(wrapper, 'Save and next photo')

    expect(stored().p1).toMatchObject({
      question: 'Who is at the table?',
      response: "Sunday dinners at grandma's",
    })
    expect(wrapper.text()).toContain('Memory saved. Thank you for sharing.')
    expect(wrapper.text()).toContain('Photo 2 of 2')
  })

  it('saves the question that was showing when the user switched questions', async () => {
    const wrapper = await mountFlow()
    await click(wrapper, 'Yes')
    await click(wrapper, 'Ask a different question')

    await wrapper.find('textarea').setValue('Roast chicken')
    await click(wrapper, 'Save and next photo')

    expect(stored().p1.question).toBe('What food do you see?')
  })

  it('allows saving with nothing written', async () => {
    const wrapper = await mountFlow()
    await click(wrapper, 'Yes')

    await click(wrapper, 'Save and next photo')

    expect(wrapper.text()).toContain('Thank you for sharing.')
    expect(wrapper.text()).not.toContain('Memory saved')
    expect(stored().p1.response).toBe('')
  })

  it('"Skip this photo" saves nothing and moves on', async () => {
    const wrapper = await mountFlow()
    await click(wrapper, 'Yes')

    await click(wrapper, 'Skip this photo')

    expect(stored()).toEqual({})
    expect(wrapper.text()).toContain('Photo 2 of 2')
  })

  it('pre-fills a memory the user saved earlier', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        p1: {
          question: 'Who is at the table?',
          response: 'My whole family',
          savedAt: '2026-01-01T00:00:00.000Z',
        },
      })
    )
    const wrapper = await mountFlow()
    await nextTick()

    await click(wrapper, 'Yes')

    const textarea = wrapper.find('textarea').element as HTMLTextAreaElement
    expect(textarea.value).toBe('My whole family')
  })
})

describe('previous photo', () => {
  it('appears after the first photo and goes back to the ask step', async () => {
    const wrapper = await mountFlow()
    await click(wrapper, 'No') // now on p2

    expect(buttonLabels(wrapper)).toContain('Previous photo')

    await click(wrapper, 'Previous photo')

    expect(wrapper.text()).toContain('Photo 1 of 2')
    expect(heading(wrapper)).toBe(ASK)
  })
})

describe('done screen', () => {
  it('shows an encouraging message and no print button when nothing was written', async () => {
    const wrapper = await mountFlow()

    await reachDone(wrapper)

    expect(heading(wrapper)).toBe('You finished Level 1')
    expect(wrapper.text()).toContain('You did not write anything down this time')
    expect(buttonLabels(wrapper)).not.toContain('Print my memories')
  })

  it('lists saved memories only once the level is finished', async () => {
    const wrapper = await mountFlow()
    await click(wrapper, 'Yes')
    await wrapper.find('textarea').setValue('Family dinners')
    await click(wrapper, 'Save and next photo')

    expect(wrapper.findAll('li')).toHaveLength(0) // still mid-level

    await click(wrapper, 'No') // finish level

    const items = wrapper.findAll('li')
    expect(wrapper.text()).toContain('Saved memories (1)')
    expect(items).toHaveLength(1)
    expect(items[0]!.text()).toContain('Family dinner')
    expect(items[0]!.text()).toContain('Who is at the table?')
    expect(items[0]!.text()).toContain('Family dinners')
  })

  it('lists the newest memory first', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        p1: { question: 'Older q', response: 'older', savedAt: '2026-01-01T00:00:00.000Z' },
        p2: { question: 'Newer q', response: 'newer', savedAt: '2026-02-01T00:00:00.000Z' },
      })
    )
    const wrapper = await mountFlow()
    await nextTick()
    await reachDone(wrapper)

    const items = wrapper.findAll('li')

    expect(items[0]!.text()).toContain('Newer q')
    expect(items[1]!.text()).toContain('Older q')
  })

  it('prints when "Print my memories" is clicked', async () => {
    const print = vi.fn()
    window.print = print
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        p1: { question: 'q', response: 'something', savedAt: '2026-01-01T00:00:00.000Z' },
      })
    )
    const wrapper = await mountFlow()
    await nextTick()
    await reachDone(wrapper)

    await click(wrapper, 'Print my memories')

    expect(print).toHaveBeenCalledOnce()
  })

  it('"Go to Level 2" starts the next level', async () => {
    const wrapper = await mountFlow()
    await reachDone(wrapper)

    await click(wrapper, 'Go to Level 2')

    expect(wrapper.text()).toContain('Level 2 · Photo 1 of 1 · Later photos')
    expect(wrapper.find('figcaption').text()).toBe('Beach day')
  })

  it('has no "Go to Level" button after the last level', async () => {
    const wrapper = await mountFlow()
    await reachDone(wrapper)
    await click(wrapper, 'Go to Level 2')
    await click(wrapper, 'No')

    expect(heading(wrapper)).toBe('You finished Level 2')
    expect(wrapper.text()).not.toContain('Go to Level')
  })

  it('"Look at these photos again" restarts the same level', async () => {
    const wrapper = await mountFlow()
    await reachDone(wrapper)

    await click(wrapper, 'Look at these photos again')

    expect(wrapper.text()).toContain('Level 1 · Photo 1 of 2')
    expect(heading(wrapper)).toBe(ASK)
  })

  it('"Start over" clears saved memories and returns to level 1 right away', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        p1: { question: 'q', response: 'something', savedAt: '2026-01-01T00:00:00.000Z' },
      })
    )
    const wrapper = await mountFlow()
    await nextTick()
    await reachDone(wrapper)

    await click(wrapper, 'Start over')

    expect(stored()).toEqual({})
    expect(wrapper.text()).toContain('Level 1 · Photo 1 of 2')
  })
})

describe('loading saved data', () => {
  it('starts fresh if the stored data is corrupted', async () => {
    localStorage.setItem(STORAGE_KEY, '{not valid json')

    const wrapper = await mountFlow()
    await nextTick()

    expect(heading(wrapper)).toBe(ASK)
    await reachDone(wrapper)
    expect(wrapper.findAll('li')).toHaveLength(0)
  })
})
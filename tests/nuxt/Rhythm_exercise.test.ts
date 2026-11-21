import { describe, it, expect, vi, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import RhythmExercise from '../../app/components/activities/music/RhythmExercise.vue'
import { nextTick } from 'vue'
import type { VueWrapper } from '@vue/test-utils'

type Wrapper = VueWrapper<InstanceType<typeof RhythmExercise>>

// Mount with real timers first, then switch to fake ones for the test body.
async function mountRhythm(): Promise<Wrapper> {
  const w = await mountSuspended(RhythmExercise, )
  vi.useFakeTimers()
  return w
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const btn = (w: Wrapper, text: string) => w.findAll('button').find((b) => b.text() === text)!
const slider = (w: Wrapper) => w.find('#rhythm-tempo')
const ring = (w: Wrapper) => w.find('.pulse-ring')
const moodButtons = (w: Wrapper) => w.findAll('[role="group"][aria-label="Mood"] button')

async function setTempo(w: Wrapper, bpm: number) {
  await slider(w).setValue(bpm)
}

async function advance(ms: number) {
  vi.advanceTimersByTime(ms)
  await nextTick()
}

describe('tempo slider', () => {
  it('has the right range and starts at 72 BPM', async () => {
    const w = await mountRhythm()
    const el = slider(w).element as HTMLInputElement
    expect(el.type).toBe('range')
    expect([el.min, el.max, el.step]).toEqual(['50', '140', '2'])
    expect(el.value).toBe('72')
    expect(w.text()).toContain('72 BPM')
  })

  it('a higher slider value gives a higher BPM everywhere it is shown', async () => {
    const w = await mountRhythm()
    await setTempo(w, 60)
    expect(w.text()).toContain('60 BPM')
    expect(slider(w).attributes('aria-valuetext')).toBe('60 beats per minute')

    await setTempo(w, 120)
    expect(w.text()).toContain('120 BPM')
    expect(w.text()).not.toContain('60 BPM')
    expect(slider(w).attributes('aria-valuetext')).toBe('120 beats per minute')
    // Big number inside the circle follows too
    expect(ring(w).text()).toContain('120')
  })

  it('accepts both ends of the range', async () => {
    const w = await mountRhythm()
    await setTempo(w, 50)
    expect(w.text()).toContain('50 BPM')
    await setTempo(w, 140)
    expect(w.text()).toContain('140 BPM')
  })

  it('speeds up the pulse animation as the tempo goes up', async () => {
    const w = await mountRhythm()
    await btn(w, 'Start session').trigger('click')
    expect(ring(w).attributes('style')).toContain(`animation-duration: ${60 / 72}s`)

    await setTempo(w, 120)
    expect(ring(w).attributes('style')).toContain('animation-duration: 0.5s')
  })

  it('changes the beat speed while playing', async () => {
    const w = await mountRhythm()
    await btn(w, 'Start session').trigger('click')

    await setTempo(w, 120) // one beat every 500 ms
    await advance(499)
    expect(w.text()).toContain('Beat 1 of 8')
    await advance(1)
    expect(w.text()).toContain('Beat 2 of 8')

    await setTempo(w, 60) // one beat every 1000 ms
    await advance(999)
    expect(w.text()).toContain('Beat 2 of 8')
    await advance(1)
    expect(w.text()).toContain('Beat 3 of 8')
  })

  it('does not start any beats when you move it while stopped', async () => {
    const w = await mountRhythm()
    await setTempo(w, 100)
    await advance(5000)
    expect(w.text()).toContain('Press start when you are ready')
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('Start / Restart session button', () => {
  it('starts the rhythm at beat 1 and relabels itself', async () => {
    const w = await mountRhythm()
    expect(w.text()).toContain('Press start when you are ready')
    expect(ring(w).classes()).not.toContain('pulse-active')

    await btn(w, 'Start session').trigger('click')

    expect(w.text()).toContain('Beat 1 of 8')
    expect(ring(w).classes()).toContain('pulse-active')
    expect(btn(w, 'Restart session')).toBeTruthy()
  })

  it('advances one beat per 60000 / BPM ms and wraps after 8 beats', async () => {
    const w = await mountRhythm()
    await setTempo(w, 120)
    await btn(w, 'Start session').trigger('click')

    for (let beat = 2; beat <= 8; beat++) {
      await advance(500)
      expect(w.text()).toContain(`Beat ${beat} of 8`)
    }
    await advance(500)
    expect(w.text()).toContain('Beat 1 of 8')
  })

  it('restarting goes back to beat 1 without stacking timers', async () => {
    const w = await mountRhythm()
    await btn(w, 'Start session').trigger('click')
    await advance(833 * 3)
    expect(w.text()).not.toContain('Beat 1 of 8')

    await btn(w, 'Restart session').trigger('click')
    expect(w.text()).toContain('Beat 1 of 8')
    expect(vi.getTimerCount()).toBe(1)
  })

  it('clears a previously tapped tempo', async () => {
    const w = await mountRhythm()
    await btn(w, 'Tap along').trigger('click')
    await advance(500)
    await btn(w, 'Tap along').trigger('click')
    expect(w.text()).toContain('Your tempo')

    await btn(w, 'Start session').trigger('click')
    expect(w.text()).not.toContain('Your tempo')
  })
})

describe('Pause button', () => {
  it('stops the beats, resets to the start and removes the pulse', async () => {
    const w = await mountRhythm()
    await btn(w, 'Start session').trigger('click')
    await advance(833 * 2)

    await btn(w, 'Pause').trigger('click')

    expect(w.text()).toContain('Press start when you are ready')
    expect(ring(w).classes()).not.toContain('pulse-active')
    expect(btn(w, 'Start session')).toBeTruthy()
    expect(vi.getTimerCount()).toBe(0)

    await advance(5000)
    expect(w.text()).toContain('Press start when you are ready')
  })

  it('is safe to press when nothing is playing', async () => {
    const w = await mountRhythm()
    await btn(w, 'Pause').trigger('click')
    expect(w.text()).toContain('Press start when you are ready')
  })

  it('lets you start again afterwards', async () => {
    const w = await mountRhythm()
    await btn(w, 'Start session').trigger('click')
    await btn(w, 'Pause').trigger('click')
    await btn(w, 'Start session').trigger('click')
    await advance(833)
    expect(w.text()).toContain('Beat 2 of 8')
  })
})

describe('Tap along button', () => {
  it('shows nothing after one tap', async () => {
    const w = await mountRhythm()
    await btn(w, 'Tap along').trigger('click')
    expect(w.text()).not.toContain('Your tempo')
  })

  it('works out BPM from the gap between taps', async () => {
    const w = await mountRhythm()
    for (let i = 0; i < 4; i++) {
      await btn(w, 'Tap along').trigger('click')
      await advance(500) // 500 ms apart = 120 BPM
    }
    expect(w.find('[aria-live="polite"]').text()).toBe('Your tempo: 120 BPM')
  })

  it('tapping slower gives a lower BPM', async () => {
    const w = await mountRhythm()
    for (let i = 0; i < 3; i++) {
      await btn(w, 'Tap along').trigger('click')
      await advance(1000) // 60 BPM
    }
    expect(w.find('[aria-live="polite"]').text()).toBe('Your tempo: 60 BPM')
  })

  it('starts over after a pause of more than 2 seconds', async () => {
    const w = await mountRhythm()
    await btn(w, 'Tap along').trigger('click')
    await advance(500)
    await btn(w, 'Tap along').trigger('click')
    expect(w.text()).toContain('120 BPM')

    await advance(3000) // long pause: old taps are dropped
    await btn(w, 'Tap along').trigger('click')
    await advance(1000)
    await btn(w, 'Tap along').trigger('click')
    expect(w.find('[aria-live="polite"]').text()).toBe('Your tempo: 60 BPM')
  })

  it('only uses the last 8 taps', async () => {
    const w = await mountRhythm()
    for (let i = 0; i < 3; i++) {
      await btn(w, 'Tap along').trigger('click')
      await advance(1000) // slow start
    }
    for (let i = 0; i < 9; i++) {
      await btn(w, 'Tap along').trigger('click')
      await advance(500) // then fast: slow taps fall out of the window
    }
    expect(w.find('[aria-live="polite"]').text()).toBe('Your tempo: 120 BPM')
  })

  it('does not move the slider', async () => {
    const w = await mountRhythm()
    await btn(w, 'Tap along').trigger('click')
    await advance(500)
    await btn(w, 'Tap along').trigger('click')
    expect((slider(w).element as HTMLInputElement).value).toBe('72')
  })
})

describe('mood buttons', () => {
  it('shows 4 moods with Calm selected first', async () => {
    const w = await mountRhythm()
    expect(moodButtons(w).map((b) => b.text())).toEqual(['Calm', 'Focus', 'Joy', 'Reset'])
    expect(moodButtons(w)[0]!.attributes('aria-pressed')).toBe('true')
  })

  it('selects exactly one mood at a time', async () => {
    const w = await mountRhythm()
    for (const [i, mood] of ['Calm', 'Focus', 'Joy', 'Reset'].entries()) {
      await moodButtons(w)[i]!.trigger('click')
      const pressed = moodButtons(w).filter((b) => b.attributes('aria-pressed') === 'true')
      expect(pressed.map((b) => b.text())).toEqual([mood])
    }
  })

  it('does not affect the tempo or playback', async () => {
    const w = await mountRhythm()
    await btn(w, 'Start session').trigger('click')
    await moodButtons(w)[2]!.trigger('click')
    expect(w.text()).toContain('72 BPM')
    expect(w.text()).toContain('Beat 1 of 8')
  })
})

describe('Read aloud button', () => {
  it('cancels anything already speaking, then speaks the guide', async () => {
    const speak = vi.fn()
    const cancel = vi.fn()
    vi.stubGlobal('speechSynthesis', { speak, cancel })
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        constructor(public text: string) {}
      }
    )
    const w = await mountRhythm()

    await btn(w, 'Read aloud').trigger('click')

    expect(cancel).toHaveBeenCalledTimes(1)
    expect(speak).toHaveBeenCalledTimes(1)
    expect(speak.mock.calls[0]![0].text).toContain('Follow the calming rhythm')
    expect(cancel.mock.invocationCallOrder[0]).toBeLessThan(speak.mock.invocationCallOrder[0]!)
  })

  it('does nothing (and does not crash) without speech support', async () => {
    const w = await mountRhythm()
    Reflect.deleteProperty(window, 'speechSynthesis')
    await expect(btn(w, 'Read aloud').trigger('click')).resolves.not.toThrow()
  })
})

describe('cleanup', () => {
  it('stops the timer when the component is removed', async () => {
    const w = await mountRhythm()
    await btn(w, 'Start session').trigger('click')
    expect(vi.getTimerCount()).toBe(1)
    w.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
/*
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Drums from '../../app/components/activities/music/Drums.vue'
import { nextTick } from 'vue'

const audio = vi.hoisted(() => ({ start: vi.fn(), sound: vi.fn(), click: vi.fn(), time: vi.fn() }))
vi.mock('~/utils/drumKit', async (orig) => ({
  ...(await orig<typeof import('~/utils/drumKit')>()),
  startDrumAudio: audio.start,
  playDrumSound: audio.sound,
  playGuideClick: audio.click,
  audioTime: audio.time,
}))

const Challenge = defineComponent({
  props: ['drumId', 'mode'],
  emits: ['next-level', 'free-play'],
  setup: () => () => h('div', { 'data-testid': 'challenge' }),
})

let now = 0
type W = Awaited<ReturnType<typeof mountDrums>>
async function mountDrums() {
  const w = await mountSuspended(Drums, { global: { stubs: { DrumChallenge: Challenge } } })
  vi.useFakeTimers() // after mount: mountSuspended can hang under fake timers
  return w
}
async function tick(ms = 0) {
  now += ms
  await vi.advanceTimersByTimeAsync(ms)
  await nextTick()
}
const tid = (w: W, id: string) => w.find(`[data-testid="${id}"]`)
const click = async (w: W, id: string) => (await tid(w, id).trigger('click'), tick())
const stage = (w: W) =>
  w.findAllComponents({ name: 'DrumPicture' }).find((c) => c.props('interactive'))!
const hit = async (w: W, area: string) => (stage(w).vm.$emit('hit', area), tick())
const heading = (w: W) => tid(w, 'drum-name').text()
const first = DRUM_KIT[0]!
const area0 = first.areas[0]!
// Adjust if keyForArea already returns a KeyboardEvent.code
const code = (k: string) =>
  k.length > 1 ? k : /\d/.test(k) ? `Digit${k}` : `Key${k.toUpperCase()}`
const press = async (c: string, repeat = false) => {
  window.dispatchEvent(new KeyboardEvent('keydown', { code: c, repeat, cancelable: true }))
  await tick()
}
const slowAudio = () =>
  audio.start.mockImplementation(() => new Promise((r) => setTimeout(() => r(true), 50)))

beforeEach(() => {
  now = 0
  localStorage.clear()
  audio.start.mockResolvedValue(true)
  audio.time.mockImplementation(() => now / 1000)
  vi.spyOn(performance, 'now').mockImplementation(() => now)
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.clearAllMocks()
})

describe('levels', () => {
  it.each(DRUM_KIT)('level $level: selectable, saved, every part plays by key', async (d) => {
    const w = await mountDrums()
    await click(w, `drum-${d.id}`)
    expect(heading(w)).toContain(`Level ${d.level}: ${d.name}`)
    expect(w.findAll('[data-testid^="drum-"][aria-pressed="true"]')).toHaveLength(1)
    expect(localStorage.getItem('beyond-neuro:drums:last-drum')).toBe(d.id)
    for (const a of d.areas) {
      audio.sound.mockClear()
      await press(code(keyForArea(d, a.id)))
      expect(audio.sound).toHaveBeenCalledWith(a.sound)
    }
  })

  it('has 7 levels (1,2,3,3,3,4,6 parts), restores the saved one, ignores a bad one', async () => {
    expect(DRUM_KIT.map((d) => d.areas.length)).toEqual([1, 2, 3, 3, 3, 4, 6])
    localStorage.setItem('beyond-neuro:drums:last-drum', DRUM_KIT[4]!.id)
    expect(heading(await mountDrums())).toContain('Level 5')
    vi.useRealTimers()
    localStorage.setItem('beyond-neuro:drums:last-drum', 'bogus')
    expect(heading(await mountDrums())).toContain('Level 1')
  })

  it('"next level" goes up one and stops at the last; "free play" goes back', async () => {
    const w = await mountDrums()
    await click(w, 'mode-copy')
    const emit = async (e: string) => (
      w.findComponent('[data-testid="challenge"]').vm.$emit(e),
      tick()
    )
    await emit('next-level')
    expect(heading(w)).toContain('Level 2')
    await click(w, `drum-${DRUM_KIT.at(-1)!.id}`)
    await emit('next-level')
    expect(heading(w)).toContain(`Level ${DRUM_KIT.length}`)
    await emit('free-play')
    expect(tid(w, 'mode-free').attributes('aria-pressed')).toBe('true')
  })
})

describe('buttons', () => {
  it.each(['copy', 'lights', 'sounds'])(
    '%s mode shows the challenge, hides free play, mutes keys',
    async (m) => {
      const w = await mountDrums()
      await click(w, `mode-${m}`)
      expect(w.findComponent('[data-testid="challenge"]').props('mode')).toBe(m)
      expect(tid(w, 'drum-stage').exists()).toBe(false)
      await press(code(keyForArea(first, area0.id)))
      expect(audio.sound).not.toHaveBeenCalled()
    }
  )

  it('a hit plays and lights the part; unknown parts, unmapped and held keys are ignored', async () => {
    const w = await mountDrums()
    await hit(w, area0.id)
    expect(audio.sound).toHaveBeenCalledWith(area0.sound)
    expect(stage(w).props('lit')).toContain(area0.id)
    audio.sound.mockClear()
    await hit(w, 'nope')
    await press('F13')
    await press(code(keyForArea(first, area0.id)), true)
    expect(audio.sound).not.toHaveBeenCalled()
  })

  it('guide clicks at the chosen speed, Off stops it, and switching activity turns it off', async () => {
    const w = await mountDrums()
    await click(w, 'guide-fast')
    await tick(1000)
    const [a, b] = audio.click.mock.calls.map((c) => c[0] as number)
    expect(b! - a!).toBeCloseTo(60 / 90, 3)
    await click(w, 'mode-copy')
    await click(w, 'mode-free')
    expect(tid(w, 'guide-off').attributes('aria-pressed')).toBe('true')
    audio.click.mockClear()
    await tick(2000)
    expect(audio.click).not.toHaveBeenCalled()
  })

  it('record, then play back at the recorded times, then stop by itself at 30 s', async () => {
    const w = await mountDrums()
    expect(tid(w, 'play').attributes('disabled')).toBeDefined()
    await click(w, 'record')
    await tick(500)
    await hit(w, area0.id)
    await tick(500)
    await hit(w, area0.id)
    await tick(1000)
    await click(w, 'stop')
    expect(tid(w, 'record-status').text()).toBe('Your beat: 2 taps, 2 seconds')

    audio.sound.mockClear()
    await click(w, 'play')
    await tick(499)
    expect(audio.sound).toHaveBeenCalledTimes(0)
    await tick(1)
    expect(audio.sound).toHaveBeenCalledTimes(1)
    await tick(500)
    expect(audio.sound).toHaveBeenCalledTimes(2)
    await tick(600)
    expect(tid(w, 'record').exists()).toBe(true)

    await click(w, 'record')
    await tick(30000)
    expect(tid(w, 'record').exists()).toBe(true)
  })

  it('changing level stops a recording', async () => {
    const w = await mountDrums()
    await click(w, 'record')
    await click(w, `drum-${DRUM_KIT[1]!.id}`)
    expect(tid(w, 'record').exists()).toBe(true)
  })
})

describe('races and cleanup', () => {
  it('Off right after a speed leaves no stray guide timer', async () => {
    slowAudio()
    const w = await mountDrums()
    await tid(w, 'guide-slow').trigger('click')
    await tid(w, 'guide-off').trigger('click')
    await tick(500)
    expect(vi.getTimerCount()).toBe(0)
  })

  it('a quick double click on Record leaves no stray timer', async () => {
    slowAudio()
    const w = await mountDrums()
    await tid(w, 'record').trigger('click')
    await tid(w, 'record').trigger('click')
    await tick(200)
    await click(w, 'stop')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('unmounting clears timers and the key listener', async () => {
    const w = await mountDrums()
    await click(w, 'guide-slow')
    await click(w, 'record')
    w.unmount()
    expect(vi.getTimerCount()).toBe(0)
    await press(code(keyForArea(first, area0.id)))
    expect(audio.sound).not.toHaveBeenCalled()
  })
})
*/
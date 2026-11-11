// Drums (Music Therapy & Rhythm): the seven drums, their tap areas, and the
// sounds they make. Each level adds parts to play: 1, 2, 3, 3, 3, 4, then 6.
// Every sound is generated with the Web Audio API, so no audio files are needed.

export type DrumId = 'frame' | 'djembe' | 'timpani' | 'bass' | 'snare' | 'tenors' | 'kit'

export type Voice =
  | 'frameDum'
  | 'djembeBass'
  | 'djembeSlap'
  | 'timpani'
  | 'kick'
  | 'hihat'
  | 'crash'
  | 'snare'
  | 'snareEdge'
  | 'rimClick'
  | 'tom'

export interface DrumSound {
  voice: Voice
  /** Pitch in Hz for tuned drums (timpani, toms, kick). */
  freq?: number
}

export interface DrumArea {
  id: string
  /** Full name, used in messages and read by screen readers. */
  label: string
  /** Short name written on the drum. */
  short: string
  sound: DrumSound
}

export interface DrumInfo {
  id: DrumId
  /** 1 = easiest … 7 = hardest. */
  level: number
  name: string
  /** One short sentence telling the patient how to play it. */
  howTo: string
  /** Tap areas from left to right (number keys 1, 2, 3 … play them in this order). */
  areas: DrumArea[]
}

export const DRUM_KIT: DrumInfo[] = [
  {
    id: 'frame',
    level: 1,
    name: 'Frame drum',
    howTo: 'Tap anywhere on the drum.',
    areas: [{ id: 'drum', label: 'Drum', short: 'Drum', sound: { voice: 'frameDum' } }],
  },
  {
    id: 'djembe',
    level: 2,
    name: 'Djembe',
    howTo: 'Tap the middle for a deep bass, or the edge for a sharp slap.',
    areas: [
      { id: 'slap', label: 'Slap (edge)', short: 'Slap', sound: { voice: 'djembeSlap' } },
      { id: 'bass', label: 'Bass (middle)', short: 'Bass', sound: { voice: 'djembeBass' } },
    ],
  },
  {
    id: 'timpani',
    level: 3,
    name: 'Timpani',
    howTo: 'Three kettles: the biggest is the lowest note, the smallest the highest.',
    areas: [
      { id: 'low', label: 'Low kettle', short: 'Low', sound: { voice: 'timpani', freq: 87.31 } },
      {
        id: 'middle',
        label: 'Middle kettle',
        short: 'Middle',
        sound: { voice: 'timpani', freq: 130.81 },
      },
      {
        id: 'high',
        label: 'High kettle',
        short: 'High',
        sound: { voice: 'timpani', freq: 174.61 },
      },
    ],
  },
  {
    id: 'bass',
    level: 4,
    name: 'Bass drum',
    howTo: 'Three foot pedals: the hi-hat, and the left and right bass drum pedals.',
    areas: [
      { id: 'hihat', label: 'Hi-hat pedal', short: 'Hi-hat', sound: { voice: 'hihat' } },
      { id: 'left', label: 'Left pedal', short: 'Left', sound: { voice: 'kick', freq: 80 } },
      { id: 'right', label: 'Right pedal', short: 'Right', sound: { voice: 'kick', freq: 50 } },
    ],
  },
  {
    id: 'snare',
    level: 5,
    name: 'Snare drum',
    howTo: 'Tap the middle, the edge of the skin, or the metal rim. Each sounds different.',
    areas: [
      { id: 'edge', label: 'Edge', short: 'Edge', sound: { voice: 'snareEdge' } },
      { id: 'middle', label: 'Middle', short: 'Middle', sound: { voice: 'snare' } },
      { id: 'rim', label: 'Rim', short: 'Rim', sound: { voice: 'rimClick' } },
    ],
  },
  {
    id: 'tenors',
    level: 6,
    name: 'Tenor drums',
    howTo: 'Four drums from 1 (biggest, lowest) to 4 (smallest, highest).',
    areas: [
      { id: 'd1', label: 'Drum 1 (lowest)', short: '1', sound: { voice: 'tom', freq: 147 } },
      { id: 'd2', label: 'Drum 2', short: '2', sound: { voice: 'tom', freq: 196 } },
      { id: 'd3', label: 'Drum 3', short: '3', sound: { voice: 'tom', freq: 247 } },
      { id: 'd4', label: 'Drum 4 (highest)', short: '4', sound: { voice: 'tom', freq: 330 } },
    ],
  },
  {
    id: 'kit',
    level: 7,
    name: 'Full drum kit',
    howTo: 'Six parts: hi-hat, crash cymbal, snare, tom, floor tom and kick drum.',
    areas: [
      { id: 'hihat', label: 'Hi-hat', short: 'Hi-hat', sound: { voice: 'hihat' } },
      { id: 'crash', label: 'Crash cymbal', short: 'Crash', sound: { voice: 'crash' } },
      { id: 'snare', label: 'Snare', short: 'Snare', sound: { voice: 'snare' } },
      { id: 'tom', label: 'Tom', short: 'Tom', sound: { voice: 'tom', freq: 196 } },
      { id: 'floor', label: 'Floor tom', short: 'Floor', sound: { voice: 'tom', freq: 110 } },
      { id: 'kick', label: 'Kick drum', short: 'Kick', sound: { voice: 'kick', freq: 55 } },
    ],
  },
]

export function findDrum(id: string): DrumInfo | undefined {
  return DRUM_KIT.find((d) => d.id === id)
}

/** Number key that plays an area: the first area is 1, the second 2, and so on. */
export function keyForArea(drum: DrumInfo, areaId: string): string {
  return String(drum.areas.findIndex((a) => a.id === areaId) + 1)
}

/** Area played by a key press (Digit1 / Numpad1 → first area …), if any. */
export function areaForKey(drum: DrumInfo, code: string): string | undefined {
  const match = /^(?:Digit|Numpad)([1-9])$/.exec(code)
  if (!match) return undefined
  return drum.areas[Number(match[1]) - 1]?.id
}

// ---------------------------------------------------------------------------
// Sound

type AudioCtor = typeof AudioContext

let ctx: AudioContext | null = null
let master: GainNode | null = null
let noise: AudioBuffer | null = null

function audioCtor(): AudioCtor | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor }
  return w.AudioContext ?? w.webkitAudioContext
}

/** Starts (or wakes) the audio engine. Call it from a tap or click. Returns null if unsupported. */
export async function startDrumAudio(): Promise<AudioContext | null> {
  if (!ctx) {
    const Ctor = audioCtor()
    if (!Ctor) return null
    ctx = new Ctor({ latencyHint: 'interactive' })
    master = ctx.createGain()
    master.gain.value = 0.8
    master.connect(ctx.destination)
    const len = ctx.sampleRate * 2
    noise = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = noise.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1
  }
  if (ctx.state === 'suspended') await ctx.resume()
  return ctx
}

export function audioTime(): number {
  return ctx?.currentTime ?? 0
}

function tone(
  t: number,
  o: { type: OscillatorType; from: number; to: number; glide: number; decay: number; gain: number }
) {
  if (!ctx || !master) return
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = o.type
  osc.frequency.setValueAtTime(o.from, t)
  if (o.glide > 0) osc.frequency.exponentialRampToValueAtTime(o.to, t + o.glide)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(o.gain, t + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.decay)
  osc.connect(g).connect(master)
  osc.start(t)
  osc.stop(t + o.decay + 0.05)
}

function burst(
  t: number,
  o: { type: BiquadFilterType; freq: number; q?: number; decay: number; gain: number }
) {
  if (!ctx || !master || !noise) return
  const src = ctx.createBufferSource()
  src.buffer = noise
  const filter = ctx.createBiquadFilter()
  filter.type = o.type
  filter.frequency.value = o.freq
  if (o.q) filter.Q.value = o.q
  const g = ctx.createGain()
  g.gain.setValueAtTime(o.gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.decay)
  src.connect(filter).connect(g).connect(master)
  src.start(t)
  src.stop(t + o.decay + 0.05)
}

/** Plays a drum sound now, or at a given AudioContext time. */
export function playDrumSound(sound: DrumSound, when?: number) {
  if (!ctx) return
  const t = when ?? ctx.currentTime
  switch (sound.voice) {
    case 'frameDum':
      tone(t, { type: 'sine', from: 110, to: 62, glide: 0.12, decay: 0.55, gain: 0.9 })
      burst(t, { type: 'lowpass', freq: 600, decay: 0.05, gain: 0.25 })
      break
    case 'djembeBass':
      tone(t, { type: 'sine', from: 95, to: 58, glide: 0.1, decay: 0.4, gain: 1 })
      burst(t, { type: 'lowpass', freq: 400, decay: 0.04, gain: 0.3 })
      break
    case 'djembeSlap':
      burst(t, { type: 'bandpass', freq: 2600, q: 0.8, decay: 0.14, gain: 0.9 })
      tone(t, { type: 'triangle', from: 520, to: 430, glide: 0.03, decay: 0.08, gain: 0.3 })
      break
    case 'timpani': {
      const f = sound.freq ?? 98
      // Timpani overtones sit near 1 : 1.5 : 2 of the main note.
      tone(t, { type: 'sine', from: f * 1.02, to: f, glide: 0.08, decay: 2.2, gain: 0.7 })
      tone(t, { type: 'sine', from: f * 1.5, to: f * 1.5, glide: 0, decay: 1.4, gain: 0.25 })
      tone(t, { type: 'sine', from: f * 1.99, to: f * 1.99, glide: 0, decay: 0.9, gain: 0.15 })
      burst(t, { type: 'lowpass', freq: 900, decay: 0.08, gain: 0.25 })
      break
    }
    case 'kick': {
      const f = sound.freq ?? 55
      tone(t, { type: 'sine', from: f * 3, to: f, glide: 0.09, decay: 0.45, gain: 1 })
      burst(t, { type: 'highpass', freq: 2500, decay: 0.012, gain: 0.35 })
      break
    }
    case 'hihat':
      burst(t, { type: 'highpass', freq: 7500, decay: 0.06, gain: 0.55 })
      break
    case 'crash':
      burst(t, { type: 'highpass', freq: 4200, decay: 1.4, gain: 0.5 })
      burst(t, { type: 'bandpass', freq: 6500, q: 0.6, decay: 0.9, gain: 0.3 })
      break
    case 'snare':
      burst(t, { type: 'highpass', freq: 1400, decay: 0.2, gain: 0.75 })
      tone(t, { type: 'triangle', from: 240, to: 180, glide: 0.04, decay: 0.11, gain: 0.5 })
      break
    case 'snareEdge':
      burst(t, { type: 'highpass', freq: 3000, decay: 0.12, gain: 0.55 })
      tone(t, { type: 'triangle', from: 420, to: 340, glide: 0.03, decay: 0.07, gain: 0.35 })
      break
    case 'rimClick':
      tone(t, { type: 'square', from: 1700, to: 1500, glide: 0.01, decay: 0.03, gain: 0.25 })
      burst(t, { type: 'bandpass', freq: 4500, q: 2, decay: 0.03, gain: 0.5 })
      break
    case 'tom': {
      const f = sound.freq ?? 160
      tone(t, { type: 'sine', from: f * 1.5, to: f, glide: 0.06, decay: 0.32, gain: 0.8 })
      burst(t, { type: 'bandpass', freq: f * 6, q: 1, decay: 0.03, gain: 0.25 })
      break
    }
  }
}

/** A soft click for the beat guide. */
export function playGuideClick(when?: number) {
  if (!ctx) return
  const t = when ?? ctx.currentTime
  tone(t, { type: 'sine', from: 1200, to: 1200, glide: 0, decay: 0.05, gain: 0.12 })
}

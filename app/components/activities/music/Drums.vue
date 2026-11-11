<script setup lang="ts">
  // Drums (Music Therapy & Rhythm). Seven drums are seven levels, and each level
  // adds parts to play (1, 2, 3, 3, 3, 4, 6). On every level the patient can play
  // freely, or take one of three thinking challenges. All levels are open.
  import DrumChallenge from './DrumChallenge.vue'
  import DrumPicture from './DrumPicture.vue'
  import {
    DRUM_KIT,
    areaForKey,
    audioTime,
    findDrum,
    keyForArea,
    playDrumSound,
    playGuideClick,
    startDrumAudio,
    type DrumId,
  } from '~/utils/drumKit'
  import type { ChallengeMode } from '~/utils/drumChallenge'

  type Mode = 'free' | ChallengeMode
  type GuideSpeed = 0 | 50 | 70 | 90
  type RecordState = 'idle' | 'recording' | 'playing'
  interface RecordedTap {
    /** Milliseconds from the start of the recording. */
    at: number
    drum: DrumId
    area: string
  }

  const LAST_DRUM_KEY = 'beyond-neuro:drums:last-drum'
  const MAX_RECORD_SECONDS = 30
  const MODES: Array<{ id: Mode; label: string; hint: string }> = [
    { id: 'free', label: 'Free play', hint: 'Play your own beats' },
    { id: 'copy', label: 'Copy me', hint: 'Memory: repeat a pattern' },
    { id: 'lights', label: 'Follow the lights', hint: 'Attention: tap what glows' },
    { id: 'sounds', label: 'Name that sound', hint: 'Listening: find the sound' },
  ]
  const GUIDE_OPTIONS: Array<{ bpm: GuideSpeed; label: string }> = [
    { bpm: 0, label: 'Off' },
    { bpm: 50, label: 'Slow' },
    { bpm: 70, label: 'Medium' },
    { bpm: 90, label: 'Fast' },
  ]

  const drumId = ref<DrumId>('frame')
  const drum = computed(() => findDrum(drumId.value)!)
  const mode = ref<Mode>('free')
  const lit = ref<string[]>([])
  const soundAvailable = ref(true)

  function partsLabel(n: number) {
    return `${n} ${n === 1 ? 'part' : 'parts'}`
  }

  function pickDrum(id: DrumId) {
    stopAll()
    drumId.value = id
    lit.value = []
    try {
      localStorage.setItem(LAST_DRUM_KEY, id)
    } catch {
      // Storage unavailable: the choice just isn't remembered.
    }
  }

  function pickMode(m: Mode) {
    stopAll()
    setGuide(0)
    mode.value = m
  }

  function nextLevel() {
    const next = DRUM_KIT.find((d) => d.level === drum.value.level + 1)
    if (next) pickDrum(next.id)
  }

  // ---- Free play ------------------------------------------------------------

  const litTimers = new Map<string, ReturnType<typeof setTimeout>>()

  function lightUp(area: string) {
    if (!lit.value.includes(area)) lit.value = [...lit.value, area]
    clearTimeout(litTimers.get(area))
    litTimers.set(
      area,
      setTimeout(() => {
        lit.value = lit.value.filter((a) => a !== area)
      }, 160)
    )
  }

  async function hit(area: string) {
    const at = performance.now()
    const sound = drum.value.areas.find((a) => a.id === area)?.sound
    if (!sound) return
    soundAvailable.value = !!(await startDrumAudio())
    playDrumSound(sound)
    lightUp(area)
    if (recordState.value === 'recording') {
      taps.value = [...taps.value, { at: at - recordStart, drum: drumId.value, area }]
    }
  }

  const keyHint = computed(
    () =>
      'Keyboard: ' +
      drum.value.areas.map((a) => `${keyForArea(drum.value, a.id)} = ${a.short}`).join(', ')
  )

  function onKeydown(e: KeyboardEvent) {
    if (mode.value !== 'free') return // challenges handle their own keys
    const area = areaForKey(drum.value, e.code)
    if (!area) return
    e.preventDefault()
    if (!e.repeat) hit(area)
  }

  // ---- Beat guide (free play) -------------------------------------------------
  // Clicks are scheduled slightly ahead on the audio clock so they stay steady;
  // the glow is timed to match each click.

  const guideBpm = ref<GuideSpeed>(0)
  const pulse = ref(false)
  let guideTimer: ReturnType<typeof setInterval> | null = null
  let nextBeat = 0
  const pulseTimers: Array<ReturnType<typeof setTimeout>> = []

  function stopGuide() {
    if (guideTimer) clearInterval(guideTimer)
    guideTimer = null
    pulseTimers.splice(0).forEach((t) => clearTimeout(t))
    pulse.value = false
  }

  async function setGuide(bpm: GuideSpeed) {
    guideBpm.value = bpm
    stopGuide()
    if (!bpm) return
    soundAvailable.value = !!(await startDrumAudio())
    nextBeat = audioTime() + 0.1
    guideTimer = setInterval(() => {
      const beat = 60 / guideBpm.value
      while (nextBeat < audioTime() + 0.15) {
        playGuideClick(nextBeat)
        const delay = Math.max(0, (nextBeat - audioTime()) * 1000)
        pulseTimers.push(
          setTimeout(() => {
            pulse.value = true
            pulseTimers.push(setTimeout(() => (pulse.value = false), 180))
          }, delay)
        )
        nextBeat += beat
      }
      if (pulseTimers.length > 20) pulseTimers.splice(0, pulseTimers.length - 20)
    }, 25)
  }

  // ---- Recording (free play) ----------------------------------------------------

  const recordState = ref<RecordState>('idle')
  const taps = ref<RecordedTap[]>([])
  const recordedSeconds = ref(0)
  const elapsed = ref(0)
  let recordStart = 0
  let recordTicker: ReturnType<typeof setInterval> | null = null
  const playbackTimers: Array<ReturnType<typeof setTimeout>> = []

  async function startRecording() {
    stopAll()
    soundAvailable.value = !!(await startDrumAudio())
    taps.value = []
    elapsed.value = 0
    recordStart = performance.now()
    recordState.value = 'recording'
    recordTicker = setInterval(() => {
      elapsed.value = Math.floor((performance.now() - recordStart) / 1000)
      if (elapsed.value >= MAX_RECORD_SECONDS) stopAll()
    }, 200)
  }

  function playRecording() {
    if (!taps.value.length) return
    stopAll()
    recordState.value = 'playing'
    for (const tap of taps.value) {
      playbackTimers.push(
        setTimeout(() => {
          const sound = findDrum(tap.drum)?.areas.find((a) => a.id === tap.area)?.sound
          if (sound) playDrumSound(sound)
          if (tap.drum === drumId.value) lightUp(tap.area)
        }, tap.at)
      )
    }
    const end = taps.value[taps.value.length - 1]!.at + 600
    playbackTimers.push(setTimeout(() => (recordState.value = 'idle'), end))
  }

  /** Stops recording or playback, whichever is happening. */
  function stopAll() {
    if (recordState.value === 'recording') {
      recordedSeconds.value = Math.min(
        MAX_RECORD_SECONDS,
        Math.round((performance.now() - recordStart) / 1000)
      )
    }
    if (recordTicker) clearInterval(recordTicker)
    recordTicker = null
    playbackTimers.splice(0).forEach((t) => clearTimeout(t))
    recordState.value = 'idle'
  }

  const recordStatus = computed(() => {
    if (recordState.value === 'recording')
      return `Recording… ${elapsed.value} of ${MAX_RECORD_SECONDS} seconds`
    if (recordState.value === 'playing') return 'Playing your beat'
    if (taps.value.length)
      return `Your beat: ${taps.value.length} ${taps.value.length === 1 ? 'tap' : 'taps'}, ${recordedSeconds.value} ${recordedSeconds.value === 1 ? 'second' : 'seconds'}`
    return 'Press Record, play the drum, then press Stop.'
  })

  // ---- Lifecycle ------------------------------------------------------------

  onMounted(() => {
    window.addEventListener('keydown', onKeydown)
    try {
      const last = localStorage.getItem(LAST_DRUM_KEY)
      const found = last ? findDrum(last) : undefined
      if (found) drumId.value = found.id
    } catch {
      // Storage unavailable: start on level 1.
    }
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
    stopGuide()
    stopAll()
    litTimers.forEach((t) => clearTimeout(t))
  })

  const btnBase =
    'inline-flex min-h-14 items-center justify-center rounded-2xl px-6 py-3 text-lg font-semibold focus-visible:ring-4 focus-visible:ring-(--bn-navy) focus-visible:ring-offset-4 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
  const btnPrimary = `${btnBase} bg-orange-700 text-white hover:bg-orange-800`
  const btnQuiet = `${btnBase} border-2 border-slate-400 bg-white text-(--bn-navy) hover:bg-slate-50`
</script>

<template>
  <div>
    <!-- Level picker -->
    <h2 class="bn-font-display text-2xl font-bold text-(--bn-navy)">Choose a level</h2>
    <p class="mt-1 text-lg text-(--bn-muted)">
      Each level is a new drum with more parts to play. Every level is open.
    </p>
    <div class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4" role="group" aria-label="Level">
      <button
        v-for="d in DRUM_KIT"
        :key="d.id"
        type="button"
        class="flex flex-col rounded-2xl border-2 p-3 text-left transition-colors focus-visible:ring-4 focus-visible:ring-(--bn-navy) focus-visible:ring-offset-4 focus-visible:outline-none"
        :class="
          drumId === d.id
            ? 'border-orange-700 bg-(--bn-peach)'
            : 'border-slate-300 bg-white hover:bg-slate-50'
        "
        :aria-pressed="drumId === d.id"
        :data-testid="`drum-${d.id}`"
        @click="pickDrum(d.id)"
      >
        <DrumPicture :drum-id="d.id" class="pointer-events-none" />
        <span class="mt-2 block text-lg font-bold text-(--bn-navy)">Level {{ d.level }}</span>
        <span class="block text-lg text-(--bn-navy)">{{ d.name }}</span>
        <span class="block text-base text-(--bn-muted)">{{ partsLabel(d.areas.length) }}</span>
      </button>
    </div>

    <!-- Activity card -->
    <div class="mt-6 rounded-[20px] border border-(--bn-border) bg-(--bn-peach) p-6 sm:p-10">
      <p class="text-lg font-bold tracking-wide text-orange-800 uppercase">
        Try it now — interactive
      </p>
      <h3 class="bn-font-display mt-2 text-2xl font-bold text-(--bn-navy)" data-testid="drum-name">
        Level {{ drum.level }}: {{ drum.name }} · {{ partsLabel(drum.areas.length) }}
      </h3>
      <p class="mt-2 text-lg leading-relaxed text-(--bn-navy) sm:text-xl">{{ drum.howTo }}</p>

      <!-- What to do -->
      <div class="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4" role="group" aria-label="Activity">
        <button
          v-for="m in MODES"
          :key="m.id"
          type="button"
          class="min-h-18 rounded-2xl border-2 p-3 text-left focus-visible:ring-4 focus-visible:ring-(--bn-navy) focus-visible:ring-offset-4 focus-visible:outline-none"
          :class="
            mode === m.id
              ? 'border-(--bn-navy) bg-(--bn-navy) text-white'
              : 'border-slate-300 bg-white text-(--bn-navy) hover:bg-slate-50'
          "
          :aria-pressed="mode === m.id"
          :data-testid="`mode-${m.id}`"
          @click="pickMode(m.id)"
        >
          <span class="block text-lg font-bold">{{ m.label }}</span>
          <span
            class="block text-base"
            :class="mode === m.id ? 'text-white/85' : 'text-(--bn-muted)'"
          >
            {{ m.hint }}
          </span>
        </button>
      </div>

      <!-- Thinking challenges -->
      <div v-if="mode !== 'free'" class="mt-6">
        <DrumChallenge
          :key="`${drumId}-${mode}`"
          :drum-id="drumId"
          :mode="mode"
          @next-level="nextLevel"
          @free-play="pickMode('free')"
        />
      </div>

      <!-- Free play -->
      <template v-else>
        <div
          class="mx-auto mt-6 max-w-160 rounded-2xl border border-(--bn-border) bg-white p-4 transition-shadow duration-150"
          :class="pulse ? 'shadow-[0_0_0_10px_rgba(249,115,22,0.45)]' : 'shadow-none'"
          data-testid="drum-stage"
        >
          <DrumPicture :drum-id="drumId" :lit="lit" interactive @hit="hit" />
        </div>
        <p class="mt-3 text-center text-base text-(--bn-muted)">{{ keyHint }}</p>
        <p v-if="!soundAvailable" class="mt-2 text-center text-lg text-orange-800">
          Sound isn't available in this browser, but the drum still lights up.
        </p>

        <div class="mt-6 rounded-2xl border border-(--bn-border) bg-white p-4 sm:p-6">
          <h4 class="text-xl font-bold text-(--bn-navy)">Beat guide</h4>
          <p class="mt-1 text-lg text-(--bn-muted)">
            The drum glows and clicks on each beat. Play along if you like.
          </p>
          <div class="mt-3 flex flex-wrap gap-3" role="group" aria-label="Beat guide speed">
            <button
              v-for="g in GUIDE_OPTIONS"
              :key="g.bpm"
              type="button"
              :class="guideBpm === g.bpm ? btnPrimary : btnQuiet"
              :aria-pressed="guideBpm === g.bpm"
              :data-testid="`guide-${g.label.toLowerCase()}`"
              @click="setGuide(g.bpm)"
            >
              {{ g.label }}
            </button>
          </div>
        </div>

        <div class="mt-4 rounded-2xl border border-(--bn-border) bg-white p-4 sm:p-6">
          <h4 class="text-xl font-bold text-(--bn-navy)">Record your beat</h4>
          <p class="mt-1 text-lg text-(--bn-navy)" aria-live="polite" data-testid="record-status">
            <span
              v-if="recordState === 'recording'"
              class="mr-2 inline-block h-3 w-3 animate-pulse rounded-full bg-red-600 align-middle"
              aria-hidden="true"
            />
            {{ recordStatus }}
          </p>
          <div class="mt-3 flex flex-wrap gap-3">
            <button
              v-if="recordState === 'idle'"
              type="button"
              :class="btnPrimary"
              data-testid="record"
              @click="startRecording"
            >
              ● Record
            </button>
            <button v-else type="button" :class="btnPrimary" data-testid="stop" @click="stopAll">
              ■ Stop
            </button>
            <button
              type="button"
              :class="btnQuiet"
              :disabled="recordState !== 'idle' || !taps.length"
              data-testid="play"
              @click="playRecording"
            >
              ▶ Play
            </button>
          </div>
        </div>
      </template>

      <p class="mt-6 text-lg text-(--bn-muted)">
        Short, daily sessions work best. Mistakes are fine — the challenges adjust to you.
      </p>
    </div>
  </div>
</template>

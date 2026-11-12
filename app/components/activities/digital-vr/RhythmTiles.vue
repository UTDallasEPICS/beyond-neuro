<script setup lang="ts">
  // Rhythm Tiles game (Digital & VR Training): tap each falling tile as it reaches the line.
  // Each level has a set number of tiles and a limited number of misses. No timer.
  type Phase = 'setup' | 'playing' | 'paused' | 'cleared' | 'failed'
  type Judgement = 'perfect' | 'good' | 'miss'
  type LevelId = 1 | 2 | 3 | 4 | 5 | 6 | 7

  interface LevelConfig {
    id: LevelId
    hint: string
    lanes: number
    tiles: number
    maxMisses: number
    // How long a tile takes to fall to the line, and the time between tiles (ms).
    travel: number
    gap: number
    // How far from the line (ms) a tap still counts.
    window: number
    rests: boolean
    pairs: boolean
  }

  interface Tile {
    id: number
    lane: number
    hitAt: number
    travel: number
    judged: Judgement | null
  }

  interface Summary {
    caught: number
    total: number
    accuracy: number
    bestStreak: number
    avgOffset: number | null
  }

  interface Progress {
    lastLevel: LevelId
    best: Partial<Record<LevelId, number>>
  }

  const LEVELS: LevelConfig[] = [
    {
      id: 1,
      hint: '3 lanes, slow',
      lanes: 3,
      tiles: 15,
      maxMisses: 5,
      travel: 3200,
      gap: 1600,
      window: 280,
      rests: true,
      pairs: false,
    },
    {
      id: 2,
      hint: '3 lanes, steady',
      lanes: 3,
      tiles: 18,
      maxMisses: 5,
      travel: 2800,
      gap: 1350,
      window: 260,
      rests: true,
      pairs: false,
    },
    {
      id: 3,
      hint: '4 lanes, slow',
      lanes: 4,
      tiles: 20,
      maxMisses: 5,
      travel: 2700,
      gap: 1300,
      window: 250,
      rests: true,
      pairs: false,
    },
    {
      id: 4,
      hint: '4 lanes, steady',
      lanes: 4,
      tiles: 22,
      maxMisses: 4,
      travel: 2300,
      gap: 1050,
      window: 220,
      rests: false,
      pairs: false,
    },
    {
      id: 5,
      hint: '4 lanes, brisk',
      lanes: 4,
      tiles: 25,
      maxMisses: 4,
      travel: 2000,
      gap: 850,
      window: 200,
      rests: false,
      pairs: false,
    },
    {
      id: 6,
      hint: '4 lanes, quick',
      lanes: 4,
      tiles: 28,
      maxMisses: 3,
      travel: 1700,
      gap: 700,
      window: 180,
      rests: false,
      pairs: false,
    },
    {
      id: 7,
      hint: '4 lanes, quick pairs',
      lanes: 4,
      tiles: 30,
      maxMisses: 3,
      travel: 1450,
      gap: 600,
      window: 170,
      rests: false,
      pairs: true,
    },
  ]

  const COUNTDOWN_MS = 3000
  // Pause after the last tile so the final hit or miss is visible before the results.
  const END_DELAY_MS = 900
  const PERFECT_SHARE = 0.45
  // Miss messages stay up longer so "misses left" can be read.
  const POPUP_MS = 700
  const MISS_POPUP_MS = 1400
  // Taps this close (as a multiple of the window) get "too early / too late" feedback.
  const NEAR_SHARE = 2
  // Clearing a level at or above this accuracy suggests moving up.
  const MOVE_UP_AT = 85
  // Hit line position, as a % of the lane height.
  const HIT_LINE = 82
  const TILE_HEIGHT = 56
  const PROGRESS_KEY = 'bn-rhythm-tiles-progress'

  const LANE_KEYS = [
    ['1', 'd'],
    ['2', 'f'],
    ['3', 'j'],
    ['4', 'k'],
  ]
  const LANE_COLORS = ['bg-orange-400', 'bg-sky-400', 'bg-emerald-400', 'bg-fuchsia-400']
  const LANE_RINGS = [
    'border-orange-300',
    'border-sky-300',
    'border-emerald-300',
    'border-fuchsia-300',
  ]
  // C major pentatonic, so any order of tiles sounds pleasant.
  const LANE_TONES = [523.25, 659.25, 783.99, 880]
  const MISS_TONE = 196

  type PopupKind = Judgement | 'early' | 'late'
  const POPUP_TEXT: Record<PopupKind, string> = {
    perfect: 'Perfect!',
    good: 'Good',
    miss: 'Missed!',
    early: 'Too early',
    late: 'Too late',
  }
  const POPUP_COLOR: Record<PopupKind, string> = {
    perfect: 'text-amber-300',
    good: 'text-sky-200',
    miss: 'text-rose-300',
    early: 'text-white/80',
    late: 'text-white/80',
  }

  const levelId = ref<LevelId>(1)
  const level = computed(() => LEVELS.find((l) => l.id === levelId.value)!)
  const phase = ref<Phase>('setup')
  const clock = ref(0)
  const tiles = ref<Tile[]>([])
  const spawned = ref(0)
  const missesLeft = ref(0)
  const streak = ref(0)
  const bestStreak = ref(0)
  const counts = reactive({ perfect: 0, good: 0, miss: 0 })
  const soundOn = ref(true)
  const pressed = ref<boolean[]>([])
  const laneFlash = ref<({ judgement: Judgement; at: number } | undefined)[]>([])
  const popup = ref<{ kind: PopupKind; at: number } | null>(null)
  const lastMissAt = ref<number | null>(null)
  const announcement = ref('')
  const summary = ref<Summary | null>(null)
  const failStreak = ref(0)
  const progress = ref<Progress>({ lastLevel: 1, best: {} })

  let offsets: number[] = []
  let ending: { result: 'cleared' | 'failed'; at: number } | null = null
  let nextHitAt = 0
  let nextId = 0
  let lastLane = -1
  let lastStep = 1
  let rafId = 0
  let lastFrame = 0
  let audio: AudioContext | null = null

  const isActive = computed(() => phase.value === 'playing' || phase.value === 'paused')
  const judgedCount = computed(() => counts.perfect + counts.good + counts.miss)

  const laneList = computed(() =>
    Array.from({ length: level.value.lanes }, (_, i) => ({
      index: i,
      key: LANE_KEYS[i]![0]!,
      color: LANE_COLORS[i]!,
      ring: LANE_RINGS[i]!,
    }))
  )

  const keyHint = computed(() => {
    const keys = LANE_KEYS.slice(0, level.value.lanes)
    const numbers = keys.map((k) => k[0]).join(', ')
    const letters = keys.map((k) => k[1]!.toUpperCase()).join(', ')
    return `Tap the lanes, or press ${numbers} (or ${letters}) on the keyboard.`
  })

  const countdown = computed(() =>
    phase.value === 'playing' && clock.value < 0 ? Math.ceil(-clock.value / 1000) : 0
  )

  const accuracy = computed(() =>
    judgedCount.value ? Math.round(((counts.perfect + counts.good) / judgedCount.value) * 100) : 0
  )

  const popupMs = (kind: PopupKind) => (kind === 'miss' ? MISS_POPUP_MS : POPUP_MS)

  const visiblePopup = computed(() =>
    popup.value && clock.value - popup.value.at < popupMs(popup.value.kind) ? popup.value : null
  )

  // Red flash around the play area right after a miss.
  const missFlash = computed(
    () => lastMissAt.value !== null && clock.value - lastMissAt.value < 350
  )

  const nextLevel = computed(() => (levelId.value < 7 ? ((levelId.value + 1) as LevelId) : null))
  const easierLevel = computed(() => (levelId.value > 1 ? ((levelId.value - 1) as LevelId) : null))

  const resultTitle = computed(() => {
    if (phase.value === 'cleared') {
      return levelId.value === 7 ? 'You cleared the top level!' : `Level ${levelId.value} cleared!`
    }
    return 'Out of misses this time'
  })

  const resultMessage = computed(() => {
    const score = summary.value?.accuracy ?? 0
    if (phase.value === 'cleared') {
      if (levelId.value === 7) return 'Outstanding focus and timing. Keep it sharp with daily play.'
      if (score >= MOVE_UP_AT) return `Great rhythm — you're ready for level ${nextLevel.value}.`
      return 'Nicely done. Play it once more to steady your timing, or move up when ready.'
    }
    if (failStreak.value >= 2 && easierLevel.value) {
      return `Level ${easierLevel.value} may feel more comfortable for now. You can come back to this one any time.`
    }
    return "That's part of practice. Take a breath and give it another go."
  })

  const timingMessage = computed(() => {
    const avg = summary.value?.avgOffset
    if (avg == null) return ''
    if (Math.abs(avg) <= 30) return 'Your timing was right on the beat.'
    return `On average you tapped ${Math.abs(avg)} ms ${avg < 0 ? 'early' : 'late'}.`
  })

  // The suggested next step is shown as the main button after a level.
  const primaryAction = computed<{ label: string; level: LevelId }>(() => {
    if (
      phase.value === 'cleared' &&
      nextLevel.value &&
      (summary.value?.accuracy ?? 0) >= MOVE_UP_AT
    ) {
      return { label: `Next: level ${nextLevel.value}`, level: nextLevel.value }
    }
    if (phase.value === 'failed' && failStreak.value >= 2 && easierLevel.value) {
      return { label: `Try level ${easierLevel.value}`, level: easierLevel.value }
    }
    return { label: phase.value === 'failed' ? 'Try again' : 'Play again', level: levelId.value }
  })

  const secondaryAction = computed<{ label: string; level: LevelId } | null>(() => {
    const primary = primaryAction.value.level
    if (phase.value === 'cleared' && nextLevel.value && primary !== nextLevel.value) {
      return { label: `Next: level ${nextLevel.value}`, level: nextLevel.value }
    }
    if (primary !== levelId.value) {
      return { label: phase.value === 'failed' ? 'Try again' : 'Play again', level: levelId.value }
    }
    return null
  })

  function tilesIn(lane: number) {
    return tiles.value.filter((tile) => tile.lane === lane)
  }

  function tileTop(tile: Tile) {
    const fallen = 1 - (tile.hitAt - clock.value) / tile.travel
    return `calc(${fallen * HIT_LINE}% - ${TILE_HEIGHT / 2}px)`
  }

  function targetClass(lane: number) {
    const flash = laneFlash.value[lane]
    if (flash && clock.value - flash.at < 300) {
      if (flash.judgement === 'miss') return 'border-rose-400 bg-rose-500/40'
      if (clock.value - flash.at < 180) {
        return flash.judgement === 'perfect' ? 'scale-110 bg-white/40' : 'bg-white/25'
      }
    }
    return pressed.value[lane] ? 'bg-white/15' : 'bg-transparent'
  }

  function pickLevel(next: LevelId) {
    if (next !== levelId.value) failStreak.value = 0
    levelId.value = next
    phase.value = 'setup'
    summary.value = null
  }

  function playLevel(next: LevelId) {
    pickLevel(next)
    start()
  }

  function start() {
    const config = level.value
    clock.value = -COUNTDOWN_MS
    tiles.value = []
    spawned.value = 0
    missesLeft.value = config.maxMisses
    streak.value = 0
    bestStreak.value = 0
    counts.perfect = 0
    counts.good = 0
    counts.miss = 0
    offsets = []
    ending = null
    nextHitAt = config.travel
    lastLane = -1
    lastStep = 1
    pressed.value = Array.from({ length: config.lanes }, () => false)
    laneFlash.value = []
    popup.value = null
    lastMissAt.value = null
    summary.value = null
    announcement.value = `Level ${config.id}. Get ready.`
    unlockAudio()
    phase.value = 'playing'
    runLoop()
  }

  function runLoop() {
    cancelAnimationFrame(rafId)
    lastFrame = performance.now()
    rafId = requestAnimationFrame(frame)
  }

  function frame(now: number) {
    // Cap the step so a slow frame never jumps tiles past the line.
    clock.value += Math.min(now - lastFrame, 100)
    lastFrame = now
    update()
    if (phase.value === 'playing') rafId = requestAnimationFrame(frame)
  }

  function update() {
    const t = clock.value

    if (ending) {
      if (t - ending.at >= END_DELAY_MS) finish(ending.result)
      return
    }

    while (spawned.value < level.value.tiles && nextHitAt - level.value.travel <= t) spawn()

    for (const tile of tiles.value) {
      if (!tile.judged && t - tile.hitAt > level.value.window) {
        judge(tile, 'miss')
        if (ending) return
      }
    }

    const kept = tiles.value.filter((tile) => !tile.judged || t - tile.hitAt < tile.travel * 0.3)
    if (kept.length !== tiles.value.length) tiles.value = kept

    if (spawned.value === level.value.tiles && tiles.value.every((tile) => tile.judged)) {
      ending = { result: 'cleared', at: t }
    }
  }

  function rhythmStep() {
    const config = level.value
    // A quick pair is always followed by a full beat so it never stacks up.
    if (config.pairs && lastStep !== 0.5 && Math.random() < 0.25) return 0.5
    if (config.rests && Math.random() < 0.25) return 2
    return 1
  }

  function spawn() {
    const t = clock.value
    const lanes = level.value.lanes
    let lane = Math.floor(Math.random() * lanes)
    // Quick pairs always land in different lanes.
    if (lane === lastLane && (lastStep === 0.5 || Math.random() < 0.6)) {
      lane = (lane + 1 + Math.floor(Math.random() * (lanes - 1))) % lanes
    }
    lastLane = lane
    tiles.value.push({ id: nextId++, lane, hitAt: nextHitAt, travel: nextHitAt - t, judged: null })
    spawned.value++
    lastStep = rhythmStep()
    nextHitAt += level.value.gap * lastStep
  }

  function judge(tile: Tile, judgement: Judgement, offset = 0) {
    const t = clock.value
    tile.judged = judgement
    counts[judgement]++
    popup.value = { kind: judgement, at: t }
    laneFlash.value[tile.lane] = { judgement, at: t }

    if (judgement !== 'miss') {
      offsets.push(offset)
      streak.value++
      bestStreak.value = Math.max(bestStreak.value, streak.value)
      playTone(LANE_TONES[tile.lane]!, 'triangle', 0.25)
      return
    }

    streak.value = 0
    missesLeft.value--
    lastMissAt.value = t
    playTone(MISS_TONE, 'sine', 0.18)
    if (missesLeft.value <= 0) {
      announcement.value = 'Missed. No misses left.'
      ending = { result: 'failed', at: t }
    } else {
      const plural = missesLeft.value === 1 ? 'miss' : 'misses'
      announcement.value = `Missed. ${missesLeft.value} ${plural} left.`
    }
  }

  function hitLane(lane: number) {
    if (phase.value !== 'playing' || clock.value < 0 || ending) return
    const t = clock.value
    const window = level.value.window
    let best: Tile | undefined
    for (const tile of tiles.value) {
      if (tile.lane !== lane || tile.judged) continue
      if (!best || Math.abs(t - tile.hitAt) < Math.abs(t - best.hitAt)) best = tile
    }
    if (!best) return
    const offset = t - best.hitAt
    if (Math.abs(offset) > window) {
      // Close but outside the window: a hint only, the tile can still be caught.
      if (Math.abs(offset) <= window * NEAR_SHARE) {
        popup.value = { kind: offset < 0 ? 'early' : 'late', at: t }
      }
      return
    }
    judge(best, Math.abs(offset) <= window * PERFECT_SHARE ? 'perfect' : 'good', offset)
    const id = best.id
    tiles.value = tiles.value.filter((tile) => tile.id !== id)
  }

  function onLaneDown(lane: number, event: PointerEvent) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    pressed.value[lane] = true
    hitLane(lane)
  }

  function onLaneUp(lane: number) {
    pressed.value[lane] = false
  }

  function laneForKey(key: string) {
    const k = key.toLowerCase()
    return LANE_KEYS.slice(0, level.value.lanes).findIndex((keys) => keys.includes(k))
  }

  function onKeyDown(event: KeyboardEvent) {
    if (phase.value !== 'playing') return
    if (event.key === 'Escape') {
      pause()
      return
    }
    const lane = laneForKey(event.key)
    if (lane < 0) return
    event.preventDefault()
    if (event.repeat) return
    pressed.value[lane] = true
    hitLane(lane)
  }

  function onKeyUp(event: KeyboardEvent) {
    const lane = laneForKey(event.key)
    if (lane >= 0) pressed.value[lane] = false
  }

  function pause() {
    if (phase.value !== 'playing') return
    phase.value = 'paused'
    cancelAnimationFrame(rafId)
    pressed.value = pressed.value.map(() => false)
    announcement.value = 'Paused.'
  }

  function resume() {
    if (phase.value !== 'paused') return
    phase.value = 'playing'
    announcement.value = 'Resumed.'
    runLoop()
  }

  function quit() {
    cancelAnimationFrame(rafId)
    tiles.value = []
    phase.value = 'setup'
  }

  function finish(result: 'cleared' | 'failed') {
    cancelAnimationFrame(rafId)
    ending = null
    tiles.value = []
    phase.value = result
    summary.value = {
      caught: counts.perfect + counts.good,
      total: judgedCount.value,
      accuracy: accuracy.value,
      bestStreak: bestStreak.value,
      avgOffset: offsets.length
        ? Math.round(offsets.reduce((sum, o) => sum + o, 0) / offsets.length)
        : null,
    }

    if (result === 'cleared') {
      failStreak.value = 0
      const best = progress.value.best[levelId.value] ?? 0
      progress.value.best[levelId.value] = Math.max(best, accuracy.value)
    } else {
      failStreak.value++
    }
    progress.value.lastLevel = levelId.value
    saveProgress()

    announcement.value =
      result === 'cleared'
        ? `Level ${levelId.value} cleared with ${accuracy.value} percent accuracy.`
        : `Out of misses. You caught ${summary.value.caught} tiles.`
  }

  function saveProgress() {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress.value))
    } catch {
      // Storage can be unavailable (private mode); progress still shows for this visit.
    }
  }

  function unlockAudio() {
    if (typeof window === 'undefined') return
    if (!audio) {
      const Ctx =
        window.AudioContext ??
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (Ctx) audio = new Ctx()
    }
    if (audio?.state === 'suspended') void audio.resume()
  }

  function playTone(frequency: number, type: OscillatorType, volume: number) {
    if (!soundOn.value || !audio) return
    const now = audio.currentTime
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = type
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4)
    osc.connect(gain).connect(audio.destination)
    osc.start(now)
    osc.stop(now + 0.45)
  }

  function onVisibility() {
    if (document.hidden) pause()
  }

  // Progress lives in the browser only, so server and browser render match.
  onMounted(() => {
    try {
      const saved = localStorage.getItem(PROGRESS_KEY)
      if (saved) {
        progress.value = JSON.parse(saved) as Progress
        levelId.value = progress.value.lastLevel
      }
    } catch {
      progress.value = { lastLevel: 1, best: {} }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    document.addEventListener('visibilitychange', onVisibility)
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    document.removeEventListener('visibilitychange', onVisibility)
    void audio?.close()
  })

  const btnBase =
    'inline-flex min-h-[56px] items-center justify-center rounded-2xl px-6 py-3 text-lg font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none'
  const btnPrimary = `${btnBase} bg-orange-700 text-white hover:bg-orange-800`
  const btnQuiet = `${btnBase} border-2 border-slate-400 bg-white text-[var(--bn-navy)] hover:bg-slate-50`
</script>

<template>
  <div>
    <!-- Level picker: same style and placement as the other activities -->
    <h2 class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">Choose a level</h2>
    <p class="mt-1 text-lg text-[var(--bn-muted)]">
      There is no timer. Each level has a few misses to spare — clear it to move up.
    </p>
    <div
      class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4"
      role="group"
      aria-label="Difficulty level"
    >
      <button
        v-for="option in LEVELS"
        :key="option.id"
        type="button"
        class="min-h-[72px] rounded-2xl border-2 p-4 text-left transition-colors focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        :class="
          levelId === option.id
            ? 'border-orange-700 bg-[var(--bn-peach)]'
            : 'border-slate-300 bg-white hover:bg-slate-50'
        "
        :aria-pressed="levelId === option.id"
        :disabled="isActive"
        @click="pickLevel(option.id)"
      >
        <span class="block text-lg font-bold text-[var(--bn-navy)]">Level {{ option.id }}</span>
        <span class="block text-lg text-[var(--bn-muted)]">{{ option.hint }}</span>
        <span
          v-if="progress.best[option.id] !== undefined"
          class="mt-1 block text-base font-semibold text-green-800"
        >
          ✓ Best {{ progress.best[option.id] }}%
        </span>
      </button>
    </div>

    <!-- Activity card -->
    <div
      class="mt-6 rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 sm:p-10"
    >
      <p class="text-lg font-bold tracking-wide text-orange-800 uppercase">
        Try it now — interactive
      </p>

      <p class="mt-3 text-lg leading-relaxed text-[var(--bn-navy)] sm:text-xl">
        Tiles slide down toward the line. Tap the lane — or press its number key — just as each tile
        reaches the line. Every tile you catch plays a note.
      </p>

      <div class="mt-6 flex flex-wrap items-center gap-3 text-lg text-[var(--bn-navy)]">
        <span class="rounded-2xl border border-[var(--bn-border)] bg-white px-4 py-2">
          Level <strong>{{ level.id }}</strong>
        </span>
        <span class="rounded-2xl border border-[var(--bn-border)] bg-white px-4 py-2">
          Tiles: <strong>{{ judgedCount }}</strong> of {{ level.tiles }}
        </span>
        <span class="rounded-2xl border border-[var(--bn-border)] bg-white px-4 py-2">
          Streak: <strong>{{ streak }}</strong>
        </span>
        <span
          class="flex items-center gap-2 rounded-2xl border border-[var(--bn-border)] bg-white px-4 py-2"
          :aria-label="`Misses left: ${isActive ? missesLeft : level.maxMisses} of ${level.maxMisses}`"
        >
          <span aria-hidden="true">Misses left:</span>
          <span class="flex gap-1" aria-hidden="true">
            <svg
              v-for="n in level.maxMisses"
              :key="n"
              viewBox="0 0 24 24"
              class="h-6 w-6 transition-transform"
              :class="[
                n <= (isActive ? missesLeft : level.maxMisses)
                  ? 'fill-rose-500 stroke-rose-600'
                  : 'fill-transparent stroke-slate-400',
                missFlash && n === missesLeft + 1 ? 'scale-125' : '',
              ]"
              stroke-width="1.5"
            >
              <path
                d="M12 21s-6.7-4.35-9.2-8.1C.9 10 2.2 5.5 6.3 5.1c2.2-.2 3.9 1 5.7 3 1.8-2 3.5-3.2 5.7-3 4.1.4 5.4 4.9 3.5 7.8C18.7 16.65 12 21 12 21z"
              />
            </svg>
          </span>
        </span>

        <div class="ml-auto flex flex-wrap gap-3">
          <button
            type="button"
            :class="btnQuiet"
            :aria-pressed="soundOn"
            @click="soundOn = !soundOn"
          >
            Sound: {{ soundOn ? 'On' : 'Off' }}
          </button>
          <button v-if="phase === 'playing'" type="button" :class="btnQuiet" @click="pause">
            Pause
          </button>
        </div>
      </div>

      <!-- Play area -->
      <div
        class="relative mt-6 grid h-[60vh] max-h-[520px] min-h-[380px] touch-none overflow-hidden rounded-2xl bg-[var(--bn-navy)] ring-rose-400 transition-shadow duration-150 select-none"
        :class="[
          level.lanes === 3 ? 'grid-cols-3' : 'grid-cols-4',
          missFlash ? 'ring-8' : 'ring-0',
        ]"
      >
        <div
          v-for="lane in laneList"
          :key="lane.index"
          class="relative h-full cursor-pointer border-white/15 [&:not(:first-child)]:border-l"
          aria-hidden="true"
          @pointerdown="onLaneDown(lane.index, $event)"
          @pointerup="onLaneUp(lane.index)"
          @pointerleave="onLaneUp(lane.index)"
          @pointercancel="onLaneUp(lane.index)"
        >
          <div
            class="absolute inset-0 transition-colors duration-100"
            :class="pressed[lane.index] ? 'bg-white/10' : ''"
          />

          <div
            v-for="tile in tilesIn(lane.index)"
            :key="tile.id"
            class="absolute inset-x-2 flex items-center justify-center rounded-xl shadow-lg sm:inset-x-3"
            :class="
              tile.judged === 'miss'
                ? 'border-2 border-dashed border-rose-300 bg-rose-500/30 text-3xl font-bold text-rose-200'
                : lane.color
            "
            :style="{ top: tileTop(tile), height: `${TILE_HEIGHT}px` }"
          >
            <template v-if="tile.judged === 'miss'">✕</template>
          </div>

          <div
            class="absolute inset-x-2 flex items-center justify-center rounded-xl border-4 text-2xl font-bold text-white transition-transform duration-100 sm:inset-x-3"
            :class="[lane.ring, targetClass(lane.index)]"
            :style="{
              top: `calc(${HIT_LINE}% - ${TILE_HEIGHT / 2}px)`,
              height: `${TILE_HEIGHT}px`,
            }"
          >
            {{ lane.key }}
          </div>
        </div>

        <p
          v-if="visiblePopup"
          :key="visiblePopup.at"
          class="rt-popup pointer-events-none absolute inset-x-0 top-[38%] text-center font-bold"
          :style="{ animationDuration: `${popupMs(visiblePopup.kind)}ms` }"
          :class="[
            POPUP_COLOR[visiblePopup.kind],
            visiblePopup.kind === 'miss' ? 'text-5xl' : 'text-4xl',
          ]"
          aria-hidden="true"
        >
          {{ POPUP_TEXT[visiblePopup.kind] }}
          <span v-if="visiblePopup.kind === 'miss'" class="mt-2 block text-2xl text-white">
            {{
              missesLeft > 0
                ? `${missesLeft} ${missesLeft === 1 ? 'miss' : 'misses'} left`
                : 'No misses left'
            }}
          </span>
        </p>

        <!-- Overlays -->
        <div
          v-if="countdown"
          class="pointer-events-none absolute inset-0 flex items-center justify-center bg-[var(--bn-navy)]/60"
          aria-hidden="true"
        >
          <span class="bn-font-display text-8xl font-bold text-white">{{ countdown }}</span>
        </div>

        <div
          v-else-if="phase !== 'playing'"
          class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--bn-navy)]/85 p-6 text-center text-white"
        >
          <template v-if="phase === 'paused'">
            <p class="bn-font-display text-3xl font-bold">Paused</p>
            <div class="flex flex-wrap justify-center gap-3">
              <button type="button" :class="btnPrimary" @click="resume">Resume</button>
              <button type="button" :class="btnQuiet" @click="quit">Quit level</button>
            </div>
          </template>

          <template v-else-if="phase === 'setup'">
            <p class="bn-font-display text-3xl font-bold">Level {{ level.id }}</p>
            <p class="max-w-md text-lg text-white/85">
              {{ level.tiles }} tiles · {{ level.maxMisses }} misses allowed
            </p>
            <p class="max-w-md text-lg text-white/85">{{ keyHint }}</p>
            <button type="button" :class="btnPrimary" @click="start">Start</button>
          </template>

          <template v-else>
            <p class="bn-font-display text-3xl font-bold">{{ resultTitle }}</p>
            <p class="max-w-md text-lg text-white/85">{{ resultMessage }}</p>
            <div class="flex flex-wrap justify-center gap-3">
              <button type="button" :class="btnPrimary" @click="playLevel(primaryAction.level)">
                {{ primaryAction.label }}
              </button>
              <button
                v-if="secondaryAction"
                type="button"
                :class="btnQuiet"
                @click="playLevel(secondaryAction.level)"
              >
                {{ secondaryAction.label }}
              </button>
            </div>
          </template>
        </div>
      </div>

      <p class="sr-only" aria-live="polite">{{ announcement }}</p>

      <!-- Results -->
      <section
        v-if="summary && (phase === 'cleared' || phase === 'failed')"
        aria-labelledby="rt-summary-title"
        class="mt-6 rounded-2xl border border-[var(--bn-border)] bg-white p-6 text-[var(--bn-navy)]"
      >
        <h3 id="rt-summary-title" class="bn-font-display text-2xl font-bold">
          Level {{ level.id }} results
        </h3>

        <dl class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div class="rounded-2xl bg-[var(--bn-success-bg)] p-4">
            <dt class="text-base text-[var(--bn-muted)]">Tiles caught</dt>
            <dd class="text-2xl font-bold">{{ summary.caught }} of {{ summary.total }}</dd>
          </div>
          <div class="rounded-2xl bg-[var(--bn-success-bg)] p-4">
            <dt class="text-base text-[var(--bn-muted)]">Accuracy</dt>
            <dd class="text-2xl font-bold">{{ summary.accuracy }}%</dd>
          </div>
          <div class="rounded-2xl bg-[var(--bn-success-bg)] p-4">
            <dt class="text-base text-[var(--bn-muted)]">Best streak</dt>
            <dd class="text-2xl font-bold">{{ summary.bestStreak }}</dd>
          </div>
          <div class="rounded-2xl bg-[var(--bn-success-bg)] p-4">
            <dt class="text-base text-[var(--bn-muted)]">Misses</dt>
            <dd class="text-2xl font-bold">{{ summary.total - summary.caught }}</dd>
          </div>
        </dl>

        <p v-if="timingMessage" class="mt-4 text-lg">{{ timingMessage }}</p>
        <p class="mt-4 text-lg text-[var(--bn-muted)]">
          Short, daily sessions work best. Consider sharing these results with your therapist or
          care team.
        </p>
      </section>
    </div>
  </div>
</template>

<style scoped>
  .rt-popup {
    animation: rtPopup 0.7s ease-out forwards;
  }

  @keyframes rtPopup {
    0% {
      opacity: 0;
      transform: translateY(8px) scale(0.9);
    }
    15%,
    65% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-16px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .rt-popup {
      animation: none;
    }
  }
</style>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

interface GameColor {
  id: string
  name: string
  hex: string
}

type Phase =
  | 'idle'
  | 'waiting'
  | 'choosing'
  | 'matched'
  | 'paused'
  | 'finished'

type ActivePhase = 'waiting' | 'choosing' | 'matched'

const COLORS: GameColor[] = [
  { id: 'blue', name: 'Blue', hex: '#3b82f6' },
  { id: 'orange', name: 'Orange', hex: '#f97316' },
  { id: 'purple', name: 'Purple', hex: '#7c3aed' },
  { id: 'green', name: 'Green', hex: '#22c55e' },
  { id: 'pink', name: 'Pink', hex: '#ec4899' },
  { id: 'teal', name: 'Teal', hex: '#14b8a6' },
  { id: 'red', name: 'Red', hex: '#ef4444' },
  { id: 'navy', name: 'Navy', hex: '#1e3a5f' },
  { id: 'sky', name: 'Sky', hex: '#38bdf8' },
]

const levels = Array.from({ length: 7 }, (_, index) => ({
  id: index + 1,
  count: index + 2,
  shuffle: index > 0,
}))

const TOTAL_ROUNDS = 10
const MIN_WAIT_MS = 1500
const MAX_WAIT_MS = 3000
const MATCH_FEEDBACK_MS = 1200

const selectedLevel = ref(1)
const phase = ref<Phase>('idle')
const round = ref(0)
const sessionColors = ref<GameColor[]>([])
const tiles = ref<GameColor[]>([])
const target = ref<GameColor | null>(null)

const message = ref('')
const wrongTile = ref('')
const roundHadError = ref(false)
const cleanRounds = ref(0)

const showTiming = ref(false)
const lastResponseMs = ref<number | null>(null)
const responseTimes = ref<number[]>([])

const board = ref<HTMLDivElement | null>(null)
const resumeButton = ref<HTMLButtonElement | null>(null)
const resultHeading = ref<HTMLHeadingElement | null>(null)

let timer: ReturnType<typeof setTimeout> | undefined
let version = 0
let targetShownAt: number | null = null
let pausedPhase: ActivePhase = 'waiting'

const level = computed(
  () => levels.find((option) => option.id === selectedLevel.value)!,
)

const active = computed(
  () =>
    phase.value === 'waiting' ||
    phase.value === 'choosing' ||
    phase.value === 'matched',
)

const targetVisible = computed(
  () => phase.value === 'choosing' || phase.value === 'matched',
)

const completedRounds = computed(() => {
  if (phase.value === 'finished') return TOTAL_ROUNDS
  if (phase.value === 'idle') return 0

  const showingCompletedRound =
    phase.value === 'matched' ||
    (phase.value === 'paused' && pausedPhase === 'matched')

  return round.value - (showingCompletedRound ? 0 : 1)
})

const gridClass = computed(() => {
  if (level.value.count <= 4) return 'grid-cols-2'
  if (level.value.count <= 6) return 'grid-cols-2 sm:grid-cols-3'
  return 'grid-cols-2 sm:grid-cols-4'
})

const averageResponseMs = computed(() => {
  if (!responseTimes.value.length) return null

  return (
    responseTimes.value.reduce((total, value) => total + value, 0) /
    responseTimes.value.length
  )
})

const announcement = computed(() => {
  if (phase.value === 'waiting') {
    return message.value || 'Get ready. Wait for the color.'
  }

  if (phase.value === 'choosing') {
    return message.value || `Choose ${target.value?.name}.`
  }

  if (phase.value === 'matched') {
    return showTiming.value && lastResponseMs.value !== null
      ? `Matched. Response time ${seconds(lastResponseMs.value)} seconds.`
      : 'Matched!'
  }

  if (phase.value === 'paused') return 'Paused.'
  return ''
})

const primaryClass =
  'inline-flex min-h-[56px] items-center justify-center rounded-2xl bg-[var(--bn-navy)] px-6 py-3 text-lg font-semibold text-white focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none'

const quietClass =
  'inline-flex min-h-[56px] items-center justify-center rounded-2xl border-2 border-slate-300 bg-white px-5 py-3 text-lg font-semibold text-[var(--bn-navy)] hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none'

function seconds(ms: number): string {
  return (ms / 1000).toFixed(2)
}

function shuffled<T>(items: readonly T[]): T[] {
  const result = [...items]

  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    const saved = result[index]!
    result[index] = result[other]!
    result[other] = saved
  }

  return result
}

function clearTimer() {
  clearTimeout(timer)
  timer = undefined
}

function reset() {
  version++
  clearTimer()

  phase.value = 'idle'
  round.value = 0
  sessionColors.value = []
  tiles.value = []
  target.value = null
  message.value = ''
  wrongTile.value = ''
  roundHadError.value = false
  cleanRounds.value = 0
  lastResponseMs.value = null
  responseTimes.value = []
  targetShownAt = null
}

function chooseLevel(id: number) {
  reset()
  selectedLevel.value = id
}

function scheduleReveal() {
  clearTimer()

  const currentVersion = version
  const delay =
    MIN_WAIT_MS + Math.random() * (MAX_WAIT_MS - MIN_WAIT_MS)

  timer = setTimeout(async () => {
    if (currentVersion !== version || phase.value !== 'waiting') return

    message.value = ''
    phase.value = 'choosing'

    await nextTick()

    if (currentVersion !== version || phase.value !== 'choosing') return

    targetShownAt = performance.now()
  }, delay)
}

async function prepareRound() {
  version++
  clearTimer()

  const currentVersion = version

  if (level.value.shuffle) {
    const nextTiles = shuffled(sessionColors.value)
    const unchanged = nextTiles.every(
      (tile, index) => tile.id === tiles.value[index]?.id,
    )

    tiles.value = unchanged
      ? [...nextTiles.slice(1), nextTiles[0]!]
      : nextTiles
  } else {
    tiles.value = [...sessionColors.value]
  }

  target.value =
    sessionColors.value[
      Math.floor(Math.random() * sessionColors.value.length)
    ]!

  message.value = ''
  wrongTile.value = ''
  roundHadError.value = false
  targetShownAt = null
  phase.value = 'waiting'

  await nextTick()

  if (currentVersion !== version || phase.value !== 'waiting') return

  board.value?.focus({ preventScroll: true })
  scheduleReveal()
}

function start() {
  reset()
  sessionColors.value = shuffled(COLORS).slice(0, level.value.count)
  round.value = 1
  void prepareRound()
}

async function finish() {
  phase.value = 'finished'

  await nextTick()
  resultHeading.value?.focus({ preventScroll: true })
}

function scheduleNext() {
  clearTimer()
  const currentVersion = version

  timer = setTimeout(() => {
    if (currentVersion !== version || phase.value !== 'matched') return

    if (round.value === TOTAL_ROUNDS) {
      void finish()
    } else {
      round.value++
      void prepareRound()
    }
  }, MATCH_FEEDBACK_MS)
}

function chooseTile(tile: GameColor) {
  if (phase.value === 'waiting') {
    message.value = 'Wait for the color to appear.'
    return
  }

  if (phase.value !== 'choosing' || !target.value) return

  if (tile.id !== target.value.id) {
    wrongTile.value = tile.id
    roundHadError.value = true
    message.value = 'Not quite. Choose the matching color.'
    return
  }

  lastResponseMs.value = null

  if (!roundHadError.value) {
    cleanRounds.value++

    if (targetShownAt !== null) {
      const elapsed = Math.max(0, performance.now() - targetShownAt)
      lastResponseMs.value = elapsed
      responseTimes.value.push(elapsed)
    }
  }

  wrongTile.value = ''
  message.value = ''
  targetShownAt = null
  phase.value = 'matched'
  scheduleNext()
}

async function pause(moveFocus = true) {
  if (!active.value) return

  pausedPhase = phase.value as ActivePhase
  version++
  clearTimer()
  targetShownAt = null
  phase.value = 'paused'

  if (moveFocus) {
    await nextTick()
    resumeButton.value?.focus({ preventScroll: true })
  }
}

async function resume() {
  if (phase.value !== 'paused') return

  phase.value = pausedPhase
  message.value = ''

  if (pausedPhase === 'waiting') scheduleReveal()
  if (pausedPhase === 'matched') scheduleNext()

  await nextTick()
  board.value?.focus({ preventScroll: true })
}

function nextLevel() {
  if (selectedLevel.value >= levels.length) return

  chooseLevel(selectedLevel.value + 1)
  start()
}

function onVisibilityChange() {
  if (document.hidden) void pause(false)
}

onMounted(() => {
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onBeforeUnmount(() => {
  version++
  clearTimer()
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <div>
    <h2 class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">
      Choose a level
    </h2>

    <p class="mt-1 text-lg text-[var(--bn-muted)]">
      You can change this any time.
    </p>

    <div
      class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4"
      role="group"
      aria-label="Difficulty level"
    >
      <button
        v-for="option in levels"
        :key="option.id"
        type="button"
        class="min-h-[72px] rounded-2xl border-2 p-4 text-left transition-colors focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
        :class="
          selectedLevel === option.id
            ? 'border-orange-700 bg-[var(--bn-peach)]'
            : 'border-slate-300 bg-white hover:bg-slate-50'
        "
        :aria-pressed="selectedLevel === option.id"
        @click="chooseLevel(option.id)"
      >
        <span class="block text-lg font-bold text-[var(--bn-navy)]">
          Level {{ option.id }}
        </span>

        <span class="block text-lg text-[var(--bn-muted)]">
          {{ option.count }} colors
        </span>

        <span class="mt-1 block text-base text-[var(--bn-muted)]">
          {{ option.shuffle ? 'Changing positions' : 'Fixed positions' }}
        </span>
      </button>
    </div>

    <section
      class="mt-6 rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 sm:p-10"
      aria-labelledby="reaction-color-title"
    >
      <h2
        id="reaction-color-title"
        class="text-lg font-bold tracking-wide text-orange-800 uppercase"
      >
        Try it now — interactive
      </h2>

      <p class="mt-3 text-lg leading-relaxed text-[var(--bn-navy)] sm:text-xl">
        Wait for the large panel to show a color, then select the matching tile.
      </p>

      <p class="mt-2 text-lg text-[var(--bn-muted)]">
        The color stays until you match it. There is no time limit.
      </p>

      <!-- Available before, during, and after a session -->
      <label
        class="mt-5 inline-flex min-h-[56px] cursor-pointer items-center gap-3 text-lg font-semibold text-[var(--bn-navy)]"
      >
        <input
          v-model="showTiming"
          type="checkbox"
          class="size-6 accent-[var(--bn-navy)] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--bn-navy)]"
        />
        Show response time
      </label>

      <!-- Ready screen -->
      <div
        v-if="phase === 'idle'"
        class="mt-5 rounded-2xl border border-[var(--bn-border)] bg-white p-6 text-center sm:p-8"
      >
        <div
          class="mx-auto grid max-w-[240px] grid-cols-3 gap-3"
          aria-hidden="true"
        >
          <div
            v-for="color in COLORS.slice(0, 6)"
            :key="color.id"
            class="h-16 rounded-xl"
            :style="{ backgroundColor: color.hex }"
          />
        </div>

        <h3 class="bn-font-display mt-6 text-2xl font-bold text-[var(--bn-navy)]">
          Ready to match?
        </h3>

        <p class="mt-3 text-lg text-[var(--bn-muted)]">
          {{ TOTAL_ROUNDS }} rounds · {{ level.count }} color choices
        </p>

        <button
          type="button"
          :class="[primaryClass, 'mt-6 w-full sm:w-auto']"
          @click="start"
        >
          Start
        </button>
      </div>

      <!-- Gameplay -->
      <template v-else-if="phase !== 'finished'">
        <div class="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p class="text-lg font-semibold text-[var(--bn-navy)]">
            Round {{ round }} of {{ TOTAL_ROUNDS }}
          </p>

          <div class="flex flex-wrap gap-3">
            <button
              v-if="active"
              type="button"
              :class="quietClass"
              @click="pause()"
            >
              Pause
            </button>

            <button type="button" :class="quietClass" @click="reset">
              Reset
            </button>
          </div>
        </div>

        <!-- Full-color target -->
        <div
          class="mt-5 flex min-h-[200px] items-center justify-center rounded-2xl border border-black/15 p-6 text-center sm:min-h-[240px]"
          :style="{
            backgroundColor: targetVisible ? target?.hex : '#ffffff',
          }"
        >
          <div v-if="phase === 'paused'">
            <p class="bn-font-display text-3xl font-bold text-[var(--bn-navy)]">
              Paused
            </p>

            <button
              ref="resumeButton"
              type="button"
              :class="[primaryClass, 'mt-5']"
              @click="resume"
            >
              Resume
            </button>
          </div>

          <div v-else-if="phase === 'waiting'">
            <p class="bn-font-display text-3xl font-bold text-[var(--bn-navy)]">
              Get ready…
            </p>

            <p class="mt-3 text-lg text-[var(--bn-muted)]">
              Wait for the color
            </p>
          </div>

          <div
            v-else
            class="rounded-2xl bg-white px-6 py-4 text-[var(--bn-navy)]"
          >
            <p class="text-lg">
              {{ phase === 'matched' ? '✓ Matched!' : 'Match this color' }}
            </p>

            <p class="mt-1 text-3xl font-bold sm:text-4xl">
              {{ target?.name }}
            </p>

            <p
              v-if="
                showTiming &&
                phase === 'matched' &&
                lastResponseMs !== null
              "
              class="mt-3 text-xl font-semibold tabular-nums"
            >
              {{ seconds(lastResponseMs) }} s
            </p>
          </div>
        </div>

        <!-- Color choices -->
        <div
          ref="board"
          tabindex="-1"
          role="group"
          aria-label="Color choices"
          class="mt-5 grid gap-3 rounded-2xl focus:outline-none sm:gap-4"
          :class="gridClass"
        >
          <button
            v-for="tile in tiles"
            :key="tile.id"
            type="button"
            class="relative flex min-h-[104px] items-center justify-center rounded-2xl border-2 border-black/15 p-3 focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none sm:min-h-[120px]"
            :style="{ backgroundColor: tile.hex }"
            :aria-label="tile.name"
            :aria-disabled="phase !== 'choosing'"
            @click="chooseTile(tile)"
          >
            <span
              class="rounded-xl bg-white px-3 py-2 text-lg font-bold text-[var(--bn-navy)]"
            >
              {{
                phase === 'matched' && target?.id === tile.id
                  ? `✓ ${tile.name}`
                  : tile.name
              }}
            </span>

            <span
              v-if="wrongTile === tile.id"
              class="absolute bottom-1 rounded-md bg-white px-2 text-sm font-semibold text-[var(--bn-navy)]"
              aria-hidden="true"
            >
              Try again
            </span>
          </button>
        </div>

        <p
          class="mt-4 min-h-[56px] text-center text-lg text-[var(--bn-navy)]"
          aria-hidden="true"
        >
          {{ message }}
        </p>

        <!-- Optional timing: stays visible between rounds -->
        <div
          v-if="showTiming"
          class="mb-5 grid grid-cols-2 gap-3 rounded-2xl border border-[var(--bn-border)] bg-white p-4 text-center"
        >
          <div>
            <p class="text-base text-[var(--bn-muted)]">
              Last response
            </p>

            <p class="mt-1 text-xl font-bold text-[var(--bn-navy)] tabular-nums">
              {{
                lastResponseMs !== null
                  ? `${seconds(lastResponseMs)} s`
                  : '—'
              }}
            </p>
          </div>

          <div>
            <p class="text-base text-[var(--bn-muted)]">
              Average
            </p>

            <p class="mt-1 text-xl font-bold text-[var(--bn-navy)] tabular-nums">
              {{
                averageResponseMs !== null
                  ? `${seconds(averageResponseMs)} s`
                  : '—'
              }}
            </p>
          </div>
        </div>

        <div
          class="flex flex-wrap justify-center gap-2"
          role="img"
          :aria-label="`${completedRounds} of ${TOTAL_ROUNDS} rounds completed`"
        >
          <span
            v-for="number in TOTAL_ROUNDS"
            :key="number"
            class="size-3 rounded-full"
            :class="
              number <= completedRounds
                ? 'bg-[var(--bn-navy)]'
                : 'border border-slate-400 bg-white'
            "
            aria-hidden="true"
          />
        </div>
      </template>

      <!-- Results -->
      <div
        v-else
        class="mt-5 rounded-2xl border border-[var(--bn-border)] bg-white p-6 sm:p-8"
      >
        <h3
          ref="resultHeading"
          tabindex="-1"
          class="bn-font-display text-3xl font-bold text-[var(--bn-navy)] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[var(--bn-navy)]"
        >
          Session complete
        </h3>

        <p class="mt-4 text-xl text-[var(--bn-navy)]">
          You matched all {{ TOTAL_ROUNDS }} colors.
        </p>

        <p class="mt-2 text-lg text-[var(--bn-muted)]">
          {{ cleanRounds }} rounds completed without a retry.
        </p>

        <div
          v-if="showTiming"
          class="mt-5 rounded-2xl bg-[var(--bn-cream)] p-5"
        >
          <p class="text-lg text-[var(--bn-muted)]">
            Average response time
          </p>

          <p class="mt-2 text-3xl font-bold text-[var(--bn-navy)] tabular-nums">
            {{
              averageResponseMs !== null
                ? `${seconds(averageResponseMs)} s`
                : '—'
            }}
          </p>

          <p class="mt-3 text-base text-[var(--bn-muted)]">
            Based on {{ responseTimes.length }} uninterrupted rounds matched
            without a retry. Waiting time is excluded. Reading and selecting
            a tile are included.
          </p>
        </div>

        <div class="mt-6 flex flex-wrap gap-3">
          <button type="button" :class="primaryClass" @click="start">
            Play again
          </button>

          <button
            v-if="selectedLevel < levels.length"
            type="button"
            :class="quietClass"
            @click="nextLevel"
          >
            Try Level {{ selectedLevel + 1 }}
          </button>

          <button type="button" :class="quietClass" @click="reset">
            Finish
          </button>
        </div>
      </div>

      <p class="sr-only" role="status" aria-atomic="true">
        {{ announcement }}
      </p>
    </section>
  </div>
</template>
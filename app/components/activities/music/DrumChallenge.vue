<script setup lang="ts">
  // One go (10 turns) of a thinking challenge on the chosen drum:
  //   Copy me           – memory: watch a pattern, then tap it back in order.
  //   Follow the lights – attention: tap the part that lights up before it fades.
  //   Name that sound   – listening: hear a sound, tap the part that made it.
  // Mistakes are never punished: the right answer is shown gently and the next
  // turn gets a little easier.
  import DrumPicture from './DrumPicture.vue'
  import { areaForKey, findDrum, playDrumSound, startDrumAudio, type DrumId } from '~/utils/drumKit'
  import {
    COPY_RULES,
    LIGHT_RULES,
    SUGGEST_NEXT_AT,
    TURNS,
    emptyStats,
    nextCopyLength,
    nextLightTime,
    randomPart,
    randomPattern,
    summaryLines,
    type ChallengeMode,
  } from '~/utils/drumChallenge'

  const props = defineProps<{ drumId: DrumId; mode: ChallengeMode }>()
  const emit = defineEmits<{ 'next-level': []; 'free-play': [] }>()

  type Phase = 'ready' | 'showing' | 'answer' | 'feedback' | 'done'
  /** Special answers from the "Show me again" / "Hear it again" buttons. */
  const REPLAY = '__replay__'

  const drum = computed(() => findDrum(props.drumId)!)
  const ids = computed(() => drum.value.areas.map((a) => a.id))
  const labelOf = (id: string) => drum.value.areas.find((a) => a.id === id)?.label ?? id

  const phase = ref<Phase>('ready')
  const turn = ref(0)
  const message = ref('')
  const lit = ref<string[]>([])
  const cue = ref<string[]>([])
  const good = ref<string[]>([])
  const stats = ref(emptyStats())
  const copyLength = ref(COPY_RULES.start)
  const copyProgress = ref(0)
  const lightMs = ref(LIGHT_RULES.startMs)
  // Correct answers in a row, used to make the next turn harder.
  let copyStreak = 0
  let lightStreak = 0
  const soundAvailable = ref(true)

  const TITLES: Record<ChallengeMode, string> = {
    copy: 'Copy me',
    lights: 'Follow the lights',
    sounds: 'Name that sound',
  }
  const INTROS: Record<ChallengeMode, string> = {
    copy: 'The drum will play a short pattern. Watch and listen, then tap the same parts in the same order. Patterns get longer as you go.',
    lights:
      'One part of the drum will glow. Tap it before the glow fades. The glow gets shorter as you get quicker.',
    sounds:
      'First, meet the sounds. Then you will hear one sound at a time. Tap the part that made it.',
  }

  // ---- Small helpers --------------------------------------------------------

  let runId = 0
  const timers = new Set<ReturnType<typeof setTimeout>>()
  let answerResolver: ((area: string | null) => void) | null = null

  /** Waits ms; resolves false if the go was stopped meanwhile. */
  function wait(ms: number, id: number): Promise<boolean> {
    return new Promise((resolve) => {
      const t = setTimeout(() => {
        timers.delete(t)
        resolve(id === runId)
      }, ms)
      timers.add(t)
    })
  }

  /** Waits for the patient's next tap (or a replay button). Null on timeout or stop. */
  function nextAnswer(timeoutMs?: number): Promise<string | null> {
    return new Promise((resolve) => {
      let t: ReturnType<typeof setTimeout> | undefined
      answerResolver = (area) => {
        if (t) {
          clearTimeout(t)
          timers.delete(t)
        }
        answerResolver = null
        resolve(area)
      }
      if (timeoutMs !== undefined) {
        t = setTimeout(() => answerResolver?.(null), timeoutMs)
        timers.add(t)
      }
    })
  }

  function flash(list: typeof lit, area: string, ms: number) {
    list.value = [...list.value.filter((a) => a !== area), area]
    const t = setTimeout(() => {
      timers.delete(t)
      list.value = list.value.filter((a) => a !== area)
    }, ms)
    timers.add(t)
  }

  function sound(area: string) {
    const s = drum.value.areas.find((a) => a.id === area)?.sound
    if (s) playDrumSound(s)
  }

  /** Lights a part and plays its sound, as part of showing something to the patient. */
  async function demo(area: string, id: number, holdMs = 650) {
    cue.value = [area]
    sound(area)
    const ok = await wait(holdMs, id)
    cue.value = []
    return ok
  }

  // ---- Patient input ----------------------------------------------------------

  /** A tap on the drum. It always sounds; it only counts as an answer during the patient's turn. */
  function onHit(area: string) {
    if (phase.value !== 'answer') return
    sound(area)
    flash(lit, area, 160)
    answerResolver?.(area)
  }

  function replay() {
    if (phase.value === 'answer') answerResolver?.(REPLAY)
  }

  function onKeydown(e: KeyboardEvent) {
    const area = areaForKey(drum.value, e.code)
    if (!area) return
    e.preventDefault()
    if (!e.repeat) onHit(area)
  }

  // ---- The three challenges ---------------------------------------------------

  async function showPattern(pattern: string[], id: number) {
    phase.value = 'showing'
    message.value = 'Watch and listen…'
    copyProgress.value = 0
    if (!(await wait(700, id))) return false
    for (const area of pattern) {
      if (!(await demo(area, id))) return false
      if (!(await wait(COPY_RULES.gapMs - 650, id))) return false
    }
    return true
  }

  async function copyTurn(id: number) {
    const pattern = randomPattern(ids.value, copyLength.value)
    if (!(await showPattern(pattern, id))) return
    const n = pattern.length
    let correct = true
    let i = 0
    phase.value = 'answer'
    message.value = `Your turn: tap ${n === 1 ? 'the part' : `the ${n} parts in order`}.`
    while (i < n) {
      const area = await nextAnswer()
      if (id !== runId || area === null) return
      if (area === REPLAY) {
        if (!(await showPattern(pattern, id))) return
        phase.value = 'answer'
        message.value = `Your turn: tap ${n === 1 ? 'the part' : `the ${n} parts in order`}.`
        i = 0
        continue
      }
      if (area !== pattern[i]) {
        correct = false
        break
      }
      i++
      copyProgress.value = i
    }

    phase.value = 'feedback'
    if (correct) {
      stats.value.correct++
      stats.value.longest = Math.max(stats.value.longest, n)
      message.value = n === 1 ? 'Well done!' : `Well done — you remembered all ${n}!`
      pattern.forEach((a) => flash(good, a, 1100))
      await wait(1300, id)
    } else {
      message.value = 'Not quite. Here it is again.'
      await wait(600, id)
      for (const area of pattern) {
        if (!(await demo(area, id, 550))) return
        if (!(await wait(250, id))) return
      }
      await wait(500, id)
    }
    const next = nextCopyLength(copyLength.value, copyStreak, correct)
    copyLength.value = next.value
    copyStreak = next.streak
  }

  async function lightsTurn(id: number, previous?: string) {
    phase.value = 'showing'
    message.value = 'Get ready…'
    if (!(await wait(900, id))) return previous
    const target = randomPart(ids.value, previous)
    cue.value = [target]
    phase.value = 'answer'
    message.value = 'Tap the glowing part.'
    const start = performance.now()
    let caught = false
    for (;;) {
      const left = lightMs.value - (performance.now() - start)
      const area = left > 0 ? await nextAnswer(left) : null
      if (id !== runId) return target
      if (area === null) break
      if (area === target) {
        caught = true
        break
      }
      message.value = 'Try the glowing one.'
    }
    cue.value = []
    phase.value = 'feedback'
    if (caught) {
      stats.value.correct++
      stats.value.reactionMs.push(performance.now() - start)
      message.value = 'Got it!'
      flash(good, target, 900)
    } else {
      message.value = `That one was the ${labelOf(target)}.`
      flash(cue, target, 900)
    }
    await wait(1100, id)
    const next = nextLightTime(lightMs.value, lightStreak, caught)
    lightMs.value = next.value
    lightStreak = next.streak
    return target
  }

  async function meetTheDrum(id: number) {
    phase.value = 'showing'
    for (const a of drum.value.areas) {
      message.value = `This is the ${a.label}.`
      if (!(await demo(a.id, id, 1100))) return false
      if (!(await wait(500, id))) return false
    }
    return true
  }

  async function soundsTurn(id: number, target: string) {
    phase.value = 'showing'
    message.value = 'Listen…'
    if (!(await wait(800, id))) return false
    sound(target)
    if (!(await wait(700, id))) return false
    phase.value = 'answer'
    message.value = 'Which part made that sound?'
    let area: string | null
    for (;;) {
      area = await nextAnswer()
      if (id !== runId || area === null) return false
      if (area !== REPLAY) break
      sound(target)
    }
    phase.value = 'feedback'
    if (area === target) {
      stats.value.correct++
      message.value = `Yes — that's the ${labelOf(target)}!`
      flash(good, target, 1000)
      await wait(1300, id)
      return true
    }
    message.value = `That was the ${labelOf(target)}. Listen…`
    await wait(400, id)
    await demo(target, id, 900)
    await wait(600, id)
    return false
  }

  // ---- Running a go -------------------------------------------------------------

  async function start() {
    stop()
    const id = ++runId
    soundAvailable.value = !!(await startDrumAudio())
    stats.value = emptyStats()
    copyLength.value = COPY_RULES.start
    copyStreak = 0
    lightMs.value = LIGHT_RULES.startMs
    lightStreak = 0
    turn.value = 0

    if (props.mode === 'sounds' && !(await meetTheDrum(id))) return

    let previous: string | undefined
    let repeatSound: string | undefined
    for (let t = 1; t <= TURNS; t++) {
      if (id !== runId) return
      turn.value = t
      if (props.mode === 'copy') {
        await copyTurn(id)
      } else if (props.mode === 'lights') {
        previous = await lightsTurn(id, previous)
      } else {
        // After a wrong answer the same sound comes back once, so it can be learned.
        const target = repeatSound ?? randomPart(ids.value, previous)
        const wasRepeat = repeatSound !== undefined
        const right = await soundsTurn(id, target)
        previous = target
        repeatSound = right || wasRepeat ? undefined : target
      }
    }
    if (id !== runId) return
    phase.value = 'done'
    message.value = ''
  }

  function stop() {
    runId++
    timers.forEach((t) => clearTimeout(t))
    timers.clear()
    answerResolver = null
    cue.value = []
    good.value = []
    lit.value = []
    phase.value = 'ready'
    turn.value = 0
  }

  const summary = computed(() => summaryLines(props.mode, stats.value))
  const suggestNext = computed(() => stats.value.correct >= SUGGEST_NEXT_AT && drum.value.level < 7)
  const answerHint = computed(() => {
    if (props.mode === 'copy' && phase.value === 'answer' && copyLength.value > 1) {
      return `${copyProgress.value} of ${copyLength.value}`
    }
    return ''
  })

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeydown)
    stop()
  })

  const btnBase =
    'inline-flex min-h-14 items-center justify-center rounded-2xl px-6 py-3 text-lg font-semibold focus-visible:ring-4 focus-visible:ring-(--bn-navy) focus-visible:ring-offset-4 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
  const btnPrimary = `${btnBase} bg-orange-700 text-white hover:bg-orange-800`
  const btnQuiet = `${btnBase} border-2 border-slate-400 bg-white text-(--bn-navy) hover:bg-slate-50`
</script>

<template>
  <div>
    <!-- Before starting -->
    <div v-if="phase === 'ready'" class="rounded-2xl border border-(--bn-border) bg-white p-6">
      <h4 class="bn-font-display text-2xl font-bold text-(--bn-navy)">{{ TITLES[mode] }}</h4>
      <p class="mt-2 text-lg leading-relaxed text-(--bn-navy)">{{ INTROS[mode] }}</p>
      <p class="mt-2 text-lg text-(--bn-muted)">
        {{ TURNS }} turns. There is no time pressure to start — take a breath first.
      </p>
      <button
        type="button"
        :class="[btnPrimary, 'mt-4']"
        data-testid="challenge-start"
        @click="start"
      >
        Start
      </button>
    </div>

    <!-- Summary -->
    <div
      v-else-if="phase === 'done'"
      class="rounded-2xl border border-(--bn-border) bg-white p-6 text-(--bn-navy)"
      data-testid="challenge-summary"
    >
      <h4 class="bn-font-display text-2xl font-bold">Well done for finishing!</h4>
      <p v-for="line in summary" :key="line" class="mt-2 text-xl">{{ line }}</p>
      <p v-if="suggestNext" class="mt-3 text-lg font-semibold text-green-800">
        You're ready to try Level {{ drum.level + 1 }}.
      </p>
      <div class="mt-5 flex flex-wrap gap-3">
        <button v-if="suggestNext" type="button" :class="btnPrimary" @click="emit('next-level')">
          Try Level {{ drum.level + 1 }}
        </button>
        <button type="button" :class="suggestNext ? btnQuiet : btnPrimary" @click="start">
          Play again
        </button>
        <button type="button" :class="btnQuiet" @click="emit('free-play')">Free play</button>
      </div>
    </div>

    <!-- During a go -->
    <div v-else class="flex flex-wrap items-center gap-3">
      <span
        class="rounded-2xl border border-(--bn-border) bg-white px-4 py-2 text-lg text-(--bn-navy)"
      >
        Turn <strong>{{ turn || 1 }}</strong> of {{ TURNS }}
      </span>
      <span
        v-if="mode === 'copy'"
        class="rounded-2xl border border-(--bn-border) bg-white px-4 py-2 text-lg text-(--bn-navy)"
      >
        Pattern: <strong>{{ copyLength }}</strong> {{ copyLength === 1 ? 'hit' : 'hits' }}
      </span>
      <div class="ml-auto flex flex-wrap gap-3">
        <button
          v-if="mode === 'copy'"
          type="button"
          :class="btnQuiet"
          :disabled="phase !== 'answer'"
          data-testid="show-again"
          @click="replay"
        >
          Show me again
        </button>
        <button
          v-if="mode === 'sounds'"
          type="button"
          :class="btnQuiet"
          :disabled="phase !== 'answer'"
          data-testid="hear-again"
          @click="replay"
        >
          Hear it again
        </button>
        <button type="button" :class="btnQuiet" data-testid="challenge-stop" @click="stop">
          Stop
        </button>
      </div>
    </div>

    <!-- Instruction -->
    <p
      v-if="phase !== 'ready' && phase !== 'done'"
      class="bn-font-display mt-5 min-h-[2.5em] text-center text-2xl font-bold text-(--bn-navy)"
      aria-live="polite"
      data-testid="challenge-message"
    >
      {{ message }}
      <span v-if="answerHint" class="block text-lg font-normal text-(--bn-muted)">
        {{ answerHint }}
      </span>
    </p>

    <!-- The drum -->
    <div
      class="mx-auto mt-4 max-w-160 rounded-2xl border border-(--bn-border) bg-white p-4"
      data-testid="challenge-stage"
    >
      <DrumPicture
        :drum-id="drumId"
        :lit="lit"
        :cue="cue"
        :good="good"
        :interactive="phase === 'answer'"
        @hit="onHit"
      />
    </div>
    <p v-if="!soundAvailable" class="mt-2 text-center text-lg text-orange-800">
      Sound isn't available in this browser. Copy me and Follow the lights still work.
    </p>
  </div>
</template>

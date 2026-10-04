<script setup lang="ts">
  const isPlaying = ref(false)
  const tempo = ref(72)
  const selectedMood = ref('Calm')
  const currentBeat = ref(0)
  const totalBeats = 8

  const moodOptions = ['Calm', 'Focus', 'Joy', 'Reset']

  const pulseDuration = computed(() => `${60 / tempo.value}s`)

  const tapTimes = ref<number[]>([])
  const tappedBpm = ref<number | null>(null)

  let intervalId: number | null = null

  function handleTap() {
    const now = Date.now()
    const last = tapTimes.value[tapTimes.value.length - 1]

    if (last !== undefined && now - last > 2000) {
      tapTimes.value = []
    }

    tapTimes.value.push(now)
    if (tapTimes.value.length > 8) {
      tapTimes.value = tapTimes.value.slice(-8)
    }

    if (tapTimes.value.length >= 2) {
      const gaps: number[] = []
      for (let i = 1; i < tapTimes.value.length; i++) {
        const prev = tapTimes.value[i - 1]
        const curr = tapTimes.value[i]
        if (prev === undefined || curr === undefined) continue
        gaps.push(curr - prev)
      }
      if (gaps.length > 0) {
        const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length
        tappedBpm.value = Math.round(60000 / avgGap)
      }
    }
  }

  function startTicking() {
    if (intervalId !== null) window.clearInterval(intervalId)
    const pace = Math.max(400, 60000 / tempo.value)
    intervalId = window.setInterval(() => {
      currentBeat.value = (currentBeat.value + 1) % totalBeats
    }, pace)
  }

  watch(tempo, () => {
    if (isPlaying.value) startTicking()
  })

  function stopSession() {
    if (intervalId !== null) {
      window.clearInterval(intervalId)
      intervalId = null
    }
    isPlaying.value = false
    currentBeat.value = 0
  }

  function startSession() {
    stopSession()
    tapTimes.value = []
    tappedBpm.value = null
    isPlaying.value = true
    startTicking()
  }

  function readAloud() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const utterance = new SpeechSynthesisUtterance(
      `Follow the calming rhythm. Breathe in as the circle grows, hold, then release.`
    )
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  onBeforeUnmount(() => {
    stopSession()
  })

  const guideSteps = [
    'Breathe gently and let your shoulders soften before the first pulse.',
    'Match your inhale, hold, and exhale to the rhythm in front of you.',
    'Take a quiet pause after each cycle and notice how your body feels.',
  ]

  const btnBase =
    'inline-flex min-h-[56px] items-center justify-center rounded-2xl px-6 py-3 text-lg font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none'
  const btnPrimary = `${btnBase} bg-orange-700 text-white hover:bg-orange-800`
  const btnQuiet = `${btnBase} border-2 border-slate-400 bg-white text-[var(--bn-navy)] hover:bg-slate-50`
</script>

<template>
  <div class="space-y-6 text-[var(--bn-navy)]">
    <section
      aria-labelledby="rhythm-title"
      class="rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 sm:p-10"
    >
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="rhythm-title" class="bn-font-display text-2xl font-bold sm:text-3xl">
            Follow the calming rhythm
          </h2>
          <p class="mt-2 text-lg leading-relaxed text-[var(--bn-muted)]">
            Watch the circle grow and settle. Match your breath to the pulse.
          </p>
        </div>
        <button type="button" :class="btnQuiet" @click="readAloud">Read aloud</button>
      </div>

      <div class="mt-8 flex flex-col items-center text-center">
        <div
          class="pulse-ring flex size-[220px] items-center justify-center rounded-full border-2 border-[var(--bn-border)] bg-white/70"
          :class="isPlaying ? 'pulse-active' : ''"
          :style="isPlaying ? { animationDuration: pulseDuration } : {}"
          aria-hidden="true"
        >
          <div class="flex size-[62%] flex-col items-center justify-center rounded-full bg-white">
            <span class="bn-font-display text-4xl font-bold">{{ tempo }}</span>
            <span class="text-lg text-[var(--bn-muted)]">BPM</span>
          </div>
        </div>
        <p class="mt-6 text-xl font-semibold">
          {{
            isPlaying
              ? `Beat ${currentBeat + 1} of ${totalBeats}`
              : 'Press start when you are ready'
          }}
        </p>
      </div>

      <div role="group" aria-label="Mood" class="mt-8 flex flex-wrap justify-center gap-3">
        <button
          v-for="mood in moodOptions"
          :key="mood"
          type="button"
          class="min-h-[56px] rounded-full border-2 px-8 py-3 text-lg font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
          :class="
            selectedMood === mood
              ? 'border-[var(--bn-navy)] bg-[var(--bn-navy)] text-white'
              : 'border-[var(--bn-border)] bg-white hover:border-orange-700'
          "
          :aria-pressed="selectedMood === mood"
          @click="selectedMood = mood"
        >
          {{ mood }}
        </button>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section
        aria-label="Tempo and session controls"
        class="rounded-[20px] border border-[var(--bn-border)] bg-white p-6"
      >
        <div class="flex items-center justify-between text-lg">
          <label for="rhythm-tempo" class="font-semibold">Tempo</label>
          <span class="font-bold">{{ tempo }} BPM</span>
        </div>

        <input
          id="rhythm-tempo"
          v-model.number="tempo"
          type="range"
          min="50"
          max="140"
          step="2"
          class="mt-4 h-3 w-full cursor-pointer accent-orange-700"
          :aria-valuetext="`${tempo} beats per minute`"
        />

        <div class="mt-2 flex justify-between text-lg text-[var(--bn-muted)]" aria-hidden="true">
          <span>Slow</span>
          <span>Steady</span>
          <span>Energetic</span>
        </div>

        <div class="mt-6 flex flex-wrap gap-3">
          <button type="button" :class="btnPrimary" @click="startSession">
            {{ isPlaying ? 'Restart session' : 'Start session' }}
          </button>
          <button type="button" :class="btnQuiet" @click="stopSession">Pause</button>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" :class="btnQuiet" @click="handleTap">Tap along</button>
          <p aria-live="polite" class="text-lg text-[var(--bn-muted)]">
            <template v-if="tappedBpm">
              Your tempo: <span class="font-bold text-[var(--bn-navy)]">{{ tappedBpm }}</span> BPM
            </template>
          </p>
        </div>
      </section>

      <section
        aria-labelledby="rhythm-guide-title"
        class="rounded-[20px] border border-[var(--bn-border)] bg-white p-6"
      >
        <h3
          id="rhythm-guide-title"
          class="text-lg font-bold tracking-wide text-[var(--bn-muted)] uppercase"
        >
          Session guide
        </h3>
        <ol class="mt-4 list-none space-y-4 p-0">
          <li v-for="(step, index) in guideSteps" :key="step" class="flex items-start gap-3">
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--bn-success-bg)] text-lg font-bold"
              aria-hidden="true"
            >
              {{ index + 1 }}
            </span>
            <p class="text-lg leading-relaxed text-[var(--bn-muted)]">{{ step }}</p>
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>

<style scoped>
  .pulse-ring {
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  .pulse-active {
    animation-name: pulseGlow;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }

  @keyframes pulseGlow {
    0%,
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 rgba(194, 65, 12, 0);
    }
    50% {
      transform: scale(1.06);
      box-shadow: 0 0 30px rgba(194, 65, 12, 0.3);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pulse-active {
      animation: none;
    }
  }
</style>

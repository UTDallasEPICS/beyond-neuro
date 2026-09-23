<script setup lang="ts">
const isPlaying = ref(false)
const tempo = ref(72)
const selectedMood = ref('Calm')
const currentBeat = ref(0)
const totalBeats = 8

const moodOptions = ['Calm', 'Focus', 'Joy', 'Reset']

const pulseDuration = computed(() => `${60 / tempo.value}s`)

const navItems = [
  { label: 'Home', icon: 'i-lucide-home' },
  { label: 'Exercises', icon: 'i-lucide-footprints', active: true },
  { label: 'My Progress', icon: 'i-lucide-line-chart' },
  { label: 'Learn', icon: 'i-lucide-book-open' },
  { label: 'Caregiver Corner', icon: 'i-lucide-map-pin' },
]

const pulseLabel = computed(() => `${tempo.value} `)

const tapTimes = ref<number[]>([])
const tappedBpm = ref<number | null>(null)

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

watch(tempo, (newTempo) => {
  if (!isPlaying.value) return
  if (intervalId !== null) window.clearInterval(intervalId)
  const pace = Math.max(400, 60000 / newTempo)
  intervalId = window.setInterval(() => {
    currentBeat.value = (currentBeat.value + 1) % totalBeats
  }, pace)
})

let intervalId: number | null = null

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
  const pace = Math.max(400, 60000 / tempo.value)
  intervalId = window.setInterval(() => {
    currentBeat.value = (currentBeat.value + 1) % totalBeats
  }, pace)
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
</script>

<template>
  <div class="app-shell flex min-h-screen">
    <!-- Sidebar -->
    <aside class="flex w-64 shrink-0 flex-col bg-[#1E1B4B] p-5 text-white">
      <div class="flex items-center gap-2 px-2 py-3">
        <img
          src="../assets/images/BeyondNeuro_Color_White.png"
          alt="Beyond Neuro Logo"
          class="h-6 w-auto"
        />
      </div>

      <nav class="mt-6 flex flex-col gap-1">
        <button
          v-for="item in navItems"
          :key="item.label"
          type="button"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
          :class="
            item.active
              ? 'bg-white text-[#1E1B4B]'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          "
        >
          <UIcon :name="item.icon" class="h-4 w-4" />
          {{ item.label }}
        </button>
      </nav>

      <div class="mt-auto rounded-2xl bg-white/10 p-4">
        <p class="text-sm font-bold text-emerald-300">Take your time</p>
        <p class="mt-1 text-xs leading-5 text-slate-300">
          Pause whenever you need. Your progress is saved.
        </p>
      </div>
    </aside>

    <main class="flex-1 bg-[#FBEEE0] px-10 py-8">
      <header class="mb-6 flex items-start justify-between gap-4">
        <div>
          <p class="text-sm font-semibold tracking-[0.2em] text-emerald-600 uppercase">
            Music Therapy · Rhythm Exercise
          </p>
          <h1 class="mt-2 font-['Georgia'] text-4xl font-black tracking-tight text-[#1E1B4B]">
            Follow the calming rhythm
          </h1>
          <p class="mt-2 max-w-xl text-slate-600">
            Watch the circle grow and settle. Match your breath to the pulse below.
          </p>
        </div>

        <UButton
          color="neutral"
          variant="outline"
          size="lg"
          class="shrink-0 rounded-full bg-white"
          icon="i-lucide-volume-2"
          @click="readAloud"
        >
          Read aloud
        </UButton>
      </header>

      <section class="rounded-3xl bg-[#EAE6FB] p-10 shadow-sm">
        <div class="flex flex-col items-center text-center">
          <div
            class="pulse-ring flex items-center justify-center rounded-full border border-[#c9c0f5] bg-white/60"
            :class="isPlaying ? 'pulse-active' : ''"
            :style="isPlaying ? { animationDuration: pulseDuration } : {}"
          >
            <div
              class="pulse-core rounded-full bg-white text-center font-['Georgia'] text-3xl font-black text-[#1E1B4B]"
            >
              {{ pulseLabel }}
            </div>
          </div>
          <p class="mt-6 text-slate-500">
            {{
              isPlaying
                ? `Beat ${currentBeat + 1} of ${totalBeats}`
                : 'Press start when you are ready'
            }}
          </p>
        </div>

        <div class="mt-10 flex flex-wrap justify-center gap-4">
          <button
            v-for="mood in moodOptions"
            :key="mood"
            type="button"
            class="rounded-full border px-8 py-3 text-base font-semibold transition"
            :class="
              selectedMood === mood
                ? 'border-[#1E1B4B] bg-white text-[#1E1B4B]'
                : 'border-transparent bg-white/70 text-slate-500 hover:bg-white'
            "
            @click="selectedMood = mood"
          >
            {{ mood }}
          </button>
        </div>
      </section>

      <section class="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div class="rounded-3xl border border-black/5 bg-white p-6">
          <div class="flex items-center justify-between text-sm text-slate-500">
            <span>Tempo</span>
            <span class="font-semibold text-[#1E1B4B]">{{ tempo }} BPM</span>
          </div>

          <input
            v-model.number="tempo"
            type="range"
            min="50"
            max="140"
            step="2"
            class="mt-4 h-2 w-full cursor-pointer accent-emerald-500"
          />

          <div class="mt-2 flex justify-between text-xs text-slate-400">
            <span>Slow</span>
            <span>Steady</span>
            <span>Energetic</span>
          </div>

          <div class="mt-6 flex gap-3">
            <UButton color="primary" size="lg" class="rounded-full" @click="startSession">
              {{ isPlaying ? 'Restart session' : 'Start session' }}
            </UButton>
            <UButton
              color="neutral"
              variant="soft"
              size="lg"
              class="rounded-full"
              @click="stopSession"
            >
              Pause
            </UButton>
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="rounded-full border border-[#1E1B4B] px-6 py-2.5 text-sm font-semibold text-[#1E1B4B] transition hover:bg-[#1E1B4B] hover:text-white"
              @click="handleTap"
            >
              Tap along
            </button>

            <span v-if="tappedBpm" class="text-sm text-slate-500">
              Your tempo: <span class="font-semibold text-[#1E1B4B]">{{ tappedBpm }}</span> bpm
            </span>
          </div>
        </div>

        <div class="rounded-3xl border border-black/5 bg-white p-6">
          <p class="text-sm tracking-[0.15em] text-slate-400 uppercase">Session guide</p>
          <div class="mt-4 space-y-3">
            <div class="flex items-start gap-3">
              <div
                class="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700"
              >
                1
              </div>
              <p class="text-sm leading-6 text-slate-600">
                Breathe gently and let your shoulders soften before the first pulse.
              </p>
            </div>
            <div class="flex items-start gap-3">
              <div
                class="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700"
              >
                2
              </div>
              <p class="text-sm leading-6 text-slate-600">
                Match your inhale, hold, and exhale to the rhythm line in front of you.
              </p>
            </div>
            <div class="flex items-start gap-3">
              <div
                class="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700"
              >
                3
              </div>
              <p class="text-sm leading-6 text-slate-600">
                Take a quiet pause after each cycle and notice how your body feels.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.pulse-ring {
  width: 220px;
  height: 220px;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.pulse-active {
  animation-name: pulseGlow;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

.pulse-core {
  width: 62%;
  height: 62%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes pulseGlow {
  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 rgba(52, 211, 153, 0);
  }
  50% {
    transform: scale(1.06);
    box-shadow: 0 0 30px rgba(52, 211, 153, 0.35);
  }
}
</style>
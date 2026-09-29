<script setup lang="ts">
const navItems = [
  { label: 'Home', icon: 'i-lucide-home' },
  { label: 'Exercises', icon: 'i-lucide-footprints', active: true },
  { label: 'My Progress', icon: 'i-lucide-line-chart' },
  { label: 'Learn', icon: 'i-lucide-book-open' },
  { label: 'Caregiver Corner', icon: 'i-lucide-map-pin' },
]


type LyricLine = { text: string; time: number | null }

const songTitle = ref('')
const artistName = ref('')
const lines = ref<LyricLine[]>([])
const stage = ref<'setup' | 'syncing' | 'playing'>('setup')

const audioFile = ref<File | null>(null)
const audioUrl = ref<string | null>(null)
const audioEl = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)

const isSearching = ref(false)
const searchError = ref('')
const manualLyricsInput = ref('')
const needsManualLyrics = ref(false)

const syncOffset = ref(0)

function nudgeOffset(amount: number) {
  syncOffset.value += amount
}


function handleAudioSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
  audioFile.value = file
  audioUrl.value = URL.createObjectURL(file)
}


function parseLrc(lrcText: string): LyricLine[] {
  const lineRegex = /\[(\d{2}):(\d{2})(?:\.(\d{1,2}))?\](.*)/
  const result: LyricLine[] = []

  for (const rawLine of lrcText.split('\n')) {
    const match = rawLine.match(lineRegex)
    if (!match) continue
    const minutes = Number(match[1])
    const seconds = Number(match[2])
    const centis = match[3] ? Number(match[3].padEnd(2, '0')) : 0
    const text = match[4]?.trim() ?? ''
    if (!text) continue
    const time = minutes * 60 + seconds + centis / 100
    result.push({ text, time })
  }

  return result
}

async function findSong() {
  if (!songTitle.value.trim() || !audioUrl.value) return
  isSearching.value = true
  searchError.value = ''
  needsManualLyrics.value = false

  try {
    const params = new URLSearchParams({
      track_name: songTitle.value.trim(),
      artist_name: artistName.value.trim(),
    })
    const response = await fetch(`https://lrclib.net/api/get?${params.toString()}`)

    if (!response.ok) {
      throw new Error('not found')
    }

    const data = await response.json()
    if (data.syncedLyrics) {
      lines.value = parseLrc(data.syncedLyrics)
      stage.value = 'playing'
    } else {
      throw new Error('no synced lyrics')
    }
  } catch {
    searchError.value =
      "Couldn't find synced lyrics for that song automatically. You can paste them in instead."
    needsManualLyrics.value = true
  } finally {
    isSearching.value = false
  }
}

function useManualLyrics() {
  const parsed = manualLyricsInput.value
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((text) => ({ text, time: null as number | null }))

  if (parsed.length === 0) return
  lines.value = parsed
  stage.value = 'syncing'
}

function startOver() {
  songTitle.value = ''
  artistName.value = ''
  manualLyricsInput.value = ''
  needsManualLyrics.value = false
  searchError.value = ''
  lines.value = []
  audioFile.value = null
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
  audioUrl.value = null
  isPlaying.value = false
  currentTime.value = 0
  stage.value = 'setup'
}


const syncIndex = ref(0)
const syncDone = computed(() => syncIndex.value >= lines.value.length)

function markLine() {
  if (!audioEl.value || syncDone.value) return
  const line = lines.value[syncIndex.value]
  if (!line) return
  line.time = audioEl.value.currentTime
  syncIndex.value += 1
  if (syncDone.value) {
    audioEl.value.pause()
    audioEl.value.currentTime = 0
    stage.value = 'playing'
  }
}


const currentLineIndex = computed(() => {
  let idx = -1
  const adjustedTime = currentTime.value - syncOffset.value
  for (let i = 0; i < lines.value.length; i++) {
    const t = lines.value[i]?.time
    if (t !== null && t !== undefined && t <= adjustedTime) {
      idx = i
    }
  }
  return idx
})

const currentLyricLine = computed(() =>
  currentLineIndex.value >= 0 ? (lines.value[currentLineIndex.value]?.text ?? '') : ''
)
const nextLyricLine = computed(() => lines.value[currentLineIndex.value + 1]?.text ?? '')
const previousLyricLine = computed(() => {
  const idx = currentLineIndex.value - 1
  return idx >= 0 ? (lines.value[idx]?.text ?? '') : ''
})

function handleTimeUpdate() {
  if (!audioEl.value) return
  currentTime.value = audioEl.value.currentTime
}

onBeforeUnmount(() => {
  if (audioUrl.value) URL.revokeObjectURL(audioUrl.value)
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
            Music Therapy · Karaoke
          </p>
          <h1 class="mt-2 font-['Georgia'] text-4xl font-black tracking-tight text-[#1E1B4B]">
            Sing along to your song
          </h1>
          <p class="mt-2 max-w-xl text-slate-600">
            Pick a song from your device, tell us the title, and the lyrics will follow the music
            automatically.
          </p>
        </div>
      </header>

      <!-- Lavender card -->
      <section class="rounded-3xl bg-[#EAE6FB] p-10 shadow-sm">
        <div class="mx-auto max-w-xl">
          <!-- Setup: pick audio + song title/artist -->
          <div v-if="stage === 'setup'" class="rounded-2xl border border-[#c9c0f5] bg-white/70 p-6">
            <p class="text-sm font-semibold text-[#1E1B4B]">1. Choose your song</p>
            <input
              type="file"
              accept="audio/*"
              class="mt-2 w-full text-sm text-slate-600"
              @change="handleAudioSelect"
            />
            <p v-if="audioFile" class="mt-1 text-xs text-emerald-600">
              Loaded: {{ audioFile.name }}
            </p>

            <p class="mt-5 text-sm font-semibold text-[#1E1B4B]">2. Tell us what it's called</p>
            <input
              v-model="songTitle"
              type="text"
              placeholder="Song title"
              class="mt-2 w-full rounded-xl border border-[#c9c0f5] bg-white px-3 py-2 text-sm text-[#1E1B4B] focus:ring-2 focus:ring-emerald-400 focus:outline-none"
            />
            <input
              v-model="artistName"
              type="text"
              placeholder="Artist (helps us find the right match)"
              class="mt-2 w-full rounded-xl border border-[#c9c0f5] bg-white px-3 py-2 text-sm text-[#1E1B4B] focus:ring-2 focus:ring-emerald-400 focus:outline-none"
            />

            <button
              type="button"
              class="mt-3 rounded-full bg-[#1E1B4B] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#2a2566] disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="!audioUrl || !songTitle.trim() || isSearching"
              @click="findSong"
            >
              {{ isSearching ? 'Looking for lyrics...' : 'Find lyrics & start' }}
            </button>

            <div v-if="searchError" class="mt-4 rounded-xl bg-white p-4">
              <p class="text-sm text-slate-600">{{ searchError }}</p>

              <textarea
                v-if="needsManualLyrics"
                v-model="manualLyricsInput"
                rows="5"
                placeholder="Paste lyrics here, one line per row..."
                class="mt-3 w-full rounded-xl border border-[#c9c0f5] bg-white px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-400 focus:outline-none"
              />
              <button
                v-if="needsManualLyrics"
                type="button"
                class="mt-2 rounded-full bg-[#1E1B4B] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#2a2566] disabled:cursor-not-allowed disabled:opacity-40"
                :disabled="manualLyricsInput.trim().length === 0"
                @click="useManualLyrics"
              >
                Continue to sync
              </button>
            </div>
          </div>

          <!-- Manual sync fallback: play + tap "Mark line" -->
          <div v-else-if="stage === 'syncing'" class="rounded-2xl border border-[#c9c0f5] bg-white/70 p-6">
            <p class="text-sm font-semibold text-[#1E1B4B]">Sync the lyrics</p>
            <p class="mt-1 text-xs text-slate-500">
              Play the song, and tap "Mark line" the moment each line below is sung.
            </p>

            <audio
              ref="audioEl"
              :src="audioUrl ?? undefined"
              class="mt-4 w-full"
              controls
              @timeupdate="handleTimeUpdate"
              @play="isPlaying = true"
              @pause="isPlaying = false"
            />

            <div class="mt-4 rounded-xl bg-white p-4 text-center">
              <p class="text-xs text-slate-400">Line {{ syncIndex + 1 }} of {{ lines.length }}</p>
              <p class="mt-1 font-['Georgia'] text-xl font-bold text-[#1E1B4B]">
                {{ lines[syncIndex]?.text ?? 'All lines marked!' }}
              </p>
            </div>

            <button
              type="button"
              class="mt-4 w-full rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="syncDone"
              @click="markLine"
            >
              Mark line
            </button>
          </div>

          <!-- Playing: karaoke display synced to audio.currentTime -->
          <div v-else class="rounded-2xl border border-[#c9c0f5] bg-white/70 p-8">
            <div class="flex items-center justify-between">
              <p v-if="songTitle" class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {{ songTitle }}<span v-if="artistName"> · {{ artistName }}</span>
              </p>
              <button
                type="button"
                class="ml-auto text-xs font-semibold text-slate-400 underline hover:text-slate-600"
                @click="startOver"
              >
                Choose a different song
              </button>
            </div>

            <audio
              ref="audioEl"
              :src="audioUrl ?? undefined"
              class="mt-4 w-full"
              controls
              @timeupdate="handleTimeUpdate"
              @play="isPlaying = true"
              @pause="isPlaying = false"
            />

            <div class="mt-4 flex items-center justify-center gap-3 text-sm text-slate-500">
                <button type="button" class="rounded-full border px-3 py-1" @click="nudgeOffset(-0.5)">− 0.5s</button>
                <span>Sync offset: {{ syncOffset.toFixed(1) }}s</span>
                <button type="button" class="rounded-full border px-3 py-1" @click="nudgeOffset(0.5)">+ 0.5s</button>
            </div>

            <div class="mt-6 space-y-3 text-center">
              <p class="truncate text-sm text-slate-400">{{ previousLyricLine }}</p>
              <p class="font-['Georgia'] text-3xl font-bold text-[#1E1B4B]">
                {{ currentLyricLine || '♪ ...' }}
              </p>
              <p class="truncate text-sm text-slate-400">{{ nextLyricLine }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>
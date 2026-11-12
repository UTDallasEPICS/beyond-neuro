<script setup lang="ts">
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

  const btnBase =
    'inline-flex min-h-[56px] items-center justify-center rounded-2xl px-6 py-3 text-lg font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
  const btnPrimary = `${btnBase} bg-orange-700 text-white hover:bg-orange-800`
  const btnQuiet = `${btnBase} border-2 border-slate-400 bg-white text-[var(--bn-navy)] hover:bg-slate-50`
  const fieldClass =
    'mt-2 w-full rounded-2xl border-2 border-slate-500 bg-white p-4 text-xl text-[var(--bn-navy)] focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:outline-none'
  const stepLabel = 'block text-xl font-bold text-[var(--bn-navy)]'
</script>

<template>
  <section
    aria-labelledby="singalong-title"
    class="rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 text-[var(--bn-navy)] sm:p-10"
  >
    <h2 id="singalong-title" class="bn-font-display text-2xl font-bold sm:text-3xl">
      Sing along to your song
    </h2>
    <p class="mt-2 text-lg leading-relaxed text-[var(--bn-muted)]">
      Pick a song from your device, tell us the title, and the lyrics will follow the music.
    </p>

    <div class="mt-8 rounded-2xl border border-[var(--bn-border)] bg-white p-6">
      <!-- Setup: pick audio + song title/artist -->
      <div v-if="stage === 'setup'">
        <label for="singalong-file" :class="stepLabel">1. Choose your song</label>
        <input
          id="singalong-file"
          type="file"
          accept="audio/*"
          class="mt-3 w-full text-lg text-[var(--bn-muted)] file:mr-4 file:min-h-[56px] file:rounded-2xl file:border-2 file:border-slate-400 file:bg-white file:px-6 file:text-lg file:font-semibold file:text-[var(--bn-navy)]"
          @change="handleAudioSelect"
        />
        <p v-if="audioFile" class="mt-2 text-lg text-green-800">Loaded: {{ audioFile.name }}</p>

        <p :class="[stepLabel, 'mt-8']">2. Tell us what it's called</p>
        <label for="singalong-title-input" class="mt-3 block text-lg">Song title</label>
        <input id="singalong-title-input" v-model="songTitle" type="text" :class="fieldClass" />
        <label for="singalong-artist" class="mt-4 block text-lg">
          Artist (helps us find the right match)
        </label>
        <input id="singalong-artist" v-model="artistName" type="text" :class="fieldClass" />

        <button
          type="button"
          :class="[btnPrimary, 'mt-6']"
          :disabled="!audioUrl || !songTitle.trim() || isSearching"
          @click="findSong"
        >
          {{ isSearching ? 'Looking for lyrics...' : 'Find lyrics & start' }}
        </button>

        <div aria-live="polite">
          <div
            v-if="searchError"
            class="mt-6 rounded-2xl border border-[var(--bn-border)] bg-[var(--bn-cream)] p-5"
          >
            <p class="text-lg">{{ searchError }}</p>

            <template v-if="needsManualLyrics">
              <label for="singalong-lyrics" class="mt-4 block text-lg font-semibold">
                Paste lyrics here, one line per row
              </label>
              <textarea
                id="singalong-lyrics"
                v-model="manualLyricsInput"
                rows="5"
                :class="fieldClass"
              />
              <button
                type="button"
                :class="[btnPrimary, 'mt-4']"
                :disabled="manualLyricsInput.trim().length === 0"
                @click="useManualLyrics"
              >
                Continue to sync
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Syncing: player taps "Mark line" as each lyric is sung -->
      <div v-else-if="stage === 'syncing'">
        <h3 class="text-xl font-bold">Sync the lyrics</h3>
        <p class="mt-2 text-lg text-[var(--bn-muted)]">
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

        <div class="mt-4 rounded-2xl bg-[var(--bn-cream)] p-5 text-center">
          <p class="text-lg text-[var(--bn-muted)]">
            Line {{ syncIndex + 1 }} of {{ lines.length }}
          </p>
          <p class="bn-font-display mt-1 text-2xl font-bold">
            {{ lines[syncIndex]?.text ?? 'All lines marked!' }}
          </p>
        </div>

        <button
          type="button"
          :class="[btnPrimary, 'mt-4 min-h-[72px] w-full text-2xl']"
          :disabled="syncDone"
          @click="markLine"
        >
          Mark line
        </button>
      </div>

      <!-- Playing: lyrics follow the music -->
      <div v-else>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p
            v-if="songTitle"
            class="text-lg font-semibold tracking-wide text-[var(--bn-muted)] uppercase"
          >
            {{ songTitle }}<span v-if="artistName"> · {{ artistName }}</span>
          </p>
          <button type="button" :class="[btnQuiet, 'ml-auto']" @click="startOver">
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

        <div class="mt-4 flex flex-wrap items-center justify-center gap-3 text-lg">
          <button
            type="button"
            :class="btnQuiet"
            aria-label="Show lyrics half a second earlier"
            @click="nudgeOffset(-0.5)"
          >
            − 0.5s
          </button>
          <span>Sync offset: {{ syncOffset.toFixed(1) }}s</span>
          <button
            type="button"
            :class="btnQuiet"
            aria-label="Show lyrics half a second later"
            @click="nudgeOffset(0.5)"
          >
            + 0.5s
          </button>
        </div>

        <div class="mt-8 space-y-4 text-center">
          <p class="truncate text-lg text-[var(--bn-muted)]">{{ previousLyricLine }}</p>
          <p class="bn-font-display text-3xl font-bold sm:text-4xl">
            {{ currentLyricLine || '♪ ...' }}
          </p>
          <p class="truncate text-lg text-[var(--bn-muted)]">{{ nextLyricLine }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

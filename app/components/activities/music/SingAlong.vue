<script setup lang="ts">
type LyricLine = { text: string; time: number }

// One song from the playlist, as returned by /sing-along/songs
type PlaylistSong = {
  id: string
  slug: string
  title: string
  level: number
  audioPath: string
  lyricsPath: string
  lyrics: LyricLine[]
  /** Per-song correction in seconds. Positive = lyrics later, negative = earlier. */
  syncOffset?: number
}

const songTitle = ref('')
const lines = ref<LyricLine[]>([])
const stage = ref<'setup' | 'playing'>('setup')

const audioUrl = ref<string | null>(null)
const audioEl = ref<HTMLAudioElement | null>(null)
const currentTime = ref(0)
const syncOffset = ref(0)

// ---- Playlist (songs come from the database) ----
const {
  data: playlist,
  status: playlistStatus,
  error: playlistFetchError,
  refresh: reloadPlaylist,
} = useFetch<PlaylistSong[]>('/sing-along/songs', {
  default: () => [],
})

// TEMPORARY: shows the real server error on the page so it can be read and fixed.
const playlistErrorDetail = computed(() => {
  const err = playlistFetchError.value
  if (!err) return ''
  const data = err.data as { message?: string; statusMessage?: string } | undefined
  return [err.message, data?.message ?? data?.statusMessage].filter(Boolean).join(' | ')
})

const playlistError = ref('')

function syncClock() {
  if (!audioEl.value) return
  currentTime.value = audioEl.value.currentTime
}

// `timeupdate` only fires a few times per second, so read `audio.currentTime`
// per frame during playback to keep lyric transitions responsive.
let frameId: number | null = null

function tick() {
  syncClock()
  frameId = requestAnimationFrame(tick)
}

function startTracking() {
  if (frameId !== null) return
  syncClock()
  frameId = requestAnimationFrame(tick)
}

function stopTracking() {
  if (frameId !== null) {
    cancelAnimationFrame(frameId)
    frameId = null
  }
  syncClock()
}

// The user picked a song from the playlist: load its audio and timed lyrics, then play.
async function startPlaylistSong(song: PlaylistSong) {
  stopTracking()
  playlistError.value = ''

  const sortedLines = [...song.lyrics]
    .map((l) => ({ text: l.text, time: Number(l.time) }))
    .filter((l) => Number.isFinite(l.time))
    .sort((a, b) => a.time - b.time)

  if (sortedLines.length === 0) {
    playlistError.value = `"${song.title}" doesn't have lyrics yet. Please pick another song.`
    return
  }

  audioUrl.value = song.audioPath
  songTitle.value = song.title
  lines.value = sortedLines
  syncOffset.value = Number(song.syncOffset ?? 0)
  currentTime.value = 0
  stage.value = 'playing'

  // Start the music right away so the user can just sing.
  // (Picking the song is a click, so the browser allows this.)
  await nextTick()
  const el = audioEl.value
  if (!el) return

  el.load()
  try {
    await el.play()
  } catch {
    // If the browser still blocks it, the user can press play on the player.
  }
}

function startOver() {
  stopTracking()
  audioEl.value?.pause()
  songTitle.value = ''
  playlistError.value = ''
  lines.value = []
  audioUrl.value = null
  currentTime.value = 0
  syncOffset.value = 0
  stage.value = 'setup'
}

const adjustedTime = computed(() => currentTime.value - syncOffset.value)

const currentLineIndex = computed(() => {
  const t = adjustedTime.value
  let idx = -1

  for (let i = 0; i < lines.value.length; i++) {
    const line = lines.value[i]
    if (!line) continue
    if (line.time <= t) {
      idx = i
    } else {
      break
    }
  }

  return idx
})

const hasLyricsStarted = computed(() => currentLineIndex.value >= 0)

const currentLyricLine = computed(() =>
  hasLyricsStarted.value ? (lines.value[currentLineIndex.value]?.text ?? '') : ''
)
const nextLyricLine = computed(() => lines.value[currentLineIndex.value + 1]?.text ?? '')
const previousLyricLine = computed(() => {
  const idx = currentLineIndex.value - 1
  return idx >= 0 ? (lines.value[idx]?.text ?? '') : ''
})

onBeforeUnmount(() => {
  stopTracking()
  audioEl.value?.pause()
})

const btnBase =
  'inline-flex min-h-[56px] items-center justify-center rounded-2xl px-6 py-3 text-lg font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'
const btnQuiet = `${btnBase} border-2 border-slate-400 bg-white text-[var(--bn-navy)] hover:bg-slate-50`
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
      Pick a song from the playlist and the lyrics will follow the music.
    </p>

    <div class="mt-8 rounded-2xl border border-[var(--bn-border)] bg-white p-6">
      <!-- Setup: choose a song from the playlist -->
      <div v-if="stage === 'setup'">
        <h3 :class="stepLabel">Choose a song from the playlist</h3>

        <p v-if="playlistStatus === 'pending'" class="mt-3 text-lg text-[var(--bn-muted)]">
          Loading songs...
        </p>

        <div v-else-if="playlistStatus === 'error'" class="mt-3">
          <p class="text-lg">The playlist could not be loaded.</p>
          <p class="mt-2 text-base break-words text-red-800">{{ playlistErrorDetail }}</p>
          <button type="button" :class="[btnQuiet, 'mt-3']" @click="reloadPlaylist()">
            Try again
          </button>
        </div>

        <ol v-else-if="playlist.length > 0" class="mt-3 space-y-3">
          <li v-for="song in playlist" :key="song.id">
            <button
              type="button"
              :class="[btnQuiet, 'w-full justify-between text-left']"
              @click="startPlaylistSong(song)"
            >
              <span>{{ song.title }}</span>
            </button>
          </li>
        </ol>

        <p v-else class="mt-3 text-lg text-[var(--bn-muted)]">No songs in the playlist yet.</p>

        <p v-if="playlistError" role="alert" class="mt-4 text-lg text-red-800">
          {{ playlistError }}
        </p>
      </div>

      <!-- Playing: lyrics follow the music automatically -->
      <div v-else>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p
            v-if="songTitle"
            class="text-lg font-semibold tracking-wide text-[var(--bn-muted)] uppercase"
          >
            {{ songTitle }}
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
          @loadedmetadata="syncClock"
          @timeupdate="syncClock"
          @seeked="syncClock"
          @play="startTracking"
          @pause="stopTracking"
          @ended="stopTracking"
        />

        <!-- Previous / current / next lyrics, current line highlighted once first cue starts -->
        <div class="mt-8 space-y-4 text-center">
          <p class="truncate text-lg text-[var(--bn-muted)]">{{ previousLyricLine }}</p>
          <p
            aria-live="off"
            class="bn-font-display rounded-2xl px-4 py-4 text-3xl font-bold transition-colors sm:text-4xl"
            :class="
              hasLyricsStarted
                ? 'bg-orange-700 text-white'
                : 'bg-slate-100 text-[var(--bn-muted)]'
            "
          >
            {{ hasLyricsStarted ? currentLyricLine : 'Get ready...' }}
          </p>
          <p class="truncate text-lg text-[var(--bn-muted)]">{{ nextLyricLine }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
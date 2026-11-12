import {
  BEAT_MS,
  SYLLABLE_WORDS,
  type Level,
  type SyllableWord,
} from '~/data/dual-task/SyllableWords'

function shuffle<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = out[i]!
    out[i] = out[j]!
    out[j] = tmp
  }
  return out
}

export function useClapItOut() {
  const level = ref<Level>(1)
  const queue = ref<SyllableWord[]>([])
  const index = ref(0)
  const revealed = ref(false)
  const demoPlayed = ref(false)
  const activeBeat = ref<number | null>(null)

  const current = computed(() => queue.value[index.value] ?? null)
  const total = computed(() => queue.value.length)
  const wordsSeen = computed(() => (queue.value.length ? index.value + 1 : 0))
  const hasNext = computed(() => index.value < queue.value.length - 1)
  const playing = computed(() => activeBeat.value !== null)

  let beatTimer: ReturnType<typeof setInterval> | undefined

  function speak(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  function stopSpeech() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
  }

  function stopDemo() {
    if (beatTimer) clearInterval(beatTimer)
    beatTimer = undefined
    activeBeat.value = null
  }

  function playDemo() {
    const word = current.value
    if (!word) return
    stopDemo()
    revealed.value = true
    activeBeat.value = 0
    speak(word.syllables[0]!)
    beatTimer = setInterval(() => {
      const next = (activeBeat.value ?? 0) + 1
      if (next >= word.syllables.length) {
        stopDemo()
        demoPlayed.value = true
        return
      }
      activeBeat.value = next
      speak(word.syllables[next]!)
    }, BEAT_MS[level.value])
  }

  function hearIt() {
    const word = current.value
    if (!word) return
    stopDemo()
    speak(word.label)
  }

  function resetWord() {
    stopDemo()
    stopSpeech()
    revealed.value = false
    demoPlayed.value = false
  }

  function start(l: Level) {
    level.value = l
    queue.value = shuffle(SYLLABLE_WORDS.filter((w) => w.level === l))
    index.value = 0
    resetWord()
  }

  // Advances to the next word. Returns false when the level's list is used up. 
  function next(): boolean {
    if (!hasNext.value) return false
    index.value += 1
    resetWord()
    return true
  }

  function stop() {
    stopDemo()
    stopSpeech()
  }

  onBeforeUnmount(stop)

  return {
    level,
    current,
    index,
    total,
    wordsSeen,
    hasNext,
    revealed,
    demoPlayed,
    activeBeat,
    playing,
    start,
    next,
    stop,
    hearIt,
    playDemo,
  }
}

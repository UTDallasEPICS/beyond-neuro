import {
  lifeStoryPrompts,
  type LifeStoryAnswer,
} from '~/data/reminiscence/life-story-prompts'

const STORAGE_KEY = 'bn-life-story-prompts'

interface StoredState {
  index: number
  answers: Record<string, LifeStoryAnswer>
}

function readStored(): StoredState {
  if (!import.meta.client) {
    return { index: 0, answers: {} }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { index: 0, answers: {} }
    const parsed = JSON.parse(raw) as StoredState
    return {
      index: typeof parsed.index === 'number' ? parsed.index : 0,
      answers: parsed.answers ?? {},
    }
  } catch {
    return { index: 0, answers: {} }
  }
}

function writeStored(state: StoredState) {
  if (!import.meta.client) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function useLifeStoryPrompts() {
  const prompts = lifeStoryPrompts
  const currentIndex = ref(0)
  const answers = ref<Record<string, LifeStoryAnswer>>({})
  const hydrated = ref(false)

  const currentPrompt = computed(() => prompts[currentIndex.value] ?? null)
  const total = computed(() => prompts.length)
  const answeredCount = computed(() => Object.keys(answers.value).length)
  const isComplete = computed(() => answeredCount.value >= total.value && total.value > 0)
  const currentAnswer = computed(() => {
    const prompt = currentPrompt.value
    return prompt ? (answers.value[prompt.id] ?? null) : null
  })

  function persist() {
    writeStored({
      index: currentIndex.value,
      answers: answers.value,
    })
  }

  function hydrate() {
    const stored = readStored()
    answers.value = stored.answers
    const maxIndex = Math.max(0, prompts.length - 1)
    currentIndex.value = Math.min(Math.max(0, stored.index), maxIndex)
    hydrated.value = true
  }

  function answer(value: LifeStoryAnswer) {
    const prompt = currentPrompt.value
    if (!prompt) return
    answers.value = { ...answers.value, [prompt.id]: value }
    persist()
  }

  function next() {
    if (currentIndex.value < prompts.length - 1) {
      currentIndex.value += 1
      persist()
    }
  }

  function startOver() {
    currentIndex.value = 0
    answers.value = {}
    persist()
  }

  onMounted(() => {
    hydrate()
  })

  return {
    prompts,
    currentIndex,
    currentPrompt,
    currentAnswer,
    total,
    answeredCount,
    isComplete,
    hydrated,
    answer,
    next,
    startOver,
  }
}

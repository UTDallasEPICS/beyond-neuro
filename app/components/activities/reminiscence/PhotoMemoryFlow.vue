<script setup lang="ts">
  import {
    photoLevels,
    photoMemoryPrompts,
    type PhotoLevel,
  } from '~/data/reminiscence/photo-memory-prompts'

  interface SavedMemory {
    question: string
    response: string
    savedAt: string
  }

  const STORAGE_KEY = 'bn-photo-memories'
  const ASK_QUESTION = 'Does this photo remind you of anything?'

  type Step = 'ask' | 'followup' | 'done'
  const step = ref<Step>('ask')
  const index = ref(0) // which photo we are on
  const questionIndex = ref(0) // which follow-up question is showing
  const response = ref('')
  const saved = ref<Record<string, SavedMemory>>({})
  const feedback = ref('')

  const heading = ref<HTMLElement | null>(null)
  const brokenImages = ref<Record<string, boolean>>({}) // photos whose file failed to load

  const total = photoMemoryPrompts.length
  const photo = computed(() => photoMemoryPrompts[index.value])
  const followUp = computed(() => photo.value?.followUps[questionIndex.value] ?? '')
  const level = computed(() => (photo.value ? photoLevels[photo.value.level] : null))
  const showImage = computed(() => !!photo.value?.image && !brokenImages.value[photo.value.id])

  const levelOrder = Object.keys(photoLevels) as PhotoLevel[]
  const levelStart = (l: PhotoLevel) => photoMemoryPrompts.findIndex((p) => p.level === l)

  const savedMemories = computed(() =>
    photoMemoryPrompts
      .filter((p) => saved.value[p.id]?.response)
      .map((p) => {
        const s = saved.value[p.id]!
        return {
          id: p.id,
          title: p.title,
          question: s.question,
          response: s.response,
          savedAt: s.savedAt,
        }
      })
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
  )

  onMounted(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) saved.value = JSON.parse(raw)
    } catch {
      saved.value = {}
    }
  })

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved.value))
    } catch {
      // Storage full or disabled
    }
  }

  watch([step, index], () => nextTick(() => heading.value?.focus()))

  function goTo(i: number) {
    index.value = i
    questionIndex.value = 0
    response.value = ''
    step.value = 'ask'
  }

  function goToNext() {
    if (index.value < total - 1) goTo(index.value + 1)
    else step.value = 'done'
  }

  function answerYes() {
    if (!photo.value) return
    feedback.value = ''
    questionIndex.value = 0

    response.value = saved.value[photo.value.id]?.response ?? ''
    step.value = 'followup'
  }

  function answerNo() {
    feedback.value = 'That is okay. Here is another photo.'
    goToNext()
  }

  function nextQuestion() {
    if (!photo.value) return
    questionIndex.value = (questionIndex.value + 1) % photo.value.followUps.length
  }

  function goBack() {
    feedback.value = ''
    if (index.value > 0) goTo(index.value - 1)
  }

  function jumpToLevel(l: PhotoLevel) {
    feedback.value = ''
    goTo(levelStart(l))
  }

  function saveAndNext() {
    if (!photo.value) return
    const text = response.value.trim()
    saved.value = {
      ...saved.value,
      [photo.value.id]: {
        question: followUp.value,
        response: text,
        savedAt: new Date().toISOString(),
      },
    }
    persist()
    feedback.value = text ? 'Memory saved. Thank you for sharing.' : 'Thank you for sharing.'
    goToNext()
  }

  function skip() {
    feedback.value = ''
    goToNext()
  }

  function startOver() {
    saved.value = {}
    persist()
    feedback.value = ''
    goTo(0)
  }

  function printMemories() {
    window.print()
  }

  const btnBase =
    'inline-flex min-h-[72px] min-w-[72px] items-center justify-center gap-3 rounded-2xl px-6 py-3 text-2xl font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4'
  const btnPrimary = `${btnBase} bg-orange-700 text-white hover:bg-orange-800`
  const btnQuiet = `${btnBase} border-2 border-slate-400 bg-white text-[var(--bn-navy)] hover:bg-slate-50`
</script>

<template>
  <section class="mt-8 text-2xl text-[var(--bn-navy)]">
    <nav aria-label="Photo groups" class="print:hidden">
      <ul class="grid list-none gap-3 p-0 sm:grid-cols-3">
        <li v-for="l in levelOrder" :key="l">
          <button
            type="button"
            :aria-pressed="step !== 'done' && photo?.level === l"
            class="flex min-h-[72px] w-full flex-col items-start justify-center rounded-2xl border-2 px-5 py-3 text-left focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
            :class="
              step !== 'done' && photo?.level === l
                ? 'border-orange-700 bg-[var(--bn-peach)]'
                : 'border-slate-300 bg-white hover:bg-slate-50'
            "
            @click="jumpToLevel(l)"
          >
            <span class="text-xl font-bold">{{ photoLevels[l].label }}</span>
            <span class="text-lg text-[var(--bn-muted)]">{{ photoLevels[l].description }}</span>
          </button>
        </li>
      </ul>
    </nav>

    <p aria-live="polite" class="mt-4 min-h-[2.5rem] font-semibold text-green-800 print:hidden">
      {{ feedback }}
    </p>

    <div
      v-if="step !== 'done' && photo"
      class="rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 sm:p-10 print:hidden"
    >
      <p class="font-semibold text-orange-800">
        Photo {{ index + 1 }} of {{ total }} · {{ level?.label }}
      </p>

      <figure class="mt-4">
        <img
          v-if="showImage"
          :src="photo.image"
          :alt="photo.alt"
          class="aspect-[4/3] w-full rounded-2xl border border-[var(--bn-border)] bg-white object-cover"
          @error="brokenImages[photo.id] = true"
        />

        <div
          v-else
          role="img"
          :aria-label="photo.alt"
          class="flex aspect-[4/3] w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-400 bg-white p-6 text-center"
        >
          <img src="/activities/icon-image.svg" alt="" class="size-16" width="64" height="64" />
          <p class="max-w-[28ch] leading-relaxed text-[var(--bn-muted)]">{{ photo.alt }}</p>
        </div>
        <figcaption class="bn-font-display mt-4 text-2xl font-bold">{{ photo.title }}</figcaption>
      </figure>

      <h2
        ref="heading"
        tabindex="-1"
        class="bn-font-display mt-6 text-3xl leading-snug font-bold focus:outline-none sm:text-4xl"
      >
        {{ step === 'ask' ? ASK_QUESTION : followUp }}
      </h2>

      <template v-if="step === 'ask'">
        <div class="mt-8 grid grid-cols-2 gap-4">
          <button type="button" :class="btnPrimary" @click="answerYes">Yes</button>
          <button type="button" :class="btnPrimary" @click="answerNo">No</button>
        </div>
        <button v-if="index > 0" type="button" :class="[btnQuiet, 'mt-4 w-full']" @click="goBack">
          Previous photo
        </button>
      </template>

      <template v-else>
        <button
          v-if="photo.followUps.length > 1"
          type="button"
          :class="[btnQuiet, 'mt-4 w-full']"
          @click="nextQuestion"
        >
          Ask a different question
        </button>

        <label for="photo-memory-response" class="mt-8 block font-semibold">
          Your memory (you do not have to write anything)
        </label>
        <p id="photo-memory-hint" class="mt-2 leading-relaxed text-[var(--bn-muted)]">
          You can write here, or just talk about it with someone with you.
        </p>
        <textarea
          id="photo-memory-response"
          v-model="response"
          rows="4"
          aria-describedby="photo-memory-hint"
          class="mt-4 w-full rounded-2xl border-2 border-slate-500 bg-white p-4 text-2xl leading-relaxed focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:outline-none"
        />

        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          <button type="button" :class="btnPrimary" @click="saveAndNext">
            Save and next photo
          </button>
          <button type="button" :class="btnQuiet" @click="skip">Skip this photo</button>
        </div>
      </template>
    </div>

    <div
      v-else-if="step === 'done'"
      class="rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 sm:p-10"
    >
      <h2
        ref="heading"
        tabindex="-1"
        class="bn-font-display text-3xl font-bold focus:outline-none sm:text-4xl"
      >
        You looked at every photo
      </h2>
      <p class="mt-4 leading-relaxed">
        {{
          savedMemories.length
            ? 'Your memories are saved below.'
            : 'You did not write anything down this time. That is okay. Talking about it counts too.'
        }}
      </p>

      <div class="mt-8 grid gap-4 sm:grid-cols-2 print:hidden">
        <button
          v-if="savedMemories.length"
          type="button"
          :class="btnPrimary"
          @click="printMemories"
        >
          Print my memories
        </button>
        <button type="button" :class="btnQuiet" @click="goTo(0)">Look at the photos again</button>
        <button type="button" :class="btnQuiet" @click="startOver">Start over</button>
      </div>

      <section v-if="savedMemories.length" aria-labelledby="saved-memories-title" class="mt-10">
        <h2 id="saved-memories-title" class="bn-font-display text-3xl font-bold">
          Saved memories ({{ savedMemories.length }})
        </h2>
        <ul class="mt-6 list-none space-y-4 p-0">
          <li
            v-for="memory in savedMemories"
            :key="memory.id"
            class="rounded-2xl border border-[var(--bn-border)] bg-white p-6"
          >
            <p class="font-semibold">{{ memory.title }}</p>
            <p class="mt-1 leading-relaxed text-[var(--bn-muted)]">{{ memory.question }}</p>
            <p class="mt-3 leading-relaxed whitespace-pre-line">{{ memory.response }}</p>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>

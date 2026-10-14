<script setup lang="ts">
  import { lifeStoryPrompts, type LifeStoryAnswer } from '~/data/reminiscence/life-story-prompts'

  interface SavedResponse {
    answer: LifeStoryAnswer
    response: string
    savedAt: string
  }

  const STORAGE_KEY = 'bn-life-story-responses'

  type Step = 'question' | 'followup' | 'done'
  const step = ref<Step>('question')
  const index = ref(0)
  const answer = ref<LifeStoryAnswer>('yes') // Tracking the user ans
  const response = ref('') // the users typed answer
  const saved = ref<Record<string, SavedResponse>>({}) // saving prompt id with the SR interface vals
  const feedback = ref('') // Thanks for sharing msg | pops up after user types ans
  const confirmingStartOver = ref(false)
  const heading = ref<HTMLElement | null>(null)

  const total = lifeStoryPrompts.length // storing size of our array which is 8 as of now
  const prompt = computed(() => lifeStoryPrompts[index.value]) // keeping track of the current prompt based on the index

  const followUp = computed(() => {
    return answer.value === 'yes' ? prompt.value!.followUpYes : prompt.value!.followUpNo
  })

  // Saved stories: only answers with writing, newest first
  const savedStories = computed(() =>
    lifeStoryPrompts
      .filter((p) => saved.value[p.id]?.response) // looks for prompts with actual reponses
      .map((p) => {
        const s = saved.value[p.id]! // gets saved ans
        return {
          id: p.id,
          prompt: s.answer === 'yes' ? p.followUpYes : p.followUpNo,
          response: s.response,
          savedAt: s.savedAt,
        }
      })
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
  )

  // Reads saved answers
  onMounted(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      // only continues if something was found
      if (raw) saved.value = JSON.parse(raw) // turns text back into an obj
    } catch {
      saved.value = {} // if something is corrupted, it will just start fresh
    }
  })

  // Writes saved answers
  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved.value)) // turns obj into text and saves it
    } catch {
      // Ignore errors, if storage is full or disabled
    }
  }

  // Move focus to the new question so keyboard and screen reader users follow along
  watch([step, index], () => nextTick(() => heading.value?.focus()))

  function choose(a: LifeStoryAnswer) {
    if (!prompt.value) return
    feedback.value = ''
    answer.value = a // yes or no | assings follow up to followupY or N
    response.value = saved.value[prompt.value.id]?.response ?? ''
    step.value = 'followup' // switches screen to follow up question
  }

  function goToNext() {
    response.value = ''
    if (index.value < total - 1) {
      index.value++
      step.value = 'question'
    } else {
      step.value = 'done'
    }
  }

  function saveAndNext() {
    if (!prompt.value) return
    const text = response.value.trim() // if only space, trim will make it an empty string
    saved.value = {
      ...saved.value,
      [prompt.value.id]: {
        // adds questions answer using the prompt id
        answer: answer.value,
        response: text,
        savedAt: new Date().toISOString(),
      },
    }
    persist()
    feedback.value = text ? 'Story saved. Thank you for sharing.' : 'Thank you for sharing.'
    goToNext()
  }

  function skip() {
    feedback.value = ''
    goToNext()
  }

  function startOver() {
    saved.value = {}
    persist()
    index.value = 0
    feedback.value = ''
    confirmingStartOver.value = false
    step.value = 'question'
  }

  function printStory() {
    window.print()
  }

  // 72px touch targets, 24px text, dark orange that passes contrast, visible focus ring
  const btnBase =
    'inline-flex min-h-[72px] min-w-[72px] items-center justify-center gap-3 rounded-2xl px-6 py-3 text-2xl font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4'
  const btnPrimary = `${btnBase} bg-orange-700 text-white hover:bg-orange-800`
  const btnQuiet = `${btnBase} border-2 border-slate-400 bg-white text-[var(--bn-navy)] hover:bg-slate-50`
</script>

<template>
  <section class="mt-8 text-2xl text-[var(--bn-navy)]">
    <p aria-live="polite" class="min-h-[2.5rem] font-semibold text-green-800 print:hidden">
      {{ feedback }}
    </p>

    <div
      v-if="step !== 'done' && prompt"
      class="rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 sm:p-10 print:hidden"
    >
      <p class="font-semibold text-orange-800">Question {{ index + 1 }} of {{ total }}</p>

      <h2
        ref="heading"
        tabindex="-1"
        class="bn-font-display mt-4 text-3xl leading-snug font-bold focus:outline-none sm:text-4xl"
      >
        {{ step === 'question' ? prompt.question : followUp }}
      </h2>

      <!-- Yes / No -->
      <template v-if="step === 'question'">
        <div class="mt-8 grid grid-cols-2 gap-4">
          <button type="button" :class="btnPrimary" @click="choose('yes')">Yes</button>
          <button type="button" :class="btnPrimary" @click="choose('no')">No</button>
        </div>
        <button type="button" :class="[btnQuiet, 'mt-4 w-full']" @click="skip">
          Skip this one
        </button>
      </template>

      <!-- Follow-up: writing is optional -->
      <template v-else>
        <label for="life-story-response" class="mt-8 block font-semibold">
          Your answer (you do not have to write anything)
        </label>
        <p id="life-story-hint" class="mt-2 leading-relaxed text-[var(--bn-muted)]">
          You can write here, or just say it out loud to someone with you.
        </p>
        <textarea
          id="life-story-response"
          v-model="response"
          rows="4"
          aria-describedby="life-story-hint"
          class="mt-4 w-full rounded-2xl border-2 border-slate-500 bg-white p-4 text-2xl leading-relaxed focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:outline-none"
        />
        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          <button type="button" :class="btnPrimary" @click="saveAndNext">Save and continue</button>
          <button type="button" :class="btnQuiet" @click="skip">Skip this one</button>
        </div>
      </template>
    </div>

    <!-- Done screen -->
    <div
      v-else-if="step === 'done'"
      class="rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 sm:p-10"
    >
      <h2
        ref="heading"
        tabindex="-1"
        class="bn-font-display text-3xl font-bold focus:outline-none sm:text-4xl"
      >
        Thank you for sharing your story
      </h2>
      <p class="mt-4 leading-relaxed">
        {{
          savedStories.length
            ? 'Your stories are saved below.'
            : 'You did not write anything down this time. That is okay. Talking about it counts too.'
        }}
      </p>

      <!-- Start over asks first, so stories are never erased by accident -->
      <div v-if="!confirmingStartOver" class="mt-8 grid gap-4 sm:grid-cols-2 print:hidden">
        <button v-if="savedStories.length" type="button" :class="btnPrimary" @click="printStory">
          Print my stories
        </button>
        <button type="button" :class="btnQuiet" @click="confirmingStartOver = true">
          Start over
        </button>
      </div>
      <div
        v-else
        role="alertdialog"
        aria-labelledby="start-over-title"
        class="mt-8 rounded-2xl border-2 border-orange-700 bg-white p-6 print:hidden"
      >
        <p id="start-over-title" class="font-semibold">
          Starting over will clear your saved stories. Do you want to start over?
        </p>
        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          <button type="button" :class="btnQuiet" @click="confirmingStartOver = false">
            Keep my stories
          </button>
          <button type="button" :class="btnPrimary" @click="startOver">Yes, start over</button>
        </div>
      </div>
    </div>

    <!-- Saved stories: always visible, newest first -->
    <section v-if="savedStories.length" aria-labelledby="saved-stories-title" class="mt-10">
      <h2 id="saved-stories-title" class="bn-font-display text-3xl font-bold">
        Saved stories ({{ savedStories.length }})
      </h2>
      <ul class="mt-6 list-none space-y-4 p-0">
        <li
          v-for="story in savedStories"
          :key="story.id"
          class="rounded-2xl border border-[var(--bn-border)] bg-white p-6"
        >
          <p class="leading-relaxed text-[var(--bn-muted)]">{{ story.prompt }}</p>
          <p class="mt-3 leading-relaxed whitespace-pre-line">{{ story.response }}</p>
        </li>
      </ul>
    </section>
  </section>
</template>

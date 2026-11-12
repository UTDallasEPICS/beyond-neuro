<script setup lang="ts">
  import {
    lifeStoryLevels,
    lifeStoryPrompts,
    type LifeStoryAnswer,
  } from '~/data/reminiscence/life-story-prompts'
  import {
    REMINISCENCE_LEVELS,
    nextLevel,
    type ReminiscenceLevel,
  } from '~/data/reminiscence/levels'

  interface SavedResponse {
    answer?: LifeStoryAnswer
    /** The question the response answers. Older saves only have `answer`. */
    prompt?: string
    response: string
    savedAt: string
  }

  const STORAGE_KEY = 'bn-life-story-responses'

  type Step = 'question' | 'choice' | 'followup' | 'done'
  const step = ref<Step>('question') // Level 1 opens on a yes/no question
  const level = ref<ReminiscenceLevel>(1)
  const index = ref(0) // position within the current level
  const answer = ref<LifeStoryAnswer>('yes') // Tracking the user ans
  const response = ref('') // the users typed answer
  const saved = ref<Record<string, SavedResponse>>({}) // saving prompt id with the SR interface vals
  const feedback = ref('') // Thanks for sharing msg | pops up after user types ans
  const confirmingStartOver = ref(false)
  const heading = ref<HTMLElement | null>(null)

  const levelPrompts = computed(() => lifeStoryPrompts.filter((p) => p.level === level.value))
  const total = computed(() => levelPrompts.value.length)
  const prompt = computed(() => levelPrompts.value[index.value]) // keeping track of the current prompt based on the index
  const levelInfo = computed(() => lifeStoryLevels[level.value])
  const upcomingLevel = computed(() => nextLevel(level.value))

  const pickerLevels = REMINISCENCE_LEVELS.map((l) => ({ level: l, ...lifeStoryLevels[l] }))

  const followUp = computed(() => {
    return answer.value === 'yes' ? prompt.value!.followUpYes : prompt.value!.followUpNo
  })

  const headingText = computed(() => {
    const p = prompt.value
    if (!p) return ''
    if (step.value === 'choice') return p.choiceQuestion ?? p.question
    if (step.value === 'followup') return p.kind === 'open' ? p.question : followUp.value
    return p.question
  })

  // Saved stories: only answers with writing, newest first
  const savedStories = computed(() =>
    lifeStoryPrompts
      .filter((p) => saved.value[p.id]?.response) // looks for prompts with actual reponses
      .map((p) => {
        const s = saved.value[p.id]! // gets saved ans
        return {
          id: p.id,
          prompt: s.prompt ?? (s.answer === 'no' ? p.followUpNo : p.followUpYes) ?? p.question,
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

  function goTo(i: number) {
    index.value = i
    response.value = ''
    const p = levelPrompts.value[i]
    if (p?.kind === 'open') {
      response.value = saved.value[p.id]?.response ?? ''
      step.value = 'followup'
    } else if (p?.kind === 'pick') {
      step.value = 'choice'
    } else {
      step.value = 'question'
    }
  }

  function startLevel(l: ReminiscenceLevel) {
    feedback.value = ''
    confirmingStartOver.value = false
    level.value = l
    goTo(0)
  }

  function goToNext() {
    if (index.value < total.value - 1) goTo(index.value + 1)
    else step.value = 'done'
  }

  function record(entry: Omit<SavedResponse, 'savedAt'>) {
    if (!prompt.value) return
    saved.value = {
      ...saved.value,
      [prompt.value.id]: { ...entry, savedAt: new Date().toISOString() },
    }
    persist()
  }

  function choose(a: LifeStoryAnswer) {
    const p = prompt.value
    if (!p) return
    feedback.value = ''
    answer.value = a // yes or no | assings follow up to followupY or N
    const said = a === 'yes' ? 'Yes' : 'No'

    if (p.kind === 'yes-no' || (p.kind === 'choice' && a === 'no')) {
      record({ answer: a, prompt: p.question, response: said })
      feedback.value = 'Thank you.'
      goToNext()
      return
    }
    if (p.kind === 'choice') {
      step.value = 'choice'
      return
    }
    response.value = saved.value[p.id]?.response ?? ''
    step.value = 'followup' // switches screen to follow up question
  }

  function pickChoice(choice: string) {
    const p = prompt.value
    if (!p) return
    record({
      answer: p.kind === 'choice' ? 'yes' : undefined,
      prompt: `${p.question} ${p.choiceQuestion ?? ''}`.trim(),
      response: choice,
    })
    feedback.value = 'Thank you.'
    goToNext()
  }

  function saveAndNext() {
    const p = prompt.value
    if (!p) return
    const text = response.value.trim() // if only space, trim will make it an empty string
    record({
      answer: p.kind === 'open' ? undefined : answer.value,
      prompt: headingText.value,
      response: text,
    })
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
    startLevel(1)
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
    <ActivitiesReminiscenceLevelPicker
      :levels="pickerLevels"
      :current="level"
      @select="startLevel"
    />

    <p aria-live="polite" class="mt-4 min-h-[2.5rem] font-semibold text-green-800 print:hidden">
      {{ feedback }}
    </p>

    <div
      v-if="step !== 'done' && prompt"
      class="rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 sm:p-10 print:hidden"
    >
      <p class="font-semibold text-orange-800">
        Level {{ level }} · Question {{ index + 1 }} of {{ total }} · {{ levelInfo.label }}
      </p>

      <h2
        ref="heading"
        tabindex="-1"
        class="bn-font-display mt-6 text-3xl leading-snug font-bold focus:outline-none sm:text-4xl"
      >
        {{ headingText }}
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

      <!-- Pick one answer -->
      <template v-else-if="step === 'choice'">
        <div class="mt-8 grid gap-4 sm:grid-cols-2">
          <button
            v-for="choice in prompt.choices"
            :key="choice"
            type="button"
            :class="btnQuiet"
            @click="pickChoice(choice)"
          >
            {{ choice }}
          </button>
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
        You finished Level {{ level }}
      </h2>
      <p class="mt-4 leading-relaxed">
        {{
          savedStories.length
            ? 'Thank you for sharing your story. Your answers are saved below.'
            : 'You did not write anything down this time. That is okay. Talking about it counts too.'
        }}
      </p>

      <!-- Start over asks first, so stories are never erased by accident -->
      <div v-if="!confirmingStartOver" class="mt-8 grid gap-4 sm:grid-cols-2 print:hidden">
        <button
          v-if="upcomingLevel"
          type="button"
          :class="btnPrimary"
          @click="startLevel(upcomingLevel)"
        >
          Go to Level {{ upcomingLevel }}
        </button>
        <button v-if="savedStories.length" type="button" :class="btnPrimary" @click="printStory">
          Print my stories
        </button>
        <button type="button" :class="btnQuiet" @click="startLevel(level)">
          Do this level again
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

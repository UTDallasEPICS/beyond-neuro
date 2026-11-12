<script setup lang="ts">
  import { journalLevels, journalPrompts } from '~/data/reminiscence/journal-prompts'
  import {
    REMINISCENCE_LEVELS,
    nextLevel,
    type ReminiscenceLevel,
  } from '~/data/reminiscence/levels'

  interface SavedEntry {
    title: string
    fields: Array<{ id: string; label: string; value: string }>
    savedAt: string
  }

  const STORAGE_KEY = 'bn-reminiscence-journal'

  type Step = 'entry' | 'done'
  const step = ref<Step>('entry')
  const level = ref<ReminiscenceLevel>(1)
  const index = ref(0)
  const values = ref<Record<string, string>>({})
  const saved = ref<Record<string, SavedEntry>>({})
  const feedback = ref('')
  const confirmingStartOver = ref(false)
  const heading = ref<HTMLElement | null>(null)

  const levelPrompts = computed(() => journalPrompts.filter((p) => p.level === level.value))
  const total = computed(() => levelPrompts.value.length)
  const prompt = computed(() => levelPrompts.value[index.value])
  const levelInfo = computed(() => journalLevels[level.value])
  const upcomingLevel = computed(() => nextLevel(level.value))

  const pickerLevels = REMINISCENCE_LEVELS.map((l) => ({ level: l, ...journalLevels[l] }))

  const journal = computed(() =>
    journalPrompts
      .filter((p) => saved.value[p.id])
      .map((p) => ({ id: p.id, ...saved.value[p.id]! }))
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
  )

  onMounted(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) saved.value = JSON.parse(raw)
    } catch {
      saved.value = {}
    }
    goTo(index.value)
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
    const p = levelPrompts.value[i]
    const previous = p ? saved.value[p.id] : undefined
    values.value = Object.fromEntries(
      (p?.fields ?? []).map((f) => [f.id, previous?.fields.find((s) => s.id === f.id)?.value ?? ''])
    )
    step.value = 'entry'
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

  function saveAndNext() {
    const p = prompt.value
    if (!p) return
    const fields = p.fields
      .map((f) => ({ id: f.id, label: f.label, value: (values.value[f.id] ?? '').trim() }))
      .filter((f) => f.value)

    if (fields.length) {
      saved.value = {
        ...saved.value,
        [p.id]: { title: p.title, fields, savedAt: new Date().toISOString() },
      }
      persist()
      feedback.value = 'Saved to your journal.'
    } else {
      feedback.value = 'Thank you. You can come back to this one any time.'
    }
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

  function printJournal() {
    window.print()
  }

  const btnBase =
    'inline-flex min-h-[72px] min-w-[72px] items-center justify-center gap-3 rounded-2xl px-6 py-3 text-2xl font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4'
  const btnPrimary = `${btnBase} bg-orange-700 text-white hover:bg-orange-800`
  const btnQuiet = `${btnBase} border-2 border-slate-400 bg-white text-[var(--bn-navy)] hover:bg-slate-50`
  const inputClass =
    'mt-3 w-full rounded-2xl border-2 border-slate-500 bg-white p-4 text-2xl leading-relaxed focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:outline-none'
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
      v-if="step === 'entry' && prompt"
      class="rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 sm:p-10 print:hidden"
    >
      <p class="font-semibold text-orange-800">
        Level {{ level }} · Page {{ index + 1 }} of {{ total }} · {{ levelInfo.label }}
      </p>
      <p class="mt-4 font-semibold text-[var(--bn-muted)]">{{ prompt.title }}</p>

      <h2
        ref="heading"
        tabindex="-1"
        class="bn-font-display mt-2 text-3xl leading-snug font-bold focus:outline-none sm:text-4xl"
      >
        {{ prompt.prompt }}
      </h2>
      <p class="mt-2 leading-relaxed text-[var(--bn-muted)]">
        Fill in as much or as little as you like.
      </p>

      <form class="mt-6 space-y-8" @submit.prevent="saveAndNext">
        <div v-for="field in prompt.fields" :key="`${prompt.id}-${field.id}`">
          <label :for="`journal-${field.id}`" class="block font-semibold">{{ field.label }}</label>

          <div
            v-if="field.suggestions"
            role="group"
            :aria-label="`Choices for ${field.label}`"
            class="mt-3 flex flex-wrap gap-3"
          >
            <button
              v-for="suggestion in field.suggestions"
              :key="suggestion"
              type="button"
              :aria-pressed="values[field.id] === suggestion"
              class="min-h-[72px] rounded-2xl border-2 px-5 text-2xl font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
              :class="
                values[field.id] === suggestion
                  ? 'border-orange-700 bg-orange-700 text-white'
                  : 'border-slate-400 bg-white hover:bg-slate-50'
              "
              @click="values[field.id] = suggestion"
            >
              {{ suggestion }}
            </button>
          </div>

          <textarea
            v-if="field.long"
            :id="`journal-${field.id}`"
            v-model="values[field.id]"
            rows="4"
            :class="inputClass"
          />
          <input
            v-else
            :id="`journal-${field.id}`"
            v-model="values[field.id]"
            type="text"
            :placeholder="field.suggestions ? 'Or write your own' : ''"
            :class="[inputClass, 'min-h-[72px]']"
          />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <button type="submit" :class="btnPrimary">Save to my journal</button>
          <button type="button" :class="btnQuiet" @click="skip">Skip this one</button>
        </div>
      </form>
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
        You finished Level {{ level }}
      </h2>
      <p class="mt-4 leading-relaxed">
        {{
          journal.length
            ? 'Your journal pages are saved below.'
            : 'You did not write anything down this time. That is okay. Talking about it counts too.'
        }}
      </p>

      <div v-if="!confirmingStartOver" class="mt-8 grid gap-4 sm:grid-cols-2 print:hidden">
        <button
          v-if="upcomingLevel"
          type="button"
          :class="btnPrimary"
          @click="startLevel(upcomingLevel)"
        >
          Go to Level {{ upcomingLevel }}
        </button>
        <button v-if="journal.length" type="button" :class="btnPrimary" @click="printJournal">
          Print my journal
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
        aria-labelledby="journal-start-over-title"
        class="mt-8 rounded-2xl border-2 border-orange-700 bg-white p-6 print:hidden"
      >
        <p id="journal-start-over-title" class="font-semibold">
          Starting over will clear your journal. Do you want to start over?
        </p>
        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          <button type="button" :class="btnQuiet" @click="confirmingStartOver = false">
            Keep my journal
          </button>
          <button type="button" :class="btnPrimary" @click="startOver">Yes, start over</button>
        </div>
      </div>
    </div>

    <section v-if="journal.length" aria-labelledby="journal-title" class="mt-10">
      <h2 id="journal-title" class="bn-font-display text-3xl font-bold">
        My journal ({{ journal.length }} {{ journal.length === 1 ? 'page' : 'pages' }})
      </h2>
      <ul class="mt-6 list-none space-y-4 p-0">
        <li
          v-for="entry in journal"
          :key="entry.id"
          class="rounded-2xl border border-[var(--bn-border)] bg-white p-6"
        >
          <h3 class="bn-font-display text-2xl font-bold">{{ entry.title }}</h3>
          <dl class="mt-3 space-y-3">
            <div v-for="field in entry.fields" :key="field.id">
              <dt class="text-[var(--bn-muted)]">{{ field.label }}</dt>
              <dd class="leading-relaxed whitespace-pre-line">{{ field.value }}</dd>
            </div>
          </dl>
        </li>
      </ul>
    </section>
  </section>
</template>

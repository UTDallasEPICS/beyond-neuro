<script setup lang="ts">
  import {
    buildLevel,
    photoLevels,
    type PhotoObjectId,
    type PhotoRound,
  } from '~/data/reminiscence/photo-memory-prompts'
  import {
    REMINISCENCE_LEVELS,
    nextLevel,
    type ReminiscenceLevel,
  } from '~/data/reminiscence/levels'

  interface SavedMemory {
    name: string
    question: string
    response: string
    savedAt: string
  }

  const STORAGE_KEY = 'bn-photo-find-memories'

  type Step = 'find' | 'talk' | 'done'
  const step = ref<Step>('find')
  const level = ref<ReminiscenceLevel>(1)
  const rounds = ref<PhotoRound[]>([])
  const roundIndex = ref(0)
  const selected = ref<Set<string>>(new Set())
  const revealed = ref(false)
  const questionIndex = ref(0)
  const response = ref('')
  const saved = ref<Partial<Record<PhotoObjectId, SavedMemory>>>({})
  const feedback = ref('')

  const heading = ref<HTMLElement | null>(null)

  const round = computed(() => rounds.value[roundIndex.value])
  const rule = computed(() => photoLevels[level.value])
  const upcomingLevel = computed(() => nextLevel(level.value))
  const targetKeys = computed(
    () => new Set(round.value?.tiles.filter((t) => t.isTarget).map((t) => t.key) ?? [])
  )
  const memoryPrompt = computed(() => round.value?.target.memoryPrompts[questionIndex.value] ?? '')
  const foundPhoto = computed(() => round.value?.tiles.find((t) => t.isTarget))

  const findPrompt = computed(() => {
    const target = round.value?.target
    if (!target) return ''
    return rule.value.targets === 1
      ? `Tap the picture of a ${target.name}`
      : `Tap every picture of a ${target.name}`
  })

  const pickerLevels = REMINISCENCE_LEVELS.map((l) => ({
    level: l,
    label: photoLevels[l].label,
    description: photoLevels[l].description,
  }))

  const savedMemories = computed(() =>
    Object.entries(saved.value)
      .filter(([, s]) => s?.response)
      .map(([id, s]) => ({ id, ...s! }))
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
  )

  onMounted(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) saved.value = JSON.parse(raw)
    } catch {
      saved.value = {}
    }
    startLevel(1)
  })

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved.value))
    } catch {
      // Storage full or disabled
    }
  }

  watch([step, roundIndex], () => nextTick(() => heading.value?.focus()))

  function goToRound(i: number) {
    roundIndex.value = i
    selected.value = new Set()
    revealed.value = false
    questionIndex.value = 0
    response.value = ''
    step.value = 'find'
  }

  function startLevel(l: ReminiscenceLevel) {
    feedback.value = ''
    level.value = l
    rounds.value = buildLevel(l)
    goToRound(0)
  }

  function toggle(key: string) {
    if (revealed.value) return
    const next = new Set(selected.value)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    selected.value = next
    feedback.value = ''
  }

  function startTalking() {
    const target = round.value?.target
    if (!target) return
    response.value = saved.value[target.id]?.response ?? ''
    step.value = 'talk'
  }

  function check() {
    const target = round.value?.target
    if (!target) return
    const picks = [...selected.value]
    const wrong = picks.filter((k) => !targetKeys.value.has(k)).length
    const missing = targetKeys.value.size - (picks.length - wrong)

    if (!wrong && !missing) {
      feedback.value =
        targetKeys.value.size === 1
          ? `Well done! You found the ${target.name}.`
          : `Well done! You found all the ${target.plural}.`
      startTalking()
      return
    }

    const parts = ['Not quite.']
    if (wrong)
      parts.push(
        `${wrong === 1 ? 'One picture you picked is' : `${wrong} pictures you picked are`} not a ${target.name}.`
      )
    if (missing)
      parts.push(`${missing === 1 ? 'There is 1 more' : `There are ${missing} more`} to find.`)
    feedback.value = parts.join(' ')
  }

  function showMe() {
    const target = round.value?.target
    if (!target) return
    revealed.value = true
    selected.value = new Set(targetKeys.value)
    feedback.value =
      targetKeys.value.size === 1
        ? `Here it is. That is the ${target.name}.`
        : `Here they are. These are the ${target.plural}.`
  }

  function nextQuestion() {
    const target = round.value?.target
    if (!target) return
    questionIndex.value = (questionIndex.value + 1) % target.memoryPrompts.length
  }

  function goToNext() {
    if (roundIndex.value < rounds.value.length - 1) goToRound(roundIndex.value + 1)
    else step.value = 'done'
  }

  function saveAndNext() {
    const target = round.value?.target
    if (!target) return
    const text = response.value.trim()
    saved.value = {
      ...saved.value,
      [target.id]: {
        name: target.name,
        question: memoryPrompt.value,
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
    startLevel(1)
  }

  function printMemories() {
    window.print()
  }

  function tileClass(key: string) {
    if (revealed.value && targetKeys.value.has(key)) return 'border-green-700 ring-4 ring-green-700'
    if (selected.value.has(key)) return 'border-orange-700 ring-4 ring-orange-700'
    return 'border-[var(--bn-border)]'
  }

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
      v-if="step !== 'done' && round"
      class="rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 sm:p-10 print:hidden"
    >
      <p class="font-semibold text-orange-800">
        Level {{ level }} · Round {{ roundIndex + 1 }} of {{ rounds.length }} · {{ rule.label }}
      </p>

      <template v-if="step === 'find'">
        <h2
          ref="heading"
          tabindex="-1"
          class="bn-font-display mt-4 text-3xl leading-snug font-bold focus:outline-none sm:text-4xl"
        >
          {{ findPrompt }}
        </h2>
        <p class="mt-2 text-[var(--bn-muted)]">
          {{ rule.targets === 1 ? 'There is 1 to find.' : `There are ${rule.targets} to find.` }}
          Tap a picture again to unselect it.
        </p>

        <ul
          class="mt-6 grid list-none gap-3 p-0 sm:gap-4"
          :class="rule.tiles === 4 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'"
        >
          <li v-for="tile in round.tiles" :key="tile.key">
            <button
              type="button"
              :aria-pressed="selected.has(tile.key)"
              :aria-label="tile.alt"
              class="relative block w-full overflow-hidden rounded-2xl border-2 bg-white focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
              :class="tileClass(tile.key)"
              @click="toggle(tile.key)"
            >
              <img
                :src="tile.src"
                :alt="tile.alt"
                width="512"
                height="512"
                class="aspect-square w-full object-cover"
              />
              <span
                v-if="selected.has(tile.key)"
                aria-hidden="true"
                class="absolute top-2 right-2 flex size-12 items-center justify-center rounded-full text-2xl font-bold text-white"
                :class="revealed ? 'bg-green-700' : 'bg-orange-700'"
              >
                ✓
              </span>
            </button>
          </li>
        </ul>

        <div class="mt-8 grid gap-4 sm:grid-cols-2">
          <button v-if="!revealed" type="button" :class="btnPrimary" @click="check">
            Check my answer
          </button>
          <button v-if="!revealed" type="button" :class="btnQuiet" @click="showMe">Show me</button>
          <button v-else type="button" :class="[btnPrimary, 'sm:col-span-2']" @click="startTalking">
            Continue
          </button>
        </div>
      </template>

      <template v-else>
        <img
          v-if="foundPhoto"
          :src="foundPhoto.src"
          :alt="foundPhoto.alt"
          width="512"
          height="512"
          class="mt-4 aspect-[4/3] w-full rounded-2xl border border-[var(--bn-border)] bg-white object-cover"
        />

        <h2
          ref="heading"
          tabindex="-1"
          class="bn-font-display mt-6 text-3xl leading-snug font-bold focus:outline-none sm:text-4xl"
        >
          {{ memoryPrompt }}
        </h2>

        <button type="button" :class="[btnQuiet, 'mt-4 w-full']" @click="nextQuestion">
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
          <button type="button" :class="btnPrimary" @click="saveAndNext">Save and continue</button>
          <button type="button" :class="btnQuiet" @click="skip">Skip</button>
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
        You finished Level {{ level }}
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
          v-if="upcomingLevel"
          type="button"
          :class="btnPrimary"
          @click="startLevel(upcomingLevel)"
        >
          Go to Level {{ upcomingLevel }}
        </button>
        <button
          v-if="savedMemories.length"
          type="button"
          :class="btnPrimary"
          @click="printMemories"
        >
          Print my memories
        </button>
        <button type="button" :class="btnQuiet" @click="startLevel(level)">
          Play this level with new pictures
        </button>
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
            <p class="font-semibold capitalize">{{ memory.name }}</p>
            <p class="mt-1 leading-relaxed text-[var(--bn-muted)]">{{ memory.question }}</p>
            <p class="mt-3 leading-relaxed whitespace-pre-line">{{ memory.response }}</p>
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { LEVELS, LEVEL_INFO, type Level } from '~/data/dual-task/SyllableWords'

  type Step = 'level' | 'play' | 'done'

  const step = ref<Step>('level')
  const {
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
  } = useClapItOut()

  const nextLevel = computed<Level | null>(() =>
    level.value < 7 ? ((level.value + 1) as Level) : null
  )

  function chooseLevel(l: Level) {
    start(l)
    step.value = 'play'
  }

  function nextWord() {
    if (!next()) finish()
  }

  function finish() {
    stop()
    step.value = 'done'
  }

  function pickLevel() {
    stop()
    step.value = 'level'
  }

  const bigButton =
    'flex min-h-[72px] w-full items-center justify-center rounded-2xl px-6 text-xl font-bold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:outline-none disabled:opacity-50'
  const primary = `${bigButton} bg-orange-700 text-white hover:bg-orange-800`
  const secondary = `${bigButton} border-2 border-[var(--bn-navy)] bg-white text-[var(--bn-navy)]`
</script>

<template>
  <div class="mt-6 rounded-2xl border border-[var(--bn-border)] bg-white p-6 sm:p-8">
    <!-- choose level -->
    <div v-if="step === 'level'">
      <h3 class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">Pick your level</h3>
      <p class="mt-2 text-lg text-[var(--bn-muted)]">
        You will see a word. Say it out loud and clap once for each part. You can change levels
        anytime.
      </p>
      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <button
          v-for="l in LEVELS"
          :key="l"
          type="button"
          :class="[secondary, 'flex-col gap-1 py-4']"
          @click="chooseLevel(l)"
        >
          <span>Level {{ l }}</span>
          <span class="text-base font-normal">{{ LEVEL_INFO[l].name }}</span>
          <span class="text-base font-normal text-[var(--bn-muted)]">
            {{ LEVEL_INFO[l].example }}
          </span>
        </button>
      </div>
    </div>

    <!-- Step 2 clap the words -->
    <div v-else-if="step === 'play' && current">
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <p class="text-lg font-semibold text-[var(--bn-muted)]">
          Level {{ level }} · {{ LEVEL_INFO[level].name }}
        </p>
        <p class="text-lg text-[var(--bn-muted)]">Word {{ index + 1 }} of {{ total }}</p>
      </div>

      <div class="mt-8 flex flex-col items-center text-center">
        <span class="text-[96px] leading-none" aria-hidden="true">{{ current.emoji }}</span>

        <div class="mt-6 min-h-[72px]" aria-live="polite">
          <p
            v-if="!revealed"
            class="bn-font-display text-4xl font-bold text-[var(--bn-navy)] sm:text-5xl"
          >
            {{ current.label }}
          </p>
          <template v-else>
            <p class="sr-only">{{ current.label }}: {{ current.syllables.join(', ') }}</p>
            <ul class="flex list-none flex-wrap justify-center gap-3 p-0" aria-hidden="true">
              <li
                v-for="(syllable, i) in current.syllables"
                :key="i"
                class="bn-font-display rounded-2xl border-2 px-5 py-3 text-3xl font-bold motion-safe:transition-transform sm:text-4xl"
                :class="
                  activeBeat === i
                    ? 'border-orange-700 bg-orange-700 text-white motion-safe:scale-110'
                    : 'border-[var(--bn-border)] bg-[var(--bn-cream)] text-[var(--bn-navy)]'
                "
              >
                {{ syllable }}
              </li>
            </ul>
          </template>
        </div>

        <p v-if="demoPlayed" class="mt-4 text-2xl font-bold text-orange-800">
          {{ current.syllables.length }} {{ current.syllables.length === 1 ? 'clap' : 'claps' }}
        </p>
      </div>

      <p class="mt-8 text-center text-xl text-[var(--bn-navy)]">
        Say it out loud and clap once for each part.
      </p>

      <div class="mt-8 grid gap-4 sm:grid-cols-2">
        <button type="button" :class="secondary" @click="hearIt">Hear it</button>
        <button type="button" :class="secondary" :disabled="playing" @click="playDemo">
          {{ revealed ? 'Clap along again' : 'Show me' }}
        </button>
      </div>
      <button type="button" :class="[primary, 'mt-4']" @click="nextWord">
        {{ hasNext ? 'Next word' : 'Finish' }}
      </button>

      <div class="mt-6 flex justify-end">
        <button
          type="button"
          class="min-h-[72px] px-4 text-lg font-semibold text-orange-800"
          @click="finish"
        >
          End
        </button>
      </div>
    </div>

    <!-- Step 3 done -->
    <div v-else class="text-center">
      <p class="bn-font-display text-3xl font-bold text-[var(--bn-navy)]">Great work!</p>
      <p class="mt-4 text-xl text-[var(--bn-navy)]">
        You clapped out {{ wordsSeen }} {{ wordsSeen === 1 ? 'word' : 'words' }}. Saying and
        clapping together trains your brain and body at the same time.
      </p>
      <div class="mt-8 flex flex-col gap-4">
        <button v-if="nextLevel" type="button" :class="primary" @click="chooseLevel(nextLevel)">
          Next level
        </button>
        <button
          type="button"
          :class="nextLevel ? secondary : primary"
          @click="chooseLevel(level)"
        >
          Do it again
        </button>
        <button type="button" :class="secondary" @click="pickLevel">Try another level</button>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
const levelHints = ['Simple words', 'Everyday words', 'Longer words', 'Short sentences', 'Longer sentences', 'Extended sentences', 'Two-part sentences']
  const levels = [
    {
      id: 'level-1',
      label: 'Level 1',
      words: [
        'cat', 'sun', 'dog', 'hat', 'pen',
        'cup', 'bed', 'red', 'box', 'car',
      ],
    },
    {
      id: 'level-2',
      label: 'Level 2',
      words: [
        'apple', 'water', 'house', 'happy', 'green',
        'table', 'chair', 'smile', 'bread', 'flower',
      ],
    },
    {
      id: 'level-3',
      label: 'Level 3',
      words: [
        'beautiful','important','different','wonderful',
        'knowledge','adventure','experience',
        'imagination','confidence','opportunity',
      ],
    },
    {
      id: 'level-4',
      label: 'Level 4',
      words: [
        'Practice makes perfect.',
        'Better late than never.',
        'Every day is a new day.',
        'Actions speak louder than words.',
        'A picture is worth a thousand words.',
      ],
    },
    {
      id: 'level-5',
      label: 'Level 5',
      words: [
        'The early bird catches the worm.',
        'A journey of a thousand miles begins with a single step.',
        'Where there is a will, there is a way.',
        'The best things in life are free.',
        'Good things come to those who wait.',
      ],
    },
    {
      id: 'level-6',
      label: 'Level 6',
      words: [
        'When life gives you lemons, make lemonade.',
        'A little progress each day adds up to big results.',
        'The more you learn, the more you grow.',
        'It always seems impossible until it is done.',
        'The secret of getting ahead is getting started.',
      ],
    },
    {
      id: 'level-7',
      label: 'Level 7',
      words: [
        'Life is like riding a bicycle. To keep your balance, you must keep moving.',
        'The journey of a thousand miles begins with a single step, and every step matters.',
        'Success is not final, failure is not fatal: it is the courage to continue that counts.',
        'The future depends on what you do today, so make every moment count.',
        'Great things are not done by impulse, but by a series of small things brought together.',
      ],
    },
  ] as const

  const selectedLevel = ref(0)
  const currentIndex = ref(0)
  const typedText = ref('')
  const inputRef = ref<HTMLTextAreaElement | null>(null)
  const hasFocus = ref(false)

  const currentLevel = computed(() => levels[selectedLevel.value]!)
  const currentPrompt = computed(() => currentLevel.value.words[currentIndex.value]!)
  const isSentence = computed(() => selectedLevel.value >= 3)

  const characters = computed(() => Array.from(currentPrompt.value))
  const typedCharacters = computed(() => Array.from(typedText.value))

  const completed = computed(() => typedText.value === currentPrompt.value)

  const correctCount = computed(() =>
    typedCharacters.value.filter(
      (char, index) => char === characters.value[index],
    ).length,
  )

  const isLastPrompt = computed(
    () => currentIndex.value === currentLevel.value.words.length - 1,
  )

  const levelFinished = computed(
    () => completed.value && isLastPrompt.value,
  )

  function focusInput() {
    if (!completed.value) inputRef.value?.focus()
  }

  function reset() {
    currentIndex.value = 0
    typedText.value = ''
    nextTick(focusInput)
  }

  function restartPrompt() {
    typedText.value = ''
    nextTick(focusInput)
  }

  function chooseLevel(index: number) {
    selectedLevel.value = index
    reset()
  }

  function nextPrompt() {
    if (!completed.value || isLastPrompt.value) return

    currentIndex.value++
    typedText.value = ''
    nextTick(focusInput)
  }

  function onInput(event: Event) {
    const element = event.target as HTMLTextAreaElement

    typedText.value = element.value
      .replace(/\r?\n/g, ' ')
      .slice(0, currentPrompt.value.length)

    element.value = typedText.value
  }

  function characterClass(index: number) {
    if (index >= typedCharacters.value.length) {
      return 'text-slate-400'
    }

    return typedCharacters.value[index] === characters.value[index]
      ? 'text-[var(--bn-navy)]'
      : 'rounded-sm bg-red-100 text-red-700'
  }
</script>

<template>
  <div>
    <h2 class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">
      Choose a level
    </h2>

    <p class="mt-1 text-lg text-[var(--bn-muted)]">
      You can change this any time.
    </p>

    <div
      class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4"
      role="group"
      aria-label="Difficulty level"
    >
      <button
        v-for="(level, index) in levels"
        :key="level.id"
        type="button"
        class="min-h-[72px] rounded-2xl border-2 p-4 text-left transition-colors focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
        :class="
          selectedLevel === index
            ? 'border-orange-700 bg-[var(--bn-peach)]'
            : 'border-slate-300 bg-white hover:bg-slate-50'
        "
        :aria-pressed="selectedLevel === index"
        @click="chooseLevel(index)"
      >
        <span class="block text-lg font-bold text-[var(--bn-navy)]">
          {{ level.label }}
        </span>

        <span class="block text-lg text-[var(--bn-muted)]">
          {{ levelHints[index] }}
        </span>
      </button>
    </div>

    <ActivityCard
      class="mt-6"
      instructions="Type the word or sentence as it appears. Click the text to start. Take your time — there is no timer."
      @clear="reset"
    >
      <div
        class="mt-6 rounded-2xl border border-[var(--bn-border)] bg-white p-6 sm:p-8"
      >
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p class="text-lg text-[var(--bn-muted)]">
            {{ isSentence ? 'Sentence' : 'Word' }}
            {{ currentIndex + 1 }} of {{ currentLevel.words.length }}
          </p>

          <p class="text-lg font-semibold text-[var(--bn-navy)]">
            {{ currentLevel.label }}
          </p>
        </div>

        <div
          class="relative min-h-[150px] cursor-text rounded-2xl border border-[var(--bn-border)] p-5 focus-within:ring-4 focus-within:ring-[var(--bn-navy)]"
          @click="focusInput"
        >
          <div
            aria-hidden="true"
            class="pointer-events-none font-mono text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.85] tracking-wide break-words select-none"
          ><span
              v-for="(character, index) in characters"
              :key="index"
              class="relative whitespace-pre-wrap"
              :class="characterClass(index)"
            ><span
                v-if="
                  index === typedCharacters.length &&
                  hasFocus &&
                  !completed
                "
                class="absolute top-[0.12em] bottom-[0.12em] left-0 w-[3px] rounded-full bg-amber-500"
              />{{ character }}</span><span
              v-if="
                typedCharacters.length === characters.length &&
                hasFocus &&
                !completed
              "
              class="inline-block h-[1.2em] w-[3px] translate-y-[0.2em] bg-amber-500"
            /></div>

          <textarea
            ref="inputRef"
            :value="typedText"
            :disabled="completed"
            :aria-label="`Type: ${currentPrompt}`"
            aria-describedby="typing-help"
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            class="absolute inset-0 h-full w-full resize-none cursor-text opacity-0"
            @input="onInput"
            @focus="hasFocus = true"
            @blur="hasFocus = false"
            @keydown.enter.prevent
          />
        </div>

        <p
          id="typing-help"
          class="mt-4 text-lg text-[var(--bn-muted)]"
        >
          Click the text and start typing. Use Backspace to correct a letter.
        </p>

        <div class="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p class="text-lg font-semibold text-[var(--bn-navy)]">
            {{ typedCharacters.length }} / {{ characters.length }} characters

            <span class="ml-2 font-normal text-[var(--bn-muted)]">
              · {{ correctCount }} correct
            </span>
          </p>

          <button
            type="button"
            class="min-h-[56px] rounded-2xl border-2 border-slate-400 bg-white px-6 py-3 text-lg font-semibold text-[var(--bn-navy)] hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
            @click="restartPrompt"
          >
            Restart
          </button>
        </div>

        <div
          v-if="completed"
          id="typing-result"
          class="mt-6"
          role="status"
        >
          <p class="text-lg font-semibold text-green-700">
            {{
              levelFinished
                ? 'Great work! You completed this level!'
                : 'Great work! Correct!'
            }}
          </p>

          <button
            v-if="!isLastPrompt"
            type="button"
            class="mt-4 min-h-[56px] rounded-2xl border-2 border-slate-400 bg-white px-6 py-3 text-lg font-semibold text-[var(--bn-navy)] hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
            @click="nextPrompt"
          >
            Next {{ isSentence ? 'Sentence' : 'Word' }}
          </button>

          <button
            v-else
            type="button"
            class="mt-4 min-h-[56px] rounded-2xl border-2 border-slate-400 bg-white px-6 py-3 text-lg font-semibold text-[var(--bn-navy)] hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
            @click="reset"
          >
            Practice Again
          </button>
        </div>
      </div>
    </ActivityCard>
  </div>
</template>
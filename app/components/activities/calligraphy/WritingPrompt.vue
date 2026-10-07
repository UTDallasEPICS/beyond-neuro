<script setup lang="ts">
  const levels = [
    {
      id: 'simple',
      label: 'Simple',
      words: ['sun', 'cat', 'book', 'tree', 'home'],
    },
    {
      id: 'medium',
      label: 'Medium',
      words: ['family', 'garden', 'morning', 'friend', 'music'],
    },
    {
      id: 'complex',
      label: 'Complex',
      words: ['beautiful', 'remember', 'community', 'celebrate', 'wonderful'],
    },
  ] as const

  const selectedLevel = ref(0)
  const wordIndex = ref(0)
  const typedText = ref('')
  const message = ref('')

  const currentLevel = computed(() => levels[selectedLevel.value]!)
  const currentWord = computed(() => currentLevel.value.words[wordIndex.value]!)

  function chooseLevel(index: number) {
    selectedLevel.value = index
    wordIndex.value = 0
    typedText.value = ''
    message.value = ''
  }

  function checkWord() {
    const answer = typedText.value.trim().toLowerCase()

    if (!answer) {
      message.value = 'Type the word when you are ready.'
      return
    }

    if (answer === currentWord.value.toLowerCase()) {
      message.value = 'Great job! You typed the word.'
    } else {
      message.value = 'Almost there. Take your time and try again.'
    }
  }

  function nextWord() {
    wordIndex.value = (wordIndex.value + 1) % currentLevel.value.words.length
    typedText.value = ''
    message.value = ''
  }

  function clearInput() {
    typedText.value = ''
    message.value = ''
  }
</script>

<template>
  <ActivityCard
    instructions="Type the word shown below. Take your time — there is no timer and no rush."
    @clear="clearInput"
  >
    <template #palette>
      <div class="flex flex-wrap items-center gap-3">
        <span class="text-lg font-semibold text-[var(--bn-navy)]">Level:</span>

        <button
          v-for="(level, index) in levels"
          :key="level.id"
          type="button"
          class="min-h-[56px] rounded-full border-2 px-5 py-3 text-lg font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
          :class="
            selectedLevel === index
              ? 'border-[var(--bn-navy)] bg-[var(--bn-navy)] text-white'
              : 'border-[var(--bn-border)] bg-white text-[var(--bn-navy)] hover:border-orange-700'
          "
          :aria-pressed="selectedLevel === index"
          @click="chooseLevel(index)"
        >
          {{ level.label }}
        </button>
      </div>
    </template>

    <div class="mt-8 rounded-2xl border border-[var(--bn-border)] bg-white p-6 sm:p-8">
      <p class="text-lg text-[var(--bn-muted)]">
        Type this word
      </p>

      <p
        class="bn-font-display mt-3 text-center text-4xl font-bold tracking-wide text-[var(--bn-navy)] sm:text-5xl"
        aria-live="polite"
      >
        {{ currentWord }}
      </p>

      <label
        for="writing-input"
        class="mt-8 block text-lg font-semibold text-[var(--bn-navy)]"
      >
        Your answer
      </label>

      <input
        id="writing-input"
        v-model="typedText"
        type="text"
        autocomplete="off"
        autocapitalize="none"
        spellcheck="false"
        class="mt-2 min-h-[64px] w-full rounded-2xl border-2 border-[var(--bn-border)] bg-white px-5 py-3 text-2xl text-[var(--bn-navy)] focus:border-[var(--bn-navy)] focus:ring-4 focus:ring-[var(--bn-navy)]/20 focus:outline-none"
        :aria-describedby="message ? 'writing-feedback' : undefined"
        @keydown.enter.prevent="checkWord"
      />

      <div class="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          class="min-h-[56px] rounded-2xl bg-[var(--bn-navy)] px-6 py-3 text-lg font-semibold text-white focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
          @click="checkWord"
        >
          Check
        </button>

        <button
          type="button"
          class="min-h-[56px] rounded-2xl border-2 border-[var(--bn-border)] bg-white px-6 py-3 text-lg font-semibold text-[var(--bn-navy)] hover:border-orange-700 focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
          @click="nextWord"
        >
          Next word
        </button>
      </div>

      <p
        v-if="message"
        id="writing-feedback"
        class="mt-5 text-lg font-semibold text-[var(--bn-navy)]"
        aria-live="polite"
      >
        {{ message }}
      </p>
    </div>
  </ActivityCard>
</template>
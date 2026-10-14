<script setup lang="ts">
  interface CardDefinition {
    emoji: string
    // Read aloud by screen readers when the card is face up.
    label: string
  }

  interface Card extends CardDefinition {
    // Two cards share each emoji, so Vue needs a separate unique key.
    id: number
    isFlipped: boolean
    isMatched: boolean
  }

  const cardDefinitions: CardDefinition[] = [
    { emoji: '🌹', label: 'Rose' },
    { emoji: '🌻', label: 'Sunflower' },
    { emoji: '🌼', label: 'Daisy' },
  ]

  // Fisher–Yates shuffle on a copy, so the original list is never modified.
  function shuffle<T>(list: T[]): T[] {
    const copy = [...list]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = copy[i]!
      copy[i] = copy[j]!
      copy[j] = temp
    }
    return copy
  }

  function createShuffledCards(): Card[] {
    return shuffle([...cardDefinitions, ...cardDefinitions]).map((def, index) => ({
      ...def,
      id: index,
      isFlipped: false,
      isMatched: false,
    }))
  }

  const cards = ref<Card[]>(createShuffledCards())
  const flippedCards = computed(() => cards.value.filter((c) => c.isFlipped && !c.isMatched))
  const isComplete = computed(() => cards.value.every((c) => c.isMatched))
  const message = ref('')
  const isPaused = ref(false)

  function flipCard(card: Card) {
    if (card.isFlipped || card.isMatched) return

    // A mismatched pair stays face up until the next tap instead of on a timer,
    // so nobody is rushed to memorise it.
    if (flippedCards.value.length === 2) {
      flippedCards.value.forEach((c) => (c.isFlipped = false))
    }

    card.isFlipped = true
    message.value = ''

    if (flippedCards.value.length === 2) {
      checkForMatch()
    }
  }

  function checkForMatch() {
    const [first, second] = flippedCards.value
    if (!first || !second) return

    if (first.emoji === second.emoji) {
      first.isMatched = true
      second.isMatched = true
      message.value = isComplete.value
        ? 'You matched them all! Wonderful work!'
        : 'Nice job, that is a match!'
    } else {
      message.value = 'Not a match. Take a look, then tap another card.'
    }
  }

  function togglePause() {
    isPaused.value = !isPaused.value
  }

  function newGame() {
    cards.value = createShuffledCards()
    message.value = ''
    isPaused.value = false
  }

  function cardLabel(card: Card, index: number) {
    if (card.isMatched) return `${card.label}, matched`
    if (card.isFlipped) return card.label
    return `Card ${index + 1}, face down`
  }

  const btnQuiet =
    'inline-flex min-h-[56px] items-center justify-center rounded-2xl border-2 border-slate-400 bg-white px-6 py-3 text-lg font-semibold text-[var(--bn-navy)] hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none'
</script>

<template>
  <section
    aria-labelledby="matching-title"
    class="rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 sm:p-10"
  >
    <div class="flex flex-wrap items-center gap-4">
      <h2 id="matching-title" class="text-lg font-bold tracking-wide text-orange-800 uppercase">
        Find the matching pairs
      </h2>
      <div class="ml-auto flex flex-wrap gap-3">
        <button type="button" :class="btnQuiet" :aria-pressed="isPaused" @click="togglePause">
          {{ isPaused ? 'Resume' : 'Pause' }}
        </button>
        <button type="button" :class="btnQuiet" @click="newGame">New game</button>
      </div>
    </div>

    <p class="mt-3 text-lg leading-relaxed text-[var(--bn-navy)] sm:text-xl">
      Tap a card to turn it over, then find its partner. Take as long as you like.
    </p>

    <p aria-live="polite" class="mt-4 min-h-[2.5rem] text-xl font-semibold text-green-800">
      {{ message }}
    </p>

    <div
      v-if="isPaused"
      class="rounded-2xl border border-[var(--bn-border)] bg-white px-6 py-16 text-center text-2xl text-[var(--bn-navy)]"
    >
      Game paused.
    </div>

    <div v-else class="grid grid-cols-3 gap-3 sm:gap-4">
      <button
        v-for="(card, index) in cards"
        :key="card.id"
        type="button"
        class="flex aspect-square items-center justify-center rounded-2xl border-2 text-[clamp(48px,10vw,88px)] focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
        :class="
          card.isMatched
            ? 'cursor-default border-[var(--bn-success)] bg-[var(--bn-success-bg)]'
            : card.isFlipped
              ? 'border-[var(--bn-navy)] bg-white'
              : 'border-[var(--bn-sidebar)] bg-[var(--bn-sidebar)] hover:bg-[var(--bn-navy)]'
        "
        :aria-label="cardLabel(card, index)"
        :aria-disabled="card.isMatched"
        @click="flipCard(card)"
      >
        <span v-if="card.isFlipped || card.isMatched" aria-hidden="true">{{ card.emoji }}</span>
      </button>
    </div>
  </section>
</template>

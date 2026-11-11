<script setup lang="ts">
  import { computed, ref } from 'vue'

  interface CardDefinition {
    emoji: string
    label: string
  }

  interface Card extends CardDefinition {
    //two cards share each emoji so thats why Vue needs a separate unique key
    id: number
    isFlipped: boolean
    isMatched: boolean
  }

  //every flower the game can use (each level takes the first few from this list)
  const cardDefinitions: CardDefinition[] = [
    { emoji: '🌹', label: 'Rose' },
    { emoji: '🌻', label: 'Sunflower' },
    { emoji: '🌼', label: 'Daisy' },
    { emoji: '🌷', label: 'Tulip' },
    { emoji: '🌸', label: 'Cherry blossom' },
    { emoji: '🌺', label: 'Hibiscus' },
    { emoji: '💐', label: 'Bouquet' },
    { emoji: '🏵️', label: 'Rosette' },
    { emoji: '🪷', label: 'Lotus' },
    { emoji: '🪻', label: 'Hyacinth' },
  ]

  //how many pairs each level has (level 1 has 3 pairs ... level 7 has 10 pairs)
  const LEVELS = [3, 4, 5, 6, 8, 9, 10]

  //how many columns for each number of cards so that every row is full
  //(6 cards = 3 across, 8 = 4, 10 = 5, 12 = 4, 16 = 4, 18 = 6, 20 = 5)
  const COLUMNS: Record<number, number> = { 6: 3, 8: 4, 10: 5, 12: 4, 16: 4, 18: 6, 20: 5 }

  //the original list is never modified.
  function shuffle(list: CardDefinition[]): CardDefinition[] {
    const copy = [...list]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = copy[i]!
      copy[i] = copy[j]!
      copy[j] = temp
    }
    return copy
  }

  //keeps track of which level the player is on
  const currentLevel = ref(0)
  const isLastLevel = computed(() => currentLevel.value === LEVELS.length - 1)

  function createShuffledCards(): Card[] {
    const pairs = cardDefinitions.slice(0, LEVELS[currentLevel.value])
    return shuffle([...pairs, ...pairs]).map((def, index) => ({
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

  //the board gets wider and the flowers get smaller as the levels grow
  const columns = computed(() => COLUMNS[cards.value.length] ?? 4)
  const boardStyle = computed(() => ({
    gridTemplateColumns: `repeat(${columns.value}, minmax(0, 1fr))`,
    maxWidth: columns.value <= 3 ? '520px' : columns.value === 4 ? '640px' : '820px',
  }))
  const emojiStyle = computed(() => {
    if (columns.value <= 3) return { fontSize: 'clamp(48px, 10vw, 88px)' }
    if (columns.value === 4) return { fontSize: 'clamp(36px, 8vw, 72px)' }
    if (columns.value === 5) return { fontSize: 'clamp(28px, 6vw, 60px)' }
    return { fontSize: 'clamp(24px, 5vw, 52px)' }
  })

  function flipCard(card: Card) {
    if (card.isFlipped || card.isMatched) return

    //a mismatched pair stays face up until the next tap instead of on a timer so nobody is rushed
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

  //sets up a freshly shuffled board for whatever level we pass in
  function startLevel(levelIndex: number) {
    currentLevel.value = levelIndex
    newGame()
  }

  function nextLevel() {
    if (!isLastLevel.value) startLevel(currentLevel.value + 1)
  }

  //lets the player jump straight to any level instead of going in order
  function chooseLevel(levelIndex: number) {
    //don't wipe out progress by accident
    const hasProgress = cards.value.some((c) => c.isMatched)
    if (
      hasProgress &&
      !isComplete.value &&
      !window.confirm('You have matched some pairs on this level. Do you want to start a new board?')
    )
      return
    startLevel(levelIndex)
    //set after startLevel because newGame clears the message
    message.value = `Level ${levelIndex + 1}. Good luck!`
  }

  //after the last level, start over from level 1
  function playAgain() {
    startLevel(0)
  }

  function cardLabel(card: Card, index: number) {
    if (card.isMatched) return `${card.label}, matched`
    if (card.isFlipped) return card.label
    return `Card ${index + 1}, face down`
  }

  const btnBase =
    'inline-flex min-h-[56px] items-center justify-center rounded-2xl px-6 py-3 text-lg font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none'
  const btnPrimary = `${btnBase} bg-orange-700 text-white hover:bg-orange-800`
  const btnQuiet = `${btnBase} border-2 border-slate-400 bg-white text-[var(--bn-navy)] hover:bg-slate-50`
</script>

<template>
  <section
    aria-labelledby="matching-title"
    class="rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 sm:p-10"
  >
    <div class="flex flex-wrap items-center gap-4">
      <div>
        <h2 id="matching-title" class="text-lg font-bold tracking-wide text-orange-800 uppercase">
          Find the matching pairs
        </h2>
        <!-- shows "Level 1 of 7" -->
        <p class="mt-1 text-xl font-semibold text-[var(--bn-navy)]">
          Level {{ currentLevel + 1 }} of {{ LEVELS.length }}
        </p>
      </div>
      <div class="ml-auto flex flex-wrap gap-3">
        <button type="button" :class="btnQuiet" :aria-pressed="isPaused" @click="togglePause">
          {{ isPaused ? 'Resume' : 'Pause' }}
        </button>
        <button type="button" :class="btnQuiet" @click="newGame">New game</button>
      </div>
    </div>

    <!-- level picker: pick any level; clicking the current level again shuffles its cards -->
    <fieldset class="mt-6">
      <legend class="text-lg font-semibold text-[var(--bn-navy)]">Choose a level:</legend>
      <div class="mt-3 flex flex-wrap gap-3">
        <button
          v-for="number in LEVELS.length"
          :key="number"
          type="button"
          :class="number - 1 === currentLevel ? btnPrimary : btnQuiet"
          :aria-pressed="number - 1 === currentLevel"
          @click="chooseLevel(number - 1)"
        >
          Level {{ number }}
        </button>
      </div>
    </fieldset>

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

    <template v-else>
      <!-- the number of columns comes from how many cards the level has (3 to 6) -->
      <div class="mx-auto grid gap-3 sm:gap-4" :style="boardStyle">
        <button
          v-for="(card, index) in cards"
          :key="card.id"
          type="button"
          class="flex aspect-square items-center justify-center rounded-2xl border-2 focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
          :class="
            card.isMatched
              ? 'cursor-default border-[var(--bn-success)] bg-[var(--bn-success-bg)]'
              : card.isFlipped
                ? 'border-[var(--bn-navy)] bg-white'
                : 'border-[var(--bn-sidebar)] bg-[var(--bn-sidebar)] hover:bg-[var(--bn-navy)]'
          "
          :style="emojiStyle"
          :aria-label="cardLabel(card, index)"
          :aria-disabled="card.isMatched"
          @click="flipCard(card)"
        >
          <span v-if="card.isFlipped || card.isMatched" aria-hidden="true">{{ card.emoji }}</span>
        </button>
      </div>

      <div v-if="isComplete" class="mt-8 flex flex-wrap justify-center gap-3">
        <button v-if="!isLastLevel" type="button" :class="btnPrimary" @click="nextLevel">
          Next level
        </button>
        <button v-else type="button" :class="btnPrimary" @click="playAgain">Play again</button>
      </div>
    </template>
  </section>
</template>
<script setup lang="ts">

//we need to define everything related to the cards

type CardData = 
{
  //vue needs a unique id for each card especially because there is two of the same emojis
  id: number
  emoji: string
  //we need a label so that if there is going to be audio it needs to be read aloud
  label: string
  isFlipped: boolean
  isMatched: boolean
}

type carddefs = {
  emoji: string,
  label: string
}
 
//need to make an array or list of the three unique cards, we will duplicate it later
const cardDefinitions: carddefs[] = 
[
  { emoji: '🌹', label: 'Rose' },
  { emoji: '🌻', label: 'Sunflower' },
  { emoji: '🌼', label: 'Daisy' },
]

//this function will take a list type carddefs
function shuffle(list: carddefs[]): carddefs[] 
{
  //we will make a copy so that the original list does not get modified
  const copy = [...list]
  //lopp from last element to the second one
  for (let i = copy.length - 1; i > 0; i--) 
  {
    const j = Math.floor(Math.random() * (i + 1))
    //swap the elements
    const temp = copy[i]!
    copy[i] = copy[j]!
    copy[j] = temp
  }
  //returns the shuffled list
  return copy
}
 
//now we will shuffle specific to the game
function createShuffledCards(): CardData[] 
{
  //basically we are duplicating the card here and then shuffling the 6 cards
  const shuffledDefinitions = shuffle([...cardDefinitions, ...cardDefinitions])
  return shuffledDefinitions.map((def, index) => ({
    id: index,
    emoji: def.emoji,
    label: def.label,
    isFlipped: false,
    isMatched: false,
  }))
}
 
const cards = ref<CardData[]>(createShuffledCards())
const flippedCards = computed(() => cards.value.filter((c) => c.isFlipped && !c.isMatched))
//make sure the player cant flip a third card all in one turn
const isChecking = ref(false)

//this will give feedback to the player - like good job! or try again!
const message = ref('')

//we need to check if all items pass the test, and then only is it true/completed
const isComplete = computed(() => cards.value.every((c) => c.isMatched))

//i think we need a pause option for the player. this statement we will track if the game is paused 
const isPaused = ref(false)
 
function flipCard(card: CardData) 
{
  if (isChecking.value) return
  if (card.isFlipped || card.isMatched) return
  if (flippedCards.value.length >= 2) return
 
  card.isFlipped = true

  //if they flip the second card, we need to check if both crads match
  if (flippedCards.value.length === 2) 
  {
    checkForMatch()
  }
}
 
function checkForMatch() 
{
  const [first, second] = flippedCards.value
 
  //check first so the board never gets stuck with isChecking = true
  if (!first || !second) 
  {
    return
  }
  isChecking.value = true

  if (first.emoji === second.emoji)
  {
    first.isMatched = true
    second.isMatched = true
    message.value = 'Nice job, that is a match!'
    isChecking.value = false
    setTimeout(() => 
    {
      message.value = ''
    }, 1500)
  } 
  else 
  {
    message.value = 'Try again!'
    setTimeout(() => 
    {
      first.isFlipped = false
      second.isFlipped = false
      isChecking.value = false
      message.value = ''
    }, 900)
  }
}
 
function togglePause() 
{
  isPaused.value = !isPaused.value
}

//this function is called when the user decides to exit the game/click the exit button
function exitGame() 
{
  cards.value = createShuffledCards()
  isChecking.value = false
  message.value = ''
  isPaused.value = false
}
</script>
 
<template>
  <div class="game-page">
    <div class="game-panel">
      <div class="controls">
        <button class="control-button primary" @click="togglePause">
          {{ isPaused ? 'Resume' : 'Pause' }}
        </button>
        <button class="control-button secondary" @click="exitGame">Exit</button>
      </div>

      <p class="message" aria-live="polite">{{ message }}</p>

      <div v-if="isPaused" class="pause-overlay">
        <p>Game paused.</p>
      </div>

      <template v-else>
        <div class="board">
          <button
            class="card"
            :class="{ flipped: card.isFlipped && !card.isMatched, matched: card.isMatched }"
            v-for="(card, index) in cards"
            :key="card.id"
            :aria-label="
              card.isFlipped || card.isMatched ? card.label : `Card ${index + 1}, face down`
            "
            @click="flipCard(card)"
          >
            <span v-if="card.isFlipped || card.isMatched" class="card-face" aria-hidden="true">{{
              card.emoji
            }}</span>
          </button>
        </div>
        <p v-if="isComplete" class="celebration">🎉 You matched them all! Wonderful work! 🎉</p>
      </template>
    </div>
  </div>
</template>
 
<style scoped>
/* Colors from the Figma styles. These are estimated from the screenshot,
   so click each swatch in Figma and paste the exact hex codes here. */
.game-page
{
  --theme: #27265f;          /* Underlying theme (navy) */
  --contrast: #ffffff;       /* Contrast for background (white) */
  --secondary: #dcd9f2;      /* Secondary Contrast (lavender) */
  --accent: #e8772e;         /* Accent Text (orange) */
  --page-bg: #fbf2e8;        /* cream page background from the mockups */
  --card-border: #e6e0d6;    /* soft border on face-down cards */

  min-height: 100vh;
  padding: 40px 16px;
  background-color: var(--page-bg);
  box-sizing: border-box;
}

.game-panel
{
  max-width: 720px;
  margin: 0 auto;
  padding: 32px;
  background-color: var(--contrast);
  border: 1px solid var(--card-border);
  border-top: 6px solid var(--theme);
  border-radius: 20px;
}

.controls 
{
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
.control-button 
{
  min-width: 112px;
  min-height: 52px;
  padding: 0 20px;
  font-size: 20px;
  border-radius: 999px;
  cursor: pointer;
}
.control-button.primary
{
  background-color: var(--theme);
  border: 2px solid var(--theme);
  color: var(--contrast);
}
.control-button.secondary
{
  background-color: var(--contrast);
  border: 2px solid var(--theme);
  color: var(--theme);
}
.control-button:focus-visible 
{
  outline: 4px solid var(--accent);
  outline-offset: 3px;
}

.message 
{
  min-height: 32px;
  margin: 16px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--theme);
  text-align: center;
}

.pause-overlay 
{
  font-size: 24px;
  padding: 64px 0;
  text-align: center;
  color: var(--theme);
  background-color: var(--secondary);
  border-radius: 16px;
}

.board 
{
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.card 
{
  width: 100%;
  aspect-ratio: 1;
  background-color: var(--contrast);
  border: 2px solid var(--card-border);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(48px, 10vw, 88px);
  cursor: pointer;
}
.card:hover
{
  border-color: var(--secondary);
}
.card.flipped 
{
  background-color: var(--secondary);
  border-color: var(--theme);
}
.card.matched 
{
  background-color: var(--secondary);
  border-color: var(--accent);
  cursor: default;
}
.card:focus-visible 
{
  outline: 4px solid var(--accent);
  outline-offset: 3px;
}

.celebration 
{
  font-size: 24px;
  font-weight: 600;
  margin-top: 24px;
  padding: 16px;
  text-align: center;
  color: var(--theme);
  background-color: var(--secondary);
  border-radius: 12px;
}

@media (max-width: 480px)
{
  .game-panel
  {
    padding: 20px;
  }
  .board
  {
    gap: 10px;
  }
}
 
@media (prefers-reduced-motion: no-preference) 
{
  .card 
  {
    transition: transform 0.15s ease, background-color 0.2s ease, border-color 0.2s ease;
  }
  .card:active 
  {
    transform: scale(0.97);
  }
}
</style>
<script setup>

  const TEXT = {
    findWords: 'Find these words:',
    startOver: 'Start over',
    playAgain: 'Play again',
    pause: 'Pause',
    resume: 'Resume',
    exit: 'Exit',
    exitConfirm: 'Do you want to leave the game?',
    paused: 'Game paused.',
    tryAgain: "Nice try! Let's look again.",
    winMessage: 'You found all the words. Wonderful work!',
    foundWord: (word) => `You found ${word}!`,
    tileLabel: (row, col, letter) => `Row ${row}, column ${col}, letter ${letter}`,
    tileLabelFound: (row, col, letter) =>
      `Row ${row}, column ${col}, letter ${letter}, part of a found word`,
  }

  const PUZZLES = [
    {
      grid: [
        ['C', 'A', 'T', 'X'],
        ['D', 'B', 'L', 'Y'],
        ['O', 'S', 'U', 'N'],
        ['G', 'M', 'P', 'E'],
      ],
      words: [
        { word: 'CAT', cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }] },
        { word: 'DOG', cells: [{ row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 }] },
        { word: 'SUN', cells: [{ row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 }] },
      ],
    },
    {
      grid: [
        ['S', 'E', 'A', 'B'],
        ['R', 'I', 'N', 'E'],
        ['F', 'O', 'K', 'E'],
        ['O', 'W', 'L', 'D'],
      ],
      words: [
        { word: 'SEA', cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }] },
        { word: 'BEE', cells: [{ row: 0, col: 3 }, { row: 1, col: 3 }, { row: 2, col: 3 }] },
        { word: 'OWL', cells: [{ row: 3, col: 0 }, { row: 3, col: 1 }, { row: 3, col: 2 }] },
      ],
    },
    {
      grid: [
        ['B', 'U', 'S', 'P'],
        ['O', 'D', 'R', 'E'],
        ['F', 'I', 'X', 'N'],
        ['Y', 'A', 'N', 'T'],
      ],
      words: [
        { word: 'BUS', cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }] },
        { word: 'PEN', cells: [{ row: 0, col: 3 }, { row: 1, col: 3 }, { row: 2, col: 3 }] },
        { word: 'ANT', cells: [{ row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 }] },
      ],
    },
  ]

  const puzzle = ref(PUZZLES[0])
  const selectedCells = ref([])
  const foundWords = ref([])
  const message = ref('')
  const isPaused = ref(false)

  const isWon = computed(() => foundWords.value.length === puzzle.value.words.length)

  function isCellSelected(row, col) {
    return selectedCells.value.some((cell) => cell.row === row && cell.col === col)
  }

  function isCellFound(row, col) {
    return puzzle.value.words.some(
      (item) =>
        foundWords.value.includes(item.word) &&
        item.cells.some((cell) => cell.row === row && cell.col === col),
    )
  }

  function matchesPrefix(wordCells, tappedCells) {
    if (tappedCells.length > wordCells.length) return false
    return tappedCells.every(
      (cell, i) => cell.row === wordCells[i].row && cell.col === wordCells[i].col,
    )
  }

  function checkSelection() {
    const remainingWords = puzzle.value.words.filter((item) => !foundWords.value.includes(item.word))

    const completedWord = remainingWords.find(
      (item) =>
        item.cells.length === selectedCells.value.length &&
        matchesPrefix(item.cells, selectedCells.value),
    )

    if (completedWord) {
      foundWords.value.push(completedWord.word)
      selectedCells.value = []

      if (foundWords.value.length === puzzle.value.words.length) {
        message.value = TEXT.winMessage
      } else {
        message.value = TEXT.foundWord(completedWord.word)
      }
      return
    }

    // If no remaining word could still be spelled by adding more taps, gently reset.
    const canContinue = remainingWords.some((item) => matchesPrefix(item.cells, selectedCells.value))

    if (!canContinue) {
      message.value = TEXT.tryAgain
      selectedCells.value = []
    }
  }

  function tapTile(row, col) {
    if (isCellFound(row, col)) return

    const lastCell = selectedCells.value[selectedCells.value.length - 1]

    if (lastCell && lastCell.row === row && lastCell.col === col) {
      selectedCells.value.pop()
      return
    }

    if (isCellSelected(row, col)) return

    selectedCells.value.push({ row, col })
    checkSelection()
  }

  function startOver() {
    selectedCells.value = []
    message.value = ''
  }

  function pickRandomPuzzle() {
    const index = Math.floor(Math.random() * PUZZLES.length)
    return PUZZLES[index]
  }

  function playAgain() {
    puzzle.value = pickRandomPuzzle()
    foundWords.value = []
    selectedCells.value = []
    message.value = ''
  }

  function togglePause() {
    isPaused.value = !isPaused.value
  }

  function exitGame() {
    const wantsToLeave = window.confirm(TEXT.exitConfirm)
    if (!wantsToLeave) return

    puzzle.value = pickRandomPuzzle()
    foundWords.value = []
    selectedCells.value = []
    message.value = ''
    isPaused.value = false
  }
</script>

<template>
  <div class="game-page">
    <div class="game-panel">
      <div class="controls">
        <button class="control-button primary" @click="togglePause">
          {{ isPaused ? TEXT.resume : TEXT.pause }}
        </button>
        <button class="control-button secondary" @click="exitGame">{{ TEXT.exit }}</button>
      </div>

      <p class="message" aria-live="polite">{{ message }}</p>

      <div v-if="isPaused" class="pause-overlay">
        <p>{{ TEXT.paused }}</p>
      </div>

      <template v-else>
        <div class="grid">
          <template v-for="(row, rowIndex) in puzzle.grid" :key="rowIndex">
            <button
              class="tile"
              :class="{
                selected: isCellSelected(rowIndex, colIndex),
                found: isCellFound(rowIndex, colIndex),
              }"
              v-for="(letter, colIndex) in row"
              :key="`${rowIndex}-${colIndex}`"
              :aria-label="
                isCellFound(rowIndex, colIndex)
                  ? TEXT.tileLabelFound(rowIndex + 1, colIndex + 1, letter)
                  : TEXT.tileLabel(rowIndex + 1, colIndex + 1, letter)
              "
              @click="tapTile(rowIndex, colIndex)"
            >
              <span aria-hidden="true">{{ letter }}</span>
              <span v-if="isCellFound(rowIndex, colIndex)" class="checkmark" aria-hidden="true">
                ✓
              </span>
            </button>
          </template>
        </div>

        <p class="word-list-heading">{{ TEXT.findWords }}</p>
        <ul class="word-list">
          <li
            v-for="item in puzzle.words"
            :key="item.word"
            class="word-chip"
            :class="{ 'word-found': foundWords.includes(item.word) }"
          >
            {{ item.word }}
            <span v-if="foundWords.includes(item.word)" aria-hidden="true">✓</span>
          </li>
        </ul>

        <div class="bottom-controls">
          <button class="control-button secondary" @click="startOver">{{ TEXT.startOver }}</button>
          <button v-if="isWon" class="control-button primary" @click="playAgain">
            {{ TEXT.playAgain }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
  /* Same color variables as the matching game. Keep these in sync across games. */
  .game-page {
    --theme: #26215c;          /* Underlying theme (navy) */
    --contrast: #ffffff;       /* Contrast for background (white) */
    --secondary: #dcd9f2;      /* Secondary Contrast (lavender) */
    --accent: #e8772e;         /* Accent Text (orange) */
    --page-bg: #fbf2e8;        /* cream page background from the mockups */
    --card-border: #e6e0d6;    /* soft border on untouched tiles */

    min-height: 100vh;
    padding: 40px 16px;
    background-color: var(--page-bg);
    box-sizing: border-box;
  }

  .game-panel {
    max-width: 720px;
    margin: 0 auto;
    padding: 32px;
    background-color: var(--contrast);
    border: 1px solid var(--card-border);
    border-top: 6px solid var(--theme);
    border-radius: 20px;
  }

  .controls {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  .bottom-controls {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 24px;
  }
  .control-button {
    min-width: 112px;
    min-height: 52px;
    padding: 0 20px;
    font-size: 20px;
    border-radius: 999px;
    cursor: pointer;
  }
  .control-button.primary {
    background-color: var(--theme);
    border: 2px solid var(--theme);
    color: var(--contrast);
  }
  .control-button.secondary {
    background-color: var(--contrast);
    border: 2px solid var(--theme);
    color: var(--theme);
  }

  .message {
    min-height: 32px;
    margin: 16px 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--theme);
    text-align: center;
  }

  .pause-overlay {
    font-size: 24px;
    padding: 64px 0;
    text-align: center;
    color: var(--theme);
    background-color: var(--secondary);
    border-radius: 16px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  .tile {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    font-size: clamp(32px, 8vw, 56px);
    font-weight: 600;
    background-color: var(--contrast);
    color: var(--theme);
    border: 2px solid var(--card-border);
    border-radius: 16px;
    cursor: pointer;
  }
  .tile:hover {
    border-color: var(--secondary);
  }
  /* Letters the player is tapping right now */
  .tile.selected {
    background-color: var(--theme);
    border-color: var(--theme);
    color: var(--contrast);
  }
  /* Letters in a word the player already found */
  .tile.found {
    background-color: var(--secondary);
    border-color: var(--accent);
    color: var(--theme);
    cursor: default;
  }
  .checkmark {
    position: absolute;
    bottom: 6px;
    right: 10px;
    font-size: 20px;
    color: var(--theme);
  }

  .word-list-heading {
    margin: 28px 0 12px;
    font-size: 24px;
    font-weight: 600;
    color: var(--theme);
    text-align: center;
  }
  .word-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
  }
  .word-chip {
    padding: 8px 20px;
    font-size: 24px;
    color: var(--theme);
    border: 2px solid var(--card-border);
    border-radius: 999px;
  }
  .word-chip.word-found {
    background-color: var(--secondary);
    border-color: var(--accent);
  }

  .tile:focus-visible,
  .control-button:focus-visible {
    outline: 4px solid var(--accent);
    outline-offset: 3px;
  }

  @media (max-width: 480px) {
    .game-panel {
      padding: 20px;
    }
    .grid {
      gap: 8px;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .tile,
    .control-button {
      transition: transform 0.15s ease, background-color 0.2s ease, border-color 0.2s ease;
    }
    .tile:active,
    .control-button:active {
      transform: scale(0.97);
    }
  }
</style>
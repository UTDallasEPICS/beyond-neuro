<script setup lang="ts">
  interface Cell {
    row: number
    col: number
  }

  interface WordEntry {
    word: string
    // Letters in spelling order; the player must tap them in this order.
    cells: Cell[]
  }

  interface Puzzle {
    grid: string[][]
    words: WordEntry[]
  }

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
    foundWord: (word: string) => `You found ${word}!`,
    tileLabel: (row: number, col: number, letter: string) =>
      `Row ${row}, column ${col}, letter ${letter}`,
    tileLabelFound: (row: number, col: number, letter: string) =>
      `Row ${row}, column ${col}, letter ${letter}, part of a found word`,
  }

  const PUZZLES: Puzzle[] = [
    {
      grid: [
        ['C', 'A', 'T', 'X'],
        ['D', 'B', 'L', 'Y'],
        ['O', 'S', 'U', 'N'],
        ['G', 'M', 'P', 'E'],
      ],
      words: [
        {
          word: 'CAT',
          cells: [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: 2 },
          ],
        },
        {
          word: 'DOG',
          cells: [
            { row: 1, col: 0 },
            { row: 2, col: 0 },
            { row: 3, col: 0 },
          ],
        },
        {
          word: 'SUN',
          cells: [
            { row: 2, col: 1 },
            { row: 2, col: 2 },
            { row: 2, col: 3 },
          ],
        },
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
        {
          word: 'SEA',
          cells: [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: 2 },
          ],
        },
        {
          word: 'BEE',
          cells: [
            { row: 0, col: 3 },
            { row: 1, col: 3 },
            { row: 2, col: 3 },
          ],
        },
        {
          word: 'OWL',
          cells: [
            { row: 3, col: 0 },
            { row: 3, col: 1 },
            { row: 3, col: 2 },
          ],
        },
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
        {
          word: 'BUS',
          cells: [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: 2 },
          ],
        },
        {
          word: 'PEN',
          cells: [
            { row: 0, col: 3 },
            { row: 1, col: 3 },
            { row: 2, col: 3 },
          ],
        },
        {
          word: 'ANT',
          cells: [
            { row: 3, col: 1 },
            { row: 3, col: 2 },
            { row: 3, col: 3 },
          ],
        },
      ],
    },
  ]

  const puzzle = ref<Puzzle>(PUZZLES[0]!)
  const selectedCells = ref<Cell[]>([])
  const foundWords = ref<string[]>([])
  const message = ref('')
  const isPaused = ref(false)

  const isWon = computed(() => foundWords.value.length === puzzle.value.words.length)

  function isCellSelected(row: number, col: number) {
    return selectedCells.value.some((cell) => cell.row === row && cell.col === col)
  }

  function isCellFound(row: number, col: number) {
    return puzzle.value.words.some(
      (item) =>
        foundWords.value.includes(item.word) &&
        item.cells.some((cell) => cell.row === row && cell.col === col)
    )
  }

  function matchesPrefix(wordCells: Cell[], tappedCells: Cell[]) {
    if (tappedCells.length > wordCells.length) return false
    return tappedCells.every(
      (cell, i) => cell.row === wordCells[i]!.row && cell.col === wordCells[i]!.col
    )
  }

  function checkSelection() {
    const remainingWords = puzzle.value.words.filter(
      (item) => !foundWords.value.includes(item.word)
    )

    const completedWord = remainingWords.find(
      (item) =>
        item.cells.length === selectedCells.value.length &&
        matchesPrefix(item.cells, selectedCells.value)
    )

    if (completedWord) {
      foundWords.value.push(completedWord.word)
      selectedCells.value = []
      message.value = isWon.value ? TEXT.winMessage : TEXT.foundWord(completedWord.word)
      return
    }

    // If no remaining word could still be spelled by adding more taps, gently reset.
    const canContinue = remainingWords.some((item) =>
      matchesPrefix(item.cells, selectedCells.value)
    )

    if (!canContinue) {
      message.value = TEXT.tryAgain
      selectedCells.value = []
    }
  }

  function tapTile(row: number, col: number) {
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
    return PUZZLES[Math.floor(Math.random() * PUZZLES.length)]!
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
    if (!window.confirm(TEXT.exitConfirm)) return
    playAgain()
    isPaused.value = false
  }

  function tileClass(row: number, col: number) {
    if (isCellFound(row, col))
      return 'cursor-default border-[var(--bn-success)] bg-[var(--bn-success-bg)] text-[var(--bn-navy)]'
    if (isCellSelected(row, col)) return 'border-[var(--bn-navy)] bg-[var(--bn-navy)] text-white'
    return 'border-[var(--bn-border)] bg-white text-[var(--bn-navy)] hover:border-orange-700'
  }

  const btnBase =
    'inline-flex min-h-[56px] items-center justify-center rounded-2xl px-6 py-3 text-lg font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none'
  const btnPrimary = `${btnBase} bg-orange-700 text-white hover:bg-orange-800`
  const btnQuiet = `${btnBase} border-2 border-slate-400 bg-white text-[var(--bn-navy)] hover:bg-slate-50`
</script>

<template>
  <section
    aria-labelledby="wordsearch-title"
    class="rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 sm:p-10"
  >
    <div class="flex flex-wrap items-center gap-4">
      <h2 id="wordsearch-title" class="text-lg font-bold tracking-wide text-orange-800 uppercase">
        Word search
      </h2>
      <div class="ml-auto flex flex-wrap gap-3">
        <button type="button" :class="btnQuiet" :aria-pressed="isPaused" @click="togglePause">
          {{ isPaused ? TEXT.resume : TEXT.pause }}
        </button>
        <button type="button" :class="btnQuiet" @click="exitGame">{{ TEXT.exit }}</button>
      </div>
    </div>

    <p class="mt-3 text-lg leading-relaxed text-[var(--bn-navy)] sm:text-xl">
      Tap the letters of a word in order. Tap the last letter again to undo it.
    </p>

    <p aria-live="polite" class="mt-4 min-h-[2.5rem] text-xl font-semibold text-green-800">
      {{ message }}
    </p>

    <div
      v-if="isPaused"
      class="rounded-2xl border border-[var(--bn-border)] bg-white px-6 py-16 text-center text-2xl text-[var(--bn-navy)]"
    >
      {{ TEXT.paused }}
    </div>

    <template v-else>
      <div class="mx-auto grid max-w-[520px] grid-cols-4 gap-2 sm:gap-3">
        <template v-for="(row, rowIndex) in puzzle.grid" :key="rowIndex">
          <button
            v-for="(letter, colIndex) in row"
            :key="`${rowIndex}-${colIndex}`"
            type="button"
            class="bn-font-display relative flex aspect-square items-center justify-center rounded-2xl border-2 text-[clamp(32px,8vw,56px)] font-bold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
            :class="tileClass(rowIndex, colIndex)"
            :aria-label="
              isCellFound(rowIndex, colIndex)
                ? TEXT.tileLabelFound(rowIndex + 1, colIndex + 1, letter)
                : TEXT.tileLabel(rowIndex + 1, colIndex + 1, letter)
            "
            :aria-pressed="isCellSelected(rowIndex, colIndex)"
            @click="tapTile(rowIndex, colIndex)"
          >
            <span aria-hidden="true">{{ letter }}</span>
            <span
              v-if="isCellFound(rowIndex, colIndex)"
              class="absolute right-2 bottom-1 text-xl"
              aria-hidden="true"
            >
              ✓
            </span>
          </button>
        </template>
      </div>

      <h3 class="mt-8 text-center text-2xl font-semibold text-[var(--bn-navy)]">
        {{ TEXT.findWords }}
      </h3>
      <ul class="mt-4 flex list-none flex-wrap justify-center gap-3 p-0">
        <li
          v-for="item in puzzle.words"
          :key="item.word"
          class="rounded-full border-2 px-5 py-2 text-2xl text-[var(--bn-navy)]"
          :class="
            foundWords.includes(item.word)
              ? 'border-[var(--bn-success)] bg-[var(--bn-success-bg)]'
              : 'border-[var(--bn-border)] bg-white'
          "
        >
          {{ item.word }}
          <span v-if="foundWords.includes(item.word)" aria-hidden="true">✓</span>
          <span v-if="foundWords.includes(item.word)" class="sr-only">(found)</span>
        </li>
      </ul>

      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" :class="btnQuiet" @click="startOver">{{ TEXT.startOver }}</button>
        <button v-if="isWon" type="button" :class="btnPrimary" @click="playAgain">
          {{ TEXT.playAgain }}
        </button>
      </div>
    </template>
  </section>
</template>

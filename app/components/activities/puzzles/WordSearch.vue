<script setup lang="ts">
  interface Cell {
    row: number
    col: number
  }

  // the direction or which way a word is spelled in the grid

  type Direction = 'across' | 'down' | 'downRight' | 'upRight' | 'backward' | 'up'

  // how many rows/columns to move for each next letter
  const STEPS: Record<Direction, Cell> = {
    across: { row: 0, col: 1 },
    down: { row: 1, col: 0 },
    downRight: { row: 1, col: 1 },
    upRight: { row: -1, col: 1 },
    backward: { row: 0, col: -1 },
    up: { row: -1, col: 0 },
  }

  interface WordDef {
    word: string
    row: number
    col: number
    direction: Direction
  }

  interface LevelDef {
    title: string
    instructions: string
    tip: string
    // each string is one row of the grid
    grid: string[]
    words: WordDef[]
  }

  interface WordEntry {
    word: string
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
    nextLevel: 'Next level',
    pause: 'Pause',
    resume: 'Resume',
    exit: 'Exit',
    exitConfirm: 'Do you want to leave the game?',
    paused: 'Game paused.',
    tryAgain: "Nice try! Let's look again.",
    levelLabel: (level: number, total: number) => `Level ${level} of ${total}`,
    levelWon: (level: number) => `You finished level ${level}! Wonderful work.`,
    allWon: 'You found every word in all the levels. Wonderful work!',
    foundWord: (word: string) => `You found ${word}!`,
    tileLabel: (row: number, col: number, letter: string) =>
      `Row ${row}, column ${col}, letter ${letter}`,
    tileLabelFound: (row: number, col: number, letter: string) =>
      `Row ${row}, column ${col}, letter ${letter}, part of a found word`,
    chooseLevel: 'Choose a level:',
    levelButton: (level: number) => `Level ${level}`,
    levelStarted: (level: number, title: string) => `Level ${level}: ${title}. Good luck!`,
    // NEW: reworded so it also makes sense when re-clicking the same level
    switchConfirm: 'You have found some words on this level. Do you want to start a new board?',
  }

  // the words, grid size, and directions stay the same, and the shuffle only moves where the words are
  const LEVELS: LevelDef[] = [
    {
      // level 1 - 5x5 grid and 3 words
      title: 'Colors',
      instructions: 'Find 3 color words. Every word reads left to right, on one line.',
      tip: 'Read each word out loud together first. Point to one row at a time. Name something in the room that is each color.',
      grid: [
        'HBLUE',
        'WVSTT',
        'TREDK',
        'FFAYM',
        'GOLDT',
      ],
      words: [
        { word: 'BLUE', row: 0, col: 1, direction: 'across' },
        { word: 'GOLD', row: 4, col: 0, direction: 'across' },
        { word: 'RED', row: 2, col: 1, direction: 'across' },
      ],
    },
    {
      // level 2 - 6x6 grid and 4 words
      title: 'In the Garden',
      instructions: 'Find 4 garden words. Every word reads left to right.',
      tip: 'Keep a real leaf or flower on the table. After each word, talk about a garden you remember.',
      grid: [
        'MGSOIL',
        'HBSEED',
        'TYROSE',
        'WTLEAF',
        'WWWVWU',
        'BGWYYT',
      ],
      words: [
        { word: 'LEAF', row: 3, col: 2, direction: 'across' },
        { word: 'ROSE', row: 2, col: 2, direction: 'across' },
        { word: 'SEED', row: 1, col: 2, direction: 'across' },
        { word: 'SOIL', row: 0, col: 2, direction: 'across' },
      ],
    },
    {
      // level 3 - 8x8 grid and 6 words
      title: 'Music & Rhythm',
      instructions: 'Find 6 music words. Words go across (left to right) or down (top to bottom).',
      tip: 'Play a favorite song softly while working. Tap the beat on the table between words.',
      grid: [
        'NFELDRUM',
        'NICMSONG',
        'NPEHWUYI',
        'OIGDANCE',
        'YABEATHY',
        'YNSDAGYL',
        'BOPPEUMA',
        'HWDSMUNP',
      ],
      words: [
        { word: 'BEAT', row: 4, col: 2, direction: 'across' },
        { word: 'DANCE', row: 3, col: 3, direction: 'across' },
        { word: 'DRUM', row: 0, col: 4, direction: 'across' },
        { word: 'HYMN', row: 4, col: 6, direction: 'down' },
        { word: 'PIANO', row: 2, col: 1, direction: 'down' },
        { word: 'SONG', row: 1, col: 4, direction: 'across' },
      ],
    },
    {
      // level 4 - 10x10 grid and 8 words
      title: 'Family Memories',
      instructions: 'Find 8 family words. Words go across or down.',
      tip: 'Keep a family photo nearby. For each word found, share one name or story it brings to mind.',
      grid: [
        'AUNTSWSNBP',
        'HSWUNCLEWM',
        'PNWFATHERP',
        'HCREBEAPEW',
        'OMOTHERHSO',
        'TOHSISTERG',
        'OOOHTABABY',
        'RDMPMPYTCU',
        'YREBWOAFUT',
        'ETIFIUAHCD',
      ],
      words: [
        { word: 'AUNT', row: 0, col: 0, direction: 'across' },
        { word: 'BABY', row: 6, col: 6, direction: 'across' },
        { word: 'FATHER', row: 2, col: 3, direction: 'across' },
        { word: 'HOME', row: 5, col: 2, direction: 'down' },
        { word: 'MOTHER', row: 4, col: 1, direction: 'across' },
        { word: 'PHOTO', row: 2, col: 0, direction: 'down' },
        { word: 'SISTER', row: 5, col: 3, direction: 'across' },
        { word: 'UNCLE', row: 1, col: 3, direction: 'across' },
      ],
    },
    {
      // level 5 - 12x12 grid and 10 words
      title: 'In the Kitchen',
      instructions: 'Find 10 kitchen words. Words go across, down, or diagonally down to the right.',
      tip: 'Ask about a favorite family recipe. Stand and stretch after every three words for a dual-task break.',
      grid: [
        'TBHRCOFFEEGS',
        'NUCERUOYYFYP',
        'DTSTSRECUPIO',
        'PTYUEHNPFYIO',
        'EEUPCAGSLPRN',
        'PRHOOSCOROEY',
        'KETTLEOUETCD',
        'VAIBWMBVPPIC',
        'OPRNRFTNESPC',
        'SRIOAEGSKNEB',
        'RODGPUABPOFL',
        'DNSUGARDOWUA',
      ],
      words: [
        { word: 'APRON', row: 7, col: 1, direction: 'down' },
        { word: 'BREAD', row: 7, col: 3, direction: 'downRight' },
        { word: 'BUTTER', row: 0, col: 1, direction: 'down' },
        { word: 'COFFEE', row: 0, col: 4, direction: 'across' },
        { word: 'KETTLE', row: 6, col: 0, direction: 'across' },
        { word: 'OVEN', row: 6, col: 6, direction: 'downRight' },
        { word: 'RECIPE', row: 4, col: 10, direction: 'down' },
        { word: 'SPOON', row: 0, col: 11, direction: 'down' },
        { word: 'SUGAR', row: 11, col: 2, direction: 'across' },
        { word: 'TEACUP', row: 2, col: 3, direction: 'downRight' },
      ],
    },
    {
      // level 6 - 14x14 grid and 12 words
      title: 'Seasons & Days',
      instructions: 'Find 12 words about time. Words go across, down, or diagonally (up or down, always left to right).',
      tip: "Before starting, say today's day, month, and season together. Circle today's day when you find it.",
      grid: [
        'HRAEHDYBNDUOIT',
        'ISAEVSAYANMTOO',
        'RHTTLEAUEEEERS',
        'AAONNDNTTSSIAP',
        'MREOIDIIDUTSFR',
        'EDTLUOLBNIMGRI',
        'ASOMORNINGONIN',
        'AHSUMMERDTFODG',
        'IOSUNDAYAINCAP',
        'CALENDARMOMTYN',
        'TSTSMONDAYROYA',
        'IERNIIARBAPBIL',
        'NNNUMWINTEREND',
        'NDFFNNYRSUMRHO',
      ],
      words: [
        { word: 'AUTUMN', row: 1, col: 6, direction: 'downRight' },
        { word: 'CALENDAR', row: 9, col: 0, direction: 'across' },
        { word: 'EVENING', row: 0, col: 3, direction: 'downRight' },
        { word: 'FRIDAY', row: 4, col: 12, direction: 'down' },
        { word: 'HOLIDAY', row: 7, col: 1, direction: 'upRight' },
        { word: 'MONDAY', row: 10, col: 4, direction: 'across' },
        { word: 'MORNING', row: 6, col: 3, direction: 'across' },
        { word: 'OCTOBER', row: 7, col: 11, direction: 'down' },
        { word: 'SPRING', row: 2, col: 13, direction: 'down' },
        { word: 'SUMMER', row: 7, col: 2, direction: 'across' },
        { word: 'SUNDAY', row: 8, col: 2, direction: 'across' },
        { word: 'WINTER', row: 12, col: 5, direction: 'across' },
      ],
    },
    {
      // level 7 - 15x15 grid and 15 words
      title: 'A Healthy Mind',
      instructions: 'Find 15 words. Words can go in any of 8 directions, including backward and diagonally.',
      tip: 'Time the puzzle and try again next week to compare. Talk about which word means the most to you.',
      grid: [
        'RCREVIGERACSVVV',
        'POMYREMINISCEEE',
        'EUOESUCOFTOENEC',
        'ERYBRESILIENCEN',
        'RAEPRCEAERCLADE',
        'HGCCALLIGRAPHYI',
        'YEVTYNEDRAGDHAT',
        'TRDLTELZZUPEELA',
        'HLYTIVITAERCARP',
        'MOIECNCCIIGARGG',
        'BALANCEGPMELODY',
        'AORIENTATIONARN',
        'DMIEHROEELPRICL',
        'CYPYCAYROMEMREE',
        'OORGINRCZEETYNH',
      ],
      words: [
        { word: 'BALANCE', row: 10, col: 0, direction: 'across' },
        { word: 'CALLIGRAPHY', row: 5, col: 3, direction: 'across' },
        { word: 'CAREGIVER', row: 0, col: 10, direction: 'backward' },
        { word: 'COURAGE', row: 0, col: 1, direction: 'down' },
        { word: 'CREATIVITY', row: 8, col: 11, direction: 'backward' },
        { word: 'FOCUS', row: 2, col: 8, direction: 'backward' },
        { word: 'GARDEN', row: 6, col: 10, direction: 'backward' },
        { word: 'MELODY', row: 10, col: 9, direction: 'across' },
        { word: 'MEMORY', row: 13, col: 11, direction: 'backward' },
        { word: 'ORIENTATION', row: 11, col: 1, direction: 'across' },
        { word: 'PATIENCE', row: 8, col: 14, direction: 'up' },
        { word: 'PUZZLE', row: 7, col: 10, direction: 'backward' },
        { word: 'REMINISCE', row: 1, col: 4, direction: 'across' },
        { word: 'RESILIENCE', row: 3, col: 4, direction: 'across' },
        { word: 'RHYTHM', row: 4, col: 0, direction: 'down' },
      ],
    },
  ]

  // the squares a word covers if it starts at (row, col) and goes in this direction
  function cellsFor(word: string, row: number, col: number, direction: Direction): Cell[] {
    const step = STEPS[direction]
    return word.split('').map((_, i) => ({ row: row + step.row * i, col: col + step.col * i }))
  }

  function buildPuzzle(level: LevelDef): Puzzle {
    return {
      grid: level.grid.map((row) => row.split('')),
      words: level.words.map((item) => ({
        word: item.word,
        cells: cellsFor(item.word, item.row, item.col, item.direction),
      })),
    }
  }

  //everything below and up to shufflePuzzle makes a new random board with the same words
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  //a random whole number from 0 up to but not including max
  function randomInt(max: number) {
    return Math.floor(Math.random() * max)
  }

  function randomItem(items: Direction[]): Direction
  function randomItem(items: string[]): string
  function randomItem(items: string[]) {
    return items[randomInt(items.length)]!
  }

  // how many times a word can be read in the grid
  function countWord(grid: string[][], word: string, directions: Direction[]) {
    let count = 0
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row]!.length; col++) {
        for (const direction of directions) {
          const cells = cellsFor(word, row, col, direction)
          if (cells.every((cell, i) => grid[cell.row]?.[cell.col] === word[i])) count++
        }
      }
    }
    return count
  }

  //returns null if a word didn't fit
  function tryShuffle(level: LevelDef): Puzzle | null {
    
    const rows = level.grid.length
    const cols = level.grid[0]!.length

    const directions = [...new Set(level.words.map((item) => item.direction))]
    const grid: string[][] = Array.from({ length: rows }, () => Array(cols).fill(''))
    const placed = new Map<string, Cell[]>()

    // place the longest words first
    const longestFirst = [...level.words].sort((a, b) => b.word.length - a.word.length)

    for (const item of longestFirst) {
      let cells: Cell[] | null = null
      for (let attempt = 0; attempt < 200 && !cells; attempt++) {
        const candidate = cellsFor(
          item.word,
          randomInt(rows),
          randomInt(cols),
          randomItem(directions)
        )
        // every square must be on the board and either empty or already the same letter 
        const fits = candidate.every((cell, i) => {
          const current = grid[cell.row]?.[cell.col]
          return current === '' || current === item.word[i]
        })
        if (fits) cells = candidate
      }
      if (!cells) return null
      cells.forEach((cell, i) => (grid[cell.row]![cell.col] = item.word[i]!))
      placed.set(item.word, cells)
    }

    // fill the empty squares with random letters
    for (const row of grid) {
      for (let col = 0; col < row.length; col++) {
        if (row[col] === '') row[col] = randomItem(LETTERS)
      }
    }

    // random letters can accidentally spell a word a second time and if that happens throw the board away
    if (level.words.some((item) => countWord(grid, item.word, directions) !== 1)) return null

    return {
      grid,
      words: level.words.map((item) => ({ word: item.word, cells: placed.get(item.word)! })),
    }
  }

  // makes a new random board for a level
  function shufflePuzzle(level: LevelDef): Puzzle {
    for (let tries = 0; tries < 100; tries++) {
      const result = tryShuffle(level)
      if (result) return result
    }
    return buildPuzzle(level)
  }

  // keeps track of which level the player is on 
  const currentLevel = ref(0)
  const level = computed(() => LEVELS[currentLevel.value]!)
  const isLastLevel = computed(() => currentLevel.value === LEVELS.length - 1)

  // gets shuffled as soon as the page loads
  const puzzle = ref<Puzzle>(buildPuzzle(LEVELS[0]!))
  const selectedCells = ref<Cell[]>([])
  const foundWords = ref<string[]>([])
  const message = ref('')
  const isPaused = ref(false)


  onMounted(() => {
    puzzle.value = shufflePuzzle(LEVELS[0]!)
  })

  const isWon = computed(() => foundWords.value.length === puzzle.value.words.length)

  //the board gets wider and the letters get smaller as the grid grows
  const gridSize = computed(() => puzzle.value.grid[0]!.length)
  const boardStyle = computed(() => ({
    gridTemplateColumns: `repeat(${gridSize.value}, minmax(0, 1fr))`,
    maxWidth: gridSize.value <= 6 ? '520px' : gridSize.value <= 10 ? '680px' : '820px',
  }))
  const letterStyle = computed(() => {
    if (gridSize.value <= 6) return { fontSize: 'clamp(28px, 7vw, 52px)' }
    if (gridSize.value <= 8) return { fontSize: 'clamp(20px, 5vw, 40px)' }
    if (gridSize.value <= 10) return { fontSize: 'clamp(16px, 4vw, 32px)' }
    return { fontSize: 'clamp(12px, 3vw, 26px)' }
  })
  // smaller gaps and corners for the big grids so everything still fits on a phone
  const gapClass = computed(() => (gridSize.value <= 8 ? 'gap-2 sm:gap-3' : 'gap-1 sm:gap-1.5'))
  const tileShapeClass = computed(() =>
    gridSize.value <= 8 ? 'rounded-2xl border-2' : 'rounded-lg border'
  )

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
      if (isWon.value) {
        message.value = isLastLevel.value ? TEXT.allWon : TEXT.levelWon(currentLevel.value + 1)
      } else {
        message.value = TEXT.foundWord(completedWord.word)
      }
      return
    }

    // If no remaining word could still be spelled by adding more taps then reset
    const canContinue = remainingWords.some((item) =>
      matchesPrefix(item.cells, selectedCells.value)
    )

    if (!canContinue) {
      message.value = TEXT.tryAgain
      selectedCells.value = []
    }
  }

  function tapTile(row: number, col: number) {
    
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

  // sets up a freshly shuffled board for whatever level we pass in
  function startLevel(levelIndex: number) {
    currentLevel.value = levelIndex
 
    puzzle.value = shufflePuzzle(LEVELS[levelIndex]!)
    foundWords.value = []
    selectedCells.value = []
    message.value = ''
    isPaused.value = false
  }

  function nextLevel() {
    if (!isLastLevel.value) startLevel(currentLevel.value + 1)
  }

  // lets the player jump straight to any level instead of going in order
  function chooseLevel(levelIndex: number) {
  
    if (foundWords.value.length > 0 && !isWon.value && !window.confirm(TEXT.switchConfirm)) return
    startLevel(levelIndex)
    // set after startLevel because startLevel clears the message
    message.value = TEXT.levelStarted(levelIndex + 1, LEVELS[levelIndex]!.title)
  }

  // after the last level, start over from level 1
  function playAgain() {
    startLevel(0)
  }

  function togglePause() {
    isPaused.value = !isPaused.value
  }

  function exitGame() {
    if (!window.confirm(TEXT.exitConfirm)) return
    startLevel(0)
  }

  function tileClass(row: number, col: number) {
    // check selected first so a shared letter still lights up when you tap it
    if (isCellSelected(row, col)) return 'border-[var(--bn-navy)] bg-[var(--bn-navy)] text-white'
    if (isCellFound(row, col))
      return 'border-[var(--bn-success)] bg-[var(--bn-success-bg)] text-[var(--bn-navy)]'
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
      <div>
        <h2 id="wordsearch-title" class="text-lg font-bold tracking-wide text-orange-800 uppercase">
          Word search
        </h2>
        <!-- shows "Level 1 of 7 · Colors" -->
        <p class="mt-1 text-xl font-semibold text-[var(--bn-navy)]">
          {{ TEXT.levelLabel(currentLevel + 1, LEVELS.length) }} · {{ level.title }}
        </p>
      </div>
      <div class="ml-auto flex flex-wrap gap-3">
        <button type="button" :class="btnQuiet" :aria-pressed="isPaused" @click="togglePause">
          {{ isPaused ? TEXT.resume : TEXT.pause }}
        </button>
        <button type="button" :class="btnQuiet" @click="exitGame">{{ TEXT.exit }}</button>
      </div>
    </div>

    <!-- level picker: pick any level, clicking the current level again shuffles its board -->
    <fieldset class="mt-6">
      <legend class="text-lg font-semibold text-[var(--bn-navy)]">{{ TEXT.chooseLevel }}</legend>
      <div class="mt-3 flex flex-wrap gap-3">
        <button
          v-for="(item, index) in LEVELS"
          :key="item.title"
          type="button"
          :class="index === currentLevel ? btnPrimary : btnQuiet"
          :aria-pressed="index === currentLevel"
          @click="chooseLevel(index)"
        >
          {{ TEXT.levelButton(index + 1) }}
        </button>
      </div>
    </fieldset>

    <p class="mt-3 text-lg leading-relaxed text-[var(--bn-navy)] sm:text-xl">
      {{ level.instructions }} Tap the letters of a word in order. Tap the last letter again to
      undo it.
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
      <!-- the number of columns comes from the level's grid (5 to 15) -->
      <div class="mx-auto grid" :class="gapClass" :style="boardStyle">
        <template v-for="(row, rowIndex) in puzzle.grid" :key="rowIndex">
          <button
            v-for="(letter, colIndex) in row"
            :key="`${rowIndex}-${colIndex}`"
            type="button"
            class="bn-font-display relative flex aspect-square items-center justify-center font-bold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-2 focus-visible:outline-none"
            :class="[tileClass(rowIndex, colIndex), tileShapeClass]"
            :style="letterStyle"
            :aria-label="
              isCellFound(rowIndex, colIndex)
                ? TEXT.tileLabelFound(rowIndex + 1, colIndex + 1, letter)
                : TEXT.tileLabel(rowIndex + 1, colIndex + 1, letter)
            "
            :aria-pressed="isCellSelected(rowIndex, colIndex)"
            @click="tapTile(rowIndex, colIndex)"
          >
            <span aria-hidden="true">{{ letter }}</span>
            <!-- the little check mark only fits on the smaller grids -->
            <span
              v-if="isCellFound(rowIndex, colIndex) && gridSize <= 8"
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

      <!-- caregiver tip from the client's worksheet -->
      <p
        class="mx-auto mt-6 max-w-2xl rounded-2xl border border-[var(--bn-border)] bg-white px-5 py-4 text-lg text-[var(--bn-navy)]"
      >
        <strong>Caregiver tip:</strong> {{ level.tip }}
      </p>

      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" :class="btnQuiet" @click="startOver">{{ TEXT.startOver }}</button>
        <button v-if="isWon && !isLastLevel" type="button" :class="btnPrimary" @click="nextLevel">
          {{ TEXT.nextLevel }}
        </button>
        <button v-if="isWon && isLastLevel" type="button" :class="btnPrimary" @click="playAgain">
          {{ TEXT.playAgain }}
        </button>
      </div>
    </template>
  </section>
</template>
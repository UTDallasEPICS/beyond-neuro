<script setup lang="ts">
  // Picture Puzzle (Puzzles & Games): a photo is cut into square pieces and mixed up.
  // Tap one piece, then tap another to swap them. No dragging and no timer, so it works
  // with one hand, a mouse, a keyboard or a screen reader.
  type PuzzleLevelId = 1 | 2 | 3 | 4 | 5 | 6 | 7

  interface PuzzlePicture {
    src: string
    // Short name used in messages, e.g. "You finished the cat!"
    name: string
    alt: string
  }

  interface PuzzleLevel {
    id: PuzzleLevelId
    name: string
    hint: string
    size: number
    picture: PuzzlePicture
  }

  function pieceSizeLabel(size: number): string {
    if (size <= 4) return 'big'
    if (size <= 6) return 'medium'
    return 'small'
  }

  // Builds one level from its grid size (3 means a 3 × 3 puzzle) and its picture.
  function makeLevel(id: PuzzleLevelId, size: number, picture: PuzzlePicture): PuzzleLevel {
    return {
      id,
      name: `Level ${id}`,
      hint: `${size * size} ${pieceSizeLabel(size)} pieces`,
      size,
      picture,
    }
  }

  // Familiar, high-contrast photos, reused from Reminiscence Therapy.
  const photo = (file: string) => `/activities/reminiscence/photos/${file}`

  const levels: readonly PuzzleLevel[] = [
    makeLevel(1, 3, {
      src: photo('cat-1.jpg'),
      name: 'cat',
      alt: 'An orange cat sitting on a sunny windowsill',
    }),
    makeLevel(2, 4, {
      src: photo('coffee-cup-2.jpg'),
      name: 'coffee mug',
      alt: 'A red mug of coffee on a kitchen counter',
    }),
    makeLevel(3, 5, {
      src: photo('dog-1.jpg'),
      name: 'dog',
      alt: 'A golden retriever sitting on a wooden porch',
    }),
    makeLevel(4, 6, {
      src: photo('fire-hydrant-1.jpg'),
      name: 'fire hydrant',
      alt: 'A red fire hydrant beside a sidewalk and green lawn',
    }),
    makeLevel(5, 7, {
      src: photo('bicycle-1.jpg'),
      name: 'bicycle',
      alt: 'A blue bicycle with a basket leaning against a brick wall',
    }),
    makeLevel(6, 8, {
      src: photo('mailbox-3.jpg'),
      name: 'mailbox',
      alt: 'A black mailbox on a brick post with pink flowers below',
    }),
    makeLevel(7, 9, {
      src: photo('teapot-3.jpg'),
      name: 'kettle',
      alt: 'A copper kettle on a kitchen stove',
    }),
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

  // board[spot] is the piece sitting in that spot; piece n belongs in spot n.
  // Every piece starts out of place, so the puzzle never begins partly solved.
  function mixedUpBoard(pieceCount: number): number[] {
    const pieces = Array.from({ length: pieceCount }, (_, i) => i)
    let board: number[]
    do {
      board = shuffle(pieces)
    } while (board.some((piece, spot) => piece === spot))
    return board
  }

  // Level 1 is default
  const activeLevelId = ref<PuzzleLevelId>(1)
  const level = computed(() => levels.find((l) => l.id === activeLevelId.value)!)

  // Each level keeps its own puzzle, so switching levels never loses progress.
  // Boards are mixed up in the browser only, so server and browser render match.
  const boardsByLevel = ref<Partial<Record<PuzzleLevelId, number[]>>>({})
  const board = computed(() => boardsByLevel.value[activeLevelId.value] ?? [])

  const selectedSpot = ref<number | null>(null)
  // The one piece reachable with Tab; arrow keys move between pieces.
  const focusedSpot = ref(0)
  const showPicture = ref(true)
  const message = ref('')
  const pieceButtons: (HTMLButtonElement | null)[] = []

  const totalPieces = computed(() => level.value.size ** 2)
  const placedCount = computed(() => board.value.filter((piece, spot) => piece === spot).length)
  const isComplete = computed(
    () => board.value.length > 0 && placedCount.value === totalPieces.value
  )

  function isPlaced(spot: number) {
    return board.value[spot] === spot
  }

  function position(index: number) {
    const size = level.value.size
    return { row: Math.floor(index / size) + 1, col: (index % size) + 1 }
  }

  function setUpLevel(id: PuzzleLevelId) {
    const size = levels.find((l) => l.id === id)!.size
    if (!boardsByLevel.value[id]) boardsByLevel.value[id] = mixedUpBoard(size * size)
  }

  function chooseLevel(id: PuzzleLevelId) {
    activeLevelId.value = id
    setUpLevel(id)
    selectedSpot.value = null
    focusedSpot.value = 0
    message.value = ''
  }

  function mixUpAgain() {
    boardsByLevel.value[activeLevelId.value] = mixedUpBoard(totalPieces.value)
    selectedSpot.value = null
    focusedSpot.value = 0
    message.value = 'The pieces are mixed up again.'
  }

  function swap(a: number, b: number) {
    const next = [...board.value]
    const temp = next[a]!
    next[a] = next[b]!
    next[b] = temp
    boardsByLevel.value[activeLevelId.value] = next
  }

  // Gentle feedback only. A swap that places nothing is never called wrong.
  function announceMove(a: number, b: number) {
    if (isComplete.value) {
      message.value = `You finished the ${level.value.picture.name}! Wonderful work.`
      return
    }
    const placedNow = [a, b].filter(isPlaced).length
    if (placedNow === 2) message.value = 'Both pieces are now in the right place!'
    else if (placedNow === 1) message.value = 'One piece is now in the right place.'
    else message.value = 'Pieces swapped. Take your time.'
  }

  function tapSpot(spot: number) {
    focusedSpot.value = spot
    if (isComplete.value) return

    if (isPlaced(spot)) {
      message.value = 'That piece is already in the right place.'
      return
    }

    if (selectedSpot.value === null) {
      selectedSpot.value = spot
      message.value = 'Piece picked up. Now tap the spot where it belongs.'
      return
    }

    if (selectedSpot.value === spot) {
      selectedSpot.value = null
      message.value = 'Piece put back down.'
      return
    }

    const from = selectedSpot.value
    swap(from, spot)
    selectedSpot.value = null
    announceMove(from, spot)
  }

  // Helper: moves one piece into its right spot for the player.
  function placeOnePiece() {
    const spot = board.value.findIndex((piece, s) => piece !== s)
    if (spot === -1) return
    const from = board.value.indexOf(spot)
    swap(spot, from)
    selectedSpot.value = null
    focusedSpot.value = spot
    if (isComplete.value) {
      announceMove(spot, from)
      return
    }
    const { row, col } = position(spot)
    message.value = `One piece placed for you in row ${row}, column ${col}.`
  }

  function goToNextLevel() {
    if (activeLevelId.value < 7) chooseLevel((activeLevelId.value + 1) as PuzzleLevelId)
  }

  // Arrow keys move around the board, Home and End jump to the ends of a row.
  function onBoardKeydown(event: KeyboardEvent, spot: number) {
    const size = level.value.size
    const row = Math.floor(spot / size)
    const col = spot % size
    let next: number | null

    switch (event.key) {
      case 'ArrowUp':
        next = row > 0 ? spot - size : null
        break
      case 'ArrowDown':
        next = row < size - 1 ? spot + size : null
        break
      case 'ArrowLeft':
        next = col > 0 ? spot - 1 : null
        break
      case 'ArrowRight':
        next = col < size - 1 ? spot + 1 : null
        break
      case 'Home':
        next = row * size
        break
      case 'End':
        next = row * size + size - 1
        break
      default:
        return
    }

    event.preventDefault()
    if (next === null) return
    focusedSpot.value = next
    pieceButtons[next]?.focus()
  }

  // Shows the part of the picture that belongs to this piece.
  function pieceStyle(piece: number) {
    const size = level.value.size
    const step = 100 / (size - 1)
    return {
      backgroundImage: `url(${level.value.picture.src})`,
      backgroundSize: `${size * 100}% ${size * 100}%`,
      backgroundPosition: `${(piece % size) * step}% ${Math.floor(piece / size) * step}%`,
    }
  }

  function spotLabel(spot: number) {
    const here = position(spot)
    const where = `Row ${here.row}, column ${here.col}`
    if (isPlaced(spot)) return `${where}, in the right place`
    const home = position(board.value[spot]!)
    const picked = selectedSpot.value === spot ? ', picked up' : ''
    return `${where}, piece belongs in row ${home.row}, column ${home.col}${picked}`
  }

  onMounted(() => setUpLevel(activeLevelId.value))

  const btnQuiet =
    'inline-flex min-h-14 items-center justify-center rounded-2xl border-2 border-slate-400 bg-white px-6 py-3 text-lg font-semibold text-(--bn-navy) hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-(--bn-navy) focus-visible:ring-offset-4 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60'
</script>

<template>
  <div>
    <h2 class="bn-font-display text-2xl font-bold text-(--bn-navy)">Choose a level</h2>
    <p class="mt-1 text-lg text-(--bn-muted)">You can change this any time.</p>
    <div
      class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4"
      role="group"
      aria-label="Difficulty level"
    >
      <button
        v-for="option in levels"
        :key="option.id"
        type="button"
        class="min-h-18 rounded-2xl border-2 p-4 text-left transition-colors focus-visible:ring-4 focus-visible:ring-(--bn-navy) focus-visible:ring-offset-4 focus-visible:outline-none"
        :class="
          option.id === activeLevelId
            ? 'border-orange-700 bg-(--bn-peach)'
            : 'border-slate-300 bg-white hover:bg-slate-50'
        "
        :aria-pressed="option.id === activeLevelId"
        @click="chooseLevel(option.id)"
      >
        <span class="block text-lg font-bold text-(--bn-navy)">{{ option.name }}</span>
        <span class="block text-lg text-(--bn-muted)">{{ option.hint }}</span>
      </button>
    </div>

    <section
      aria-labelledby="picture-puzzle-title"
      class="mt-6 rounded-[20px] border border-(--bn-border) bg-(--bn-peach) p-6 sm:p-10"
    >
      <h2
        id="picture-puzzle-title"
        class="text-lg font-bold tracking-wide text-orange-800 uppercase"
      >
        Try it now — interactive
      </h2>

      <p class="mt-3 text-lg leading-relaxed text-(--bn-navy) sm:text-xl">
        Tap a piece to pick it up, then tap the spot where it belongs. The two pieces swap places.
        Pieces in the right place get a check mark and stay put. Take as long as you like.
      </p>
      <p class="mt-2 text-lg text-(--bn-muted)">
        Using a keyboard? Arrow keys move around the puzzle. Enter or Space picks up and places a
        piece.
      </p>

      <div class="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          :class="btnQuiet"
          :aria-pressed="showPicture"
          @click="showPicture = !showPicture"
        >
          {{ showPicture ? 'Hide picture' : 'Show picture' }}
        </button>
        <button type="button" :class="btnQuiet" :disabled="isComplete" @click="placeOnePiece">
          Place one piece for me
        </button>
        <button type="button" :class="btnQuiet" class="sm:ml-auto" @click="mixUpAgain">
          Mix up again
        </button>
      </div>

      <figure v-if="showPicture" class="mt-6 flex flex-wrap items-center gap-4">
        <img
          :src="level.picture.src"
          :alt="level.picture.alt"
          width="160"
          height="160"
          class="size-40 rounded-2xl border-2 border-(--bn-border) object-cover"
        />
        <figcaption class="text-lg text-(--bn-navy)">
          <span class="block font-bold">The finished picture</span>
          <span class="block text-(--bn-muted)">Use it as a guide while you work.</span>
        </figcaption>
      </figure>

      <p class="mt-6 text-xl font-semibold text-(--bn-navy)">
        {{ placedCount }} of {{ totalPieces }} pieces in place
      </p>

      <!-- Always rendered so screen readers hear every update -->
      <p aria-live="polite" class="mt-2 min-h-10 text-xl font-semibold text-green-800">
        {{ message }}
      </p>

      <!-- The puzzle board; the number of pieces depends on the level -->
      <div
        class="mx-auto mt-4 grid aspect-square w-full max-w-140 touch-manipulation rounded-2xl border border-(--bn-border) bg-white p-1 select-none"
        :class="isComplete ? 'gap-0' : 'gap-0.5 sm:gap-1'"
        :style="{ gridTemplateColumns: `repeat(${level.size}, minmax(0, 1fr))` }"
        role="group"
        :aria-label="`Puzzle of a ${level.picture.name}, ${level.size} by ${level.size} pieces`"
      >
        <button
          v-for="(piece, spot) in board"
          :key="`${activeLevelId}-${spot}`"
          :ref="(el) => (pieceButtons[spot] = el as HTMLButtonElement | null)"
          type="button"
          class="relative aspect-square bg-slate-200 bg-no-repeat focus-visible:z-20 focus-visible:ring-4 focus-visible:ring-(--bn-navy) focus-visible:ring-offset-2 focus-visible:outline-none"
          :class="[
            selectedSpot === spot
              ? 'z-10 shadow-[inset_0_0_0_8px_white] outline-4 -outline-offset-4 outline-orange-700'
              : '',
            isPlaced(spot) ? 'cursor-default' : 'cursor-pointer',
          ]"
          :style="pieceStyle(piece)"
          :tabindex="spot === focusedSpot ? 0 : -1"
          :aria-label="spotLabel(spot)"
          :aria-pressed="selectedSpot === spot"
          :aria-disabled="isPlaced(spot)"
          @click="tapSpot(spot)"
          @keydown="onBoardKeydown($event, spot)"
        >
          <span
            v-if="isPlaced(spot) && !isComplete"
            class="absolute right-1 bottom-1 flex size-5 items-center justify-center rounded-full bg-(--bn-success) ring-2 ring-white sm:size-6"
            aria-hidden="true"
          >
            <svg viewBox="0 0 20 20" class="size-3.5 sm:size-4" fill="none">
              <path
                d="M4 10.5l4 4 8-9"
                stroke="white"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>

      <div
        v-if="isComplete"
        class="mt-6 rounded-2xl border-2 border-(--bn-success) bg-(--bn-success-bg) p-6 text-center"
      >
        <p class="bn-font-display text-2xl font-bold text-(--bn-navy)">You finished the puzzle!</p>
        <p class="mt-2 text-lg text-(--bn-navy)">{{ level.picture.alt }}.</p>
        <div class="mt-4 flex flex-wrap justify-center gap-4">
          <button v-if="activeLevelId < 7" type="button" :class="btnQuiet" @click="goToNextLevel">
            Try level {{ activeLevelId + 1 }}
          </button>
          <button type="button" :class="btnQuiet" @click="mixUpAgain">Play this one again</button>
        </div>
      </div>
    </section>
  </div>
</template>

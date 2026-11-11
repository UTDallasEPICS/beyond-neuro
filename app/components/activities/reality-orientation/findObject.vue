<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

  type RoomKey = 'living' | 'kitchen' | 'bedroom'

  interface RoomObject {
    emoji: string
    name: string
    // things that hang (a clock, a picture) go on the wall first, then on a shelf or table
    hangs?: boolean
  }

  // a place in the room where an object can sit; wall spots are only used for hanging things.
  // pos is a Tailwind class (the room picture is 160 x 100, so left = x / 1.6 percent)
  interface Spot {
    pos: string
    wall?: boolean
  }

  interface RoomDef {
    name: string
    spots: Spot[]
    // each level uses the first few objects from this list
    objects: RoomObject[]
  }

  interface LevelDef {
    title: string
    room: RoomKey
    // how many objects are in the room
    objectCount: number
    // how many of them the player has to find
    findCount: number
    tip: string
  }

  interface PlacedObject extends RoomObject {
    id: number
    pos: string
  }

  interface Round {
    objects: PlacedObject[]
    // ids of the objects to find, in the order shown in the list
    targets: number[]
  }

  const ROOMS: Record<RoomKey, RoomDef> = {
    living: {
      name: 'Living room',
      spots: [
        // the wall: two either side and one above the sofa
        { pos: 'left-[40%] top-[16%]', wall: true },
        { pos: 'left-[60%] top-[16%]', wall: true },
        { pos: 'left-[50%] top-[36%]', wall: true },
        // window sill
        { pos: 'left-[11.875%] top-[33%]' },
        { pos: 'left-[24.375%] top-[33%]' },
        // two shelves
        { pos: 'left-[71.875%] top-[23%]' },
        { pos: 'left-[81.875%] top-[23%]' },
        { pos: 'left-[91.875%] top-[23%]' },
        { pos: 'left-[71.875%] top-[41%]' },
        { pos: 'left-[81.875%] top-[41%]' },
        { pos: 'left-[91.875%] top-[41%]' },
        // sofa
        { pos: 'left-[43.75%] top-[56%]' },
        { pos: 'left-[56.25%] top-[56%]' },
        // side table
        { pos: 'left-[14.375%] top-[57%]' },
        // coffee table
        { pos: 'left-[44.375%] top-[75%]' },
        { pos: 'left-[55.625%] top-[75%]' },
        // floor
        { pos: 'left-[25%] top-[90%]' },
        { pos: 'left-[80%] top-[88%]' },
        { pos: 'left-[92.5%] top-[92%]' },
      ],
      objects: [
        { emoji: '🕰️', name: 'clock', hangs: true },
        { emoji: '☕', name: 'cup of tea' },
        { emoji: '👓', name: 'glasses' },
        { emoji: '🪴', name: 'plant' },
        { emoji: '🔑', name: 'keys' },
        { emoji: '📚', name: 'books' },
        { emoji: '🖼️', name: 'picture', hangs: true },
        { emoji: '📻', name: 'radio' },
        { emoji: '🐈', name: 'cat' },
        { emoji: '📰', name: 'newspaper' },
        { emoji: '📅', name: 'calendar', hangs: true },
        { emoji: '🕯️', name: 'candle' },
        { emoji: '☎️', name: 'telephone' },
        { emoji: '🧶', name: 'ball of yarn' },
        { emoji: '🧸', name: 'teddy bear' },
        { emoji: '💐', name: 'flowers' },
      ],
    },
    kitchen: {
      name: 'Kitchen',
      spots: [
        // the wall
        { pos: 'left-[11.25%] top-[18%]', wall: true },
        { pos: 'left-[26.25%] top-[18%]', wall: true },
        // window sill
        { pos: 'left-[43.75%] top-[27%]' },
        { pos: 'left-[56.25%] top-[27%]' },
        // open shelves
        { pos: 'left-[74.375%] top-[17%]' },
        { pos: 'left-[83.75%] top-[17%]' },
        { pos: 'left-[93.125%] top-[17%]' },
        { pos: 'left-[74.375%] top-[33%]' },
        { pos: 'left-[83.75%] top-[33%]' },
        { pos: 'left-[93.125%] top-[33%]' },
        // counter, with the sink in the middle
        { pos: 'left-[7.5%] top-[49%]' },
        { pos: 'left-[17.5%] top-[49%]' },
        { pos: 'left-[27.5%] top-[49%]' },
        { pos: 'left-[37.5%] top-[49%]' },
        { pos: 'left-[63.75%] top-[49%]' },
        { pos: 'left-[73.75%] top-[49%]' },
        { pos: 'left-[83.75%] top-[49%]' },
        { pos: 'left-[93.75%] top-[49%]' },
      ],
      objects: [
        { emoji: '🫖', name: 'teapot' },
        { emoji: '🍎', name: 'apple' },
        { emoji: '🍞', name: 'bread' },
        { emoji: '🕰️', name: 'clock', hangs: true },
        { emoji: '🍌', name: 'bananas' },
        { emoji: '🥛', name: 'glass of milk' },
        { emoji: '🥄', name: 'spoon' },
        { emoji: '🧀', name: 'cheese' },
        { emoji: '📅', name: 'calendar', hangs: true },
        { emoji: '🥕', name: 'carrot' },
        { emoji: '🍯', name: 'honey' },
        { emoji: '🍋', name: 'lemon' },
      ],
    },
    bedroom: {
      name: 'Bedroom',
      spots: [
        // the wall: above the bed and above the dresser
        { pos: 'left-[41.25%] top-[16%]', wall: true },
        { pos: 'left-[58.75%] top-[16%]', wall: true },
        { pos: 'left-[78.75%] top-[18%]', wall: true },
        { pos: 'left-[92.5%] top-[18%]', wall: true },
        // window sill
        { pos: 'left-[13.125%] top-[31%]' },
        { pos: 'left-[23.125%] top-[31%]' },
        // bed
        { pos: 'left-[50%] top-[62%]' },
        { pos: 'left-[41.25%] top-[71%]' },
        { pos: 'left-[58.75%] top-[71%]' },
        // night stand
        { pos: 'left-[23.75%] top-[55%]' },
        // dresser
        { pos: 'left-[76.875%] top-[39%]' },
        { pos: 'left-[85%] top-[39%]' },
        { pos: 'left-[93.125%] top-[39%]' },
        // floor
        { pos: 'left-[12.5%] top-[92%]' },
        { pos: 'left-[61.25%] top-[93%]' },
        { pos: 'left-[87.5%] top-[93%]' },
      ],
      objects: [
        { emoji: '⏰', name: 'alarm clock' },
        { emoji: '📖', name: 'book' },
        { emoji: '🧸', name: 'teddy bear' },
        { emoji: '👓', name: 'glasses' },
        { emoji: '🥿', name: 'slippers' },
        { emoji: '🖼️', name: 'picture', hangs: true },
        { emoji: '👒', name: 'hat' },
        { emoji: '💊', name: 'medicine' },
        { emoji: '📅', name: 'calendar', hangs: true },
        { emoji: '🧦', name: 'socks' },
        { emoji: '🪥', name: 'toothbrush' },
        { emoji: '🪞', name: 'mirror', hangs: true },
        { emoji: '🧣', name: 'scarf' },
        { emoji: '💍', name: 'ring' },
      ],
    },
  }

  // each level has more objects in the room and more of them to find
  const LEVELS: LevelDef[] = [
    {
      title: 'Living room',
      room: 'living',
      objectCount: 4,
      findCount: 1,
      tip: 'Name the room together first. Point to the window, the sofa, and the shelves before you start looking.',
    },
    {
      title: 'Kitchen',
      room: 'kitchen',
      objectCount: 6,
      findCount: 2,
      tip: 'After each find, talk about what the object is used for. Is there one like it in your own kitchen?',
    },
    {
      title: 'Bedroom',
      room: 'bedroom',
      objectCount: 8,
      findCount: 3,
      tip: 'Look from left to right, one part of the room at a time: the window, the bed, then the dresser.',
    },
    {
      title: 'Living room',
      room: 'living',
      objectCount: 10,
      findCount: 4,
      tip: 'Say where each object is when you find it: "The keys are on the shelf." Then look for the same thing in the real room.',
    },
    {
      title: 'Kitchen',
      room: 'kitchen',
      objectCount: 12,
      findCount: 5,
      tip: 'Find the clock and the calendar in the picture, then check the real time and date together.',
    },
    {
      title: 'Bedroom',
      room: 'bedroom',
      objectCount: 14,
      findCount: 6,
      tip: 'Talk about a morning routine. Which of these things do you use first when you wake up?',
    },
    {
      title: 'Living room',
      room: 'living',
      objectCount: 16,
      findCount: 7,
      tip: 'Take a stretch break halfway through. Use "Help me look" whenever you want a hint. There is no rush.',
    },
  ]

  const TEXT = {
    heading: 'Find the object',
    findThese: 'Find these things:',
    newRoom: 'New room',
    playAgain: 'Play again',
    nextLevel: 'Next level',
    hint: 'Help me look',
    pause: 'Pause',
    resume: 'Resume',
    exit: 'Exit',
    exitConfirm: 'Do you want to leave the game?',
    paused: 'Game paused.',
    chooseLevel: 'Choose a level:',
    levelButton: (level: number) => `Level ${level}`,
    levelLabel: (level: number, total: number) => `Level ${level} of ${total}`,
    instructions: (count: number) =>
      count === 1
        ? 'Look around the room and tap the thing shown below. Take as long as you like.'
        : `Look around the room and tap the ${count} things shown below, in any order. Take as long as you like.`,
    roomLabel: (room: string) => `${room}. Tap an object to choose it.`,
    found: (name: string) => `You found the ${name}!`,
    notThis: (name: string, next: string) => `That is the ${name}. Keep looking for the ${next}.`,
    alreadyFound: (name: string) => `You already found the ${name}.`,
    hintFor: (name: string) => `Look for the glowing circle. That is the ${name}.`,
    levelWon: (level: number) => `You finished level ${level}! Wonderful work.`,
    allWon: 'You found everything in every room. Wonderful work!',
    levelStarted: (level: number, title: string) => `Level ${level}: ${title}. Good luck!`,
    switchConfirm: 'You have found some things in this room. Do you want to start a new room?',
    objectLabel: (name: string) => name,
    objectLabelFound: (name: string) => `${name}, found`,
  }

  function randomInt(max: number) {
    return Math.floor(Math.random() * max)
  }

  // the numbers 0 up to count - 1, mixed up when random is true (used to shuffle any list)
  function order(count: number, random: boolean): number[] {
    const numbers = Array.from({ length: count }, (_, i) => i)
    if (!random) return numbers
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = randomInt(i + 1)
      const temp = numbers[i]!
      numbers[i] = numbers[j]!
      numbers[j] = temp
    }
    return numbers
  }

  // puts the level's objects in random spots and picks which ones to find
  function buildRound(level: LevelDef, random: boolean): Round {
    const room = ROOMS[level.room]
    const allWall = room.spots.filter((spot) => spot.wall)
    const allOther = room.spots.filter((spot) => !spot.wall)
    const wallSpots = order(allWall.length, random).map((i) => allWall[i]!)
    const otherSpots = order(allOther.length, random).map((i) => allOther[i]!)

    const objects = room.objects.slice(0, level.objectCount).map((item, index) => {
      // hanging things try the wall first, everything else sits on a surface
      const spot = (item.hangs ? wallSpots.shift() : undefined) ?? otherSpots.shift()!
      return { ...item, id: index, pos: spot.pos }
    })

    // object ids match their place in the list, so mixed-up numbers are mixed-up ids
    const targets = order(objects.length, random).slice(0, level.findCount)

    return { objects, targets }
  }

  // keeps track of which level the player is on
  const currentLevel = ref(0)
  const level = computed(() => LEVELS[currentLevel.value]!)
  const room = computed(() => ROOMS[level.value.room])
  const isLastLevel = computed(() => currentLevel.value === LEVELS.length - 1)

  // the first board is the same on the server and in the browser, then it gets shuffled
  const round = ref<Round>(buildRound(LEVELS[0]!, false))
  const foundIds = ref<number[]>([])
  const hintId = ref<number | null>(null)
  const message = ref('')
  const isPaused = ref(false)

  let hintTimer: ReturnType<typeof setTimeout> | undefined

  onMounted(() => {
    round.value = buildRound(LEVELS[0]!, true)
  })

  onBeforeUnmount(() => clearTimeout(hintTimer))

  const targets = computed(() =>
    round.value.targets.map((id) => round.value.objects.find((item) => item.id === id)!)
  )
  const remainingTargets = computed(() =>
    targets.value.filter((item) => !foundIds.value.includes(item.id))
  )
  const isWon = computed(() => remainingTargets.value.length === 0)

  // fewer objects means each one can be drawn bigger (cqw = percent of the room's width)
  const objectSizeClass = computed(() =>
    level.value.objectCount <= 8 ? 'size-[10.8cqw] text-[7cqw]' : 'size-[9.3cqw] text-[6cqw]'
  )

  function isFound(item: PlacedObject) {
    return foundIds.value.includes(item.id)
  }

  function clearHint() {
    clearTimeout(hintTimer)
    hintId.value = null
  }

  function tapObject(item: PlacedObject) {
    if (isWon.value) return

    if (isFound(item)) {
      message.value = TEXT.alreadyFound(item.name)
      return
    }

    if (round.value.targets.includes(item.id)) {
      foundIds.value.push(item.id)
      clearHint()
      if (isWon.value) {
        message.value = isLastLevel.value ? TEXT.allWon : TEXT.levelWon(currentLevel.value + 1)
      } else {
        message.value = TEXT.found(item.name)
      }
      return
    }

    // a gentle nudge, never a penalty
    message.value = TEXT.notThis(item.name, remainingTargets.value[0]!.name)
  }

  // makes one of the things still to find glow for a few seconds
  function showHint() {
    const next = remainingTargets.value[0]
    if (!next) return
    clearTimeout(hintTimer)
    hintId.value = next.id
    message.value = TEXT.hintFor(next.name)
    hintTimer = setTimeout(() => (hintId.value = null), 6000)
  }

  // sets up a freshly shuffled room for whatever level we pass in
  function startLevel(levelIndex: number) {
    currentLevel.value = levelIndex
    round.value = buildRound(LEVELS[levelIndex]!, true)
    foundIds.value = []
    message.value = ''
    isPaused.value = false
    clearHint()
  }

  function newRoom() {
    startLevel(currentLevel.value)
  }

  function nextLevel() {
    if (!isLastLevel.value) startLevel(currentLevel.value + 1)
  }

  // lets the player jump straight to any level instead of going in order
  function chooseLevel(levelIndex: number) {
    if (foundIds.value.length > 0 && !isWon.value && !window.confirm(TEXT.switchConfirm)) return
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

  function objectClass(item: PlacedObject) {
    return [item.pos, objectSizeClass.value, objectStateClass(item)]
  }

  function objectStateClass(item: PlacedObject) {
    if (isFound(item)) return 'border-[var(--bn-success)] bg-[var(--bn-success-bg)]'
    if (hintId.value === item.id)
      return 'border-orange-700 bg-white/80 ring-4 ring-orange-500/60 motion-safe:animate-pulse'
    return 'border-transparent hover:border-[var(--bn-navy)] hover:bg-white/60'
  }

  const btnBase =
    'inline-flex min-h-[56px] items-center justify-center rounded-2xl px-6 py-3 text-lg font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none'
  const btnPrimary = `${btnBase} bg-orange-700 text-white hover:bg-orange-800`
  const btnQuiet = `${btnBase} border-2 border-slate-400 bg-white text-[var(--bn-navy)] hover:bg-slate-50`
</script>

<template>
  <section
    aria-labelledby="find-object-title"
    class="rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 sm:p-10"
  >
    <div class="flex flex-wrap items-center gap-4">
      <div>
        <h2
          id="find-object-title"
          class="text-lg font-bold tracking-wide text-orange-800 uppercase"
        >
          {{ TEXT.heading }}
        </h2>
        <!-- shows "Level 1 of 7 · Living room" -->
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

    <!-- level picker: pick any level, clicking the current level again gives a new room -->
    <fieldset class="mt-6">
      <legend class="text-lg font-semibold text-[var(--bn-navy)]">{{ TEXT.chooseLevel }}</legend>
      <div class="mt-3 flex flex-wrap gap-3">
        <button
          v-for="(item, index) in LEVELS"
          :key="index"
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
      {{ TEXT.instructions(level.findCount) }}
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
      <!-- the list of things to find sits above the room so it is read first -->
      <h3 class="text-center text-2xl font-semibold text-[var(--bn-navy)]">
        {{ TEXT.findThese }}
      </h3>
      <ul class="mt-4 mb-6 flex list-none flex-wrap justify-center gap-3 p-0">
        <li
          v-for="item in targets"
          :key="item.id"
          class="flex items-center gap-2 rounded-full border-2 px-5 py-2 text-2xl text-[var(--bn-navy)]"
          :class="
            isFound(item)
              ? 'border-[var(--bn-success)] bg-[var(--bn-success-bg)]'
              : 'border-[var(--bn-border)] bg-white'
          "
        >
          <span aria-hidden="true">{{ item.emoji }}</span>
          <span class="capitalize">{{ item.name }}</span>
          <span v-if="isFound(item)" aria-hidden="true">✓</span>
          <span v-if="isFound(item)" class="sr-only">(found)</span>
        </li>
      </ul>

      <!-- the room: a drawing with tappable objects placed on top of it -->
      <div
        role="group"
        :aria-label="TEXT.roomLabel(room.name)"
        class="@container relative mx-auto aspect-[16/10] w-full max-w-[820px] overflow-hidden rounded-2xl border-2 border-[var(--bn-border)] bg-white"
      >
        <svg
          class="absolute inset-0 h-full w-full"
          viewBox="0 0 160 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <!-- living room -->
          <g v-if="level.room === 'living'">
            <rect width="160" height="66" fill="#f6e6d4" />
            <rect y="66" width="160" height="34" fill="#c89a6c" />
            <path d="M0 75H160M0 84H160M0 93H160" stroke="#b5875b" stroke-width="0.5" />
            <rect y="64" width="160" height="2.5" fill="#fffaf3" />
            <!-- window -->
            <rect x="10" y="8" width="38" height="30" rx="1" fill="#fffaf3" />
            <rect x="12" y="10" width="34" height="26" fill="#cfe8f5" />
            <path d="M29 10V36M12 23H46" stroke="#fffaf3" stroke-width="1.5" />
            <rect x="7" y="38" width="44" height="3" rx="1" fill="#fffaf3" />
            <rect x="7" y="41" width="44" height="0.8" fill="#e2d4c2" />
            <!-- shelves -->
            <rect x="107" y="28" width="48" height="2" fill="#9a6b45" />
            <rect x="107" y="46" width="48" height="2" fill="#9a6b45" />
            <path d="M110 30v3M152 30v3M110 48v3M152 48v3" stroke="#7d5535" stroke-width="1.2" />
            <!-- side table -->
            <rect x="12" y="62" width="22" height="2.5" rx="0.5" fill="#9a6b45" />
            <path d="M15 64.5V80M31 64.5V80" stroke="#7d5535" stroke-width="1.6" />
            <!-- rug -->
            <ellipse cx="80" cy="88" rx="46" ry="8" fill="#d9785a" opacity="0.45" />
            <!-- sofa -->
            <rect x="54" y="48" width="52" height="16" rx="4" fill="#7d8fb3" />
            <rect x="52" y="60" width="56" height="12" rx="3" fill="#6b7ea3" />
            <rect x="48" y="54" width="10" height="20" rx="3" fill="#5d7096" />
            <rect x="102" y="54" width="10" height="20" rx="3" fill="#5d7096" />
            <path d="M55 74v3M105 74v3" stroke="#4a3a2c" stroke-width="1.6" />
            <!-- coffee table -->
            <rect x="62" y="80" width="36" height="3" rx="0.5" fill="#8a5a3b" />
            <path d="M65 83V93M95 83V93" stroke="#6e4529" stroke-width="2" />
          </g>

          <!-- kitchen -->
          <g v-else-if="level.room === 'kitchen'">
            <rect width="160" height="58" fill="#eaf1e1" />
            <rect y="40" width="160" height="14" fill="#fffaf3" />
            <path
              d="M0 47H160M8 40v14M24 40v14M40 40v14M56 40v14M72 40v14M88 40v14M104 40v14M120 40v14M136 40v14M152 40v14"
              stroke="#e4ddd0"
              stroke-width="0.5"
            />
            <!-- window -->
            <rect x="60" y="6" width="40" height="26" rx="1" fill="#fffaf3" />
            <rect x="62" y="8" width="36" height="22" fill="#cfe8f5" />
            <path d="M80 8V30M62 19H98" stroke="#fffaf3" stroke-width="1.5" />
            <rect x="57" y="32" width="46" height="3" rx="1" fill="#fffaf3" />
            <rect x="57" y="35" width="46" height="0.8" fill="#dcd5c6" />
            <!-- open shelves -->
            <rect x="111" y="22" width="46" height="2" fill="#9a6b45" />
            <rect x="111" y="38" width="46" height="2" fill="#9a6b45" />
            <!-- counter and cupboards -->
            <rect y="58" width="160" height="32" fill="#f1d3ad" />
            <path
              d="M0 58H160M20 58V90M40 58V90M60 58V90M100 58V90M120 58V90M140 58V90"
              stroke="#d7b48a"
              stroke-width="0.7"
            />
            <path
              d="M16 72v4M24 72v4M56 72v4M104 72v4M136 72v4M144 72v4"
              stroke="#8a5a3b"
              stroke-width="1.2"
              stroke-linecap="round"
            />
            <!-- oven door under the sink -->
            <rect x="64" y="62" width="32" height="24" rx="1.5" fill="#d8d3cc" />
            <rect x="67" y="66" width="26" height="14" rx="1" fill="#4e4a47" opacity="0.7" />
            <rect y="53.5" width="160" height="4.5" fill="#c4b3a1" />
            <!-- sink and tap -->
            <rect x="70" y="53.5" width="20" height="2" rx="0.5" fill="#93a4b0" />
            <path
              d="M80 53.5V46q0-3 3-3h2"
              fill="none"
              stroke="#93a4b0"
              stroke-width="1.6"
              stroke-linecap="round"
            />
            <!-- floor -->
            <rect y="90" width="160" height="10" fill="#d8c3a5" />
            <path
              d="M0 95H160M10 90v10M30 90v10M50 90v10M70 90v10M90 90v10M110 90v10M130 90v10M150 90v10"
              stroke="#c4ad8d"
              stroke-width="0.5"
            />
          </g>

          <!-- bedroom -->
          <g v-else>
            <rect width="160" height="68" fill="#ece6f5" />
            <rect y="68" width="160" height="32" fill="#cdb59a" />
            <rect y="66.5" width="160" height="2" fill="#fffaf3" />
            <ellipse cx="80" cy="92" rx="50" ry="6" fill="#a993c9" opacity="0.4" />
            <!-- window with curtains -->
            <rect x="12" y="8" width="34" height="28" rx="1" fill="#fffaf3" />
            <rect x="14" y="10" width="30" height="24" fill="#cfe8f5" />
            <path d="M29 10V34M14 22H44" stroke="#fffaf3" stroke-width="1.5" />
            <rect x="10" y="36" width="38" height="2.5" rx="1" fill="#fffaf3" />
            <path d="M6 6H52" stroke="#8a5a3b" stroke-width="1.2" />
            <path d="M7 6h7v34q-4 1-7 0z" fill="#e7a6a0" />
            <path d="M44 6h7v34q-3 1-7 0z" fill="#e7a6a0" />
            <!-- night stand -->
            <rect x="28" y="60" width="20" height="22" rx="1" fill="#9a6b45" />
            <path d="M28 70H48" stroke="#7d5535" stroke-width="0.6" />
            <circle cx="38" cy="65" r="0.9" fill="#f1d3ad" />
            <circle cx="38" cy="75" r="0.9" fill="#f1d3ad" />
            <!-- bed -->
            <rect x="56" y="36" width="48" height="28" rx="4" fill="#8a5a3b" />
            <rect x="50" y="58" width="60" height="22" rx="3" fill="#fffaf3" />
            <ellipse cx="68" cy="58" rx="9" ry="3.5" fill="#ffffff" stroke="#e2d9d0" stroke-width="0.4" />
            <ellipse cx="92" cy="58" rx="9" ry="3.5" fill="#ffffff" stroke="#e2d9d0" stroke-width="0.4" />
            <rect x="50" y="65" width="60" height="17" rx="3" fill="#7aa6c2" />
            <path d="M50 69H110" stroke="#6893ae" stroke-width="0.6" />
            <!-- dresser -->
            <rect x="114" y="44" width="44" height="2.5" rx="0.5" fill="#7d5535" />
            <rect x="116" y="46.5" width="40" height="38" fill="#9a6b45" />
            <path d="M116 59H156M116 72H156" stroke="#7d5535" stroke-width="0.6" />
            <path
              d="M132 52.5h8M132 65.5h8M132 78.5h8"
              stroke="#f1d3ad"
              stroke-width="1.2"
              stroke-linecap="round"
            />
          </g>
        </svg>

        <button
          v-for="item in round.objects"
          :key="item.id"
          type="button"
          class="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 leading-none transition-colors focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:outline-none"
          :class="objectClass(item)"
          :aria-label="isFound(item) ? TEXT.objectLabelFound(item.name) : TEXT.objectLabel(item.name)"
          @click="tapObject(item)"
        >
          <span aria-hidden="true" class="drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
            {{ item.emoji }}
          </span>
          <span
            v-if="isFound(item)"
            aria-hidden="true"
            class="absolute -right-1 -bottom-1 grid size-[3cqw] min-h-4 min-w-4 place-items-center rounded-full bg-[var(--bn-success)] text-[max(1.8cqw,10px)] text-white"
          >
            ✓
          </span>
        </button>
      </div>

      <!-- caregiver tip -->
      <p
        class="mx-auto mt-6 max-w-2xl rounded-2xl border border-[var(--bn-border)] bg-white px-5 py-4 text-lg text-[var(--bn-navy)]"
      >
        <strong>Caregiver tip:</strong> {{ level.tip }}
      </p>

      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <button v-if="!isWon" type="button" :class="btnQuiet" @click="showHint">
          {{ TEXT.hint }}
        </button>
        <button type="button" :class="btnQuiet" @click="newRoom">{{ TEXT.newRoom }}</button>
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
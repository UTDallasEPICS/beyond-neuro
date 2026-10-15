<script setup lang="ts">
  // Same 9 swatches as the BeyondNeuro / Figma coloring demo,
  const colors = [
    '#3b82f6', // blue
    '#f97316', // orange
    '#7c3aed', // purple
    '#22c55e', // green
    '#ec4899', // pink
    '#14b8a6', // teal
    '#ef4444', // red
    '#1e3a5f', // navy
    '#38bdf8', // sky
  ] as const

  type MirrorLevelId = 1 | 2 | 3 | 4 | 5 | 6 | 7

  interface MirrorLevel {
    id: MirrorLevelId
    name: string
    hint: string
    size: number
    colors: readonly string[]
  }

  function squareLabel(size: number): string {
    if (size <= 5) return 'Big'
    if (size <= 9) return 'Medium'
    return 'Small'
  }

  // Builds one level from its grid size and how many colors it offers.
  function makeLevel(id: MirrorLevelId, size: number, colorCount: number): MirrorLevel {
    return {
      id,
      name: `Level ${id}`,
      hint: `${squareLabel(size)} squares, ${colorCount} colors`,
      size,
      colors: colors.slice(0, colorCount),
    }
  }

  const levels: readonly MirrorLevel[] = [
    makeLevel(1, 5, 3),
    makeLevel(2, 5, 5),
    makeLevel(3, 9, 5),
    makeLevel(4, 9, 6),
    makeLevel(5, 9, 7),
    makeLevel(6, 13, 7),
    makeLevel(7, 13, 9),
  ]

  const EMPTY = ''

  function makeGrid(size: number): string[][] {
    return Array.from({ length: size }, () => Array.from({ length: size }, () => EMPTY))
  }

  // Level 1 is default
  const activeLevelId = ref<MirrorLevelId>(1)
  const level = computed(() => levels.find((l) => l.id === activeLevelId.value)!)

  // Each level keeps its own drawing
  const cellsByLevel = ref(
    Object.fromEntries(levels.map((l) => [l.id, makeGrid(l.size)])) as Record<
      MirrorLevelId,
      string[][]
    >
  )
  const cells = computed(() => cellsByLevel.value[activeLevelId.value])

  const selectedColor = ref<string>(level.value.colors[0]!)

  // True while pointer is held down — enables drag-to-paint
  const isPainting = ref(false)

  /** Paint a cell and its left/right mirror twin (bilateral symmetry). */
  function paintCell(row: number, col: number) {
    const mirrorCol = level.value.size - 1 - col
    const next = cells.value.map((r) => [...r])
    next[row]![col] = selectedColor.value
    next[row]![mirrorCol] = selectedColor.value
    cellsByLevel.value[activeLevelId.value] = next
  }

  function clearCanvas() {
    cellsByLevel.value[activeLevelId.value] = makeGrid(level.value.size)
  }

  function chooseLevel(id: MirrorLevelId) {
    activeLevelId.value = id
    isPainting.value = false
    // Lower levels have fewer colors, so keep the current color only if it exists here.
    if (!level.value.colors.includes(selectedColor.value)) {
      selectedColor.value = level.value.colors[0]!
    }
  }

  function onCellPointerDown(row: number, col: number) {
    isPainting.value = true
    paintCell(row, col)
  }

  function onCellPointerEnter(row: number, col: number) {
    if (isPainting.value) {
      paintCell(row, col)
    }
  }

  function stopPainting() {
    isPainting.value = false
  }
</script>

<template>
  <div>
    <h2 class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">Choose a level</h2>
    <p class="mt-1 text-lg text-[var(--bn-muted)]">You can change this any time.</p>
    <div
      class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4"
      role="group"
      aria-label="Difficulty level"
    >
      <button
        v-for="option in levels"
        :key="option.id"
        type="button"
        class="min-h-[72px] rounded-2xl border-2 p-4 text-left transition-colors focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
        :class="
          option.id === activeLevelId
            ? 'border-orange-700 bg-[var(--bn-peach)]'
            : 'border-slate-300 bg-white hover:bg-slate-50'
        "
        :aria-pressed="option.id === activeLevelId"
        @click="chooseLevel(option.id)"
      >
        <span class="block text-lg font-bold text-[var(--bn-navy)]">{{ option.name }}</span>
        <span class="block text-lg text-[var(--bn-muted)]">{{ option.hint }}</span>
      </button>
    </div>

    <ActivityCard
      class="mt-6"
      instructions="Tap or drag across the canvas to color. Each stroke is mirrored — a quiet, low-pressure way to focus the mind."
      @clear="clearCanvas"
    >
      <template #palette>
        <ColorPalette v-model="selectedColor" :colors="level.colors" />
      </template>

      <!-- Mirrored coloring grid; size depends on the level -->
      <div
        class="mt-6 touch-none overflow-hidden rounded-2xl border border-[var(--bn-border)] bg-white select-none"
        @pointerup="stopPainting"
        @pointerleave="stopPainting"
        @pointercancel="stopPainting"
      >
        <div
          class="grid aspect-square w-full"
          :style="{ gridTemplateColumns: `repeat(${level.size}, minmax(0, 1fr))` }"
          role="grid"
          :aria-label="`Mirrored coloring canvas, ${level.size} by ${level.size}`"
        >
          <template v-for="(row, rowIndex) in cells" :key="`${activeLevelId}-${rowIndex}`">
            <button
              v-for="(cellColor, colIndex) in row"
              :key="`${activeLevelId}-${rowIndex}-${colIndex}`"
              type="button"
              role="gridcell"
              class="aspect-square border border-slate-200 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[var(--bn-navy)] focus-visible:outline-none"
              :style="{ backgroundColor: cellColor || '#ffffff' }"
              :aria-label="`Row ${rowIndex + 1}, column ${colIndex + 1}${cellColor ? ', colored' : ''}`"
              @pointerdown.prevent="onCellPointerDown(rowIndex, colIndex)"
              @pointerenter="onCellPointerEnter(rowIndex, colIndex)"
              @keydown.enter.prevent="paintCell(rowIndex, colIndex)"
              @keydown.space.prevent="paintCell(rowIndex, colIndex)"
            />
          </template>
        </div>
      </div>
    </ActivityCard>
  </div>
</template>

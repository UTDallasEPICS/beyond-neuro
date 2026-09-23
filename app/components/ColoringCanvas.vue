<script setup lang="ts">
  // Same 9 swatches as the BeyondNeuro / Figma coloring demo
  const colors = [
    '#7c3aed', // purple
    '#3b82f6', // blue
    '#14b8a6', // teal
    '#f97316', // orange
    '#ec4899', // pink
    '#22c55e', // green
    '#ef4444', // red
    '#38bdf8', // sky
    '#1e3a5f', // navy
  ] as const

  const GRID_SIZE = 9
  const EMPTY = ''

  // selectedColor ≈ React useState(colors[0])
  const selectedColor = ref<(typeof colors)[number]>(colors[0])

  // 9×9 grid of fill colors. '' = uncolored. ≈ useState 2D array
  const cells = ref<string[][]>(
    Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => EMPTY)),
  )

  // True while pointer is held down — enables drag-to-paint
  const isPainting = ref(false)

  function selectColor(color: (typeof colors)[number]) {
    selectedColor.value = color
  }

  /** Paint a cell and its left/right mirror twin (bilateral symmetry). */
  function paintCell(row: number, col: number) {
    const mirrorCol = GRID_SIZE - 1 - col
    const next = cells.value.map((r) => [...r])
    next[row]![col] = selectedColor.value
    next[row]![mirrorCol] = selectedColor.value
    cells.value = next
  }

  function clearCanvas() {
    cells.value = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => EMPTY),
    )
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
  <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
    <!-- Badge -->
    <div
      class="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-lg font-semibold tracking-wide text-violet-900 uppercase"
    >
      <UIcon name="i-heroicons-sparkles" class="h-5 w-5" aria-hidden="true" />
      Try it now — interactive
    </div>

    <p class="mt-4 text-lg text-slate-600">
      Tap or drag across the canvas to color. Each stroke is mirrored — a quiet, low-pressure way
      to focus the mind.
    </p>

    <!-- Palette + Clear -->
    <div class="mt-6 flex flex-wrap items-center gap-4">
      <div class="flex flex-wrap items-center gap-3" role="listbox" aria-label="Color palette">
        <button
          v-for="color in colors"
          :key="color"
          type="button"
          role="option"
          :aria-selected="selectedColor === color"
          :aria-label="`Select color ${color}`"
          class="h-12 w-12 rounded-full border-4 transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-violet-300 focus-visible:outline-none sm:h-14 sm:w-14"
          :class="selectedColor === color ? 'scale-110 border-violet-900' : 'border-transparent'"
          :style="{ backgroundColor: color }"
          @click="selectColor(color)"
        />
      </div>

      <button
        type="button"
        class="ml-auto flex items-center gap-2 rounded-xl bg-[#f3eee8] px-5 py-3 text-lg font-medium text-slate-800 hover:bg-[#ebe4dc] focus-visible:ring-4 focus-visible:ring-violet-300 focus-visible:outline-none"
        @click="clearCanvas"
      >
        <UIcon name="i-heroicons-backspace" class="h-6 w-6" aria-hidden="true" />
        Clear
      </button>
    </div>

    <!-- 9×9 mirrored coloring grid -->
    <div
      class="mt-6 touch-none select-none overflow-hidden rounded-xl border border-slate-200 bg-white"
      @pointerup="stopPainting"
      @pointerleave="stopPainting"
      @pointercancel="stopPainting"
    >
      <div
        class="grid aspect-square w-full grid-cols-9"
        role="grid"
        aria-label="Mirrored coloring canvas, nine by nine"
      >
        <template v-for="(row, rowIndex) in cells" :key="rowIndex">
          <button
            v-for="(cellColor, colIndex) in row"
            :key="`${rowIndex}-${colIndex}`"
            type="button"
            role="gridcell"
            class="aspect-square border border-slate-200 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:outline-none"
            :style="{ backgroundColor: cellColor || '#ffffff' }"
            :aria-label="`Row ${rowIndex + 1}, column ${colIndex + 1}`"
            @pointerdown.prevent="onCellPointerDown(rowIndex, colIndex)"
            @pointerenter="onCellPointerEnter(rowIndex, colIndex)"
          />
        </template>
      </div>
    </div>
  </div>
</template>

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
  const selectedColor = ref<string>(colors[0])

  // 9×9 grid of fill colors. '' = uncolored. ≈ useState 2D array
  const cells = ref<string[][]>(
    Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => EMPTY)),
  )

  // True while pointer is held down — enables drag-to-paint
  const isPainting = ref(false)

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
  <ActivityCard
    instructions="Tap or drag across the canvas to color. Each stroke is mirrored — a quiet, low-pressure way to focus the mind."
    @clear="clearCanvas"
  >
    <template #palette>
      <ColorPalette v-model="selectedColor" :colors="colors" />
    </template>

    <!-- 9×9 mirrored coloring grid -->
    <div
      class="mt-6 touch-none select-none overflow-hidden rounded-2xl border border-[var(--bn-border)] bg-white"
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
            class="aspect-square border border-slate-200 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[var(--bn-navy)] focus-visible:outline-none"
            :style="{ backgroundColor: cellColor || '#ffffff' }"
            :aria-label="`Row ${rowIndex + 1}, column ${colIndex + 1}`"
            @pointerdown.prevent="onCellPointerDown(rowIndex, colIndex)"
            @pointerenter="onCellPointerEnter(rowIndex, colIndex)"
          />
        </template>
      </div>
    </div>
  </ActivityCard>
</template>

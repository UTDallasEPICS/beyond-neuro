<script setup lang="ts">
  import { coloringLevels } from '~/data/coloringLevels'

  // Level 1 is the default, but the user can switch to any level at any time.
  const levelIndex = ref(0)
  const level = computed(() => coloringLevels[levelIndex.value]!)

  const artRef = ref<HTMLDivElement | null>(null)
  const svgMarkup = ref('')
  const loading = ref(true)
  const loadError = ref(false)

  const selected = ref(1)
  const showHints = true
  const fills = ref<(number | null)[]>([]) // color number placed in each space
  const targets = ref<number[]>([]) // number printed in each space (0 = free choice)
  const undoStack = ref<{ idx: number; prev: number | null }[]>([])
  const message = ref('')
  const confirmingClear = ref(false)

  let shapes: SVGGeometryElement[] = []
  let labels: { el: SVGTextElement; idx: number }[] = []

  const total = computed(() => targets.value.filter(Boolean).length)
  const done = computed(() => targets.value.filter((t, i) => t && fills.value[i] === t).length)
  const isComplete = computed(() => total.value > 0 && done.value === total.value)

  const colorOf = (n: number | null | undefined) =>
    n ? level.value.colors.find((c) => c.n === n) : undefined

  async function loadLevel() {
    loading.value = true
    loadError.value = false
    message.value = ''
    confirmingClear.value = false
    try {
      svgMarkup.value = await $fetch<string>(level.value.file, { responseType: 'text' })
      await nextTick()
      setupSvg()
    } catch {
      loadError.value = true
    } finally {
      loading.value = false
    }
  }
  // Matching number to shape
  function shapeContains(shape: SVGGeometryElement, label: SVGTextElement, x: number, y: number) {
    const from = label.getCTM()
    const to = shape.getCTM()
    if (!from || !to) return false // if cant render
    const p = new DOMPoint(x, y).matrixTransform(from).matrixTransform(to.inverse())
    if (typeof shape.isPointInFill === 'function') return shape.isPointInFill(p)
    const b = shape.getBBox()
    return p.x >= b.x && p.x <= b.x + b.width && p.y >= b.y && p.y <= b.y + b.height
  }

  function setupSvg() {
    const svg = artRef.value?.querySelector('svg')
    const art = svg?.querySelector('g[clip-path]')
    if (!svg || !art) {
      loadError.value = true
      return
    }

    svg.setAttribute('viewBox', '66 108 684 696')
    svg.removeAttribute('width')
    svg.removeAttribute('height')
    svg.setAttribute('role', 'group')
    svg.setAttribute('aria-label', `${level.value.title} paint-by-number picture`)

    shapes = Array.from(
      art.querySelectorAll<SVGGeometryElement>('rect, circle, ellipse, path, polygon')
    ).filter((el) => el.getAttribute('fill') !== 'none')

    const tgt = new Array<number>(shapes.length).fill(0)
    labels = []

    svg.querySelectorAll<SVGTextElement>('text').forEach((t) => {
      const x = Number(t.getAttribute('x'))
      const y = Number(t.getAttribute('y'))
      const n = Number(t.textContent?.trim())
      if (!Number.isInteger(n) || n < 1 || y < 112 || y > 800) return // skip title, key, footer
      t.setAttribute('aria-hidden', 'true')
      // loop goes through every number in the SVG and finds the shape it belongs to.
      for (let i = shapes.length - 1; i >= 0; i--) {
        if (shapeContains(shapes[i]!, t, x, y)) {
          if (!tgt[i]) tgt[i] = n
          labels.push({ el: t, idx: i })
          break
        }
      }
    })

    shapes.forEach((el, i) => {
      el.classList.add('pbn-space')
      el.setAttribute('data-idx', String(i))
      el.setAttribute('tabindex', '0')
      el.setAttribute('role', 'button')
    })

    targets.value = tgt
    undoStack.value = []
    fills.value = new Array(shapes.length).fill(null)
    paint()
  }

  // drawing state onto the SVG

  function paint() {
    shapes.forEach((el, i) => {
      const f = fills.value[i] ?? null
      const t = targets.value[i] ?? 0
      el.style.fill = colorOf(f)?.hex ?? ''
      el.classList.toggle('pbn-hint', showHints && !f && t === selected.value)
      const want = t ? `number ${t}, ${colorOf(t)?.name}` : 'any color you like'
      el.setAttribute(
        'aria-label',
        `Shape for ${want}. ${f ? `Colored ${colorOf(f)?.name}.` : 'Not colored yet.'}`
      )
    })
    // Hide a number once its space has the matching color
    labels.forEach(({ el, idx }) => {
      const f = fills.value[idx]
      el.style.opacity = f && f === targets.value[idx] ? '0' : ''
    })
  }
  watch([fills, selected, showHints], paint, { deep: true })

  // Interaction

  const cheers = ['Nice!', 'Lovely color!', 'Great job!', 'Beautiful!']

  function colorSpace(i: number) {
    const prev = fills.value[i] ?? null
    if (prev === selected.value) return
    undoStack.value.push({ idx: i, prev })
    fills.value[i] = selected.value
    confirmingClear.value = false

    const t = targets.value[i]
    if (isComplete.value) {
      message.value = 'All done — beautiful work. Take a moment to enjoy it.'
    } else if (!t || t === selected.value) {
      message.value = `${cheers[done.value % cheers.length]} ${done.value} of ${total.value} shapes colored.`
    } else {
      message.value = `This shape shows number ${t} (${colorOf(t)?.name}). You can change it any time.`
    }
  }

  function spaceFrom(e: Event) {
    const el = (e.target as Element | null)?.closest?.('.pbn-space')
    return el ? Number(el.getAttribute('data-idx')) : -1
  }

  function onArtClick(e: MouseEvent) {
    const i = spaceFrom(e)
    if (i >= 0) colorSpace(i)
  }

  function onArtKeydown(e: KeyboardEvent) {
    if (e.key !== 'Enter' && e.key !== ' ') return
    const i = spaceFrom(e)
    if (i < 0) return
    e.preventDefault()
    colorSpace(i)
  }

  function undo() {
    const last = undoStack.value.pop()
    if (!last) return
    fills.value[last.idx] = last.prev
    message.value = 'Undone.'
  }

  function clearPicture() {
    fills.value = new Array(shapes.length).fill(null)
    undoStack.value = []
    confirmingClear.value = false
    message.value = 'Fresh page. Ready when you are.'
  }

  function chooseLevel(index: number) {
    if (index === levelIndex.value) return
    levelIndex.value = index
  }

  watch(levelIndex, () => {
    selected.value = 1
    loadLevel()
  })

  onMounted(loadLevel)

  const btn =
    'inline-flex min-h-[56px] items-center justify-center rounded-2xl border-2 border-slate-400 bg-white px-5 py-3 text-lg font-semibold text-[var(--bn-navy)] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none'
</script>

<template>
  <div>
    <h2 class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">Choose a level</h2>
    <p class="mt-1 text-lg text-[var(--bn-muted)]">
      Level 1 has big shapes and few colors. You can change this any time.
    </p>
    <div
      class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4"
      role="group"
      aria-label="Difficulty level"
    >
      <button
        v-for="(option, index) in coloringLevels"
        :key="option.level"
        type="button"
        class="flex min-h-[72px] flex-col items-start justify-start rounded-2xl border-2 p-4 text-left transition-colors focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
        :class="
          index === levelIndex
            ? 'border-orange-700 bg-[var(--bn-peach)]'
            : 'border-slate-300 bg-white hover:bg-slate-50'
        "
        :aria-pressed="index === levelIndex"
        @click="chooseLevel(index)"
      >
        <span class="block text-lg font-bold text-[var(--bn-navy)]">Level {{ option.level }}</span>
        <span class="block text-lg text-[var(--bn-muted)]">{{ option.title }}</span>
        <span class="mt-1 block text-base text-[var(--bn-muted)]">
          {{ option.colors.length }} colors
        </span>
      </button>
    </div>

    <ActivityCard
      class="mt-6"
      instructions="Pick a numbered color, then tap the shapes with the same number. Take as long as you like."
      @clear="confirmingClear = true"
    >
      <template #palette>
        <div class="flex flex-wrap gap-3" role="group" aria-label="Color palette">
          <button
            v-for="c in level.colors"
            :key="c.n"
            type="button"
            class="flex min-h-[72px] min-w-[84px] flex-col items-center gap-1 rounded-2xl border-2 bg-white px-2 py-2 focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:outline-none"
            :class="c.n === selected ? 'border-4 border-[var(--bn-navy)]' : 'border-transparent'"
            :aria-pressed="c.n === selected"
            :aria-label="`Color number ${c.n}, ${c.name}`"
            @click="selected = c.n"
          >
            <span
              class="flex h-12 w-12 items-center justify-center rounded-full border-2 border-black sm:h-14 sm:w-14"
              :style="{ backgroundColor: c.hex }"
            >
              <span
                class="flex h-7 w-7 items-center justify-center rounded-full bg-white text-base font-bold text-black"
              >
                {{ c.n }}
              </span>
            </span>
            <span class="text-base font-semibold text-[var(--bn-navy)]">{{ c.name }}</span>
          </button>
        </div>
      </template>

      <div
        v-if="confirmingClear"
        class="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 text-lg font-semibold text-[var(--bn-navy)]"
        role="group"
        aria-label="Confirm clear"
      >
        Clear all colors on this picture?
        <button type="button" :class="btn" @click="clearPicture">Yes, clear</button>
        <button type="button" :class="btn" @click="confirmingClear = false">Keep coloring</button>
      </div>

      <p class="mt-6 text-lg text-[var(--bn-navy)]">
        <span class="font-bold">Level {{ level.level }} · {{ level.title }}</span>
        — pairs with {{ level.pairsWith }}
      </p>

      <div
        class="relative mt-4 overflow-hidden rounded-2xl border border-[var(--bn-border)] bg-white p-2"
      >
        <!-- eslint-disable vue/no-v-html -- static SVGs shipped in /public -->
        <div
          ref="artRef"
          class="pbn-art mx-auto w-full max-w-xl select-none"
          :class="{ 'opacity-40': loading }"
          @click="onArtClick"
          @keydown="onArtKeydown"
          v-html="svgMarkup"
        />
        <!-- eslint-enable vue/no-v-html -->
        <p
          v-if="loading"
          class="absolute inset-0 flex items-center justify-center text-lg font-semibold text-[var(--bn-navy)]"
        >
          Loading picture…
        </p>
        <p
          v-else-if="loadError"
          class="absolute inset-0 flex flex-wrap items-center justify-center gap-3 text-lg font-semibold text-[var(--bn-navy)]"
        >
          This picture didn't load.
          <button type="button" :class="btn" @click="loadLevel">Try again</button>
        </p>
      </div>

      <p class="mt-4 text-lg font-semibold text-[var(--bn-navy)]" aria-live="polite">
        {{ message || `${done} of ${total} shapes colored` }}
      </p>

      <div class="mt-4 flex flex-wrap gap-3">
        <button type="button" :class="btn" :disabled="!undoStack.length" @click="undo">Undo</button>
        <a :class="btn" :href="level.file" :download="`BeyondNeuro-Level-${level.level}.svg`">
          Download printable page to color!
        </a>
        <button
          v-if="isComplete && levelIndex < coloringLevels.length - 1"
          type="button"
          :class="btn"
          @click="chooseLevel(levelIndex + 1)"
        >
          Want a little more? Try Level {{ level.level + 1 }}
        </button>
      </div>
    </ActivityCard>
  </div>
</template>

<style scoped>
  .pbn-art :deep(svg) {
    display: block;
    width: 100%;
    height: auto;
  }
  .pbn-art :deep(text) {
    pointer-events: none;
    user-select: none;
  }
  .pbn-art :deep(.pbn-space) {
    cursor: pointer;
  }
  .pbn-art :deep(.pbn-space:focus) {
    outline: none;
  }
  .pbn-art :deep(.pbn-space:focus-visible) {
    stroke: #c2410c !important;
    stroke-width: 7px;
  }
  .pbn-art :deep(.pbn-hint) {
    fill: #ffe3c7;
  }
</style>

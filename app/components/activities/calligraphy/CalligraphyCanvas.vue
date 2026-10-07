<script setup lang="ts">
  const letters = ['A', 'B', 'C', 'D', 'E'] as const
  const words = ['LOVE', 'HOPE', 'HOME'] as const

  const mode = ref<'letters' | 'words'>('letters')
  const selectedLetter = ref<string>('A')
  const selectedWord = ref<string>('LOVE')

  const canvas = ref<HTMLCanvasElement | null>(null)
  const isDrawing = ref(false)

  const guideText = computed(() =>
    mode.value === 'letters' ? selectedLetter.value : selectedWord.value,
  )

  function getContext() {
    return canvas.value?.getContext('2d') ?? null
  }

  function resizeCanvas() {
    const el = canvas.value
    if (!el) return

    const rect = el.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    el.width = Math.round(rect.width * dpr)
    el.height = Math.round(rect.height * dpr)

    const ctx = getContext()
    if (!ctx) return

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#111827'
    ctx.lineWidth = 9
  }

  function getPointerPosition(event: PointerEvent) {
    const el = canvas.value
    if (!el) return null

    const rect = el.getBoundingClientRect()

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  function startDrawing(event: PointerEvent) {
    const el = canvas.value
    const ctx = getContext()
    const position = getPointerPosition(event)

    if (!el || !ctx || !position) return

    isDrawing.value = true
    el.setPointerCapture(event.pointerId)

    ctx.beginPath()
    ctx.moveTo(position.x, position.y)
  }

  function draw(event: PointerEvent) {
    if (!isDrawing.value) return

    const ctx = getContext()
    const position = getPointerPosition(event)

    if (!ctx || !position) return

    ctx.lineTo(position.x, position.y)
    ctx.stroke()
  }

  function stopDrawing(event?: PointerEvent) {
    const el = canvas.value

    if (event && el?.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId)
    }

    isDrawing.value = false
    getContext()?.closePath()
  }

  function clearCanvas() {
    const el = canvas.value
    const ctx = getContext()

    if (!el || !ctx) return

    const rect = el.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)
  }

  function selectLetter(letter: string) {
    selectedLetter.value = letter
    clearCanvas()
  }

  function selectWord(word: string) {
    selectedWord.value = word
    clearCanvas()
  }

  function selectMode(newMode: 'letters' | 'words') {
    mode.value = newMode
    clearCanvas()
  }

  onMounted(() => {
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeCanvas)
  })
</script>

<template>
  <ActivityCard
    instructions="Trace the guide slowly with your finger or mouse. Take your time and practice at your own pace."
    @clear="clearCanvas"
  >
    <template #palette>
      <div class="w-full">
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-lg font-semibold text-[var(--bn-navy)]">
            Practice:
          </span>

          <button
            type="button"
            class="min-h-[56px] rounded-full border-2 px-5 py-3 text-lg font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
            :class="
              mode === 'letters'
                ? 'border-[var(--bn-navy)] bg-[var(--bn-navy)] text-white'
                : 'border-[var(--bn-border)] bg-white text-[var(--bn-navy)]'
            "
            :aria-pressed="mode === 'letters'"
            @click="selectMode('letters')"
          >
            Letters
          </button>

          <button
            type="button"
            class="min-h-[56px] rounded-full border-2 px-5 py-3 text-lg font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
            :class="
              mode === 'words'
                ? 'border-[var(--bn-navy)] bg-[var(--bn-navy)] text-white'
                : 'border-[var(--bn-border)] bg-white text-[var(--bn-navy)]'
            "
            :aria-pressed="mode === 'words'"
            @click="selectMode('words')"
          >
            Words
          </button>
        </div>

        <div
          v-if="mode === 'letters'"
          class="mt-4 flex flex-wrap items-center gap-3"
        >
          <span class="text-lg font-semibold text-[var(--bn-navy)]">
            Letter:
          </span>

          <button
            v-for="letter in letters"
            :key="letter"
            type="button"
            class="flex min-h-[56px] min-w-[56px] items-center justify-center rounded-full border-2 text-xl font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
            :class="
              selectedLetter === letter
                ? 'border-[var(--bn-navy)] bg-[var(--bn-navy)] text-white'
                : 'border-[var(--bn-border)] bg-white text-[var(--bn-navy)] hover:border-orange-700'
            "
            :aria-pressed="selectedLetter === letter"
            @click="selectLetter(letter)"
          >
            {{ letter }}
          </button>
        </div>

        <div
          v-else
          class="mt-4 flex flex-wrap items-center gap-3"
        >
          <span class="text-lg font-semibold text-[var(--bn-navy)]">
            Word:
          </span>

          <button
            v-for="word in words"
            :key="word"
            type="button"
            class="min-h-[56px] rounded-full border-2 px-5 py-3 text-lg font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
            :class="
              selectedWord === word
                ? 'border-[var(--bn-navy)] bg-[var(--bn-navy)] text-white'
                : 'border-[var(--bn-border)] bg-white text-[var(--bn-navy)] hover:border-orange-700'
            "
            :aria-pressed="selectedWord === word"
            @click="selectWord(word)"
          >
            {{ word }}
          </button>
        </div>
      </div>
    </template>

    <div
      class="relative mt-6 h-[420px] touch-none overflow-hidden rounded-2xl border border-[var(--bn-border)] bg-white sm:h-[500px]"
    >
      <!-- Pale tracing guide -->
      <div
        class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden px-4 text-center font-serif font-bold text-slate-200 select-none"
        :class="
          mode === 'letters'
            ? 'text-[230px] sm:text-[300px]'
            : 'text-[72px] sm:text-[110px]'
        "
        aria-hidden="true"
      >
        {{ guideText }}
      </div>

      <!-- Drawing surface -->
      <canvas
        ref="canvas"
        class="absolute inset-0 h-full w-full cursor-crosshair touch-none"
        role="img"
        :aria-label="`Tracing canvas for ${guideText}`"
        @pointerdown.prevent="startDrawing"
        @pointermove.prevent="draw"
        @pointerup.prevent="stopDrawing"
        @pointercancel.prevent="stopDrawing"
      />
    </div>

    <p class="mt-4 text-lg text-[var(--bn-muted)]" aria-live="polite">
      Trace {{ guideText }} as many times as you like. Clear the canvas whenever you want to start again.
    </p>
  </ActivityCard>
</template>
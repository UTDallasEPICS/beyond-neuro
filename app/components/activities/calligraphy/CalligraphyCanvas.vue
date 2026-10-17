
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type Level = 1 | 2 | 3 | 4 | 5 | 6 | 7
const guideFontSize = computed(() => {
  const length = guideText.value.length

  if (length <= 1) return 'clamp(180px, 30vw, 300px)'
  if (length <= 3) return 'clamp(85px, 16vw, 180px)'
  if (length <= 5) return 'clamp(65px, 13vw, 145px)'
  if (length <= 7) return 'clamp(55px, 11vw, 120px)'
  if (length <= 10) return 'clamp(42px, 9vw, 95px)'

  return 'clamp(24px, 5vw, 55px)'
})
const levels: { level: Level; label: string; items: string[] }[] = [
  {
    level: 1,
    label: 'Straight uppercase letters',
    items: ['I', 'L', 'T', 'H', 'E'],
  },
  {
    level: 2,
    label: 'Curved uppercase letters',
    items: ['C', 'O', 'S', 'U', 'G'],
  },
  {
    level: 3,
    label: 'Lowercase letters',
    items: ['a', 'b', 'd', 'e', 'g'],
  },
  {
    level: 4,
    label: 'Short words',
    items: ['CAT', 'DOG', 'SUN', 'PEN', 'BOOK'],
  },
  {
    level: 5,
    label: 'Everyday words',
    items: ['LOVE', 'HOPE', 'HOME', 'SMILE', 'HAPPY'],
  },
  {
    level: 6,
    label: 'Longer words',
    items: ['FAMILY', 'FRIEND', 'GARDEN', 'MORNING', 'FLOWER'],
  },
  {
    level: 7,
    label: 'Short sentences',
    items: [
      'I LOVE YOU',
      'I AM HAPPY',
      'LOVELY DAY',
      'THANK YOU',
      'GOOD JOB',
    ],
  },
]

const selectedLevel = ref<Level>(1)
const selectedItem = ref(0)

const currentLevel = computed(
  () => levels.find((level) => level.level === selectedLevel.value)!,
)

const guideText = computed(
  () => currentLevel.value.items[selectedItem.value] ?? '',
)

const canvas = ref<HTMLCanvasElement | null>(null)
const isDrawing = ref(false)

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

function selectLevel(level: Level) {
  selectedLevel.value = level
  selectedItem.value = 0
  clearCanvas()
}

function selectItem(index: number) {
  selectedItem.value = index
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
        <!-- Level selection -->
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-lg font-semibold text-[var(--bn-navy)]">
            Level:
          </span>

          <button
            v-for="level in levels"
            :key="level.level"
            type="button"
            class="min-h-[56px] rounded-full border-2 px-5 py-3 text-lg font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
            :class="
              selectedLevel === level.level
                ? 'border-[var(--bn-navy)] bg-[var(--bn-navy)] text-white'
                : 'border-[var(--bn-border)] bg-white text-[var(--bn-navy)] hover:border-orange-700'
            "
            :aria-pressed="selectedLevel === level.level"
            @click="selectLevel(level.level)"
          >
            Level {{ level.level }}
          </button>
        </div>

        <!-- Level description -->
        <p class="mt-4 text-base text-[var(--bn-muted)]">
          {{ currentLevel.label }}
        </p>

        <!-- Letter, word, or sentence selection -->
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <span class="text-lg font-semibold text-[var(--bn-navy)]">
            Practice:
          </span>

          <button
            v-for="(item, index) in currentLevel.items"
            :key="`${selectedLevel}-${index}`"
            type="button"
            class="min-h-[48px] rounded-full border-2 px-4 py-2 text-base font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
            :class="
              selectedItem === index
                ? 'border-[var(--bn-navy)] bg-[var(--bn-navy)] text-white'
                : 'border-[var(--bn-border)] bg-white text-[var(--bn-navy)] hover:border-orange-700'
            "
            :aria-pressed="selectedItem === index"
            @click="selectItem(index)"
          >
            {{ item }}
          </button>
        </div>
      </div>
    </template>

    <!-- Tracing canvas -->
    <div
      class="relative mt-6 h-[420px] touch-none overflow-hidden rounded-2xl border border-[var(--bn-border)] bg-white sm:h-[500px]"
    >
      <!-- Pale tracing guide -->
      <div
        class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden px-4 text-center font-serif font-bold text-slate-200 select-none"
        :style="{ fontSize: guideFontSize }"
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
      Trace {{ guideText }} as many times as you like.
      Clear the canvas whenever you want to start again.
    </p>
  </ActivityCard>
</template>

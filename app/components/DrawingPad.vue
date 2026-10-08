<script setup lang="ts">
  //the day this pad belongs to, like "Saturday, October 3"
  //the page passes it in - we use it for screen readers and the erase question
  const props = defineProps<{ label: string }>()

  //vue puts the real <canvas> element in here once it is on the screen
  const canvas = ref<HTMLCanvasElement | null>(null)

  //true while a finger, pen, or mouse button is pressed down
  const isDrawing = ref(false)

  //the canvas "paintbrush" - we get it once the canvas is on the screen
  let pen: CanvasRenderingContext2D | null = null

  //where the last bit of line ended, so the next bit can connect to it
  let lastPoint = { x: 0, y: 0 }

  onMounted(() => {
    const el = canvas.value
    if (!el) return

    //make the drawing surface the same size as the box on screen
    //devicePixelRatio keeps lines sharp on high-resolution screens like ipads
    const rect = el.getBoundingClientRect()
    const ratio = window.devicePixelRatio || 1
    el.width = rect.width * ratio
    el.height = rect.height * ratio

    pen = el.getContext('2d')
    if (!pen) return

    //a thick, rounded navy marker - easy to see and easy to read
    pen.lineWidth = 4 * ratio
    pen.lineCap = 'round'
    pen.lineJoin = 'round'
    pen.strokeStyle = '#27265f'
  })

  //turns where the finger or mouse is on the screen into a spot on the canvas
  function getPoint(event: PointerEvent) {
    const el = canvas.value!
    const rect = el.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left) * (el.width / rect.width),
      y: (event.clientY - rect.top) * (el.height / rect.height),
    }
  }

  //finger, pen, or mouse goes down - start a new line
  function startDrawing(event: PointerEvent) {
    if (!pen || !canvas.value) return
    isDrawing.value = true

    //keep following this finger even if it slides outside the box for a moment
    canvas.value.setPointerCapture(event.pointerId)

    lastPoint = getPoint(event)

    //a tiny line in one spot, so a single tap leaves a dot
    pen.beginPath()
    pen.moveTo(lastPoint.x, lastPoint.y)
    pen.lineTo(lastPoint.x, lastPoint.y)
    pen.stroke()
  }

  //finger, pen, or mouse moves - draw a short line from the last spot to the new one
  function keepDrawing(event: PointerEvent) {
    if (!isDrawing.value || !pen) return
    const point = getPoint(event)

    pen.beginPath()
    pen.moveTo(lastPoint.x, lastPoint.y)
    pen.lineTo(point.x, point.y)
    pen.stroke()

    lastPoint = point
  }

  //finger, pen, or mouse lifts up - stop drawing
  function stopDrawing() {
    isDrawing.value = false
  }

  //wipes this day clean - but asks first (rule 23)
  function erase() {
    if (!pen || !canvas.value) return
    if (!window.confirm(`Erase everything written on ${props.label}?`)) return
    pen.clearRect(0, 0, canvas.value.width, canvas.value.height)
  }
</script>

<template>
  <div class="flex flex-col gap-3 px-3 py-2 sm:flex-row sm:items-center">
    <!-- phones (flex-col): the writing strip on top, the erase button underneath,
         so the strip can use the full width of the screen
         bigger screens (sm:flex-row): the writing strip on the left, the erase button on the right -->

    <!-- w-full: full width on phones. sm:w-auto sm:flex-1: stretch to fill the row on bigger screens
         h-40 = 160px tall
         touch-none: the page does not scroll while someone writes with a finger
         notebook-lines: faint lines from the small <style> section below -->
    <canvas
      ref="canvas"
      class="notebook-lines block h-40 w-full min-w-0 cursor-crosshair touch-none bg-white sm:w-auto sm:flex-1"
      role="img"
      :aria-label="`Handwriting area for ${label}`"
      @pointerdown="startDrawing"
      @pointermove="keepDrawing"
      @pointerup="stopDrawing"
      @pointercancel="stopDrawing"
    ></canvas>

    <!-- min-h-24 / min-w-24 = 96px, about 72pt (rule 9). shrink-0 stops it from getting squished
         self-center: centered under the strip on phones
         the aria-label tells screen readers which day this button erases (WCAG 2.4.6)
         it starts with "Erase" so it matches the word people see on the button (WCAG 2.5.3) -->
    <button
      class="min-h-24 min-w-24 shrink-0 cursor-pointer self-center rounded-full border-2 border-[#27265f] bg-white px-4 text-2xl text-[#27265f] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#27265f]"
      :aria-label="`Erase ${label}`"
      @click="erase"
    >
      Erase
    </button>
  </div>
</template>

<style scoped>
  /* the faint notebook lines are a repeating pattern - too long and fiddly to write as a
   tailwind class, so this one stays as normal css (a 2px line every 54px).
   it is only a background, so erase never removes it and it is not part of the drawing */
  .notebook-lines {
    background-image: repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent 52px,
      #e6e0d6 52px,
      #e6e0d6 54px
    );
  }
</style>

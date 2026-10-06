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
  <div class="drawing-pad">
    <canvas
      ref="canvas"
      class="drawing-surface"
      role="img"
      :aria-label="`Handwriting area for ${label}`"
      @pointerdown="startDrawing"
      @pointermove="keepDrawing"
      @pointerup="stopDrawing"
      @pointercancel="stopDrawing"
    ></canvas>

    <!-- the aria-label tells screen readers which day this button erases (WCAG 2.4.6)
         it starts with "Erase" so it matches the word people see on the button (WCAG 2.5.3) -->
    <button class="erase-button" :aria-label="`Erase ${label}`" @click="erase">Erase</button>
  </div>
</template>

<style scoped>
  /* the writing strip on the left, the erase button on the right */
  .drawing-pad {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
  }

  /* flex: 1 makes the writing strip stretch across all the space it can get
   touch-action: none stops the page from scrolling while someone writes with a finger
   the repeating gradient draws faint notebook lines to help people write in a straight line -
   it is only a background, so it is not part of the drawing itself */
  .drawing-surface {
    display: block;
    flex: 1;
    min-width: 0;
    height: 160px;
    touch-action: none;
    cursor: crosshair;
    background-color: var(--contrast);
    background-image: repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent 52px,
      var(--card-border) 52px,
      var(--card-border) 54px
    );
  }

  /* 96px is about 72pt - the client's minimum button size (rule 9)
   flex-shrink: 0 stops the button from getting squished on small screens */
  .erase-button {
    flex-shrink: 0;
    min-width: 96px;
    min-height: 96px;
    padding: 0 16px;
    font-size: 24px;
    color: var(--theme);
    background-color: var(--contrast);
    border: 2px solid var(--theme);
    border-radius: 999px;
    cursor: pointer;
  }
  .erase-button:focus-visible {
    outline: 4px solid var(--theme);
    outline-offset: 4px;
  }
</style>

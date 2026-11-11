<script setup lang="ts">
  // Tree trimming (Horticultural Therapy): trim the leafy crown to match a shape, level by level,
  // or trim it freely into anything you like.
  import { TRIM_LEVELS, type ClipperSize } from '~/data/horticulture/treeTrimmingLevels'

  type Tool = 'trim' | 'regrow'
  type Mode = 'levels' | 'free'

  interface Pt {
    x: number
    y: number
  }

  interface Stroke {
    tool: Tool
    radius: number
    points: Pt[]
  }

  interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    rot: number
    vr: number
    life: number
    color: string
  }

  // Drawing size in canvas units; the canvas scales to fit its container.
  const W = 600
  const H = 540
  const GROUND_Y = 470

  // The leafy crown is the union of these circles.
  const CANOPY = [
    { x: 300, y: 210, r: 165 },
    { x: 180, y: 255, r: 100 },
    { x: 420, y: 255, r: 100 },
    { x: 235, y: 140, r: 95 },
    { x: 365, y: 140, r: 95 },
    { x: 300, y: 110, r: 80 },
  ]

  // Branches hidden inside the crown, revealed as leaves are trimmed: start, control, end, width.
  const BRANCHES: [number, number, number, number, number, number, number][] = [
    [300, 330, 250, 280, 160, 250, 14],
    [300, 320, 270, 220, 220, 140, 13],
    [300, 310, 300, 200, 300, 110, 13],
    [300, 320, 330, 220, 380, 140, 13],
    [300, 330, 350, 280, 440, 250, 14],
    [296, 360, 240, 330, 190, 320, 9],
    [304, 360, 360, 330, 410, 320, 9],
  ]

  // Light from the top left: lighter greens first.
  const LEAF_SHADES = ['#7ab45e', '#62a052', '#4f8a45', '#3f7a3f', '#33652f']
  const BARK = '#7a5a3f'
  const BRANCH = '#6b4f3a'

  const SIZES: { id: ClipperSize; label: string; radius: number }[] = [
    { id: 'small', label: 'Small', radius: 10 },
    { id: 'medium', label: 'Medium', radius: 20 },
    { id: 'large', label: 'Large', radius: 34 },
  ]

  const KEY_STEP = 12
  const KEY_STEP_FAST = 36
  const MAX_PARTICLES = 140
  const REGROW_OVERLAP = 2
  // Scoring samples the leaves on a coarse grid (in drawing units) so it stays quick on phones.
  const SAMPLE_STEP = 6
  const LEAF_ALPHA = 40
  const HINT_MS = 2500
  const TINT = 'rgba(233, 150, 52, 0.6)'

  const canvas = ref<HTMLCanvasElement | null>(null)
  const tool = ref<Tool>('trim')
  const sizeId = ref<ClipperSize>('medium')
  const radius = computed(() => SIZES.find((s) => s.id === sizeId.value)!.radius)
  const strokeCount = ref(0)
  const message = ref('')

  const mode = ref<Mode>('levels')
  const levelIndex = ref(0)
  const level = computed(() => TRIM_LEVELS[levelIndex.value] ?? TRIM_LEVELS[0]!)
  const isLastLevel = computed(() => levelIndex.value >= TRIM_LEVELS.length - 1)
  // Share of the leaves outside the outline trimmed away, and share of the leaves inside it kept.
  const tidied = ref(0)
  const kept = ref(1)
  const levelComplete = ref(false)
  const hinting = ref(false)
  const tidiedPct = computed(() => Math.round(tidied.value * 100))
  const keptPct = computed(() => Math.round(kept.value * 100))
  const stars = computed(() => (kept.value >= 0.9 ? 3 : kept.value >= 0.75 ? 2 : 1))

  let view: CanvasRenderingContext2D | null = null
  let base: HTMLCanvasElement | null = null
  let full: HTMLCanvasElement | null = null
  let foliage: HTMLCanvasElement | null = null
  let outline: HTMLCanvasElement | null = null
  let tintLayer: HTMLCanvasElement | null = null
  let shapePaths: Path2D[] = []
  // Per grid sample: 1 = leaf inside the shape, 2 = leaf outside it, 0 = ignored (no leaf, or near the edge).
  let sampleClass = new Uint8Array(0)
  let sampleOffset = new Uint32Array(0)
  let insideTotal = 0
  let outsideTotal = 0
  let hintTimer: ReturnType<typeof setTimeout> | undefined
  let dpr = 1
  let strokes: Stroke[] = []
  let active: Stroke | null = null
  let cursor: Pt | null = null
  let particles: Particle[] = []
  let rafId = 0
  let reducedMotion = false

  const rand = (min: number, max: number) => min + Math.random() * (max - min)

  function makeLayer(readBack = false) {
    const layer = document.createElement('canvas')
    layer.width = W * dpr
    layer.height = H * dpr
    layer.getContext('2d', { willReadFrequently: readBack })!.setTransform(dpr, 0, 0, dpr, 0, 0)
    return layer
  }

  function ctxOf(layer: HTMLCanvasElement) {
    return layer.getContext('2d')!
  }

  function inCanopy(x: number, y: number) {
    return CANOPY.some((c) => (x - c.x) ** 2 + (y - c.y) ** 2 <= c.r * c.r)
  }

  function shadeAt(x: number, y: number, shift = 0) {
    const t = ((x - 80) / 440) * 0.4 + ((y - 15) / 360) * 0.6 + shift
    const i = Math.round(Math.min(1, Math.max(0, t)) * (LEAF_SHADES.length - 1))
    return LEAF_SHADES[i]!
  }

  function canopyPoint(): Pt {
    for (;;) {
      const p = { x: rand(70, 530), y: rand(10, 380) }
      if (inCanopy(p.x, p.y)) return p
    }
  }

  // ---- Drawing ----

  function drawBase() {
    const c = ctxOf(base!)
    c.clearRect(0, 0, W, H)

    const sky = c.createLinearGradient(0, 0, 0, GROUND_Y)
    sky.addColorStop(0, '#cfe9f7')
    sky.addColorStop(1, '#eef8fc')
    c.fillStyle = sky
    c.fillRect(0, 0, W, GROUND_Y)

    c.fillStyle = '#b8dca0'
    c.beginPath()
    c.moveTo(0, 430)
    c.quadraticCurveTo(150, 385, 300, 420)
    c.quadraticCurveTo(450, 455, 600, 405)
    c.lineTo(600, GROUND_Y)
    c.lineTo(0, GROUND_Y)
    c.fill()

    const grass = c.createLinearGradient(0, GROUND_Y - 20, 0, H)
    grass.addColorStop(0, '#8cc466')
    grass.addColorStop(1, '#6fa84e')
    c.fillStyle = grass
    c.fillRect(0, GROUND_Y - 20, W, H - GROUND_Y + 20)

    c.fillStyle = 'rgba(40, 70, 30, 0.28)'
    c.beginPath()
    c.ellipse(300, 494, 160, 14, 0, 0, Math.PI * 2)
    c.fill()

    c.fillStyle = BARK
    c.beginPath()
    c.moveTo(258, 496)
    c.quadraticCurveTo(280, 488, 282, 450)
    c.lineTo(287, 300)
    c.lineTo(313, 300)
    c.lineTo(318, 450)
    c.quadraticCurveTo(320, 488, 342, 496)
    c.closePath()
    c.fill()

    c.strokeStyle = '#5e4430'
    c.lineWidth = 1.5
    c.lineCap = 'round'
    c.beginPath()
    c.moveTo(293, 485)
    c.quadraticCurveTo(290, 420, 294, 340)
    c.moveTo(307, 480)
    c.quadraticCurveTo(311, 410, 306, 350)
    c.stroke()

    c.strokeStyle = BRANCH
    for (const [sx, sy, cx, cy, ex, ey, w] of BRANCHES) {
      c.lineWidth = w
      c.beginPath()
      c.moveTo(sx, sy)
      c.quadraticCurveTo(cx, cy, ex, ey)
      c.stroke()

      const angle = Math.atan2(ey - cy, ex - cx)
      c.lineWidth = Math.max(2.5, w * 0.3)
      c.beginPath()
      for (const turn of [-0.55, 0.55]) {
        c.moveTo(ex, ey)
        c.lineTo(ex + Math.cos(angle + turn) * 26, ey + Math.sin(angle + turn) * 26)
      }
      c.stroke()
    }
  }

  // A fresh, full crown of leaves. Regrow paints from this copy.
  function growFoliage() {
    const c = ctxOf(full!)
    c.clearRect(0, 0, W, H)

    for (let i = 0; i < 900; i++) {
      const p = canopyPoint()
      c.fillStyle = shadeAt(p.x, p.y, 0.25)
      c.beginPath()
      c.arc(p.x, p.y + 3, rand(16, 24), 0, Math.PI * 2)
      c.fill()
    }
    for (let i = 0; i < 1100; i++) {
      const p = canopyPoint()
      c.fillStyle = shadeAt(p.x, p.y)
      c.beginPath()
      c.arc(p.x, p.y, rand(10, 16), 0, Math.PI * 2)
      c.fill()
    }
    for (let i = 0; i < 500; i++) {
      const p = canopyPoint()
      c.fillStyle = shadeAt(p.x, p.y, -0.3)
      c.beginPath()
      c.arc(p.x - 3, p.y - 4, rand(4, 8), 0, Math.PI * 2)
      c.fill()
    }
    c.fillStyle = 'rgba(40, 80, 36, 0.45)'
    for (let i = 0; i < 700; i++) {
      const p = canopyPoint()
      c.beginPath()
      c.ellipse(p.x, p.y, 4.5, 2, rand(0, Math.PI), 0, Math.PI * 2)
      c.fill()
    }

    resetFoliage()
  }

  function resetFoliage() {
    const c = ctxOf(foliage!)
    c.clearRect(0, 0, W, H)
    c.drawImage(full!, 0, 0, W, H)
  }

  function render(withCursor = true) {
    if (!view) return
    view.clearRect(0, 0, W, H)
    view.drawImage(base!, 0, 0, W, H)
    view.drawImage(foliage!, 0, 0, W, H)

    if (mode.value === 'levels') {
      if (level.value.tint || hinting.value) {
        drawTint()
        view.drawImage(tintLayer!, 0, 0, W, H)
      }
      view.drawImage(outline!, 0, 0, W, H)
    }

    for (const p of particles) {
      view.save()
      view.globalAlpha = Math.max(0, p.life)
      view.translate(p.x, p.y)
      view.rotate(p.rot)
      view.fillStyle = p.color
      view.beginPath()
      view.ellipse(0, 0, 6, 3, 0, 0, Math.PI * 2)
      view.fill()
      view.restore()
    }

    if (withCursor && cursor) {
      view.save()
      view.beginPath()
      view.arc(cursor.x, cursor.y, radius.value + 1.5, 0, Math.PI * 2)
      view.strokeStyle = 'rgba(0, 0, 0, 0.45)'
      view.lineWidth = 3
      view.stroke()
      view.beginPath()
      view.arc(cursor.x, cursor.y, radius.value, 0, Math.PI * 2)
      view.strokeStyle = tool.value === 'trim' ? '#ffffff' : '#c8f0a8'
      view.lineWidth = 2
      if (tool.value === 'regrow') view.setLineDash([6, 4])
      view.stroke()
      view.setLineDash([])
      view.fillStyle = '#ffffff'
      view.beginPath()
      view.arc(cursor.x, cursor.y, 2, 0, Math.PI * 2)
      view.fill()
      view.restore()
    }
  }

  // ---- Target shape ----

  // Leaves still standing outside the shape, tinted orange.
  function drawTint() {
    const c = ctxOf(tintLayer!)
    c.save()
    c.clearRect(0, 0, W, H)
    c.drawImage(foliage!, 0, 0, W, H)
    c.globalCompositeOperation = 'source-atop'
    c.fillStyle = TINT
    c.fillRect(0, 0, W, H)
    c.globalCompositeOperation = 'destination-out'
    for (const path of shapePaths) c.fill(path)
    c.restore()
  }

  // A dashed outline with a dark edge so it reads on both leaves and sky. Only the outer half of
  // each stroke is kept, which also hides the seams where two shapes overlap.
  function drawOutline() {
    const c = ctxOf(outline!)
    c.save()
    c.clearRect(0, 0, W, H)
    c.lineJoin = 'round'
    c.strokeStyle = 'rgba(20, 30, 20, 0.7)'
    c.lineWidth = 12
    for (const path of shapePaths) c.stroke(path)
    c.strokeStyle = '#ffffff'
    c.lineWidth = 7
    c.setLineDash([16, 10])
    for (const path of shapePaths) c.stroke(path)
    c.globalCompositeOperation = 'destination-out'
    for (const path of shapePaths) c.fill(path)
    c.restore()
  }

  // Sorts every grid sample into inside, outside or ignored, using the fresh crown.
  function classifySamples() {
    const probe = document.createElement('canvas').getContext('2d')!
    probe.lineWidth = level.value.band * 2
    const pw = W * dpr
    const leaves = ctxOf(full!).getImageData(0, 0, pw, H * dpr).data
    const cols = Math.floor(W / SAMPLE_STEP)
    const rows = Math.floor(H / SAMPLE_STEP)
    sampleClass = new Uint8Array(cols * rows)
    sampleOffset = new Uint32Array(cols * rows)
    insideTotal = 0
    outsideTotal = 0
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const i = row * cols + col
        const x = col * SAMPLE_STEP + SAMPLE_STEP / 2
        const y = row * SAMPLE_STEP + SAMPLE_STEP / 2
        const offset = (Math.round(y * dpr) * pw + Math.round(x * dpr)) * 4 + 3
        sampleOffset[i] = offset
        if (leaves[offset]! <= LEAF_ALPHA) continue
        if (shapePaths.some((p) => probe.isPointInStroke(p, x, y))) continue
        if (shapePaths.some((p) => probe.isPointInPath(p, x, y))) {
          sampleClass[i] = 1
          insideTotal++
        } else {
          sampleClass[i] = 2
          outsideTotal++
        }
      }
    }
  }

  function measure() {
    const leaves = ctxOf(foliage!).getImageData(0, 0, W * dpr, H * dpr).data
    let inside = 0
    let outside = 0
    for (let i = 0; i < sampleClass.length; i++) {
      const cls = sampleClass[i]
      if (!cls || leaves[sampleOffset[i]!]! <= LEAF_ALPHA) continue
      if (cls === 1) inside++
      else outside++
    }
    tidied.value = outsideTotal ? 1 - outside / outsideTotal : 1
    kept.value = insideTotal ? inside / insideTotal : 1
  }

  // On finishing a level, the last stray leaves outside the outline drop away so the shape is clean.
  function tidyUp() {
    if (!reducedMotion) {
      const pw = W * dpr
      const leaves = ctxOf(foliage!).getImageData(0, 0, pw, H * dpr).data
      const cols = Math.floor(W / SAMPLE_STEP)
      for (let i = 0; i < sampleClass.length && particles.length < MAX_PARTICLES; i += 3) {
        if (sampleClass[i] !== 2 || leaves[sampleOffset[i]!]! <= LEAF_ALPHA) continue
        spawnLeaves({
          x: (i % cols) * SAMPLE_STEP + SAMPLE_STEP / 2,
          y: Math.floor(i / cols) * SAMPLE_STEP + SAMPLE_STEP / 2,
        })
      }
    }
    // Subpaths share a winding direction, so one combined path fills as their union.
    const union = new Path2D()
    for (const path of shapePaths) union.addPath(path)
    const c = ctxOf(foliage!)
    c.save()
    c.globalCompositeOperation = 'destination-in'
    c.fill(union)
    c.restore()
    tidied.value = 1
    render()
  }

  // Called after every cut, regrow or undo.
  function evaluate() {
    if (mode.value !== 'levels' || levelComplete.value) return
    const keptBefore = kept.value
    const bucketBefore = Math.floor(tidied.value * 4)
    measure()
    if (tidied.value >= level.value.target) {
      levelComplete.value = true
      tidyUp()
      message.value = isLastLevel.value
        ? 'Beautiful. You have finished every level.'
        : `Level ${levelIndex.value + 1} complete. Well done.`
    } else if (kept.value < keptBefore - 0.02) {
      message.value = 'That cut went inside the outline. Use Regrow to fill it back in.'
    } else if (Math.floor(tidied.value * 4) > bucketBefore) {
      message.value = `${tidiedPct.value}% tidied. Keep going.`
    }
  }

  function startLevel(index: number) {
    mode.value = 'levels'
    levelIndex.value = index
    shapePaths = level.value.shape.map((d) => new Path2D(d))
    sizeId.value = level.value.startSize
    tool.value = 'trim'
    levelComplete.value = false
    stopHint()
    strokes = []
    strokeCount.value = 0
    particles = []
    growFoliage()
    drawOutline()
    classifySamples()
    measure()
    render()
    message.value = level.value.tint
      ? 'Trim the orange leaves outside the dashed outline.'
      : 'Trim the leaves outside the dashed outline.'
  }

  function startFree() {
    mode.value = 'free'
    levelComplete.value = false
    stopHint()
    strokes = []
    strokeCount.value = 0
    particles = []
    growFoliage()
    render()
    message.value = 'Drag across the leaves to trim them into any shape you like.'
  }

  function showHint() {
    stopHint()
    hinting.value = true
    render()
    message.value = 'The leaves still to trim are shown in orange.'
    hintTimer = setTimeout(() => {
      hinting.value = false
      render()
    }, HINT_MS)
  }

  function stopHint() {
    clearTimeout(hintTimer)
    hinting.value = false
  }

  // ---- Cutting and regrowing ----

  // Circles every third of a radius between two points, so fast drags leave no gaps.
  function along(a: Pt, b: Pt, r: number): Pt[] {
    const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / (r * 0.35)))
    return Array.from({ length: steps }, (_, i) => ({
      x: a.x + ((b.x - a.x) * (i + 1)) / steps,
      y: a.y + ((b.y - a.y) * (i + 1)) / steps,
    }))
  }

  function hasLeavesAt(p: Pt) {
    const pixel = ctxOf(foliage!).getImageData(Math.round(p.x * dpr), Math.round(p.y * dpr), 1, 1)
    return pixel.data[3]! > 40
  }

  function apply(points: Pt[], stroke: Stroke, withEffects: boolean) {
    if (!points.length) return
    if (withEffects && stroke.tool === 'trim' && !reducedMotion) {
      const p = points[points.length - 1]!
      if (hasLeavesAt(p)) spawnLeaves(p)
    }

    // Regrow reaches slightly past its ring so it covers the soft edges left by earlier cuts.
    const r = stroke.tool === 'regrow' ? stroke.radius + REGROW_OVERLAP : stroke.radius
    const c = ctxOf(foliage!)
    c.save()
    c.beginPath()
    for (const p of points) {
      c.moveTo(p.x + r, p.y)
      c.arc(p.x, p.y, r, 0, Math.PI * 2)
    }
    if (stroke.tool === 'trim') {
      c.globalCompositeOperation = 'destination-out'
      c.fill()
    } else {
      c.clip()
      c.drawImage(full!, 0, 0, W, H)
    }
    c.restore()
  }

  function replay(stroke: Stroke) {
    const [first, ...rest] = stroke.points
    if (!first) return
    apply([first], stroke, false)
    let last = first
    for (const p of rest) {
      apply(along(last, p, stroke.radius), stroke, false)
      last = p
    }
  }

  function beginStroke(p: Pt) {
    active = { tool: tool.value, radius: radius.value, points: [p] }
    strokes.push(active)
    strokeCount.value = strokes.length
    apply([p], active, true)
  }

  function extendStroke(p: Pt) {
    if (!active) return
    const last = active.points[active.points.length - 1]!
    apply(along(last, p, active.radius), active, true)
    active.points.push(p)
  }

  function undo() {
    if (!strokes.length) return
    strokes.pop()
    strokeCount.value = strokes.length
    resetFoliage()
    strokes.forEach(replay)
    render()
    message.value = 'Last cut undone.'
    evaluate()
  }

  function startOver() {
    if (mode.value === 'levels') {
      startLevel(levelIndex.value)
      return
    }
    startFree()
    message.value = 'A fresh, full tree is ready.'
  }

  function pickTool(next: Tool) {
    tool.value = next
    render()
    message.value =
      next === 'trim'
        ? 'Trim: drag across the leaves to clip them away.'
        : 'Regrow: drag where you want leaves to grow back.'
  }

  function pickSize(id: ClipperSize) {
    sizeId.value = id
    render()
  }

  function savePicture() {
    if (!canvas.value) return
    render(false)
    canvas.value.toBlob((blob) => {
      if (!blob) return
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = mode.value === 'levels' ? `tree-level-${levelIndex.value + 1}.png` : 'my-tree.png'
      link.click()
      URL.revokeObjectURL(link.href)
    })
    render()
    message.value = 'Picture saved.'
  }

  // ---- Falling leaves ----

  function spawnLeaves(p: Pt) {
    for (let i = 0; i < 2 && particles.length < MAX_PARTICLES; i++) {
      particles.push({
        x: p.x + rand(-radius.value, radius.value) * 0.5,
        y: p.y + rand(-radius.value, radius.value) * 0.5,
        vx: rand(-1.2, 1.2),
        vy: rand(-1.5, 0),
        rot: rand(0, Math.PI),
        vr: rand(-0.15, 0.15),
        life: 1,
        color: shadeAt(p.x, p.y),
      })
    }
    if (!rafId) rafId = requestAnimationFrame(tick)
  }

  function tick() {
    for (const p of particles) {
      p.vy += 0.15
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      p.life -= 0.015
    }
    particles = particles.filter((p) => p.life > 0 && p.y < H)
    render()
    rafId = particles.length ? requestAnimationFrame(tick) : 0
  }

  // ---- Input ----

  function toCanvas(event: PointerEvent): Pt {
    const rect = canvas.value!.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * W,
      y: ((event.clientY - rect.top) / rect.height) * H,
    }
  }

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    canvas.value!.setPointerCapture(event.pointerId)
    cursor = toCanvas(event)
    beginStroke(cursor)
    render()
  }

  function onPointerMove(event: PointerEvent) {
    cursor = toCanvas(event)
    extendStroke(cursor)
    render()
  }

  function onPointerUp() {
    if (!active) return
    active = null
    evaluate()
  }

  function onPointerLeave() {
    if (active) return
    cursor = null
    render()
  }

  // Arrow keys move the clippers; Space or Enter cuts (or regrows) where they are.
  function onKeyDown(event: KeyboardEvent) {
    const step = event.shiftKey ? KEY_STEP_FAST : KEY_STEP
    const moves: Record<string, Pt> = {
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
    }
    const move = moves[event.key]
    if (move) {
      event.preventDefault()
      const from = cursor ?? { x: W / 2, y: 220 }
      cursor = {
        x: Math.min(W, Math.max(0, from.x + move.x)),
        y: Math.min(H, Math.max(0, from.y + move.y)),
      }
      render()
      return
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      cursor ??= { x: W / 2, y: 220 }
      beginStroke(cursor)
      active = null
      render()
      evaluate()
    }
  }

  function onFocus() {
    cursor ??= { x: W / 2, y: 220 }
    render()
  }

  function onBlur() {
    cursor = null
    render()
  }

  onMounted(() => {
    const el = canvas.value
    if (!el) return
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    el.width = W * dpr
    el.height = H * dpr
    view = el.getContext('2d')!
    view.setTransform(dpr, 0, 0, dpr, 0, 0)
    base = makeLayer()
    full = makeLayer(true)
    foliage = makeLayer(true)
    outline = makeLayer()
    tintLayer = makeLayer()
    reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    drawBase()
    startLevel(0)
  })

  onBeforeUnmount(() => {
    cancelAnimationFrame(rafId)
    clearTimeout(hintTimer)
  })

  const btnBase =
    'inline-flex min-h-[56px] items-center justify-center rounded-2xl px-5 py-3 text-lg font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40'
  const btnPrimary = `${btnBase} bg-orange-700 text-white hover:bg-orange-800`
  const btnQuiet = `${btnBase} border-2 border-slate-400 bg-white text-[var(--bn-navy)] hover:bg-slate-50`
  const choiceBase =
    'flex min-h-[56px] items-center justify-center gap-2 rounded-2xl border-2 px-3 py-2 text-lg font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-2 focus-visible:outline-none'
  const choiceOn = `${choiceBase} border-[var(--bn-navy)] bg-[var(--bn-navy)] text-white`
  const choiceOff = `${choiceBase} border-[var(--bn-border)] bg-white text-[var(--bn-navy)] hover:border-orange-700`
</script>

<template>
  <section
    aria-labelledby="trim-title"
    class="rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 sm:p-10"
  >
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-lg font-bold tracking-wide text-orange-800 uppercase">
          <template v-if="mode === 'levels'">
            Tree trimming · Level {{ levelIndex + 1 }} of {{ TRIM_LEVELS.length }}
          </template>
          <template v-else>Tree trimming · Free trim</template>
        </p>
        <h2 id="trim-title" class="bn-font-display mt-2 text-3xl font-bold text-[var(--bn-navy)]">
          {{ mode === 'levels' ? level.title : 'Shape the tree any way you like' }}
        </h2>
      </div>
      <div class="grid grid-cols-2 gap-2" role="group" aria-label="Way to play">
        <button
          type="button"
          :class="mode === 'levels' ? choiceOn : choiceOff"
          :aria-pressed="mode === 'levels'"
          @click="mode === 'levels' || startLevel(levelIndex)"
        >
          Levels
        </button>
        <button
          type="button"
          :class="mode === 'free' ? choiceOn : choiceOff"
          :aria-pressed="mode === 'free'"
          @click="mode === 'free' || startFree()"
        >
          Free trim
        </button>
      </div>
    </div>
    <p class="mt-2 max-w-xl text-lg leading-relaxed text-[var(--bn-muted)]">
      <template v-if="mode === 'levels'">{{ level.goal }}</template>
      <template v-else>
        Drag across the leaves to trim them away. There is no right answer — make it round, tall, or
        something all your own. Use Regrow to fill leaves back in.
      </template>
    </p>
    <div v-if="mode === 'levels'" class="mt-4 flex gap-2" aria-hidden="true">
      <span
        v-for="(_, i) in TRIM_LEVELS"
        :key="i"
        class="h-2 w-10 rounded-full"
        :class="i < levelIndex ? 'bg-orange-700' : i === levelIndex ? 'bg-[var(--bn-navy)]' : 'bg-white'"
      />
    </div>

    <div class="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <div>
        <div class="overflow-hidden rounded-[28px] border border-[var(--bn-border)] bg-white">
          <canvas
            ref="canvas"
            class="block aspect-[10/9] w-full cursor-none touch-none select-none focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-[var(--bn-navy)]"
            tabindex="0"
            role="application"
            :aria-label="mode === 'levels' ? `Tree to trim into ${level.title.toLowerCase()}` : 'Tree to trim'"
            aria-describedby="trim-keys"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
            @pointerleave="onPointerLeave"
            @keydown="onKeyDown"
            @focus="onFocus"
            @blur="onBlur"
          />
        </div>

        <div v-if="mode === 'levels'" class="mt-4">
          <div class="flex flex-wrap items-baseline justify-between gap-x-4 text-lg">
            <span id="tidied-label" class="font-semibold text-[var(--bn-navy)]">
              Tidied {{ tidiedPct }}%
            </span>
            <span class="text-[var(--bn-muted)]">Shape kept {{ keptPct }}%</span>
          </div>
          <div
            class="mt-2 h-4 overflow-hidden rounded-full border border-[var(--bn-border)] bg-white"
            role="progressbar"
            aria-labelledby="tidied-label"
            :aria-valuenow="tidiedPct"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              class="h-full rounded-full bg-orange-700 transition-[width] duration-300"
              :style="{ width: `${Math.min(100, (tidied / level.target) * 100)}%` }"
            />
          </div>
        </div>
      </div>

      <div
        v-if="mode === 'levels' && levelComplete"
        class="rounded-2xl border border-[var(--bn-border)] bg-white p-5 text-center"
      >
        <p class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">
          {{ isLastLevel ? 'All levels complete' : `Level ${levelIndex + 1} complete` }}
        </p>
        <p class="mt-2 text-2xl tracking-widest text-orange-700">
          <span aria-hidden="true">
            {{ '★'.repeat(stars) }}<span class="text-[var(--bn-border)]">{{ '★'.repeat(3 - stars) }}</span>
          </span>
          <span class="sr-only">{{ stars }} of 3 stars</span>
        </p>
        <p class="mt-1 text-lg text-[var(--bn-muted)]">
          {{ stars === 3 ? 'A lovely clean shape.' : `You kept ${keptPct}% of the shape.` }}
        </p>
        <div class="mt-5 grid gap-2">
          <button
            type="button"
            :class="btnPrimary"
            @click="startLevel(isLastLevel ? 0 : levelIndex + 1)"
          >
            {{ isLastLevel ? 'Play again' : 'Next level' }}
          </button>
          <button type="button" :class="btnQuiet" @click="startLevel(levelIndex)">Try again</button>
          <button type="button" :class="btnQuiet" @click="savePicture">Save picture</button>
        </div>
      </div>

      <aside
        v-else
        aria-label="Trimming tools"
        class="space-y-5 rounded-2xl border border-[var(--bn-border)] bg-white p-4"
      >
        <div>
          <p class="text-lg font-semibold text-[var(--bn-navy)]">Tool</p>
          <div class="mt-2 grid grid-cols-2 gap-2" role="group" aria-label="Tool">
            <button
              type="button"
              :class="tool === 'trim' ? choiceOn : choiceOff"
              :aria-pressed="tool === 'trim'"
              @click="pickTool('trim')"
            >
              <svg
                viewBox="0 0 24 24"
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="18" r="3" />
                <path d="M8 16 L19 3 M16 16 L5 3" stroke-linecap="round" />
              </svg>
              Trim
            </button>
            <button
              type="button"
              :class="tool === 'regrow' ? choiceOn : choiceOff"
              :aria-pressed="tool === 'regrow'"
              @click="pickTool('regrow')"
            >
              <svg
                viewBox="0 0 24 24"
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path d="M12 21 V11" stroke-linecap="round" />
                <path d="M12 13 C12 8 8 6 4 6 C4 10 7 13 12 13 Z" />
                <path d="M12 11 C12 6 15 3 20 3 C20 8 17 11 12 11 Z" />
              </svg>
              Regrow
            </button>
          </div>
        </div>

        <div>
          <p class="text-lg font-semibold text-[var(--bn-navy)]">Clipper size</p>
          <div class="mt-2 grid grid-cols-3 gap-2" role="group" aria-label="Clipper size">
            <button
              v-for="size in SIZES"
              :key="size.id"
              type="button"
              class="flex-col"
              :class="sizeId === size.id ? choiceOn : choiceOff"
              :aria-pressed="sizeId === size.id"
              @click="pickSize(size.id)"
            >
              <span
                class="rounded-full border-2 border-current"
                :style="{ width: `${size.radius * 0.7}px`, height: `${size.radius * 0.7}px` }"
                aria-hidden="true"
              />
              <span class="text-base">{{ size.label }}</span>
            </button>
          </div>
        </div>

        <div class="grid gap-2">
          <button
            v-if="mode === 'levels' && !level.tint"
            type="button"
            :class="btnQuiet"
            :disabled="hinting"
            @click="showHint"
          >
            Show me where
          </button>
          <button type="button" :class="btnQuiet" :disabled="strokeCount === 0" @click="undo">
            Undo
          </button>
          <button type="button" :class="btnQuiet" @click="startOver">Start over</button>
          <button v-if="mode === 'free'" type="button" :class="btnQuiet" @click="savePicture">
            Save picture
          </button>
        </div>

        <div v-if="mode === 'free'" class="rounded-2xl bg-[var(--bn-cream)] p-3">
          <p class="text-base font-semibold text-[var(--bn-navy)]">Need an idea?</p>
          <p class="text-base text-[var(--bn-muted)]">
            Try a ball, a cloud, a heart, a mushroom, or your favourite animal.
          </p>
        </div>
      </aside>
    </div>

    <p id="trim-keys" class="mt-4 text-base text-[var(--bn-muted)]">
      Keyboard: select the tree, move the clippers with the arrow keys (hold Shift to move faster),
      and press Space to cut.
    </p>
    <p class="mt-4 min-h-[2rem] text-center text-xl text-[var(--bn-navy)]" aria-live="polite">
      {{ message }}
    </p>
  </section>
</template>

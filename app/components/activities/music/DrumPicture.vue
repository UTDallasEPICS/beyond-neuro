<script setup lang="ts">
  // Drawings of the seven drums. When `interactive`, each tap area plays when
  // pressed (touch, mouse or pen; several fingers at once work) and can also be
  // reached with Tab and played with Enter or Space.
  import { findDrum, type DrumId } from '~/utils/drumKit'

  const props = defineProps<{
    drumId: DrumId
    /** Parts just tapped: short orange flash. */
    lit?: string[]
    /** Parts the patient should look at: pulsing yellow glow. */
    cue?: string[]
    /** Parts answered correctly: green glow. */
    good?: string[]
    interactive?: boolean
  }>()
  const emit = defineEmits<{ hit: [areaId: string] }>()

  const drum = computed(() => findDrum(props.drumId)!)
  const uid = 'dp' + useId().replace(/[^a-zA-Z0-9_-]/g, '-')
  const gid = (name: string) => `${uid}-${name}`
  const fill = (name: string) => `url(#${uid}-${name})`

  /** Attributes for one tap area. */
  function area(id: string): Record<string, unknown> {
    const label = drum.value.areas.find((a) => a.id === id)?.label ?? id
    return {
      class: [
        'dp-area',
        {
          'is-lit': props.lit?.includes(id),
          'is-cue': props.cue?.includes(id),
          'is-good': props.good?.includes(id),
        },
      ],
      'data-area': id,
      ...(props.interactive
        ? {
            role: 'button',
            tabindex: 0,
            'aria-label': label,
            onPointerdown: (e: PointerEvent) => {
              e.preventDefault()
              emit('hit', id)
            },
            onKeydown: (e: KeyboardEvent) => {
              if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
                e.preventDefault()
                e.stopPropagation()
                emit('hit', id)
              }
            },
          }
        : { 'aria-hidden': 'true' }),
    }
  }

  // Where each part's name is written on the drawing.
  const LABELS: Record<DrumId, Array<{ area: string; x: number; y: number }>> = {
    frame: [{ area: 'drum', x: 200, y: 160 }],
    djembe: [
      { area: 'slap', x: 92, y: 82 },
      { area: 'bass', x: 200, y: 82 },
    ],
    timpani: [
      { area: 'low', x: 78, y: 154 },
      { area: 'middle', x: 212, y: 147 },
      { area: 'high', x: 330, y: 140 },
    ],
    bass: [
      { area: 'hihat', x: 60, y: 140 },
      { area: 'left', x: 182, y: 290 },
      { area: 'right', x: 298, y: 290 },
    ],
    snare: [
      { area: 'edge', x: 84, y: 110 },
      { area: 'middle', x: 200, y: 110 },
      { area: 'rim', x: 364, y: 110 },
    ],
    tenors: [
      { area: 'd1', x: 74, y: 196 },
      { area: 'd2', x: 166, y: 116 },
      { area: 'd3', x: 276, y: 110 },
      { area: 'd4', x: 346, y: 192 },
    ],
    kit: [
      { area: 'hihat', x: 52, y: 98 },
      { area: 'crash', x: 122, y: 40 },
      { area: 'snare', x: 100, y: 194 },
      { area: 'tom', x: 220, y: 136 },
      { area: 'floor', x: 330, y: 204 },
      { area: 'kick', x: 212, y: 252 },
    ],
  }

  const labels = computed(() =>
    LABELS[props.drumId].map((l) => {
      const text = drum.value.areas.find((a) => a.id === l.area)?.short ?? ''
      return { ...l, text, width: text.length * 11 + 30 }
    })
  )

  /** Even-odd ring between two ellipses with the same centre. */
  function ring(cx: number, cy: number, rx: number, ry: number, irx: number, iry: number) {
    return (
      `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${rx * 2} 0 a ${rx} ${ry} 0 1 0 ${-rx * 2} 0 Z ` +
      `M ${cx - irx} ${cy} a ${irx} ${iry} 0 1 0 ${irx * 2} 0 a ${irx} ${iry} 0 1 0 ${-irx * 2} 0 Z`
    )
  }

  /** Side of a drum seen from slightly above: top edge, straight sides, curved bottom. */
  function shell(cx: number, top: number, rx: number, ry: number, h: number) {
    return `M ${cx - rx} ${top} L ${cx - rx} ${top + h} A ${rx} ${ry} 0 0 0 ${cx + rx} ${top + h} L ${cx + rx} ${top} Z`
  }

  /** A copper timpani bowl. */
  function bowl(cx: number, top: number, rx: number, depth: number) {
    return (
      `M ${cx - rx} ${top} C ${cx - rx} ${top + depth * 0.9}, ${cx - rx * 0.45} ${top + depth}, ${cx} ${top + depth} ` +
      `C ${cx + rx * 0.45} ${top + depth}, ${cx + rx} ${top + depth * 0.9}, ${cx + rx} ${top} Z`
    )
  }

  /** A foot pedal's footboard, starting at x. */
  function footboard(x: number) {
    return `M ${x + 8} 262 L ${x + 72} 262 L ${x + 80} 312 L ${x} 312 Z`
  }

  /** Points evenly spaced round a circle, rounded so server and browser agree exactly. */
  function around(n: number, cx: number, cy: number, r: number) {
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2
      return {
        x: Math.round((cx + Math.cos(a) * r) * 100) / 100,
        y: Math.round((cy + Math.sin(a) * r) * 100) / 100,
      }
    })
  }

  const frameTacks = around(28, 200, 160, 133)

  // Djembe rope pattern (zig-zag between the top and the waist).
  const djembeRopes = Array.from({ length: 15 }, (_, i) => {
    const u = i / 14
    const s = Math.round(Math.sin(u * Math.PI) * 100) / 100
    return i % 2 === 0
      ? `${Math.round(66 + u * 268)},${Math.round(122 + s * 26)}`
      : `${Math.round(168 + u * 64)},${Math.round(212 + s * 6)}`
  }).join(' ')

  const TIMPANI = [
    { id: 'low', cx: 78, rx: 68 },
    { id: 'middle', cx: 212, rx: 57 },
    { id: 'high', cx: 330, rx: 46 },
  ]

  const TENORS = [
    { id: 'd1', x: 74, y: 196, r: 62 },
    { id: 'd2', x: 166, y: 116, r: 57 },
    { id: 'd3', x: 276, y: 110, r: 48 },
    { id: 'd4', x: 346, y: 192, r: 40 },
  ]

  const KIT = {
    snare: { cx: 100, top: 184, rx: 50, ry: 15, h: 28 },
    tom: { cx: 220, top: 124, rx: 40, ry: 13, h: 36 },
    floor: { cx: 330, top: 186, rx: 50, ry: 16, h: 70 },
    kick: { cx: 212, cy: 236, r: 70 },
  }
</script>

<template>
  <div class="dp" :class="{ 'is-interactive': interactive }" :data-drum="drumId">
    <svg viewBox="0 0 400 320" role="img" :aria-label="drum.name">
      <defs>
        <radialGradient :id="gid('skin')" cx="45%" cy="40%" r="65%">
          <stop offset="0%" stop-color="#fbf1d9" />
          <stop offset="70%" stop-color="#ecd3a4" />
          <stop offset="100%" stop-color="#c9a46b" />
        </radialGradient>
        <linearGradient :id="gid('wood')" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#b7793f" />
          <stop offset="50%" stop-color="#8a5226" />
          <stop offset="100%" stop-color="#5b3316" />
        </linearGradient>
        <linearGradient :id="gid('darkwood')" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#3f1d0b" />
          <stop offset="35%" stop-color="#8b4513" />
          <stop offset="55%" stop-color="#a0522d" />
          <stop offset="100%" stop-color="#3f1d0b" />
        </linearGradient>
        <linearGradient :id="gid('copper')" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#6b2a0e" />
          <stop offset="30%" stop-color="#c2621f" />
          <stop offset="45%" stop-color="#f4b36b" />
          <stop offset="65%" stop-color="#b8571b" />
          <stop offset="100%" stop-color="#5a230b" />
        </linearGradient>
        <radialGradient :id="gid('head')" cx="45%" cy="35%" r="75%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#e2e8f0" />
        </radialGradient>
        <linearGradient :id="gid('chrome')" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#4b5563" />
          <stop offset="18%" stop-color="#e5e7eb" />
          <stop offset="35%" stop-color="#9ca3af" />
          <stop offset="55%" stop-color="#f9fafb" />
          <stop offset="80%" stop-color="#6b7280" />
          <stop offset="100%" stop-color="#374151" />
        </linearGradient>
        <linearGradient :id="gid('red')" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ef4444" />
          <stop offset="50%" stop-color="#991b1b" />
          <stop offset="100%" stop-color="#7f1d1d" />
        </linearGradient>
        <linearGradient :id="gid('purple')" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#2e1065" />
          <stop offset="40%" stop-color="#7c3aed" />
          <stop offset="60%" stop-color="#8b5cf6" />
          <stop offset="100%" stop-color="#2e1065" />
        </linearGradient>
        <radialGradient :id="gid('brass')" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stop-color="#fde68a" />
          <stop offset="60%" stop-color="#d4a017" />
          <stop offset="100%" stop-color="#a16207" />
        </radialGradient>
      </defs>

      <!-- Level 1 · Frame drum (1 part): thin wooden frame, tacked skin -->
      <template v-if="drumId === 'frame'">
        <circle cx="209" cy="168" r="141" fill="#4a2a12" />
        <circle cx="200" cy="160" r="141" :fill="fill('wood')" />
        <circle v-bind="area('drum')" cx="200" cy="160" r="128" :fill="fill('skin')" />
        <g pointer-events="none" fill="none" stroke="#9a3412" opacity="0.5" stroke-width="2">
          <circle cx="200" cy="160" r="84" stroke-dasharray="2 5" />
          <circle cx="200" cy="160" r="118" />
        </g>
        <g pointer-events="none">
          <circle
            v-for="(t, i) in frameTacks"
            :key="i"
            :cx="t.x"
            :cy="t.y"
            r="3"
            fill="#e2b13c"
            stroke="#7c5a12"
          />
        </g>
      </template>

      <!-- Level 2 · Djembe (2 parts): goblet body, rope tuning, skin head -->
      <template v-else-if="drumId === 'djembe'">
        <path
          d="M 52 86 C 54 160, 150 176, 168 214 L 148 304 Q 200 318 252 304 L 232 214 C 250 176, 346 160, 348 86 Z"
          :fill="fill('darkwood')"
        />
        <g pointer-events="none" fill="none" stroke-linecap="round">
          <polyline :points="djembeRopes" stroke="#e7d6a8" stroke-width="2.5" />
          <path d="M 60 118 Q 200 170 340 118" stroke="#d6c08a" stroke-width="6" />
          <path d="M 164 210 Q 200 222 236 210" stroke="#d6c08a" stroke-width="6" />
        </g>
        <path
          v-bind="area('slap')"
          :d="ring(200, 82, 150, 56, 86, 32)"
          fill-rule="evenodd"
          :fill="fill('skin')"
        />
        <ellipse v-bind="area('bass')" cx="200" cy="82" rx="86" ry="32" :fill="fill('skin')" />
        <ellipse
          cx="200"
          cy="84"
          rx="152"
          ry="58"
          fill="none"
          stroke="#d6c08a"
          stroke-width="7"
          stroke-dasharray="8 3"
          pointer-events="none"
        />
      </template>

      <!-- Level 3 · Timpani (3 parts): low, middle and high copper kettles -->
      <template v-else-if="drumId === 'timpani'">
        <g pointer-events="none" stroke-linecap="round">
          <line x1="140" y1="30" x2="260" y2="56" stroke="#a16207" stroke-width="5" />
          <line x1="160" y1="56" x2="280" y2="30" stroke="#a16207" stroke-width="5" />
          <circle cx="138" cy="29" r="11" fill="#f5f5f4" stroke="#a8a29e" />
          <circle cx="282" cy="29" r="11" fill="#f5f5f4" stroke="#a8a29e" />
        </g>
        <g v-for="k in TIMPANI" :key="k.id" v-bind="area(k.id)">
          <g stroke="#374151" stroke-width="5" stroke-linecap="round">
            <line
              :x1="k.cx - k.rx * 0.55"
              :y1="110 + k.rx * 1.05"
              :x2="k.cx - k.rx * 0.8"
              y2="306"
            />
            <line
              :x1="k.cx + k.rx * 0.55"
              :y1="110 + k.rx * 1.05"
              :x2="k.cx + k.rx * 0.8"
              y2="306"
            />
          </g>
          <path :d="bowl(k.cx, 110, k.rx, k.rx * 1.3)" :fill="fill('copper')" />
          <ellipse :cx="k.cx" cy="110" :rx="k.rx + 4" :ry="k.rx * 0.3 + 4" fill="#4b5563" />
          <ellipse :cx="k.cx" cy="110" :rx="k.rx" :ry="k.rx * 0.3" fill="#f5f1e6" />
        </g>
      </template>

      <!-- Level 4 · Bass drum (3 parts): hi-hat pedal, left and right bass drum pedals -->
      <template v-else-if="drumId === 'bass'">
        <g pointer-events="none">
          <line x1="160" y1="175" x2="140" y2="244" stroke="#9ca3af" stroke-width="6" />
          <line x1="340" y1="175" x2="360" y2="244" stroke="#9ca3af" stroke-width="6" />
          <circle cx="250" cy="118" r="106" :fill="fill('red')" />
          <circle cx="250" cy="118" r="96" fill="#fef7ec" stroke="#5b3a1a" stroke-width="6" />
          <circle cx="250" cy="118" r="56" fill="none" stroke="#b91c1c" stroke-width="5" />
          <circle cx="292" cy="166" r="12" fill="#1f2937" />
        </g>
        <g v-bind="area('hihat')">
          <rect x="8" y="30" width="104" height="286" fill="transparent" />
          <line x1="60" y1="74" x2="60" y2="262" stroke="#6b7280" stroke-width="4" />
          <ellipse cx="60" cy="76" rx="50" ry="8" :fill="fill('brass')" stroke="#854d0e" />
          <ellipse cx="60" cy="66" rx="50" ry="8" :fill="fill('brass')" stroke="#854d0e" />
          <path :d="footboard(20)" fill="#6b7280" stroke="#1f2937" stroke-width="2" />
        </g>
        <g
          v-for="p in [
            { id: 'left', x: 142, beater: 222 },
            { id: 'right', x: 258, beater: 278 },
          ]"
          :key="p.id"
          v-bind="area(p.id)"
        >
          <rect :x="p.x - 8" y="150" width="96" height="166" fill="transparent" />
          <line :x1="p.x + 40" y1="262" :x2="p.beater" y2="176" stroke="#6b7280" stroke-width="4" />
          <rect
            :x="p.beater - 12"
            y="156"
            width="24"
            height="24"
            rx="8"
            fill="#f3f4f6"
            stroke="#6b7280"
          />
          <rect :x="p.x + 4" y="250" width="72" height="12" rx="3" fill="#374151" />
          <path :d="footboard(p.x)" fill="#6b7280" stroke="#1f2937" stroke-width="2" />
        </g>
      </template>

      <!-- Level 5 · Snare drum (3 parts): edge, middle and metal rim -->
      <template v-else-if="drumId === 'snare'">
        <g stroke="#6b7280" stroke-width="5" stroke-linecap="round" pointer-events="none">
          <line x1="200" y1="236" x2="200" y2="286" />
          <line x1="200" y1="286" x2="124" y2="312" />
          <line x1="200" y1="286" x2="276" y2="312" />
        </g>
        <path :d="shell(200, 110, 176, 66, 60)" :fill="fill('chrome')" />
        <path
          v-bind="area('rim')"
          :d="ring(200, 110, 176, 66, 152, 56)"
          fill-rule="evenodd"
          fill="#e5e7eb"
          stroke="#4b5563"
          stroke-width="3"
        />
        <path
          v-bind="area('edge')"
          :d="ring(200, 110, 152, 56, 80, 30)"
          fill-rule="evenodd"
          :fill="fill('head')"
        />
        <ellipse v-bind="area('middle')" cx="200" cy="110" rx="80" ry="30" fill="#ffffff" />
        <ellipse
          cx="200"
          cy="110"
          rx="80"
          ry="30"
          fill="none"
          stroke="#94a3b8"
          stroke-dasharray="4 5"
          pointer-events="none"
        />
      </template>

      <!-- Level 6 · Tenor drums (4 parts): marching drums seen from above -->
      <template v-else-if="drumId === 'tenors'">
        <path
          d="M 30 270 Q 200 330 372 262"
          fill="none"
          stroke="#475569"
          stroke-width="12"
          stroke-linecap="round"
          pointer-events="none"
        />
        <g v-for="t in TENORS" :key="t.id" v-bind="area(t.id)">
          <circle :cx="t.x + 3" :cy="t.y + 9" :r="t.r + 4" fill="#1e3a8a" />
          <circle
            :cx="t.x"
            :cy="t.y"
            :r="t.r + 5"
            fill="#cbd5e1"
            stroke="#64748b"
            stroke-width="2"
          />
          <circle :cx="t.x" :cy="t.y" :r="t.r" :fill="fill('head')" />
        </g>
      </template>

      <!-- Level 7 · Full drum kit (6 parts) -->
      <template v-else>
        <g stroke="#6b7280" stroke-width="3" stroke-linecap="round" pointer-events="none">
          <line x1="122" y1="58" x2="150" y2="300" />
          <line x1="48" y1="122" x2="48" y2="300" />
          <line :x1="KIT.snare.cx" y1="226" :x2="KIT.snare.cx" y2="300" />
          <line x1="290" y1="226" x2="284" y2="314" />
          <line x1="370" y1="226" x2="376" y2="314" />
        </g>
        <g v-bind="area('crash')">
          <ellipse cx="122" cy="54" rx="68" ry="28" fill="transparent" />
          <ellipse cx="122" cy="54" rx="66" ry="12" :fill="fill('brass')" stroke="#854d0e" />
        </g>
        <g v-bind="area('hihat')">
          <ellipse cx="48" cy="120" rx="46" ry="28" fill="transparent" />
          <ellipse cx="48" cy="127" rx="42" ry="8" :fill="fill('brass')" stroke="#854d0e" />
          <ellipse cx="48" cy="118" rx="42" ry="8" :fill="fill('brass')" stroke="#854d0e" />
        </g>
        <g v-bind="area('snare')">
          <path
            :d="shell(KIT.snare.cx, KIT.snare.top, KIT.snare.rx, KIT.snare.ry, KIT.snare.h)"
            :fill="fill('chrome')"
          />
          <ellipse
            :cx="KIT.snare.cx"
            :cy="KIT.snare.top"
            :rx="KIT.snare.rx"
            :ry="KIT.snare.ry"
            fill="#f8fafc"
            stroke="#9ca3af"
            stroke-width="3"
          />
        </g>
        <g v-bind="area('kick')">
          <circle :cx="KIT.kick.cx" :cy="KIT.kick.cy" :r="KIT.kick.r + 6" :fill="fill('purple')" />
          <circle :cx="KIT.kick.cx" :cy="KIT.kick.cy" :r="KIT.kick.r" fill="#111827" />
          <circle
            :cx="KIT.kick.cx"
            :cy="KIT.kick.cy"
            :r="KIT.kick.r - 22"
            fill="none"
            stroke="#7c3aed"
            stroke-width="3"
          />
        </g>
        <g v-bind="area('tom')">
          <path
            :d="shell(KIT.tom.cx, KIT.tom.top, KIT.tom.rx, KIT.tom.ry, KIT.tom.h)"
            :fill="fill('purple')"
          />
          <ellipse
            :cx="KIT.tom.cx"
            :cy="KIT.tom.top"
            :rx="KIT.tom.rx"
            :ry="KIT.tom.ry"
            fill="#f8fafc"
            stroke="#d1d5db"
            stroke-width="3"
          />
        </g>
        <g v-bind="area('floor')">
          <path
            :d="shell(KIT.floor.cx, KIT.floor.top, KIT.floor.rx, KIT.floor.ry, KIT.floor.h)"
            :fill="fill('purple')"
          />
          <ellipse
            :cx="KIT.floor.cx"
            :cy="KIT.floor.top"
            :rx="KIT.floor.rx"
            :ry="KIT.floor.ry"
            fill="#f8fafc"
            stroke="#d1d5db"
            stroke-width="3"
          />
        </g>
      </template>

      <!-- Part names -->
      <g
        v-for="l in labels"
        :key="l.area"
        pointer-events="none"
        :transform="`translate(${l.x} ${l.y})`"
      >
        <rect :x="-l.width / 2" y="-16" :width="l.width" height="32" rx="16" class="dp-pill" />
        <text text-anchor="middle" dominant-baseline="central" class="dp-pill-text">
          {{ l.text }}
        </text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
  .dp svg {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
    user-select: none;
    -webkit-user-select: none;
  }
  .dp.is-interactive svg {
    touch-action: none;
    -webkit-tap-highlight-color: transparent;
  }
  .dp :deep(.dp-area) {
    transition: filter 120ms ease-out;
  }
  .dp.is-interactive :deep(.dp-area) {
    cursor: pointer;
  }
  .dp.is-interactive :deep(.dp-area:focus-visible) {
    outline: none;
    filter: drop-shadow(0 0 6px #26217a) drop-shadow(0 0 2px #26217a);
  }
  /* Something the patient should look at: a strong, slowly pulsing yellow glow. */
  .dp :deep(.dp-area.is-cue) {
    animation: dp-cue 0.9s ease-in-out infinite alternate;
  }
  .dp :deep(.dp-area.is-good) {
    filter: brightness(1.15) drop-shadow(0 0 16px #16a34a) drop-shadow(0 0 6px #16a34a);
  }
  .dp :deep(.dp-area.is-lit) {
    filter: brightness(1.25) drop-shadow(0 0 14px #f97316);
    transition: none;
  }
  @keyframes dp-cue {
    from {
      filter: brightness(1.15) drop-shadow(0 0 10px #facc15) drop-shadow(0 0 4px #facc15);
    }
    to {
      filter: brightness(1.35) drop-shadow(0 0 22px #facc15) drop-shadow(0 0 8px #eab308);
    }
  }
  .dp-pill {
    fill: #ffffff;
    opacity: 0.92;
    stroke: #26217a;
    stroke-width: 2;
  }
  .dp-pill-text {
    fill: #26217a;
    font-size: 18px;
    font-weight: 700;
  }
  @media (prefers-reduced-motion: reduce) {
    .dp :deep(.dp-area) {
      transition: none;
    }
    .dp :deep(.dp-area.is-cue) {
      animation: none;
      filter: brightness(1.3) drop-shadow(0 0 18px #facc15) drop-shadow(0 0 6px #eab308);
    }
  }
</style>

<script setup lang="ts">
type Range = [number, number]

type PlantLevel = {
  title: string
  water: Range
  light: Range
  showTargets: boolean
  startHealth: number
  startGrowth: number
  goalGrowth: number
  startWater: number
  startLight: number
}

const levels: PlantLevel[] = [
  {
    title: 'First watering',
    water: [40, 70],
    light: [50, 80],
    showTargets: true,
    startHealth: 70,
    startGrowth: 8,
    goalGrowth: 28,
    startWater: 25,
    startLight: 35,
  },
  {
    title: 'Steady care',
    water: [45, 65],
    light: [55, 75],
    showTargets: true,
    startHealth: 70,
    startGrowth: 20,
    goalGrowth: 40,
    startWater: 30,
    startLight: 40,
  },
  {
    title: 'Find the balance',
    water: [42, 62],
    light: [48, 68],
    showTargets: true,
    startHealth: 70,
    startGrowth: 28,
    goalGrowth: 48,
    startWater: 30,
    startLight: 80,
  },
  {
    title: 'A careful week',
    water: [48, 62],
    light: [58, 72],
    showTargets: true,
    startHealth: 70,
    startGrowth: 42,
    goalGrowth: 64,
    startWater: 35,
    startLight: 85,
  },
  {
    title: 'Bring it to bloom',
    water: [50, 60],
    light: [60, 70],
    showTargets: true,
    startHealth: 70,
    startGrowth: 64,
    goalGrowth: 85,
    startWater: 40,
    startLight: 45,
  },
]

const levelIndex = ref(0)
const level = computed(() => levels[levelIndex.value] ?? levels[0]!)
const isLastLevel = computed(() => levelIndex.value >= levels.length - 1)

const day = ref(1)
const streak = ref(0)
const health = ref(70)
const growth = ref(8)
const water = ref(25)
const light = ref(35)
const message = ref("Set today's water and light, then advance.")
const bump = ref(false)
const levelComplete = ref(false)

function startLevel(index: number) {
  levelIndex.value = index
  const next = levels[index] ?? levels[0]!
  day.value = 1
  streak.value = 0
  health.value = next.startHealth
  growth.value = next.startGrowth
  water.value = next.startWater
  light.value = next.startLight
  levelComplete.value = false
  message.value = next.showTargets
    ? "Set today's water and light, then advance."
    : 'Find a steady water and light, then advance.'
}

function inRange(val: number, range: [number, number]) {
  return val >= range[0] && val <= range[1]
}

function missedCareMessage(waterValue: number, lightValue: number, waterIdeal: Range, lightIdeal: Range) {
  const issues = [
    waterValue < waterIdeal[0]
      ? { problem: 'too little water', fix: `raise water to ${waterIdeal[0]}–${waterIdeal[1]}%` }
      : waterValue > waterIdeal[1]
        ? { problem: 'too much water', fix: `lower water to ${waterIdeal[0]}–${waterIdeal[1]}%` }
        : null,
    lightValue < lightIdeal[0]
      ? { problem: 'too little light', fix: `raise light to ${lightIdeal[0]}–${lightIdeal[1]}%` }
      : lightValue > lightIdeal[1]
        ? { problem: 'too much light', fix: `lower light to ${lightIdeal[0]}–${lightIdeal[1]}%` }
        : null,
  ].filter((issue) => issue !== null)

  const problem = issues.map((issue) => issue.problem).join(' and ')
  const fix = issues.map((issue) => issue.fix).join(' and ')
  return `${problem.charAt(0).toUpperCase()}${problem.slice(1)}. ${fix.charAt(0).toUpperCase()}${fix.slice(1)}.`
}
function distanceOutside(val: number, range: [number, number]) {
  if (val < range[0]) return range[0] - val
  if (val > range[1]) return val - range[1]
  return 0
}

function leafSvg(
  x: number,
  y: number,
  angle: number,
  len: number,
  wid: number,
  fill: string,
  dark: string,
  vein: string
) {
  const shape = `M0 0 C ${wid} ${-len * 0.2}, ${wid * 0.85} ${-len * 0.7}, 0 ${-len} C ${-wid * 0.85} ${-len * 0.7}, ${-wid} ${-len * 0.2}, 0 0 Z`
  const half = `M0 0 C ${-wid} ${-len * 0.2}, ${-wid * 0.85} ${-len * 0.7}, 0 ${-len} Z`
  let veins = ''
  for (let k = 1; k <= 3; k++) {
    const vy = -len * 0.22 * k
    const reach = wid * (0.62 - k * 0.1)
    veins += `<path d="M0 ${vy} L${reach} ${vy - len * 0.12} M0 ${vy} L${-reach} ${vy - len * 0.12}" stroke="${vein}" stroke-width="0.7" fill="none" stroke-linecap="round" opacity="0.7"/>`
  }
  return (
    `<g transform="translate(${x} ${y}) rotate(${angle})">` +
    `<path d="${shape}" fill="${fill}"/>` +
    `<path d="${half}" fill="${dark}" opacity="0.35"/>` +
    `<path d="M0 0 L0 ${-len * 0.95}" stroke="${vein}" stroke-width="1.3" fill="none" stroke-linecap="round"/>` +
    veins +
    `</g>`
  )
}

function flowerSvg(fx: number, fy: number) {
  const petal = (len: number, wid: number) =>
    `M0 0 C ${wid} ${-len * 0.25}, ${wid * 0.9} ${-len * 0.8}, 0 ${-len} C ${-wid * 0.9} ${-len * 0.8}, ${-wid} ${-len * 0.25}, 0 0 Z`

  let out = `<g transform="translate(${fx} ${fy})">`
  const outer = petal(22, 9)
  for (let i = 0; i < 8; i++) {
    out += `<path d="${outer}" transform="rotate(${i * 45})" fill="#E58FB0" stroke="#D06F96" stroke-width="0.7"/>`
  }
  const inner = petal(15, 6.5)
  for (let i = 0; i < 8; i++) {
    out += `<path d="${inner}" transform="rotate(${i * 45 + 22.5})" fill="#F6C1D5" stroke="#E89AB8" stroke-width="0.5"/>`
  }
  out += `<circle r="5.5" fill="#E8B23D"/>`
  for (let d = 0; d < 7; d++) {
    const a = (d / 7) * Math.PI * 2
    out += `<circle cx="${Math.cos(a) * 3}" cy="${Math.sin(a) * 3}" r="0.9" fill="#B8862A"/>`
  }
  out += `<circle r="1.2" fill="#B8862A"/></g>`
  return out
}

function budSvg(bx: number, by: number) {
  return (
    `<g transform="translate(${bx} ${by})">` +
    `<path d="M0 0 C 8 -4, 7 -16, 0 -20 C -7 -16, -8 -4, 0 0 Z" fill="#E58FB0" stroke="#D06F96" stroke-width="0.7"/>` +
    `<path d="M0 0 C 3 -5, 3 -13, 0 -18" stroke="#F6C1D5" stroke-width="1.2" fill="none"/>` +
    `<path d="M0 2 C -9 -2, -8 -8, -3 -10 M0 2 C 9 -2, 8 -8, 3 -10" stroke="#3F7A3F" stroke-width="2" fill="none" stroke-linecap="round"/>` +
    `</g>`
  )
}

const plantSvg = computed(() => {
  const g = Math.max(0, Math.min(100, growth.value))
  const h = Math.max(0, Math.min(100, health.value))
  const healthy = h >= 55
  const mid = h >= 30

  const leafFill = healthy ? '#5E9A52' : mid ? '#C9A14A' : '#A98A5E'
  const leafDark = healthy ? '#3F7A3F' : mid ? '#9C7A2E' : '#7A6444'
  const leafVein = healthy ? '#2F5F35' : mid ? '#7A5F22' : '#5C4A33'
  const stemColor = healthy ? '#3F6B4A' : '#7A6A4F'
  const droop = healthy ? 0 : (30 - Math.max(h, 0)) * 0.9
  const droopAngle = healthy ? 0 : mid ? 18 : 40

  const stemHeight = 30 + g * 1.1
  const hasFlower = g >= 85 && healthy
  const hasBud = g >= 60 && g < 85 && healthy

  const parts: string[] = []

  parts.push('<path d="M52 168 L108 168 L102 194 Q80 198 58 194 Z" fill="#B5684A"/>')
  parts.push('<rect x="49" y="164" width="62" height="9" rx="3" fill="#C97B5A"/>')
  parts.push('<ellipse cx="80" cy="166" rx="26" ry="3" fill="#5A3E2B"/>')

  const baseX = 80
  const baseY = 168
  const tipY = baseY - stemHeight
  const ctrlX = baseX + droop
  const ctrlY = (baseY + tipY) / 2
  const endX = baseX + droop

  parts.push(
    `<path d="M ${baseX} ${baseY} Q ${ctrlX} ${ctrlY} ${endX} ${tipY}" stroke="${stemColor}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`
  )

  const pointAt = (t: number) => {
    const u = 1 - t
    return {
      x: u * u * baseX + 2 * u * t * ctrlX + t * t * endX,
      y: u * u * baseY + 2 * u * t * ctrlY + t * t * tipY,
    }
  }

  const leafCount = Math.min(12, 2 + Math.floor(g / 10))
  for (let i = 0; i < leafCount; i++) {
    const t = 0.2 + 0.72 * (i / Math.max(1, leafCount - 1 || 1))
    const { x, y } = pointAt(Math.min(t, 0.95))
    const side = i % 2 === 0 ? -1 : 1
    const len = (20 + g * 0.18) * (1 - 0.4 * t)
    const wid = len * 0.42
    const angle = side * (52 + droopAngle)
    parts.push(leafSvg(x, y, angle, len, wid, leafFill, leafDark, leafVein))
  }

  if (hasFlower) {
    parts.push(flowerSvg(endX, tipY - 4))
  } else if (hasBud) {
    parts.push(budSvg(endX, tipY + 2))
  } else {
    const len = 12 + g * 0.1
    parts.push(leafSvg(endX, tipY + 2, -22 - droopAngle, len, len * 0.42, leafFill, leafDark, leafVein))
    parts.push(leafSvg(endX, tipY + 2, 22 + droopAngle, len, len * 0.42, leafFill, leafDark, leafVein))
  }

  return parts.join('')
})

function resetRitual() {
  startLevel(levelIndex.value)
}

function advanceDay() {
  if (levelComplete.value) return

  const w = water.value
  const l = light.value
  const waterIdeal = level.value.water
  const lightIdeal = level.value.light

  const waterGood = inRange(w, waterIdeal)
  const lightGood = inRange(l, lightIdeal)

  if (waterGood && lightGood) {
    streak.value += 1
    health.value = Math.min(100, health.value + 5)
    growth.value = Math.min(100, growth.value + 3 + Math.min(streak.value, 5) * 0.4)
    message.value = streak.value >= 3 ? 'The consistency is showing.' : 'A good, steady day.'
  } else {
    const off = distanceOutside(w, waterIdeal) + distanceOutside(l, lightIdeal)
    streak.value = 0
    health.value = Math.max(0, health.value - Math.min(18, 4 + off * 0.3))
    message.value = missedCareMessage(w, l, waterIdeal, lightIdeal)
  }

  day.value += 1

  if (growth.value >= level.value.goalGrowth && health.value >= 55) {
    levelComplete.value = true
    message.value = isLastLevel.value
      ? 'Every level is complete. The plant is in bloom.'
      : 'This level is complete.'
  }

  bump.value = true
  setTimeout(() => (bump.value = false), 300)
}

onMounted(() => {
  startLevel(0)
})

const btnBase =
  'inline-flex min-h-[56px] w-full items-center justify-center rounded-2xl px-6 py-3 text-lg font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none'
const btnPrimary = `${btnBase} bg-orange-700 text-white hover:bg-orange-800`
const btnQuiet = `${btnBase} border-2 border-slate-400 bg-white text-[var(--bn-navy)] hover:bg-slate-50`
</script>

<template>
  <div class="space-y-6 text-[var(--bn-navy)]">
    <section
      aria-labelledby="plant-care-title"
      class="rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 text-center sm:p-10"
    >
      <p class="text-lg font-bold tracking-wide text-orange-800 uppercase">
        Plant care · Level {{ levelIndex + 1 }} of {{ levels.length }}
      </p>
      <h2 id="plant-care-title" class="bn-font-display mt-2 text-3xl font-bold">{{ level.title }}</h2>
      <div class="mt-4 flex justify-center gap-2" aria-hidden="true">
        <span
          v-for="(_, i) in levels"
          :key="i"
          class="h-2 w-10 rounded-full"
          :class="i < levelIndex ? 'bg-orange-700' : i === levelIndex ? 'bg-[var(--bn-navy)]' : 'bg-white'"
        />
      </div>
      <p class="bn-font-display mt-6 text-2xl font-bold">Day {{ day }}</p>
      <p class="mt-1 text-lg text-[var(--bn-muted)]">
        <span v-if="streak > 0" class="font-semibold text-[var(--bn-navy)]">{{ streak }} day{{ streak === 1 ? '' : 's' }}</span>
        <span v-if="streak > 0"> of steady care.</span>
        <span v-else>Today starts a fresh streak.</span>
      </p>
      <div class="mt-6 flex h-[220px] items-end justify-center">
        <svg
          width="160"
          height="200"
          viewBox="0 0 160 200"
          class="overflow-visible transition-transform duration-300"
          :class="bump ? 'scale-[1.04]' : 'scale-100'"
          v-html="plantSvg"
        />
      </div>
      <p class="mt-5 min-h-[3rem] text-xl leading-relaxed text-[var(--bn-navy)]" aria-live="polite">
        {{ message }}
      </p>
    </section>

    <section aria-label="Water and light" class="rounded-[20px] border border-[var(--bn-border)] bg-white p-6">
      <div>
        <div class="flex items-center justify-between text-lg">
          <label for="plant-water" class="font-semibold">Water</label>
          <span class="font-bold tabular-nums">{{ water }}%</span>
        </div>
        <input
          id="plant-water"
          v-model.number="water"
          type="range"
          min="0"
          max="100"
          class="mt-4 h-3 w-full cursor-pointer accent-orange-700"
          :aria-valuetext="`${water} percent water`"
        />
        <p v-if="level.showTargets" class="mt-2 text-lg text-[var(--bn-muted)]">
          Aim for {{ level.water[0] }}–{{ level.water[1] }}%
        </p>
      </div>

      <div class="mt-6">
        <div class="flex items-center justify-between text-lg">
          <label for="plant-light" class="font-semibold">Light</label>
          <span class="font-bold tabular-nums">{{ light }}%</span>
        </div>
        <input
          id="plant-light"
          v-model.number="light"
          type="range"
          min="0"
          max="100"
          class="mt-4 h-3 w-full cursor-pointer accent-orange-700"
          :aria-valuetext="`${light} percent light`"
        />
        <p v-if="level.showTargets" class="mt-2 text-lg text-[var(--bn-muted)]">
          Aim for {{ level.light[0] }}–{{ level.light[1] }}%
        </p>
      </div>

      <div class="mt-6 flex flex-col gap-3">
        <button
          v-if="!levelComplete"
          type="button"
          :class="btnPrimary"
          @click="advanceDay"
        >
          Advance the day
        </button>
        <button
          v-else
          type="button"
          :class="btnPrimary"
          @click="startLevel(isLastLevel ? 0 : levelIndex + 1)"
        >
          {{ isLastLevel ? 'Play again' : 'Next level' }}
        </button>
        <button type="button" :class="btnQuiet" @click="resetRitual">Reset</button>
      </div>

      <div class="mt-6">
        <div class="h-2 overflow-hidden rounded-full bg-[var(--bn-peach)]">
          <div
            class="h-full rounded-full bg-orange-700 transition-all duration-500"
            :style="{ width: Math.max(0, Math.min(100, health)) + '%' }"
          />
        </div>
        <div class="mt-2 flex justify-between text-lg text-[var(--bn-muted)]">
          <span>Health</span>
          <span>{{ Math.round(health) }}%</span>
        </div>
      </div>
    </section>
  </div>
</template>

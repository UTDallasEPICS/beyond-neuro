<script setup lang="ts">
const navItems = [
  { label: 'Home', icon: 'i-lucide-home' },
  { label: 'Exercises', icon: 'i-lucide-footprints', active: true },
  { label: 'My Progress', icon: 'i-lucide-line-chart' },
  { label: 'Learn', icon: 'i-lucide-book-open' },
  { label: 'Caregiver Corner', icon: 'i-lucide-map-pin' },
]

const WATER_IDEAL: [number, number] = [40, 70]
const LIGHT_IDEAL: [number, number] = [50, 80]

const day = ref(1)
const streak = ref(0)
const health = ref(70)
const growth = ref(4)
const water = ref(50)
const light = ref(60)
const message = ref("Set today's water and light, then advance.")
const bump = ref(false)

function inRange(val: number, range: [number, number]) {
  return val >= range[0] && val <= range[1]
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
  day.value = 1
  streak.value = 0
  health.value = 70
  growth.value = 4
  water.value = 50
  light.value = 60
  message.value = "Set today's water and light, then advance."
}

function advanceDay() {
  const w = water.value
  const l = light.value

  const waterGood = inRange(w, WATER_IDEAL)
  const lightGood = inRange(l, LIGHT_IDEAL)

  if (waterGood && lightGood) {
    streak.value += 1
    health.value = Math.min(100, health.value + 5)
    growth.value = Math.min(100, growth.value + 3 + Math.min(streak.value, 5) * 0.4)
    message.value = streak.value >= 3 ? 'The consistency is showing.' : 'A good, steady day.'
  } else {
    const off = distanceOutside(w, WATER_IDEAL) + distanceOutside(l, LIGHT_IDEAL)
    streak.value = 0
    health.value = Math.max(0, health.value - Math.min(18, 4 + off * 0.3))
    if (!waterGood && !lightGood) message.value = 'Water and light both drifted off today.'
    else if (!waterGood) message.value = w < WATER_IDEAL[0] ? 'A little thirsty today.' : 'A bit too much water today.'
    else message.value = l < LIGHT_IDEAL[0] ? 'Could have used more light.' : 'A little too much sun today.'
  }

  day.value += 1

  bump.value = true
  setTimeout(() => (bump.value = false), 300)
}
</script>

<template>
  <div class="app-shell flex min-h-screen">
    <aside class="flex w-64 shrink-0 flex-col bg-[#1E1B4B] p-5 text-white">
      <div class="flex items-center gap-2 px-2 py-3">
        <img
          src="../assets/images/BeyondNeuro_Color_White.png"
          alt="Beyond Neuro Logo"
          class="h-6 w-auto"
        />
      </div>

      <nav class="mt-6 flex flex-col gap-1">
        <button
          v-for="item in navItems"
          :key="item.label"
          type="button"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
          :class="
            item.active
              ? 'bg-white text-[#1E1B4B]'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
          "
        >
          <UIcon :name="item.icon" class="h-4 w-4" />
          {{ item.label }}
        </button>
      </nav>

      <div class="mt-auto rounded-2xl bg-white/10 p-4">
        <p class="text-sm font-bold text-emerald-300">Take your time</p>
        <p class="mt-1 text-xs leading-5 text-slate-300">
          Pause whenever you need. Your progress is saved.
        </p>
      </div>
    </aside>

    <main class="flex flex-1 items-center justify-center bg-[#FBEEE0] px-10 py-8">
      <div class="w-full max-w-md rounded-[28px] border border-[#c9c0f5] bg-[#EAE6FB] p-9 text-center shadow-sm">
        <p class="font-['Georgia'] text-2xl font-bold text-[#1E1B4B]">Day {{ day }}</p>
        <p class="mt-1 mb-7 text-sm text-slate-500">
          <span v-if="streak > 0" class="font-semibold text-[#1E1B4B]">{{ streak }} day{{ streak === 1 ? '' : 's' }}</span>
          <span v-if="streak > 0"> of steady care.</span>
          <span v-else>Today starts a fresh streak.</span>
        </p>

        <div class="flex h-[220px] items-end justify-center">
          <svg
            width="160"
            height="200"
            viewBox="0 0 160 200"
            class="overflow-visible transition-transform duration-300"
            :class="bump ? 'scale-[1.04]' : 'scale-100'"
            v-html="plantSvg"
          />
        </div>

        <p class="mt-5 mb-7 min-h-[1.4em] font-['Georgia'] text-base text-slate-500 italic">
          {{ message }}
        </p>

        <div class="rounded-2xl bg-white p-6 text-left">
          <div class="mb-5">
            <div class="flex justify-between text-sm text-slate-500">
              <span>Water</span>
              <span class="font-semibold tabular-nums text-[#1E1B4B]">{{ water }}%</span>
            </div>
            <input
              v-model.number="water"
              type="range"
              min="0"
              max="100"
              class="mt-2 h-1.5 w-full cursor-pointer accent-emerald-500"
            />
          </div>

          <div class="mb-5">
            <div class="flex justify-between text-sm text-slate-500">
              <span>Light</span>
              <span class="font-semibold tabular-nums text-[#1E1B4B]">{{ light }}%</span>
            </div>
            <input
              v-model.number="light"
              type="range"
              min="0"
              max="100"
              class="mt-2 h-1.5 w-full cursor-pointer accent-emerald-500"
            />
          </div>

          <button
            type="button"
            class="w-full rounded-full bg-[#1E1B4B] py-3 text-sm font-semibold text-white transition hover:bg-[#2a2566]"
            @click="advanceDay"
          >
            Advance the day
          </button>

          <button
            type="button"
            class="mt-2 w-full rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
            @click="resetRitual"
          >
            Reset
          </button>

          <div class="mt-5 h-[5px] overflow-hidden rounded-full bg-[#DCD4F5]">
            <div
              class="h-full rounded-full bg-emerald-400 transition-all duration-500"
              :style="{ width: Math.max(0, Math.min(100, health)) + '%' }"
            />
          </div>
          <div class="mt-1 flex justify-between text-xs text-slate-400">
            <span>Health</span>
            <span>{{ Math.round(health) }}%</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
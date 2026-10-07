<script setup lang="ts">
const navItems = [
  { label: 'Home', icon: 'i-lucide-home' },
  { label: 'Exercises', icon: 'i-lucide-footprints', active: true },
  { label: 'My Progress', icon: 'i-lucide-line-chart' },
  { label: 'Learn', icon: 'i-lucide-book-open' },
  { label: 'Caregiver Corner', icon: 'i-lucide-map-pin' },
]

const STORAGE_KEY = 'plant-ritual-state-v1'
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

onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (typeof parsed.day === 'number') {
        day.value = parsed.day
        streak.value = parsed.streak
        health.value = parsed.health
        growth.value = parsed.growth
        water.value = parsed.water
        light.value = parsed.light
      }
    }
  } catch {
    // storage unavailable — start fresh
  }
})

function save() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        day: day.value,
        streak: streak.value,
        health: health.value,
        growth: growth.value,
        water: water.value,
        light: light.value,
      })
    )
  } catch {
    // ignore
  }
}

function inRange(val: number, range: [number, number]) {
  return val >= range[0] && val <= range[1]
}
function distanceOutside(val: number, range: [number, number]) {
  if (val < range[0]) return range[0] - val
  if (val > range[1]) return val - range[1]
  return 0
}



const plantSvg = computed(() => {
  const g = Math.max(0, Math.min(100, growth.value))
  const h = Math.max(0, Math.min(100, health.value))
  const healthy = h >= 55
  const leafColor = healthy ? '#7FA66B' : h >= 30 ? '#C9A14A' : '#A98A5E'
  const stemColor = healthy ? '#3F6B4A' : '#7A6A4F'
  const droop = healthy ? 0 : (30 - Math.max(h, 0)) * 0.9

  const stemHeight = 30 + g * 1.1
  const leafPairs = 1 + Math.floor(g / 22)
  const hasFlower = g >= 85 && healthy

  const parts: string[] = []
  parts.push('<rect x="55" y="180" width="50" height="14" rx="3" fill="#6B4F3A"/>')
  parts.push('<rect x="60" y="168" width="40" height="14" rx="2" fill="#7A5B43"/>')

  const baseX = 80
  const baseY = 178
  const tipY = baseY - stemHeight
  parts.push(
    `<path d="M ${baseX} ${baseY} Q ${baseX + droop} ${(baseY + tipY) / 2} ${baseX + droop} ${tipY}" stroke="${stemColor}" stroke-width="5" fill="none" stroke-linecap="round"/>`
  )

  for (let i = 0; i < leafPairs; i++) {
    const t = (i + 1) / (leafPairs + 0.4)
    const y = baseY - stemHeight * t
    const x = baseX + droop * t
    const size = 16 + (g / 100) * 14
    const sway = 24 + droop * 0.6
    parts.push(
      `<path d="M ${x} ${y} Q ${x - sway} ${y - size * 0.3} ${x - sway * 0.2} ${y - size} Q ${x + 6} ${y - size * 0.4} ${x} ${y}" fill="${leafColor}"/>`
    )
    parts.push(
      `<path d="M ${x} ${y} Q ${x + sway} ${y - size * 0.3} ${x + sway * 0.2} ${y - size} Q ${x - 6} ${y - size * 0.4} ${x} ${y}" fill="${leafColor}"/>`
    )
  }

  if (hasFlower) {
    const fx = baseX + droop
    const fy = tipY - 6
    let petals = ''
    for (let p = 0; p < 5; p++) {
      const angle = (p / 5) * Math.PI * 2
      const px = fx + Math.cos(angle) * 10
      const py = fy + Math.sin(angle) * 10
      petals += `<circle cx="${px}" cy="${py}" r="7" fill="#E7C9DE"/>`
    }
    parts.push(petals + `<circle cx="${fx}" cy="${fy}" r="6" fill="#C9A14A"/>`)
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
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
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
  save()

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
            class="transition-transform duration-300"
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
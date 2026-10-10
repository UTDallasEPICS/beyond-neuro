<script setup lang="ts">
const navItems = [
  { label: 'Home', icon: 'i-lucide-home' },
  { label: 'Exercises', icon: 'i-lucide-footprints', active: true },
  { label: 'My Progress', icon: 'i-lucide-line-chart' },
  { label: 'Learn', icon: 'i-lucide-book-open' },
  { label: 'Caregiver Corner', icon: 'i-lucide-map-pin' },
]

type FlowerType = 'rose' | 'tulip' | 'daisy' | 'sunflower' | 'lily' | 'lavender'
type Pot = { type: FlowerType; planted: boolean }

const flowerLabels: Record<FlowerType, string> = {
  rose: 'Rose',
  tulip: 'Tulip',
  daisy: 'Daisy',
  sunflower: 'Sunflower',
  lily: 'Lily',
  lavender: 'Lavender',
}

const levels: { types: FlowerType[]; showLabel: boolean; silhouette: number }[] = [
  { types: ['rose'], showLabel: true, silhouette: 0.4 },
  { types: ['rose', 'tulip'], showLabel: true, silhouette: 0.4 },
  { types: ['rose', 'tulip', 'daisy'], showLabel: true, silhouette: 0 },
  { types: ['rose', 'tulip', 'daisy', 'sunflower'], showLabel: false, silhouette: 0.3 },
  {
    types: ['rose', 'tulip', 'daisy', 'sunflower', 'lily', 'lavender'],
    showLabel: false,
    silhouette: 0.15,
  },
]

const flowerSvg: Record<FlowerType, string> = {
  rose: `
    <circle cx="30" cy="28" r="14" fill="#C2577A"/>
    <circle cx="30" cy="28" r="10" fill="#D6788F"/>
    <circle cx="30" cy="28" r="6" fill="#E89BAA"/>
    <path d="M30 42 Q26 50 30 58" stroke="#3F6B4A" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M28 48 Q20 46 18 40" stroke="#3F6B4A" stroke-width="3" fill="none" stroke-linecap="round"/>
  `,
  tulip: `
    <path d="M30 14 C18 14 18 30 30 34 C42 30 42 14 30 14Z" fill="#D6476B"/>
    <path d="M30 18 C24 18 24 28 30 31" fill="#B13A58"/>
    <path d="M30 34 L30 58" stroke="#3F6B4A" stroke-width="3" stroke-linecap="round"/>
    <path d="M30 46 Q20 44 17 36" stroke="#3F6B4A" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M30 50 Q40 48 43 40" stroke="#3F6B4A" stroke-width="3" fill="none" stroke-linecap="round"/>
  `,
  daisy: `
    <g fill="#FAFAF5" stroke="#E7E4D8" stroke-width="1">
      <ellipse cx="30" cy="14" rx="5" ry="10"/>
      <ellipse cx="30" cy="42" rx="5" ry="10"/>
      <ellipse cx="16" cy="28" rx="10" ry="5"/>
      <ellipse cx="44" cy="28" rx="10" ry="5"/>
      <ellipse cx="20" cy="18" rx="5" ry="10" transform="rotate(-45 20 18)"/>
      <ellipse cx="40" cy="18" rx="5" ry="10" transform="rotate(45 40 18)"/>
      <ellipse cx="20" cy="38" rx="5" ry="10" transform="rotate(45 20 38)"/>
      <ellipse cx="40" cy="38" rx="5" ry="10" transform="rotate(-45 40 38)"/>
    </g>
    <circle cx="30" cy="28" r="7" fill="#E8B23D"/>
    <path d="M30 46 L30 58" stroke="#3F6B4A" stroke-width="3" stroke-linecap="round"/>
  `,
  sunflower: `
    <g fill="#F2C14E">
      <ellipse cx="30" cy="12" rx="5" ry="11"/>
      <ellipse cx="30" cy="44" rx="5" ry="11"/>
      <ellipse cx="12" cy="28" rx="11" ry="5"/>
      <ellipse cx="48" cy="28" rx="11" ry="5"/>
      <ellipse cx="18" cy="16" rx="5" ry="11" transform="rotate(-45 18 16)"/>
      <ellipse cx="42" cy="16" rx="5" ry="11" transform="rotate(45 42 16)"/>
      <ellipse cx="18" cy="40" rx="5" ry="11" transform="rotate(45 18 40)"/>
      <ellipse cx="42" cy="40" rx="5" ry="11" transform="rotate(-45 42 40)"/>
    </g>
    <circle cx="30" cy="28" r="9" fill="#6B4F3A"/>
    <path d="M30 48 L30 58" stroke="#3F6B4A" stroke-width="3" stroke-linecap="round"/>
  `,
  lily: `
    <g transform="translate(30 28)">
      ${Array.from({ length: 6 }, (_, i) => `<path d="M0 0 C 7 -6, 7 -17, 0 -23 C -7 -17, -7 -6, 0 0 Z" transform="rotate(${i * 60})" fill="#F4A6C0" stroke="#D9799C" stroke-width="0.8"/>`).join('')}
      <circle r="3.5" fill="#F2C14E"/>
    </g>
    <path d="M30 46 L30 58" stroke="#3F6B4A" stroke-width="3" stroke-linecap="round"/>
  `,
  lavender: `
    <path d="M30 58 L30 16" stroke="#3F6B4A" stroke-width="2.5" stroke-linecap="round"/>
    ${Array.from({ length: 6 }, (_, i) => `<ellipse cx="${i % 2 === 0 ? 25 : 35}" cy="${16 + i * 6}" rx="4" ry="5.5" fill="#8C6FC9"/>`).join('')}
    <ellipse cx="30" cy="10" rx="3.5" ry="5" fill="#A68BE0"/>
  `,
}

const potShape = `
  <rect x="11" y="52" width="38" height="7" rx="2" fill="#C97B5A"/>
  <path d="M14 59 L18 76 Q30 80 42 76 L46 59 Z" fill="#B5684A"/>
`

const levelIndex = ref(0)
const pots = ref<Pot[]>([])
const tray = ref<FlowerType[]>([])
const selected = ref<FlowerType | null>(null)
const shakePot = ref<FlowerType | null>(null)
const mistakes = ref(0)
const message = ref('')

const level = computed(() => levels[levelIndex.value] ?? levels[0]!)
const isLastLevel = computed(() => levelIndex.value >= levels.length - 1)
const plantedCount = computed(() => pots.value.filter((p) => p.planted).length)
const levelComplete = computed(
  () => pots.value.length > 0 && plantedCount.value === pots.value.length
)
const stars = computed(() => (mistakes.value === 0 ? 3 : mistakes.value <= 2 ? 2 : 1))
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${Math.min(pots.value.length || 1, 3)}, minmax(0, 1fr))`,
}))

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const a = copy[i] as T
    const b = copy[j] as T
    copy[i] = b
    copy[j] = a
  }
  return copy
}

function startLevel(index: number) {
  levelIndex.value = index
  const types = (levels[index] ?? levels[0]!).types
  pots.value = shuffle(types).map((type) => ({ type, planted: false }))
  tray.value = shuffle(types)
  selected.value = null
  shakePot.value = null
  mistakes.value = 0
  message.value =
    types.length === 1 ? 'Match the flower to its pot.' : 'Match each flower to its own pot.'
}

function isPlanted(type: FlowerType) {
  return pots.value.find((p) => p.type === type)?.planted ?? false
}

function selectFlower(type: FlowerType) {
  if (isPlanted(type)) return
  selected.value = selected.value === type ? null : type
}

function plant(pot: Pot) {
  const flower = selected.value
  if (!flower || pot.planted) return

  if (flower === pot.type) {
    pot.planted = true
    selected.value = null
    message.value = levelComplete.value ? 'Level complete.' : 'Matched.'
  } else {
    mistakes.value += 1
    shakePot.value = pot.type
    message.value = 'That flower belongs in a different pot. Try again.'
    setTimeout(() => {
      shakePot.value = null
    }, 400)
  }
}

function potMarkup(pot: Pot) {
  const flower = flowerSvg[pot.type]
  if (pot.planted) return `<g transform="translate(0 -2)">${flower}</g>${potShape}`
  if (level.value.silhouette === 0) return potShape
  return `<g opacity="${level.value.silhouette}" style="filter: grayscale(1)" transform="translate(0 -2)">${flower}</g>${potShape}`
}

onMounted(() => {
  startLevel(0)
})
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

    <main class="flex-1 bg-[#FBEEE0] px-10 py-8">
      <header class="mb-6">
        <p class="text-sm font-semibold tracking-[0.2em] text-emerald-600 uppercase">
          Garden Activity · Level {{ levelIndex + 1 }} of {{ levels.length }}
        </p>
        <h1 class="mt-2 font-['Georgia'] text-4xl font-black tracking-tight text-[#1E1B4B]">
          Match each flower to its pot
        </h1>
        <p class="mt-2 max-w-xl text-slate-600">
          Drag a flower onto its pot, or tap a flower and then tap the pot.
        </p>

        <div class="mt-4 flex gap-2">
          <span
            v-for="(_, i) in levels"
            :key="i"
            class="h-2 w-10 rounded-full transition"
            :class="i < levelIndex ? 'bg-emerald-500' : i === levelIndex ? 'bg-[#1E1B4B]' : 'bg-[#c9c0f5]'"
          />
        </div>
      </header>

      <section class="rounded-3xl bg-[#EAE6FB] p-10 shadow-sm">
        <div class="mx-auto grid max-w-2xl gap-5" :style="gridStyle">
          <div
            v-for="pot in pots"
            :key="pot.type"
            class="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 transition"
            :class="[
              pot.planted ? 'border-emerald-400 bg-white' : 'border-[#c9c0f5] bg-white/50',
              selected && !pot.planted ? 'cursor-pointer hover:border-[#1E1B4B]' : '',
              shakePot === pot.type ? 'animate-shake' : '',
            ]"
            @dragover.prevent
            @drop="plant(pot)"
            @click="plant(pot)"
          >
            <svg width="72" height="98" viewBox="0 0 60 82" v-html="potMarkup(pot)" />
            <span class="h-4 text-xs font-semibold text-[#1E1B4B]">
              {{ level.showLabel || pot.planted ? flowerLabels[pot.type] : '' }}
            </span>
          </div>
        </div>

        <div v-if="!levelComplete" class="mt-10 flex flex-wrap justify-center gap-4">
          <div
            v-for="type in tray"
            :key="type"
            class="flex flex-col items-center gap-1 rounded-2xl border bg-white px-6 py-4 transition"
            :class="[
              isPlanted(type)
                ? 'pointer-events-none opacity-30'
                : 'cursor-grab hover:shadow-md active:cursor-grabbing',
              selected === type ? 'border-[#1E1B4B] ring-2 ring-[#1E1B4B]/30' : 'border-[#c9c0f5]',
            ]"
            :draggable="!isPlanted(type)"
            @dragstart="selected = type"
            @click="selectFlower(type)"
          >
            <svg width="44" height="44" viewBox="0 0 60 60" v-html="flowerSvg[type]" />
            <span class="text-xs font-medium text-slate-500">{{ flowerLabels[type] }}</span>
          </div>
        </div>

        <div v-else class="mt-10 text-center">
          <p class="font-['Georgia'] text-2xl font-bold text-[#1E1B4B]">
            {{ isLastLevel ? 'All levels complete' : `Level ${levelIndex + 1} complete` }}
          </p>
          <p class="mt-2 text-2xl tracking-widest text-amber-500">
            {{ '★'.repeat(stars) }}<span class="text-[#c9c0f5]">{{ '★'.repeat(3 - stars) }}</span>
          </p>
          <p class="mt-1 text-sm text-slate-500">
            {{ mistakes === 0 ? 'No mistakes.' : `${mistakes} mistake${mistakes === 1 ? '' : 's'}.` }}
          </p>
          <button
            type="button"
            class="mt-5 rounded-full bg-[#1E1B4B] px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a2566]"
            @click="startLevel(isLastLevel ? 0 : levelIndex + 1)"
          >
            {{ isLastLevel ? 'Play again' : 'Next level' }}
          </button>
        </div>

        <p class="mt-8 text-center text-sm text-slate-500">{{ message }}</p>

        <div class="mt-6 flex items-center justify-center gap-4">
          <span class="text-xs font-semibold tracking-wide text-slate-400 uppercase">
            {{ plantedCount }} / {{ pots.length }} matched · {{ mistakes }} mistake{{ mistakes === 1 ? '' : 's' }}
          </span>
          <button
            type="button"
            class="rounded-full border border-[#1E1B4B] px-5 py-1.5 text-xs font-semibold text-[#1E1B4B] transition hover:bg-[#1E1B4B] hover:text-white"
            @click="startLevel(levelIndex)"
          >
            Restart level
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-6px);
  }
  75% {
    transform: translateX(6px);
  }
}
.animate-shake {
  animation: shake 0.3s ease-in-out;
}
</style>
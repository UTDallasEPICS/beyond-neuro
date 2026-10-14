<script setup lang="ts">
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

const btnBase =
  'inline-flex min-h-[56px] items-center justify-center rounded-2xl px-6 py-3 text-lg font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none'
const btnPrimary = `${btnBase} bg-orange-700 text-white hover:bg-orange-800`
const btnQuiet = `${btnBase} border-2 border-slate-400 bg-white text-[var(--bn-navy)] hover:bg-slate-50`
</script>

<template>
  <section
    aria-labelledby="garden-title"
    class="rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 sm:p-10"
  >
    <p class="text-lg font-bold tracking-wide text-orange-800 uppercase">
      Garden matching · Level {{ levelIndex + 1 }} of {{ levels.length }}
    </p>
    <h2 id="garden-title" class="bn-font-display mt-2 text-3xl font-bold text-[var(--bn-navy)]">
      Match each flower to its pot
    </h2>
    <p class="mt-2 max-w-xl text-lg leading-relaxed text-[var(--bn-muted)]">
      Drag a flower onto its pot, or tap a flower and then tap the pot.
    </p>
    <div class="mt-4 flex gap-2" aria-hidden="true">
      <span
        v-for="(_, i) in levels"
        :key="i"
        class="h-2 w-10 rounded-full"
        :class="i < levelIndex ? 'bg-orange-700' : i === levelIndex ? 'bg-[var(--bn-navy)]' : 'bg-white'"
      />
    </div>

    <div class="mx-auto mt-8 grid max-w-2xl gap-5" :style="gridStyle">
      <div
        v-for="pot in pots"
        :key="pot.type"
        class="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed bg-white/70 p-4 transition"
        :class="[
          pot.planted ? 'border-orange-700 bg-white' : 'border-[var(--bn-border)]',
          selected && !pot.planted ? 'cursor-pointer hover:border-[var(--bn-navy)]' : '',
          shakePot === pot.type ? 'animate-shake' : '',
        ]"
        @dragover.prevent
        @drop="plant(pot)"
        @click="plant(pot)"
      >
        <svg width="72" height="98" viewBox="0 0 60 82" v-html="potMarkup(pot)" />
        <span class="h-6 text-lg font-semibold text-[var(--bn-navy)]">
          {{ level.showLabel || pot.planted ? flowerLabels[pot.type] : '' }}
        </span>
      </div>
    </div>

    <div v-if="!levelComplete" class="mt-8 flex flex-wrap justify-center gap-4">
      <button
        v-for="type in tray"
        :key="type"
        type="button"
        class="flex min-h-[56px] flex-col items-center gap-1 rounded-2xl border-2 bg-white px-6 py-4 focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
        :class="[
          isPlanted(type) ? 'pointer-events-none opacity-30' : 'cursor-grab active:cursor-grabbing',
          selected === type ? 'border-[var(--bn-navy)]' : 'border-[var(--bn-border)]',
        ]"
        :draggable="!isPlanted(type)"
        :aria-pressed="selected === type"
        @dragstart="selected = type"
        @click="selectFlower(type)"
      >
        <svg width="44" height="44" viewBox="0 0 60 60" v-html="flowerSvg[type]" />
        <span class="text-lg text-[var(--bn-navy)]">{{ flowerLabels[type] }}</span>
      </button>
    </div>

    <div v-else class="mt-8 text-center">
      <p class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">
        {{ isLastLevel ? 'All levels complete' : `Level ${levelIndex + 1} complete` }}
      </p>
      <p class="mt-2 text-2xl tracking-widest text-orange-700" :aria-label="`${stars} of 3 stars`">
        {{ '★'.repeat(stars) }}<span class="text-[var(--bn-border)]">{{ '★'.repeat(3 - stars) }}</span>
      </p>
      <p class="mt-1 text-lg text-[var(--bn-muted)]">
        {{ mistakes === 0 ? 'No mistakes.' : `${mistakes} mistake${mistakes === 1 ? '' : 's'}.` }}
      </p>
      <button
        type="button"
        class="mt-5"
        :class="btnPrimary"
        @click="startLevel(isLastLevel ? 0 : levelIndex + 1)"
      >
        {{ isLastLevel ? 'Play again' : 'Next level' }}
      </button>
    </div>

    <p class="mt-8 text-center text-xl text-[var(--bn-navy)]" aria-live="polite">{{ message }}</p>
    <div class="mt-6 flex flex-wrap items-center justify-center gap-4">
      <span class="text-lg font-semibold text-[var(--bn-muted)]">
        {{ plantedCount }} / {{ pots.length }} matched · {{ mistakes }} mistake{{ mistakes === 1 ? '' : 's' }}
      </span>
      <button type="button" :class="btnQuiet" @click="startLevel(levelIndex)">Restart level</button>
    </div>
  </section>
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

<script setup lang="ts">
type FlowerType = 'rose' | 'tulip' | 'daisy' | 'sunflower' | 'lily' | 'lavender' | 'poppy'
type Spot = { type: FlowerType; planted: boolean }

const flowerLabels: Record<FlowerType, string> = {
  rose: 'Rose',
  tulip: 'Tulip',
  daisy: 'Daisy',
  sunflower: 'Sunflower',
  lily: 'Lily',
  lavender: 'Lavender',
  poppy: 'Poppy',
}

// Spots are only identifiable by their label or silhouette, so every level needs one of the two.
// Silhouette opacity of 0.55 or more keeps the outline at 3:1+ against the soil (WCAG 1.4.11).
const levels: { types: FlowerType[]; showLabel: boolean; silhouette: number }[] = [
  { types: ['rose'], showLabel: true, silhouette: 0.7 },
  { types: ['rose', 'tulip'], showLabel: true, silhouette: 0.7 },
  { types: ['rose', 'tulip', 'daisy'], showLabel: true, silhouette: 0 },
  { types: ['rose', 'tulip', 'daisy', 'sunflower'], showLabel: false, silhouette: 0.65 },
  { types: ['rose', 'tulip', 'daisy', 'sunflower', 'lily'], showLabel: false, silhouette: 0.6 },
  {
    types: ['rose', 'tulip', 'daisy', 'sunflower', 'lily', 'lavender'],
    showLabel: false,
    silhouette: 0.55,
  },
  {
    types: ['rose', 'tulip', 'daisy', 'sunflower', 'lily', 'lavender', 'poppy'],
    showLabel: false,
    silhouette: 0.55,
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
  poppy: `
    <g fill="#D93A2B">
      <circle cx="30" cy="18" r="10"/>
      <circle cx="20" cy="28" r="10"/>
      <circle cx="40" cy="28" r="10"/>
      <circle cx="30" cy="37" r="9"/>
    </g>
    <circle cx="30" cy="28" r="5.5" fill="#2B2420"/>
    <path d="M30 46 L30 58" stroke="#3F6B4A" stroke-width="3" stroke-linecap="round"/>
  `,
}

const holeShape = `
  <ellipse cx="30" cy="70" rx="20" ry="6" fill="#4A3224"/>
  <ellipse cx="30" cy="69" rx="15" ry="4" fill="#2E1F16"/>
`
const moundShape = `<path d="M10 72 Q30 60 50 72 Q30 77 10 72 Z" fill="#7A5540"/>`

const levelIndex = ref(0)
const spots = ref<Spot[]>([])
const tray = ref<FlowerType[]>([])
const selected = ref<FlowerType | null>(null)
const dragOverSpot = ref<FlowerType | null>(null)
const shakeSpot = ref<FlowerType | null>(null)
const mistakes = ref(0)
const message = ref('')

const level = computed(() => levels[levelIndex.value] ?? levels[0]!)
const isLastLevel = computed(() => levelIndex.value >= levels.length - 1)
const plantedCount = computed(() => spots.value.filter((s) => s.planted).length)
const levelComplete = computed(
  () => spots.value.length > 0 && plantedCount.value === spots.value.length
)
const stars = computed(() => (mistakes.value === 0 ? 3 : mistakes.value <= 2 ? 2 : 1))
const bedStyle = computed(() => {
  const count = spots.value.length || 1
  const columns = count <= 4 ? count : Math.ceil(count / 2)
  return { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
})

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
  spots.value = shuffle(types).map((type) => ({ type, planted: false }))
  tray.value = shuffle(types)
  selected.value = null
  dragOverSpot.value = null
  shakeSpot.value = null
  mistakes.value = 0
  message.value =
    types.length === 1
      ? 'Plant the flower in its spot.'
      : 'Plant each flower in its own spot in the bed.'
}

function isPlanted(type: FlowerType) {
  return spots.value.find((s) => s.type === type)?.planted ?? false
}

function selectFlower(type: FlowerType) {
  if (isPlanted(type)) return
  selected.value = selected.value === type ? null : type
}

function startDrag(event: DragEvent, type: FlowerType) {
  selected.value = type
  if (!event.dataTransfer) return
  // Firefox will not start a drag unless some data is attached.
  event.dataTransfer.setData('text/plain', type)
  event.dataTransfer.effectAllowed = 'move'
}

function endDrag() {
  dragOverSpot.value = null
}

function plant(spot: Spot) {
  dragOverSpot.value = null
  const flower = selected.value
  if (!flower || spot.planted) return

  if (flower === spot.type) {
    spot.planted = true
    selected.value = null
    message.value = levelComplete.value ? 'Level complete.' : 'Planted.'
  } else {
    mistakes.value += 1
    shakeSpot.value = spot.type
    message.value = 'That flower belongs in a different spot. Try again.'
    setTimeout(() => {
      shakeSpot.value = null
    }, 400)
  }
}

function spotMarkup(spot: Spot) {
  const flower = flowerSvg[spot.type]
  if (spot.planted) return `${holeShape}<g transform="translate(0 10)">${flower}</g>${moundShape}`
  if (level.value.silhouette === 0) return holeShape
  const silhouette = flower.replace(/(fill|stroke)="#[0-9A-Fa-f]{3,6}"/g, '$1="#FFF8F0"')
  return `${holeShape}<g opacity="${level.value.silhouette}" transform="translate(0 10)">${silhouette}</g>`
}

function spotLabel(spot: Spot) {
  const name = flowerLabels[spot.type]
  if (level.value.showLabel) return `Empty spot for ${name}`
  return `Empty spot with a ${name.toLowerCase()}-shaped outline`
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
      Plant each flower in the flower bed
    </h2>
    <p class="mt-2 max-w-xl text-lg leading-relaxed text-[var(--bn-muted)]">
      Drag a flower from the panel into its spot in the bed, or tap a flower and then tap the spot.
    </p>
    <div class="mt-4 flex gap-2" aria-hidden="true">
      <span
        v-for="(_, i) in levels"
        :key="i"
        class="h-2 w-10 rounded-full"
        :class="i < levelIndex ? 'bg-orange-700' : i === levelIndex ? 'bg-[var(--bn-navy)]' : 'bg-white'"
      />
    </div>

    <div class="mt-8 grid items-start gap-6 select-none lg:grid-cols-[minmax(0,1fr)_17rem]">
      <div class="garden-scene relative overflow-hidden rounded-[28px]">
        <div class="pointer-events-none absolute inset-0" aria-hidden="true">
          <svg
            class="absolute inset-x-0 top-0 h-28 w-full"
            viewBox="0 0 400 112"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="garden-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#bfe3f5" />
                <stop offset="1" stop-color="#e8f6fb" />
              </linearGradient>
            </defs>
            <rect width="400" height="112" fill="url(#garden-sky)" />
            <path d="M0 86 Q70 52 150 78 T300 70 T400 74 V112 H0 Z" fill="#9fd07a" />
            <path d="M0 98 Q90 74 190 94 T400 88 V112 H0 Z" fill="#8cc466" />
          </svg>
          <svg class="absolute top-3 right-6 h-14 w-14" viewBox="0 0 56 56">
            <g stroke="#f6c453" stroke-width="3" stroke-linecap="round">
              <path d="M28 3v7M28 46v7M3 28h7M46 28h7M10 10l5 5M41 41l5 5M46 10l-5 5M15 41l-5 5" />
            </g>
            <circle cx="28" cy="28" r="12" fill="#f9d56e" />
          </svg>
          <svg class="absolute top-5 left-[18%] h-8 w-20" viewBox="0 0 80 32">
            <g fill="#ffffff">
              <ellipse cx="24" cy="20" rx="18" ry="10" />
              <ellipse cx="44" cy="14" rx="16" ry="12" />
              <ellipse cx="60" cy="21" rx="14" ry="9" />
            </g>
          </svg>
          <svg class="absolute top-10 left-[52%] hidden h-6 w-14 sm:block" viewBox="0 0 56 24">
            <g fill="#ffffff" opacity="0.85">
              <ellipse cx="18" cy="15" rx="13" ry="7" />
              <ellipse cx="33" cy="10" rx="12" ry="9" />
              <ellipse cx="44" cy="16" rx="10" ry="6" />
            </g>
          </svg>
          <svg class="butterfly absolute top-16 left-6 h-7 w-7" viewBox="0 0 28 28">
            <g fill="#f29e7d">
              <ellipse cx="9" cy="10" rx="6" ry="7" transform="rotate(-20 9 10)" />
              <ellipse cx="19" cy="10" rx="6" ry="7" transform="rotate(20 19 10)" />
            </g>
            <g fill="#e8796a">
              <ellipse cx="10" cy="19" rx="4" ry="5" transform="rotate(20 10 19)" />
              <ellipse cx="18" cy="19" rx="4" ry="5" transform="rotate(-20 18 19)" />
            </g>
            <rect x="13" y="7" width="2" height="15" rx="1" fill="#4a3428" />
          </svg>
          <svg class="absolute bottom-0 left-2 h-14 w-32" viewBox="0 0 96 40">
            <g stroke="#5f9a42" stroke-width="2.5" stroke-linecap="round" fill="none">
              <path d="M8 40q2-12-3-22M14 40q0-10 6-18M20 40q-1-8-6-14" />
              <path d="M70 40q2-12-3-20M76 40q0-9 6-16" />
            </g>
            <g>
              <circle cx="40" cy="22" r="5" fill="#ffffff" />
              <circle cx="40" cy="22" r="2" fill="#f2c14e" />
              <path d="M40 27v13" stroke="#5f9a42" stroke-width="2" />
              <circle cx="54" cy="28" r="4" fill="#f4a6c0" />
              <circle cx="54" cy="28" r="1.6" fill="#f2c14e" />
              <path d="M54 32v8" stroke="#5f9a42" stroke-width="2" />
            </g>
          </svg>
          <svg class="absolute right-2 bottom-0 h-14 w-32" viewBox="0 0 96 40">
            <g stroke="#5f9a42" stroke-width="2.5" stroke-linecap="round" fill="none">
              <path d="M86 40q-2-12 3-22M80 40q0-10-6-18M74 40q1-8 6-14" />
              <path d="M24 40q-2-12 3-20M18 40q0-9-6-16" />
            </g>
            <ellipse cx="48" cy="34" rx="9" ry="5" fill="#b9b2a6" />
            <ellipse cx="60" cy="36" rx="6" ry="3.5" fill="#cfc8bc" />
            <circle cx="36" cy="26" r="4.5" fill="#8c6fc9" />
            <circle cx="36" cy="26" r="1.6" fill="#f2c14e" />
            <path d="M36 30v10" stroke="#5f9a42" stroke-width="2" />
          </svg>
        </div>

        <div class="relative px-4 pt-24 pb-16 sm:px-8">
          <div class="bed-frame relative">
            <svg
              class="pointer-events-none absolute -top-4 left-3 h-6 w-12"
              viewBox="0 0 48 24"
              aria-hidden="true"
            >
              <g stroke="#5f9a42" stroke-width="2.5" stroke-linecap="round" fill="none">
                <path d="M6 24q1-10-4-18M12 24q0-12 6-20M18 24q-1-8 3-14M26 24q1-9-3-15" />
              </g>
            </svg>
            <svg
              class="pointer-events-none absolute -top-4 right-4 h-6 w-12"
              viewBox="0 0 48 24"
              aria-hidden="true"
            >
              <g stroke="#5f9a42" stroke-width="2.5" stroke-linecap="round" fill="none">
                <path d="M42 24q-1-10 4-18M36 24q0-12-6-20M30 24q1-8-3-14M22 24q-1-9 3-15" />
              </g>
            </svg>
            <div class="flower-bed rounded-xl p-3 sm:p-5" role="group" aria-label="Flower bed">
              <div class="grid gap-3 sm:gap-4" :style="bedStyle">
                <div
                  v-for="spot in spots"
                  :key="spot.type"
                  :role="spot.planted ? undefined : 'button'"
                  :tabindex="spot.planted ? -1 : 0"
                  :aria-label="spot.planted ? undefined : spotLabel(spot)"
                  class="flex flex-col items-center justify-end gap-1 rounded-2xl border-2 p-2 transition focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none"
                  :class="[
                    spot.planted
                      ? 'border-transparent'
                      : dragOverSpot === spot.type
                        ? 'border-solid border-[var(--bn-cream)] bg-white/10'
                        : 'border-dashed border-[var(--bn-cream)]/60',
                    selected && !spot.planted ? 'cursor-pointer hover:border-[var(--bn-cream)]' : '',
                    shakeSpot === spot.type ? 'animate-shake' : '',
                  ]"
                  @dragenter.prevent="dragOverSpot = spot.type"
                  @dragover.prevent
                  @dragleave="dragOverSpot === spot.type && (dragOverSpot = null)"
                  @drop.prevent="plant(spot)"
                  @click="plant(spot)"
                  @keydown.enter.prevent="plant(spot)"
                  @keydown.space.prevent="plant(spot)"
                >
                  <svg
                    class="pointer-events-none h-auto w-full max-w-[84px]"
                    viewBox="0 0 60 80"
                    aria-hidden="true"
                    v-html="spotMarkup(spot)"
                  />
                  <span
                    class="pointer-events-none min-h-7 rounded-md px-2 text-base font-semibold"
                    :class="
                      level.showLabel || spot.planted
                        ? 'bg-black/15 text-[var(--bn-cream)]/75'
                        : 'invisible'
                    "
                  >
                    {{ flowerLabels[spot.type] }}<span v-if="spot.planted" class="sr-only"> planted</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside
        v-if="!levelComplete"
        aria-label="Flowers to plant"
        class="rounded-2xl border border-[var(--bn-border)] bg-white p-4"
      >
        <p class="text-lg font-semibold text-[var(--bn-navy)]">Flowers</p>
        <div class="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-2">
          <!-- A div, not a button: browsers do not reliably drag <button> elements. -->
          <div
            v-for="type in tray"
            :key="type"
            role="button"
            :tabindex="isPlanted(type) ? -1 : 0"
            class="flex min-h-[64px] flex-col items-center gap-1 rounded-2xl border-2 bg-[var(--bn-cream)] px-2 py-3 focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-2 focus-visible:outline-none"
            :class="[
              isPlanted(type) ? 'pointer-events-none opacity-30' : 'cursor-grab active:cursor-grabbing',
              selected === type ? 'border-[var(--bn-navy)]' : 'border-[var(--bn-border)]',
            ]"
            :draggable="!isPlanted(type)"
            :aria-pressed="selected === type"
            :aria-disabled="isPlanted(type)"
            @dragstart="startDrag($event, type)"
            @dragend="endDrag"
            @click="selectFlower(type)"
            @keydown.enter.prevent="selectFlower(type)"
            @keydown.space.prevent="selectFlower(type)"
          >
            <svg
              class="pointer-events-none shrink-0"
              width="44"
              height="44"
              viewBox="0 0 60 60"
              aria-hidden="true"
              v-html="flowerSvg[type]"
            />
            <span class="text-lg text-[var(--bn-navy)]">{{ flowerLabels[type] }}</span>
          </div>
        </div>
      </aside>

      <div v-else class="rounded-2xl border border-[var(--bn-border)] bg-white p-5 text-center">
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
    </div>

    <p class="mt-8 text-center text-xl text-[var(--bn-navy)]" aria-live="polite">{{ message }}</p>
    <div class="mt-6 flex flex-wrap items-center justify-center gap-4">
      <span class="text-lg font-semibold text-[var(--bn-muted)]">
        {{ plantedCount }} / {{ spots.length }} planted · {{ mistakes }} mistake{{ mistakes === 1 ? '' : 's' }}
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
.garden-scene {
  background-color: #86c062;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='44' height='44'%3E%3Cg stroke='%2372ad4f' stroke-width='2' stroke-linecap='round' fill='none'%3E%3Cpath d='M6 32q1-6-1-10M9 33q0-5 3-8'/%3E%3Cpath d='M28 14q1-6-1-9M31 15q0-5 3-7'/%3E%3Cpath d='M38 40q1-5-1-8'/%3E%3C/g%3E%3C/svg%3E");
}
.bed-frame {
  padding: 12px;
  border-radius: 20px;
  background-color: #a46d45;
  background-image:
    repeating-linear-gradient(90deg, transparent 0 78px, rgba(60, 35, 20, 0.35) 78px 80px),
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.05) 0 2px, transparent 2px 7px);
  box-shadow:
    0 8px 0 #774a2c,
    0 16px 22px rgba(40, 60, 20, 0.35);
}
.flower-bed {
  background-color: #6b4a34;
  background-image:
    repeating-linear-gradient(0deg, transparent 0 30px, rgba(0, 0, 0, 0.13) 30px 34px),
    radial-gradient(rgba(0, 0, 0, 0.2) 1.5px, transparent 1.7px),
    radial-gradient(rgba(255, 255, 255, 0.07) 1.5px, transparent 1.7px);
  background-size:
    auto,
    18px 18px,
    23px 23px;
  background-position:
    0 0,
    0 0,
    9px 11px;
  box-shadow: inset 0 6px 14px rgba(0, 0, 0, 0.35);
}
/* Two short flutters (under 5s total) so no Pause control is needed (WCAG 2.2.2). */
.butterfly {
  animation: flutter 2.2s ease-in-out 2;
}
@keyframes flutter {
  0%,
  100% {
    transform: translate(0, 0) rotate(-6deg);
  }
  50% {
    transform: translate(14px, -6px) rotate(6deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .butterfly,
  .animate-shake {
    animation: none;
  }
}
</style>

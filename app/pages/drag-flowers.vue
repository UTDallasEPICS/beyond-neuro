<script setup lang="ts">
const navItems = [
  { label: 'Home', icon: 'i-lucide-home' },
  { label: 'Exercises', icon: 'i-lucide-footprints', active: true },
  { label: 'My Progress', icon: 'i-lucide-line-chart' },
  { label: 'Learn', icon: 'i-lucide-book-open' },
  { label: 'Caregiver Corner', icon: 'i-lucide-map-pin' },
]

type FlowerType = 'rose' | 'tulip' | 'daisy' | 'sunflower'

const flowers: { type: FlowerType; label: string }[] = [
  { type: 'rose', label: 'Rose' },
  { type: 'tulip', label: 'Tulip' },
  { type: 'daisy', label: 'Daisy' },
  { type: 'sunflower', label: 'Sunflower' },
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
}

const potSvg = `
  <ellipse cx="30" cy="30" rx="18" ry="6" fill="#DCD4F5"/>
  <path d="M16 30 L20 46 Q30 50 40 46 L44 30 Z" fill="#B9A9E8"/>
`

const beds = ref<{ type: FlowerType; label: string; planted: boolean }[]>([
  { type: 'rose', label: 'Rose bed', planted: false },
  { type: 'tulip', label: 'Tulip bed', planted: false },
  { type: 'daisy', label: 'Daisy bed', planted: false },
  { type: 'sunflower', label: 'Sunflower bed', planted: false },
])

const draggingType = ref<FlowerType | null>(null)
const shakeBed = ref<FlowerType | null>(null)
const message = ref('Drag each flower into its matching bed.')

const plantedCount = computed(() => beds.value.filter((b) => b.planted).length)
const allPlanted = computed(() => plantedCount.value === beds.value.length)

function handleDragStart(type: FlowerType) {
  draggingType.value = type
}

function handleDrop(bed: { type: FlowerType; label: string; planted: boolean }) {
  if (!draggingType.value || bed.planted) return

  if (draggingType.value === bed.type) {
    bed.planted = true
    message.value = allPlanted.value ? 'Every bed is planted. Nicely done.' : `${bed.label} planted.`
  } else {
    shakeBed.value = bed.type
    message.value = `That flower doesn't belong in the ${bed.label.toLowerCase()}.`
    setTimeout(() => {
      shakeBed.value = null
    }, 400)
  }

  draggingType.value = null
}

function resetGarden() {
  beds.value.forEach((b) => (b.planted = false))
  message.value = 'Drag each flower into its matching bed.'
}
</script>

<template>
  <div class="app-shell flex min-h-screen">
    <!-- Sidebar -->
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
          Garden Activity · Planting
        </p>
        <h1 class="mt-2 font-['Georgia'] text-4xl font-black tracking-tight text-[#1E1B4B]">
          Plant each flower in its bed
        </h1>
        <p class="mt-2 max-w-xl text-slate-600">
          Drag a flower from the tray below into the bed that matches it.
        </p>
      </header>

      <!-- Lavender card -->
      <section class="rounded-3xl bg-[#EAE6FB] p-10 shadow-sm">
        <!-- Beds -->
        <div class="grid grid-cols-2 gap-5 sm:grid-cols-4">
          <div
            v-for="bed in beds"
            :key="bed.type"
            class="flex h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 transition"
            :class="[
              bed.planted
                ? 'border-emerald-400 bg-white'
                : 'border-[#c9c0f5] bg-white/50',
              shakeBed === bed.type ? 'animate-shake' : '',
            ]"
            @dragover.prevent
            @drop="handleDrop(bed)"
          >
            <svg
              width="52"
              height="52"
              viewBox="0 0 60 60"
              v-html="bed.planted ? flowerSvg[bed.type] : potSvg"
            />
            <span class="text-xs font-semibold text-[#1E1B4B]">{{ bed.label }}</span>
          </div>
        </div>

        <!-- Flower tray -->
        <div class="mt-10 flex flex-wrap justify-center gap-4">
          <div
            v-for="flower in flowers"
            :key="flower.type"
            class="flex flex-col items-center gap-1 rounded-2xl border border-[#c9c0f5] bg-white px-6 py-4 transition"
            :class="
              beds.find((b) => b.type === flower.type)?.planted
                ? 'pointer-events-none opacity-30'
                : 'cursor-grab active:cursor-grabbing hover:shadow-md'
            "
            :draggable="!beds.find((b) => b.type === flower.type)?.planted"
            @dragstart="handleDragStart(flower.type)"
          >
            <svg width="40" height="40" viewBox="0 0 60 60" v-html="flowerSvg[flower.type]" />
            <span class="text-xs font-medium text-slate-500">{{ flower.label }}</span>
          </div>
        </div>

        <p class="mt-8 text-center text-sm text-slate-500">{{ message }}</p>

        <div class="mt-6 flex items-center justify-center gap-4">
          <span class="text-xs font-semibold tracking-wide text-slate-400 uppercase">
            {{ plantedCount }} / {{ beds.length }} planted
          </span>
          <button
            type="button"
            class="rounded-full border border-[#1E1B4B] px-5 py-1.5 text-xs font-semibold text-[#1E1B4B] transition hover:bg-[#1E1B4B] hover:text-white"
            @click="resetGarden"
          >
            Reset
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}
.animate-shake {
  animation: shake 0.3s ease-in-out;
}
</style>
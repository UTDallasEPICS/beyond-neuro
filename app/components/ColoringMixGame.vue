<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { COLOR_MIX_LEVELS, PAINTS } from '~/data/coloring/colorMixLevels'
  import {
    closenessSteps,
    mixPaints,
    rgbToHex,
    type PaintId,
    type Recipe,
  } from '~/utils/colorMixing'

  const props = withDefaults(defineProps<{ startLevel?: number }>(), { startLevel: 1 })

  const levelIndex = ref(Math.min(Math.max(props.startLevel, 1), COLOR_MIX_LEVELS.length) - 1)
  const drops = ref<PaintId[]>([])
  const hintStep = ref(0)

  const level = computed(() => COLOR_MIX_LEVELS[levelIndex.value]!)
  const targetRgb = computed(() => mixPaints(level.value.recipe)!)
  const targetHex = computed(() => rgbToHex(targetRgb.value))

  const bowl = computed<Recipe>(() => {
    const r: Recipe = {}
    for (const id of drops.value) r[id] = (r[id] ?? 0) + 1
    return r
  })
  const mixRgb = computed(() => mixPaints(bowl.value))
  const mixHex = computed(() => (mixRgb.value ? rgbToHex(mixRgb.value) : null))
  const steps = computed(() => closenessSteps(mixRgb.value, targetRgb.value))
  const solved = computed(() => steps.value === 4)
  const bowlFull = computed(() => drops.value.length >= level.value.maxDrops)

  const CLOSENESS = [
    'Keep mixing — every drop helps!',
    'Nice start!',
    'Getting closer!',
    'So close! Just a little change.',
    'You did it!',
  ]
  const closenessText = computed(() => CLOSENESS[steps.value]!)

  const hintText = computed(() => {
    const parts = Object.entries(level.value.recipe) as [PaintId, number][]
    const names = parts.map(([id]) => PAINTS[id].name)
    if (hintStep.value === 1) return `${'This color uses'} ${joinList(names)}.`
    if (hintStep.value === 2)
      return `${'Try'} ${joinList(parts.map(([id, n]) => dropsLabel(n, PAINTS[id].name)))}.`
    return ''
  })

  const recipeText = computed(() => {
    const parts = Object.entries(bowl.value) as [PaintId, number][]
    return joinList(parts.map(([id, n]) => dropsLabel(n, PAINTS[id].name)))
  })

  // actions
  function addDrop(id: PaintId) {
    if (solved.value || bowlFull.value) return
    drops.value.push(id)
  }
  function undoDrop() {
    drops.value.pop()
  }
  function emptyBowl() {
    drops.value = []
  }
  function showHint() {
    hintStep.value = Math.min(hintStep.value + 1, 2)
  }
  function goToLevel(i: number) {
    levelIndex.value = i
  }
  function nextLevel() {
    if (levelIndex.value < COLOR_MIX_LEVELS.length - 1) levelIndex.value++
  }

  watch(levelIndex, () => {
    drops.value = []
    hintStep.value = 0
  })

  // helpers
  function dropsLabel(n: number, name: string) {
    return `${n} ${name.toLowerCase()}`
  }
  function joinList(items: string[]) {
    if (items.length <= 1) return items.join('')
    return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`
  }
  function dropCount(id: PaintId) {
    return bowl.value[id] ?? 0
  }
</script>

<template>
  <section
    class="mx-auto max-w-3xl rounded-3xl bg-white p-4 text-[1.5rem] leading-relaxed text-[#241f5c] shadow-sm sm:p-8"
    aria-labelledby="color-mix-title"
  >
    <header class="mb-6">
      <h2 id="color-mix-title" class="font-serif text-[2rem] font-bold">Color Mixing</h2>
      <p class="text-[1.375rem] text-slate-700">Mix paints to match the color.</p>
    </header>

    <!-- Level picker: every level always open -->
    <nav aria-label="Choose a level" class="mb-6">
      <ul class="flex flex-wrap gap-2">
        <li v-for="(lv, i) in COLOR_MIX_LEVELS" :key="lv.level">
          <button
            type="button"
            class="min-h-[72px] rounded-2xl border-2 px-5 text-[1.5rem] font-bold focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#241f5c]"
            :class="
              i === levelIndex
                ? 'border-[#f97316] bg-[#f97316] text-white'
                : 'border-[#f2c9a8] bg-[#fdeee2] text-[#241f5c]'
            "
            :aria-current="i === levelIndex ? 'step' : undefined"
            @click="goToLevel(i)"
          >
            {{ lv.level }}
          </button>
        </li>
      </ul>
    </nav>

    <p class="mb-4 text-[1.375rem] font-semibold">{{ level.level }} · {{ level.skill }}</p>

    <!-- Target vs. mix -->
    <div class="mb-4 grid grid-cols-2 gap-4">
      <figure class="flex flex-col items-center gap-2">
        <figcaption class="font-semibold">Make this color</figcaption>
        <div
          class="aspect-square w-full max-w-[220px] rounded-full border-4 border-[#241f5c]/20"
          :style="{ backgroundColor: targetHex }"
          role="img"
          :aria-label="level.name"
        />
        <span class="font-bold">{{ level.name }}</span>
      </figure>

      <figure class="flex flex-col items-center gap-2">
        <figcaption class="font-semibold">Your mix</figcaption>
        <div
          class="flex aspect-square w-full max-w-[220px] items-center justify-center rounded-full border-4 border-dashed border-[#241f5c]/30 p-4 text-center text-[1.125rem] text-slate-600 motion-safe:transition-colors motion-safe:duration-500"
          :style="mixHex ? { backgroundColor: mixHex, borderStyle: 'solid' } : {}"
          role="img"
          :aria-label="mixHex ? `Your mix: ${recipeText}` : 'Add a paint to start'"
        >
          <span v-if="!mixHex">Add a paint to start</span>
        </div>
        <span class="text-center">{{ drops.length }} / {{ level.maxDrops }} drops</span>
      </figure>
    </div>

    <!-- Closeness meter: encouragement only -->
    <div class="mb-6 flex flex-col items-center gap-2" aria-live="polite">
      <div class="flex gap-2" aria-hidden="true">
        <span
          v-for="n in 4"
          :key="n"
          class="h-5 w-12 rounded-full motion-safe:transition-colors"
          :class="n <= steps ? 'bg-[#f97316]' : 'bg-[#fdeee2]'"
        />
      </div>
      <p v-if="drops.length" class="text-center font-semibold">{{ closenessText }}</p>
    </div>

    <!-- Success -->
    <div
      v-if="solved"
      class="fade-in mb-6 rounded-2xl border-2 border-green-700 bg-green-50 p-5 text-center"
      role="status"
    >
      <p class="text-[1.75rem] font-bold">You made {{ level.name }}! 🎨</p>
      <p>You mixed {{ recipeText }}.</p>
      <p v-if="levelIndex === COLOR_MIX_LEVELS.length - 1" class="mt-2">
        You finished every level. Wonderful work!
      </p>
      <div class="mt-4 flex flex-wrap justify-center gap-3">
        <button
          v-if="levelIndex < COLOR_MIX_LEVELS.length - 1"
          type="button"
          class="min-h-[72px] rounded-2xl bg-[#f97316] px-6 font-bold text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#241f5c]"
          @click="nextLevel"
        >
          Next color →
        </button>
        <button
          type="button"
          class="min-h-[72px] rounded-2xl border-2 border-[#f97316] bg-white px-6 font-bold text-[#c2410c] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#241f5c]"
          @click="emptyBowl"
        >
          Play this one again
        </button>
      </div>
    </div>

    <!-- Paint pots -->
    <template v-else>
      <h3 class="mb-3 font-semibold">Tap a paint to add one drop</h3>
      <ul class="mb-4 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
        <li v-for="id in level.palette" :key="id">
          <button
            type="button"
            class="flex min-h-[120px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[#241f5c]/20 bg-white p-3 font-semibold focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#241f5c] disabled:opacity-50"
            :disabled="bowlFull"
            :aria-label="`${PAINTS[id].name}, ${dropCount(id)} drops`"
            @click="addDrop(id)"
          >
            <span
              class="h-12 w-12 rounded-full border-2 border-[#241f5c]/30"
              :style="{ backgroundColor: PAINTS[id].hex }"
              aria-hidden="true"
            />
            <span>{{ PAINTS[id].name }}</span>
            <span class="text-[1.125rem] text-slate-600" aria-hidden="true"
              >× {{ dropCount(id) }}</span
            >
          </button>
        </li>
      </ul>

      <p v-if="bowlFull" class="mb-4 rounded-xl bg-[#fdeee2] p-3" role="status">
        The bowl is full. Take out a drop, or empty the bowl and try again.
      </p>

      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="min-h-[72px] rounded-2xl border-2 border-[#241f5c]/30 bg-white px-5 font-semibold focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#241f5c] disabled:opacity-50"
          :disabled="!drops.length"
          @click="undoDrop"
        >
          ↶ Take out last drop
        </button>
        <button
          type="button"
          class="min-h-[72px] rounded-2xl border-2 border-[#241f5c]/30 bg-white px-5 font-semibold focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#241f5c] disabled:opacity-50"
          :disabled="!drops.length"
          @click="emptyBowl"
        >
          Empty the bowl
        </button>
        <button
          v-if="hintStep < 2"
          type="button"
          class="min-h-[72px] rounded-2xl border-2 border-[#f97316] bg-white px-5 font-semibold text-[#c2410c] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#241f5c]"
          @click="showHint"
        >
          💡 {{ hintStep === 0 ? 'Show a hint' : 'Show more help' }}
        </button>
      </div>

      <p v-if="hintStep" class="mt-4 rounded-xl bg-[#fdeee2] p-3" aria-live="polite">
        {{ hintText }}
      </p>
    </template>
  </section>
</template>

<style scoped>
  @media (prefers-reduced-motion: no-preference) {
    .fade-in {
      animation: fadeIn 0.6s ease-out;
    }
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>

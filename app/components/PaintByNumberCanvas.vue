<script setup lang="ts">
  import { illustrations } from '~/data/illustrations'

  const activeId = ref(illustrations[0]!.id)
  const active = computed(() => illustrations.find((art) => art.id === activeId.value)!)

  // Fills are kept per picture, so switching pictures never loses someone's work.
  const fillsByArt = ref<Record<string, Record<string, string>>>(
    Object.fromEntries(illustrations.map((art) => [art.id, {}])),
  )
  const fills = computed(() => fillsByArt.value[activeId.value]!)

  const selectedColor = ref<string>(active.value.palette[0]!)
  const selectedNumber = computed(() => active.value.palette.indexOf(selectedColor.value) + 1)

  const coloredCount = computed(
    () => active.value.regions.filter((region) => fills.value[region.id]).length,
  )
  const isComplete = computed(() => coloredCount.value === active.value.regions.length)

  function choosePicture(id: string) {
    activeId.value = id
    selectedColor.value = active.value.palette[0]!
  }

  function colorRegion(regionId: string) {
    fills.value[regionId] = selectedColor.value
  }

  function clearPicture() {
    fillsByArt.value[activeId.value] = {}
  }
</script>

<template>
  <div>
    <h2 class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">Choose a picture</h2>
    <div class="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
      <button
        v-for="art in illustrations"
        :key="art.id"
        type="button"
        class="min-h-[72px] rounded-2xl border-2 p-4 text-left transition-colors focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
        :class="
          art.id === activeId
            ? 'border-orange-700 bg-[var(--bn-peach)]'
            : 'border-slate-300 bg-white hover:bg-slate-50'
        "
        :aria-pressed="art.id === activeId"
        @click="choosePicture(art.id)"
      >
        <span class="block text-lg font-bold text-[var(--bn-navy)]">{{ art.title }}</span>
        <span class="block text-lg text-[var(--bn-muted)]">{{ art.origin }}</span>
        <span class="mt-3 flex gap-1.5" aria-hidden="true">
          <span
            v-for="color in art.palette"
            :key="color"
            class="h-4 w-4 rounded-full"
            :style="{ backgroundColor: color }"
          />
        </span>
      </button>
    </div>

    <ActivityCard
      class="mt-6"
      instructions="Pick a numbered color, then tap the shapes with the same number. Any color is fine — there are no wrong answers."
      @clear="clearPicture"
    >
      <template #palette>
        <ColorPalette v-model="selectedColor" :colors="active.palette" numbered />
      </template>

      <p class="mt-6 text-lg text-[var(--bn-navy)]">
        <span class="font-bold">{{ active.title }}</span> — {{ active.description }}
      </p>

      <div class="mt-4 overflow-hidden rounded-2xl border border-[var(--bn-border)] bg-white p-2">
        <svg
          :viewBox="active.viewBox"
          class="mx-auto h-auto w-full max-w-xl select-none"
          role="group"
          :aria-label="`${active.title} paint-by-number picture`"
        >
          <path
            v-for="d in active.decorations"
            :key="d"
            :d="d"
            fill="none"
            stroke="#334155"
            stroke-width="3"
            stroke-linecap="round"
          />
          <path
            v-for="region in active.regions"
            :key="region.id"
            :d="region.d"
            :fill="fills[region.id] || '#ffffff'"
            fill-rule="evenodd"
            :stroke="region.number === selectedNumber ? '#c2410c' : '#334155'"
            :stroke-width="region.number === selectedNumber ? 4 : 2"
            stroke-linejoin="round"
            class="cursor-pointer"
            tabindex="0"
            role="button"
            :aria-label="`Shape number ${region.number}${fills[region.id] ? ', colored' : ''}`"
            @click="colorRegion(region.id)"
            @keydown.enter.prevent="colorRegion(region.id)"
            @keydown.space.prevent="colorRegion(region.id)"
          />
          <text
            v-for="region in active.regions"
            :key="`${region.id}-label`"
            :x="region.labelX"
            :y="region.labelY"
            text-anchor="middle"
            dominant-baseline="central"
            font-size="18"
            font-weight="600"
            fill="#334155"
            :opacity="fills[region.id] ? 0.3 : 1"
            pointer-events="none"
            aria-hidden="true"
          >
            {{ region.number }}
          </text>
        </svg>
      </div>

      <p class="mt-4 text-lg font-semibold text-[var(--bn-navy)]" aria-live="polite">
        <template v-if="isComplete">All done — beautiful work. Take a moment to enjoy it.</template>
        <template v-else>{{ coloredCount }} of {{ active.regions.length }} shapes colored</template>
      </p>
    </ActivityCard>
  </div>
</template>

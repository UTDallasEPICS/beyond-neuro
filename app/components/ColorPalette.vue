<script setup lang="ts">
  defineProps<{
    colors: readonly string[]
    numbered?: boolean
  }>()

  const selected = defineModel<string>({ required: true })
</script>

<template>
  <div class="flex flex-wrap items-center gap-3" role="listbox" aria-label="Color palette">
    <button
      v-for="(color, index) in colors"
      :key="color"
      type="button"
      role="option"
      :aria-selected="selected === color"
      :aria-label="numbered ? `Color number ${index + 1}` : `Select color ${color}`"
      class="flex flex-col items-center gap-1 rounded-2xl focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:outline-none"
      @click="selected = color"
    >
      <span
        class="h-12 w-12 rounded-full border-4 transition-transform hover:scale-105 sm:h-14 sm:w-14"
        :class="selected === color ? 'scale-110 border-[var(--bn-navy)]' : 'border-white'"
        :style="{ backgroundColor: color }"
      />
      <span v-if="numbered" class="text-lg font-semibold text-[var(--bn-navy)]">{{
        index + 1
      }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
  defineProps<{ instructions: string }>()
  defineEmits<{ clear: [] }>()
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
    <div
      class="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-lg font-semibold tracking-wide text-violet-900 uppercase"
    >
      <UIcon name="i-heroicons-sparkles" class="h-5 w-5" aria-hidden="true" />
      Try it now — interactive
    </div>

    <p class="mt-4 text-lg text-slate-600">{{ instructions }}</p>

    <div class="mt-6 flex flex-wrap items-center gap-4">
      <slot name="palette" />

      <button
        type="button"
        class="ml-auto flex items-center gap-2 rounded-xl bg-[#f3eee8] px-5 py-3 text-lg font-medium text-slate-800 hover:bg-[#ebe4dc] focus-visible:ring-4 focus-visible:ring-violet-300 focus-visible:outline-none"
        @click="$emit('clear')"
      >
        <UIcon name="i-heroicons-backspace" class="h-6 w-6" aria-hidden="true" />
        Clear
      </button>
    </div>

    <slot />
  </div>
</template>

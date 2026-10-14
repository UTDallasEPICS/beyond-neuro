<script setup lang="ts">
  defineProps<{ instructions: string }>()
  defineEmits<{ clear: [] }>()
</script>

<template>
  <div class="rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 sm:p-10">
    <p class="text-lg font-bold tracking-wide text-orange-800 uppercase">
      Try it now — interactive
    </p>

    <p class="mt-3 text-lg leading-relaxed text-[var(--bn-navy)] sm:text-xl">{{ instructions }}</p>

    <div class="mt-6 flex flex-wrap items-center gap-4">
      <slot name="palette" />

      <button
        type="button"
        class="ml-auto inline-flex min-h-[56px] items-center justify-center rounded-2xl border-2 border-slate-400 bg-white px-6 py-3 text-lg font-semibold text-[var(--bn-navy)] hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
        @click="$emit('clear')"
      >
        Clear
      </button>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
  import type { ReminiscenceLevel } from '~/data/reminiscence/levels'

  defineProps<{
    levels: Array<{
      level: ReminiscenceLevel
      label: string
      description: string
    }>
    current: ReminiscenceLevel | null
  }>()

  const emit = defineEmits<{ select: [level: ReminiscenceLevel] }>()
</script>

<template>
  <nav aria-label="Levels" class="print:hidden">
    <ul class="grid list-none gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3">
      <li v-for="l in levels" :key="l.level">
        <button
          type="button"
          :aria-pressed="current === l.level"
          class="flex min-h-[72px] w-full flex-col items-start justify-center rounded-2xl border-2 px-5 py-3 text-left focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
          :class="
            current === l.level
              ? 'border-orange-700 bg-[var(--bn-peach)]'
              : 'border-slate-300 bg-white hover:bg-slate-50'
          "
          @click="emit('select', l.level)"
        >
          <span class="text-xl font-bold">Level {{ l.level }} · {{ l.label }}</span>
          <span class="text-lg text-[var(--bn-muted)]">{{ l.description }}</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

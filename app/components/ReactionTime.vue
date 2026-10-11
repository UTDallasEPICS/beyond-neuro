<script setup lang="ts">
  // Reaction Time game (Digital & VR Training), matching gobeyondneuro.com/activities/digital-vr.
  type Phase = 'idle' | 'waiting' | 'go' | 'early' | 'result'

  const MIN_DELAY_MS = 1500
  const MAX_DELAY_MS = 4000
  const HISTORY_SIZE = 5

  const phase = ref<Phase>('idle')
  const lastMs = ref<number | null>(null)
  const recent = ref<number[]>([])

  let timer: ReturnType<typeof setTimeout> | undefined
  let goAt = 0

  const message = computed(() => {
    switch (phase.value) {
      case 'waiting':
        return 'Wait for green…'
      case 'go':
        return 'Tap now!'
      case 'early':
        return 'A little early — tap to try again'
      case 'result':
        return `${lastMs.value} ms — tap to go again`
      default:
        return 'Tap to start'
    }
  })

  const panelClass = computed(() =>
    phase.value === 'go'
      ? 'border-green-600 bg-green-500 text-gray-900'
      : 'border-[#DCD9F0] bg-[#ECEBFB] text-gray-900'
  )

  const recentText = computed(() =>
    recent.value.length ? recent.value.map((ms) => `${ms} ms`).join(' · ') : '—'
  )

  function start() {
    phase.value = 'waiting'
    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)
    timer = setTimeout(() => {
      goAt = performance.now()
      phase.value = 'go'
    }, delay)
  }

  function press() {
    if (phase.value === 'waiting') {
      // Tapped before green: gentle retry, nothing recorded.
      clearTimeout(timer)
      phase.value = 'early'
      return
    }
    if (phase.value === 'go') {
      const ms = Math.round(performance.now() - goAt)
      lastMs.value = ms
      recent.value = [ms, ...recent.value].slice(0, HISTORY_SIZE)
      phase.value = 'result'
      return
    }
    start()
  }

  // pointerdown fires on press (not release), so taps are measured fairly.
  function onPointerDown(event: PointerEvent) {
    if (event.button === 0) press()
  }

  function onKey(event: KeyboardEvent) {
    if (!event.repeat) press()
  }

  onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <section class="bg-[#F5F1EA] px-4 py-12">
    <div class="mx-auto max-w-4xl">
      <h2 class="font-serif text-4xl font-bold text-[#231E5A]">Reaction Time</h2>
      <p class="mt-3 text-lg text-gray-600">
        A short reaction speed practice. Use it for a few minutes — alone or alongside someone you
        care for.
      </p>

      <div
        class="mt-6 rounded-2xl border border-t-4 border-gray-200 border-t-[#231E5A] bg-white p-6 sm:p-8"
      >
        <div class="flex items-center gap-3">
          <span class="flex h-11 w-11 items-center justify-center rounded-full bg-[#ECEBFB]">
            <UIcon name="i-heroicons-bolt" class="h-5 w-5 text-[#231E5A]" aria-hidden="true" />
          </span>
          <span class="text-sm font-semibold tracking-[0.15em] text-[#231E5A] uppercase">
            Reaction Time — Interactive
          </span>
        </div>

        <p class="mt-5 text-lg text-gray-700">
          Wait for the panel to turn green, then tap as fast as you can. Short, daily practice
          builds sharper response time.
        </p>

        <button
          type="button"
          class="mt-5 flex min-h-48 w-full touch-manipulation items-center justify-center rounded-2xl border p-6 text-2xl font-semibold select-none focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#231E5A]"
          :class="panelClass"
          @pointerdown="onPointerDown"
          @keydown.enter.prevent="onKey"
          @keydown.space.prevent="onKey"
        >
          {{ message }}
        </button>
        <p class="sr-only" aria-live="assertive">{{ message }}</p>

        <p class="mt-4 text-gray-600">Last 5: {{ recentText }}</p>
      </div>
    </div>
  </section>
</template>

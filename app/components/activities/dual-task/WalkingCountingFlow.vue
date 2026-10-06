<script setup lang="ts">
  import {
    movements,
    countLevels,
    type CountLevel,
    type Movement,
  } from '~/data/dual-task/walking-counting'

  type Step = 'move' | 'level' | 'drill' | 'done'

  const step = ref<Step>('move')
  const movement = ref<Movement>(movements[0]!)
  const level = ref<CountLevel>(countLevels[0]!)
  const current = ref(0)
  const said = ref<number[]>([])
  const paused = ref(false)

  const nextNumber = computed(() => current.value - level.value.step)
  const isLast = computed(() => nextNumber.value < 0)

  function chooseMovement(m: Movement) {
    movement.value = m
    step.value = 'level'
  }

  function chooseLevel(l: CountLevel) {
    level.value = l
    start()
  }

  function start() {
    current.value = level.value.start
    said.value = [level.value.start]
    paused.value = false
    step.value = 'drill'
  }

  function next() {
    if (isLast.value) {
      step.value = 'done'
      return
    }
    current.value = nextNumber.value
    said.value.push(current.value)
  }

  function speak(text: string) {
    if (!import.meta.client || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.volume = 0.5
    window.speechSynthesis.speak(utterance)
  }

  function restart() {
    step.value = 'move'
  }

  const bigButton =
    'flex min-h-[72px] w-full items-center justify-center rounded-2xl px-6 text-xl font-bold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:outline-none'
  const primary = `${bigButton} bg-[var(--bn-orange)] text-white`
  const secondary = `${bigButton} border-2 border-[var(--bn-navy)] bg-white text-[var(--bn-navy)]`
</script>

<template>
  <div class="mt-6 rounded-2xl border border-[var(--bn-border)] bg-white p-6 sm:p-8">
    <!-- Step 1: choose movement -->
    <div v-if="step === 'move'">
      <h3 class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">How will you move?</h3>
      <p class="mt-2 text-lg text-[var(--bn-muted)]">
        Keep a chair or wall nearby. Stop and rest anytime you feel tired or dizzy.
      </p>
      <div class="mt-6 flex flex-col gap-4">
        <button
          v-for="m in movements"
          :key="m.id"
          type="button"
          :class="secondary"
          @click="chooseMovement(m)"
        >
          {{ m.label }}
        </button>
      </div>
    </div>

    <!-- Step 2: choose level -->
    <div v-else-if="step === 'level'">
      <h3 class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">Pick your level</h3>
      <p class="mt-2 text-lg text-[var(--bn-muted)]">You can change this anytime.</p>
      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        <button
          v-for="l in countLevels"
          :key="l.level"
          type="button"
          :class="[secondary, 'flex-col gap-1 py-4']"
          @click="chooseLevel(l)"
        >
          <span>{{ l.label }}</span>
          <span class="text-base font-normal">{{ l.description }}</span>
        </button>
      </div>
      <button
        type="button"
        class="mt-6 min-h-[72px] text-lg font-semibold text-orange-800"
        @click="step = 'move'"
      >
        ← Back
      </button>
    </div>

    <!-- Step 3: drill -->
    <div v-else-if="step === 'drill'">
      <p class="text-lg font-semibold text-[var(--bn-muted)]">
        {{ movement.label }} · {{ level.description }}
      </p>
      <p class="mt-1 text-lg text-[var(--bn-navy)]">{{ movement.instruction }}</p>

      <div v-if="paused" class="mt-8 rounded-2xl bg-[var(--bn-peach)] p-8 text-center">
        <p class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">
          Paused. Take your time.
        </p>
        <button type="button" :class="[primary, 'mt-6']" @click="paused = false">Keep going</button>
      </div>

      <template v-else>
        <p
          class="bn-font-display mt-8 text-center text-[96px] leading-none font-bold text-[var(--bn-navy)]"
          aria-live="polite"
        >
          {{ current }}
        </p>
        <p class="mt-4 text-center text-xl text-[var(--bn-navy)]">
          Keep moving. Say the next number out loud, then tap below to check.
        </p>

        <div class="mt-8 flex flex-col gap-4">
          <button type="button" :class="primary" @click="next">
            {{ isLast ? 'Finish' : 'Next number' }}
          </button>
          <button type="button" :class="secondary" @click="speak(String(current))">
            Read aloud
          </button>
        </div>
      </template>

      <div class="mt-6 flex justify-between">
        <button
          v-if="!paused"
          type="button"
          class="min-h-[72px] px-4 text-lg font-semibold text-[var(--bn-navy)]"
          @click="paused = true"
        >
          Pause
        </button>
        <button
          type="button"
          class="ml-auto min-h-[72px] px-4 text-lg font-semibold text-orange-800"
          @click="step = 'done'"
        >
          End
        </button>
      </div>

      <p class="mt-4 text-base text-[var(--bn-muted)]">Numbers so far: {{ said.join(', ') }}</p>
    </div>

    <!-- Step 4: done -->
    <div v-else class="text-center">
      <p class="bn-font-display text-3xl font-bold text-[var(--bn-navy)]">Great work!</p>
      <p class="mt-4 text-xl text-[var(--bn-navy)]">
        You counted {{ said.length }} numbers while you moved your body. That's your brain and body
        working together.
      </p>
      <div class="mt-8 flex flex-col gap-4">
        <button type="button" :class="primary" @click="start">Do it again</button>
        <button type="button" :class="secondary" @click="restart">Try another level</button>
      </div>
    </div>
  </div>
</template>

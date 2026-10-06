<script setup lang="ts">
  import {
    WALK_ROUND_SECONDS,
    WALK_START_NUMBER,
    answerChoices,
    nextCount,
    nextWalkSecond,
    type CountStep,
  } from '~/data/dual-task/move-and-think'

  const running = ref(false)
  const secondsLeft = ref(WALK_ROUND_SECONDS)
  const step = ref<CountStep>(3)
  const current = ref(WALK_START_NUMBER)
  const correctFirst = ref(true)
  const correctCount = ref(0)
  const answeredCount = ref(0)
  const status = ref('')

  let clockTimer: ReturnType<typeof setInterval> | undefined

  const choices = computed(() => answerChoices(current.value, step.value, correctFirst.value))

  const btnBase =
    'inline-flex min-h-[72px] w-full items-center justify-center rounded-2xl px-6 py-3 text-2xl font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4'
  const btnPrimary = `${btnBase} bg-orange-700 text-white hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-50`
  const btnQuiet = `${btnBase} border-2 border-slate-400 bg-white text-[var(--bn-navy)] hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50`

  function clearTimers() {
    if (clockTimer) clearInterval(clockTimer)
    clockTimer = undefined
  }

  function armTimers() {
    clearTimers()
    clockTimer = setInterval(() => {
      const next = nextWalkSecond(secondsLeft.value)
      secondsLeft.value = next.secondsLeft
      if (!next.finished) return
      running.value = false
      clearTimers()
      status.value = `Round complete. You got ${correctCount.value} of ${answeredCount.value} right.`
    }, 1000)
  }

  function startRound() {
    secondsLeft.value = WALK_ROUND_SECONDS
    current.value = WALK_START_NUMBER
    correctCount.value = 0
    answeredCount.value = 0
    correctFirst.value = true
    status.value = `Round started. Say ${WALK_START_NUMBER}, then count back by ${step.value}.`
    if (running.value) {
      armTimers()
      return
    }
    running.value = true
  }

  function chooseStep(nextStep: CountStep) {
    if (running.value) return
    step.value = nextStep
  }

  function chooseAnswer(choice: { value: number; correct: boolean }) {
    if (!running.value) return
    const upcoming = nextCount(current.value, step.value)
    answeredCount.value += 1
    if (choice.correct) correctCount.value += 1
    status.value = choice.correct
      ? `Yes. ${upcoming}. Keep walking.`
      : `The next number is ${upcoming}. Keep walking.`
    current.value = upcoming
    correctFirst.value = !correctFirst.value
  }

  watch(running, (isRunning) => {
    if (isRunning) armTimers()
    else clearTimers()
  })

  onUnmounted(clearTimers)
</script>

<template>
  <section class="mt-6 min-w-0 text-2xl text-[var(--bn-navy)]">
    <p class="text-lg leading-relaxed text-[var(--bn-muted)] sm:text-xl">
      Walk at your own pace and say each number out loud. Count backward by 3s or by 7s. Hold a
      chair if you need to.
    </p>

    <div class="mt-6 grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        :class="step === 3 ? btnPrimary : btnQuiet"
        :aria-pressed="step === 3"
        :disabled="running"
        @click="chooseStep(3)"
      >
        Count by 3s
      </button>
      <button
        type="button"
        :class="step === 7 ? btnPrimary : btnQuiet"
        :aria-pressed="step === 7"
        :disabled="running"
        @click="chooseStep(7)"
      >
        Count by 7s
      </button>
    </div>

    <p aria-live="polite" class="mt-4 min-h-[2.5rem] text-xl font-semibold text-green-800">
      {{ status }}
    </p>

    <div class="mt-6 min-w-0 rounded-2xl border border-[var(--bn-border)] bg-white p-6">
      <p class="text-sm font-bold tracking-wide text-[var(--bn-muted)] uppercase">Now say</p>
      <p class="bn-font-display mt-2 text-6xl font-bold">{{ current }}</p>
      <p class="mt-3 text-lg text-[var(--bn-muted)]">
        Count back by {{ step }}.
        <span class="mt-1 block">
          Time left:
          <strong class="text-[var(--bn-navy)]">{{ secondsLeft }}s</strong>
          · Correct:
          <strong class="text-[var(--bn-navy)]">{{ correctCount }}</strong>
        </span>
      </p>

      <p class="mt-6 text-lg font-semibold">What number comes next?</p>
      <div class="mt-3 grid gap-3">
        <button
          v-for="choice in choices"
          :key="choice.value"
          type="button"
          :class="btnQuiet"
          :disabled="!running"
          @click="chooseAnswer(choice)"
        >
          {{ choice.value }}
        </button>
      </div>

      <button type="button" :class="[btnPrimary, 'mt-6']" @click="startRound">
        {{ running ? 'Restart' : 'Start 60s walk' }}
      </button>
    </div>
  </section>
</template>

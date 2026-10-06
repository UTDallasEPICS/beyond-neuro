<script setup lang="ts">
  import {
    REACH_AND_REFLECT_CATEGORIES,
    ROUND_SECONDS,
    SIDE_SWITCH_MS,
    nextSecond,
    nextSide,
    pickCategory,
    type ReachSide,
  } from '~/data/dual-task/reach-and-reflect'

  const running = ref(false)
  const secondsLeft = ref(ROUND_SECONDS)
  const side = ref<ReachSide>('left')
  const category = ref<(typeof REACH_AND_REFLECT_CATEGORIES)[number]>(
    REACH_AND_REFLECT_CATEGORIES[0]
  )
  const named = ref<string[]>([])
  const draft = ref('')
  const status = ref('')

  let sideTimer: ReturnType<typeof setInterval> | undefined
  let clockTimer: ReturnType<typeof setInterval> | undefined

  const btnBase =
    'inline-flex min-h-[72px] w-full items-center justify-center rounded-2xl px-6 py-3 text-2xl font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4'
  const btnPrimary = `${btnBase} bg-orange-700 text-white hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-50`

  function clearTimers() {
    if (sideTimer) clearInterval(sideTimer)
    if (clockTimer) clearInterval(clockTimer)
    sideTimer = undefined
    clockTimer = undefined
  }

  function armTimers() {
    clearTimers()
    sideTimer = setInterval(() => {
      side.value = nextSide(side.value)
    }, SIDE_SWITCH_MS)
    clockTimer = setInterval(() => {
      const next = nextSecond(secondsLeft.value)
      secondsLeft.value = next.secondsLeft
      if (!next.finished) return
      running.value = false
      clearTimers()
      const count = named.value.length
      status.value = `Round complete. You named ${count} ${count === 1 ? 'item' : 'items'}.`
    }, 1000)
  }

  function startRound() {
    secondsLeft.value = ROUND_SECONDS
    named.value = []
    draft.value = ''
    side.value = 'left'
    category.value = pickCategory()
    status.value = `Round started. Name ${category.value}. Shift your weight to the left.`
    if (running.value) {
      armTimers()
      return
    }
    running.value = true
  }

  function addItem() {
    const item = draft.value.trim()
    if (!item || !running.value) return
    named.value = [item, ...named.value]
    draft.value = ''
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
      Pace yourself: shift weight left and right with the prompt while naming items in the
      category.
    </p>

    <p aria-live="polite" class="mt-4 min-h-[2.5rem] text-xl font-semibold text-green-800">
      {{ status }}
    </p>

    <div class="mt-6 grid min-w-0 gap-5">
      <div
        class="flex min-h-[220px] min-w-0 flex-col items-center justify-center rounded-2xl bg-[var(--bn-peach)] p-6"
      >
        <div class="flex max-w-full flex-wrap items-center justify-center gap-4" aria-hidden="true">
          <div
            class="flex size-24 items-center justify-center rounded-full text-xl font-semibold transition-transform sm:size-28 sm:text-2xl"
            :class="
              side === 'left'
                ? 'scale-110 bg-orange-700 text-white'
                : 'scale-95 bg-slate-300 text-slate-700'
            "
          >
            Left
          </div>
          <div
            class="flex size-24 items-center justify-center rounded-full text-xl font-semibold transition-transform sm:size-28 sm:text-2xl"
            :class="
              side === 'right'
                ? 'scale-110 bg-orange-700 text-white'
                : 'scale-95 bg-slate-300 text-slate-700'
            "
          >
            Right
          </div>
        </div>
        <p class="mt-4 text-center text-lg font-semibold text-orange-800">
          Shift weight gently. Sit if you need to.
        </p>
      </div>

      <div class="min-w-0 rounded-2xl border border-[var(--bn-border)] bg-white p-6">
        <p class="text-sm font-bold tracking-wide text-[var(--bn-muted)] uppercase">
          Name as many as you can
        </p>
        <h2 class="bn-font-display mt-2 text-3xl font-bold capitalize">{{ category }}</h2>
        <p class="mt-3 text-lg text-[var(--bn-muted)]">
          Time left:
          <strong class="text-[var(--bn-navy)]">{{ secondsLeft }}s</strong>
          · Named:
          <strong class="text-[var(--bn-navy)]">{{ named.length }}</strong>
        </p>

        <form class="mt-4 grid min-w-0 gap-3" @submit.prevent="addItem">
          <label class="sr-only" for="reach-item">Item name</label>
          <input
            id="reach-item"
            v-model="draft"
            :disabled="!running"
            :placeholder="running ? 'Type one and press enter' : 'Press Start to begin'"
            class="min-h-[72px] w-full min-w-0 rounded-2xl border-2 border-slate-500 bg-white px-4 text-2xl focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:outline-none disabled:bg-slate-100"
          />
          <button type="submit" :class="btnPrimary" :disabled="!running">Add</button>
        </form>

        <ul class="mt-4 flex max-h-32 list-none flex-wrap gap-2 overflow-y-auto p-0">
          <li
            v-for="(item, index) in named"
            :key="`${item}-${index}`"
            class="rounded-full bg-[var(--bn-peach)] px-4 py-1 text-lg font-semibold text-orange-800"
          >
            {{ item }}
          </li>
        </ul>

        <button type="button" :class="[btnPrimary, 'mt-6']" @click="startRound">
          {{ running ? 'Restart' : 'Start 60s round' }}
        </button>
      </div>
    </div>
  </section>
</template>

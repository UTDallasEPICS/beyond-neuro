<script setup lang="ts">
  // Counting Money game (Digital & VR Training): count the bills and coins, then pick the total.
  type Level = 'easy' | 'medium' | 'hard'
  type BillValue = 1 | 5 | 10 | 20 | 50 | 100
  type CoinValue = 1 | 5 | 10 | 25

  interface Denomination {
    id: string
    kind: 'bill' | 'coin'
    value: number
    cents: number
    name: string
  }

  // Largest first. All math is in whole cents to avoid rounding errors.
  const DENOMINATIONS: Denomination[] = [
    { id: 'b100', kind: 'bill', value: 100, cents: 10000, name: '$100 bill' },
    { id: 'b50', kind: 'bill', value: 50, cents: 5000, name: '$50 bill' },
    { id: 'b20', kind: 'bill', value: 20, cents: 2000, name: '$20 bill' },
    { id: 'b10', kind: 'bill', value: 10, cents: 1000, name: '$10 bill' },
    { id: 'b5', kind: 'bill', value: 5, cents: 500, name: '$5 bill' },
    { id: 'b1', kind: 'bill', value: 1, cents: 100, name: '$1 bill' },
    { id: 'c25', kind: 'coin', value: 25, cents: 25, name: 'Quarter (25¢)' },
    { id: 'c10', kind: 'coin', value: 10, cents: 10, name: 'Dime (10¢)' },
    { id: 'c5', kind: 'coin', value: 5, cents: 5, name: 'Nickel (5¢)' },
    { id: 'c1', kind: 'coin', value: 1, cents: 1, name: 'Penny (1¢)' },
  ]

  const LEVELS: Record<
    Level,
    { label: string; ids: string[]; minPieces: number; maxPieces: number; steps: number[] }
  > = {
    easy: {
      label: 'Easy — bills',
      ids: ['b10', 'b5', 'b1'],
      minPieces: 2,
      maxPieces: 4,
      steps: [100, 500],
    },
    medium: {
      label: 'Medium — bills & coins',
      ids: ['b20', 'b10', 'b5', 'b1', 'c25', 'c10'],
      minPieces: 3,
      maxPieces: 6,
      steps: [10, 25, 100],
    },
    hard: {
      label: 'Hard — all money',
      ids: DENOMINATIONS.map((d) => d.id),
      minPieces: 4,
      maxPieces: 8,
      steps: [1, 5, 25, 100],
    },
  }
  const LEVEL_ORDER: Level[] = ['easy', 'medium', 'hard']

  const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

  const level = ref<Level>('easy')
  const pieces = ref<Denomination[]>([])
  const choices = ref<number[]>([])
  const tried = ref<number[]>([])
  const solved = ref(false)
  const showBreakdown = ref(false)
  const roundsDone = ref(0)

  const totalCents = computed(() => pieces.value.reduce((sum, p) => sum + p.cents, 0))

  // "2 × $5 bill = $10.00" lines for counting together.
  const breakdown = computed(() => {
    const groups = new Map<string, { denomination: Denomination; count: number }>()
    for (const p of pieces.value) {
      const group = groups.get(p.id)
      if (group) group.count++
      else groups.set(p.id, { denomination: p, count: 1 })
    }
    return [...groups.values()]
  })

  const feedback = computed(() => {
    if (solved.value) return `Great counting! That's ${money(totalCents.value)}.`
    if (tried.value.length) return "Let's try that one again."
    return ''
  })

  function money(cents: number) {
    return USD.format(cents / 100)
  }

  function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  function shuffle<T>(items: T[]): T[] {
    const result = [...items]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j]!, result[i]!]
    }
    return result
  }

  function newRound() {
    const config = LEVELS[level.value]
    const options = DENOMINATIONS.filter((d) => config.ids.includes(d.id))
    const count = randomInt(config.minPieces, config.maxPieces)

    pieces.value = Array.from(
      { length: count },
      () => options[randomInt(0, options.length - 1)]!
    ).sort((a, b) => b.cents - a.cents)

    // 3 answers: the right total plus 2 nearby amounts.
    const total = totalCents.value
    const nearby = [...new Set(config.steps.flatMap((s) => [total + s, total - s]))].filter(
      (c) => c > 0 && c !== total
    )
    choices.value = shuffle([total, ...shuffle(nearby).slice(0, 2)])

    tried.value = []
    solved.value = false
    showBreakdown.value = false
  }

  function pickLevel(next: Level) {
    level.value = next
    newRound()
  }

  function choose(cents: number) {
    if (solved.value) return
    if (cents === totalCents.value) {
      solved.value = true
      roundsDone.value++
    } else {
      // Gentle redirect only — no penalty.
      tried.value.push(cents)
      if (tried.value.length >= 2) showBreakdown.value = true
    }
  }

  // Random money is created in the browser only, so server and browser render match.
  onMounted(newRound)
</script>

<template>
  <section class="bg-[#F5F1EA] px-4 py-12">
    <div class="mx-auto max-w-4xl">
      <h2 class="font-serif text-4xl font-bold text-[#231E5A]">Counting Money</h2>
      <p class="mt-3 text-lg text-gray-600">
        Practice an everyday skill. Count the bills and coins, then pick the total. Take your time —
        there is no timer.
      </p>

      <div
        class="mt-6 rounded-2xl border border-t-4 border-gray-200 border-t-[#231E5A] bg-white p-6 sm:p-8"
      >
        <div class="flex items-center gap-3">
          <span class="flex h-11 w-11 items-center justify-center rounded-full bg-[#ECEBFB]">
            <UIcon name="i-heroicons-banknotes" class="h-5 w-5 text-[#231E5A]" aria-hidden="true" />
          </span>
          <span class="text-sm font-semibold tracking-[0.15em] text-[#231E5A] uppercase">
            Counting Money — Interactive
          </span>
        </div>

        <!-- Level (free pick, any time) -->
        <div class="mt-5 flex flex-wrap gap-2" role="group" aria-label="Level">
          <button
            v-for="key in LEVEL_ORDER"
            :key="key"
            type="button"
            :aria-pressed="level === key"
            class="min-h-12 rounded-full border px-5 text-lg focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#231E5A]"
            :class="
              level === key
                ? 'border-[#231E5A] bg-[#231E5A] text-white'
                : 'border-[#DCD9F0] bg-white text-[#231E5A]'
            "
            @click="pickLevel(key)"
          >
            {{ LEVELS[key].label }}
          </button>
        </div>

        <!-- The money -->
        <div
          role="group"
          aria-label="Money to count"
          class="mt-5 flex min-h-40 flex-wrap items-end gap-4 rounded-2xl border border-[#DCD9F0] bg-[#ECEBFB] p-4"
        >
          <figure
            v-for="(piece, i) in pieces"
            :key="`${piece.id}-${i}`"
            class="flex flex-col items-center gap-1"
          >
            <USBill v-if="piece.kind === 'bill'" :dollars="piece.value as BillValue" class="w-52" />
            <USCoin v-else :cents="piece.value as CoinValue" />
            <figcaption class="text-base text-gray-700">{{ piece.name }}</figcaption>
          </figure>
        </div>

        <!-- Answer choices -->
        <p class="mt-6 text-xl font-semibold text-[#231E5A]">How much money is this?</p>
        <div class="mt-3 grid gap-3 sm:grid-cols-3">
          <button
            v-for="cents in choices"
            :key="cents"
            type="button"
            class="min-h-16 rounded-xl border-2 bg-white text-2xl font-semibold text-gray-900 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#231E5A] disabled:opacity-40"
            :class="
              solved && cents === totalCents ? 'border-green-600 bg-green-50' : 'border-[#DCD9F0]'
            "
            :disabled="tried.includes(cents) || (solved && cents !== totalCents)"
            @click="choose(cents)"
          >
            {{ money(cents) }}
          </button>
        </div>

        <!-- Feedback -->
        <div aria-live="polite" class="mt-4 space-y-3 text-lg">
          <p v-if="feedback" :class="solved ? 'font-semibold text-green-800' : 'text-[#231E5A]'">
            {{ feedback }}
          </p>
          <div v-if="showBreakdown && !solved" class="rounded-xl bg-[#F5F1EA] p-4">
            <p class="font-semibold">Let's count together:</p>
            <ul class="mt-1">
              <li v-for="group in breakdown" :key="group.denomination.id">
                {{ group.count }} × {{ group.denomination.name }} =
                {{ money(group.count * group.denomination.cents) }}
              </li>
            </ul>
            <p class="mt-1 font-semibold">All together: {{ money(totalCents) }}</p>
          </div>
        </div>

        <button
          v-if="solved"
          type="button"
          class="mt-4 min-h-14 rounded-xl bg-[#231E5A] px-6 text-xl font-semibold text-white focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#231E5A]"
          @click="newRound"
        >
          Next round →
        </button>

        <p class="mt-4 text-gray-600">Rounds counted: {{ roundsDone }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  //the title shown on the browser tab - screen readers announce it first (WCAG 2.4.2)
  useHead({ title: 'Calendar — BeyondNeuro' })

  //everything we need to know about one row (one day) of the week
  type DayColumn = {
    //a unique name for each day, like "Sat Oct 03 2026"
    //vue needs it for v-for, and we will also use it later for saving
    key: string
    //short day name for the start of the row, like "Sat"
    shortName: string
    //the day of the month, like 3
    dateNumber: number
    //the full date for screen readers, like "Saturday, October 3"
    fullLabel: string
    isToday: boolean
  }

  //today's date written out in words (example: "Saturday, October 3, 2026")
  const todayLabel = ref('')

  //the 7 days of this week - starts empty and gets filled in once the page is open
  const weekDays = ref<DayColumn[]>([])

  //builds the 7 days (sunday to saturday) of the week that contains "today"
  function buildWeek(today: Date): DayColumn[] {
    //getDay() gives 0 for sunday, 1 for monday ... 6 for saturday
    //so going back that many days always lands on this week's sunday
    const sunday = new Date(today)
    sunday.setDate(today.getDate() - today.getDay())

    const days: DayColumn[] = []
    for (let i = 0; i < 7; i++) {
      //start at sunday and move forward i days
      const day = new Date(sunday)
      day.setDate(sunday.getDate() + i)

      days.push({
        key: day.toDateString(),
        shortName: day.toLocaleDateString('en-US', { weekday: 'short' }),
        dateNumber: day.getDate(),
        fullLabel: day.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        }),
        isToday: day.toDateString() === today.toDateString(),
      })
    }
    return days
  }

  //onMounted runs after the page appears in the user's browser
  //we wait until then so the dates come from the user's own device and time zone
  onMounted(() => {
    const now = new Date()
    todayLabel.value = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    weekDays.value = buildWeek(now)
  })

  //opens the browser's print window
  function printBoard() {
    window.print()
  }
</script>

<template>
  <div>
    <h2 class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">
      Calendar
    </h2>

    <p class="mt-1 text-lg text-[var(--bn-muted)]">
      Write or draw your plans for the week.
    </p>

    <section
      class="mt-6 rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 sm:p-10"
      aria-labelledby="week-instructions"
    >
      <h3
        id="week-instructions"
        class="text-lg font-bold tracking-wide text-orange-800 uppercase"
      >
        Try it now — interactive
      </h3>

      <p class="mt-3 text-lg leading-relaxed text-[var(--bn-navy)] sm:text-xl">
        Write or draw a plan beside each day using your finger,
        pen, or mouse. You can print your board when you are ready.
      </p>

      <div class="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p class="text-xl text-[var(--bn-navy)]">
          {{
            todayLabel
              ? `Today is ${todayLabel}`
              : 'Loading this week…'
          }}
        </p>

        <button
          type="button"
          class="week-print-button min-h-[96px] min-w-[96px] rounded-2xl border-2 border-slate-400 bg-white px-6 py-3 text-2xl font-semibold text-[var(--bn-navy)] hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
          @click="printBoard"
        >
          Print
        </button>
      </div>

      <div
        class="mt-6 overflow-hidden rounded-2xl border-2 border-[var(--bn-border)] bg-white"
      >
        <section
          v-for="day in weekDays"
          :key="day.key"
          class="week-day flex flex-col border-t-2 border-[var(--bn-border)] first:border-t-0 sm:flex-row"
        >
          <h3
            class="m-0 flex shrink-0 flex-row items-center justify-center gap-3 border-b-2 border-[var(--bn-border)] px-2 py-4 text-[var(--bn-navy)] sm:w-32 sm:flex-col sm:gap-1 sm:border-r-2 sm:border-b-0"
            :class="
              day.isToday
                ? 'bg-[#dcd9f2]'
                : 'bg-[var(--bn-cream)]'
            "
          >
            <span class="sr-only">
              {{ day.fullLabel }}{{ day.isToday ? ', today' : '' }}
            </span>

            <span
              class="text-2xl font-semibold"
              aria-hidden="true"
            >
              {{ day.shortName }}
            </span>

            <span
              class="text-4xl font-bold"
              aria-hidden="true"
            >
              {{ day.dateNumber }}
            </span>

            <span
              v-if="day.isToday"
              class="rounded-full bg-[var(--bn-navy)] px-3 py-1 text-2xl font-semibold text-white"
              aria-hidden="true"
            >
              Today
            </span>
          </h3>

          <DrawingPad
            class="min-w-0 flex-1 bg-white"
            :label="day.fullLabel"
          />
        </section>
      </div>
    </section>
  </div>
</template>
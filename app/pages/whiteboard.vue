<script setup lang="ts">
  //the title shown on the browser tab - screen readers announce it first (WCAG 2.4.2)
  useHead({ title: 'My Week' })

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

<!--
  styled with tailwind classes - colors come from the figma design:
  navy #27265f, lavender #dcd9f2, cream #fbf2e8, soft border #e6e0d6,
  green label #2f6b3c (a darker version of the figma green so it is easier to read - rule 3)
-->
<template>
  <div class="flex min-h-screen flex-col bg-[#fbf2e8] lg:flex-row">
    <!-- phones/tablets: sidebar on top, page below (flex-col)
         big screens (lg:): sidebar on the left, page on the right (lg:flex-row) -->

    <!-- the sidebar (the code is in app/components/AppSidebar.vue) -->
    <AppSidebar />

    <!-- the page content - flex-1 takes all the space next to the sidebar -->
    <div class="min-w-0 flex-1 px-4 py-10 lg:px-10">
      <!-- small green label above the heading, like "Finish the Thought Activity Complete" in figma -->
      <p class="text-2xl font-semibold text-[#2f6b3c]">Reality Orientation</p>

      <!-- heading on the left, print button on the right (wraps underneath on small screens) -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <!-- font-serif: a serif font like the figma headings -->
        <h1 class="font-serif text-[40px] font-bold text-[#27265f]">My Week</h1>

        <!-- min-h-24 / min-w-24 = 96px, about 72pt - the client's minimum button size (rule 9) -->
        <button
          class="min-h-24 min-w-24 cursor-pointer rounded-full border-2 border-[#27265f] bg-[#27265f] px-7 text-2xl text-white focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#27265f]"
          @click="printBoard"
        >
          Print
        </button>
      </div>

      <!-- text-[28px] - everything is 24px (about 18pt) or bigger (rule 1) -->
      <p class="mt-2 text-[28px] text-[#27265f]">Today is {{ todayLabel }}</p>

      <!-- white rounded card with a soft shadow, like the figma design -->
      <div class="mt-6 rounded-[20px] bg-white p-4 shadow-sm sm:p-8">
        <!-- the 7 days stacked top to bottom: sunday first, saturday last -->
        <div class="flex flex-col overflow-hidden rounded-2xl border-2 border-[#e6e0d6]">
          <!-- phones: date on top of the writing space (flex-col)
               bigger screens (sm:): date on the left, writing space on the right (sm:flex-row) -->
          <section
            v-for="day in weekDays"
            :key="day.key"
            class="flex flex-col border-t-2 border-[#e6e0d6] first:border-t-0 sm:flex-row"
          >
            <!-- each day is a heading so screen reader users can jump from day to day (WCAG 1.3.1)
                 today gets a lavender background AND the word "Today" - never color alone -->
            <h2
              class="m-0 flex shrink-0 flex-row items-center justify-center gap-3 border-b-2 border-[#e6e0d6] px-1 py-3 text-[#27265f] sm:w-40 sm:flex-col sm:gap-1 sm:border-r-2 sm:border-b-0"
              :class="{ 'bg-[#dcd9f2]': day.isToday }"
            >
              <!-- sr-only: hidden on screen but read by screen readers -->
              <span class="sr-only">{{ day.fullLabel }}{{ day.isToday ? ', today' : '' }}</span>

              <!-- aria-hidden="true" means screen readers skip these, so the date is not read twice -->
              <span class="text-2xl font-semibold" aria-hidden="true">{{ day.shortName }}</span>
              <span class="text-4xl font-bold" aria-hidden="true">{{ day.dateNumber }}</span>
              <span
                v-if="day.isToday"
                class="rounded-full bg-[#27265f] px-3 py-0.5 text-2xl font-bold text-white"
                aria-hidden="true"
              >
                Today
              </span>
            </h2>

            <!-- one drawing pad per day (the code is in app/components/DrawingPad.vue) -->
            <DrawingPad class="min-w-0 flex-1 bg-white" :label="day.fullLabel" />
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

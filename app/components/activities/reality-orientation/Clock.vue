
<script setup>

//need to import some tools from vue

import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
//set text on browser tab

useHead({ title: 'Reality Orientation | Beyond Neuro' })

//display the day, date, and time

//now will hold the current date and time.

const now = ref(null)

let timer = null

//the following three statements will give now an actual value. One of them gives the day, the other the date, and the other the time

const day = computed(() =>
now.value ? now.value.toLocaleDateString('en-US', { weekday: 'long' }) : '',
)
const date = computed(() =>
now.value
? now.value.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
: '',
)
const time = computed(() =>
now.value ? now.value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
)

//the partOfDay function will calculate whether it is morning, afternoon, evening, or night based on the hour range

const partOfDay = computed(() => {
if (!now.value) return ''
const hour = now.value.getHours()
if (hour < 5) return 'Night'
if (hour < 12) return 'Morning'
if (hour < 17) return 'Afternoon'
if (hour < 21) return 'Evening'
return 'Night'
})

//Now we need to create the to-do/task list

//create the name the list is saved under (like a label)

const STORAGE_KEY = 'bn-reality-orientation-plan'

//tasks is going to be a list of the to-dos with three examples already listed

const tasks = ref([
{ id: 1, text: 'Morning tea and a few stretches', done: false },
{ id: 2, text: 'Walk in the garden after lunch', done: false },
{ id: 3, text: 'Phone call with family at 4pm', done: false },
])

//newTask will hold whatever is typed into the input box, and message will display text if the reader doesn't type anything and tries to add

const newTask = ref('')
const message = ref('')

//doneCount will keep the tasks that are marked as done, and will count the length

const doneCount = computed(() => tasks.value.filter((task) => task.done).length)

//the addTask method will run once add is clicked or enter is clicked

function addTask() {
const text = newTask.value.trim()
if (!text) {
message.value = 'Type something to add when you are ready.'
return
}
tasks.value.push({ id: Date.now(), text, done: false })
newTask.value = ''
message.value = ''
}

//the removeTask function keeps every task except one with id

function removeTask(id) {
tasks.value = tasks.value.filter((task) => task.id !== id)
}

//watch will save the list every time it changes

watch(
tasks,
(value) => {
try {
localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
} catch {}
},
{ deep: true },
)

//clean up

onMounted(() => {
now.value = new Date()
timer = setInterval(() => {
now.value = new Date()
}, 1000)

try {
const saved = localStorage.getItem(STORAGE_KEY)
if (saved) tasks.value = JSON.parse(saved)
} catch {}
})

//clear interval will stop the timer so that it doesn't keep running when you leave the page
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div>
    <h2 class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">
      Today at a glance
    </h2>

    <p class="mt-1 text-lg text-[var(--bn-muted)]">
      Check the time and follow your plans at your own pace.
    </p>

    <section
      class="mt-6 rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 sm:p-10"
      aria-labelledby="clock-instructions"
    >
      <h3
        id="clock-instructions"
        class="text-lg font-bold tracking-wide text-orange-800 uppercase"
      >
        Try it now — interactive
      </h3>

      <p class="mt-3 text-lg leading-relaxed text-[var(--bn-navy)] sm:text-xl">
        Look at today's day, date, and time.
        Add something to your plan and check it off when it is done.
      </p>

      <div class="mt-6 grid min-w-0 gap-6">
        <!-- Day, date, and time -->
        <section
          class="flex min-w-0 flex-col items-center justify-center rounded-2xl border border-[var(--bn-border)] bg-white p-6 text-center sm:p-8"
          aria-label="Today's day, date, and time"
        >
          <p class="text-lg text-[var(--bn-muted)]">
            Today is
          </p>

          <p
            class="bn-font-display mt-2 text-4xl font-bold text-[var(--bn-navy)] sm:text-5xl"
          >
            {{ day }}
          </p>

          <p class="mt-3 text-2xl text-[var(--bn-navy)]">
            {{ date }}
          </p>

          <span
            v-if="partOfDay"
            class="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-[var(--bn-navy)] px-5 py-2 text-lg font-semibold text-white"
          >
            {{ partOfDay }}
          </span>

          <p
            class="bn-font-display mt-5 text-4xl font-bold text-[var(--bn-navy)] tabular-nums sm:text-5xl"
          >
            {{ time }}
          </p>
        </section>

        <!-- Daily plan -->
        <section
          class="min-w-0 rounded-2xl border border-[var(--bn-border)] bg-white p-6 sm:p-8"
          aria-labelledby="plan-heading"
        >
          <h3
            id="plan-heading"
            class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]"
          >
            Today's plan
          </h3>

          <p
            v-if="tasks.length"
            class="mt-2 text-lg text-[var(--bn-muted)]"
            aria-live="polite"
          >
            {{ doneCount }} of {{ tasks.length }} done
          </p>

          <ul class="mt-5 flex list-none flex-col gap-2 p-0">
            <li
              v-if="!tasks.length"
              class="py-4 text-lg text-[var(--bn-muted)]"
            >
              Nothing planned yet.
              Add one thing you would like to do today.
            </li>

            <li
              v-for="task in tasks"
              :key="task.id"
              class="flex items-center gap-3 border-b border-[var(--bn-border)] py-3 last:border-b-0"
            >
              <label
                :for="`task-${task.id}`"
                class="flex min-h-[56px] min-w-0 flex-1 cursor-pointer items-center gap-4"
              >
                <span class="relative grid shrink-0 place-items-center">
                  <input
                    :id="`task-${task.id}`"
                    v-model="task.done"
                    type="checkbox"
                    class="peer size-8 cursor-pointer appearance-none rounded-full border-2 border-[var(--bn-navy)] checked:bg-[var(--bn-navy)] focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
                  />

                  <svg
                    class="pointer-events-none absolute hidden size-4 peer-checked:block"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    stroke-width="3.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </span>

                <span
                  class="min-w-0 text-lg break-words"
                  :class="
                    task.done
                      ? 'text-[var(--bn-muted)] line-through'
                      : 'text-[var(--bn-navy)]'
                  "
                >
                  {{ task.text }}
                </span>
              </label>

              <button
                type="button"
                class="flex min-h-[56px] min-w-[56px] shrink-0 items-center justify-center rounded-2xl border border-[var(--bn-border)] text-[var(--bn-navy)] hover:bg-[var(--bn-peach)] focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
                :aria-label="`Remove ${task.text}`"
                @click="removeTask(task.id)"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </li>
          </ul>

          <label
            for="new-task"
            class="mt-6 block text-lg font-semibold text-[var(--bn-navy)]"
          >
            Add to today's plan
          </label>

          <div class="mt-2 flex flex-wrap gap-3">
            <input
              id="new-task"
              v-model="newTask"
              type="text"
              autocomplete="off"
              class="min-h-[56px] min-w-0 flex-1 rounded-2xl border-2 border-slate-400 bg-white px-4 py-3 text-lg text-[var(--bn-navy)] focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
              @input="message = ''"
              @keydown.enter.prevent="addTask"
            />

            <button
              type="button"
              class="min-h-[56px] rounded-2xl border-2 border-[var(--bn-navy)] bg-[var(--bn-navy)] px-6 py-3 text-lg font-semibold text-white focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
              @click="addTask"
            >
              Add
            </button>
          </div>

          <p
            class="mt-3 text-lg text-[var(--bn-navy)]"
            role="status"
            aria-live="polite"
          >
            {{ message }}
          </p>
        </section>
      </div>
    </section>
  </div>
</template>
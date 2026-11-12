<script setup lang="ts">
import { computed, ref } from 'vue'

interface Blank {
  answer: string
  options: string[]
}

interface Exercise {
  parts: string[]
  blanks: Blank[]
}

interface Level {
  id: number
  hint: string
  exercises: Exercise[]
}

const levels: Level[] = [
  {
    id: 1,
    hint: 'One blank · 2 choices',
    exercises: [
      {
        parts: ['I drink ', '.'],
        blanks: [
          { answer: 'water', options: ['water', 'shoes'] },
        ],
      },
      {
        parts: ['I sit on a ', '.'],
        blanks: [
          { answer: 'chair', options: ['spoon', 'chair'] },
        ],
      },
      {
        parts: ['I read a ', '.'],
        blanks: [
          { answer: 'book', options: ['book', 'plate'] },
        ],
      },
    ],
  },
  {
    id: 2,
    hint: 'One blank · 3 choices',
    exercises: [
      {
        parts: ['I wash my hands with ', '.'],
        blanks: [
          { answer: 'soap', options: ['paper', 'soap', 'bread'] },
        ],
      },
      {
        parts: ['I wear shoes on my ', '.'],
        blanks: [
          { answer: 'feet', options: ['feet', 'hands', 'head'] },
        ],
      },
      {
        parts: ['I use a key to open the ', '.'],
        blanks: [
          { answer: 'door', options: ['pillow', 'cup', 'door'] },
        ],
      },
    ],
  },
  {
    id: 3,
    hint: 'Everyday sentences',
    exercises: [
      {
        parts: ['Before going outside in the rain, I take an ', '.'],
        blanks: [
          {
            answer: 'umbrella',
            options: ['envelope', 'umbrella', 'apron'],
          },
        ],
      },
      {
        parts: ['When the room is dark, I turn on the ', '.'],
        blanks: [
          { answer: 'light', options: ['light', 'tap', 'fan'] },
        ],
      },
      {
        parts: ['To remember what I need at the store, I write a ', '.'],
        blanks: [
          { answer: 'list', options: ['recipe', 'letter', 'list'] },
        ],
      },
    ],
  },
  {
    id: 4,
    hint: 'Two blanks · 2 choices',
    exercises: [
      {
        parts: ['I pour ', ' into my ', '.'],
        blanks: [
          { answer: 'tea', options: ['tea', 'socks'] },
          { answer: 'cup', options: ['pillow', 'cup'] },
        ],
      },
      {
        parts: ['I put my ', ' on before going ', '.'],
        blanks: [
          { answer: 'shoes', options: ['shoes', 'plate'] },
          { answer: 'outside', options: ['asleep', 'outside'] },
        ],
      },
      {
        parts: ['I use a ', ' to write on ', '.'],
        blanks: [
          { answer: 'pen', options: ['fork', 'pen'] },
          { answer: 'paper', options: ['paper', 'soup'] },
        ],
      },
    ],
  },
  {
    id: 5,
    hint: 'Two blanks · 3 choices',
    exercises: [
      {
        parts: ['I keep ', ' in the fridge so it stays ', '.'],
        blanks: [
          { answer: 'milk', options: ['soap', 'milk', 'mail'] },
          { answer: 'cold', options: ['loud', 'dry', 'cold'] },
        ],
      },
      {
        parts: ['I put a ', ' on the envelope before I ', ' it.'],
        blanks: [
          { answer: 'stamp', options: ['stamp', 'spoon', 'sock'] },
          { answer: 'mail', options: ['wash', 'mail', 'cook'] },
        ],
      },
      {
        parts: ['I use a ', ' to cut a slice of ', '.'],
        blanks: [
          { answer: 'knife', options: ['towel', 'comb', 'knife'] },
          { answer: 'bread', options: ['bread', 'water', 'tea'] },
        ],
      },
    ],
  },
  {
    id: 6,
    hint: 'Two connected sentences',
    exercises: [
      {
        parts: [
          'It is raining. I take my ',
          ' to stay ',
          '.',
        ],
        blanks: [
          {
            answer: 'umbrella',
            options: ['pillow', 'umbrella', 'plate'],
          },
          { answer: 'dry', options: ['dry', 'hungry', 'asleep'] },
        ],
      },
      {
        parts: [
          'I want to read. I pick up a ',
          ' and turn on the ',
          '.',
        ],
        blanks: [
          { answer: 'book', options: ['pan', 'shoe', 'book'] },
          { answer: 'lamp', options: ['tap', 'lamp', 'oven'] },
        ],
      },
      {
        parts: [
          'My friend is coming for tea. I set out two ',
          ' and boil some ',
          '.',
        ],
        blanks: [
          { answer: 'cups', options: ['cups', 'coats', 'keys'] },
          { answer: 'water', options: ['paper', 'water', 'bread'] },
        ],
      },
    ],
  },
  {
    id: 7,
    hint: 'A short everyday story',
    exercises: [
      {
        parts: [
          'I am going shopping. I write a ',
          ' of what I need. At the store, I put the items in my ',
          ' and pay at the ',
          '.',
        ],
        blanks: [
          { answer: 'list', options: ['letter', 'list', 'story'] },
          { answer: 'basket', options: ['basket', 'oven', 'sink'] },
          {
            answer: 'checkout',
            options: ['bedroom', 'garden', 'checkout'],
          },
        ],
      },
      {
        parts: [
          'I am planting a flower. I fill a pot with ',
          '. I add the plant and give it some ',
          '. Then I place it near a ',
          ' for sunlight.',
        ],
        blanks: [
          { answer: 'soil', options: ['soap', 'soil', 'ice'] },
          { answer: 'water', options: ['water', 'flour', 'salt'] },
          { answer: 'window', options: ['drawer', 'freezer', 'window'] },
        ],
      },
      {
        parts: [
          'I am writing to a friend. I write my message on ',
          '. I put it in an ',
          '. Then I add a stamp and place it in the ',
          '.',
        ],
        blanks: [
          { answer: 'paper', options: ['glass', 'paper', 'bread'] },
          {
            answer: 'envelope',
            options: ['envelope', 'apron', 'umbrella'],
          },
          {
            answer: 'mailbox',
            options: ['fridge', 'sink', 'mailbox'],
          },
        ],
      },
    ],
  },
]

const selectedLevel = ref(0)
const exerciseIndex = ref(0)
const answers = ref<string[]>([])
const feedback = ref('')

const currentLevel = computed(() => levels[selectedLevel.value]!)
const exercise = computed(
  () => currentLevel.value.exercises[exerciseIndex.value]!,
)

const activeBlankIndex = computed(() => answers.value.length)

const completed = computed(
  () => answers.value.length === exercise.value.blanks.length,
)

const activeBlank = computed(
  () => exercise.value.blanks[activeBlankIndex.value],
)

const isLastExercise = computed(
  () => exerciseIndex.value === currentLevel.value.exercises.length - 1,
)

const completedSentence = computed(() =>
  exercise.value.parts
    .map((part, index) => part + (answers.value[index] ?? ''))
    .join(''),
)

const buttonClass =
  'min-h-[56px] rounded-2xl border-2 border-slate-400 bg-white px-6 py-3 text-lg font-semibold text-[var(--bn-navy)] hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none'

function clearExercise() {
  answers.value = []
  feedback.value = ''
}

function chooseLevel(index: number) {
  selectedLevel.value = index
  exerciseIndex.value = 0
  clearExercise()
}

function chooseAnswer(option: string) {
  if (completed.value || !activeBlank.value) return

  if (option !== activeBlank.value.answer) {
    feedback.value = 'Try another word. Take your time.'
    return
  }

  answers.value.push(option)

  feedback.value = completed.value
    ? 'Well done! You completed the sentence.'
    : 'That fits. Now choose a word for the next blank.'
}

function nextExercise() {
  if (!completed.value) return

  exerciseIndex.value = isLastExercise.value
    ? 0
    : exerciseIndex.value + 1

  clearExercise()
}
</script>

<template>
  <div>
    <h2 class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">
      Choose a level
    </h2>

    <p class="mt-1 text-lg text-[var(--bn-muted)]">
      You can change this any time.
    </p>

    <div
      class="mt-4 grid auto-rows-[minmax(120px,auto)] grid-cols-2 gap-4 sm:grid-cols-4"
      role="group"
      aria-label="Difficulty level"
    >
      <button
        v-for="(option, index) in levels"
        :key="option.id"
        type="button"
        class="flex h-full min-w-0 flex-col items-start justify-start rounded-2xl border-2 p-4 text-left transition-colors focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
        :class="
          selectedLevel === index
            ? 'border-orange-700 bg-[var(--bn-peach)]'
            : 'border-slate-300 bg-white hover:bg-slate-50'
        "
        :aria-pressed="selectedLevel === index"
        @click="chooseLevel(index)"
      >
        <span class="block text-lg leading-7 font-bold text-[var(--bn-navy)]">
          Level {{ option.id }}
        </span>

        <span class="mt-1 block text-lg leading-7 text-[var(--bn-muted)]">
          {{ option.hint }}
        </span>
      </button>
    </div>

    <section
      class="mt-6 rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 sm:p-10"
      aria-labelledby="sentence-instructions"
    >
      <h2
        id="sentence-instructions"
        class="text-lg font-bold tracking-wide text-orange-800 uppercase"
      >
        Try it now — interactive
      </h2>

      <p class="mt-3 text-lg leading-relaxed text-[var(--bn-navy)] sm:text-xl">
        Choose a word to fill the highlighted blank.
        Take your time — there is no timer.
      </p>

      <div class="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p class="text-lg text-[var(--bn-muted)]">
          Activity {{ exerciseIndex + 1 }}
          of {{ currentLevel.exercises.length }}
        </p>

        <button
          type="button"
          :class="buttonClass"
          @click="clearExercise"
        >
          Clear
        </button>
      </div>

      <div
        class="mt-6 rounded-2xl border border-[var(--bn-border)] bg-white p-6 sm:p-8"
      >
        <p
          v-if="!completed"
          class="text-2xl leading-[2.4] text-[var(--bn-navy)] sm:text-3xl"
        >
          <template
            v-for="(part, index) in exercise.parts"
            :key="index"
          >
            <span>{{ part }}</span>

            <span
              v-if="index < exercise.blanks.length"
              class="mx-1 inline-block min-w-[80px] rounded-lg border-b-4 px-3 text-center font-semibold"
              :class="
                index < answers.length
                  ? 'border-[var(--bn-navy)] bg-[var(--bn-cream)]'
                  : index === activeBlankIndex
                    ? 'border-orange-700 bg-[var(--bn-peach)]'
                    : 'border-slate-300 bg-slate-50'
              "
              :aria-label="
                index < answers.length
                  ? undefined
                  : `Blank ${index + 1}${index === activeBlankIndex ? ', current blank' : ''}`
              "
            >
              {{ answers[index] ?? '\u00A0' }}
            </span>
          </template>
        </p>

        <p
          v-else
          class="text-2xl leading-relaxed text-[var(--bn-navy)] sm:text-3xl"
        >
          {{ completedSentence }}
        </p>
      </div>

      <div v-if="!completed" class="mt-6">
        <h3
          id="word-choice-heading"
          class="text-lg font-semibold text-[var(--bn-navy)]"
        >
          Choose a word for blank {{ activeBlankIndex + 1 }}
          of {{ exercise.blanks.length }}
        </h3>

        <div
          class="mt-3 flex flex-wrap gap-3"
          role="group"
          aria-labelledby="word-choice-heading"
        >
          <button
            v-for="option in activeBlank?.options ?? []"
            :key="`${selectedLevel}-${exerciseIndex}-${activeBlankIndex}-${option}`"
            type="button"
            :class="buttonClass"
            @click="chooseAnswer(option)"
          >
            {{ option }}
          </button>
        </div>
      </div>

      <p
        class="mt-6 min-h-[56px] text-lg font-semibold text-[var(--bn-navy)]"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {{ feedback }}
      </p>

      <button
        v-if="completed"
        type="button"
        :class="buttonClass"
        @click="nextExercise"
      >
        {{ isLastExercise ? 'Practice Again' : 'Next Activity' }}
      </button>
    </section>
  </div>
</template>
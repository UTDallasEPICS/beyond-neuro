<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

type Mode = 'separate' | 'shared' | 'arrange' | 'complete' | 'message'

interface Exercise {
  title: string
  parts?: string[]
  choices?: string[][]
  bank?: string[]
  pieces?: string[]
  starter?: string
  ideas?: string[]
  exampleStarter?: string
}

interface Level {
  id: number
  hint: string
  mode: Mode
  exercises: Exercise[]
}

const levels: Level[] = [
  {
    id: 1,
    hint: 'One blank · 2 choices',
    mode: 'separate',
    exercises: [
      {
        title: 'Choose a drink',
        parts: ['I would like some ', '.'],
        choices: [['tea', 'coffee']],
      },
      {
        title: 'Choose an activity',
        parts: ['I would like to ', '.'],
        choices: [['read', 'rest']],
      },
      {
        title: 'Choose a place',
        parts: ['I would like to sit ', '.'],
        choices: [['inside', 'outside']],
      },
    ],
  },
  {
    id: 2,
    hint: 'One blank · 4 choices',
    mode: 'separate',
    exercises: [
      {
        title: 'Something to enjoy',
        parts: ['Today, I would like to ', '.'],
        choices: [
          ['read a book', 'take a walk', 'listen to music', 'rest'],
        ],
      },
      {
        title: 'Your preference',
        parts: ['I enjoy spending time ', '.'],
        choices: [
          ['at home', 'outside', 'with friends', 'with family'],
        ],
      },
      {
        title: 'Make a simple plan',
        parts: ['This afternoon, I would like to ', '.'],
        choices: [
          ['call someone', 'watch a movie', 'have tea', 'relax'],
        ],
      },
    ],
  },
  {
    id: 3,
    hint: 'Two blanks · separate choices',
    mode: 'separate',
    exercises: [
      {
        title: 'A drink with someone',
        parts: ['I would like ', ' with ', '.'],
        choices: [
          ['tea', 'coffee', 'water'],
          ['a friend', 'my family', 'someone I know'],
        ],
      },
      {
        title: 'An activity and a time',
        parts: ['I would like to ', ' in the ', '.'],
        choices: [
          ['read', 'rest', 'take a walk'],
          ['morning', 'afternoon', 'evening'],
        ],
      },
      {
        title: 'Something you enjoy',
        parts: ['I enjoy ', ' with ', '.'],
        choices: [
          ['having lunch', 'listening to music', 'taking a walk'],
          ['my family', 'a friend', 'my neighbor'],
        ],
      },
    ],
  },
  {
    id: 4,
    hint: 'Two blanks · shared word bank',
    mode: 'shared',
    exercises: [
      {
        title: 'Ask for an item',
        parts: ['Please bring my ', ' to the ', '.'],
        bank: ['book', 'table', 'glasses', 'bedroom'],
      },
      {
        title: 'Make a drink request',
        parts: ['I would like ', ' after ', '.'],
        bank: ['breakfast', 'tea', 'coffee', 'lunch'],
      },
      {
        title: 'Plan your day',
        parts: ['I would like to ', ' after ', '.'],
        bank: ['dinner', 'read', 'rest', 'lunch'],
      },
    ],
  },
  {
    id: 5,
    hint: 'Build a whole sentence',
    mode: 'arrange',
    exercises: [
      {
        title: 'Invite someone for tea',
        pieces: ['with me?', 'Would you like', 'to have tea'],
      },
      {
        title: 'Thank someone',
        pieces: ['today.', 'for visiting me', 'Thank you'],
      },
      {
        title: 'Ask for help',
        pieces: ['find my glasses?', 'Could you', 'help me'],
      },
    ],
  },
  {
    id: 6,
    hint: 'Complete a sentence',
    mode: 'complete',
    exercises: [
      {
        title: 'Make a plan',
        starter: 'Today, I would like to',
        ideas: ['take a walk', 'read a book', 'talk to someone'],
      },
      {
        title: 'Say thank you',
        starter: 'Thank you for',
        ideas: ['your help', 'visiting me', 'calling'],
      },
      {
        title: 'Share something you enjoy',
        starter: 'Something I enjoy is',
        ideas: ['listening to music', 'gardening', 'reading'],
      },
    ],
  },
  {
    id: 7,
    hint: 'Write a short message',
    mode: 'message',
    exercises: [
      {
        title: 'Invite someone to spend time with you.',
        exampleStarter: 'Would you like to',
        ideas: ['have tea', 'take a walk', 'with me', 'tomorrow'],
      },
      {
        title: 'Write a thank-you message to someone.',
        exampleStarter: 'Thank you for',
        ideas: ['your help', 'visiting', 'your kindness', 'I appreciate it'],
      },
      {
        title: 'Tell someone what you would like to do today.',
        exampleStarter: 'Today, I would like to',
        ideas: ['read', 'rest', 'go outside', 'spend time together'],
      },
    ],
  },
]

const selectedLevel = ref(0)
const exerciseIndex = ref(0)

const answers = ref<string[]>([])
const activeBlank = ref(0)
const arrangedIds = ref<number[]>([])
const writing = ref('')

const finished = ref(false)
const showIdeas = ref(false)
const showStarter = ref(false)
const notice = ref('')

const writingInput = ref<HTMLTextAreaElement | null>(null)
const blankHeading = ref<HTMLHeadingElement | null>(null)
const resultHeading = ref<HTMLHeadingElement | null>(null)
const taskHeading = ref<HTMLHeadingElement | null>(null)

const level = computed(() => levels[selectedLevel.value]!)
const task = computed(() => level.value.exercises[exerciseIndex.value]!)
const mode = computed(() => level.value.mode)

const isBlankTask = computed(
  () => mode.value === 'separate' || mode.value === 'shared',
)

const isWritingTask = computed(
  () => mode.value === 'complete' || mode.value === 'message',
)

const blankCount = computed(() => (task.value.parts?.length ?? 1) - 1)

const activeOptions = computed(() => {
  if (mode.value === 'shared') return task.value.bank ?? []

  return task.value.choices?.[activeBlank.value] ?? []
})

const instructions = computed(() => {
  switch (mode.value) {
    case 'separate':
      return 'Choose words to make a sentence about your preferences. You can change your choices.'
    case 'shared':
      return 'Select a box, then choose a word from the shared word bank. Read your sentence and change any words you want.'
    case 'arrange':
      return 'Tap the sentence pieces in the order you want to use them. Read your message before finishing.'
    case 'complete':
      return 'Continue the sentence in your own words. A word or a short phrase is enough. Word ideas are available if you want them.'
    case 'message':
      return 'Write a short message for this situation. One sentence is enough. You can use word ideas or a sentence starter.'
    default:
      return ''
  }
})

const canFinish = computed(() => {
  if (isBlankTask.value) {
    return Array.from(
      { length: blankCount.value },
      (_, index) => answers.value[index]?.trim(),
    ).every(Boolean)
  }

  if (mode.value === 'arrange') {
    return (
      arrangedIds.value.length > 0 &&
      arrangedIds.value.length === (task.value.pieces?.length ?? 0)
    )
  }

  const text = writing.value.trim()

  if (mode.value === 'message') {
    const starter = task.value.exampleStarter?.trim()
    return text.length > 0 && text !== starter
  }

  return text.length > 0
})

const sentencePreview = computed(() => {
  if (isBlankTask.value) {
    const parts = task.value.parts ?? []
    let text = parts[0] ?? ''

    for (let index = 0; index < blankCount.value; index++) {
      text += answers.value[index]?.trim() ?? ''
      text += parts[index + 1] ?? ''
    }

    return text
  }

  if (mode.value === 'arrange') {
    return arrangedIds.value
      .map((id) => task.value.pieces?.[id] ?? '')
      .join(' ')
  }

  if (mode.value === 'complete') {
    const text = `${task.value.starter ?? ''} ${writing.value.trim()}`.trim()

    return /[.!?]$/.test(text) ? text : `${text}.`
  }

  return writing.value.trim()
})

const isLastTask = computed(
  () => exerciseIndex.value === level.value.exercises.length - 1,
)

const buttonClass =
  'min-h-[56px] rounded-2xl border-2 border-slate-400 bg-white px-5 py-3 text-lg font-semibold text-[var(--bn-navy)] hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none'

function resetTask() {
  answers.value = Array.from({ length: blankCount.value }, () => '')
  activeBlank.value = 0
  arrangedIds.value = []
  writing.value = ''
  finished.value = false
  showIdeas.value = false
  showStarter.value = false
  notice.value = ''
}

function chooseLevel(index: number) {
  selectedLevel.value = index
  exerciseIndex.value = 0
  resetTask()
}

async function selectBlank(index: number) {
  activeBlank.value = index
  notice.value = ''

  await nextTick()
  blankHeading.value?.focus()
}

function chooseWord(word: string) {
  answers.value[activeBlank.value] = word
  notice.value =
    blankCount.value > 1
      ? 'Word added. You can change it or move to another blank.'
      : 'Word added. You can change it or select Finish.'
}

function addPiece(index: number) {
  if (arrangedIds.value.includes(index)) return

  arrangedIds.value.push(index)
  notice.value = 'Piece added.'

  if (arrangedIds.value.length === task.value.pieces?.length) {
    notice.value =
      'All pieces are added. Read your message before selecting Finish.'
  }
}

function removePiece(position: number) {
  arrangedIds.value.splice(position, 1)
  notice.value = 'Piece removed. Choose it again to place it at the end.'
}

function undoPiece() {
  if (!arrangedIds.value.length) return

  arrangedIds.value.pop()
  notice.value = 'Last piece removed.'
}

async function insertText(text: string) {
  const element = writingInput.value
  const currentText = writing.value
  const start = element?.selectionStart ?? currentText.length
  const end = element?.selectionEnd ?? start

  const before = currentText.slice(0, start)
  const after = currentText.slice(end)

  const leadingSpace = before && !/\s$/.test(before) ? ' ' : ''
  const trailingSpace = after && !/^[\s.,!?]/.test(after) ? ' ' : ''
  const inserted = `${leadingSpace}${text}${trailingSpace}`

  if (currentText.length - (end - start) + inserted.length > 200) {
    notice.value = 'Please keep your message within 200 characters.'
    return
  }

  writing.value = before + inserted + after
  notice.value = ''

  await nextTick()

  const cursor = before.length + inserted.length
  writingInput.value?.focus()
  writingInput.value?.setSelectionRange(cursor, cursor)
}

async function finishTask() {
  if (!canFinish.value) return

  finished.value = true
  notice.value = ''

  await nextTick()
  resultHeading.value?.focus()
}

async function editMessage() {
  finished.value = false

  await nextTick()

  if (isWritingTask.value) {
    writingInput.value?.focus()
  } else {
    taskHeading.value?.focus()
  }
}

async function nextTask() {
  exerciseIndex.value = isLastTask.value ? 0 : exerciseIndex.value + 1
  resetTask()

  await nextTick()
  taskHeading.value?.focus()
}

resetTask()
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
      class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4"
      role="group"
      aria-label="Difficulty level"
    >
      <button
        v-for="(option, index) in levels"
        :key="option.id"
        type="button"
        class="min-h-[72px] rounded-2xl border-2 p-4 text-left transition-colors focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
        :class="
          selectedLevel === index
            ? 'border-orange-700 bg-[var(--bn-peach)]'
            : 'border-slate-300 bg-white hover:bg-slate-50'
        "
        :aria-pressed="selectedLevel === index"
        @click="chooseLevel(index)"
      >
        <span class="block text-lg font-bold text-[var(--bn-navy)]">
          Level {{ option.id }}
        </span>

        <span class="block text-lg text-[var(--bn-muted)]">
          {{ option.hint }}
        </span>
      </button>
    </div>

    <section
      class="mt-6 rounded-[20px] border border-[var(--bn-border)] bg-[var(--bn-peach)] p-6 sm:p-10"
      aria-labelledby="guided-writing-title"
    >
      <h2
        id="guided-writing-title"
        class="text-lg font-bold tracking-wide text-orange-800 uppercase"
      >
        Try it now — interactive
      </h2>

      <p class="mt-3 text-lg leading-relaxed text-[var(--bn-navy)] sm:text-xl">
        {{ instructions }}
      </p>

      <p class="mt-2 text-lg text-[var(--bn-muted)]">
        Take your time — there is no timer.
      </p>

      <div class="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p class="text-lg text-[var(--bn-muted)]">
          Activity {{ exerciseIndex + 1 }}
          of {{ level.exercises.length }}
        </p>

        <button
          type="button"
          :class="buttonClass"
          @click="resetTask"
        >
          Clear
        </button>
      </div>

      <template v-if="!finished">
        <h3
          ref="taskHeading"
          tabindex="-1"
          class="bn-font-display mt-6 rounded text-2xl font-bold text-[var(--bn-navy)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--bn-navy)]"
        >
          {{ task.title }}
        </h3>

        <!-- Levels 1–4: sentence with selectable blanks -->
        <template v-if="isBlankTask">
          <div
            class="mt-4 rounded-2xl border border-[var(--bn-border)] bg-white p-6 sm:p-8"
          >
            <p class="text-2xl leading-[2.5] text-[var(--bn-navy)] sm:text-3xl">
              <template
                v-for="(part, index) in task.parts"
                :key="index"
              >
                <span>{{ part }}</span>

                <button
                  v-if="index < blankCount"
                  type="button"
                  class="mx-1 inline-block min-h-[56px] min-w-[100px] max-w-full rounded-xl border-2 px-3 py-1 align-middle text-center leading-relaxed font-semibold break-words focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
                  :class="
                    activeBlank === index
                      ? 'border-orange-700 bg-[var(--bn-peach)]'
                      : 'border-slate-400 bg-[var(--bn-cream)]'
                  "
                  :aria-label="
                    `Edit blank ${index + 1}: ${answers[index] || 'empty'}`
                  "
                  :aria-pressed="activeBlank === index"
                  @click="selectBlank(index)"
                >
                  {{ answers[index] || '\u00A0' }}
                </button>
              </template>
            </p>
          </div>

          <h4
            ref="blankHeading"
            tabindex="-1"
            class="mt-6 rounded text-lg font-semibold text-[var(--bn-navy)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--bn-navy)]"
          >
            {{
              mode === 'shared'
                ? `Shared word bank · Blank ${activeBlank + 1} of ${blankCount}`
                : `Choose your words · Blank ${activeBlank + 1} of ${blankCount}`
            }}
          </h4>

          <div
            class="mt-3 flex flex-wrap gap-3"
            role="group"
            aria-label="Word choices"
          >
            <button
              v-for="word in activeOptions"
              :key="`${selectedLevel}-${exerciseIndex}-${activeBlank}-${word}`"
              type="button"
              class="min-h-[56px] rounded-2xl border-2 px-5 py-3 text-lg font-semibold text-[var(--bn-navy)] focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
              :class="
                answers[activeBlank] === word
                  ? 'border-orange-700 bg-[var(--bn-peach)]'
                  : 'border-slate-400 bg-white hover:bg-slate-50'
              "
              :aria-pressed="answers[activeBlank] === word"
              @click="chooseWord(word)"
            >
              {{ word }}
            </button>
          </div>

          <div
            v-if="blankCount > 1"
            class="mt-4 flex flex-wrap gap-3"
          >
            <button
              v-if="activeBlank > 0"
              type="button"
              :class="buttonClass"
              @click="selectBlank(activeBlank - 1)"
            >
              Previous Blank
            </button>

            <button
              v-if="activeBlank < blankCount - 1"
              type="button"
              :class="[
                buttonClass,
                'disabled:cursor-not-allowed disabled:opacity-40',
              ]"
              :disabled="!answers[activeBlank]?.trim()"
              @click="selectBlank(activeBlank + 1)"
            >
              Next Blank
            </button>
          </div>
        </template>

        <!-- Level 5: tap pieces to build a sentence -->
        <template v-else-if="mode === 'arrange'">
          <div
            class="mt-4 min-h-[140px] rounded-2xl border border-[var(--bn-border)] bg-white p-6"
          >
            <p
              v-if="!arrangedIds.length"
              class="text-lg text-[var(--bn-muted)]"
            >
              Your sentence will appear here.
            </p>

            <ol
              v-else
              class="flex list-none flex-wrap gap-3 p-0"
              aria-label="Your sentence pieces in order"
            >
              <li
                v-for="(pieceId, position) in arrangedIds"
                :key="pieceId"
              >
                <button
                  type="button"
                  class="min-h-[56px] rounded-xl border-2 border-orange-700 bg-[var(--bn-peach)] px-4 py-3 text-xl text-[var(--bn-navy)] focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
                  :aria-label="`Remove piece ${position + 1}: ${task.pieces?.[pieceId]}`"
                  @click="removePiece(position)"
                >
                  {{ task.pieces?.[pieceId] }}
                </button>
              </li>
            </ol>
          </div>

          <p class="mt-3 text-lg text-[var(--bn-muted)]">
            Tap an added piece to remove it.
          </p>

          <h4 class="mt-6 text-lg font-semibold text-[var(--bn-navy)]">
            Choose the next piece
          </h4>

          <div
            class="mt-3 flex flex-wrap gap-3"
            role="group"
            aria-label="Available sentence pieces"
          >
            <button
              v-for="(piece, index) in task.pieces"
              :key="index"
              type="button"
              :class="[
                buttonClass,
                'disabled:cursor-not-allowed disabled:opacity-40',
              ]"
              :disabled="arrangedIds.includes(index)"
              @click="addPiece(index)"
            >
              {{ piece }}
            </button>
          </div>

          <button
            type="button"
            :class="[
              buttonClass,
              'mt-4 disabled:cursor-not-allowed disabled:opacity-40',
            ]"
            :disabled="!arrangedIds.length"
            @click="undoPiece"
          >
            Undo Last Piece
          </button>
        </template>

        <!-- Levels 6–7: personal writing -->
        <template v-else-if="isWritingTask">
          <div
            class="mt-4 rounded-2xl border border-[var(--bn-border)] bg-white p-6 sm:p-8"
          >
            <p
              v-if="mode === 'complete'"
              id="guided-writing-starter"
              class="mb-4 text-2xl leading-relaxed text-[var(--bn-navy)] sm:text-3xl"
            >
              {{ task.starter }}
            </p>

            <label
              for="guided-writing-input"
              class="block text-lg font-semibold text-[var(--bn-navy)]"
            >
              {{
                mode === 'complete'
                  ? 'Continue the sentence'
                  : 'Your message'
              }}
            </label>

            <textarea
              id="guided-writing-input"
              ref="writingInput"
              v-model="writing"
              rows="4"
              maxlength="200"
              :aria-describedby="
                mode === 'complete'
                  ? 'guided-writing-starter guided-writing-help'
                  : 'guided-writing-help'
              "
              class="mt-3 block min-h-[150px] w-full resize-y rounded-2xl border-2 border-slate-400 bg-white p-4 text-xl leading-relaxed text-[var(--bn-navy)] focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
              :placeholder="
                mode === 'complete'
                  ? 'Write a word or a short phrase'
                  : 'Write a short message'
              "
            />

            <p
              id="guided-writing-help"
              class="mt-3 text-lg text-[var(--bn-muted)]"
            >
              {{
                mode === 'complete'
                  ? 'A word or a short phrase is enough.'
                  : 'One short sentence is enough. Spelling and grammar are not graded.'
              }}
            </p>
          </div>

          <div class="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              :class="buttonClass"
              :aria-expanded="showIdeas"
              aria-controls="guided-word-ideas"
              @click="showIdeas = !showIdeas"
            >
              {{ showIdeas ? 'Hide Word Ideas' : 'Show Word Ideas' }}
            </button>

            <button
              v-if="mode === 'message'"
              type="button"
              :class="buttonClass"
              :aria-expanded="showStarter"
              aria-controls="guided-sentence-starter"
              @click="showStarter = !showStarter"
            >
              {{
                showStarter
                  ? 'Hide Sentence Starter'
                  : 'Show a Sentence Starter'
              }}
            </button>
          </div>

          <div
            v-if="showIdeas"
            id="guided-word-ideas"
            class="mt-4"
          >
            <p class="text-lg text-[var(--bn-navy)]">
              Tap an idea to add it to your writing.
            </p>

            <div
              class="mt-3 flex flex-wrap gap-3"
              role="group"
              aria-label="Optional word ideas"
            >
              <button
                v-for="idea in task.ideas"
                :key="idea"
                type="button"
                :class="buttonClass"
                @click="insertText(idea)"
              >
                {{ idea }}
              </button>
            </div>
          </div>

          <div
            v-if="mode === 'message' && showStarter"
            id="guided-sentence-starter"
            class="mt-4 rounded-2xl border border-[var(--bn-border)] bg-white p-5"
          >
            <p class="text-lg text-[var(--bn-navy)]">
              You could begin with:
            </p>

            <p class="mt-2 text-xl font-semibold text-[var(--bn-navy)]">
              {{ task.exampleStarter }}…
            </p>

            <button
              v-if="!writing.trim()"
              type="button"
              :class="[buttonClass, 'mt-3']"
              @click="insertText(task.exampleStarter ?? '')"
            >
              Use This Starter
            </button>
          </div>
        </template>

        <p
          class="mt-5 min-h-[56px] text-lg text-[var(--bn-navy)]"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ notice }}
        </p>

        <button
          type="button"
          :disabled="!canFinish"
          class="min-h-[56px] rounded-2xl border-2 border-[var(--bn-navy)] bg-[var(--bn-navy)] px-6 py-3 text-lg font-semibold text-white hover:opacity-90 focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          @click="finishTask"
        >
          Finish
        </button>
      </template>

      <!-- Completed message -->
      <div
        v-else
        class="mt-6 rounded-2xl border border-[var(--bn-border)] bg-white p-6 sm:p-8"
      >
        <h3
          ref="resultHeading"
          tabindex="-1"
          class="bn-font-display rounded text-2xl font-bold text-[var(--bn-navy)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--bn-navy)]"
        >
          Your message is ready.
        </h3>

        <p
          class="mt-4 text-2xl leading-relaxed break-words whitespace-pre-line text-[var(--bn-navy)] sm:text-3xl"
        >
          {{ sentencePreview }}
        </p>

        <p class="mt-4 text-lg text-[var(--bn-muted)]">
          Read your message. Does it say what you want?
          You can edit it or continue.
        </p>

        <div class="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            :class="buttonClass"
            @click="editMessage"
          >
            Edit My Message
          </button>

          <button
            type="button"
            :class="buttonClass"
            @click="nextTask"
          >
            {{ isLastTask ? 'Practice Again' : 'Next Activity' }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
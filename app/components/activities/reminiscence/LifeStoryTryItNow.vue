<script setup lang="ts">
  import type { LifeStoryAnswer } from '~/data/reminiscence/life-story-prompts'

  const {
    currentPrompt,
    currentAnswer,
    currentIndex,
    total,
    answeredCount,
    isComplete,
    hydrated,
    answer,
    next,
    startOver,
  } = useLifeStoryPrompts()

  function selectAnswer(value: LifeStoryAnswer) {
    answer(value)
  }

  function onNext() {
    if (currentIndex.value < total.value - 1) {
      next()
    }
  }

  const canGoNext = computed(() => {
    return Boolean(currentAnswer.value) && currentIndex.value < total.value - 1
  })

  const showFinished = computed(() => hydrated.value && isComplete.value && currentIndex.value >= total.value - 1 && Boolean(currentAnswer.value))
</script>

<template>
  <section class="bn-font-body flex w-full flex-col gap-6" aria-labelledby="try-it-now-title">
    <div class="flex flex-col gap-2">
      <h2 id="try-it-now-title" class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">
        Try It Now
      </h2>
      <p class="text-[15px] leading-normal text-[var(--bn-muted)]">
        Answer simple yes-or-no questions that gently open life-story memories.
      </p>
    </div>

    <div
      class="flex w-full flex-col gap-6 rounded-[20px] border border-[var(--bn-border)] bg-white p-6 shadow-[0px_8px_12px_rgba(38,33,92,0.05)] sm:p-8"
    >
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-col gap-1">
          <h3 class="bn-font-display text-[22px] font-bold text-[var(--bn-navy)]">Life Story Prompts</h3>
          <p class="text-[15px] leading-normal text-[var(--bn-muted)]">
            Tap Yes or No for each prompt. There are no wrong answers.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[13px] font-bold tracking-[1.5px] text-[var(--bn-muted)] uppercase">
            Prompt:
          </span>
          <span
            class="rounded-lg bg-[var(--bn-orange)] px-4 py-2 text-sm font-bold text-white"
            aria-live="polite"
          >
            {{ Math.min(currentIndex + 1, total) }} / {{ total }}
          </span>
        </div>
      </div>

      <div
        v-if="showFinished"
        class="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-solid border-[var(--bn-success)] bg-[var(--bn-success-bg)] px-6 py-10 text-center"
        role="status"
      >
        <p class="bn-font-display text-xl font-bold text-[var(--bn-navy)]">Session complete</p>
        <p class="text-[15px] text-[var(--bn-muted)]">
          You answered {{ answeredCount }} of {{ total }} life story prompts.
        </p>
      </div>

      <div
        v-else-if="currentPrompt"
        class="flex min-h-[160px] items-center justify-center rounded-xl border-2 border-dashed border-[var(--bn-orange)] bg-[var(--bn-peach)] px-6 py-10 text-center"
      >
        <p class="bn-font-display max-w-2xl text-xl font-bold text-[var(--bn-navy)] sm:text-2xl">
          {{ currentPrompt.question }}
        </p>
      </div>

      <div
        v-if="!showFinished"
        class="flex flex-col gap-3 sm:flex-row sm:justify-center"
        role="group"
        aria-label="Yes or No"
      >
        <button
          type="button"
          class="inline-flex min-h-[72px] min-w-[140px] flex-1 items-center justify-center rounded-[10px] px-6 text-base font-bold transition-colors sm:flex-none sm:min-w-[160px]"
          :class="
            currentAnswer === 'yes'
              ? 'bg-[var(--bn-orange)] text-white'
              : 'bg-[var(--bn-peach)] text-[var(--bn-orange)]'
          "
          :aria-pressed="currentAnswer === 'yes'"
          @click="selectAnswer('yes')"
        >
          Yes
        </button>
        <button
          type="button"
          class="inline-flex min-h-[72px] min-w-[140px] flex-1 items-center justify-center rounded-[10px] px-6 text-base font-bold transition-colors sm:flex-none sm:min-w-[160px]"
          :class="
            currentAnswer === 'no'
              ? 'bg-[var(--bn-orange)] text-white'
              : 'bg-[var(--bn-peach)] text-[var(--bn-orange)]'
          "
          :aria-pressed="currentAnswer === 'no'"
          @click="selectAnswer('no')"
        >
          No
        </button>
      </div>

      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-[15px] font-bold text-[var(--bn-muted)]">Current Status:</span>
          <span class="rounded bg-[var(--bn-peach)] px-2.5 py-1 text-sm font-bold text-[var(--bn-orange)]">
            Answered: {{ answeredCount }}
          </span>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            v-if="canGoNext"
            type="button"
            class="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[10px] bg-[var(--bn-orange)] px-5 py-3 text-sm font-bold text-white"
            @click="onNext"
          >
            Next prompt
          </button>
          <button
            type="button"
            class="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[10px] bg-[var(--bn-orange)] px-5 py-3 text-sm font-bold text-white"
            @click="startOver"
          >
            <img src="/activities/icon-refresh.svg" alt="" class="size-4" width="16" height="16" />
            Start over
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

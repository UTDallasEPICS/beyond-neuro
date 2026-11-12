<script setup lang="ts">
  definePageMeta({
    layout: 'activity',
  })

  useHead({
    title: 'Seated Balance Work | BeyondNeuro',
  })
</script>

<template>
  <div class="bn-font-body flex min-h-screen flex-col bg-[var(--bn-cream)] lg:flex-row">
    <ActivitiesActivityModuleSidebar />

    <main class="flex-1 overflow-x-hidden">
      <div class="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-8 lg:px-[60px] lg:py-[60px]">
        <NuxtLink
          to="/activities/dual-task"
          class="inline-flex min-h-[72px] items-center gap-2 text-2xl font-semibold text-orange-800"
        >
          <img src="/activities/icon-arrow-left.svg" alt="" class="size-6" width="24" height="24" />
          Back to Dual-Task Physical Exercise
        </NuxtLink>

        <h1 class="bn-font-display mt-6 text-4xl font-bold text-[var(--bn-navy)]">
          Seated balance work
        </h1>
        <p class="mt-4 text-2xl leading-relaxed text-[var(--bn-navy)]">
          Reach and reflect — naming categories while moving.
        </p>

        <ActivitiesDualTaskReachAndReflectFlow />
      </div>
    </main>
  </div>
</template>

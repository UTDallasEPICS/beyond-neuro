<script setup lang="ts">
  definePageMeta({ layout: 'activity' })
  useSeoMeta({ title: 'Reality Orientation — BeyondNeuro' })
</script>

<template>
  <div class="bn-font-body flex min-h-screen flex-col bg-[var(--bn-cream)] md:flex-row">
    <ActivitiesActivityModuleSidebar />

    <main class="flex-1 overflow-x-hidden">
      <div class="mx-auto w-full max-w-[900px] px-4 py-8 sm:px-8 lg:px-[60px] lg:py-[60px]">
        <ActivitiesRealityOrientationClock />
      </div>
    </main>
  </div>
</template>
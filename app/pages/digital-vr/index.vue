<script setup lang="ts">
  const ACTIVITIES = [
    {
      to: '/digital-vr/reaction-time',
      icon: 'i-heroicons-bolt',
      title: 'Reaction Time',
      text: 'Wait for the panel to turn green, then tap as fast as you can.',
    },
    {
      to: '/digital-vr/counting-money',
      icon: 'i-heroicons-banknotes',
      title: 'Counting Money',
      text: 'Count U.S. bills and coins, then pick the total.',
    },
  ]
</script>

<template>
  <section class="min-h-screen bg-[#F5F1EA] px-4 py-12">
    <div class="mx-auto max-w-4xl">
      <h1 class="font-serif text-4xl font-bold text-[#231E5A]">Digital &amp; VR Training</h1>
      <p class="mt-3 text-lg text-gray-600">
        Guided digital practice for everyday skills. Pick an activity to begin.
      </p>

      <ul class="mt-8 grid gap-4 sm:grid-cols-2">
        <li v-for="activity in ACTIVITIES" :key="activity.to">
          <NuxtLink
            :to="activity.to"
            class="flex h-full items-start gap-4 rounded-2xl border border-t-4 border-gray-200 border-t-[#231E5A] bg-white p-6 transition hover:shadow-md focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#231E5A]"
          >
            <span
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ECEBFB]"
            >
              <UIcon :name="activity.icon" class="h-6 w-6 text-[#231E5A]" aria-hidden="true" />
            </span>
            <span>
              <span class="block font-serif text-2xl font-bold text-[#231E5A]">{{
                activity.title
              }}</span>
              <span class="mt-1 block text-lg text-gray-600">{{ activity.text }}</span>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>

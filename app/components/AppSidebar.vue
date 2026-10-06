<script setup lang="ts">
  //one link in the sidebar
  type NavLink = {
    label: string
    to: string
  }

  //the 5 main sections from the client's plan (rule 18: 5 sections maximum)
  //the addresses are placeholders until the team builds those pages
  const links: NavLink[] = [
    { label: 'Home', to: '/' },
    { label: 'Exercises', to: '/exercises' },
    { label: 'My Progress', to: '/progress' },
    { label: 'Learn', to: '/learn' },
    { label: 'Caregiver Corner', to: '/caregiver' },
  ]

  //tells us which page is open right now, so we can highlight its link
  const route = useRoute()
</script>

<!--
  colors from the figma design: navy #27265f, white text
  phones and tablets: a bar across the top, links wrap onto more lines (nothing hidden - rule 19)
  big screens (lg:): a sidebar down the left side, 320px wide (lg:w-80)
-->
<template>
  <aside class="flex flex-col gap-6 bg-[#27265f] p-6 text-white lg:w-80 lg:shrink-0">
    <!-- logo: text for now - swap for the real logo image exported from figma -->
    <NuxtLink
      to="/"
      class="text-3xl leading-tight font-bold focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"
    >
      Beyond<br />Neuro
    </NuxtLink>

    <!-- nav tells screen readers "this is the main menu" -->
    <nav aria-label="Main">
      <ul class="flex flex-wrap gap-2 lg:flex-col">
        <li v-for="link in links" :key="link.to">
          <!-- min-h-24 = 96px tall (rule 9), text-2xl = 24px (rule 1)
               figma shows smaller links - change min-h-24 and text-2xl here if your mentor prefers figma sizes
               the open page's link is a white pill with navy text, like the figma design
               aria-current="page" tells screen readers "you are here" -->
          <NuxtLink
            :to="link.to"
            class="flex min-h-24 items-center rounded-2xl px-5 text-2xl focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white"
            :class="
              route.path === link.to
                ? 'bg-white font-semibold text-[#27265f]'
                : 'text-white hover:bg-white/10'
            "
            :aria-current="route.path === link.to ? 'page' : undefined"
          >
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- the "take your time" note - bg-white/10 is white at 10% strength, which looks light purple on navy -->
    <div class="rounded-2xl bg-white/10 p-5">
      <p class="text-2xl font-semibold">Take your time</p>
      <p class="mt-2 text-2xl">Pause whenever you need. Your progress is saved.</p>
    </div>
  </aside>
</template>

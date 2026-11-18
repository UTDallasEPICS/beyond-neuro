<script setup lang="ts">
  import { ACTIVITY_MODULES, TAG_CLASSES, type ModuleSlug } from '~/data/activityModules'

  const props = defineProps<{ slug: ModuleSlug }>()

  const route = useRoute()
  const mod = computed(() => ACTIVITY_MODULES[props.slug])
  const related = computed(() =>
    mod.value.related.map((slug) => {
      const other = ACTIVITY_MODULES[slug]
      return {
        slug,
        tag: other.tag,
        title: other.title,
        summary: other.summary,
        to: other.tabs[0]!.to,
      }
    })
  )

  function isCurrent(to: string) {
    return route.path.replace(/\/$/, '') === to
  }
</script>

<template>
  <div class="bn-font-body flex min-h-screen flex-col bg-[var(--bn-cream)] lg:flex-row">
    <ActivitiesActivityModuleSidebar />

    <main class="flex-1 overflow-x-hidden">
      <div class="mx-auto w-full max-w-[1170px] px-4 py-8 sm:px-8 lg:px-[60px] lg:py-[60px]">
        <!-- Module header -->
        <header class="max-w-[800px]">
          <span
            class="inline-flex rounded-md bg-[var(--bn-peach)] px-3 py-1.5 text-lg font-bold tracking-wide text-orange-800 uppercase"
          >
            {{ mod.tag }}
          </span>
          <h1
            class="bn-font-display mt-2 text-3xl font-bold text-[var(--bn-navy)] sm:text-[40px] sm:leading-[48px]"
          >
            {{ mod.title }}
          </h1>
          <p class="mt-2 text-lg text-[var(--bn-navy)] sm:text-[19px] sm:leading-[29px]">
            {{ mod.subtitle }}
          </p>
        </header>

        <hr class="my-12 border-0 border-t border-[var(--bn-border)]" />

        <!-- The Research -->
        <section aria-labelledby="research-title">
          <h2 id="research-title" class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">
            The Research
          </h2>
          <p class="mt-4 max-w-[1050px] text-lg leading-[1.45] text-[var(--bn-muted)] sm:text-xl">
            {{ mod.research }}
          </p>
          <div class="mt-6">
            <p class="text-lg font-bold tracking-wide text-[var(--bn-muted)] uppercase">
              Clinical Benefits:
            </p>
            <ul class="mt-3 flex list-none flex-wrap gap-2 p-0">
              <li
                v-for="benefit in mod.benefits"
                :key="benefit"
                class="rounded-lg border border-[var(--bn-border)] bg-white px-4 py-2 text-lg text-[var(--bn-navy)]"
              >
                {{ benefit }}
              </li>
            </ul>
          </div>
        </section>

        <hr class="my-12 border-0 border-t border-[var(--bn-border)]" />

        <!-- Try It Now: game tabs -->
        <section aria-labelledby="try-it-now-title">
          <h2
            id="try-it-now-title"
            class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]"
          >
            Try It Now
          </h2>
          <p class="mt-2 text-lg leading-normal text-[var(--bn-muted)]">
            Choose an activity. Take your time — there is no rush.
          </p>

          <nav class="mt-6" :aria-label="`${mod.title} activities`">
            <ul class="flex list-none flex-wrap gap-3 p-0">
              <li v-for="tab in mod.tabs" :key="tab.to">
                <NuxtLink
                  :to="tab.to"
                  class="flex min-h-[56px] items-center rounded-full border-2 px-6 py-3 text-lg font-semibold focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:ring-offset-4 focus-visible:outline-none"
                  :class="
                    isCurrent(tab.to)
                      ? 'border-[var(--bn-navy)] bg-[var(--bn-navy)] text-white'
                      : 'border-[var(--bn-border)] bg-white text-[var(--bn-navy)] hover:border-orange-700'
                  "
                  :aria-current="isCurrent(tab.to) ? 'page' : undefined"
                >
                  {{ tab.label }}
                </NuxtLink>
              </li>
            </ul>
          </nav>

          <div class="mt-8 max-w-[900px]">
            <slot />
          </div>
        </section>

        <hr class="my-12 border-0 border-t border-[var(--bn-border)]" />

        <!-- Printable Resources -->
        <section aria-labelledby="resources-title">
          <div class="flex flex-col gap-2">
            <h2
              id="resources-title"
              class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]"
            >
              Printable Resources
            </h2>
            <p class="text-lg leading-normal text-[var(--bn-muted)]">
              Download resources specifically styled for physical printouts and caregiver-guided
              sessions.
            </p>
          </div>
          <div class="mt-6 grid gap-4 md:grid-cols-3">
            <div
              v-for="resource in mod.resources"
              :key="resource.title"
              class="flex items-center gap-4 rounded-xl border border-[var(--bn-border)] bg-white p-[18px]"
            >
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--bn-success-bg)]"
              >
                <img :src="resource.icon" alt="" class="size-5" width="20" height="20" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-lg font-bold text-[var(--bn-navy)]">{{ resource.title }}</p>
                <p class="text-lg leading-normal text-[var(--bn-muted)]">
                  {{ resource.description }}
                </p>
              </div>
              <img
                src="/activities/icon-download.svg"
                alt=""
                class="size-5 shrink-0"
                width="20"
                height="20"
              />
            </div>
          </div>
        </section>

        <hr class="my-12 border-0 border-t border-[var(--bn-border)]" />

        <!-- Related Modules -->
        <section aria-labelledby="related-title" class="pb-8">
          <h2 id="related-title" class="bn-font-display text-2xl font-bold text-[var(--bn-navy)]">
            Related Modules
          </h2>
          <div class="mt-6 grid gap-6 md:grid-cols-3">
            <article
              v-for="other in related"
              :key="other.slug"
              class="flex flex-col gap-5 rounded-[20px] border border-[var(--bn-border)] bg-white p-7"
            >
              <span
                class="inline-flex w-fit rounded-md px-3 py-1.5 text-lg font-bold uppercase"
                :class="TAG_CLASSES[other.tag]"
              >
                {{ other.tag }}
              </span>
              <div class="flex flex-col gap-3">
                <h3 class="bn-font-display text-[22px] font-bold text-[var(--bn-navy)]">
                  {{ other.title }}
                </h3>
                <p class="text-lg leading-normal text-[var(--bn-muted)]">
                  {{ other.summary }}
                </p>
              </div>
              <NuxtLink
                :to="other.to"
                class="mt-auto flex min-h-[56px] w-full items-center justify-center rounded-[10px] border-[1.5px] border-[var(--bn-navy)] text-lg font-bold text-[var(--bn-navy)] hover:bg-[var(--bn-peach)] focus-visible:ring-4 focus-visible:ring-[var(--bn-navy)] focus-visible:outline-none"
              >
                Explore Module<span class="sr-only">: {{ other.title }}</span>
              </NuxtLink>
            </article>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

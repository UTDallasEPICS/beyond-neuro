<script setup lang="ts">
  const props = defineProps<{ compact?: boolean }>()

  const { $pwa } = useNuxtApp()

  // Safari (iPhone, iPad, Mac) never fires `beforeinstallprompt`, so those users get written steps.
  type ManualPlatform = 'ios' | 'mac-safari'
  const manualPlatform = ref<ManualPlatform | null>(null)
  const runningAsApp = ref(true)
  const instructionsOpen = ref(false)

  onMounted(() => {
    const nav = navigator as Navigator & { standalone?: boolean }
    runningAsApp.value =
      window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true

    const ua = navigator.userAgent
    const isIOS =
      /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
    const isDesktopSafari =
      ua.includes('Safari') && !/Chrome|Chromium|Edg|OPR|Firefox/.test(ua) && !isIOS
    if (isIOS) manualPlatform.value = 'ios'
    else if (isDesktopSafari) manualPlatform.value = 'mac-safari'
  })

  const canPrompt = computed(() => Boolean($pwa?.showInstallPrompt))
  const visible = computed(
    () =>
      !runningAsApp.value && !$pwa?.isPWAInstalled && (canPrompt.value || !!manualPlatform.value)
  )

  async function install() {
    if (canPrompt.value) await $pwa?.install()
    else instructionsOpen.value = true
  }

  const buttonClass = computed(() =>
    props.compact
      ? 'flex min-h-12 items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-lg text-white hover:bg-white/10'
      : 'flex w-full items-center gap-3 rounded-full border border-white/40 px-3.5 py-3 text-[20px] leading-[30px] font-medium text-white hover:bg-white/10'
  )
</script>

<template>
  <div v-if="visible">
    <button
      type="button"
      :class="buttonClass"
      class="focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none"
      @click="install"
    >
      <svg class="size-5 shrink-0" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M10 12.5V2.5M14.17 8.33 10 12.5 5.83 8.33M17.5 12.5v3.33c0 .92-.75 1.67-1.67 1.67H4.17c-.92 0-1.67-.75-1.67-1.67V12.5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      Install app
    </button>

    <UModal
      v-model:open="instructionsOpen"
      :title="
        manualPlatform === 'ios'
          ? 'Add BeyondNeuro to your Home Screen'
          : 'Add BeyondNeuro to your Dock'
      "
      description="It will open on its own, like any other app."
      :ui="{
        title: 'bn-font-display text-2xl font-bold text-[var(--bn-navy)]',
        description: 'bn-font-body text-lg text-[var(--bn-muted)]',
      }"
    >
      <template #body>
        <ol
          v-if="manualPlatform === 'ios'"
          class="bn-font-body list-decimal space-y-4 pl-6 text-lg leading-relaxed text-[var(--bn-navy)]"
        >
          <li>
            Tap the Share button
            <svg
              class="inline size-6 align-text-bottom"
              viewBox="0 0 24 24"
              fill="none"
              role="img"
              aria-label="(a square with an arrow pointing up)"
            >
              <path
                d="M12 3v12M8 7l4-4 4 4M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            in your browser. On iPhone it is at the bottom of the screen, and on iPad it is at the
            top.
          </li>
          <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
          <li>Tap <strong>Add</strong>. BeyondNeuro will appear on your Home Screen.</li>
        </ol>
        <ol
          v-else
          class="bn-font-body list-decimal space-y-4 pl-6 text-lg leading-relaxed text-[var(--bn-navy)]"
        >
          <li>In the menu bar at the top of the screen, choose <strong>File</strong>.</li>
          <li>Choose <strong>Add to Dock</strong>.</li>
          <li>Click <strong>Add</strong>. BeyondNeuro will appear in your Dock.</li>
        </ol>
      </template>
    </UModal>
  </div>
</template>

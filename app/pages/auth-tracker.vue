<script setup lang="ts">
  import { authClient } from '~/utils/auth-client'

  definePageMeta({ layout: 'activity', middleware: 'auth' })
  useHead({ title: 'Account dashboard | BeyondNeuro' })

  const usersKey = 'account-dashboard-users'
  const { data: users, pending, error, refresh } = await useFetch('/api/users', { key: usersKey })
  const selectedFile = shallowRef<File | null>(null)
  const imagePreview = ref('')
  const isUploading = ref(false)
  const isModalOpen = ref(false)
  const isSigningOut = ref(false)
  const uploadError = ref('')
  const logoutError = ref('')
  const status = ref('')
  const buttonClass =
    'min-h-12 rounded-xl bg-[var(--bn-navy)] px-4 text-white hover:bg-[var(--bn-sidebar)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bn-navy)]'
  const focusClass =
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bn-navy)]'

  async function logout() {
    logoutError.value = ''
    isSigningOut.value = true
    try {
      const { error } = await authClient.signOut()
      if (error) {
        logoutError.value = 'We could not sign you out. Please try again.'
        return
      }
      clearNuxtData(usersKey)
      await navigateTo('/auth', { replace: true })
    } catch {
      logoutError.value = 'We could not sign you out. Please try again.'
    } finally {
      isSigningOut.value = false
    }
  }

  function clearFile() {
    if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
    imagePreview.value = ''
    selectedFile.value = null
    uploadError.value = ''
  }

  function handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    clearFile()
    if (!file) return
    if (!file.type.startsWith('image/')) {
      uploadError.value = 'Choose an image file.'
      input.value = ''
      return
    }

    selectedFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }

  watch(isModalOpen, (open) => {
    if (!open) clearFile()
  })
  onBeforeUnmount(clearFile)

  async function updatePfp() {
    if (!selectedFile.value || isUploading.value) return

    isUploading.value = true
    uploadError.value = ''
    status.value = ''
    try {
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      await $fetch('/api/users/upload', { method: 'POST', body: formData })

      // The image URL is otherwise unchanged when an existing photo is replaced.
      photoVersion.value++
      await refresh()
      isModalOpen.value = false
      status.value = 'Profile picture updated.'
    } catch {
      uploadError.value = 'We could not upload your picture. Please try again.'
    } finally {
      isUploading.value = false
    }
  }

  const photoVersion = ref(0)

  function getImageLink(user: { image: boolean; id: string }) {
    return user.image
      ? `/api/users/${encodeURIComponent(user.id)}/profile?v=${photoVersion.value}`
      : undefined
  }
</script>

<template>
  <main class="bn-font-body mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-8">
    <NuxtLink
      to="/"
      :class="[
        focusClass,
        'inline-flex min-h-12 items-center rounded-lg px-2 font-semibold underline',
      ]"
    >
      Back to BeyondNeuro
    </NuxtLink>

    <header class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="bn-font-display text-3xl font-bold">Account dashboard</h1>
      <div class="flex flex-wrap gap-3">
        <UModal
          v-model:open="isModalOpen"
          title="Update profile picture"
          :dismissible="!isUploading"
        >
          <UButton :class="buttonClass">Update profile picture</UButton>

          <template #body>
            <form class="space-y-4 text-[var(--bn-navy)]" @submit.prevent="updatePfp">
              <UAvatar
                v-if="imagePreview"
                :src="imagePreview"
                alt="Selected profile picture preview"
                size="3xl"
              />
              <div class="space-y-2">
                <label for="profile-file" class="block font-semibold">Choose an image</label>
                <input
                  id="profile-file"
                  type="file"
                  accept="image/*"
                  :disabled="isUploading"
                  :aria-describedby="uploadError ? 'profile-error' : undefined"
                  :class="[
                    focusClass,
                    'w-full rounded-lg file:me-3 file:min-h-12 file:rounded-lg file:bg-[var(--bn-peach)] file:px-3 file:font-semibold',
                  ]"
                  @change="handleImageUpload"
                />
              </div>
              <p id="profile-error" role="alert" class="font-medium text-red-800">
                {{ uploadError }}
              </p>
              <p role="status" class="sr-only">
                {{ isUploading ? 'Uploading profile picture' : '' }}
              </p>
              <div class="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  :disabled="isUploading"
                  :class="[focusClass, 'min-h-12 rounded-xl px-4 font-semibold underline']"
                  @click="isModalOpen = false"
                >
                  Cancel
                </button>
                <UButton
                  type="submit"
                  :loading="isUploading"
                  :disabled="!selectedFile"
                  :class="buttonClass"
                >
                  Upload picture
                </UButton>
              </div>
            </form>
          </template>
        </UModal>
        <UButton :loading="isSigningOut" :class="buttonClass" @click="logout">Sign out</UButton>
      </div>
    </header>

    <p role="alert" class="font-medium text-red-800">{{ logoutError }}</p>
    <p role="status">{{ status }}</p>

    <section
      aria-labelledby="registered-users"
      class="rounded-3xl border border-[var(--bn-border)] bg-white p-5 sm:p-8"
    >
      <h2 id="registered-users" class="bn-font-display text-xl font-bold">Registered users</h2>
      <p v-if="pending" role="status" class="mt-3">Loading users…</p>
      <p v-else-if="error" role="alert" class="mt-3 font-medium text-red-800">
        We could not load the user list. Reload the page to try again.
      </p>
      <p v-else-if="!users?.length" class="mt-3">No users found.</p>
      <template v-else>
        <p class="mt-2 text-[var(--bn-muted)]">{{ users.length }} registered</p>
        <ul class="mt-4 divide-y divide-[var(--bn-border)]">
          <li
            v-for="user in users"
            :key="user.id"
            class="flex flex-wrap items-center justify-between gap-3 py-4"
          >
            <div class="flex min-w-0 items-center gap-3">
              <UAvatar :src="getImageLink(user)" aria-hidden="true" size="md" />
              <div class="min-w-0 wrap-anywhere">
                <p class="font-semibold">{{ user.name }}</p>
                <p class="text-[var(--bn-muted)]">{{ user.email }}</p>
              </div>
            </div>
            <span class="rounded-full bg-[var(--bn-peach)] px-3 py-1 text-sm font-semibold">
              {{ user.emailVerified ? 'Email verified' : 'Email verification pending' }}
            </span>
          </li>
        </ul>
      </template>
    </section>
  </main>
</template>

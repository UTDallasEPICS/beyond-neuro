<script setup lang="ts">
  import { z } from 'zod'
  import { authClient } from '~/utils/auth-client'

  definePageMeta({ layout: 'activity' })
  useHead({ title: 'Sign in | BeyondNeuro' })

  const emailSchema = z.email()
  const email = ref('')
  const otp = ref('')
  const codeRequested = ref(false)
  const busy = ref(false)
  const errorMessage = ref('')
  const fieldInvalid = ref(false)
  const emailInput = useTemplateRef<HTMLInputElement>('emailInput')
  const codeInput = useTemplateRef<HTMLInputElement>('codeInput')

  const inputClass =
    'min-h-14 w-full rounded-xl border border-[var(--bn-muted)] bg-white px-4 text-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bn-navy)]'
  const focusClass =
    'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--bn-navy)]'

  function clearError() {
    errorMessage.value = ''
    fieldInvalid.value = false
  }

  async function editEmail() {
    codeRequested.value = false
    otp.value = ''
    clearError()
    await nextTick()
    emailInput.value?.focus()
  }

  async function handleSubmit() {
    if (busy.value) return

    clearError()
    const address = email.value.trim()
    const code = otp.value.trim()

    if (!codeRequested.value && !emailSchema.safeParse(address).success) {
      fieldInvalid.value = true
      errorMessage.value = 'Enter a valid email address, such as name@example.com.'
      emailInput.value?.focus()
      return
    }

    if (codeRequested.value && !/^\d{6}$/.test(code)) {
      fieldInvalid.value = true
      errorMessage.value = 'Enter the six-digit code from your email.'
      codeInput.value?.focus()
      return
    }

    busy.value = true
    try {
      if (!codeRequested.value) {
        const { error } = await authClient.emailOtp.sendVerificationOtp({
          email: address,
          type: 'sign-in',
        })
        if (error) {
          errorMessage.value = 'We could not request a code. Please try again.'
          return
        }

        email.value = address
        codeRequested.value = true
        await nextTick()
        codeInput.value?.focus()
        return
      }

      const { error } = await authClient.signIn.emailOtp({ email: address, otp: code })
      if (error) {
        errorMessage.value = 'We could not sign you in. Check your code or request a new one.'
        return
      }

      await navigateTo('/activities', { replace: true, external: true })
    } catch {
      errorMessage.value = 'Something went wrong. Please try again.'
    } finally {
      busy.value = false
    }
  }
</script>

<template>
  <main class="bn-font-body mx-auto max-w-lg px-4 py-10 sm:px-6 sm:py-16">
    <NuxtLink
      to="/"
      :class="[
        focusClass,
        'mb-5 inline-flex min-h-12 items-center rounded-lg px-2 font-semibold underline',
      ]"
    >
      Back to BeyondNeuro
    </NuxtLink>

    <section
      aria-labelledby="sign-in-heading"
      class="rounded-3xl border border-[var(--bn-border)] bg-white p-5 sm:p-8"
    >
      <h1 id="sign-in-heading" class="bn-font-display text-3xl font-bold">Sign in</h1>
      <p v-if="!codeRequested" class="mt-3 text-lg text-[var(--bn-muted)]">
        Enter the email address for your BeyondNeuro account to request a sign-in code.
      </p>
      <p v-else id="code-help" class="mt-3 text-lg break-words text-[var(--bn-muted)]">
        If an account exists for {{ email }}, a sign-in code will be sent to that address. You can
        paste the six-digit code below.
      </p>

      <form novalidate class="mt-6 space-y-3" @submit.prevent="handleSubmit">
        <div v-if="!codeRequested" class="space-y-2">
          <label for="auth-email" class="block text-lg font-semibold">Email address</label>
          <input
            id="auth-email"
            ref="emailInput"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            :readonly="busy"
            :aria-invalid="fieldInvalid || undefined"
            :aria-describedby="errorMessage ? 'auth-error' : undefined"
            :class="inputClass"
            @input="clearError"
          />
        </div>
        <div v-else class="space-y-2">
          <label for="auth-code" class="block text-lg font-semibold">Sign-in code</label>
          <input
            id="auth-code"
            ref="codeInput"
            v-model="otp"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            required
            :readonly="busy"
            :aria-invalid="fieldInvalid || undefined"
            :aria-describedby="errorMessage ? 'code-help auth-error' : 'code-help'"
            :class="inputClass"
            @input="clearError"
          />
        </div>

        <p id="auth-error" role="alert" class="font-medium text-red-800">{{ errorMessage }}</p>
        <p role="status" class="sr-only">
          {{ busy ? (codeRequested ? 'Signing in' : 'Requesting a code') : '' }}
        </p>
        <UButton
          type="submit"
          :loading="busy"
          :class="[
            focusClass,
            'min-h-14 w-full justify-center rounded-xl bg-[var(--bn-navy)] text-lg text-white hover:bg-[var(--bn-sidebar)]',
          ]"
        >
          {{ codeRequested ? 'Sign in' : 'Send code' }}
        </UButton>
        <button
          v-if="codeRequested"
          type="button"
          :disabled="busy"
          :class="[focusClass, 'min-h-12 rounded-lg px-2 text-left font-semibold underline']"
          @click="editEmail"
        >
          Change email or request a new code
        </button>
      </form>
    </section>
  </main>
</template>

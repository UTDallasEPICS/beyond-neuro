<script setup lang="ts">
  import { z } from 'zod'

  const toast = useToast()
  const isEmailSent = ref(false)

  const schema = computed(() => {
    if (!isEmailSent.value) {
      return z.object({
        email: z.string().email('Invalid email'),
      })
    } else {
      return z.object({
        email: z.string().email('Invalid email'),
        otp: z.array(z.string()).length(6, 'Must be 6 digits'),
      })
    }
  })

  const state = reactive({
    email: '',
    otp: [] as string[],
  })

  async function handleSubmit() {
    if (!isEmailSent.value) {
      // TODO: wire up auth — authClient.emailOtp.sendVerificationOtp
      isEmailSent.value = true
      toast.add({ title: 'Success', description: 'OTP sent to your email', color: 'success' })
    } else {
      // TODO: wire up auth — authClient.signIn.emailOtp
      await navigateTo('/', { external: true })
    }
  }
</script>

<template>
  <div class="flex h-full w-full items-center justify-center py-12">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="flex items-center justify-center text-xl font-bold">Login</div>
      </template>

      <UForm :schema="schema" :state="state" @submit="handleSubmit" class="space-y-5">
        <UFormField name="email" v-if="!isEmailSent">
          <UInput v-model="state.email" class="w-full" placeholder="Email" />
        </UFormField>

        <UFormField name="otp" v-if="isEmailSent">
          <UPinInput
            otp
            v-model="state.otp"
            :length="6"
            size="xl"
            class="flex w-full items-center justify-center"
          />
        </UFormField>

        <UButton loading-auto type="submit" class="w-full justify-center">
          {{ isEmailSent ? 'Login' : 'Send OTP' }}
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>

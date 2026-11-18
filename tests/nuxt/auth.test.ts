// @vitest-environment nuxt
import { flushPromises } from '@vue/test-utils'
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AuthPage from '../../app/pages/auth.vue'

const { sendCode, signIn, navigateTo } = vi.hoisted(() => ({
  sendCode: vi.fn(),
  signIn: vi.fn(),
  navigateTo: vi.fn(),
}))

vi.mock('~/utils/auth-client', () => ({
  authClient: {
    emailOtp: { sendVerificationOtp: sendCode },
    signIn: { emailOtp: signIn },
  },
}))

mockNuxtImport('navigateTo', () => navigateTo)

describe('email code sign-in', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    sendCode.mockResolvedValue({ error: null })
    signIn.mockResolvedValue({ error: null })
  })

  it('focuses the single code field and submits the entire code, including leading zeros', async () => {
    const wrapper = await mountSuspended(AuthPage, { attachTo: document.body })
    try {
      await wrapper.get('#auth-email').setValue('test@example.com')
      await wrapper.get('form').trigger('submit')
      await flushPromises()

      expect(sendCode).toHaveBeenCalledWith({ email: 'test@example.com', type: 'sign-in' })
      const input = wrapper.get('#auth-code')
      expect(input.attributes('autocomplete')).toBe('one-time-code')
      expect(document.activeElement).toBe(input.element)

      await input.setValue('012345')
      await wrapper.get('form').trigger('submit')
      await flushPromises()

      expect(signIn).toHaveBeenCalledWith({ email: 'test@example.com', otp: '012345' })
      expect(wrapper.get('h1').text()).toBe('You’re signed in')
      expect(document.activeElement).toBe(wrapper.get('h1').element)
      expect(wrapper.get('a[href="/"]').text()).toBe('Back to BeyondNeuro')
      expect(navigateTo).not.toHaveBeenCalled()
    } finally {
      wrapper.unmount()
    }
  })

  it('announces a failed code request and leaves the email step available', async () => {
    sendCode.mockResolvedValue({ error: { status: 500 } })
    const wrapper = await mountSuspended(AuthPage)
    await wrapper.get('#auth-email').setValue('test@example.com')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('could not request a code')
    expect(wrapper.find('#auth-code').exists()).toBe(false)
    expect(navigateTo).not.toHaveBeenCalled()
  })
})

// @vitest-environment nuxt
//
// A component test for the application shell (app/app.vue). It renders the real
// component in the Nuxt environment, stubs out page routing, and proves the shell
// opens straight into the activity layout: no login, no template header.
//
// This test never opens the database, reads an env file, sends email, or makes a
// network request. Those integrations are intentionally out of scope for the
// baseline (see docs/testing.md).

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import App from '../../app/app.vue'

describe('application shell (app.vue)', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Arrange: watch the global fetch so each test can prove the shell renders
    // without reaching the network. spyOn keeps the original implementation, so
    // a real request would still be recorded (and fail the assertion below).
    fetchSpy = vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  it('renders the home route inside the cream activity layout', async () => {
    // Act: mount the shell. NuxtLayout renders layouts/activity.vue; stub the page.
    const wrapper = await mountSuspended(App, {
      global: { stubs: { NuxtPage: true } },
    })

    // Assert: the activity layout's cream background wraps the page.
    expect(wrapper.find('.bg-\\[var\\(--bn-cream\\)\\]').exists()).toBe(true)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('shows no template header or login prompt', async () => {
    // Act
    const wrapper = await mountSuspended(App, {
      global: { stubs: { NuxtPage: true } },
    })

    // Assert
    expect(wrapper.text()).not.toContain('Nuxt Template')
    expect(wrapper.text().toLowerCase()).not.toContain('sign in')
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

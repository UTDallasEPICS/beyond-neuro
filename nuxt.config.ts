// https://nuxt.com/docs/api/configuration/nuxt-config
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const offlinePageRevision = createHash('md5')
  .update(readFileSync('public/offline.html'))
  .digest('hex')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/image', '@nuxt/eslint', '@vite-pwa/nuxt'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      meta: [
        { name: 'theme-color', content: '#26215c' },
        // iOS ignores most of the web manifest; these make "Add to Home Screen" open full-screen.
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'BeyondNeuro' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      ],
      link: [{ rel: 'apple-touch-icon', href: '/pwa/apple-touch-icon-180x180.png' }],
    },
  },
  pwa: {
    // New versions wait until the app is closed instead of reloading mid-activity.
    // Pages always come from the network, so users still get the latest code.
    registerType: 'prompt',
    manifest: {
      id: '/',
      name: 'BeyondNeuro',
      short_name: 'BeyondNeuro',
      description: 'Calm, untimed brain health activities. Take your time — there is no rush.',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      theme_color: '#26215c',
      background_color: '#fff8f0',
      icons: [
        { src: '/pwa/pwa-64x64.png', sizes: '64x64', type: 'image/png' },
        { src: '/pwa/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        {
          src: '/pwa/maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      // The app is server-rendered, so there is no single HTML shell to fall back to.
      navigateFallback: null,
      // No *.html here: the module rewrites precached HTML to extensionless routes,
      // which 404 on this server, so offline.html is added separately below.
      globPatterns: ['**/*.{js,css,svg,png,ico,woff2}'],
      globIgnores: ['pwa/icon-source.png'],
      additionalManifestEntries: [{ url: '/offline.html', revision: offlinePageRevision }],
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkOnly',
          options: { precacheFallback: { fallbackURL: '/offline.html' } },
        },
      ],
    },
    // Setting `client` replaces the module defaults, so registerPlugin must be repeated.
    // Vitest can't resolve the plugin's virtual register module, so tests run without it.
    client: {
      registerPlugin: !process.env.VITEST,
      installPrompt: true,
    },
  },
  // Prettier owns formatting; ESLint handles logic only (no stylistic rules).
  eslint: {
    config: {
      stylistic: false,
    },
  },
  // Surface TypeScript errors in the terminal during `nuxt dev`. Not during
  // `nuxt build`: the in-build vue-tsc runs in a clean environment where it
  // can't resolve auto-imports/module types and fails the Docker deploy. CI
  // runs `pnpm typecheck` (nuxi typecheck) as the real gate.
  typescript: {
    typeCheck: process.env.NODE_ENV !== 'production',
  },
  vite: {
    optimizeDeps: {
      include: ['zod'],
    },
  },
})

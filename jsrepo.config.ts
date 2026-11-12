import { defineConfig } from 'jsrepo'

export default defineConfig({
  // Vue Bits registry (official Vue port of React Bits)
  registries: ['https://vue-bits.dev/r'],
  // Drop downloaded Bits into the Nuxt components folder
  paths: {
    '*': './app/components/vue-bits',
  },
})

import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Regenerate with `pnpm pwa:icons` after changing the source logo.
const logoPurple = '#534AB7'

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    // The root public/favicon.ico is kept as-is.
    transparent: { ...minimal2023Preset.transparent, favicons: [] },
    // Maskable and Apple icons are cropped by the OS, so the logo needs padding.
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: logoPurple } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: logoPurple } },
  },
  images: ['public/pwa/icon-source.png'],
})

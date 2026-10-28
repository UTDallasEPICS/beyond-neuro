<script setup lang="ts">
  // Simplified U.S. coin drawing, sized to real relative diameters
  // (dime < penny < nickel < quarter). Stylized, not a replica.
  const props = defineProps<{ cents: 1 | 5 | 10 | 25 }>()

  const COINS = {
    1: {
      name: 'Penny',
      label: '1¢',
      words: 'ONE CENT',
      size: 76,
      face: '#C8794A',
      rim: '#8E4B26',
      ink: '#4A2410',
    },
    5: {
      name: 'Nickel',
      label: '5¢',
      words: 'FIVE CENTS',
      size: 85,
      face: '#C9CCCF',
      rim: '#8A8F94',
      ink: '#33373B',
    },
    10: {
      name: 'Dime',
      label: '10¢',
      words: 'ONE DIME',
      size: 72,
      face: '#D9DCDF',
      rim: '#9096A0',
      ink: '#33373B',
    },
    25: {
      name: 'Quarter',
      label: '25¢',
      words: 'QUARTER DOLLAR',
      size: 97,
      face: '#D2D5D9',
      rim: '#878D95',
      ink: '#33373B',
    },
  }

  const coin = computed(() => COINS[props.cents])

  // Unique ids so several coins on one page don't share a gradient/path.
  const uid = useId()
  const gradientId = `coin-shine-${uid}`
  const arcId = `coin-arc-${uid}`
</script>

<template>
  <svg
    viewBox="0 0 100 100"
    :width="coin.size"
    :height="coin.size"
    role="img"
    :aria-label="`${coin.name}, ${cents} ${cents === 1 ? 'cent' : 'cents'}`"
  >
    <defs>
      <radialGradient :id="gradientId" cx="35%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.7" />
        <stop offset="45%" :stop-color="coin.face" />
        <stop offset="100%" :stop-color="coin.rim" />
      </radialGradient>
      <path :id="arcId" d="M 18 50 A 32 32 0 0 1 82 50" />
    </defs>

    <circle
      cx="50"
      cy="50"
      r="48"
      :fill="`url(#${gradientId})`"
      :stroke="coin.rim"
      stroke-width="3"
    />
    <circle cx="50" cy="50" r="41" fill="none" :stroke="coin.rim" stroke-dasharray="1.5 1.5" />

    <text font-size="9" font-weight="700" letter-spacing="1" :fill="coin.ink">
      <textPath :href="`#${arcId}`" startOffset="50%" text-anchor="middle">LIBERTY</textPath>
    </text>
    <text x="50" y="60" text-anchor="middle" font-size="24" font-weight="800" :fill="coin.ink">
      {{ coin.label }}
    </text>
    <text x="50" y="76" text-anchor="middle" font-size="6" font-weight="700" :fill="coin.ink">
      {{ coin.words }}
    </text>
  </svg>
</template>

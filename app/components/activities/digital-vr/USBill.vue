<script setup lang="ts">
  // Simplified U.S. bill drawing. Intentionally stylized, not a replica
  // (U.S. law restricts realistic reproductions of currency).
  const props = defineProps<{ dollars: 1 | 5 | 10 | 20 | 50 | 100 }>()

  const BILLS = {
    1: { word: 'ONE DOLLAR', portrait: 'WASHINGTON', tint: '#E6EDD8' },
    5: { word: 'FIVE DOLLARS', portrait: 'LINCOLN', tint: '#ECE6F3' },
    10: { word: 'TEN DOLLARS', portrait: 'HAMILTON', tint: '#F4E8D6' },
    20: { word: 'TWENTY DOLLARS', portrait: 'JACKSON', tint: '#E4EEDC' },
    50: { word: 'FIFTY DOLLARS', portrait: 'GRANT', tint: '#F3E3E6' },
    100: { word: 'ONE HUNDRED DOLLARS', portrait: 'FRANKLIN', tint: '#E0EAF3' },
  }

  const bill = computed(() => BILLS[props.dollars])
</script>

<template>
  <svg
    viewBox="0 0 240 102"
    role="img"
    :aria-label="`${dollars} dollar bill`"
    class="h-auto w-full"
  >
    <!-- Paper and borders -->
    <rect
      x="1"
      y="1"
      width="238"
      height="100"
      rx="4"
      :fill="bill.tint"
      stroke="#3F5E3A"
      stroke-width="2"
    />
    <rect
      x="7"
      y="7"
      width="226"
      height="88"
      rx="2"
      fill="none"
      stroke="#3F5E3A"
      stroke-dasharray="2 2"
    />

    <text
      x="120"
      y="19"
      text-anchor="middle"
      font-size="8"
      font-weight="700"
      letter-spacing="1"
      fill="#2F4A2B"
    >
      THE UNITED STATES OF AMERICA
    </text>

    <!-- Value in all four corners -->
    <g font-size="15" font-weight="800" fill="#2F4A2B">
      <text x="13" y="25">{{ dollars }}</text>
      <text x="227" y="25" text-anchor="end">{{ dollars }}</text>
      <text x="13" y="93">{{ dollars }}</text>
      <text x="227" y="93" text-anchor="end">{{ dollars }}</text>
    </g>

    <!-- Federal Reserve seal (left) and Treasury seal (right) -->
    <circle cx="62" cy="52" r="11" fill="none" stroke="#33413A" stroke-width="1.5" />
    <circle cx="62" cy="52" r="6" fill="#33413A" opacity="0.25" />
    <circle cx="178" cy="54" r="11" fill="#DDEBD5" stroke="#2F7A3A" stroke-width="1.5" />
    <path
      d="M178 47 L180 52 L185 52 L181 55 L183 60 L178 57 L173 60 L175 55 L171 52 L176 52 Z"
      fill="#2F7A3A"
    />

    <!-- $100 blue security ribbon -->
    <rect v-if="dollars === 100" x="150" y="8" width="4" height="86" fill="#3B6FB6" opacity="0.8" />

    <!-- Portrait oval with a simple bust -->
    <ellipse cx="120" cy="50" rx="23" ry="25" fill="#F7F5EC" stroke="#3F5E3A" stroke-width="1.5" />
    <circle cx="120" cy="44" r="8" fill="#5B6E57" />
    <path d="M105 72 Q120 52 135 72 Z" fill="#5B6E57" />
    <text x="120" y="83" text-anchor="middle" font-size="6" letter-spacing="0.5" fill="#2F4A2B">
      {{ bill.portrait }}
    </text>

    <text
      x="120"
      y="94"
      text-anchor="middle"
      font-size="9"
      font-weight="800"
      letter-spacing="0.5"
      fill="#2F4A2B"
    >
      {{ bill.word }}
    </text>
  </svg>
</template>

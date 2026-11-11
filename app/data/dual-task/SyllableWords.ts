export const LEVELS = [1, 2, 3, 4, 5, 6, 7] as const
export type Level = (typeof LEVELS)[number]

export const LEVEL_INFO: Record<Level, { name: string; example: string }> = {
  1: { name: 'One-part words', example: 'dog' },
  2: { name: 'Two-part words', example: 'ap · ple' },
  3: { name: 'Three-part words', example: 'ba · na · na' },
  4: { name: 'Four-part words', example: 'wa · ter · mel · on' },
  5: { name: 'Five-part words', example: 're · frig · er · a · tor' },
  6: { name: 'Short phrases', example: 'hap · py birth · day' },
  7: { name: 'Full sentences', example: 'the sun is shin · ing' },
}

// Time between beats in ms. Slow and steady, a little quicker at higher levels
export const BEAT_MS: Record<Level, number> = {
  1: 1000,
  2: 1000,
  3: 1000,
  4: 900,
  5: 900,
  6: 800,
  7: 750,
}

export interface SyllableWord {
  level: Level
  // The syllables the user claps along to. 
  syllables: string[]
  // Placeholder picture 
  emoji: string
  // Text spoken by TTS and read to screen readers. 
  label: string
}

const w = (level: Level, emoji: string, ...syllables: string[]): SyllableWord => ({
  level,
  emoji,
  syllables,
  label: syllables.join(''),
})
// Phrases: spaces split words, hyphens split syllables inside a word.
const p = (level: Level, emoji: string, text: string): SyllableWord => ({
  level,
  emoji,
  syllables: text.split(/[\s-]+/),
  label: text.replace(/-/g, ''),
})

export const SYLLABLE_WORDS: SyllableWord[] = [
  // Level 1: one syllable
  w(1, '🐕', 'dog'),
  w(1, '☕', 'cup'),
  w(1, '☀️', 'sun'),
  w(1, '🍞', 'bread'),
  w(1, '🌳', 'tree'),
  w(1, '👟', 'shoe'),
  w(1, '⛪', 'church'),

  // Level 2: two syllables
  w(2, '🍎', 'ap', 'ple'),
  w(2, '🌻', 'gar', 'den'),
  w(2, '👩', 'sis', 'ter'),
  w(2, '💧', 'wa', 'ter'),
  w(2, '🪟', 'win', 'dow'),
  w(2, '🩺', 'doc', 'tor'),
  w(2, '🛏️', 'pil', 'low'),

  // Level 3: three syllables
  w(3, '🍌', 'ba', 'na', 'na'),
  w(3, '🍅', 'to', 'ma', 'to'),
  w(3, '🥔', 'po', 'ta', 'to'),
  w(3, '🦋', 'but', 'ter', 'fly'),
  w(3, '☎️', 'tel', 'e', 'phone'),
  w(3, '🚲', 'bi', 'cy', 'cle'),
  w(3, '👵', 'grand', 'moth', 'er'),

  // Level 4: four syllables
  w(4, '🍉', 'wa', 'ter', 'mel', 'on'),
  w(4, '🥑', 'a', 'vo', 'ca', 'do'),
  w(4, '🚁', 'hel', 'i', 'cop', 'ter'),
  w(4, '🐛', 'cat', 'er', 'pil', 'lar'),
  w(4, '🐊', 'al', 'li', 'ga', 'tor'),
  w(4, '📺', 'tel', 'e', 'vi', 'sion'),

  // Level 5: five syllables
  w(5, '🧊', 're', 'frig', 'er', 'a', 'tor'),
  w(5, '🦛', 'hip', 'po', 'pot', 'a', 'mus'),
  w(5, '🏫', 'u', 'ni', 'ver', 'si', 'ty'),
  w(5, '⚡', 'e', 'lec', 'tric', 'i', 'ty'),
  w(5, '📖', 'vo', 'cab', 'u', 'lar', 'y'),

  // Level 6: short phrases (3–4 beats across 2–3 words)
  p(6, '🌅', 'good mor-ning'),
  p(6, '🎂', 'hap-py birth-day'),
  p(6, '🙏', 'thank you so much'),
  p(6, '👋', 'see you la-ter'),
  p(6, '☕', 'cup of cof-fee'),
  p(6, '🍽️', 'time for lunch'),

  // Level 7: full sentences (5–9 beats)
  p(7, '🌞', 'the sun is shin-ing to-day'),
  p(7, '🌻', "let's go to the gar-den"),
  p(7, '🍞', 'please pass the corn-bread'),
  p(7, '🎶', 'hap-py birth-day to you'),
  p(7, '⛪', 'we go to church on Sun-day'),
  p(7, '👵', 'my grand-ma makes the best ta-ma-les'),
]

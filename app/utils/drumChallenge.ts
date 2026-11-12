// Drums (Music Therapy & Rhythm): rules for the three thinking challenges.
// There is no failing: a mistake only makes the next turn a little easier.

export type ChallengeMode = 'copy' | 'lights' | 'sounds'

/** Turns in one go, before the summary. */
export const TURNS = 10

/** Copy me: pattern length starts at 1, grows after 2 correct in a row, shrinks after a mistake. */
export const COPY_RULES = { start: 1, min: 1, max: 8, growAfter: 2, gapMs: 1200 }

/** Follow the lights: how long a part stays lit, in milliseconds. */
export const LIGHT_RULES = { startMs: 4000, minMs: 1500, maxMs: 6000, stepMs: 500, fasterAfter: 2 }

/** A score of 7 or more out of 10 suggests trying the next level. */
export const SUGGEST_NEXT_AT = 7

export interface Adapted {
  value: number
  /** Correct answers in a row since the last change. */
  streak: number
}

/** Next Copy me pattern length after a turn. */
export function nextCopyLength(length: number, streak: number, correct: boolean): Adapted {
  if (!correct) return { value: Math.max(COPY_RULES.min, length - 1), streak: 0 }
  const s = streak + 1
  if (s >= COPY_RULES.growAfter) return { value: Math.min(COPY_RULES.max, length + 1), streak: 0 }
  return { value: length, streak: s }
}

/** Next Follow the lights time limit (ms) after a turn. */
export function nextLightTime(ms: number, streak: number, caught: boolean): Adapted {
  if (!caught) return { value: Math.min(LIGHT_RULES.maxMs, ms + LIGHT_RULES.stepMs), streak: 0 }
  const s = streak + 1
  if (s >= LIGHT_RULES.fasterAfter) {
    return { value: Math.max(LIGHT_RULES.minMs, ms - LIGHT_RULES.stepMs), streak: 0 }
  }
  return { value: ms, streak: s }
}

/** A random part, avoiding the previous one when there is a choice. */
export function randomPart(ids: string[], previous?: string, rng: () => number = Math.random) {
  const choices = ids.length > 1 && previous ? ids.filter((id) => id !== previous) : ids
  return choices[Math.floor(rng() * choices.length)]!
}

/** A random pattern that never repeats the same part three times in a row (when there is a choice). */
export function randomPattern(ids: string[], length: number, rng: () => number = Math.random) {
  const out: string[] = []
  for (let i = 0; i < length; i++) {
    const lastTwoSame = i >= 2 && out[i - 1] === out[i - 2]
    const avoid = ids.length > 1 && lastTwoSame ? out[i - 1] : undefined
    const choices = avoid ? ids.filter((id) => id !== avoid) : ids
    out.push(choices[Math.floor(rng() * choices.length)]!)
  }
  return out
}

export interface ChallengeStats {
  /** Turns answered correctly (out of TURNS). */
  correct: number
  /** Copy me: longest pattern copied correctly. */
  longest: number
  /** Follow the lights: reaction times of caught lights, in ms. */
  reactionMs: number[]
}

export function emptyStats(): ChallengeStats {
  return { correct: 0, longest: 0, reactionMs: [] }
}

/** Plain-language summary lines for the end of a go. */
export function summaryLines(mode: ChallengeMode, stats: ChallengeStats): string[] {
  if (mode === 'copy') {
    return [
      `You copied ${stats.correct} of ${TURNS} patterns.`,
      stats.longest > 0
        ? `Your longest pattern was ${stats.longest} ${stats.longest === 1 ? 'hit' : 'hits'}.`
        : 'Keep practising — it gets easier each time.',
    ]
  }
  if (mode === 'lights') {
    const lines = [`You caught ${stats.correct} of ${TURNS} lights.`]
    if (stats.reactionMs.length) {
      const avg = stats.reactionMs.reduce((a, b) => a + b, 0) / stats.reactionMs.length
      lines.push(`On average you tapped in ${(avg / 1000).toFixed(1)} seconds.`)
    }
    return lines
  }
  return [`You named ${stats.correct} of ${TURNS} sounds.`]
}

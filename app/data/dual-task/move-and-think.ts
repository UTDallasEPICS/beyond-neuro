export const COUNT_STEPS = [3, 7] as const
export type CountStep = (typeof COUNT_STEPS)[number]

export const WALK_ROUND_SECONDS = 60
export const WALK_START_NUMBER = 100

export function nextWalkSecond(secondsLeft: number): { secondsLeft: number; finished: boolean } {
  if (secondsLeft <= 1) return { secondsLeft: 0, finished: true }
  return { secondsLeft: secondsLeft - 1, finished: false }
}

export function nextCount(current: number, step: CountStep): number {
  const next = current - step
  return next > 0 ? next : WALK_START_NUMBER
}

export function answerChoices(
  current: number,
  step: CountStep,
  correctFirst: boolean
): { value: number; correct: boolean }[] {
  const correct = nextCount(current, step)
  const lower = correct - step
  const distractor = lower > 0 ? lower : correct + step
  const answers = [
    { value: correct, correct: true },
    { value: distractor, correct: false },
  ]
  return correctFirst ? answers : [answers[1]!, answers[0]!]
}

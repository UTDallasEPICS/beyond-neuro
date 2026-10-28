import type { ReminiscenceLevel } from './levels'

export type PhotoObjectId =
  'bicycle' | 'motorcycle' | 'fire-hydrant' | 'mailbox' | 'dog' | 'cat' | 'coffee-cup' | 'teapot'

export interface PhotoObject {
  id: PhotoObjectId
  name: string
  plural: string
  /** The object most easily confused with this one, used on harder levels. */
  lookAlike: PhotoObjectId
  /** Alt text for each photo; each one names the object so screen reader users can play. */
  photos: string[]
  memoryPrompts: string[]
}

export interface PhotoTile {
  key: string
  objectId: PhotoObjectId
  src: string
  alt: string
  isTarget: boolean
}

export interface PhotoRound {
  target: PhotoObject
  tiles: PhotoTile[]
}

interface PhotoLevelRule {
  label: string
  description: string
  tiles: number
  targets: number
  lookAlikes: number
}

export const ROUNDS_PER_LEVEL = 3

/** Levels get harder with more pictures, more to find, and look-alikes mixed in. */
export const photoLevels: Record<ReminiscenceLevel, PhotoLevelRule> = {
  1: {
    label: 'A first look',
    description: '4 pictures, find 1',
    tiles: 4,
    targets: 1,
    lookAlikes: 0,
  },
  2: { label: 'Find two', description: '4 pictures, find 2', tiles: 4, targets: 2, lookAlikes: 0 },
  3: {
    label: 'More pictures',
    description: '6 pictures, find 2',
    tiles: 6,
    targets: 2,
    lookAlikes: 0,
  },
  4: {
    label: 'Find three',
    description: '6 pictures, find 3',
    tiles: 6,
    targets: 3,
    lookAlikes: 0,
  },
  5: {
    label: 'Look closely',
    description: '6 pictures, with a look-alike',
    tiles: 6,
    targets: 2,
    lookAlikes: 1,
  },
  6: {
    label: 'Bigger grid',
    description: '9 pictures, with look-alikes',
    tiles: 9,
    targets: 3,
    lookAlikes: 2,
  },
  7: {
    label: 'Sharp eyes',
    description: '9 pictures, with more look-alikes',
    tiles: 9,
    targets: 3,
    lookAlikes: 3,
  },
}

export const photoObjects: PhotoObject[] = [
  {
    id: 'bicycle',
    name: 'bicycle',
    plural: 'bicycles',
    lookAlike: 'motorcycle',
    photos: [
      'A blue bicycle with a wicker basket leaning against a brick wall.',
      'A red bicycle parked on a tree-lined sidewalk.',
      'A green bicycle on a park path next to a wooden bench.',
    ],
    memoryPrompts: [
      'Did you ride a bicycle when you were young? Tell me about it.',
      'Who taught you to ride a bike?',
      'Where did you like to ride?',
    ],
  },
  {
    id: 'motorcycle',
    name: 'motorcycle',
    plural: 'motorcycles',
    lookAlike: 'bicycle',
    photos: [
      'A black and chrome motorcycle parked on a country road.',
      'A red vintage motorcycle parked in front of an old garage.',
      'A blue motorcycle on a desert highway at sunset.',
    ],
    memoryPrompts: [
      'Did you or someone you know ride a motorcycle?',
      'Tell me about a road trip you remember.',
      'What was the most exciting ride you ever took?',
    ],
  },
  {
    id: 'fire-hydrant',
    name: 'fire hydrant',
    plural: 'fire hydrants',
    lookAlike: 'mailbox',
    photos: [
      'A red fire hydrant on a sidewalk next to green grass.',
      'A yellow fire hydrant on a street corner covered in autumn leaves.',
      'A silver and red fire hydrant in front of a white picket fence.',
    ],
    memoryPrompts: [
      'Tell me about the street you grew up on.',
      'Did kids play in the water from a fire hydrant on hot summer days?',
      'What do you remember about your neighbors?',
    ],
  },
  {
    id: 'mailbox',
    name: 'mailbox',
    plural: 'mailboxes',
    lookAlike: 'fire-hydrant',
    photos: [
      'A metal mailbox on a wooden post beside a country road.',
      'A blue mailbox on a city sidewalk.',
      'A black mailbox on a brick pillar at the end of a driveway.',
    ],
    memoryPrompts: [
      'Do you remember a letter or card that meant a lot to you?',
      'Who did you write letters to?',
      'What did you look forward to finding in the mail?',
    ],
  },
  {
    id: 'dog',
    name: 'dog',
    plural: 'dogs',
    lookAlike: 'cat',
    photos: [
      'A golden retriever dog sitting on a wooden front porch.',
      'A black and white border collie dog standing in a grassy yard.',
      'A beagle dog lying on a living room rug.',
    ],
    memoryPrompts: [
      'Tell me about a dog you have known.',
      'What was its name?',
      'What is a funny thing a pet did?',
    ],
  },
  {
    id: 'cat',
    name: 'cat',
    plural: 'cats',
    lookAlike: 'dog',
    photos: [
      'An orange tabby cat sitting on a sunny windowsill.',
      'A gray and white cat curled up on a knitted blanket.',
      'A black cat sitting in a garden among flowers.',
    ],
    memoryPrompts: [
      'Have you ever had a cat? Tell me about it.',
      'Who in your family loved animals the most?',
      'What is your favorite animal, and why?',
    ],
  },
  {
    id: 'coffee-cup',
    name: 'coffee cup',
    plural: 'coffee cups',
    lookAlike: 'teapot',
    photos: [
      'A white coffee cup with steaming coffee on a wooden table.',
      'A red coffee cup of black coffee on a diner counter.',
      'A blue and white patterned coffee cup on a porch railing at sunrise.',
    ],
    memoryPrompts: [
      'How do you like your coffee?',
      'Who did you like to share a morning cup with?',
      'Tell me about a favorite diner or coffee shop.',
    ],
  },
  {
    id: 'teapot',
    name: 'teapot',
    plural: 'teapots',
    lookAlike: 'coffee-cup',
    photos: [
      'A white teapot with pink flowers on a lace tablecloth.',
      'A brown round teapot on a wooden kitchen counter.',
      'A shiny copper teapot on an old stove.',
    ],
    memoryPrompts: [
      'Who made tea in your home?',
      'Tell me about a special tea time or visit.',
      'What did you like to drink on a cold day?',
    ],
  },
]

const byId = Object.fromEntries(photoObjects.map((o) => [o.id, o])) as Record<
  PhotoObjectId,
  PhotoObject
>

function tilesFor(object: PhotoObject, isTarget: boolean): PhotoTile[] {
  return object.photos.map((alt, i) => ({
    key: `${object.id}-${i + 1}`,
    objectId: object.id,
    src: `/activities/reminiscence/photos/${object.id}-${i + 1}.jpg`,
    alt,
    isTarget,
  }))
}

export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

export function buildRound(
  level: ReminiscenceLevel,
  targetId: PhotoObjectId,
  rng: () => number = Math.random
): PhotoRound {
  const rule = photoLevels[level]
  const target = byId[targetId]
  const lookAlike = byId[target.lookAlike]

  const targets = shuffle(tilesFor(target, true), rng).slice(0, rule.targets)
  const lookAlikes = shuffle(tilesFor(lookAlike, false), rng).slice(0, rule.lookAlikes)
  const others = shuffle(
    photoObjects
      .filter((o) => o.id !== target.id && o.id !== lookAlike.id)
      .flatMap((o) => tilesFor(o, false)),
    rng
  ).slice(0, rule.tiles - targets.length - lookAlikes.length)

  return { target, tiles: shuffle([...targets, ...lookAlikes, ...others], rng) }
}

/** A fresh set of rounds, each looking for a different object. */
export function buildLevel(
  level: ReminiscenceLevel,
  rng: () => number = Math.random
): PhotoRound[] {
  return shuffle(photoObjects, rng)
    .slice(0, ROUNDS_PER_LEVEL)
    .map((o) => buildRound(level, o.id, rng))
}

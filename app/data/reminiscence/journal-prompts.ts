import type { ReminiscenceLevel } from './levels'

export interface JournalField {
  id: string
  label: string
  /** A bigger box for a few sentences instead of a word or two. */
  long?: boolean
  /** Answers the user can tap instead of typing. */
  suggestions?: string[]
}

export interface JournalPrompt {
  id: string
  level: ReminiscenceLevel
  title: string
  prompt: string
  fields: JournalField[]
}

/** Entries move from one-word favorites to full stories worth passing on. */
export const journalLevels: Record<ReminiscenceLevel, { label: string; description: string }> = {
  1: {
    label: 'My favorites',
    description: 'Tap or write one favorite thing',
  },
  2: {
    label: 'My people',
    description: 'The people who matter to you',
  },
  3: {
    label: 'My places',
    description: 'Places you remember well',
  },
  4: {
    label: 'My everyday',
    description: 'Routines and ordinary days',
  },
  5: {
    label: 'Special days',
    description: 'Celebrations and big moments',
  },
  6: {
    label: 'Proud moments',
    description: 'Things you are proud of',
  },
  7: {
    label: 'Stories to pass on',
    description: 'Stories for the people you love',
  },
}

export const journalPrompts: JournalPrompt[] = [
  // Level 1: my favorites
  {
    id: 'fav-season',
    level: 1,
    title: 'Favorite season',
    prompt: 'What is your favorite time of year?',
    fields: [
      {
        id: 'season',
        label: 'My favorite season',
        suggestions: ['Spring', 'Summer', 'Fall', 'Winter'],
      },
    ],
  },
  {
    id: 'fav-meal',
    level: 1,
    title: 'Favorite meal',
    prompt: 'What meal do you always enjoy?',
    fields: [
      {
        id: 'meal',
        label: 'My favorite meal',
        suggestions: ['Fried chicken', 'Pot roast', 'Enchiladas', 'Barbecue', 'Spaghetti'],
      },
    ],
  },
  {
    id: 'fav-music',
    level: 1,
    title: 'Favorite music',
    prompt: 'What kind of music do you like best?',
    fields: [
      {
        id: 'music',
        label: 'My favorite music',
        suggestions: ['Country', 'Gospel', 'Rock and roll', 'Jazz', 'Big band'],
      },
    ],
  },

  // Level 2: my people
  {
    id: 'person-close',
    level: 2,
    title: 'Someone close to me',
    prompt: 'Who is someone you have always been close to?',
    fields: [
      { id: 'name', label: 'Their name' },
      {
        id: 'relation',
        label: 'Who they are to me',
        suggestions: ['Family', 'Friend', 'Neighbor', 'Coworker'],
      },
    ],
  },
  {
    id: 'person-laugh',
    level: 2,
    title: 'Someone who made me laugh',
    prompt: 'Who could always make you laugh?',
    fields: [
      { id: 'name', label: 'Their name' },
      { id: 'why', label: 'What made them funny' },
    ],
  },
  {
    id: 'person-taught',
    level: 2,
    title: 'Someone who taught me',
    prompt: 'Who taught you something important?',
    fields: [
      { id: 'name', label: 'Their name' },
      { id: 'lesson', label: 'What they taught me' },
    ],
  },

  // Level 3: my places
  {
    id: 'place-home',
    level: 3,
    title: 'A home I remember',
    prompt: 'Think of a home you lived in.',
    fields: [
      { id: 'where', label: 'Where it was' },
      {
        id: 'room',
        label: 'My favorite room',
        suggestions: ['Kitchen', 'Porch', 'Living room', 'Bedroom', 'Backyard'],
      },
    ],
  },
  {
    id: 'place-town',
    level: 3,
    title: 'My hometown',
    prompt: 'Where did you grow up?',
    fields: [
      { id: 'town', label: 'The town or city' },
      { id: 'known-for', label: 'What it was known for' },
    ],
  },
  {
    id: 'place-visit',
    level: 3,
    title: 'A place I loved to visit',
    prompt: 'Where did you love to go?',
    fields: [
      { id: 'place', label: 'The place' },
      { id: 'did', label: 'What I did there' },
    ],
  },

  // Level 4: my everyday
  {
    id: 'day-morning',
    level: 4,
    title: 'My mornings',
    prompt: 'What were your mornings like?',
    fields: [
      { id: 'wake', label: 'What time I got up' },
      { id: 'first', label: 'The first thing I did' },
      { id: 'breakfast', label: 'What I ate for breakfast' },
    ],
  },
  {
    id: 'day-work',
    level: 4,
    title: 'My work',
    prompt: 'Tell about the work you did.',
    fields: [
      { id: 'job', label: 'My job or role' },
      { id: 'liked', label: 'What I liked about it', long: true },
    ],
  },
  {
    id: 'day-weekend',
    level: 4,
    title: 'My weekends',
    prompt: 'How did you spend your weekends?',
    fields: [
      { id: 'saturday', label: 'A usual Saturday' },
      { id: 'sunday', label: 'A usual Sunday' },
    ],
  },

  // Level 5: special days
  {
    id: 'special-celebration',
    level: 5,
    title: 'A celebration',
    prompt: 'Think of a celebration you will never forget.',
    fields: [
      { id: 'what', label: 'What we celebrated' },
      { id: 'who', label: 'Who was there' },
      { id: 'remember', label: 'What I remember most', long: true },
    ],
  },
  {
    id: 'special-holiday',
    level: 5,
    title: 'A holiday tradition',
    prompt: 'What holiday tradition meant the most to you?',
    fields: [
      { id: 'holiday', label: 'The holiday' },
      { id: 'tradition', label: 'What we always did', long: true },
    ],
  },
  {
    id: 'special-trip',
    level: 5,
    title: 'A trip to remember',
    prompt: 'Think of a trip that stayed with you.',
    fields: [
      { id: 'where', label: 'Where we went' },
      { id: 'who', label: 'Who came along' },
      { id: 'best', label: 'The best part', long: true },
    ],
  },

  // Level 6: proud moments
  {
    id: 'proud-achievement',
    level: 6,
    title: 'Something I achieved',
    prompt: 'What is something you worked hard for?',
    fields: [
      { id: 'what', label: 'What I achieved' },
      { id: 'how', label: 'How I did it', long: true },
    ],
  },
  {
    id: 'proud-helped',
    level: 6,
    title: 'A time I helped',
    prompt: 'Think of a time you made a difference for someone.',
    fields: [
      { id: 'who', label: 'Who I helped' },
      { id: 'what', label: 'What I did', long: true },
    ],
  },
  {
    id: 'proud-hard-time',
    level: 6,
    title: 'Getting through',
    prompt: 'Think of a hard time you got through.',
    fields: [
      { id: 'what', label: 'What happened', long: true },
      { id: 'helped', label: 'What helped me through', long: true },
    ],
  },

  // Level 7: stories to pass on
  {
    id: 'pass-favorite-story',
    level: 7,
    title: 'A story I love to tell',
    prompt: 'What story do people always ask you to tell?',
    fields: [
      { id: 'title', label: 'A title for the story' },
      { id: 'story', label: 'The story', long: true },
    ],
  },
  {
    id: 'pass-advice',
    level: 7,
    title: 'Advice to pass on',
    prompt: 'What advice would you give to someone young?',
    fields: [
      { id: 'advice', label: 'My advice', long: true },
      { id: 'learned', label: 'How I learned it', long: true },
    ],
  },
  {
    id: 'pass-remembered',
    level: 7,
    title: 'How I want to be remembered',
    prompt: 'What do you hope people remember about you?',
    fields: [
      { id: 'remember', label: 'What I hope they remember', long: true },
      { id: 'for', label: 'Who this is for' },
    ],
  },
]

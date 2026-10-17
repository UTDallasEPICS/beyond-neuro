import type { ReminiscenceLevel } from './levels'

export type LifeStoryAnswer = 'yes' | 'no'

/**
 * - yes-no: answer Yes or No and move on
 * - pick: pick one answer from `choices` straight away
 * - choice: Yes or No; after Yes, pick one answer from `choices`
 * - follow-up: Yes or No, then an open question that depends on the answer
 * - open: an open question straight away
 */
export type LifeStoryPromptKind = 'yes-no' | 'pick' | 'choice' | 'follow-up' | 'open'

export interface LifeStoryPrompt {
  id: string
  level: ReminiscenceLevel
  kind: LifeStoryPromptKind
  question: string
  choiceQuestion?: string
  choices?: string[]
  followUpYes?: string
  followUpNo?: string
}

/** Questions move from simple yes/no to specific, detailed memories. */
export const lifeStoryLevels: Record<ReminiscenceLevel, { label: string; description: string }> = {
  1: {
    label: 'Yes or no',
    description: 'Answer with a simple yes or no',
  },
  2: {
    label: 'This or that',
    description: 'Pick one of two answers',
  },
  3: {
    label: 'Quick choices',
    description: 'Yes or no, then pick an answer',
  },
  4: {
    label: 'Tell a little more',
    description: 'Yes or no, then share a memory',
  },
  5: {
    label: 'Your stories',
    description: 'Open questions about your life',
  },
  6: {
    label: 'Looking back',
    description: 'Reflect on what matters to you',
  },
  7: {
    label: 'The small details',
    description: 'Specific memories and details',
  },
}

export const lifeStoryPrompts: LifeStoryPrompt[] = [
  // Level 1: yes or no
  {
    id: 'yn-big-city',
    level: 1,
    kind: 'yes-no',
    question: 'Did you grow up in a big city?',
  },
  {
    id: 'yn-pet',
    level: 1,
    kind: 'yes-no',
    question: 'Did you have a pet when you were young?',
  },
  {
    id: 'yn-dance',
    level: 1,
    kind: 'yes-no',
    question: 'Do you like to dance?',
  },
  {
    id: 'yn-sweets',
    level: 1,
    kind: 'yes-no',
    question: 'Do you have a sweet tooth?',
  },
  {
    id: 'yn-morning',
    level: 1,
    kind: 'yes-no',
    question: 'Are you a morning person?',
  },

  // Level 2: this or that
  {
    id: 'pick-drink',
    level: 2,
    kind: 'pick',
    question: 'Do you prefer coffee or tea?',
    choices: ['Coffee', 'Tea'],
  },
  {
    id: 'pick-season',
    level: 2,
    kind: 'pick',
    question: 'Which do you like more, summer or winter?',
    choices: ['Summer', 'Winter'],
  },
  {
    id: 'pick-place',
    level: 2,
    kind: 'pick',
    question: 'Would you rather spend a day in the city or the country?',
    choices: ['The city', 'The country'],
  },
  {
    id: 'pick-evening',
    level: 2,
    kind: 'pick',
    question: 'Would you rather listen to music or watch a movie?',
    choices: ['Listen to music', 'Watch a movie'],
  },

  // Level 3: quick choices
  {
    id: 'choice-pet',
    level: 3,
    kind: 'choice',
    question: 'Have you ever had a pet?',
    choiceQuestion: 'What kind of pet?',
    choices: ['A dog', 'A cat', 'A bird', 'Something else'],
  },
  {
    id: 'choice-cook',
    level: 3,
    kind: 'choice',
    question: 'Do you like to cook?',
    choiceQuestion: 'What do you like to make most?',
    choices: ['Breakfast', 'Dinner', 'Desserts', 'Holiday meals'],
  },
  {
    id: 'choice-sports',
    level: 3,
    kind: 'choice',
    question: 'Do you enjoy sports?',
    choiceQuestion: 'Do you like playing or watching?',
    choices: ['Playing', 'Watching', 'Both'],
  },
  {
    id: 'choice-family',
    level: 3,
    kind: 'choice',
    question: 'Did you grow up near family?',
    choiceQuestion: 'Who lived close by?',
    choices: ['Grandparents', 'Aunts and uncles', 'Cousins', 'Other family'],
  },

  // Level 4: yes or no, then share a memory
  {
    id: 'siblings',
    level: 4,
    kind: 'follow-up',
    question: 'Did you grow up with brothers or sisters?',
    followUpYes: 'Tell me about your brothers and sisters. What did you like to do together?',
    followUpNo: 'Who did you like to spend time with when you were young?',
  },

  {
    id: 'texas',
    level: 4,
    kind: 'follow-up',
    question: 'Have you ever lived in Texas?',
    followUpYes: 'Tell me about the town or neighborhood where you lived. What was it like?',
    followUpNo: 'Where did you grow up? Tell me what it was like there.',
  },

  {
    id: 'music',
    level: 4,
    kind: 'follow-up',
    question: 'Did music play an important role in your family?',
    followUpYes: 'What songs did your family love? When did you hear them?',
    followUpNo: 'What kind of music do you enjoy?',
  },
  {
    id: 'school',
    level: 4,
    kind: 'follow-up',
    question: 'Did you enjoy school when you were young?',
    followUpYes: 'What did you like about school? Was there a teacher or friend you liked?',
    followUpNo: 'What did you like to do when you were not in school?',
  },

  {
    id: 'garden',
    level: 4,
    kind: 'follow-up',
    question: 'Have you ever kept a garden or cared for plants?',
    followUpYes: 'What did you grow? What did you like about it?',
    followUpNo: 'Tell me about a place outdoors where you like to spend time.',
  },
  {
    id: 'travel',
    level: 4,
    kind: 'follow-up',
    question: 'Have you traveled outside of your home state?',
    followUpYes: 'Where did you go? What was that trip like?',
    followUpNo: 'Tell me about a place close to home that you love.',
  },
  {
    id: 'holiday',
    level: 4,
    kind: 'follow-up',
    question: 'Do you remember a favorite holiday celebration?',
    followUpYes: 'Tell me about that holiday. What did your family do that day?',
    followUpNo: 'Tell me about a happy day you spent with people you love.',
  },
  {
    id: 'work',
    level: 4,
    kind: 'follow-up',
    question: 'Did you have a job you were proud of?',
    followUpYes: 'What did you do? What were you good at?',
    followUpNo: 'What is something you are proud of?',
  },

  // Level 5: your stories
  {
    id: 'open-first-home',
    level: 5,
    kind: 'open',
    question: 'Tell me about your first home. What was it like?',
  },
  {
    id: 'open-friend',
    level: 5,
    kind: 'open',
    question: 'Tell me about a friend who meant a lot to you.',
  },
  {
    id: 'open-proud',
    level: 5,
    kind: 'open',
    question: 'Tell me about a day you felt really proud.',
  },
  {
    id: 'open-fun',
    level: 5,
    kind: 'open',
    question: 'Tell me about something you loved to do for fun when you were young.',
  },

  // Level 6: looking back
  {
    id: 'reflect-advice',
    level: 6,
    kind: 'open',
    question: 'What is the best advice anyone ever gave you?',
  },
  {
    id: 'reflect-younger-self',
    level: 6,
    kind: 'open',
    question: 'If you could tell your younger self one thing, what would it be?',
  },
  {
    id: 'reflect-tradition',
    level: 6,
    kind: 'open',
    question: 'What family tradition do you hope will be passed on? Why does it matter to you?',
  },
  {
    id: 'reflect-lesson',
    level: 6,
    kind: 'open',
    question: 'Who taught you something important about life? What did they teach you?',
  },

  // Level 7: the small details
  {
    id: 'detail-street',
    level: 7,
    kind: 'open',
    question:
      'What was the name of the street you grew up on? What could you see from the front door?',
  },
  {
    id: 'detail-kitchen',
    level: 7,
    kind: 'open',
    question: 'What did your kitchen smell like on a holiday morning?',
  },
  {
    id: 'detail-teacher',
    level: 7,
    kind: 'open',
    question: 'What was the name of a teacher you remember? What did their classroom look like?',
  },
  {
    id: 'detail-car',
    level: 7,
    kind: 'open',
    question: 'Think of a car your family had. What color was it, and where did it take you?',
  },
]

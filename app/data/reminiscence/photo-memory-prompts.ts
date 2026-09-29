export type PhotoLevel = 'general' | 'era' | 'local'

export interface PhotoMemoryPrompt {
  id: string
  level: PhotoLevel
  title: string
  // Path under /public. Leave empty until a licensed photo is added; the page shows a placeholder.
  image?: string
  // Describes the photo for screen readers and is shown on the placeholder
  alt: string
  // Open questions shown after the person says "Yes, this reminds me of something".
  // Keep them open-ended. Avoid "Do you remember...?" so it never feels like a test.
  followUps: string[]
}

export const photoLevels: Record<PhotoLevel, { label: string; description: string }> = {
  general: {
    label: 'Everyday moments',
    description: 'Familiar things from daily life',
  },
  era: {
    label: 'Times gone by',
    description: 'Things from earlier decades',
  },
  local: {
    label: 'Close to home',
    description: 'Places and traditions from North Texas',
  },
}

export const photoMemoryPrompts: PhotoMemoryPrompt[] = [
  // General
  {
    id: 'family-meal',
    level: 'general',
    title: 'A family meal',
    image: '',
    alt: 'A family sitting together around a dinner table with plates of food.',
    followUps: [
      'Who is in that memory?',
      'What was a favorite meal in your home?',
      'Tell me about a meal you shared with people you love.',
    ],
  },
  {
    id: 'dog',
    level: 'general',
    title: 'A friendly dog',
    image: '',
    alt: 'A happy dog sitting on a porch.',
    followUps: [
      'Tell me about the animal this makes you think of.',
      'What was its name?',
      'What is a funny thing a pet did?',
    ],
  },
  {
    id: 'garden',
    level: 'general',
    title: 'A backyard garden',
    image: '',
    alt: 'Tomato plants and flowers growing in a small backyard garden.',
    followUps: [
      'Whose garden does this remind you of?',
      'What grew there?',
      'What is your favorite flower or vegetable?',
    ],
  },
  {
    id: 'beach',
    level: 'general',
    title: 'A day at the beach',
    image: '',
    alt: 'Waves rolling onto a sandy beach on a sunny day.',
    followUps: [
      'Where does this take you?',
      'Who was with you?',
      'What did you like to do on a day like this?',
    ],
  },

  // Era
  {
    id: 'radio',
    level: 'era',
    title: 'An old radio',
    image: '',
    alt: 'A wooden table radio with round dials, from the 1950s.',
    followUps: [
      'What did your family listen to on the radio?',
      'Tell me about a song or show you loved.',
      'Where in the house was the radio?',
    ],
  },
  {
    id: 'classic-car',
    level: 'era',
    title: 'A classic car',
    image: '',
    alt: 'A shiny two-tone car from the 1950s parked on a street.',
    followUps: [
      'Whose car does this remind you of?',
      'Tell me about a trip you took by car.',
      'Where did you like to drive to?',
    ],
  },
  {
    id: 'record-player',
    level: 'era',
    title: 'A record player',
    image: '',
    alt: 'A record player with a vinyl record spinning next to a stack of albums.',
    followUps: [
      'What music comes to mind?',
      'Who did you like to listen to music with?',
      'Tell me about a time you danced to a song you loved.',
    ],
  },
  {
    id: 'wedding',
    level: 'era',
    title: 'A wedding day',
    image: '',
    alt: 'A black-and-white photo of a bride and groom smiling outside a church.',
    followUps: [
      'Whose wedding does this make you think of?',
      'Tell me about that day.',
      'What was the celebration like?',
    ],
  },

  // Local
  {
    id: 'bluebonnets',
    level: 'local',
    title: 'Texas bluebonnets',
    image: '',
    alt: 'A field of blue bonnet wildflowers along a Texas roadside in spring.',
    followUps: [
      'Where have you seen flowers like these?',
      'Tell me about a spring day you enjoyed.',
      'Who would you take to see them?',
    ],
  },
  {
    id: 'state-fair',
    level: 'local',
    title: 'The State Fair of Texas',
    image: '',
    alt: 'The Ferris wheel and midway at the State Fair of Texas in Fair Park, Dallas.',
    followUps: [
      'Tell me about a day at the fair.',
      'What was your favorite fair food?',
      'Who did you go with?',
    ],
  },
  {
    id: 'dallas-skyline',
    level: 'local',
    title: 'The Dallas skyline',
    image: '',
    alt: 'The Dallas skyline at sunset with Reunion Tower lit up.',
    followUps: [
      'What part of the city does this remind you of?',
      'Tell me about a place in Dallas you spent a lot of time.',
      'How has the city changed since you were young?',
    ],
  },
  {
    id: 'friday-football',
    level: 'local',
    title: 'Friday night football',
    image: '',
    alt: 'A high school football game under stadium lights with a marching band in the stands.',
    followUps: [
      'What game or school does this remind you of?',
      'Who did you go to games with?',
      'What was a Friday night like back then?',
    ],
  },
]

import type { ReminiscenceLevel } from './levels'

export interface PhotoMemoryPrompt {
  id: string
  level: ReminiscenceLevel
  title: string
  image?: string
  alt: string
  followUps: string[]
}

/** Photos move from general, everyday things to niche, local ones. */
export const photoLevels: Record<ReminiscenceLevel, { label: string; description: string }> = {
  1: {
    label: 'Everyday things',
    description: 'Simple objects from daily life',
  },
  2: {
    label: 'Everyday places',
    description: 'Familiar places around the home',
  },
  3: {
    label: 'Pastimes',
    description: 'Hobbies and ways to spend free time',
  },
  4: {
    label: 'Life events',
    description: 'Big days and family traditions',
  },
  5: {
    label: 'Times gone by',
    description: 'Things from particular decades',
  },
  6: {
    label: 'Around Texas',
    description: 'Sights and traditions from across Texas',
  },
  7: {
    label: 'Close to home',
    description: 'Places in Dallas and North Texas',
  },
}

export const photoMemoryPrompts: PhotoMemoryPrompt[] = [
  // Level 1: everyday things
  {
    id: 'coffee',
    level: 1,
    title: 'A cup of coffee',
    image: '',
    alt: 'A steaming cup of coffee on a kitchen table in the morning light.',
    followUps: [
      'Who does this make you think of?',
      'How do you like your coffee or tea?',
      'Tell me about a morning routine you enjoyed.',
    ],
  },
  {
    id: 'family-meal',
    level: 1,
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
    level: 1,
    title: 'A friendly dog',
    image: '',
    alt: 'A happy dog sitting on a porch.',
    followUps: [
      'Tell me about the animal this makes you think of.',
      'What was its name?',
      'What is a funny thing a pet did?',
    ],
  },

  // Level 2: everyday places
  {
    id: 'kitchen',
    level: 2,
    title: 'A home kitchen',
    image: '',
    alt: 'A cozy kitchen with pots on the stove and a window over the sink.',
    followUps: [
      'Whose kitchen does this remind you of?',
      'What was cooking in that kitchen?',
      'Tell me about a dish you learned to make.',
    ],
  },
  {
    id: 'garden',
    level: 2,
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
    level: 2,
    title: 'A day at the beach',
    image: '',
    alt: 'Waves rolling onto a sandy beach on a sunny day.',
    followUps: [
      'Where does this take you?',
      'Who was with you?',
      'What did you like to do on a day like this?',
    ],
  },

  // Level 3: pastimes
  {
    id: 'fishing',
    level: 3,
    title: 'A fishing trip',
    image: '',
    alt: 'A person fishing from a wooden dock on a calm lake in the early morning.',
    followUps: [
      'Who does this remind you of?',
      'Tell me about a time you went fishing or spent a day by the water.',
      'What is the biggest fish story you have heard?',
    ],
  },
  {
    id: 'card-game',
    level: 3,
    title: 'A game of cards',
    image: '',
    alt: 'Friends laughing around a kitchen table while playing a game of cards.',
    followUps: [
      'What games did you like to play?',
      'Who did you play with?',
      'Tell me about a game night you remember.',
    ],
  },
  {
    id: 'sewing',
    level: 3,
    title: 'A sewing basket',
    image: '',
    alt: 'An open sewing basket with spools of thread, a pin cushion, and fabric.',
    followUps: [
      'Who in your life liked to sew, knit, or make things by hand?',
      'Tell me about something you made.',
      'What hobby did you enjoy most?',
    ],
  },

  // Level 4: life events
  {
    id: 'wedding',
    level: 4,
    title: 'A wedding day',
    image: '',
    alt: 'A black-and-white photo of a bride and groom smiling outside a church.',
    followUps: [
      'Whose wedding does this make you think of?',
      'Tell me about that day.',
      'What was the celebration like?',
    ],
  },
  {
    id: 'holiday-table',
    level: 4,
    title: 'A holiday table',
    image: '',
    alt: 'A long table set for a holiday dinner with candles, a roast, and family gathered around.',
    followUps: [
      'Which holiday does this make you think of?',
      'Who sat at your holiday table?',
      'What dish was always on the table?',
    ],
  },
  {
    id: 'graduation',
    level: 4,
    title: 'Graduation day',
    image: '',
    alt: 'Graduates in caps and gowns tossing their caps into the air.',
    followUps: [
      'Whose graduation does this remind you of?',
      'Tell me about a day you finished something big.',
      'How did your family celebrate?',
    ],
  },

  // Level 5: times gone by
  {
    id: 'radio',
    level: 5,
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
    level: 5,
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
    level: 5,
    title: 'A record player',
    image: '',
    alt: 'A record player with a vinyl record spinning next to a stack of albums.',
    followUps: [
      'What music comes to mind?',
      'Who did you like to listen to music with?',
      'Tell me about a time you danced to a song you loved.',
    ],
  },

  // Level 6: around Texas
  {
    id: 'bluebonnets',
    level: 6,
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
    id: 'friday-football',
    level: 6,
    title: 'Friday night football',
    image: '',
    alt: 'A high school football game under stadium lights with a marching band in the stands.',
    followUps: [
      'What game or school does this remind you of?',
      'Who did you go to games with?',
      'What was a Friday night like back then?',
    ],
  },
  {
    id: 'texas-barbecue',
    level: 6,
    title: 'Texas barbecue',
    image: '',
    alt: 'Brisket and sausage on butcher paper next to a smoking barbecue pit.',
    followUps: [
      'Where did you go for barbecue?',
      'Who was the best cook at a cookout you remember?',
      'Tell me about a big gathering with food like this.',
    ],
  },

  // Level 7: close to home
  {
    id: 'state-fair',
    level: 7,
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
    level: 7,
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
    id: 'white-rock-lake',
    level: 7,
    title: 'White Rock Lake',
    image: '',
    alt: 'Sailboats on White Rock Lake in Dallas with trees and the city skyline in the distance.',
    followUps: [
      'Have you spent time at a lake like this? Tell me about it.',
      'Who would you go walking or picnicking with?',
      'What is your favorite outdoor spot in North Texas?',
    ],
  },
]

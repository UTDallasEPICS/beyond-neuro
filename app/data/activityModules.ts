// Shared content for every activity module page: header, research, game tabs, printable
// resources and related modules. Each module page renders this through ActivityModulePage.

export type ModuleSlug =
  | 'reminiscence'
  | 'reality-orientation'
  | 'coloring'
  | 'puzzles'
  | 'music'
  | 'digital-vr'
  | 'writing'
  | 'dual-task'
  | 'horticulture'

export interface ModuleResource {
  title: string
  description: string
  icon: string
}

export interface ActivityModule {
  tag: string
  title: string
  subtitle: string
  /** One or two sentences shown on other modules' "Related Modules" cards. */
  summary: string
  research: string
  benefits: string[]
  tabs: Array<{ label: string; to: string }>
  resources: ModuleResource[]
  related: ModuleSlug[]
}

export const TAG_CLASSES: Record<string, string> = {
  Memory: 'bg-[#fff3eb] text-orange-800',
  Orientation: 'bg-[#eff6ff] text-blue-800',
  'Visual Art': 'bg-[#fdf2f8] text-pink-800',
  Cognitive: 'bg-[#fff3eb] text-orange-800',
  'Sensory-Motor': 'bg-[#f5f3ff] text-violet-800',
  'Fine Motor': 'bg-[#fdf2f8] text-pink-800',
  Physical: 'bg-[#e7f2e5] text-green-800',
  Sensory: 'bg-[#ecfeff] text-cyan-800',
}

const SHEET_ICON = '/activities/icon-file.svg'
const GUIDE_ICON = '/activities/icon-book-green.svg'
const TRACKER_ICON = '/activities/icon-activity-green.svg'

export const ACTIVITY_MODULES: Record<ModuleSlug, ActivityModule> = {
  reminiscence: {
    tag: 'Memory',
    title: 'Reminiscence Therapy',
    subtitle: 'Reconnect with identity through photos, stories, and life-story prompts.',
    summary: 'Photos, stories, and life-story prompts that reconnect a person with their past.',
    research:
      'Long-term memory often holds steady when short-term memory falters. Reminiscence work uses photos, music, and life-story prompts from earlier life to reconnect a person with who they have always been — beyond the diagnosis.',
    benefits: ['Long-term memory', 'Personal identity', 'Emotional wellbeing', 'Social connection'],
    tabs: [
      { label: 'Life story prompts', to: '/activities/reminiscence' },
      { label: 'Photo memory starters', to: '/activities/reminiscence/photo-memory-starters' },
      { label: 'Reminiscence journal', to: '/activities/reminiscence/journal' },
    ],
    resources: [
      {
        title: 'Activity Sheet',
        description: 'Printable life-story yes/no prompt cards',
        icon: SHEET_ICON,
      },
      {
        title: 'Caregiver Guide',
        description: 'Tips on pacing and memory conversation',
        icon: GUIDE_ICON,
      },
      {
        title: 'Weekly Tracker',
        description: 'Session log for reminiscence practice',
        icon: TRACKER_ICON,
      },
    ],
    related: ['music', 'puzzles', 'writing'],
  },

  'reality-orientation': {
    tag: 'Orientation',
    title: 'Reality Orientation',
    subtitle: "Check today's date and time, and make plans for your day or week.",
    summary: 'Daily cues for the date, time, and plans that keep each day grounded.',
    research:
      'Regular, gentle reminders of the day, date, and what is happening next can ease confusion and anxiety. Reality orientation pairs these cues with simple routines — planning the day, reviewing the week, spotting familiar objects — so they become part of everyday life.',
    benefits: ['Orientation to time', 'Daily routine', 'Reduced anxiety', 'Independence'],
    tabs: [
      { label: 'Today’s Plan', to: '/activities/reality-orientation' },
      { label: 'Calendar', to: '/activities/reality-orientation/whiteboard' },
      { label: 'Find the object', to: '/activities/reality-orientation/findObject' },
    ],
    resources: [
      {
        title: 'Daily Planner',
        description: 'Printable large-print plan for the day',
        icon: SHEET_ICON,
      },
      {
        title: 'Caregiver Guide',
        description: 'How to give gentle, non-quizzing reminders',
        icon: GUIDE_ICON,
      },
      {
        title: 'Weekly Tracker',
        description: 'Session log for orientation practice',
        icon: TRACKER_ICON,
      },
    ],
    related: ['reminiscence', 'puzzles', 'writing'],
  },

  coloring: {
    tag: 'Visual Art',
    title: 'Coloring & Visual Art',
    subtitle: 'Calm, untimed coloring. Take as long as you like — there are no wrong answers.',
    summary: 'Mirrored patterns, paint-by-number pictures, and color mixing at a calm pace.',
    research:
      'Creative art activities give a sense of focus and accomplishment without the pressure of a right answer. Choosing colors, following a pattern, and finishing a picture exercise attention, visual processing, and hand–eye coordination while lowering stress.',
    benefits: ['Visual attention', 'Fine motor control', 'Relaxation', 'Self-expression'],
    tabs: [
      { label: 'Mirrored coloring', to: '/activities/coloring' },
      { label: 'Paint by number', to: '/activities/coloring/paint-by-number' },
      { label: 'Color mixing', to: '/activities/coloring/color-mixing' },
    ],
    resources: [
      {
        title: 'Coloring Pages',
        description: 'Printable large-outline pictures to color',
        icon: SHEET_ICON,
      },
      {
        title: 'Caregiver Guide',
        description: 'Setting up a calm, mess-free art session',
        icon: GUIDE_ICON,
      },
      {
        title: 'Weekly Tracker',
        description: 'Session log for art practice',
        icon: TRACKER_ICON,
      },
    ],
    related: ['writing', 'horticulture', 'music'],
  },

  puzzles: {
    tag: 'Cognitive',
    title: 'Puzzles & Games',
    subtitle:
      'Playful memory and attention practice. No timers and no scores — play at your own pace.',
    summary: 'Playful memory and attention practice that pairs well with reminiscence sessions.',
    research:
      'Puzzles and matching games ask the brain to hold information, search for patterns, and switch attention. Keeping them untimed and low-pressure lets people enjoy the challenge and the small wins that keep them coming back.',
    benefits: ['Working memory', 'Attention', 'Visual search', 'Problem solving'],
    tabs: [
      { label: 'Matching game', to: '/activities/puzzles' },
      { label: 'Word search', to: '/activities/puzzles/word-search' },
      { label: 'Picture puzzle', to: '/activities/puzzles/picture-puzzle' },
    ],
    resources: [
      {
        title: 'Puzzle Sheets',
        description: 'Printable large-letter word searches',
        icon: SHEET_ICON,
      },
      {
        title: 'Caregiver Guide',
        description: 'Choosing the right level and giving hints',
        icon: GUIDE_ICON,
      },
      {
        title: 'Weekly Tracker',
        description: 'Session log for puzzle practice',
        icon: TRACKER_ICON,
      },
    ],
    related: ['reminiscence', 'digital-vr', 'dual-task'],
  },

  music: {
    tag: 'Sensory-Motor',
    title: 'Music Therapy & Rhythm',
    subtitle: 'Rhythm and music that activate memory. Go at whatever pace feels good.',
    summary: 'Rhythmic exercises and music-based activities that activate memory circuits.',
    research:
      'Musical memory is often among the last to fade. Familiar songs can unlock memories and lift mood, and moving to a steady beat links timing, movement, and attention in a way that feels natural and enjoyable.',
    benefits: ['Musical memory', 'Timing & rhythm', 'Mood', 'Motor coordination'],
    tabs: [
      { label: 'Rhythm exercise', to: '/activities/music' },
      { label: 'Sing along', to: '/activities/music/sing-along' },
      { label: 'Drums', to: '/activities/music/drums' },
    ],
    resources: [
      {
        title: 'Song Sheet',
        description: 'Printable lyrics for familiar sing-alongs',
        icon: SHEET_ICON,
      },
      {
        title: 'Caregiver Guide',
        description: 'Choosing songs and setting a comfortable pace',
        icon: GUIDE_ICON,
      },
      {
        title: 'Weekly Tracker',
        description: 'Session log for music practice',
        icon: TRACKER_ICON,
      },
    ],
    related: ['reminiscence', 'dual-task', 'digital-vr'],
  },

  'digital-vr': {
    tag: 'Cognitive',
    title: 'Digital & VR Training',
    subtitle:
      'Adaptive training for color matching, rhythm, and everyday money skills, in short daily sessions.',
    summary: 'Short adaptive sessions for reaction, rhythm, and everyday money skills.',
    research:
      'Short, regular sessions of adaptive digital training keep practice at the right level of challenge — not too easy, not too hard. Practising everyday skills like handling money supports confidence and independence outside the screen.',
    benefits: ['Processing speed', 'Attention', 'Everyday skills', 'Confidence with technology'],
    tabs: [
      { label: 'Reaction Color Match', to: '/activities/digital-vr' },
      { label: 'Counting Money', to: '/activities/digital-vr/counting-money' },
      { label: 'Rhythm Tiles', to: '/activities/digital-vr/rhythm-tiles' },
    ],
    resources: [
      {
        title: 'Practice Sheet',
        description: 'Printable coin and bill counting cards',
        icon: SHEET_ICON,
      },
      {
        title: 'Caregiver Guide',
        description: 'Helping with devices and screen comfort',
        icon: GUIDE_ICON,
      },
      {
        title: 'Weekly Tracker',
        description: 'Session log for digital training',
        icon: TRACKER_ICON,
      },
    ],
    related: ['puzzles', 'music', 'dual-task'],
  },

  writing: {
    tag: 'Fine Motor',
    title: 'Writing & Calligraphy',
    subtitle: 'Pen, paper, and the steady work of cognition.',
    summary: 'Guided writing combining cognitive planning with fine motor practice.',
    research:
      'Handwriting combines planning, language, and fine motor control in one task. Tracing letters and completing sentences offers steady, repeatable practice that supports both hand skills and the thinking behind putting words on the page.',
    benefits: ['Fine motor control', 'Language', 'Planning', 'Focus'],
    tabs: [
      { label: 'Calligraphy', to: '/activities/writing' },
      { label: 'Writing Practice', to: '/activities/writing/writing-prompt' },
      { label: 'Guided Writing', to: '/activities/writing/sentence-completion' },
    ],
    resources: [
      {
        title: 'Tracing Sheets',
        description: 'Printable large-letter tracing practice',
        icon: SHEET_ICON,
      },
      {
        title: 'Caregiver Guide',
        description: 'Comfortable grips, posture, and pacing',
        icon: GUIDE_ICON,
      },
      {
        title: 'Weekly Tracker',
        description: 'Session log for writing practice',
        icon: TRACKER_ICON,
      },
    ],
    related: ['coloring', 'reminiscence', 'reality-orientation'],
  },

  'dual-task': {
    tag: 'Physical',
    title: 'Dual-Task Physical Exercise',
    subtitle: 'Move the body and train the brain at the same time.',
    summary: 'Walk while counting, reach while naming things, or clap out syllables.',
    research:
      'Pairing movement with a mental task — counting backward while walking, naming animals while balancing — drives neuroplastic change after stroke. The combined load is what makes the brain rewire.',
    benefits: ['Attention', 'Balance & gait', 'Motor coordination', 'Neuroplasticity'],
    tabs: [
      { label: 'Walking + counting', to: '/activities/dual-task' },
      { label: 'Seated balance', to: '/activities/dual-task/reach-and-reflect' },
      { label: 'Clap it out', to: '/activities/dual-task/clap-it-out' },
    ],
    resources: [
      {
        title: 'Exercise Cards',
        description: 'Printable movement + brain task cards',
        icon: SHEET_ICON,
      },
      {
        title: 'Caregiver Guide',
        description: 'Safety tips and seated modifications',
        icon: GUIDE_ICON,
      },
      {
        title: 'Weekly Tracker',
        description: 'Session log for dual-task practice',
        icon: TRACKER_ICON,
      },
    ],
    related: ['music', 'puzzles', 'horticulture'],
  },

  horticulture: {
    tag: 'Sensory',
    title: 'Horticultural Therapy',
    subtitle:
      'Gentle hands-on plant care, a flower bed matching game, and tree trimming. Take your time.',
    summary: 'Gentle hands-on movement through plant care and gardening.',
    research:
      'Caring for plants offers calm, purposeful activity with visible results. Watering, planting, and pruning give a daily routine, gentle movement, and a sense of nurturing something — all linked to better mood and lower stress.',
    benefits: ['Routine & purpose', 'Fine motor control', 'Relaxation', 'Planning'],
    tabs: [
      { label: 'Plant care', to: '/activities/horticulture' },
      { label: 'Garden matching', to: '/activities/horticulture/garden' },
      { label: 'Tree trimming', to: '/activities/horticulture/tree-trimming' },
    ],
    resources: [
      {
        title: 'Plant Care Sheet',
        description: 'Printable watering and light checklist',
        icon: SHEET_ICON,
      },
      {
        title: 'Caregiver Guide',
        description: 'Safe tools and easy indoor plants',
        icon: GUIDE_ICON,
      },
      {
        title: 'Weekly Tracker',
        description: 'Session log for garden activities',
        icon: TRACKER_ICON,
      },
    ],
    related: ['coloring', 'dual-task', 'music'],
  },
}

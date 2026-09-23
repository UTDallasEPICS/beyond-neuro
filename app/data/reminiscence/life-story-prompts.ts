export type LifeStoryAnswer = 'yes' | 'no'

export interface LifeStoryPrompt {
  id: string
  question: string
  followUpYes?: string
  followUpNo?: string
}

export const lifeStoryPrompts: LifeStoryPrompt[] = [
  {
    id: 'siblings',
    question: 'Did you grow up with brothers or sisters?',
    followUpYes: 'Tell me about your brothers and sisters. What did you like to do together?',
    followUpNo: 'Who did you like to spend time with when you were young?',
  },

  {
    id: 'texas',
    question: 'Have you ever lived in Texas?',
    followUpYes: 'Tell me about the town or neighborhood where you lived. What was it like?',
    followUpNo: 'Where did you grow up? Tell me what it was like there.',
  },

  {
    id: 'music',
    question: 'Did music play an important role in your family?',
    followUpYes: 'What songs did your family love? When did you hear them?',
    followUpNo: 'What kind of music do you enjoy?',
  },
  {
    id: 'school',
    question: 'Did you enjoy school when you were young?',
    followUpYes: 'What did you like about school? Was there a teacher or friend you liked?',
    followUpNo: 'What did you like to do when you were not in school?',
  },

  {
    id: 'garden',
    question: 'Have you ever kept a garden or cared for plants?',
    followUpYes: 'What did you grow? What did you like about it?',
    followUpNo: 'Tell me about a place outdoors where you like to spend time.',
  },
  {
    id: 'travel',
    question: 'Have you traveled outside of your home state?',
    followUpYes: 'Where did you go? What was that trip like?',
    followUpNo: 'Tell me about a place close to home that you love.',
  },
  {
    id: 'holiday',
    question: 'Do you remember a favorite holiday celebration?',
    followUpYes: 'Tell me about that holiday. What did your family do that day?',
    followUpNo: 'Tell me about a happy day you spent with people you love.',
  },
  {
    id: 'work',
    question: 'Did you have a job you were proud of?',
    followUpYes: 'What did you do? What were you good at?',
    followUpNo: 'What is something you are proud of?',
  },
]

export interface StandUpReferenceModel {
  id: string
  name: string
  skill: string
  description: string
  study: string[]
}

export const STAND_UP_COMEDY_MODELS: StandUpReferenceModel[] = [
  {
    id: 'mike-birbiglia',
    name: 'Mike Birbiglia',
    skill: 'Storytelling and vulnerability',
    description: 'Study how personal detail becomes a story with a clear emotional turn, without forcing the performance.',
    study: ['Story structure', 'Personal detail', 'Calm delivery', 'Callbacks', 'Emotional payoff'],
  },
  {
    id: 'john-mulaney',
    name: 'John Mulaney',
    skill: 'Precision and rhythm',
    description: 'Study sentence-level construction: how exact wording, pauses, and physical delivery make a thought feel inevitable.',
    study: ['Sentence design', 'Wording', 'Timing', 'Pauses', 'Act-outs', 'Setup and payoff'],
  },
  {
    id: 'trevor-noah',
    name: 'Trevor Noah',
    skill: 'Audience connection and translation',
    description: 'Study how one experience can be translated across cultures and audiences while staying warm, specific, and human.',
    study: ['Explaining experiences to different audiences', 'Perspective shifts', 'Warmth', 'Character voices'],
  },
  {
    id: 'hasan-minhaj',
    name: 'Hasan Minhaj',
    skill: 'Presentation architecture',
    description: 'Study how a presentation compounds: a thesis becomes evidence, visual logic, escalation, and personal stakes.',
    study: ['Thesis', 'Evidence', 'Visuals', 'Escalation', 'Personal stakes', 'Dramatic structure'],
  },
  {
    id: 'chris-rock',
    name: 'Chris Rock',
    skill: 'Persuasive force',
    description: 'Study how repetition, emphasis, and vocal energy turn a strong opinion into an argument people can feel.',
    study: ['Repetition', 'Emphasis', 'Rhythm', 'Vocal energy', 'Strong opinions', 'Argument-building'],
  },
  {
    id: 'george-carlin',
    name: 'George Carlin',
    skill: 'Language and thinking',
    description: 'Study how definitions, categories, contrasts, and economical word choice make an idea sharper and harder to forget.',
    study: ['Definitions', 'Categorization', 'Contrast', 'Word choice', 'Intellectual clarity', 'Verbal economy'],
  },
]

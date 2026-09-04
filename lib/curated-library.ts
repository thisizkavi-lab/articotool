import type { Segment } from './types'

export type CuratedSourceStatus = 'ready' | 'curating' | 'queued'

export interface CuratedCollection {
  id: string
  speakerId: string
  speaker: string
  sourceTitle: string
  videoId: string | null
  videoTitle: string
  channelName: string
  thumbnail: string
  duration: number
  description: string
  focus: string[]
  status: CuratedSourceStatus
  segments: Segment[]
}

export interface CuratedSpeaker {
  id: string
  name: string
  description: string
  focus: string[]
  portrait: string
  sources: CuratedCollection[]
}

const segment = (id: string, start: number, end: number, label: string): Segment => ({
  id,
  start,
  end,
  label,
  lines: [],
  createdAt: 0,
})

const navalJre: CuratedCollection = {
  id: 'naval-jre-1309',
  speakerId: 'naval-ravikant',
  speaker: 'Naval Ravikant',
  sourceTitle: 'Joe Rogan Experience #1309',
  videoId: '3qHkcs3kG44',
  videoTitle: 'Joe Rogan Experience #1309 - Naval Ravikant',
  channelName: 'PowerfulJRE',
  thumbnail: 'https://i.ytimg.com/vi/3qHkcs3kG44/hqdefault.jpg',
  duration: 7917,
  description: 'Relaxed long-form Naval. Strong baseline for formulation, analogy, calm pacing, compression, disagreement, and clean endings.',
  focus: ['Formulation', 'Articulation', 'Cadence', 'Compression', 'Explanation', 'Analogy'],
  status: 'ready',
  segments: [
    segment('JRE1309-001', 46, 78, 'Analogy · vivid answer opening'),
    segment('JRE1309-002', 144, 175, 'Analogy · mountain-climbing reframe'),
    segment('JRE1309-003', 201, 240, 'Formulation · beginner’s mind'),
    segment('JRE1309-004', 241, 255, 'Distinction · knowing vs understanding'),
    segment('JRE1309-005', 304, 327, 'Compression · lecture → book → blog → tweet'),
    segment('JRE1309-006', 401, 426, 'Explanation · curiosity over completion'),
    segment('JRE1309-007', 866, 887, 'Formulation · concise communication'),
    segment('JRE1309-008', 918, 935, 'Formulation · calmness under pressure'),
    segment('JRE1309-009', 1015, 1045, 'Qualification · state, soften, restate'),
    segment('JRE1309-010', 1099, 1126, 'Definition · desire'),
    segment('JRE1309-011', 1301, 1333, 'Analogy · nonlinear work output'),
    segment('JRE1309-012', 1358, 1385, 'Cadence · train, sprint, rest, reassess'),
    segment('JRE1309-013', 1751, 1776, 'Disagreement · unpopular view + context'),
    segment('JRE1309-014', 2360, 2377, 'Strong ending · creativity reframe'),
    segment('JRE1309-015', 4580, 4596, 'Formulation · inherited beliefs'),
    segment('JRE1309-016', 4627, 4651, 'Compression · diseases of abundance'),
    segment('JRE1309-017', 4691, 4705, 'Storytelling · setup → reversal → landing'),
    segment('JRE1309-018', 4887, 4919, 'Explanation · deliberate instructional pacing'),
    segment('JRE1309-019', 5017, 5053, 'Formulation · peace and happiness'),
    segment('JRE1309-020', 5451, 5463, 'Uncertainty · trade-offs, not perfect answers'),
    segment('JRE1309-021', 5692, 5710, 'Explanation · writing tests understanding'),
    segment('JRE1309-022', 5963, 5989, 'Formulation · reasoning through paradox'),
    segment('JRE1309-023', 6451, 6500, 'Distinction · peace of mind vs peace from mind'),
    segment('JRE1309-024', 6530, 6539, 'Humor · compact setup and reversal'),
    segment('JRE1309-025', 6591, 6617, 'Explanation · structured three-part definition'),
    segment('JRE1309-026', 6723, 6747, 'Compression · authenticity → leverage → ownership'),
    segment('JRE1309-027', 7093, 7122, 'Formulation · contrast → insight → rule'),
    segment('JRE1309-028', 7558, 7583, 'Explanation · self-questioning → decision rule'),
    segment('JRE1309-029', 7673, 7708, 'Reframing · rebuild a cliché precisely'),
    segment('JRE1309-030', 7760, 7809, 'Answer opening · direct answer before expansion'),
  ],
}

const navalModernWisdom: CuratedCollection = {
  id: 'naval-modern-wisdom-922',
  speakerId: 'naval-ravikant',
  speaker: 'Naval Ravikant',
  sourceTitle: 'Modern Wisdom #922 · 44 Harsh Truths About Human Nature',
  videoId: 'KyfUysrNaco',
  videoTitle: '44 Harsh Truths About The Game Of Life - Naval Ravikant',
  channelName: 'Chris Williamson',
  thumbnail: 'https://i.ytimg.com/vi/KyfUysrNaco/hqdefault.jpg',
  duration: 11820,
  description: 'A later, more polished Naval. Excellent for self-correction, compressed definitions, first-principles explanation, qualification, and strong conceptual framing.',
  focus: ['Formulation', 'Self-correction', 'Definition', 'First principles', 'Reframing', 'Strong endings'],
  status: 'ready',
  segments: [
    segment('MW922-001', 7.3, 18.2, 'Self-correction · update an old belief cleanly'),
    segment('MW922-002', 27.3, 39.1, 'Story → principle · freedom through not wanting'),
    segment('MW922-003', 477, 491, 'Compression · choose your desires to focus'),
    segment('MW922-004', 534, 560, 'Qualification · fame, consistency, and performance'),
    segment('MW922-005', 1295, 1322, 'Definition · self-esteem as self-reputation'),
    segment('MW922-006', 1796, 1818, 'Formulation · pride is the enemy of learning'),
    segment('MW922-007', 2409, 2437, 'Instruction · protect life from low-value obligations'),
    segment('MW922-008', 2487, 2527, 'Cadence · inspiration is perishable'),
    segment('MW922-009', 2684, 2706, 'Analogy · play to you, work to others'),
    segment('MW922-010', 2732, 2755, 'Compression · authenticity → productize yourself'),
    segment('MW922-011', 3010, 3041, 'Explanation · create distance from your own thoughts'),
    segment('MW922-012', 3067, 3094, 'Reframing · problems must enter the mind first'),
    segment('MW922-013', 3335, 3378, 'Definition · intelligence has two parts'),
    segment('MW922-014', 4913, 4943, 'Analogy · stress as conflicting desires'),
    segment('MW922-015', 5900, 5940, 'Decision rule · what you accept shapes your life'),
    segment('MW922-016', 7703, 7738, 'Meta-formulation · performance vs genuine thought'),
    segment('MW922-017', 8219, 8253, 'Formulation · deep understanding re-derives itself'),
    segment('MW922-018', 8274, 8321, 'Distinction · understanding beats memorization'),
    segment('MW922-019', 8321, 8351, 'Definition · philosophy as generalized experience'),
    segment('MW922-020', 11383, 11420, 'Analogy · cut the Gordian knot of the past'),
    segment('MW922-021', 11420, 11471, 'Strong ending · attention is the currency of life'),
  ],
}

const queuedSource = (
  id: string,
  sourceTitle: string,
  description: string,
  focus: string[],
): CuratedCollection => ({
  id,
  speakerId: 'naval-ravikant',
  speaker: 'Naval Ravikant',
  sourceTitle,
  videoId: null,
  videoTitle: sourceTitle,
  channelName: '',
  thumbnail: '',
  duration: 0,
  description,
  focus,
  status: 'queued',
  segments: [],
})

export const CURATED_SPEAKERS: CuratedSpeaker[] = [
  {
    id: 'naval-ravikant',
    name: 'Naval Ravikant',
    description: 'Primary articulation study: turning complex thoughts into unusually clean language, with calm delivery, compression, precision, and conceptual structure.',
    focus: ['Articulation', 'Formulation', 'Clarity', 'Cadence', 'Compression', 'Thinking aloud'],
    portrait: 'https://i.ytimg.com/vi/KyfUysrNaco/hqdefault.jpg',
    sources: [
      navalJre,
      navalModernWisdom,
      queuedSource('naval-knowledge-project-18', 'The Knowledge Project #18 · 2017', 'Deep, unhurried long-form explanation and thinking aloud.', ['Explanation', 'Reasoning', 'Transitions']),
      queuedSource('naval-tim-ferriss-473', 'The Tim Ferriss Show #473 · 2020', 'Precise responses to abstract questions with careful qualification.', ['Definition', 'Qualification', 'Precision']),
      queuedSource('naval-how-to-get-rich', 'How to Get Rich · Naval + Nivi', 'Short proposition-by-proposition explanations; ideal for micro-shadowing.', ['Compression', 'Explanation', 'Sentence construction']),
      queuedSource('naval-smart-friends-2025', 'Smart Friends conversations · 2025', 'Recent Naval revisiting wealth, judgment, learning, happiness, and philosophy.', ['Current style', 'Judgment', 'Reflection']),

      // Scientific / epistemology conversations — important for studying how Naval
      // asks, reframes, and explains around genuinely technical thinkers.
      queuedSource('naval-deutsch-knowledge-1', 'David Deutsch · Knowledge Creation and the Human Race · Part 1', 'Naval in sustained conversation with physicist David Deutsch on knowledge, AGI, explanations, and quantum computing.', ['Scientific dialogue', 'Questions', 'Clarification']),
      queuedSource('naval-deutsch-knowledge-2', 'David Deutsch · Knowledge Creation and the Human Race · Part 2', 'A denser follow-up on Popper, experiments, theories, science, and the Enlightenment.', ['Scientific dialogue', 'Epistemology', 'Follow-up questions']),
      queuedSource('naval-deutsch-files-1', 'The Deutsch Files I · 2024', 'Free-form conversation with David Deutsch and Brett Hall; useful for listening, probing, and intellectual humility.', ['Scientific dialogue', 'Listening', 'Question framing']),
      queuedSource('naval-deutsch-files-2', 'The Deutsch Files II · 2024', 'The four strands of The Fabric of Reality and difficult explanatory territory.', ['Scientific explanation', 'Clarification', 'First principles']),
      queuedSource('naval-deutsch-files-3', 'The Deutsch Files III · 2024', 'Technical conversation around AGI, Popper, misunderstanding, and explanation.', ['Scientific dialogue', 'Disagreement', 'Precision']),
      queuedSource('naval-deutsch-files-4', 'The Deutsch Files IV · 2024', 'Long-form attempt to connect Deutsch’s major theories into one coherent picture.', ['Synthesis', 'Technical questioning', 'Conceptual structure']),
      queuedSource('naval-tim-ferriss-662', 'Tim Ferriss #662 · David Deutsch + Naval Ravikant', 'Naval alongside a leading physicist discussing reality, knowledge, AGI, quantum computing, optimism, and wealth.', ['Scientific dialogue', 'Translation', 'High-level synthesis']),
    ],
  },
]

export const CURATED_COLLECTIONS: CuratedCollection[] = CURATED_SPEAKERS.flatMap(speaker =>
  speaker.sources.filter(source => source.status === 'ready'),
)

export function getCuratedSpeaker(id: string | null | undefined): CuratedSpeaker | null {
  if (!id) return null
  return CURATED_SPEAKERS.find(speaker => speaker.id === id) || null
}

export function getCuratedCollection(id: string | null | undefined): CuratedCollection | null {
  if (!id) return null
  return CURATED_COLLECTIONS.find(collection => collection.id === id) || null
}

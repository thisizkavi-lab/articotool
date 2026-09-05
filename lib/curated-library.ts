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

const navalKnowledgeProject18: CuratedCollection = {
  id: 'naval-knowledge-project-18',
  speakerId: 'naval-ravikant',
  speaker: 'Naval Ravikant',
  sourceTitle: 'The Knowledge Project #18 · 2017',
  videoId: 'mGY2To_HW98',
  videoTitle: 'The Angel Philosopher Naval Ravikant on Reading, Making Decisions, Habits, and the Purpose of Life',
  channelName: 'The Knowledge Project',
  thumbnail: 'https://i.ytimg.com/vi/mGY2To_HW98/hqdefault.jpg',
  duration: 7262,
  description: 'Early long-form Naval with unusually rich thinking aloud: reading, habits, happiness, values, science, decision-making, integrity, and meaning. Selected primarily for formulation quality and trainable conceptual structure.',
  focus: ['Formulation', 'Articulation', 'Explanation', 'Reasoning', 'Reframing', 'Thinking aloud'],
  status: 'ready',
  segments: [
    segment('TKP18-001', 842, 884, 'Reframing · treat a book like a blog archive'),
    segment('TKP18-002', 940, 978, 'Explanation · build the reading habit before optimizing it'),
    segment('TKP18-003', 1205, 1216, 'Disagreement · reject a popular habit claim directly'),
    segment('TKP18-004', 1332, 1350, 'Formulation · the mind should be a servant, not a master'),
    segment('TKP18-005', 1655, 1691, 'Decision rule · one priority beats a fuzzy basket'),
    segment('TKP18-006', 1784, 1826, 'Definition · happiness as the default state'),
    segment('TKP18-007', 1833, 1871, 'Reasoning · every positive contains a negative contrast'),
    segment('TKP18-008', 2373, 2406, 'Formulation · honesty keeps thought and speech aligned'),
    segment('TKP18-009', 2406, 2434, 'Compression · life benefits compound over long time scales'),
    segment('TKP18-010', 2675, 2707, 'Reframing · freedom to → freedom from'),
    segment('TKP18-011', 3401, 3427, 'Reframing · change yourself before changing the world'),
    segment('TKP18-012', 3793, 3816, 'Qualification · future salvation can destroy the present'),
    segment('TKP18-013', 3863, 3890, 'Formulation · nothing exists except this moment'),
    segment('TKP18-014', 3976, 3989, 'Compression · learning is abundant; desire to learn is scarce'),
    segment('TKP18-015', 4405, 4428, 'Definition · science as the study of truth'),
    segment('TKP18-016', 4792, 4818, 'Meta-formulation · distill an insight, then invite attack'),
    segment('TKP18-017', 5122, 5155, 'Decision-making · eliminate what will not work'),
    segment('TKP18-018', 5187, 5208, 'Systems thinking · build environments where success is likely'),
    segment('TKP18-019', 5505, 5532, 'Definition · integrity as an internal moral compass'),
    segment('TKP18-020', 5793, 5814, 'Explanation · real knowledge should become simple'),
    segment('TKP18-021', 5861, 5903, 'Distinction · charlatans complicate; geniuses simplify'),
    segment('TKP18-022', 6030, 6053, 'Formulation · understand basics deeply enough to re-derive'),
    segment('TKP18-023', 6134, 6157, 'Reframing · suffering as a forced moment of truth'),
    segment('TKP18-024', 6193, 6222, 'Decision-making · desire colliding with reality hides truth'),
    segment('TKP18-025', 6385, 6409, 'Qualification · commit for ten years and enjoy the journey'),
    segment('TKP18-026', 6613, 6639, 'Method · try, test, stay skeptical, keep what works'),
    segment('TKP18-027', 6707, 6736, 'Humor + analogy · present self vs heroic future self'),
    segment('TKP18-028', 6882, 6897, 'Self-observation · addicted to the desiring'),
    segment('TKP18-029', 6955, 6984, 'Answer structure · meaning is personal; the question matters'),
    segment('TKP18-030', 7090, 7118, 'Storytelling · Steve Jobs aspiration reversed in one move'),
  ],
}

const navalTimFerriss473: CuratedCollection = {
  id: 'naval-tim-ferriss-473',
  speakerId: 'naval-ravikant',
  speaker: 'Naval Ravikant',
  sourceTitle: 'The Tim Ferriss Show #473 · 2020',
  videoId: 'HiYo14wylQw',
  videoTitle: 'Naval Ravikant on Happiness, Reducing Anxiety, and More | The Tim Ferriss Show',
  channelName: 'The Tim Ferriss Show',
  thumbnail: 'https://i.ytimg.com/vi/HiYo14wylQw/hqdefault.jpg',
  duration: 7315,
  description: 'A precise, self-aware Naval on understanding, wealth, anxiety, meditation, relationships, games, and mortality. Especially strong for distinctions, qualification, compression, and turning abstract ideas into memorable language.',
  focus: ['Formulation', 'Articulation', 'Definition', 'Reframing', 'Qualification', 'Thinking aloud'],
  status: 'ready',
  segments: [
    segment('TF473-001', 561, 587, 'Formulation · full-stack intellectual hacker of life'),
    segment('TF473-002', 692, 723, 'Definition · science begins with doubt and falsifiability'),
    segment('TF473-003', 1058, 1083, 'Distinction · memorization vs understanding'),
    segment('TF473-004', 1266, 1292, 'Qualification · jargon compresses knowledge until it replaces understanding'),
    segment('TF473-005', 1318, 1346, 'Method · re-articulate until you truly understand'),
    segment('TF473-006', 1448, 1481, 'Synthesis · complexity emerges from simple rules'),
    segment('TF473-007', 1563, 1583, 'Definition · the purpose of money is freedom'),
    segment('TF473-008', 1719, 1744, 'Compression · productize yourself, then own it'),
    segment('TF473-009', 1768, 1800, 'Definition · suffering is seeing clearly what you avoided'),
    segment('TF473-010', 1867, 1896, 'Reframing · the hard part is unlearning and going back down the mountain'),
    segment('TF473-011', 2243, 2262, 'Formulation · make money with your mind, not your time'),
    segment('TF473-012', 2262, 2283, 'Compression · one good decision multiplied by infinite leverage'),
    segment('TF473-013', 2283, 2306, 'Distinction · 10,000 iterations, not 10,000 hours'),
    segment('TF473-014', 2613, 2641, 'Formulation · calmness under pressure is a superpower'),
    segment('TF473-015', 2764, 2802, 'Definition · meditation as self-examination'),
    segment('TF473-016', 2832, 2863, 'Analogy · the mind as your lifelong crazy roommate'),
    segment('TF473-017', 2863, 2888, 'Reframing · solitude reveals the actual quality of your life'),
    segment('TF473-018', 3155, 3175, 'Thinking aloud · observe unbidden thoughts without identifying with them'),
    segment('TF473-019', 3410, 3434, 'Formulation · solitude makes you self-contained'),
    segment('TF473-020', 3434, 3460, 'Strong ending · when your best hour is alone, the world loses its grip'),
    segment('TF473-021', 3537, 3561, 'Reframing · philosophy should inspire reflection, not become consumption'),
    segment('TF473-022', 3630, 3655, 'Formulation · media makes every problem your problem'),
    segment('TF473-023', 3655, 3678, 'Compression · timeless questions are best answered by old practitioners'),
    segment('TF473-024', 5368, 5396, 'Explanation · digital abundance vs digital scarcity'),
    segment('TF473-025', 5453, 5469, 'Compression · choose long-term over short-term'),
    segment('TF473-026', 5776, 5797, 'Formulation · the best relationships do not feel like work'),
    segment('TF473-027', 6047, 6069, 'Reframing · all of life is games'),
    segment('TF473-028', 6225, 6250, 'Strong ending · win the game so you can be free of it'),
    segment('TF473-029', 6661, 6689, 'Formulation · mortality as a radical freedom reframe'),
    segment('TF473-030', 6689, 6712, 'Reframing · change the worldview that names experience suffering'),
  ],
}

const navalHowToGetRich: CuratedCollection = {
  id: 'naval-how-to-get-rich',
  speakerId: 'naval-ravikant',
  speaker: 'Naval Ravikant',
  sourceTitle: 'How to Get Rich · Naval + Nivi · 2019',
  videoId: '1-TZqOsVCNM',
  videoTitle: 'How to Get Rich',
  channelName: 'Naval',
  thumbnail: 'https://i.ytimg.com/vi/1-TZqOsVCNM/hqdefault.jpg',
  duration: 12937,
  description: 'The complete Naval + Nivi wealth series in one long-form source. Curated for unusually clean definitions, compressed principles, examples, qualification, and proposition-by-proposition explanation.',
  focus: ['Formulation', 'Compression', 'Explanation', 'Definition', 'Reframing', 'Sentence construction'],
  status: 'ready',
  segments: [
    segment('HTGR-001', 112, 145, 'Definition · wealth is assets that earn while you sleep'),
    segment('HTGR-002', 306, 337, 'Distinction · wealth is positive-sum; status is zero-sum'),
    segment('HTGR-003', 527, 557, 'Reframing · modern abundance proves wealth can be created'),
    segment('HTGR-004', 880, 897, 'Formulation · making money is a learnable skill, not luck'),
    segment('HTGR-005', 1234, 1266, 'Reframing · character turns luck into destiny'),
    segment('HTGR-006', 1361, 1393, 'Explanation · eccentricity helps you reach uncrowded frontiers'),
    segment('HTGR-007', 1458, 1490, 'Distinction · rented time ties inputs directly to outputs'),
    segment('HTGR-008', 2108, 2142, 'Explanation · the internet gives every niche obsession scale'),
    segment('HTGR-009', 2336, 2369, 'Analogy · all major returns in life compound'),
    segment('HTGR-010', 2562, 2594, 'Formulation · long-term games bake the pie together'),
    segment('HTGR-011', 2689, 2721, 'Framework · intelligence, energy, integrity'),
    segment('HTGR-012', 3035, 3068, 'Instruction · action bias plus rational optimism'),
    segment('HTGR-013', 3339, 3373, 'Definition · the most interesting knowledge cannot be taught'),
    segment('HTGR-014', 3465, 3498, 'Explanation · genuine curiosity leads to specific knowledge'),
    segment('HTGR-015', 3584, 3617, 'Formulation · what feels like play to you can look like work to others'),
    segment('HTGR-016', 4098, 4129, 'Synthesis · builder + seller is the magic combination'),
    segment('HTGR-017', 6139, 6155, 'Compression · code and media are permissionless leverage'),
    segment('HTGR-018', 7456, 7488, 'Definition · judgment and wisdom are long-term consequence prediction'),
    segment('HTGR-019', 8427, 8443, 'Formulation · a busy calendar and busy mind destroy great work'),
    segment('HTGR-020', 8460, 8491, 'Reframing · redefine what you do until you can be number one'),
    segment('HTGR-021', 9345, 9378, 'Method · listen broadly, then build your own point of view'),
    segment('HTGR-022', 9444, 9478, 'Analogy · maxims are mental pointers to lived principles'),
    segment('HTGR-023', 10708, 10741, 'Reframing · ethics as long-term greedy'),
    segment('HTGR-024', 11407, 11425, 'Instruction · act like the owner until you become the owner'),
    segment('HTGR-025', 11490, 11523, 'Decision rule · avoid ruin before optimizing upside'),
    segment('HTGR-026', 12216, 12247, 'Qualification · rent your time only while learning and saving'),
    segment('HTGR-027', 12343, 12374, 'Instruction · choose the steepest learning curve over repetitive drudgery'),
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
      navalKnowledgeProject18,
      navalTimFerriss473,
      navalHowToGetRich,
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
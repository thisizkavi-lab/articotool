import type { Segment } from './types'

export interface CuratedCollection {
  id: string
  speaker: string
  sourceTitle: string
  videoId: string
  videoTitle: string
  channelName: string
  thumbnail: string
  duration: number
  description: string
  focus: string[]
  segments: Segment[]
}

const segment = (id: string, start: number, end: number, label: string): Segment => ({
  id,
  start,
  end,
  label,
  lines: [],
  createdAt: 0,
})

export const CURATED_COLLECTIONS: CuratedCollection[] = [
  {
    id: 'naval-jre-1309',
    speaker: 'Naval Ravikant',
    sourceTitle: 'Joe Rogan Experience #1309',
    videoId: '3qHkcs3kG44',
    videoTitle: 'Joe Rogan Experience #1309 - Naval Ravikant',
    channelName: 'PowerfulJRE',
    thumbnail: 'https://i.ytimg.com/vi/3qHkcs3kG44/hqdefault.jpg',
    duration: 7917,
    description: 'Pilot corpus: high-value speaking specimens selected for formulation, articulation, compression, explanation, analogy, disagreement, qualification, and strong endings.',
    focus: ['Formulation', 'Articulation', 'Cadence', 'Compression', 'Explanation', 'Analogy'],
    segments: [
      segment('JRE1309-001', 46, 78, 'Analogy · vivid answer opening'),
      segment('JRE1309-002', 144, 175, 'Analogy · mountain-climbing reframe'),
      segment('JRE1309-003', 201, 240, 'Formulation · beginner’s mind'),
      segment('JRE1309-004', 241, 255, 'Distinction · knowing vs understanding'),
      segment('JRE1309-005', 304, 327, 'Compression · lecture → book → blog → tweet'),
      segment('JRE1309-006', 401, 426, 'Explanation · curiosity over completion'),
      segment('JRE1309-007', 866, 887, 'Formulation · Naval on concise communication'),
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
  },
]

export function getCuratedCollection(id: string | null | undefined): CuratedCollection | null {
  if (!id) return null
  return CURATED_COLLECTIONS.find(collection => collection.id === id) || null
}

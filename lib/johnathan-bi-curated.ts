import type { Segment } from './types'
import type { CuratedCollection, CuratedSpeaker } from './curated-library'

const segment = (id: string, start: number, end: number, label: string): Segment => ({
  id,
  start,
  end,
  label,
  lines: [],
  createdAt: 0,
})

const nietzscheGenealogy: CuratedCollection = {
  id: 'johnathan-bi-nietzsche-genealogy',
  speakerId: 'johnathan-bi',
  speaker: 'Johnathan Bi',
  sourceTitle: 'Masters vs. Slaves · Nietzsche’s Genealogy of Morality',
  videoId: 'M0w2eQ-FcEA',
  videoTitle: "Masters vs. Slaves | Nietzsche's Genealogy of Morality Explained",
  channelName: 'Johnathan Bi',
  thumbnail: 'https://i.ytimg.com/vi/M0w2eQ-FcEA/hqdefault.jpg',
  duration: 5760,
  description: 'A calibration lecture for structured intellectual speaking. The five selected clips train story, contrast, analogy, escalation, and qualification rather than pronunciation alone.',
  focus: ['Story', 'Contrast', 'Analogy', 'Escalation', 'Qualification', 'Thinking aloud'],
  status: 'ready',
  segments: [
    segment('JBN-001', 129, 218, 'Story · ambition → failure → philosophical turn'),
    segment('JBN-002', 1514, 1621, 'Contrast · good/bad vs good/evil'),
    segment('JBN-003', 1705, 1807, 'Performance · no-sayer → yes-sayer → vivid analogy'),
    segment('JBN-004', 2441, 2654, 'Analogy · lambs, birds of prey, and free will'),
    segment('JBN-005', 4857, 5034, 'Qualification · psychological explanation ≠ disproof'),
  ],
}

export const JOHNATHAN_BI_SPEAKER: CuratedSpeaker = {
  id: 'johnathan-bi',
  name: 'Johnathan Bi',
  description: 'Structured philosophical speaking: turn difficult ideas into clear spoken thought through story, contrast, analogy, escalation, and precise qualification. Shadow the move, not merely the mouth.',
  focus: ['Storytelling', 'Contrast', 'Analogy', 'Argument', 'Qualification', 'Intellectual English'],
  portrait: 'https://yt3.googleusercontent.com/5l1X2fpJR7uB2iaXfl7OQuOzQ1NSPFzQGfLRIW1HAO46zYGO_jveE8XUhT5cC63YTQvxW3kGuQ=s900-c-k-c0x00ffffff-no-rj',
  sources: [nietzscheGenealogy],
}

export const JOHNATHAN_BI_COLLECTIONS: CuratedCollection[] = JOHNATHAN_BI_SPEAKER.sources.filter(
  source => source.status === 'ready',
)

export function getJohnathanBiSpeaker(id: string | null | undefined): CuratedSpeaker | null {
  if (!id) return null
  return id === JOHNATHAN_BI_SPEAKER.id ? JOHNATHAN_BI_SPEAKER : null
}

export function getJohnathanBiCollection(id: string | null | undefined): CuratedCollection | null {
  if (!id) return null
  return JOHNATHAN_BI_COLLECTIONS.find(collection => collection.id === id) || null
}

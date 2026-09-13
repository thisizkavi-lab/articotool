import type { Segment } from './types'
import type { CuratedCollection } from './curated-library'

export interface EverydayEnglishClipMatch {
  phraseId: string
  collectionId: string
  segmentId: string
  speaker: string
  transcript: string
  matchType: 'exact' | 'lexical-variant' | 'semantic-equivalent'
  evidenceUrl: string
}

const segment = (id: string, start: number, end: number, label: string): Segment => ({
  id,
  start,
  end,
  label,
  lines: [],
  createdAt: 0,
})

const basementYard446: CuratedCollection = {
  id: 'english-basement-yard-446-greetings',
  speakerId: 'joe-santagato-frank-alvarez',
  speaker: 'Joe Santagato / Frank Alvarez',
  sourceTitle: 'The Basement Yard #446 · Frank Walked Into A Crime Scene',
  videoId: 'r1zoSOiY_FA',
  videoTitle: 'Frank Walked Into A Crime Scene | The Basement Yard #446',
  channelName: 'The Basement Yard',
  thumbnail: 'https://i.ytimg.com/vi/r1zoSOiY_FA/hqdefault.jpg',
  duration: 3900,
  description: 'Queens/NYC conversational English used as an anchor source for Everyday English. Only clean, reusable phrase clips are promoted.',
  focus: ['Everyday English', 'NYC', 'Greetings', 'Natural conversation'],
  status: 'ready',
  segments: [
    segment('TBY446-GREET-03', 0, 8.2, "Greeting exchange · 'How you doing, Frank?'"),
    segment('TBY446-GREET-05', 13.7, 17.4, "Warm greeting · 'Good to see you.'"),
  ],
}

export const EVERYDAY_ENGLISH_COLLECTIONS: CuratedCollection[] = [basementYard446]

export const EVERYDAY_ENGLISH_CLIP_MATCHES: EverydayEnglishClipMatch[] = [
  {
    phraseId: 'greet-03',
    collectionId: basementYard446.id,
    segmentId: 'TBY446-GREET-03',
    speaker: 'Joe Santagato',
    transcript: 'How you doing, Frank?',
    matchType: 'lexical-variant',
    evidenceUrl: 'https://www.tapesearch.com/episode/446-frank-walked-into-a-crime-scene/STQ4Xqv5eBw3qr3WhwQEfq',
  },
  {
    phraseId: 'greet-05',
    collectionId: basementYard446.id,
    segmentId: 'TBY446-GREET-05',
    speaker: 'Joe Santagato / Frank Alvarez',
    transcript: 'Good to see you. / It\'s good to see you.',
    matchType: 'exact',
    evidenceUrl: 'https://www.tapesearch.com/episode/446-frank-walked-into-a-crime-scene/STQ4Xqv5eBw3qr3WhwQEfq',
  },
]

export function getEverydayEnglishCollection(id: string | null): CuratedCollection | undefined {
  if (!id) return undefined
  return EVERYDAY_ENGLISH_COLLECTIONS.find(collection => collection.id === id)
}

export function getEverydayEnglishClipMatch(phraseId: string): EverydayEnglishClipMatch | undefined {
  return EVERYDAY_ENGLISH_CLIP_MATCHES.find(match => match.phraseId === phraseId)
}

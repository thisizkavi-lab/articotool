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

const basementYard494: CuratedCollection = {
  id: 'english-basement-yard-494-clarification',
  speakerId: 'joe-santagato-frank-alvarez',
  speaker: 'Joe Santagato / Frank Alvarez',
  sourceTitle: 'The Basement Yard #494 · Visiting Docter Dan',
  videoId: '5EpiYeXluPc',
  videoTitle: 'Visiting Docter Dan | The Basement Yard #494',
  channelName: 'The Basement Yard',
  thumbnail: 'https://i.ytimg.com/vi/5EpiYeXluPc/hqdefault.jpg',
  duration: 4500,
  description: 'Clean early-episode Queens/NYC conversational exchange with a natural clarification question.',
  focus: ['Everyday English', 'NYC', 'Clarification', 'Natural conversation'],
  status: 'ready',
  segments: [
    segment('TBY494-UNDERSTAND-05', 14.1, 19.3, "Clarification · 'What do you mean?'"),
  ],
}

const basementYard559: CuratedCollection = {
  id: 'english-basement-yard-559-fillers',
  speakerId: 'joe-santagato-frank-alvarez',
  speaker: 'Joe Santagato / Frank Alvarez',
  sourceTitle: 'The Basement Yard #559 · Release The Mosquitos',
  videoId: 'm77sDceykAw',
  videoTitle: 'Release The Mosquitos | The Basement Yard #559',
  channelName: 'The Basement Yard',
  thumbnail: 'https://i.ytimg.com/vi/m77sDceykAw/hqdefault.jpg',
  duration: 4814,
  description: 'Contemporary Queens/NYC conversation with naturally embedded discourse markers.',
  focus: ['Everyday English', 'NYC', 'Conversation fillers', 'Natural conversation'],
  status: 'ready',
  segments: [
    segment('TBY559-FILL-03-07', 82, 98, "Conversation fillers · 'to be honest with you ... I mean, listen'"),
  ],
}

const basementYard567: CuratedCollection = {
  id: 'english-basement-yard-567-greetings',
  speakerId: 'joe-santagato-frank-alvarez',
  speaker: 'Joe Santagato / Frank Alvarez',
  sourceTitle: 'The Basement Yard #567 · Making Out In Public',
  videoId: 'pDbCTTEuDi0',
  videoTitle: 'Making Out In Public | The Basement Yard #567',
  channelName: 'The Basement Yard',
  thumbnail: 'https://i.ytimg.com/vi/pDbCTTEuDi0/hqdefault.jpg',
  duration: 5508,
  description: 'Recent Queens/NYC conversational English with a simple casual greeting exchange at the opening.',
  focus: ['Everyday English', 'NYC', 'Greetings', 'Natural conversation'],
  status: 'ready',
  segments: [
    segment('TBY567-GREET-01-02', 0, 8, "Casual greeting exchange · 'Hey, hi.'"),
  ],
}

export const EVERYDAY_ENGLISH_COLLECTIONS: CuratedCollection[] = [
  basementYard446,
  basementYard494,
  basementYard559,
  basementYard567,
]

export const EVERYDAY_ENGLISH_CLIP_MATCHES: EverydayEnglishClipMatch[] = [
  {
    phraseId: 'greet-01',
    collectionId: basementYard567.id,
    segmentId: 'TBY567-GREET-01-02',
    speaker: 'Joe Santagato / Frank Alvarez exchange',
    transcript: 'Frank. Hey, hi.',
    matchType: 'exact',
    evidenceUrl: 'https://www.audioscrape.com/podcast/the-basement-yard/episode/567-making-out-in-public-59420',
  },
  {
    phraseId: 'greet-02',
    collectionId: basementYard567.id,
    segmentId: 'TBY567-GREET-01-02',
    speaker: 'Joe Santagato / Frank Alvarez exchange',
    transcript: 'Frank. Hey, hi.',
    matchType: 'exact',
    evidenceUrl: 'https://www.audioscrape.com/podcast/the-basement-yard/episode/567-making-out-in-public-59420',
  },
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
  {
    phraseId: 'fill-03',
    collectionId: basementYard559.id,
    segmentId: 'TBY559-FILL-03-07',
    speaker: 'Joe Santagato / Frank Alvarez exchange',
    transcript: "I don't even know how this happened, to be honest with you, but I mean, listen ...",
    matchType: 'exact',
    evidenceUrl: 'https://www.audioscrape.com/podcast/the-basement-yard/episode/559-release-the-mosquitos-21020',
  },
  {
    phraseId: 'fill-07',
    collectionId: basementYard559.id,
    segmentId: 'TBY559-FILL-03-07',
    speaker: 'Joe Santagato / Frank Alvarez exchange',
    transcript: "I don't even know how this happened, to be honest with you, but I mean, listen ...",
    matchType: 'lexical-variant',
    evidenceUrl: 'https://www.audioscrape.com/podcast/the-basement-yard/episode/559-release-the-mosquitos-21020',
  },
  {
    phraseId: 'understand-05',
    collectionId: basementYard494.id,
    segmentId: 'TBY494-UNDERSTAND-05',
    speaker: 'Joe Santagato / Frank Alvarez exchange',
    transcript: 'Baby makes them feel a little uncomfortable. What do you mean? Some people don\'t like baby.',
    matchType: 'exact',
    evidenceUrl: 'https://www.tapesearch.com/episode/494-visiting-docter-dan/HEwvgRi5jRv5H6Lfph2Roy',
  },
]

export function getEverydayEnglishCollection(id: string | null): CuratedCollection | undefined {
  if (!id) return undefined
  return EVERYDAY_ENGLISH_COLLECTIONS.find(collection => collection.id === id)
}

export function getEverydayEnglishClipMatch(phraseId: string): EverydayEnglishClipMatch | undefined {
  return EVERYDAY_ENGLISH_CLIP_MATCHES.find(match => match.phraseId === phraseId)
}

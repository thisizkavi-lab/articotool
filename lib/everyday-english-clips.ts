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

const basementYard256: CuratedCollection = {
  id: 'english-basement-yard-256-introductions',
  speakerId: 'joe-santagato-frank-alvarez',
  speaker: 'Joe Santagato / Frank Alvarez',
  sourceTitle: 'The Basement Yard #256 · The Worst Job Interview Of All Time',
  videoId: 'Ae_Y8g4Syeo',
  videoTitle: 'The Worst Job Interview Of All Time | The Basement Yard #256',
  channelName: 'The Basement Yard',
  thumbnail: 'https://i.ytimg.com/vi/Ae_Y8g4Syeo/hqdefault.jpg',
  duration: 3900,
  description: "Queens/NYC conversational English with a clean, reciprocal first-meeting greeting: 'Nice to meet you.'",
  focus: ['Everyday English', 'NYC', 'Introductions', 'Natural conversation'],
  status: 'ready',
  segments: [
    segment('TBY256-GREET-07', 274.0, 281.5, "First meeting · 'Nice to meet you. Nice to meet you.'"),
  ],
}

const basementYard339: CuratedCollection = {
  id: 'english-basement-yard-339-preferences',
  speakerId: 'joe-santagato-frank-alvarez',
  speaker: 'Joe Santagato / Frank Alvarez',
  sourceTitle: 'The Basement Yard #339 · How To Become A Priest',
  videoId: '3f3iKts2u30',
  videoTitle: 'How To Become A Priest | The Basement Yard #339',
  channelName: 'The Basement Yard',
  thumbnail: 'https://i.ytimg.com/vi/3f3iKts2u30/hqdefault.jpg',
  duration: 4200,
  description: 'Queens/NYC conversational English with a clean early-episode preference statement.',
  focus: ['Everyday English', 'NYC', 'Preferences', 'Natural conversation'],
  status: 'ready',
  segments: [
    segment('TBY339-OPINION-08', 9.2, 15.0, "Preference · 'I'd rather wear this than get into Formula One racing...'"),
  ],
}

const basementYard444: CuratedCollection = {
  id: 'english-basement-yard-444-time-thanks',
  speakerId: 'joe-santagato-frank-alvarez',
  speaker: 'Joe Santagato / Frank Alvarez',
  sourceTitle: 'The Basement Yard #444 · THE TOUR DATES',
  videoId: 'BB1L5HDXBko',
  videoTitle: 'THE TOUR DATES! | The Basement Yard #444',
  channelName: 'The Basement Yard',
  thumbnail: 'https://i.ytimg.com/vi/BB1L5HDXBko/hqdefault.jpg',
  duration: 3900,
  description: 'Queens/NYC conversational English with a real scheduling question and natural gratitude during a phone call.',
  focus: ['Everyday English', 'NYC', 'Time', 'Gratitude'],
  status: 'ready',
  segments: [
    segment('TBY444-TIME-01', 314.0, 323.5, "Scheduling · 'What time do the tickets go on sale?'"),
    segment('TBY444-THANKS-03', 329.0, 339.5, "Warm thanks · 'Thank you so much, Greg. We appreciate it so much. Thank you so much.'"),
    segment('TBY444-THANKS-01', 339.5, 348.0, "Casual thanks · 'Have a good one, fellas. Thanks.'"),
  ],
}

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

const basementYard477: CuratedCollection = {
  id: 'english-basement-yard-477-suggestions',
  speakerId: 'joe-santagato-frank-alvarez',
  speaker: 'Joe Santagato / Frank Alvarez',
  sourceTitle: "The Basement Yard #477 · The World's Sexiest Podcast Hosts",
  videoId: 'iWBPM_3xMZU',
  videoTitle: "The World's Sexiest Podcast Hosts | The Basement Yard #477",
  channelName: 'The Basement Yard',
  thumbnail: 'https://i.ytimg.com/vi/iWBPM_3xMZU/hqdefault.jpg',
  duration: 4346,
  description: "Natural Queens/NYC conversation with a compact enthusiastic 'I'm in' acceptance phrase.",
  focus: ['Everyday English', 'NYC', 'Suggestions', 'Natural conversation'],
  status: 'ready',
  segments: [
    segment('TBY477-SUGGEST-06', 224.0, 236.0, "Acceptance · 'Any ripaway pants, I'm in.'"),
  ],
}

const basementYard480: CuratedCollection = {
  id: 'english-basement-yard-480-weather',
  speakerId: 'joe-santagato-frank-alvarez',
  speaker: 'Joe Santagato / Frank Alvarez',
  sourceTitle: 'The Basement Yard #480 · A.I Is Officially Coming For Us!',
  videoId: 'NFqQCoEdGA0',
  videoTitle: 'A.I Is Officially Coming For Us! | The Basement Yard #480',
  channelName: 'The Basement Yard',
  thumbnail: 'https://i.ytimg.com/vi/NFqQCoEdGA0/hqdefault.jpg',
  duration: 0,
  description: "Queens/NYC conversational English with a clean opening weather comment: 'it's freezing out.'",
  focus: ['Everyday English', 'NYC', 'Weather', 'Natural conversation'],
  status: 'ready',
  segments: [
    segment('TBY480-WEATHER-02', 0.0, 10.0, "Weather · 'It's freezing out.'"),
  ],
}

const basementYard483: CuratedCollection = {
  id: 'english-basement-yard-483-fillers',
  speakerId: 'joe-santagato-frank-alvarez',
  speaker: 'Joe Santagato / Frank Alvarez',
  sourceTitle: "The Basement Yard #483 · There's Human DNA In Hot Dogs",
  videoId: 'z1p0j3GZH9k',
  videoTitle: "There's Human DNA In The Hot Dogs | The Basement Yard #483",
  channelName: 'The Basement Yard',
  thumbnail: 'https://i.ytimg.com/vi/z1p0j3GZH9k/hqdefault.jpg',
  duration: 3803,
  description: 'Natural Queens/NYC conversation with clean examples of actually, I guess, and really used in live turn-taking.',
  focus: ['Everyday English', 'NYC', 'Conversation fillers', 'Natural conversation'],
  status: 'ready',
  segments: [
    segment('TBY483-FILL-05-06', 127.0, 136.0, "Conversation fillers · 'actually, I guess...'"),
    segment('TBY483-FILL-10', 160.0, 166.0, "Reaction · 'Really?'"),
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
    segment('TBY494-AGREE-02', 19.3, 24.3, "Agreement · 'Absolutely love it.'"),
  ],
}

const basementYard351: CuratedCollection = {
  id: 'english-basement-yard-351-opinions',
  speakerId: 'joe-santagato-frank-alvarez',
  speaker: 'Joe Santagato / Frank Alvarez',
  sourceTitle: "The Basement Yard #351 · I've Made Love To My Car",
  videoId: '3meSp-LahdM',
  videoTitle: "I've Made Love To My Car | The Basement Yard #351",
  channelName: 'The Basement Yard',
  thumbnail: 'https://i.ytimg.com/vi/3meSp-LahdM/hqdefault.jpg',
  duration: 4080,
  description: 'Queens/NYC conversational English with a direct, natural request for an opinion in the opening exchange.',
  focus: ['Everyday English', 'NYC', 'Opinions', 'Natural conversation'],
  status: 'ready',
  segments: [
    segment('TBY351-OPINION-01', 5.5, 10.8, "Opinion · 'What do you think of my drawer?'"),
  ],
}

const basementYard498: CuratedCollection = {
  id: 'english-basement-yard-498-agreement',
  speakerId: 'joe-santagato-frank-alvarez',
  speaker: 'Joe Santagato / Frank Alvarez',
  sourceTitle: 'The Basement Yard #498 · The Morning Routine',
  videoId: 'OELGdBT6o_I',
  videoTitle: 'The Morning Routine | The Basement Yard #498',
  channelName: 'The Basement Yard',
  thumbnail: 'https://i.ytimg.com/vi/OELGdBT6o_I/hqdefault.jpg',
  duration: 4491,
  description: "Natural Queens/NYC turn-taking with a compact exact 'Exactly' agreement response.",
  focus: ['Everyday English', 'NYC', 'Agreement', 'Natural conversation'],
  status: 'ready',
  segments: [
    segment('TBY498-AGREE-01', 11.5, 15.0, "Agreement · 'Yeah, exactly.'"),
  ],
}

const basementYard507: CuratedCollection = {
  id: 'english-basement-yard-507-agreement',
  speakerId: 'joe-santagato-frank-alvarez',
  speaker: 'Joe Santagato / Frank Alvarez',
  sourceTitle: "The Basement Yard #507 · We're Going To The Major Leagues",
  videoId: 'SZex0qbmgrg',
  videoTitle: "We're Going To The Major Leagues | The Basement Yard #507",
  channelName: 'The Basement Yard',
  thumbnail: 'https://i.ytimg.com/vi/SZex0qbmgrg/hqdefault.jpg',
  duration: 0,
  description: "Queens/NYC conversational English with a clean natural acknowledgement: 'Really good point.'",
  focus: ['Everyday English', 'NYC', 'Agreement', 'Natural conversation'],
  status: 'ready',
  segments: [segment('TBY507-AGREE-03', 4255, 4262, "Acknowledgement · 'Really good point.'")],
}

const basementYard558: CuratedCollection = {
  id: 'english-basement-yard-558-apologies',
  speakerId: 'joe-santagato-frank-alvarez',
  speaker: 'Joe Santagato / Frank Alvarez',
  sourceTitle: 'The Basement Yard #558 · FRANK FIRES JOE!! + New Tour Dates',
  videoId: 'kJF8Zz2iExo',
  videoTitle: 'FRANK FIRES JOE!! + New Tour Dates | The Basement Yard #558',
  channelName: 'The Basement Yard',
  thumbnail: 'https://i.ytimg.com/vi/kJF8Zz2iExo/hqdefault.jpg',
  duration: 5222,
  description: "Queens/NYC conversational English with a natural correction: 'I'm so sorry.' / 'It's okay.'",
  focus: ['Everyday English', 'NYC', 'Apologies', 'Natural conversation'],
  status: 'ready',
  segments: [segment('TBY558-SORRY-03-07', 1495, 1505, "Apology exchange · 'I'm so sorry.' / 'It's okay.'")],
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
    segment('TBY559-THANKS-04', 45.0, 56.0, "Gratitude · 'I really appreciate you inviting me here.'"),
    segment('TBY559-FILL-03-07', 82, 98, "Conversation fillers · 'to be honest with you ... I mean, listen'"),
  ],
}

const basementYard565: CuratedCollection = {
  id: 'english-basement-yard-565-apology-goodbye',
  speakerId: 'joe-santagato-frank-alvarez',
  speaker: 'Joe Santagato / Frank Alvarez',
  sourceTitle: 'The Basement Yard #565 · Are We Ready For Pie?!',
  videoId: 'WGN6kLtVYBk',
  videoTitle: 'Are We Ready For Pie?! | The Basement Yard #565',
  channelName: 'The Basement Yard',
  thumbnail: 'https://i.ytimg.com/vi/WGN6kLtVYBk/hqdefault.jpg',
  duration: 0,
  description: "Recent Queens/NYC conversation with a compact 'my bad' correction and a clean 'see you' outro.",
  focus: ['Everyday English', 'NYC', 'Apologies', 'Goodbyes'],
  status: 'ready',
  segments: [
    segment('TBY565-SORRY-02', 4765.0, 4775.0, "Casual apology · 'Oh, my bad.'"),
    segment('TBY565-BYE-02', 4788.0, 4797.0, "Casual goodbye · 'See you guys next time.'"),
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
  basementYard256,
  basementYard339,
  basementYard351,
  basementYard444,
  basementYard446,
  basementYard498,
  basementYard477,
  basementYard480,
  basementYard483,
  basementYard494,
  basementYard507,
  basementYard558,
  basementYard559,
  basementYard565,
  basementYard567,
]

export const EVERYDAY_ENGLISH_CLIP_MATCHES: EverydayEnglishClipMatch[] = [
  {
    phraseId: 'greet-07',
    collectionId: basementYard256.id,
    segmentId: 'TBY256-GREET-07',
    speaker: 'Joe Santagato / Frank Alvarez exchange',
    transcript: 'Nice to meet you. Nice to meet you.',
    matchType: 'exact',
    evidenceUrl: 'https://podscripts.co/podcasts/the-basement-yard/256-the-worst-job-interview-of-all-time',
  },
  {
    phraseId: 'time-01',
    collectionId: basementYard444.id,
    segmentId: 'TBY444-TIME-01',
    speaker: 'Joe Santagato / Frank Alvarez exchange',
    transcript: 'We want to know what time do the tickets go on sale on April 2nd, presale?',
    matchType: 'lexical-variant',
    evidenceUrl: 'https://podscripts.co/podcasts/the-basement-yard/444-the-tour-dates',
  },
  {
    phraseId: 'thanks-03',
    collectionId: basementYard444.id,
    segmentId: 'TBY444-THANKS-03',
    speaker: 'Joe Santagato / Frank Alvarez exchange',
    transcript: 'Thank you so much, Greg. We appreciate it so much. Thank you so much.',
    matchType: 'exact',
    evidenceUrl: 'https://podscripts.co/podcasts/the-basement-yard/444-the-tour-dates',
  },
  {
    phraseId: 'thanks-01',
    collectionId: basementYard444.id,
    segmentId: 'TBY444-THANKS-01',
    speaker: 'Greg / Joe Santagato exchange',
    transcript: 'Have a good one, fellas, thanks.',
    matchType: 'exact',
    evidenceUrl: 'https://podscripts.co/podcasts/the-basement-yard/444-the-tour-dates',
  },
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
    phraseId: 'fill-05',
    collectionId: basementYard483.id,
    segmentId: 'TBY483-FILL-05-06',
    speaker: 'Frank Alvarez',
    transcript: 'But, like, I drink, actually, I guess everything except wine with an ice cube.',
    matchType: 'exact',
    evidenceUrl: 'https://www.audioscrape.com/podcast/the-basement-yard/episode/483---theres-human-dna-in-hot-dogs',
  },
  {
    phraseId: 'fill-06',
    collectionId: basementYard483.id,
    segmentId: 'TBY483-FILL-05-06',
    speaker: 'Frank Alvarez',
    transcript: 'But, like, I drink, actually, I guess everything except wine with an ice cube.',
    matchType: 'exact',
    evidenceUrl: 'https://www.audioscrape.com/podcast/the-basement-yard/episode/483---theres-human-dna-in-hot-dogs',
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
    phraseId: 'fill-10',
    collectionId: basementYard483.id,
    segmentId: 'TBY483-FILL-10',
    speaker: 'Joe Santagato / Frank Alvarez exchange',
    transcript: 'Really? Make it cold.',
    matchType: 'exact',
    evidenceUrl: 'https://www.audioscrape.com/podcast/the-basement-yard/episode/483---theres-human-dna-in-hot-dogs',
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
  {
    phraseId: 'opinion-01',
    collectionId: basementYard351.id,
    segmentId: 'TBY351-OPINION-01',
    speaker: 'Joe Santagato',
    transcript: 'What do you think of my drawer?',
    matchType: 'exact',
    evidenceUrl: 'https://www.tapesearch.com/episode/351-i-ve-made-love-to-my-car/SKiuo7T4PXjXsA6qmYaAaH',
  },
  {
    phraseId: 'agree-01',
    collectionId: basementYard498.id,
    segmentId: 'TBY498-AGREE-01',
    speaker: 'Joe Santagato',
    transcript: 'Yeah, exactly.',
    matchType: 'exact',
    evidenceUrl: 'https://pod.wave.co/podcast/the-basement-yard/498-the-morning-routine-c132baa4',
  },
  {
    phraseId: 'agree-02',
    collectionId: basementYard494.id,
    segmentId: 'TBY494-AGREE-02',
    speaker: 'Joe Santagato / Frank Alvarez exchange',
    transcript: 'Absolutely love it.',
    matchType: 'lexical-variant',
    evidenceUrl: 'https://www.tapesearch.com/episode/494-visiting-docter-dan/HEwvgRi5jRv5H6Lfph2Roy',
  },
  {
    phraseId: 'agree-03',
    collectionId: basementYard507.id,
    segmentId: 'TBY507-AGREE-03',
    speaker: 'Joe Santagato / Frank Alvarez exchange',
    transcript: 'Really good point.',
    matchType: 'lexical-variant',
    evidenceUrl: 'https://podscripts.co/podcasts/the-basement-yard/507-were-going-to-the-major-leagues',
  },
  {
    phraseId: 'sorry-03',
    collectionId: basementYard558.id,
    segmentId: 'TBY558-SORRY-03-07',
    speaker: 'Frank Alvarez',
    transcript: "I'm so sorry.",
    matchType: 'lexical-variant',
    evidenceUrl: 'https://pod.wave.co/podcast/the-basement-yard/558-frank-fires-joe-new-tour-dates',
  },
  {
    phraseId: 'sorry-07',
    collectionId: basementYard558.id,
    segmentId: 'TBY558-SORRY-03-07',
    speaker: 'Joe Santagato',
    transcript: "It's okay.",
    matchType: 'lexical-variant',
    evidenceUrl: 'https://pod.wave.co/podcast/the-basement-yard/558-frank-fires-joe-new-tour-dates',
  },
  {
    phraseId: 'thanks-04',
    collectionId: basementYard559.id,
    segmentId: 'TBY559-THANKS-04',
    speaker: 'Frank Alvarez',
    transcript: 'I really appreciate you inviting me here.',
    matchType: 'exact',
    evidenceUrl: 'https://www.audioscrape.com/podcast/the-basement-yard/episode/559-release-the-mosquitos-21020',
  },
  {
    phraseId: 'opinion-08',
    collectionId: basementYard339.id,
    segmentId: 'TBY339-OPINION-08',
    speaker: 'Joe Santagato / Frank Alvarez exchange',
    transcript: "I'd rather wear this than get into Formula One racing two days ago...",
    matchType: 'exact',
    evidenceUrl: 'https://www.tapesearch.com/episode/339-how-to-become-a-priest/hSuGVXn9CNNNDVmFGqToBt',
  },
  {
    phraseId: 'sorry-02',
    collectionId: basementYard565.id,
    segmentId: 'TBY565-SORRY-02',
    speaker: 'Frank Alvarez',
    transcript: 'Oh, my bad.',
    matchType: 'exact',
    evidenceUrl: 'https://pod.wave.co/podcast/the-basement-yard/565-are-we-ready-for-pie',
  },
  {
    phraseId: 'bye-02',
    collectionId: basementYard565.id,
    segmentId: 'TBY565-BYE-02',
    speaker: 'Joe Santagato',
    transcript: 'See you guys next time.',
    matchType: 'lexical-variant',
    evidenceUrl: 'https://pod.wave.co/podcast/the-basement-yard/565-are-we-ready-for-pie',
  },
  {
    phraseId: 'weather-02',
    collectionId: basementYard480.id,
    segmentId: 'TBY480-WEATHER-02',
    speaker: 'Joe Santagato / Frank Alvarez exchange',
    transcript: "Keep it warm. It's freezing out. The weather is starting to turn.",
    matchType: 'lexical-variant',
    evidenceUrl: 'https://www.audioscrape.com/podcast/the-basement-yard/episode/480---ai-is-officially-coming-for-us',
  },
  {
    phraseId: 'suggest-06',
    collectionId: basementYard477.id,
    segmentId: 'TBY477-SUGGEST-06',
    speaker: 'Frank Alvarez',
    transcript: "Any ripaway pants, I'm in.",
    matchType: 'exact',
    evidenceUrl: 'https://www.audioscrape.com/podcast/the-basement-yard/episode/477---the-worlds-sexiest-podcast-hosts',
  },
]

export function getEverydayEnglishCollection(id: string | null): CuratedCollection | undefined {
  if (!id) return undefined
  return EVERYDAY_ENGLISH_COLLECTIONS.find(collection => collection.id === id)
}

export function getEverydayEnglishClipMatch(phraseId: string): EverydayEnglishClipMatch | undefined {
  return EVERYDAY_ENGLISH_CLIP_MATCHES.find(match => match.phraseId === phraseId)
}

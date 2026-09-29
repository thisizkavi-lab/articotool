import type { Segment } from './types'
import type { CuratedCollection, CuratedSpeaker, CuratedSourceStatus } from './curated-library'

const segment = (id: string, start: number, end: number, label: string): Segment => ({ id, start, end, label, lines: [], createdAt: 0 })

const pipelineSource = (
  id: string,
  sourceTitle: string,
  description: string,
  focus: string[],
  options: { videoId?: string | null; videoTitle?: string; duration?: number; status?: CuratedSourceStatus } = {},
): CuratedCollection => {
  const videoId = options.videoId ?? null
  return {
    id, speakerId: 'johnathan-bi', speaker: 'Johnathan Bi', sourceTitle, videoId,
    videoTitle: options.videoTitle || sourceTitle,
    channelName: videoId ? 'Johnathan Bi' : '',
    thumbnail: videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '',
    duration: options.duration || 0, description, focus, status: options.status || 'queued', segments: [],
  }
}

const nietzscheGenealogy: CuratedCollection = {
  id: 'johnathan-bi-nietzsche-genealogy', speakerId: 'johnathan-bi', speaker: 'Johnathan Bi',
  sourceTitle: 'Masters vs. Slaves · Nietzsche’s Genealogy of Morality', videoId: 'M0w2eQ-FcEA',
  videoTitle: "Masters vs. Slaves | Nietzsche's Genealogy of Morality Explained", channelName: 'Johnathan Bi',
  thumbnail: 'https://i.ytimg.com/vi/M0w2eQ-FcEA/hqdefault.jpg', duration: 5760,
  description: 'Calibration lecture for structured intellectual speaking. The five selected clips train story, contrast, analogy, escalation, and qualification rather than pronunciation alone.',
  focus: ['Story', 'Contrast', 'Analogy', 'Escalation', 'Qualification', 'Thinking aloud'], status: 'ready',
  segments: [
    segment('JBN-001', 129, 218, 'Story · ambition → failure → philosophical turn'),
    segment('JBN-002', 1514, 1621, 'Contrast · good/bad vs good/evil'),
    segment('JBN-003', 1705, 1807, 'Performance · no-sayer → yes-sayer → vivid analogy'),
    segment('JBN-004', 2441, 2654, 'Analogy · lambs, birds of prey, and free will'),
    segment('JBN-005', 4857, 5034, 'Qualification · psychological explanation ≠ disproof'),
  ],
}

const auditedSources: CuratedCollection[] = [
  pipelineSource('johnathan-bi-plato-symposium', 'Plato · Symposium', 'Timing blocked. Exact solo source is verified and the lecture has been audited, but the available transcript/timebase is not precise enough to publish sentence-level shadowing boundaries yet.', ['Timing blocked', 'Dating', 'Love', 'Contrast'], { videoId: 'GNbrYMvwbWw', videoTitle: "Everybody Gets This Wrong in Modern Dating | Plato's Symposium Explained", duration: 5794, status: 'curating' }),
  pipelineSource('johnathan-bi-marcus-aurelius', 'Marcus Aurelius · Meditations', 'Timing blocked. The full lecture was scanned and strong candidates are preserved, but the recovered playback map uses coarse bins that repeatedly cut mid-sentence.', ['Timing blocked', 'Stoicism', 'Reframing', 'Story'], { videoId: 'KMwxrXNafK0', videoTitle: "Think Like a Philosopher King | Stoic Wisdom from Marcus Aurelius' Meditations", duration: 4890, status: 'curating' }),
  pipelineSource('johnathan-bi-rousseau-first-discourse', 'Rousseau · First Discourse', 'Timing blocked. Source identity and macro argument are verified; exact natural sentence endpoints are still not dependable enough for practice promotion.', ['Timing blocked', 'Rousseau', 'Argument', 'Provocation'], { videoId: 'C8ucJ29O1kM', videoTitle: "How Intellectuals Poison Society | Rousseau's First Discourse Explained", duration: 6093, status: 'curating' }),
  pipelineSource('johnathan-bi-rousseau-second-discourse', 'Rousseau · Second Discourse', 'Timing blocked. The lecture was audited and its strongest structural regions were identified, but a trustworthy sentence-level playback map is still missing.', ['Timing blocked', 'Rousseau', 'Inequality', 'Explanation'], { duration: 6329, status: 'curating' }),
  pipelineSource('johnathan-bi-machiavelli-danger', 'Machiavelli · You Need More Danger In Your Life', 'Timing blocked. Official solo source and chapter architecture are verified; exact sentence endpoints still need a dependable transcript timebase.', ['Timing blocked', 'Machiavelli', 'Violence', 'Reframe'], { videoId: 'W5EeZ4i73IM', videoTitle: 'You Need More Danger In Your Life | Machiavelli Explained', duration: 3029, status: 'curating' }),
  pipelineSource('johnathan-bi-odyssey-one-sentence', 'The Odyssey · This One Sentence Explains the Entire Odyssey', 'Timing blocked. Strong early candidates are timestamped, but the complete lecture could not be ranked against a full synchronized transcript, so nothing is promoted prematurely.', ['Timing blocked', 'Odyssey', 'Synthesis', 'Story'], { videoId: 'Wm6Yod-hsM0', videoTitle: 'This One Sentence Explains the Entire Odyssey', duration: 1775, status: 'curating' }),
  pipelineSource('johnathan-bi-tocqueville-religion', 'Tocqueville · Religion', 'Timing blocked. The religion lecture is verified and its opening contains a strong story → comic escalation → conceptual setup, but the complete timed transcript is not yet recoverable.', ['Timing blocked', 'Tocqueville', 'Religion', 'Story'], { videoId: 'NlYxwfxK1NI', videoTitle: "America's War on Christianity | Tocqueville on Religion", duration: 5410, status: 'curating' }),
  pipelineSource('johnathan-bi-frankenstein', 'Frankenstein · Your Face Shapes Your Destiny', 'Timing blocked. Official animated solo essay verified. The opening is rhetorically strong, but the complete timed transcript is unavailable, so the full source cannot yet be ranked honestly.', ['Timing blocked', 'Frankenstein', 'Escalation', 'Thesis'], { videoId: 'tkdBMnIIfx8', videoTitle: "Your Face Shapes Your Destiny | Shelley's Frankenstein Explained", duration: 1127, status: 'curating' }),
  pipelineSource('johnathan-bi-tocqueville-democracy', 'Tocqueville · Democracy', 'Timing blocked. Exact solo lecture verified: Democracy with American Characteristics, delivered at the Chateau de Tocqueville. Official prose reveals a strong equality → autobiographical inversion → cross-country contrast → aphoristic synthesis → Rome analogy → mixed-regime reframe, but the full transcript is paywalled and no complete sentence-level playback map is recoverable yet.', ['Timing blocked', 'Tocqueville', 'Democracy', 'Contrast', 'Synthesis'], { videoId: 'XjhLQYGOmks', videoTitle: "Democracy with American Characteristics | Tocqueville on America's Industrial Aristocracy", duration: 6001, status: 'curating' }),
]

const unresolvedSources: CuratedCollection[] = [
  pipelineSource('johnathan-bi-cost-of-philosophy', 'The Cost of Philosophy', 'Source unresolved. The original queue shorthand has not yet been mapped to one unique solo Johnathan Bi source; thematically similar interview material is intentionally excluded.', ['Source unresolved', 'Philosophy']),
  pipelineSource('johnathan-bi-knowledge-sex', 'Knowledge / Sex', 'Source unresolved. Plausible matches scatter across Rousseau, Plato, and interview material; no single primary solo source is defensible yet.', ['Source unresolved', 'Knowledge', 'Desire']),
  pipelineSource('johnathan-bi-last-man', 'Nietzsche · The Last Man', 'Source unresolved. “Last Man” appears inside the already-curated Nietzsche material, but no distinct planned solo lecture has been uniquely identified.', ['Source unresolved', 'Nietzsche']),
  pipelineSource('johnathan-bi-great-thinkers', 'Great Thinkers', 'Source unresolved. The phrase is generic across Johnathan’s project and guest material; no unique standalone solo lecture has been recovered.', ['Source unresolved', 'Great Books']),
]

const plannedSources: CuratedCollection[] = [
  pipelineSource('johnathan-bi-machiavelli-power', 'Machiavelli · Power / Violence', 'Planned solo Machiavelli material. Keep separate from the already-audited danger lecture until the exact inventory mapping is resolved.', ['Queued', 'Machiavelli', 'Power']),
  pipelineSource('johnathan-bi-julius-caesar', 'Shakespeare · Julius Caesar', 'Planned solo lecture for storytelling, political argument, and dramatic explanation.', ['Queued', 'Shakespeare', 'Storytelling']),
  pipelineSource('johnathan-bi-stoicism', 'This Drove Me Away from Stoicism', 'Planned solo source. Awaiting full-source audit and exact clip-boundary verification.', ['Queued', 'Stoicism', 'Critique']),
  pipelineSource('johnathan-bi-criticism', 'How to Handle Criticism · A Philosopher’s Guide', 'Planned compact solo source. Awaiting full-source audit and exact clip-boundary verification.', ['Queued', 'Criticism', 'Practical rhetoric']),
  pipelineSource('johnathan-bi-socrates-books', 'Why Socrates Hated Books', 'Planned solo source on books, education, and AI. Awaiting full-source audit.', ['Queued', 'Socrates', 'Books', 'AI']),
  pipelineSource('johnathan-bi-machiavelli-food', 'Philosophy as Food · My Favorite Machiavellian Idea', 'Planned compact solo source. Awaiting full-source audit.', ['Queued', 'Machiavelli', 'Analogy']),
  pipelineSource('johnathan-bi-nietzsche-hikes-place', 'Nietzsche · Hikes / Place', 'Planned Nietzsche short-form solo material on place, movement, and ideas. Awaiting exact source mapping and audit.', ['Queued', 'Nietzsche', 'Place']),
  pipelineSource('johnathan-bi-plato-innovation', 'Plato · Innovation', 'Planned solo lecture. Awaiting full-source audit and clip extraction.', ['Queued', 'Plato', 'Innovation']),
  pipelineSource('johnathan-bi-thinker-doer', 'How To Be a Thinker & a Doer At The Same Time', 'Planned solo source for intellectual-to-practical transitions and structured argument.', ['Queued', 'Thinking', 'Action']),
  pipelineSource('johnathan-bi-ai', 'AI · Solo Essays', 'Planned AI solo-essay cluster. Individual sources will be split as they are audited rather than collapsed into one practice source.', ['Queued', 'AI', 'Career', 'Education']),
  pipelineSource('johnathan-bi-language-learning', 'The Renaissance Method for Language Learning', 'Planned compact solo source. Awaiting full-source audit and clip extraction.', ['Queued', 'Language learning', 'Method']),
  pipelineSource('johnathan-bi-odysseus', 'Odysseus / Odyssey', 'Planned Odyssey solo material beyond the already-audited one-sentence essay. Awaiting exact source mapping and audit.', ['Queued', 'Odyssey', 'Story']),
  pipelineSource('johnathan-bi-philosopher-trap', 'The Philosopher’s Trap · Reason Won’t Solve Your Life', 'Planned long-form solo source. Awaiting full-source audit and clip extraction.', ['Queued', 'Philosophy', 'Reason', 'Qualification']),
]

export const JOHNATHAN_BI_SPEAKER: CuratedSpeaker = {
  id: 'johnathan-bi', name: 'Johnathan Bi',
  description: 'Structured philosophical speaking: turn difficult ideas into clear spoken thought through story, contrast, analogy, escalation, and precise qualification. The full research pipeline is visible here; only exact, defensible clips graduate into practice.',
  focus: ['Storytelling', 'Contrast', 'Analogy', 'Argument', 'Qualification', 'Intellectual English'],
  portrait: 'https://yt3.googleusercontent.com/5l1X2fpJR7uB2iaXfl7OQuOzQ1NSPFzQGfLRIW1HAO46zYGO_jveE8XUhT5cC63YTQvxW3kGuQ=s900-c-k-c0x00ffffff-no-rj',
  sources: [nietzscheGenealogy, ...auditedSources, ...unresolvedSources, ...plannedSources],
}

export const JOHNATHAN_BI_COLLECTIONS: CuratedCollection[] = JOHNATHAN_BI_SPEAKER.sources.filter(source => source.status === 'ready')

export function getJohnathanBiSpeaker(id: string | null | undefined): CuratedSpeaker | null {
  if (!id) return null
  return id === JOHNATHAN_BI_SPEAKER.id ? JOHNATHAN_BI_SPEAKER : null
}

export function getJohnathanBiCollection(id: string | null | undefined): CuratedCollection | null {
  if (!id) return null
  return JOHNATHAN_BI_COLLECTIONS.find(collection => collection.id === id) || null
}

import type { Segment } from './types'
import type { CuratedCollection, CuratedSourceStatus, CuratedSpeaker } from './curated-library'

type LectureSpec = [string, string, string, number, CuratedSourceStatus]

const segment = (id: string, start: number, end: number, label: string): Segment => ({
  id, start, end, label, lines: [], createdAt: 0,
})

const SEGMENTS: Record<string, Segment[]> = {
  'intro-01': [
    segment('JS-001', 74, 136, 'Course framing · historical figures serve the issues, not the reverse'),
    segment('JS-002', 136, 206, 'Audience diagnosis · ask what students expect before supplying the definition'),
    segment('JS-003', 332, 393, 'Problem construction · one word across many domains creates the puzzle'),
    segment('JS-004', 393, 509, 'Counterexample · use the PhD title to break an easy definition'),
    segment('JS-005', 547, 647, 'Ordinary language → puzzle · “good in theory” becomes a reasoning test'),
    segment('JS-006', 709, 807, 'Definition earned · philosophy begins where clear facts run out'),
    segment('JS-007', 807, 903, 'Self-critique · give a working definition, then immediately pressure-test it'),
  ],
  'science-03': [
    segment('JS-008', 1, 123, 'Continuity · old view → problem → Popper → new view → clarification'),
    segment('JS-009', 123, 220, 'Clarification · a student’s usage exposes ambiguity in “verify”'),
    segment('JS-010', 220, 293, 'Distinction · necessary is not sufficient'),
    segment('JS-011', 293, 384, 'Question handling · defer the challenge until the coming example can answer it'),
    segment('JS-012', 384, 489, 'Epistemic humility · state what you do not know without losing the conceptual thread'),
    segment('JS-013', 489, 556, 'Method visibility · theory first, then ask how it could be tested'),
  ],
  'logic-01': [
    segment('JS-014', 45, 124, 'Audience diagnosis · begin technical logic by asking what philosophy is'),
    segment('JS-015', 124, 166, 'Refinement · questions matter, but philosophy also tries to answer them'),
    segment('JS-016', 166, 252, 'Candidate definitions · arguments, etymology, then a wider everyday usage'),
    segment('JS-017', 252, 353, 'Pressure test · make “philosophy of life” fit the proposed framework'),
    segment('JS-018', 353, 432, 'Counterexample · the PhD title forces a broader account of philosophy'),
  ],
  'social-04': [
    segment('JS-019', 61, 136, 'Continuity + context · carry Aristotle forward, then locate Hobbes in 17th-century England'),
    segment('JS-020', 220, 273, 'Compression · classify governments by who rules and whose interests they serve'),
    segment('JS-021', 273, 342, 'Ideal vs practical · let circumstances complicate the clean taxonomy'),
    segment('JS-022', 342, 405, 'Counterfactual · an extreme case makes monarchy temporarily feel inevitable'),
    segment('JS-023', 405, 481, 'Refinement · move from the godlike ideal to realistic group wisdom'),
    segment('JS-024', 481, 527, 'Interpretation · state a reading clearly while admitting the editors disagree'),
  ],
}

const SPECS: LectureSpec[] = [
  ['intro-01', 'tY2njfpWC8g', 'Introduction to Philosophy Lecture #1: Introduction', 5230, 'ready'],
  ['intro-02', 'pG1pGGGDs6M', 'Introduction to Philosophy Lecture #2: Political and Social Philosophy - Plato, Part I', 7111, 'queued'],
  ['intro-03', '5LQzMlX-rMY', 'Introduction to Philosophy Lecture #3: Ethics, Epistemology, & Logic - Plato, Part II', 4809, 'queued'],
  ['intro-04', 'dxEn9SUnkpw', 'Introduction to Philosophy Lecture #4: Metaphysics & Philosophy of Science - Aristotle', 3116, 'queued'],
  ['intro-05', '8f-QrB2lEzs', 'Introduction to Philosophy Lecture #5: Philosophy of Religion & Logic - The Ontological Argument', 7021, 'queued'],
  ['intro-06', 'q-brjiXMzR4', 'Introduction to Philosophy Lecture #6: Philosophy of Religion/Logic - Cosmological/Teleological Arguments', 6303, 'queued'],
  ['intro-07', 'V3yW4MtD1DQ', 'Introduction to Philosophy Lecture #7: Epistemology & Philosophy of Science - Descartes', 5115, 'queued'],
  ['intro-08', 'BweGI6TK5pQ', 'Introduction to Philosophy Lecture #8: Epistemology & Logic - Rationalism versus Empiricism', 4829, 'queued'],
  ['intro-09', 'xf_AAcBmifQ', 'Introduction to Philosophy Lecture #9: The Problem of Personal Identity', 6954, 'curating'],
  ['intro-10', '9aohi2p_Ruw', 'Introduction to Philosophy Lecture #10: Conclusion', 2880, 'queued'],
  ['science-01', 'SINmPJsfqCA', 'Philosophy of Science Lecture #1: Introduction', 2987, 'queued'],
  ['science-02', 'X0XuAzL7ES4', 'Philosophy of Science Lecture #2: Verificationism', 2814, 'queued'],
  ['science-03', 'mOOFYZWAdhA', 'Philosophy of Science Lecture #3: Falsificationism', 3509, 'ready'],
  ['science-04', 'y9YxLoxI30c', 'Philosophy of Science Lecture #4: Normal and Revolutionary Science', 0, 'queued'],
  ['science-05', 'aGJN9Ra4-ts', 'Philosophy of Science Lecture #5: Scientific Research Programs', 0, 'queued'],
  ['science-06', 'RgwRVUmAVKM', 'Philosophy of Science Lecture #6: Constructivism', 0, 'queued'],
  ['science-07', 'WnxeUXoV4T4', 'Philosophy of Science Lecture #7: Realism and Conventionalism', 0, 'queued'],
  ['science-08', '5-be4lH1_PI', 'Philosophy of Science Lecture #8: Scientific Explanation', 0, 'queued'],
  ['science-09', 'A2dJsYkzPZY', 'Philosophy of Science Lecture #9: The Strange Case of Quantum Theory', 0, 'queued'],
  ['science-10', 'Kr9792nXmHM', 'Philosophy of Science Lecture #10: Science and Value Judgments', 0, 'queued'],
  ['science-11', 'Oc3VtmVsgDE', 'Philosophy of Science Lecture #11: Conclusion', 0, 'queued'],
  ['ethics-01', 'pE5E3YkEyYY', 'Professional Ethics Lecture #1: Introduction', 3585, 'queued'],
  ['ethics-02', 'Xizm5JAuHWY', 'Professional Ethics Lecture #2: Ethical Theory, Part I', 4552, 'queued'],
  ['ethics-03', 'UtPU7D0TDJs', 'Professional Ethics Lecture #3: Ethical Theory, Part II', 4739, 'queued'],
  ['ethics-04', 'vBcc5avuTyg', 'Professional Ethics Lecture #4: Varieties of Professional Standards', 3919, 'queued'],
  ['ethics-05', 'lttpXTsDsAk', 'Professional Ethics Lecture #5: Professional Standards from the Inside, Part I', 2667, 'queued'],
  ['ethics-06', 'duz9joEaTv8', 'Professional Ethics Lecture #6: Professional Standards from the Inside, Part II', 2925, 'queued'],
  ['ethics-07', 'ZXFpqsqq9_k', 'Professional Ethics Lecture #7: Ethical Character in Professional Settings', 3617, 'queued'],
  ['ethics-08', 'Tc_VnYsnjTk', 'Professional Ethics Lecture #8: Institutional Traps, Part I', 4249, 'curating'],
  ['ethics-09', 'tOczpMwy_oY', 'Professional Ethics Lecture #9: Institutional Traps, Part II', 2799, 'queued'],
  ['ethics-10', 'JIQpjmXJJFg', 'Professional Ethics Lecture #10: Conclusion', 1987, 'queued'],
  ['social-01', 'Q5Cn8vjAhYE', 'Social and Political Philosophy Lecture #1: Introduction', 2977, 'queued'],
  ['social-02', '8RnQyE0WCsE', 'Social and Political Philosophy Lecture #2: Plato', 5289, 'queued'],
  ['social-03', 'GwEXJwCu8Xg', 'Social and Political Philosophy Lecture #3: Aristotle', 5252, 'queued'],
  ['social-04', 'LQm-s2vzsdw', 'Social and Political Philosophy Lecture #4: Thomas Hobbes', 5080, 'ready'],
  ['social-05', 'EqAiU4f_YOg', 'Social and Political Philosophy Lecture #5: John Locke', 5870, 'queued'],
  ['social-06', 'SP96yGHzW7s', 'Social and Political Philosophy Lecture #6: John Stuart Mill', 5259, 'queued'],
  ['social-07', 'nt_961GRNhM', 'Social and Political Philosophy Lecture #7: Karl Marx & Friedrich Engels', 5117, 'queued'],
  ['social-08', 'BA8RrrBexsI', 'Social and Political Philosophy Lecture #8: Friedrich Hayek', 5504, 'queued'],
  ['social-09', 'P_PF5EAnN9E', 'Social and Political Philosophy Lecture #9: John Rawls', 4618, 'queued'],
  ['social-10', 'MLMgJQ6frqw', 'Social and Political Philosophy Lecture #10: Conclusion', 4556, 'queued'],
  ['logic-01', 'ExE8ucCfmH0', 'Symbolic Logic Lecture #1: Basic Concepts of Logic', 4150, 'ready'],
  ['logic-02', 'gMGVS3aUu4A', 'Symbolic Logic Lecture #2: An Introduction to Sentence Logic', 3892, 'queued'],
  ['logic-03', 'EuLb5XrBR-I', 'Symbolic Logic Lecture #3: SL, Truth Tables and the Concepts of Logic', 5243, 'queued'],
  ['logic-04', 'HBgdj7Lk0aY', 'Symbolic Logic Lecture #4: Symbolization in SL', 2596, 'queued'],
  ['logic-05', 'l2KfqpN_xJ8', 'Symbolic Logic Lecture #5: Derivations in SL, part I', 2688, 'queued'],
  ['logic-06', 'gqaFBRciojM', 'Symbolic Logic Lecture #6: Derivations in SL, part II', 4275, 'queued'],
  ['logic-07', '7gneVqf0ROM', 'Symbolic Logic Lecture #7: Derivations in SL, part III', 2946, 'queued'],
  ['logic-08', 'zt0l3PcPDZw', 'Symbolic Logic Lecture #8: Predicate Logic; an introduction to PL', 1754, 'queued'],
  ['logic-09', 'PQkb9jGjSs8', 'Symbolic Logic Lecture #9: Predicate Logic Semantics and Symbolization', 2471, 'queued'],
  ['logic-10', 'tz4geNAmBn0', 'Symbolic Logic Lecture #10: Derivations for Predicate Logic, Part I', 3380, 'queued'],
  ['logic-11', 'GIfjLG1xEMY', 'Symbolic Logic Lecture #11: Derivations for Predicate Logic, Part II', 2070, 'queued'],
  ['logic-12', 'KcyXdqMblZE', 'Symbolic Logic Lecture #12: Derivations for Predicate Logic, Part III', 3660, 'queued'],
  ['logic-13', 'CQiLh1-VlyM', 'Symbolic Logic Lecture #13: Predicate Logic with Identity, Part I', 3026, 'queued'],
  ['logic-14', 'CIk0HRw86tE', 'Symbolic Logic Lecture #14: Predicate Logic with Identity, Part II', 1934, 'queued'],
  ['logic-15', 'RYXv1ZPDWAE', 'Symbolic Logic Lecture #15: Conclusion', 2588, 'queued'],
]

const focusFor = (slug: string): string[] => {
  if (slug.startsWith('science-')) return ['Lecture architecture', 'Problem construction', 'Qualification', 'Scientific reasoning']
  if (slug.startsWith('logic-')) return ['Technical teaching', 'Definition', 'Counterexample', 'Reasoning']
  if (slug.startsWith('ethics-')) return ['Applied reasoning', 'Cases', 'Institutional thinking', 'Qualification']
  if (slug.startsWith('social-')) return ['Historical reconstruction', 'Argument', 'Context', 'Objection']
  return ['Lecture architecture', 'Question construction', 'Definition', 'Thinking aloud']
}

const sources: CuratedCollection[] = SPECS.map(([slug, videoId, title, duration, status]) => ({
  id: `jack-sanders-${slug}`,
  speakerId: 'jack-sanders',
  speaker: 'Jack Sanders',
  sourceTitle: title,
  videoId,
  videoTitle: title,
  channelName: 'Jack Sanders',
  thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  duration,
  description: status === 'ready'
    ? 'Transcript-audited lecture clips selected for reusable teaching moves rather than quotable lines.'
    : 'Part of the complete 56-lecture Sanders corpus. Kept out of practice until selected boundaries pass transcript audit.',
  focus: focusFor(slug),
  status,
  segments: SEGMENTS[slug] || [],
}))

// Integrity rule: “ready” means timestamped caption text was inspected at every selected boundary.
// No inferred timestamps. No clip is promoted because a remembered moment merely sounds good.

export const JACK_SANDERS_SPEAKER: CuratedSpeaker = {
  id: 'jack-sanders',
  name: 'Jack Sanders',
  description: 'Lecture architecture study: make an idea intellectually necessary, then walk the room through the reasoning that earns it. Study questions, counterexamples, clarification, qualification, examples, and visible self-correction.',
  focus: ['Lecture architecture', 'Question construction', 'Clarification', 'Counterexample', 'Qualification', 'Thinking aloud'],
  portrait: 'https://i.ytimg.com/vi/tY2njfpWC8g/hqdefault.jpg',
  sources,
}

export const JACK_SANDERS_COLLECTIONS: CuratedCollection[] = sources.filter(source => source.status === 'ready')

export function getJackSandersSpeaker(id: string | null | undefined): CuratedSpeaker | null {
  if (!id) return null
  return id === JACK_SANDERS_SPEAKER.id ? JACK_SANDERS_SPEAKER : null
}

export function getJackSandersCollection(id: string | null | undefined): CuratedCollection | null {
  if (!id) return null
  return JACK_SANDERS_COLLECTIONS.find(collection => collection.id === id) || null
}

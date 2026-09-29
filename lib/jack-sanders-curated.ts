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
  'ethics-08': [
    segment('JS-025', 90, 207, 'Continuity → problem · compress prior material into the complexity virtue ethics must solve'),
    segment('JS-026', 207, 297, 'Analogy · ethical character begins like learning an embodied skill'),
    segment('JS-027', 405, 509, 'Analogy with error bars · expertise still needs a scientist’s readiness to be wrong'),
    segment('JS-028', 522, 639, 'Question repair · theory is guidance for the novice, not a substitute for practiced judgment'),
    segment('JS-029', 752, 805, 'Epistemic seam · name an unargued presumption and invite the room to test it'),
    segment('JS-030', 812, 887, 'Steelman · concede that professional settings can sharply constrain choice'),
    segment('JS-031', 887, 945, 'Qualification · institutional traps are real, but they are not every case'),
    segment('JS-032', 1243, 1329, 'Thought experiment · make freedom concrete with a gun-to-the-head choice'),
    segment('JS-033', 1329, 1444, 'Context shift · the same choice can be abstractly free and practically forced'),
    segment('JS-034', 1444, 1503, 'Return to application · map the thought experiment back onto whistleblowing'),
  ],
  'intro-09': [
    segment('JS-035', 75, 122, 'Plain-language framing · translate “personal identity” into the question “what kind of thing is a person?”'),
    segment('JS-036', 122, 179, 'First attempted model · make mentalism concrete with the driver-and-vehicle picture'),
    segment('JS-037', 179, 244, 'Intuition before theory · begin from first-person experience of the self'),
    segment('JS-038', 244, 312, 'Consequence tracing · let the inner-self intuition open into a soul/body distinction'),
    segment('JS-039', 374, 469, 'Audience objection · animals pressure-test the soul model and expose boundary choices'),
  ],
  'science-08': [
    segment('JS-040', 89, 150, 'Problem framing · ask what an explanation is, not merely whether a particular explanation is correct'),
    segment('JS-041', 150, 185, 'Roadmap · models first, problems second, causation as a live issue'),
    segment('JS-042', 185, 255, 'Historical scaffold · Aristotle’s four causes become an old map for a current problem'),
    segment('JS-043', 255, 294, 'Term repair · explain why Aristotle’s “cause” is broader than ordinary English'),
    segment('JS-044', 294, 367, 'Concrete unpacking · turn material cause into the plain question “what is it made of?”'),
    segment('JS-045', 406, 513, 'Continuity across science · elements → atoms → particles → quarks while preserving the same explanatory question'),
  ],
  'logic-05': [
    segment('JS-046', 3, 98, 'Purpose before procedure · tools become useful only when they enter actual reasoning'),
    segment('JS-047', 128, 202, 'Smallest solvable case · start with a derivation whose answer feels obvious, then formalize it'),
    segment('JS-048', 202, 273, 'Rule anatomy · state exactly which lines a rule licenses and why'),
    segment('JS-049', 273, 307, 'Worked move · write the justification beside the inference'),
    segment('JS-050', 307, 368, 'Rule family · pair elimination with introduction'),
    segment('JS-051', 434, 474, 'One-step rigor · slow obvious reasoning down before releasing learners to practice'),
  ],
  'social-06': [
    segment('JS-052', 29, 108, 'Retrieval bridge · reconstruct Locke before moving on'),
    segment('JS-053', 108, 189, 'Productive puzzle · if Locke’s state of nature is pleasant, why leave it?'),
    segment('JS-054', 189, 269, 'Audience reconstruction · recover missing defects through questions and term clarification'),
    segment('JS-055', 269, 352, 'Naturalize the theory · derive Locke’s law of nature from ordinary facts about human needs'),
    segment('JS-056', 352, 418, 'Separate scaffolds · distinguish theological grounding from the argument that survives without it'),
    segment('JS-057', 418, 480, 'Conflict without villainy · show how honest people can disagree because each sees from inside the case'),
  ],
  'intro-06': [
    segment('JS-058', 76, 110, 'Hidden curriculum · make logic explicit beneath the philosophy-of-religion topic'),
    segment('JS-059', 110, 152, 'Bridge by surprise · a false proof of 2=1 turns proof itself into the object of study'),
    segment('JS-060', 152, 221, 'Construct the trap · make each algebraic step look legitimate'),
    segment('JS-061', 221, 293, 'Complete the trap · reach the absurd conclusion before explaining the failure'),
    segment('JS-062', 293, 362, 'Argument audit · test assumptions separately from inferential steps'),
    segment('JS-063', 362, 429, 'Protect discovery · ask students who know the trick to stay quiet so others can diagnose'),
    segment('JS-064', 429, 464, 'Push past partial diagnosis · accept a true observation, then ask where the actual invalid move occurs'),
  ],
  'science-10': [
    segment('JS-065', 91, 124, 'Question framing · value-free science as both a factual and a normative problem'),
    segment('JS-066', 124, 191, 'Observer problem · measurement itself becomes interaction at quantum scale'),
    segment('JS-067', 191, 261, 'Definition through impossibility · objectivity as standing back, then show why that fails'),
    segment('JS-068', 261, 324, 'Vivid model · photons and electrons make observer-dependence physically intuitive'),
    segment('JS-069', 324, 436, 'Scope control · separate strict objectivity from value judgments, then reopen the values question'),
  ],
  'ethics-09': [
    segment('JS-070', 89, 133, 'Retrieval opening · have students restate institutional traps before adding anything new'),
    segment('JS-071', 133, 214, 'Moral relevance · connect forced decisions to the danger of judging from outside'),
    segment('JS-072', 214, 303, 'Adversarial teaching · ask students to find what is dangerous about the concept itself'),
    segment('JS-073', 303, 378, 'Burden of proof · concede the excuse risk and require support for any “forced decision” claim'),
    segment('JS-074', 378, 466, 'Bigger frame · turn a professional-ethics case into genes/environment versus self-making'),
    segment('JS-075', 466, 557, 'Learner judgment · let a student choose a side, then sharpen what that commitment entails'),
  ],
  'social-09': [
    segment('JS-076', 45, 110, 'Pedagogical transparency · admit the Hayek/Rawls pairing is a constructed teaching contrast'),
    segment('JS-077', 110, 183, 'Steelman before critique · reconstruct Hayek as attacking socialist means, not socialist ends'),
    segment('JS-078', 183, 287, 'Mechanism · show why price signals matter before stating the ideological conclusion'),
    segment('JS-079', 287, 357, 'Strongest rival claim · capitalism must be presented as benefiting everyone, including the poor'),
    segment('JS-080', 357, 400, 'Foil construction · Rawls turns the rival’s promise into a testable criterion'),
    segment('JS-081', 400, 466, 'Empirical turn · make institutional choice depend on what actually happens to the least advantaged'),
  ],
  'logic-02': [
    segment('JS-082', 123, 198, 'Retrieval correction · ask for validity, repair a nearly-right answer, then state the exact definition'),
    segment('JS-083', 198, 275, 'Contrast · validity versus soundness before introducing new machinery'),
    segment('JS-084', 275, 349, 'Term boundary · “sentence” means truth-evaluable assertion, not every grammatical sentence'),
    segment('JS-085', 349, 415, 'Purpose of rigor · rules are shortcuts only after their validity is earned'),
    segment('JS-086', 415, 461, 'Recursive build · start from simple structures and grow complexity from the ground up'),
  ],
}

const SPECS: LectureSpec[] = [
  ['intro-01', 'tY2njfpWC8g', 'Introduction to Philosophy Lecture #1: Introduction', 5230, 'ready'],
  ['intro-02', 'pG1pGGGDs6M', 'Introduction to Philosophy Lecture #2: Political and Social Philosophy - Plato, Part I', 7111, 'queued'],
  ['intro-03', '5LQzMlX-rMY', 'Introduction to Philosophy Lecture #3: Ethics, Epistemology, & Logic - Plato, Part II', 4809, 'queued'],
  ['intro-04', 'dxEn9SUnkpw', 'Introduction to Philosophy Lecture #4: Metaphysics & Philosophy of Science - Aristotle', 3116, 'queued'],
  ['intro-05', '8f-QrB2lEzs', 'Introduction to Philosophy Lecture #5: Philosophy of Religion & Logic - The Ontological Argument', 7021, 'queued'],
  ['intro-06', 'q-brjiXMzR4', 'Introduction to Philosophy Lecture #6: Philosophy of Religion/Logic - Cosmological/Teleological Arguments', 6303, 'ready'],
  ['intro-07', 'V3yW4MtD1DQ', 'Introduction to Philosophy Lecture #7: Epistemology & Philosophy of Science - Descartes', 5115, 'queued'],
  ['intro-08', 'BweGI6TK5pQ', 'Introduction to Philosophy Lecture #8: Epistemology & Logic - Rationalism versus Empiricism', 4829, 'queued'],
  ['intro-09', 'xf_AAcBmifQ', 'Introduction to Philosophy Lecture #9: The Problem of Personal Identity', 6954, 'ready'],
  ['intro-10', '9aohi2p_Ruw', 'Introduction to Philosophy Lecture #10: Conclusion', 2880, 'queued'],
  ['science-01', 'SINmPJsfqCA', 'Philosophy of Science Lecture #1: Introduction', 2987, 'queued'],
  ['science-02', 'X0XuAzL7ES4', 'Philosophy of Science Lecture #2: Verificationism', 2814, 'queued'],
  ['science-03', 'mOOFYZWAdhA', 'Philosophy of Science Lecture #3: Falsificationism', 3509, 'ready'],
  ['science-04', 'y9YxLoxI30c', 'Philosophy of Science Lecture #4: Normal and Revolutionary Science', 0, 'queued'],
  ['science-05', 'aGJN9Ra4-ts', 'Philosophy of Science Lecture #5: Scientific Research Programs', 0, 'queued'],
  ['science-06', 'RgwRVUmAVKM', 'Philosophy of Science Lecture #6: Constructivism', 0, 'queued'],
  ['science-07', 'WnxeUXoV4T4', 'Philosophy of Science Lecture #7: Realism and Conventionalism', 0, 'queued'],
  ['science-08', '5-be4lH1_PI', 'Philosophy of Science Lecture #8: Scientific Explanation', 0, 'ready'],
  ['science-09', 'A2dJsYkzPZY', 'Philosophy of Science Lecture #9: The Strange Case of Quantum Theory', 0, 'queued'],
  ['science-10', 'Kr9792nXmHM', 'Philosophy of Science Lecture #10: Science and Value Judgments', 0, 'ready'],
  ['science-11', 'Oc3VtmVsgDE', 'Philosophy of Science Lecture #11: Conclusion', 0, 'queued'],
  ['ethics-01', 'pE5E3YkEyYY', 'Professional Ethics Lecture #1: Introduction', 3585, 'queued'],
  ['ethics-02', 'Xizm5JAuHWY', 'Professional Ethics Lecture #2: Ethical Theory, Part I', 4552, 'queued'],
  ['ethics-03', 'UtPU7D0TDJs', 'Professional Ethics Lecture #3: Ethical Theory, Part II', 4739, 'queued'],
  ['ethics-04', 'vBcc5avuTyg', 'Professional Ethics Lecture #4: Varieties of Professional Standards', 3919, 'queued'],
  ['ethics-05', 'lttpXTsDsAk', 'Professional Ethics Lecture #5: Professional Standards from the Inside, Part I', 2667, 'queued'],
  ['ethics-06', 'duz9joEaTv8', 'Professional Ethics Lecture #6: Professional Standards from the Inside, Part II', 2925, 'queued'],
  ['ethics-07', 'ZXFpqsqq9_k', 'Professional Ethics Lecture #7: Ethical Character in Professional Settings', 3617, 'queued'],
  ['ethics-08', 'Tc_VnYsnjTk', 'Professional Ethics Lecture #8: Institutional Traps, Part I', 4249, 'ready'],
  ['ethics-09', 'tOczpMwy_oY', 'Professional Ethics Lecture #9: Institutional Traps, Part II', 2799, 'ready'],
  ['ethics-10', 'JIQpjmXJJFg', 'Professional Ethics Lecture #10: Conclusion', 1987, 'queued'],
  ['social-01', 'Q5Cn8vjAhYE', 'Social and Political Philosophy Lecture #1: Introduction', 2977, 'queued'],
  ['social-02', '8RnQyE0WCsE', 'Social and Political Philosophy Lecture #2: Plato', 5289, 'queued'],
  ['social-03', 'GwEXJwCu8Xg', 'Social and Political Philosophy Lecture #3: Aristotle', 5252, 'queued'],
  ['social-04', 'LQm-s2vzsdw', 'Social and Political Philosophy Lecture #4: Thomas Hobbes', 5080, 'ready'],
  ['social-05', 'EqAiU4f_YOg', 'Social and Political Philosophy Lecture #5: John Locke', 5870, 'queued'],
  ['social-06', 'SP96yGHzW7s', 'Social and Political Philosophy Lecture #6: John Stuart Mill', 5259, 'ready'],
  ['social-07', 'nt_961GRNhM', 'Social and Political Philosophy Lecture #7: Karl Marx & Friedrich Engels', 5117, 'queued'],
  ['social-08', 'BA8RrrBexsI', 'Social and Political Philosophy Lecture #8: Friedrich Hayek', 5504, 'queued'],
  ['social-09', 'P_PF5EAnN9E', 'Social and Political Philosophy Lecture #9: John Rawls', 4618, 'ready'],
  ['social-10', 'MLMgJQ6frqw', 'Social and Political Philosophy Lecture #10: Conclusion', 4556, 'queued'],
  ['logic-01', 'ExE8ucCfmH0', 'Symbolic Logic Lecture #1: Basic Concepts of Logic', 4150, 'ready'],
  ['logic-02', 'gMGVS3aUu4A', 'Symbolic Logic Lecture #2: An Introduction to Sentence Logic', 3892, 'ready'],
  ['logic-03', 'EuLb5XrBR-I', 'Symbolic Logic Lecture #3: SL, Truth Tables and the Concepts of Logic', 5243, 'queued'],
  ['logic-04', 'HBgdj7Lk0aY', 'Symbolic Logic Lecture #4: Symbolization in SL', 2596, 'queued'],
  ['logic-05', 'l2KfqpN_xJ8', 'Symbolic Logic Lecture #5: Derivations in SL, part I', 2688, 'ready'],
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

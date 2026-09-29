# Johnathan Bi curation status

This file is the durable queue for the Artico Johnathan Bi shadowing corpus.

## Principle

**God is in the details.** Do not optimize for number of clips or speed. A mediocre segment does not become useful because it is easy to add.

The calibration source is **Masters vs. Slaves | Nietzsche's Genealogy of Morality Explained**. Its curation standard is the reference for every source that follows.

## Scope

Curate **solo Johnathan Bi lectures first**. Exclude interviews, Q&As, guest-heavy conversations, reaction content, and anything where Johnathan is not the sustained primary speaker. These can be reconsidered only after the solo-lecture corpus is complete.

Queue notation: `[x]` complete, `[-]` excluded by scope, `[!]` verified source but blocked from promotion because the exact transcript/playback timebase could not be established reliably in the current curation pass, `[ ]` pending.

## Clip standard

A promoted clip should usually be ~20–120 seconds and contain a complete trainable speaking move. Prefer exact boundaries over arbitrary transcript chunks.

Evaluate each candidate on:

1. **Structure** — a visible rhetorical move: story, contrast, definition, analogy, escalation, qualification, synthesis, reframe, objection/reply, strong ending, etc.
2. **Naturalness** — it sounds like real high-level spoken English, not a sentence that only works because of surrounding slides/context.
3. **Rhythm** — useful pacing, emphasis, pauses, sentence length variation, and oral architecture.
4. **Emotional variation** — enough tonal movement to train delivery when relevant.
5. **Reuse value** — the underlying speaking pattern can transfer to science lectures, explanation, argument, conversation, or public speaking.
6. **Self-containment** — a learner can repeatedly shadow the clip without needing several minutes of missing setup.
7. **Boundary quality** — start and end on natural thought boundaries. Do not cut mid-setup, mid-qualification, or before the landing.

Do not fabricate timestamps. If the transcript/timebase cannot be verified reliably, keep the source unpromoted and record the blocker here.

## Practice model

The intended learning loop is:

**Listen → Shadow → Reconstruct → Transfer**

We are training rhetorical machinery, not accent mimicry alone. **Shadow the move, not merely the mouth.**

## Queue

### S tier

- [x] Nietzsche Genealogy — Masters vs. Slaves / Genealogy of Morality. Calibration source. 5 clips live.
- [-] Don't Care What Others Think — excluded from the solo-lecture corpus. The identifiable source for this line is the *Discovering the Great Books* Young Heretics interview (Johnathan's point appears around 34:52–35:14), not a standalone solo lecture. Do not promote an interview excerpt while solo-only scope is active.
- [!] Plato — Symposium — official solo lecture verified as **Everybody Gets This Wrong in Modern Dating | Plato’s Symposium Explained** / **Embrace the Erotic | Plato's Symposium Explained**, YouTube ID `GNbrYMvwbWw`, published 2025-08-31, duration ~96:34. Johnathan's official page supplies the transcript prose and chapter anchors (2:05, 15:46, 18:59, 31:42, 33:45, 36:55, 50:59, 55:28), but the full official transcript is paywalled and the accessible transcript mirrors in this pass did not expose a trustworthy sentence-level timestamp map. Because exact natural clip boundaries cannot be verified without guessing, **0 clips promoted**. Revisit when a dependable timestamped transcript/playback surface is available.
- [!] Marcus Aurelius — official solo lecture verified as **Think Like a Philosopher King | Stoic Wisdom from Marcus Aurelius' Meditations** / **Introduction to Stoic Philosophy | Marcus Aurelius’ Meditations Explained**, YouTube ID `KMwxrXNafK0`, published 2025-01-16, duration ~81:30. Johnathan's official page confirms it is a solo Marcus Aurelius lecture and links the full transcript. A public transcript mirror was found and the **entire ~82-minute source was scanned** with a consistent 30-second playback map. Strong candidate regions include 5:00–6:30 (misconception → gentle-kiss reframe), 9:00–10:30 (common view of money → Marcus flips it), 20:30–21:30 (Greek schools as a quarrelsome family), 31:00–33:30 (lucky/unlucky sage thought experiment), 38:00–42:30 (attachments → indifference → resilience as knowledge), 43:30–46:00 (misfortune as challenge → virtue as alchemy → F1 analogy), 47:00–50:00 (Himalayan boy/Instagram contrast → control and happiness), 50:00–58:30 (the “why not be a bum?” objection → Diogenes → preferred indifferents), 61:00–63:30 (doctor analogy), 68:00–73:00 (meaning → failed revolutionary → hard mode), 73:30–76:00 (child/death objection revisited), and 77:30–81:00 (Marcus's journal as self-therapy → friend Marcus ending). However, the mirror timestamps only every 30 seconds and frequently cuts mid-sentence; no dependable sentence-level playback surface was available in this pass. Under the calibration rule, **0 clips promoted rather than laundering 30-second bins into fake exact boundaries**. Revisit when sentence-level timing can be verified.
- [ ] Rousseau — First / Second Discourse
- [ ] Machiavelli — Power / Violence
- [ ] The Odyssey
- [ ] The Cost of Philosophy
- [ ] Knowledge / Sex
- [ ] Nietzsche — The Last Man
- [ ] Tocqueville
- [ ] Frankenstein
- [ ] Great Thinkers

### A tier

- [ ] Tocqueville — democracy
- [ ] Machiavelli — danger
- [ ] Julius Caesar
- [ ] Stoicism
- [ ] Criticism
- [ ] Socrates / books
- [ ] Machiavelli / food
- [ ] Nietzsche — hikes / place
- [ ] Plato — innovation
- [ ] Thinker / doer
- [ ] AI
- [ ] Language learning
- [ ] Odysseus / Odyssey
- [ ] Philosopher trap

## Per-source completion checklist

A source is complete only when all applicable items are done:

- [ ] Identify and verify the exact official/primary YouTube source and video ID.
- [ ] Establish a dependable transcript and playback timebase.
- [ ] Scan the full source, not only obvious highlights.
- [ ] Generate candidate segments and reject weak/redundant ones.
- [ ] Verify exact start/end boundaries against the source.
- [ ] Give every promoted clip a concise annotation naming the rhetorical move.
- [ ] Add the source and segments to `lib/johnathan-bi-curated.ts`.
- [ ] Confirm the source appears at `/curated/johnathan-bi` and opens in the existing practice player.
- [ ] Run/inspect typecheck, lint, tests, and production build via the repository's GitHub Actions checks.
- [ ] Update this queue item to `[x]` only after the implementation and checks are sound.

If a video yields only 2 excellent clips, add 2. If it yields 12, add 12. Never target a quota.
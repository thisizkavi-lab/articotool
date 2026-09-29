# Johnathan Bi curation status

This file is the durable queue for the Artico Johnathan Bi shadowing corpus.

## Principle

**God is in the details.** Do not optimize for number of clips or speed. A mediocre segment does not become useful because it is easy to add.

The calibration source is **Masters vs. Slaves | Nietzsche's Genealogy of Morality Explained**. Its curation standard is the reference for every source that follows.

## Scope

Curate **solo Johnathan Bi lectures first**. Exclude interviews, Q&As, guest-heavy conversations, reaction content, and anything where Johnathan is not the sustained primary speaker. These can be reconsidered only after the solo-lecture corpus is complete.

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
- [ ] Don't Care What Others Think
- [ ] Plato — Symposium
- [ ] Marcus Aurelius
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
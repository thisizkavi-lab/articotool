import type { Segment, TranscriptLine } from './types'

const PAUSE_THRESHOLD_SECONDS = 0.7
const MAX_PAUSE_CUE_SECONDS = 4

function lineEnd(line: TranscriptLine): number {
  return line.start + Math.max(0, line.duration)
}

function overlaps(line: TranscriptLine, start: number, end: number): boolean {
  return line.start < end && lineEnd(line) > start
}

/**
 * Returns caption lines clipped to one practice range.
 * For deliberate speaking practice we also expose meaningful silent gaps as pause cues.
 * We do not fabricate word timing: all spoken text keeps YouTube's caption timing.
 */
export function transcriptForRange(
  transcript: TranscriptLine[],
  start: number,
  end: number,
  includePauseCues = true,
): TranscriptLine[] {
  const spoken = transcript
    .filter(line => overlaps(line, start, end) && line.text.trim().length > 0)
    .map(line => {
      const clippedStart = Math.max(start, line.start)
      const clippedEnd = Math.min(end, lineEnd(line))
      return {
        text: line.text,
        start: clippedStart,
        duration: Math.max(0.05, clippedEnd - clippedStart),
      }
    })
    .sort((a, b) => a.start - b.start)

  if (!includePauseCues || spoken.length < 2) return spoken

  const withPauses: TranscriptLine[] = []

  spoken.forEach((line, index) => {
    withPauses.push(line)

    const next = spoken[index + 1]
    if (!next) return

    const gapStart = lineEnd(line)
    const gap = next.start - gapStart

    if (gap >= PAUSE_THRESHOLD_SECONDS && gap <= MAX_PAUSE_CUE_SECONDS) {
      withPauses.push({
        text: `⏸ ${gap.toFixed(1)}s pause`,
        start: gapStart,
        duration: gap,
      })
    }
  })

  return withPauses
}

/** Build a transcript containing only the material selected for practice. */
export function buildCuratedTranscript(
  transcript: TranscriptLine[],
  segments: Segment[],
): TranscriptLine[] {
  const seen = new Set<string>()
  const result: TranscriptLine[] = []

  for (const segment of segments) {
    for (const line of transcriptForRange(transcript, segment.start, segment.end, true)) {
      const key = `${Math.round(line.start * 1000)}:${line.text}`
      if (seen.has(key)) continue
      seen.add(key)
      result.push(line)
    }
  }

  return result.sort((a, b) => a.start - b.start)
}

/** Attach the correctly bounded transcript lines to every curated segment. */
export function hydrateCuratedSegments(
  segments: Segment[],
  transcript: TranscriptLine[],
): Segment[] {
  return segments.map(segment => ({
    ...segment,
    lines: transcriptForRange(transcript, segment.start, segment.end, true),
  }))
}

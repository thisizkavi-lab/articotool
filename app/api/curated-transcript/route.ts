import { NextResponse } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'

interface TranscriptLine {
  text: string
  start: number
  duration: number
}

type FixedTranscriptSource = {
  url: string
  kind: 'manowhisper' | 'podscripts'
}

// These are deliberate, source-specific fallbacks for the curated corpus.
// The transcript text itself is not duplicated in the repo; the stable public
// transcript page is fixed to the video so curated practice does not depend on
// YouTube caption delivery working from Vercel.
const FIXED_TRANSCRIPT_SOURCES: Record<string, FixedTranscriptSource> = {
  '3qHkcs3kG44': {
    url: 'https://manowhisper.signalnetwork.org/show/the-joe-rogan-experience/episode/joe-rogan-experience-1309-naval-ravikant',
    kind: 'manowhisper',
  },
  KyfUysrNaco: {
    url: 'https://podscripts.co/podcasts/modern-wisdom/922-naval-ravikant-44-harsh-truths-about-human-nature',
    kind: 'podscripts',
  },
}

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
}

function htmlToText(html: string): string {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(?:p|div|li|section|article|h[1-6])>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\r/g, '')
    .replace(/[\t ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function hmsToSeconds(hours: string, minutes: string, seconds: string, millis = '0'): number {
  return (
    Number(hours) * 3600 +
    Number(minutes) * 60 +
    Number(seconds) +
    Number(millis.padEnd(3, '0').slice(0, 3)) / 1000
  )
}

function normalizeSourceLines(input: Array<{ text: string; start: number }>): TranscriptLine[] {
  const deduped = input
    .map(line => ({ text: line.text.replace(/\s+/g, ' ').trim(), start: line.start }))
    .filter(line => line.text.length > 0 && Number.isFinite(line.start))
    .sort((a, b) => a.start - b.start)
    .filter((line, index, all) => index === 0 || line.start !== all[index - 1].start || line.text !== all[index - 1].text)

  return deduped.map((line, index) => {
    const next = deduped[index + 1]
    const naturalDuration = next ? next.start - line.start : 5
    return {
      text: line.text,
      start: line.start,
      duration: Math.max(0.25, Math.min(45, naturalDuration)),
    }
  })
}

function parseManoWhisper(html: string): TranscriptLine[] {
  const text = htmlToText(html)
  const lines: Array<{ text: string; start: number }> = []
  const regex = /(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s+([\s\S]*?)(?=\d{2}:\d{2}:\d{2}\.\d{3}\s+|$)/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    const body = match[5].replace(/\n+/g, ' ').trim()
    if (!body) continue
    lines.push({
      start: hmsToSeconds(match[1], match[2], match[3], match[4]),
      text: body,
    })
  }

  return normalizeSourceLines(lines)
}

function parsePodscripts(html: string): TranscriptLine[] {
  const text = htmlToText(html)
  const lines: Array<{ text: string; start: number }> = []
  const regex = /Starting point is\s+(\d{2}):(\d{2}):(\d{2})\s+([\s\S]*?)(?=Starting point is\s+\d{2}:\d{2}:\d{2}|$)/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    const body = match[4].replace(/\n+/g, ' ').trim()
    if (!body) continue
    lines.push({
      start: hmsToSeconds(match[1], match[2], match[3]),
      text: body,
    })
  }

  return normalizeSourceLines(lines)
}

async function fetchFixedTranscript(videoId: string): Promise<{ transcript: TranscriptLine[]; source: string } | null> {
  const fixed = FIXED_TRANSCRIPT_SOURCES[videoId]
  if (!fixed) return null

  try {
    const response = await fetch(fixed.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; artiCO/1.0; +https://articotool.vercel.app)',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      cache: 'no-store',
    })
    if (!response.ok) return null

    const html = await response.text()
    const transcript = fixed.kind === 'manowhisper' ? parseManoWhisper(html) : parsePodscripts(html)
    if (transcript.length === 0) return null

    return { transcript, source: `fixed-${fixed.kind}` }
  } catch (error) {
    console.warn('[Curated transcript] fixed source failed', error)
    return null
  }
}

function parseTimedText(text: string): TranscriptLine[] {
  if (!text || text.length < 10) return []

  try {
    const data = JSON.parse(text)
    if (Array.isArray(data.events)) {
      return data.events
        .filter((event: any) => Array.isArray(event.segs))
        .map((event: any) => ({
          text: event.segs.map((segment: any) => segment.utf8 || '').join('').trim(),
          start: Number(event.tStartMs || 0) / 1000,
          duration: Math.max(0.05, Number(event.dDurationMs || 0) / 1000),
        }))
        .filter((line: TranscriptLine) => line.text.length > 0)
    }
  } catch {
    const lines: TranscriptLine[] = []
    const regex = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g
    let match: RegExpExecArray | null

    while ((match = regex.exec(text)) !== null) {
      lines.push({
        text: decodeHtml(match[3]).trim(),
        start: Number(match[1]),
        duration: Math.max(0.05, Number(match[2])),
      })
    }
    return lines.filter(line => line.text.length > 0)
  }

  return []
}

async function fetchWithPackage(videoId: string): Promise<TranscriptLine[]> {
  try {
    const items = await YoutubeTranscript.fetchTranscript(videoId)
    if (!items.length) return []

    const sampleDuration = items
      .map((item: any) => Number(item.duration || 0))
      .find((duration: number) => duration > 0)
    const scale = sampleDuration && sampleDuration > 100 ? 1000 : 1

    return items
      .map((item: any) => {
        const hasOffset = item.offset !== undefined && item.offset !== null
        const start = hasOffset ? Number(item.offset) / scale : Number(item.start || 0)
        const duration = Number(item.duration || 0) / (hasOffset ? scale : 1)

        return {
          text: String(item.text || '').trim(),
          start,
          duration: Math.max(0.05, duration),
        }
      })
      .filter(line => line.text.length > 0 && Number.isFinite(line.start))
  } catch (error) {
    console.warn('[Curated transcript] package strategy failed', error)
    return []
  }
}

async function fetchFromCaptionTrack(videoId: string): Promise<TranscriptLine[]> {
  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    }

    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=en`, {
      headers,
      cache: 'no-store',
    })
    if (!response.ok) return []

    const html = await response.text()
    const match = html.match(/ytInitialPlayerResponse\s*=\s*({[\s\S]+?})\s*;/)
    if (!match) return []

    const playerResponse = JSON.parse(match[1])
    const tracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks || []
    if (!Array.isArray(tracks) || tracks.length === 0) return []

    const track = tracks.find((item: any) => String(item.languageCode || '').startsWith('en')) || tracks[0]
    const captionResponse = await fetch(`${track.baseUrl}&fmt=json3`, {
      headers: {
        'User-Agent': headers['User-Agent'],
        Referer: `https://www.youtube.com/watch?v=${videoId}`,
      },
      cache: 'no-store',
    })
    if (!captionResponse.ok) return []

    return parseTimedText(await captionResponse.text())
  } catch (error) {
    console.warn('[Curated transcript] caption-track strategy failed', error)
    return []
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get('videoId')

  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return NextResponse.json({ error: 'Valid video ID required', transcript: [] }, { status: 400 })
  }

  // For known curated videos, prefer the fixed transcript page first. This is the
  // reliable path for the right-hand practice panel. YouTube remains a fallback.
  const fixed = await fetchFixedTranscript(videoId)
  if (fixed) {
    return NextResponse.json(fixed, {
      headers: {
        'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=2592000',
      },
    })
  }

  let transcript = await fetchWithPackage(videoId)
  let source = 'youtube-transcript'

  if (transcript.length === 0) {
    transcript = await fetchFromCaptionTrack(videoId)
    source = 'caption-track'
  }

  if (transcript.length === 0) {
    return NextResponse.json(
      { error: 'No transcript found', transcript: [], source: 'none' },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  return NextResponse.json(
    { transcript, source },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  )
}

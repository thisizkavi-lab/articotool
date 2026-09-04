import { NextResponse } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'

interface TranscriptLine {
  text: string
  start: number
  duration: number
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
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

    // youtube-transcript has returned both second-based and millisecond-based
    // offset/duration values across releases. Caption durations make the unit easy
    // to infer: a normal caption is a few seconds, not hundreds/thousands of seconds.
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

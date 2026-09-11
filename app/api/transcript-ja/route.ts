import { NextRequest, NextResponse } from 'next/server'

interface TranscriptSegment {
  text: string
  start: number
  duration: number
}

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function parseJson3(text: string): TranscriptSegment[] {
  try {
    const data = JSON.parse(text)
    const events = Array.isArray(data?.events) ? data.events : []

    return events
      .map((event: any) => {
        const segs = Array.isArray(event?.segs) ? event.segs : []
        const value = decodeHtml(
          segs
            .map((seg: any) => seg?.utf8 || '')
            .join('')
            .replace(/\n/g, ' ')
            .trim(),
        )

        if (!value || typeof event?.tStartMs !== 'number') return null

        return {
          text: value,
          start: event.tStartMs / 1000,
          duration: typeof event?.dDurationMs === 'number' ? event.dDurationMs / 1000 : 0,
        }
      })
      .filter(Boolean) as TranscriptSegment[]
  } catch {
    return []
  }
}

function parseXml(text: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = []
  const regex = /<text\s+start="([^"]+)"\s+dur="([^"]+)"[^>]*>([\s\S]*?)<\/text>/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(text))) {
    const start = Number(match[1])
    const duration = Number(match[2])
    const value = decodeHtml(match[3].replace(/<[^>]+>/g, '').trim())
    if (Number.isFinite(start) && Number.isFinite(duration) && value) {
      segments.push({ text: value, start, duration })
    }
  }

  return segments
}

function parseTranscriptPayload(text: string): TranscriptSegment[] {
  return text.trim().startsWith('{') ? parseJson3(text) : parseXml(text)
}

function extractPlayerResponse(html: string): any | null {
  const markers = [
    'ytInitialPlayerResponse = ',
    'ytInitialPlayerResponse=',
  ]

  for (const marker of markers) {
    const start = html.indexOf(marker)
    if (start === -1) continue

    const jsonStart = html.indexOf('{', start + marker.length)
    if (jsonStart === -1) continue

    let depth = 0
    let inString = false
    let escaped = false

    for (let i = jsonStart; i < html.length; i++) {
      const char = html[i]

      if (inString) {
        if (escaped) {
          escaped = false
        } else if (char === '\\') {
          escaped = true
        } else if (char === '"') {
          inString = false
        }
        continue
      }

      if (char === '"') {
        inString = true
      } else if (char === '{') {
        depth += 1
      } else if (char === '}') {
        depth -= 1
        if (depth === 0) {
          try {
            return JSON.parse(html.slice(jsonStart, i + 1))
          } catch {
            break
          }
        }
      }
    }
  }

  return null
}

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get('videoId')?.trim()

  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return NextResponse.json({ error: 'A valid YouTube videoId is required.' }, { status: 400 })
  }

  try {
    const watchResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}&hl=ja&gl=JP`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.5',
      },
      cache: 'no-store',
    })

    if (!watchResponse.ok) {
      return NextResponse.json({ error: `YouTube watch page returned ${watchResponse.status}.` }, { status: 502 })
    }

    const html = await watchResponse.text()
    const playerResponse = extractPlayerResponse(html)
    const tracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks || []

    if (!Array.isArray(tracks) || tracks.length === 0) {
      return NextResponse.json({ error: 'No caption tracks were exposed by YouTube for this video.' }, { status: 404 })
    }

    // Japanese curation must never silently fall back to English.
    const japaneseTracks = tracks.filter((track: any) => {
      const code = String(track?.languageCode || '').toLowerCase()
      return code === 'ja' || code.startsWith('ja-')
    })

    if (japaneseTracks.length === 0) {
      return NextResponse.json(
        {
          error: 'No Japanese caption track is available.',
          availableLanguages: tracks.map((track: any) => track?.languageCode).filter(Boolean),
        },
        { status: 404 },
      )
    }

    // Prefer a manually-authored Japanese track over ASR when both exist.
    const track = [...japaneseTracks].sort((a: any, b: any) => {
      const aAuto = a?.kind === 'asr' ? 1 : 0
      const bAuto = b?.kind === 'asr' ? 1 : 0
      return aAuto - bAuto
    })[0]

    const urls = [`${track.baseUrl}&fmt=json3`, track.baseUrl]

    for (const url of urls) {
      const captionResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Referer: `https://www.youtube.com/watch?v=${videoId}`,
        },
        cache: 'no-store',
      })

      if (!captionResponse.ok) continue

      const payload = await captionResponse.text()
      const transcript = parseTranscriptPayload(payload)

      if (transcript.length > 0) {
        return NextResponse.json({
          videoId,
          languageCode: track.languageCode,
          trackName: track?.name?.simpleText || '',
          autoGenerated: track?.kind === 'asr',
          transcript,
        })
      }
    }

    return NextResponse.json({ error: 'Japanese caption track was found but could not be parsed.' }, { status: 502 })
  } catch (error) {
    console.error('[Japanese transcript] Failed:', error)
    return NextResponse.json({ error: 'Failed to retrieve Japanese captions.' }, { status: 500 })
  }
}

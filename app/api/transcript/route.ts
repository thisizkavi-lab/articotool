import { NextResponse } from 'next/server'

interface TranscriptSegment {
  text: string
  start: number
  duration: number
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const videoId = searchParams.get('videoId')

  if (!videoId) {
    return NextResponse.json({ error: 'Video ID required' }, { status: 400 })
  }

  try {
    // Fetch the video page to extract transcript data
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    const response = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    const html = await response.text()

    // Extract captions data from the page
    const captionsMatch = html.match(/"captions":\s*({[^}]+playerCaptionsTracklistRenderer[^}]+})/s)
    
    if (!captionsMatch) {
      // Try alternative method - look for timedtext
      const timedTextMatch = html.match(/timedtext[^"]*lang=en[^"]*/)
      if (!timedTextMatch) {
        return NextResponse.json({ 
          error: 'No transcript available for this video',
          transcript: [] 
        }, { status: 200 })
      }
    }

    // Extract the captionTracks array
    const captionTracksMatch = html.match(/"captionTracks":\s*(\[[^\]]+\])/s)
    
    if (!captionTracksMatch) {
      return NextResponse.json({ 
        error: 'No transcript available',
        transcript: [] 
      }, { status: 200 })
    }

    let captionTracks: { baseUrl: string; languageCode: string }[]
    try {
      const cleanedJson = captionTracksMatch[1]
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
      captionTracks = JSON.parse(cleanedJson)
    } catch {
      // Try to find baseUrl directly
      const baseUrlMatch = html.match(/"baseUrl":\s*"([^"]+timedtext[^"]+)"/)
      if (baseUrlMatch) {
        const baseUrl = baseUrlMatch[1].replace(/\\u0026/g, '&')
        const transcriptResponse = await fetch(baseUrl)
        const transcriptXml = await transcriptResponse.text()
        const transcript = parseTranscriptXml(transcriptXml)
        return NextResponse.json({ transcript })
      }
      return NextResponse.json({ 
        error: 'Could not parse captions',
        transcript: [] 
      }, { status: 200 })
    }

    // Find English caption track (or first available)
    const englishTrack = captionTracks.find(t => t.languageCode === 'en') || captionTracks[0]
    
    if (!englishTrack) {
      return NextResponse.json({ 
        error: 'No caption track found',
        transcript: [] 
      }, { status: 200 })
    }

    const transcriptUrl = englishTrack.baseUrl.replace(/\\u0026/g, '&')
    const transcriptResponse = await fetch(transcriptUrl)
    const transcriptXml = await transcriptResponse.text()

    const transcript = parseTranscriptXml(transcriptXml)

    return NextResponse.json({ transcript })
  } catch (error) {
    console.error('Transcript fetch error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch transcript',
      transcript: [] 
    }, { status: 200 })
  }
}

function parseTranscriptXml(xml: string): TranscriptSegment[] {
  const segments: TranscriptSegment[] = []
  
  // Match <text start="X" dur="Y">content</text> patterns
  const regex = /<text[^>]*start="([\d.]+)"[^>]*dur="([\d.]+)"[^>]*>([^<]*)<\/text>/g
  let match

  while ((match = regex.exec(xml)) !== null) {
    const start = parseFloat(match[1])
    const duration = parseFloat(match[2])
    // Decode HTML entities
    const text = match[3]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n/g, ' ')
      .trim()

    if (text) {
      segments.push({ text, start, duration })
    }
  }

  return segments
}

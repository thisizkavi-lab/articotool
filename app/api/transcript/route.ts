import { NextResponse } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'

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
    // Use youtube-transcript library to fetch captions
    // It returns array of { text: string, duration: number, offset: number } (in ms)
    const rawTranscript = await YoutubeTranscript.fetchTranscript(videoId)

    const transcript: TranscriptSegment[] = rawTranscript.map(item => ({
      text: item.text,
      start: item.offset / 1000,
      duration: item.duration / 1000
    }))

    return NextResponse.json({ transcript })

  } catch (error) {
    console.error('Transcript fetch error:', error)

    return NextResponse.json({
      error: 'Failed to fetch transcript. Captions likely disabled or unavailable.',
      transcript: []
    }, { status: 200 })
  }
}

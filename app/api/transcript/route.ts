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

  // Use youtube-transcript library to fetch captions
  // Try to fetch English specifically, or fallback to default
  const config = {
    lang: 'en' // validation: strict 'en' works better for auto-generated
  }

  try {
    // Attempt 1: Strict English
    const rawTranscript = await YoutubeTranscript.fetchTranscript(videoId, config)

    const transcript: TranscriptSegment[] = rawTranscript.map(item => ({
      text: item.text,
      start: item.offset / 1000,
      duration: item.duration / 1000
    }))

    return NextResponse.json({ transcript })

  } catch (e) {
    console.log(`First attempt failed for ${videoId}, trying default language...`)

    try {
      // Attempt 2: Fallback to default (whatever YouTube serves first)
      const rawTranscript = await YoutubeTranscript.fetchTranscript(videoId)
      const transcript: TranscriptSegment[] = rawTranscript.map(item => ({
        text: item.text,
        start: item.offset / 1000,
        duration: item.duration / 1000
      }))
      return NextResponse.json({ transcript })
    } catch (finalError) {
      console.error('Final transcript fetch error:', finalError)
      return NextResponse.json({
        error: 'Failed to fetch transcript. Captions likely disabled or unavailable.',
        transcript: []
      }, { status: 200 })
    }
  }
}

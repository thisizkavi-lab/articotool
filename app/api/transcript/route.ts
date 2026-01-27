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

  // Get video title via oembed (no API key required)
  let title = 'Individual Video'
  try {
    const targetUrl = `https://www.youtube.com/watch?v=${videoId}`
    const oembedResponse = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`,
      { cache: 'no-store' }
    )
    if (oembedResponse.ok) {
      const oembedData = await oembedResponse.json()
      title = oembedData.title || title
    }
  } catch (e) {
    console.error('Failed to fetch oembed info:', e)
  }

  // Use youtube-transcript library to fetch captions
  const config = {
    lang: 'en'
  }

  try {
    const rawTranscript = await YoutubeTranscript.fetchTranscript(videoId, config)
    const transcript: TranscriptSegment[] = rawTranscript.map(item => ({
      text: item.text,
      start: item.offset / 1000,
      duration: item.duration / 1000
    }))

    return NextResponse.json({ transcript, title })

  } catch (e) {
    console.log(`First attempt failed for ${videoId}, trying default language...`)

    try {
      const rawTranscript = await YoutubeTranscript.fetchTranscript(videoId)
      const transcript: TranscriptSegment[] = rawTranscript.map(item => ({
        text: item.text,
        start: item.offset / 1000,
        duration: item.duration / 1000
      }))
      return NextResponse.json({ transcript, title })
    } catch (finalError) {
      console.error('Final transcript fetch error:', finalError)
      return NextResponse.json({
        error: 'Failed to fetch transcript. Captions likely disabled or unavailable.',
        transcript: [],
        title
      }, { status: 200 })
    }
  }
}

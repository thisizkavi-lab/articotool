import { NextResponse } from 'next/server'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

interface YouTubeVideoSnippet {
    title: string
    thumbnails: {
        medium: { url: string }
        high: { url: string }
    }
    channelTitle: string
    publishedAt: string
}

interface YouTubeVideoContentDetails {
    duration: string // ISO 8601 format like "PT4M13S"
}

interface YouTubeVideoItem {
    id: string | { videoId: string }
    snippet: YouTubeVideoSnippet
    contentDetails?: YouTubeVideoContentDetails
}

// Parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return 0

    const hours = parseInt(match[1] || '0', 10)
    const minutes = parseInt(match[2] || '0', 10)
    const seconds = parseInt(match[3] || '0', 10)

    return hours * 3600 + minutes * 60 + seconds
}

export interface VideoDetails {
    id: string
    title: string
    thumbnail: string
    duration: number
    channelName: string
    publishedAt: string
}

// Get single video details
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')
    const playlistId = searchParams.get('playlistId')
    const query = searchParams.get('q')

    // If no API key is configured, fallback to oEmbed for single videos, 
    // but fail for search/playlist which require the API.
    if (!YOUTUBE_API_KEY) {
        // Fallback for single video ID
        if (videoId) {
            try {
                const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
                const response = await fetch(oembedUrl)
                if (!response.ok) throw new Error('Failed to fetch oEmbed data')
                const data = await response.json()

                return NextResponse.json({
                    video: {
                        id: videoId,
                        title: data.title,
                        thumbnail: data.thumbnail_url,
                        duration: 0, // oEmbed doesn't return duration, strict duration requires API key
                        channelName: data.author_name,
                        publishedAt: new Date().toISOString() // Unknown
                    }
                })
            } catch (err) {
                return NextResponse.json({ error: 'YouTube API key missing and oEmbed fallback failed' }, { status: 500 })
            }
        }

        return NextResponse.json({
            error: 'Searching and Playlists require a YOUTUBE_API_KEY to be configured in settings.'
        }, { status: 500 })
    }

    try {
        // Search for videos
        if (query) {
            const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=20&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`
            const searchResponse = await fetch(searchUrl)
            const searchData = await searchResponse.json()

            if (!searchResponse.ok) {
                throw new Error(searchData.error?.message || 'Search failed')
            }

            // Get video IDs to fetch durations
            const videoIds = searchData.items.map((item: YouTubeVideoItem) =>
                typeof item.id === 'object' ? item.id.videoId : item.id
            ).join(',')

            // Fetch video details for durations
            const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
            const detailsResponse = await fetch(detailsUrl)
            const detailsData = await detailsResponse.json()

            const durationMap: Record<string, number> = {}
            detailsData.items?.forEach((item: { id: string; contentDetails: YouTubeVideoContentDetails }) => {
                durationMap[item.id] = parseDuration(item.contentDetails.duration)
            })

            const videos: VideoDetails[] = searchData.items.map((item: YouTubeVideoItem) => {
                const id = typeof item.id === 'object' ? item.id.videoId : item.id
                return {
                    id,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.high?.url,
                    duration: durationMap[id] || 0,
                    channelName: item.snippet.channelTitle,
                    publishedAt: item.snippet.publishedAt
                }
            })

            return NextResponse.json({ videos })
        }

        // Get playlist videos
        if (playlistId) {
            const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`
            const playlistResponse = await fetch(playlistUrl)
            const playlistData = await playlistResponse.json()

            if (!playlistResponse.ok) {
                throw new Error(playlistData.error?.message || 'Failed to fetch playlist')
            }

            // Get video IDs for durations
            const videoIds = playlistData.items.map((item: { contentDetails: { videoId: string } }) =>
                item.contentDetails.videoId
            ).join(',')

            const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`
            const detailsResponse = await fetch(detailsUrl)
            const detailsData = await detailsResponse.json()

            const durationMap: Record<string, number> = {}
            detailsData.items?.forEach((item: { id: string; contentDetails: YouTubeVideoContentDetails }) => {
                durationMap[item.id] = parseDuration(item.contentDetails.duration)
            })

            const videos: VideoDetails[] = playlistData.items.map((item: { snippet: YouTubeVideoSnippet; contentDetails: { videoId: string } }) => ({
                id: item.contentDetails.videoId,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.high?.url,
                duration: durationMap[item.contentDetails.videoId] || 0,
                channelName: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt
            }))

            return NextResponse.json({ videos, playlistTitle: playlistData.items[0]?.snippet?.title })
        }

        // Get single video details
        if (videoId) {
            const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`
            const videoResponse = await fetch(videoUrl)
            const videoData = await videoResponse.json()

            if (!videoResponse.ok || !videoData.items?.length) {
                throw new Error('Video not found')
            }

            const item = videoData.items[0]
            const video: VideoDetails = {
                id: item.id,
                title: item.snippet.title,
                thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.high?.url,
                duration: parseDuration(item.contentDetails.duration),
                channelName: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt
            }

            return NextResponse.json({ video })
        }

        return NextResponse.json({ error: 'videoId, playlistId, or q (search query) required' }, { status: 400 })

    } catch (error) {
        console.error('YouTube API error:', error)
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Failed to fetch from YouTube'
        }, { status: 500 })
    }
}

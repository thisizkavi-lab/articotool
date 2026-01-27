import { NextRequest, NextResponse } from 'next/server';
import type { VideoItem } from '@/lib/channels';

// Parse YouTube RSS feed to extract videos
async function fetchChannelVideos(channelId: string): Promise<VideoItem[]> {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

    try {
        const response = await fetch(rssUrl, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch RSS: ${response.status}`);
        }

        const xmlText = await response.text();

        // Simple XML parsing (no external library needed)
        const videos: VideoItem[] = [];

        // Extract channel name
        const channelNameMatch = xmlText.match(/<name>([^<]+)<\/name>/);
        const channelName = channelNameMatch ? channelNameMatch[1] : 'Unknown Channel';

        // Extract entries (videos)
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        let match;

        while ((match = entryRegex.exec(xmlText)) !== null && videos.length < 12) {
            const entry = match[1];

            // Extract video ID
            const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
            if (!videoIdMatch) continue;
            const videoId = videoIdMatch[1];

            // Extract title
            const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
            const title = titleMatch ? titleMatch[1] : 'Untitled';

            // Extract published date
            const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);
            const publishedAt = publishedMatch ? publishedMatch[1] : '';

            // Thumbnail URL
            const thumbnail = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

            videos.push({
                id: videoId,
                title,
                thumbnail,
                publishedAt,
                channelName,
            });
        }

        return videos;
    } catch (error) {
        console.error('Error fetching channel videos:', error);
        return [];
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ channelId: string }> }
) {
    const { channelId } = await params;

    if (!channelId) {
        return NextResponse.json({ error: 'Channel ID required' }, { status: 400 });
    }

    const videos = await fetchChannelVideos(channelId);

    return NextResponse.json({ videos });
}

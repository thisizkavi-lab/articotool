
import { createClient } from "@/utils/supabase/client"
import { Library, LibraryGroup, LibraryVideo } from "@/lib/types"

export const LibraryService = {

    async getLibrary(): Promise<Library | null> {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        // Fetch Groups
        const { data: groupsData, error: groupsError } = await supabase
            .from('library_groups')
            .select('*')
            .eq('user_id', user.id)

        if (groupsError || !groupsData) return { groups: [], version: 1 }

        // Fetch Videos for all these groups
        // (In a real app, might want to fetch per group or join)
        const { data: videosData, error: videosError } = await supabase
            .from('library_videos')
            .select('*')
            .eq('user_id', user.id)

        if (videosError) return { groups: [], version: 1 }

        // Map DB types to App types
        const groups: LibraryGroup[] = groupsData.map(g => ({
            id: g.id,
            name: g.name,
            emoji: g.emoji || '📁',
            createdAt: Number(g.created_at),
            updatedAt: Number(g.updated_at),
            order: 0,
            videos: videosData
                .filter(v => v.group_id === g.id)
                .map(v => ({
                    id: v.id,
                    title: v.title,
                    thumbnail: v.thumbnail || '',
                    duration: v.duration ? parseInt(v.duration) : 0, // Store as string in DB? schema says text.
                    channelName: v.channel_name || '',
                    transcript: v.transcript || [],
                    segments: v.segments || [],
                    recordings: [], // TODO: Fetch recordings
                    addedAt: Number(v.created_at),
                    lastPracticedAt: null
                }))
        }))

        return { groups, version: 1 }
    },

    async createGroup(group: LibraryGroup): Promise<boolean> {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false

        const { error } = await supabase.from('library_groups').insert({
            id: group.id,
            user_id: user.id,
            name: group.name,
            emoji: group.emoji,
            created_at: group.createdAt,
            updated_at: group.updatedAt
        })

        return !error
    },

    async addVideoToGroup(groupId: string, video: LibraryVideo): Promise<boolean> {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false

        const { error } = await supabase.from('library_videos').insert({
            id: video.id,
            group_id: groupId,
            user_id: user.id,
            title: video.title,
            channel_name: video.channelName,
            thumbnail: video.thumbnail,
            duration: video.duration.toString(),
            transcript: video.transcript,
            segments: video.segments,
            created_at: video.addedAt
        })

        return !error
    },

    async updateGroup(groupId: string, updates: Partial<LibraryGroup>): Promise<boolean> {
        const supabase = createClient()
        const { error } = await supabase
            .from('library_groups')
            .update({
                name: updates.name,
                emoji: updates.emoji,
                updated_at: Date.now()
            })
            .eq('id', groupId)
        return !error
    },

    async deleteGroup(groupId: string): Promise<boolean> {
        const supabase = createClient()
        const { error } = await supabase
            .from('library_groups')
            .delete()
            .eq('id', groupId)
        return !error
    },

    async removeVideoFromGroup(groupId: string, videoId: string): Promise<boolean> {
        const supabase = createClient()
        const { error } = await supabase
            .from('library_videos')
            .delete()
            .eq('group_id', groupId)
            .eq('id', videoId)
        return !error
    },

    async addSegmentToVideo(
        groupId: string,
        videoId: string,
        segment: { start: number; end: number; label: string; lines: any[] }
    ): Promise<boolean> {
        const supabase = createClient()

        // 1. Get current segments
        const { data: video, error: fetchError } = await supabase
            .from('library_videos')
            .select('segments')
            .eq('group_id', groupId)
            .eq('id', videoId)
            .single()

        if (fetchError || !video) return false

        const currentSegments = (video.segments as any[]) || []

        // 2. Add new segment
        const newSegment = {
            id: crypto.randomUUID(),
            ...segment,
            createdAt: Date.now()
        }

        const updatedSegments = [...currentSegments, newSegment]

        // 3. Update DB
        const { error: updateError } = await supabase
            .from('library_videos')
            .update({ segments: updatedSegments })
            .eq('group_id', groupId)
            .eq('id', videoId)

        return !updateError
    },

    async deleteSegment(groupId: string, videoId: string, segmentId: string): Promise<boolean> {
        const supabase = createClient()

        // 1. Get current segments
        const { data: video, error: fetchError } = await supabase
            .from('library_videos')
            .select('segments')
            .eq('group_id', groupId)
            .eq('id', videoId)
            .single()

        if (fetchError || !video) return false

        const currentSegments = (video.segments as any[]) || []
        const updatedSegments = currentSegments.filter((s: any) => s.id !== segmentId)

        // 2. Update DB
        const { error: updateError } = await supabase
            .from('library_videos')
            .update({ segments: updatedSegments })
            .eq('group_id', groupId)
            .eq('id', videoId)

        return !updateError
    }
}

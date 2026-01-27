
import { createClient } from "@/utils/supabase/client"
import { DbSession, DbSegment, TranscriptLine, Segment } from "@/lib/types"

export const SessionService = {

    async createSession(videoId: string): Promise<string | null> {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return null

        const timestamp = Date.now()

        // 1. Check if session already exists for this video? 
        // For now, let's treat every "practice" as a potentially new session or just get the latest one.
        // Let's try to upsert or just insert. 
        // Simplest: Check if one exists.
        const { data: existing } = await supabase
            .from('sessions')
            .select('id')
            .eq('video_id', videoId)
            .eq('user_id', user.id)
            .single()

        if (existing) return existing.id

        // 2. Create new session
        const { data, error } = await supabase
            .from('sessions')
            .insert({
                user_id: user.id,
                video_id: videoId,
                created_at: timestamp
            })
            .select('id')
            .single()

        if (error) {
            console.error('Error creating session:', error)
            return null
        }

        return data.id
    },

    async getLastSession(): Promise<{ sessionId: string, videoId: string } | null> {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error } = await supabase
            .from('sessions')
            .select('id, video_id')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single()

        if (error || !data) return null
        return { sessionId: data.id, videoId: data.video_id }
    },

    async getSegments(sessionId: string): Promise<Segment[]> {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('segments')
            .select('*')
            .eq('session_id', sessionId)
            .order('start_time', { ascending: true })

        if (error || !data) return []

        return data.map((dbSeg: DbSegment) => ({
            id: dbSeg.id,
            start: dbSeg.start_time,
            end: dbSeg.end_time,
            label: dbSeg.text || `Segment`,
            lines: []
        }))
    },

    async syncSession(sessionId: string, segments: Segment[]): Promise<boolean> {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false

        // 1. Delete all existing segments for this session (Simple Sync)
        const { error: deleteError } = await supabase
            .from('segments')
            .delete()
            .eq('session_id', sessionId)

        if (deleteError) {
            console.error("Error clearing segments for sync:", deleteError)
            return false
        }

        if (segments.length === 0) return true

        // 2. Insert current segments
        const dbSegments = segments.map(s => ({
            session_id: sessionId,
            user_id: user.id,
            start_time: s.start,
            end_time: s.end,
            text: s.label
        }))

        const { error: insertError } = await supabase
            .from('segments')
            .insert(dbSegments)

        if (insertError) {
            console.error("Error inserting segments for sync:", insertError)
            return false
        }

        return true
    },

    async saveSegment(sessionId: string, segment: Segment): Promise<string | null> {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        // For simplicity, we are deleting the segment and re-inserting? 
        // Or upserting. Segment ID in DB is UUID, local might be generated string.
        // If local ID is not UUID, we insert.

        // Let's just Insert a new one for now to test flow.
        // Ideally we sync the IDs.

        const { data, error } = await supabase
            .from('segments')
            .insert({
                session_id: sessionId,
                user_id: user.id,
                start_time: segment.start,
                end_time: segment.end,
                text: segment.label
            })
            .select('id')
            .single()

        if (error) {
            console.error("Error saving segment:", error)
            return null
        }
        return data.id
    },

    async clearSegments(sessionId: string) {
        const supabase = createClient()
        await supabase.from('segments').delete().eq('session_id', sessionId)
    }
}


import { createClient } from "@/utils/supabase/client"
import type { DbSegment, Segment } from "@/lib/types"

export const SessionService = {

    async findSession(videoId: string): Promise<string | null> {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null
        const { data, error } = await supabase.from('sessions').select('id')
            .eq('video_id', videoId).eq('user_id', user.id)
            .order('updated_at', { ascending: false }).limit(1).maybeSingle()
        if (error) throw error
        return data?.id ?? null
    },

    async createSession(videoId: string): Promise<string | null> {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return null

        const timestamp = Date.now()

        const { data: existing, error: lookupError } = await supabase
            .from('sessions')
            .select('id')
            .eq('video_id', videoId)
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (lookupError) throw lookupError
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

    async getAllSessions(): Promise<any[]> {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return []

        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })

        if (error || !data) return []
        return data
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
            lines: [],
            createdAt: dbSeg.created_at ? new Date(dbSeg.created_at).getTime() : Date.now()
        }))
    },

    async syncSession(sessionId: string, segments: Segment[]): Promise<boolean> {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return false

        const { data: existing, error: readError } = await supabase.from('segments')
            .select('id').eq('session_id', sessionId)
        if (readError) return false

        // Keep stable IDs, including deterministic UUIDs for curated clip IDs.
        // Upsert before deleting removed rows so a failed save preserves old data.
        const dbSegments = await Promise.all(segments.map(async s => ({
            id: await cloudSegmentId(sessionId, s.id),
            session_id: sessionId,
            user_id: user.id,
            start_time: s.start,
            end_time: s.end,
            text: s.label
        })))

        const { error: insertError } = dbSegments.length ? await supabase
            .from('segments')
            .upsert(dbSegments, { onConflict: 'id' }) : { error: null }

        if (insertError) {
            console.error("Error inserting segments for sync:", insertError)
            return false
        }

        const keep = new Set(dbSegments.map(segment => segment.id))
        const removed = (existing ?? []).filter(segment => !keep.has(segment.id)).map(segment => segment.id)
        if (removed.length) {
            const { error } = await supabase.from('segments').delete()
                .eq('session_id', sessionId).in('id', removed)
            if (error) return false
        }
        const { error } = await supabase.from('sessions')
            .update({ updated_at: new Date().toISOString() }).eq('id', sessionId)
        return !error
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

async function cloudSegmentId(sessionId: string, segmentId: string): Promise<string> {
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segmentId)) return segmentId
    const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${sessionId}:${segmentId}`))).slice(0, 16)
    bytes[6] = (bytes[6] & 0x0f) | 0x50
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

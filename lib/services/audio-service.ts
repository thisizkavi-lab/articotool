
import { createClient } from "@/utils/supabase/client"
import { DbRecording } from "@/lib/types"

export const AudioService = {

    async uploadRecording(
        sessionId: string,
        segmentId: string | null,
        blob: Blob,
        type: 'audio' | 'video'
    ): Promise<{ id: string, publicUrl: string } | null> {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return null

        // 1. Upload file to Storage
        const ext = type === 'video' ? 'webm' : 'webm' // We are using webm for both usually
        const filename = `${user.id}/${sessionId}/${Date.now()}.${ext}`

        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('recordings')
            .upload(filename, blob, {
                cacheControl: '3600',
                upsert: false
            })

        if (uploadError) {
            console.error('Upload failed:', uploadError)
            return null
        }

        // 2. Get Public URL (or signed URL if private, but we set bucket to public)
        const { data: { publicUrl } } = supabase
            .storage
            .from('recordings')
            .getPublicUrl(filename)

        // 3. Create Record in DB
        const { data: dbRecord, error: dbError } = await supabase
            .from('recordings')
            .insert({
                user_id: user.id,
                session_id: sessionId,
                segment_id: segmentId, // Can be null if global recording
                blob_path: filename,
                created_at: Date.now()
            })
            .select('id')
            .single()

        if (dbError) {
            console.error('DB Insert failed:', dbError)
            return null
        }

        return { id: dbRecord.id, publicUrl }
    },

    async deleteRecording(recordingId: string, blobPath: string): Promise<boolean> {
        const supabase = createClient()

        // Delete from DB
        const { error: dbError } = await supabase
            .from('recordings')
            .delete()
            .eq('id', recordingId)

        if (dbError) return false

        // Delete from Storage
        const { error: storageError } = await supabase
            .storage
            .from('recordings')
            .remove([blobPath])

        return !storageError
    }
}

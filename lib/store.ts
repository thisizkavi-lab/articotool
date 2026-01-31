"use client"

import { create } from 'zustand'
import type { TranscriptLine, Segment, Recording, PlaybackSpeed } from './types'
import { StorageService } from './storage'
import { createClient } from '@/utils/supabase/client'
import { SessionService } from '@/lib/services/session-service'
import { AudioService } from '@/lib/services/audio-service'
import type { User } from '@supabase/supabase-js'

interface AppState {
  // Video state
  videoId: string | null
  videoTitle: string
  transcript: TranscriptLine[]
  isLoading: boolean
  error: string | null
  notes: string

  // Segment state
  segments: Segment[]
  activeSegmentId: string | null
  selectionStart: number | null
  selectionEnd: number | null

  // Segment creation mode
  segmentCreationMode: 'idle' | 'waiting_for_start' | 'waiting_for_end'
  pendingSegmentStart: number | null

  // Playback state
  currentTime: number
  isLooping: boolean
  playbackSpeed: PlaybackSpeed

  // Recording state
  recordings: Recording[]
  isRecording: boolean
  activeRecordingId: string | null

  // Auth & Cloud State
  user: User | null
  cloudSessionId: string | null
  checkAuth: () => Promise<void>

  // Actions
  setVideoId: (id: string | null) => void
  setVideoTitle: (title: string) => void
  setTranscript: (transcript: TranscriptLine[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setNotes: (notes: string) => void

  addSegment: (segment: Segment) => void
  setSegments: (segments: Segment[]) => void
  removeSegment: (id: string) => void
  updateSegment: (id: string, updates: Partial<Segment>) => void
  setActiveSegment: (id: string | null) => void
  setSelection: (start: number | null, end: number | null) => void
  clearSelection: () => void

  // Segment creation
  startSegmentCreation: () => void
  setSegmentStart: (time: number) => void
  setSegmentEnd: (time: number) => void
  cancelSegmentCreation: () => void

  setCurrentTime: (time: number) => void
  setLooping: (looping: boolean) => void
  setPlaybackSpeed: (speed: PlaybackSpeed) => void

  addRecording: (recording: Recording) => void
  removeRecording: (id: string) => void
  setActiveRecording: (id: string | null) => void
  setIsRecording: (recording: boolean) => void

  saveRecordingToCloud: (recording: Recording, blob: Blob) => Promise<void>

  loadVideo: (id: string) => Promise<void>
  reset: () => void

  // Persistence
  initialize: () => Promise<void>
  saveToHistory: () => Promise<void>
}

const initialState = {
  videoId: null,
  videoTitle: '',
  transcript: [],
  isLoading: false,
  error: null,
  notes: '',
  segments: [],
  activeSegmentId: null,
  selectionStart: null,
  selectionEnd: null,
  segmentCreationMode: 'idle' as const,
  pendingSegmentStart: null,
  currentTime: 0,
  isLooping: true,
  playbackSpeed: 1 as PlaybackSpeed,
  recordings: [],
  isRecording: false,
  activeRecordingId: null,
  user: null,
  cloudSessionId: null,
}

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setVideoId: (id) => set({ videoId: id }),
  setVideoTitle: (title) => set({ videoTitle: title }),
  setTranscript: (transcript) => set({ transcript }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setNotes: (notes) => set({ notes }),

  addSegment: (segment) => set((state) => ({
    segments: [...state.segments, segment],
    segmentCreationMode: 'idle' as const,
    pendingSegmentStart: null,
  })),
  setSegments: (segments) => set({ segments }),
  removeSegment: (id) => set((state) => ({
    segments: state.segments.filter((s) => s.id !== id),
    activeSegmentId: state.activeSegmentId === id ? null : state.activeSegmentId
  })),
  updateSegment: (id, updates) => set((state) => ({
    segments: state.segments.map((s) => s.id === id ? { ...s, ...updates } : s)
  })),
  setActiveSegment: (id) => set({ activeSegmentId: id }),
  setSelection: (start, end) => set({ selectionStart: start, selectionEnd: end }),
  clearSelection: () => set({ selectionStart: null, selectionEnd: null }),

  startSegmentCreation: () => set({
    segmentCreationMode: 'waiting_for_start' as const,
    pendingSegmentStart: null
  }),
  setSegmentStart: (time) => set({
    segmentCreationMode: 'waiting_for_end' as const,
    pendingSegmentStart: time
  }),
  setSegmentEnd: (time) => set((state) => {
    if (state.pendingSegmentStart === null) return state
    const start = Math.min(state.pendingSegmentStart, time)
    const end = Math.max(state.pendingSegmentStart, time)
    return {
      selectionStart: start,
      selectionEnd: end,
      segmentCreationMode: 'idle' as const,
    }
  }),
  cancelSegmentCreation: () => set({
    segmentCreationMode: 'idle' as const,
    pendingSegmentStart: null,
    selectionStart: null,
    selectionEnd: null,
  }),

  setCurrentTime: (time) => set({ currentTime: time }),
  setLooping: (looping) => set({ isLooping: looping }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

  addRecording: (recording) => set((state) => ({
    recordings: [...state.recordings, recording]
  })),
  removeRecording: (id) => set((state) => {
    const recording = state.recordings.find((r) => r.id === id)
    if (recording) {
      URL.revokeObjectURL(recording.blobUrl)
    }
    return {
      recordings: state.recordings.filter((r) => r.id !== id),
      activeRecordingId: state.activeRecordingId === id ? null : state.activeRecordingId
    }
  }),
  setActiveRecording: (id) => set({ activeRecordingId: id }),
  setIsRecording: (recording) => set({ isRecording: recording }),

  saveRecordingToCloud: async (recording, blob) => {
    const state = useAppStore.getState()
    if (!state.user || !state.cloudSessionId) return

    // Upload
    const result = await AudioService.uploadRecording(
      state.cloudSessionId,
      null,
      blob,
      recording.type
    )

    if (result) {
      // Update the local recording with the public URL? 
      // Or just keep the blob URL for now.
      // Eventually we want to replace blobUrl with publicUrl next time we load.
      console.log("Uploaded recording:", result.publicUrl)
    }
  },

  checkAuth: async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    set({ user })
  },

  saveToHistory: async () => {
    const state = useAppStore.getState()
    if (!state.videoId) return

    // Cloud Sync
    if (state.user && state.cloudSessionId) {
      await SessionService.syncSession(state.cloudSessionId, state.segments)
    }

    // Local Sync (Always keep local backup for now?)
    await StorageService.saveCurrentSession({
      videoId: state.videoId,
      videoTitle: state.videoTitle,
      transcript: state.transcript,
      segments: state.segments,
      notes: state.notes,
      lastUpdated: Date.now()
    })
  },

  loadVideo: async (id: string) => {
    const { setLoading, setError, setVideoId, setTranscript, setVideoTitle, setSegments } = useAppStore.getState()

    // Clear relevant state
    setError(null)
    setTranscript([])
    setSegments([])
    setLoading(true)
    setVideoId(id)

    try {
      // 1. Fetch Metadata (Fast)
      // Use the YouTube API route which is faster and more reliable for metadata
      const metadataRes = await fetch(`/api/youtube?videoId=${id}`)

      if (!metadataRes.ok) {
        throw new Error('Video not found')
      }

      const metadata = await metadataRes.json()
      if (metadata.video && metadata.video.title) {
        setVideoTitle(metadata.video.title)
      }

      // 2. Allow Player to Render Immediately
      setLoading(false)

      // 3. Fetch Transcript (Background)
      // We don't await this or let it block the UI
      fetch(`/api/transcript?videoId=${id}`)
        .then(async (res) => {
          const data = await res.json()
          if (data.transcript && data.transcript.length > 0) {
            setTranscript(data.transcript)
            // Save to history once we have the full data
            useAppStore.getState().saveToHistory()
          } else {
            // Only set error/notice if we really have no transcript, but don't disrupt the user
            setError('No transcript available for this video. You can still practice without text.')
          }
        })
        .catch(err => {
          console.error('Background transcript fetch failed:', err)
          setError('No transcript available for this video. You can still practice without text.')
        })

    } catch (err) {
      setError('Failed to load video. Please check the URL and try again.')
      console.error(err)
      setLoading(false)
    }
  },

  reset: () => set(initialState),

  initialize: async () => {
    try {
      set({ isLoading: true })

      // 1. Check Auth
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      set({ user })

      // 2. Load Session (Cloud vs Local)
      let loadedSession = false

      if (user) {
        // Cloud Mode
        const lastSessionParams = await SessionService.getLastSession()
        if (lastSessionParams) {
          // We found a previous session. Load it.
          set({
            videoId: lastSessionParams.videoId,
            cloudSessionId: lastSessionParams.sessionId
          })

          // We need to fetch the segments for this session
          const segments = await SessionService.getSegments(lastSessionParams.sessionId)
          set({ segments })

          // Note: We need to fetch video title/transcript separately since DB doesn't store them fully in 'sessions'.
          // We'll rely on the existing logic to fetch them or `loadVideoFromUrl` logic.
          // But `initialize` loads state. 
          // For now, let's assume we load the ID and allow the component to fetch details if needed, 
          // OR we assume `StorageService` still has the cached metadata.

          // Hybrid: Load metadata from local storage (fast), but segments from Cloud (truth).
          loadedSession = true
        }
      }

      if (!loadedSession) {
        // Local Mode (Fallback or Guest)
        const session = await StorageService.loadCurrentSession()
        if (session) {
          set({
            videoId: session.videoId,
            videoTitle: session.videoTitle,
            transcript: session.transcript || [],
            segments: session.segments,
            notes: session.notes || '',
          })
        }
      }

      // Load recordings (TODO: Sync Cloud Recordings)
      const recordings = await StorageService.getAllRecordings()
      set({ recordings })
    } catch (error) {
      console.error('Failed to initialize:', error)
    } finally {
      set({ isLoading: false })
    }
  },
}))

// Auto-save subscription
// We'll use a simple subscription to save changes
useAppStore.subscribe((state, prevState) => {
  // Save session if critical data changes
  if (
    state.videoId !== prevState.videoId ||
    state.segments !== prevState.segments ||
    state.videoTitle !== prevState.videoTitle ||
    state.notes !== prevState.notes
  ) {
    if (state.videoId) {
      // Local Save
      StorageService.saveCurrentSession({
        videoId: state.videoId,
        videoTitle: state.videoTitle,
        transcript: state.transcript,
        segments: state.segments,
        notes: state.notes,
        lastUpdated: Date.now()
      })

      // Cloud Save
      if (state.user) {
        // Ensure we have a cloud session ID
        if (!state.cloudSessionId) {
          // Create one if missing
          SessionService.createSession(state.videoId).then(id => {
            if (id) useAppStore.setState({ cloudSessionId: id })
          })
        } else {
          // Sync
          SessionService.syncSession(state.cloudSessionId, state.segments)
        }
      }
    }
  }
})

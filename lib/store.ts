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
  authInitialized: boolean
  isHydrating: boolean
  hasInitialized: boolean
  cloudSessionId: string | null
  setUser: (user: User | null) => void
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

  addRecording: (recording: Recording) => Promise<void>
  removeRecording: (id: string) => Promise<void>
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
  authInitialized: false,
  isHydrating: false,
  hasInitialized: false,
  cloudSessionId: null,
}

let authPromise: Promise<void> | null = null
let initializePromise: Promise<void> | null = null
let videoLoadVersion = 0
let localSaveQueue: Promise<void> = Promise.resolve()
let cloudSaveQueue: Promise<void> = Promise.resolve()
const cloudSessions = new Map<string, string>()

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

  addRecording: async (recording) => {
    const saved = { ...recording, videoId: recording.videoId ?? useAppStore.getState().videoId ?? undefined }
    await StorageService.saveRecording(saved)
    set((state) => ({ recordings: [...state.recordings, saved] }))
  },
  removeRecording: async (id) => {
    await StorageService.deleteRecording(id)
    set((state) => {
    const recording = state.recordings.find((r) => r.id === id)
    if (recording) {
      URL.revokeObjectURL(recording.blobUrl)
    }
    return {
      recordings: state.recordings.filter((r) => r.id !== id),
      activeRecordingId: state.activeRecordingId === id ? null : state.activeRecordingId
    }
    })
  },
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

  setUser: (user) => set((state) => ({
    user,
    authInitialized: true,
    hasInitialized: state.user?.id === user?.id ? state.hasInitialized : false,
    cloudSessionId: state.user?.id === user?.id ? state.cloudSessionId : null,
  })),
  checkAuth: async () => {
    if (useAppStore.getState().authInitialized) return
    if (!authPromise) {
      authPromise = (async () => {
        try {
          const { data: { user } } = await createClient().auth.getUser()
          useAppStore.getState().setUser(user)
        } catch (error) {
          console.error('Could not check authentication:', error)
          set({ authInitialized: true })
        }
      })().finally(() => { authPromise = null })
    }
    await authPromise
  },

  saveToHistory: async () => {
    const state = useAppStore.getState()
    if (!state.videoId) return

    await localSaveQueue
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
    const version = ++videoLoadVersion
    const { setTranscript, setVideoTitle, user } = useAppStore.getState()
    set({ isLoading: true, error: null })
    try {
      await useAppStore.getState().saveToHistory()
      const saved = await StorageService.getSession(id)
      const cloudSessionId = user ? await SessionService.findSession(id) : null
      const segments = saved?.segments ?? (cloudSessionId ? await SessionService.getSegments(cloudSessionId) : [])
      if (version !== videoLoadVersion) return
      if (user && cloudSessionId) cloudSessions.set(`${user.id}:${id}`, cloudSessionId)
      // Switch every video-specific field in one update, so autosave can never
      // pair the outgoing video ID with the incoming video's empty segments.
      set({
        videoId: id, videoTitle: saved?.videoTitle ?? '', transcript: saved?.transcript ?? [],
        segments, notes: saved?.notes ?? '', cloudSessionId,
        activeSegmentId: null, activeRecordingId: null, currentTime: 0,
        selectionStart: null, selectionEnd: null, pendingSegmentStart: null,
        segmentCreationMode: 'idle', isLoading: false,
      })
    } catch (error) {
      if (version === videoLoadVersion) set({ isLoading: false, error: 'Could not save the current session. Your video has not been replaced.' })
      console.error('Could not switch videos:', error)
      return
    }

    // Metadata never delays a playable video, and stale requests cannot update
    // a different video after rapid navigation.
    void (async () => { try {
      const metadataRes = await fetch(`/api/youtube?videoId=${encodeURIComponent(id)}`)
      if (metadataRes.ok) {
        const metadata = await metadataRes.json()
        if (videoLoadVersion === version && useAppStore.getState().videoId === id && metadata.video?.title) {
          setVideoTitle(metadata.video.title)
        }
      } else {
        console.warn('YouTube metadata lookup failed; continuing with the embedded player.')
      }
    } catch (err) {
      console.warn('YouTube metadata lookup failed; continuing with the embedded player.', err)
    } })()

    // Transcript retrieval is also optional. Keep it silent because the practice UI
    // no longer depends on transcript availability.
    fetch(`/api/transcript?videoId=${id}`)
      .then(async (res) => {
        if (!res.ok) return
        const data = await res.json()
        if (
          videoLoadVersion === version && useAppStore.getState().videoId === id &&
          data.transcript &&
          data.transcript.length > 0
        ) {
          setTranscript(data.transcript)
          useAppStore.getState().saveToHistory()
        }
      })
      .catch(err => {
        console.warn('Background transcript fetch failed; continuing without transcript.', err)
      })
  },

  reset: () => {
    ++videoLoadVersion
    cloudSessions.clear()
    set(initialState)
  },

  initialize: async () => {
    if (useAppStore.getState().hasInitialized) return
    if (initializePromise) return initializePromise
    initializePromise = (async () => {
    try {
      set({ isLoading: true, isHydrating: true, cloudSessionId: null })
      await localSaveQueue

      // 1. Check Auth
      await useAppStore.getState().checkAuth()
      const { user } = useAppStore.getState()

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
          const cached = await StorageService.getSession(lastSessionParams.videoId)
          const segments = cached?.segments ?? await SessionService.getSegments(lastSessionParams.sessionId)
          cloudSessions.set(`${user.id}:${lastSessionParams.videoId}`, lastSessionParams.sessionId)
          set({ segments, videoTitle: cached?.videoTitle ?? '', transcript: cached?.transcript ?? [], notes: cached?.notes ?? '' })

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
      set({ isLoading: false, isHydrating: false, hasInitialized: true })
    }
    })().finally(() => { initializePromise = null })
    return initializePromise
  },
}))

// Auto-save subscription
// We'll use a simple subscription to save changes
useAppStore.subscribe((state, prevState) => {
  if (state.isHydrating) return
  // Save session if critical data changes
  if (
    state.videoId !== prevState.videoId ||
    state.segments !== prevState.segments ||
    state.videoTitle !== prevState.videoTitle ||
    state.notes !== prevState.notes ||
    state.transcript !== prevState.transcript
  ) {
    if (state.videoId) {
      // Local Save
      const snapshot = {
        videoId: state.videoId,
        videoTitle: state.videoTitle,
        transcript: state.transcript,
        segments: state.segments,
        notes: state.notes,
        lastUpdated: Date.now()
      }
      localSaveQueue = localSaveQueue.then(() => StorageService.saveCurrentSession(snapshot)).catch(error => {
        console.error('Could not save session:', error)
        useAppStore.getState().setError('Could not save your session in this browser. Please check available storage.')
      })

      // Cloud Save
      if (state.user) {
        const userId = state.user.id
        const key = `${userId}:${state.videoId}`
        if (state.cloudSessionId) cloudSessions.set(key, state.cloudSessionId)
        cloudSaveQueue = cloudSaveQueue.then(async () => {
          if (useAppStore.getState().user?.id !== userId) return
          const id = cloudSessions.get(key) ?? await SessionService.createSession(snapshot.videoId)
          if (useAppStore.getState().user?.id !== userId) return
          if (!id) throw new Error('Could not create a cloud session')
          cloudSessions.set(key, id)
          const current = useAppStore.getState()
          if (current.videoId === snapshot.videoId && current.user?.id === userId) {
            useAppStore.setState({ cloudSessionId: id })
          }
          if (!await SessionService.syncSession(id, snapshot.segments)) throw new Error('Cloud sync failed')
        }).catch(error => {
          console.error('Could not sync session:', error)
          useAppStore.getState().setError('Saved in this browser, but cloud sync failed. Please try again when connected.')
        })
      }
    }
  }
})

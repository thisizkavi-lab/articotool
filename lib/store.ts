"use client"

import { create } from 'zustand'
import type { TranscriptLine, Segment, Recording, PlaybackSpeed } from './types'
import { StorageService } from './storage'

interface AppState {
  // Video state
  videoId: string | null
  videoTitle: string
  transcript: TranscriptLine[]
  isLoading: boolean
  error: string | null

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

  // Actions
  setVideoId: (id: string | null) => void
  setVideoTitle: (title: string) => void
  setTranscript: (transcript: TranscriptLine[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

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
}

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setVideoId: (id) => set({ videoId: id }),
  setVideoTitle: (title) => set({ videoTitle: title }),
  setTranscript: (transcript) => set({ transcript }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

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

  saveToHistory: async () => {
    const state = useAppStore.getState()
    if (!state.videoId) return

    await StorageService.saveToHistory({
      videoId: state.videoId,
      videoTitle: state.videoTitle,
      transcript: state.transcript, // Save transcript
      segments: state.segments,
      lastUpdated: Date.now()
    })
  },

  reset: () => set(initialState),

  initialize: async () => {
    try {
      set({ isLoading: true })
      // Load session metadata
      const session = await StorageService.loadCurrentSession()
      if (session) {
        set({
          videoId: session.videoId,
          videoTitle: session.videoTitle,
          transcript: session.transcript || [],
          segments: session.segments,
        })
      }

      // Load recordings
      const recordings = await StorageService.getAllRecordings()
      set({ recordings })
    } catch (error) {
      console.error('Failed to initialize local storage:', error)
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
    state.videoTitle !== prevState.videoTitle
  ) {
    if (state.videoId) {
      StorageService.saveCurrentSession({
        videoId: state.videoId,
        videoTitle: state.videoTitle,
        transcript: state.transcript, // Save transcript
        segments: state.segments,
        lastUpdated: Date.now()
      })
    }
  }
})

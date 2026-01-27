export interface TranscriptLine {
  text: string
  start: number
  duration: number
}

export interface Segment {
  id: string
  start: number
  end: number
  label: string
  lines: TranscriptLine[]
}

export interface Recording {
  id: string
  segmentId: string
  blobUrl: string
  createdAt: number
  type: 'audio' | 'video'
}

export interface VideoSession {
  videoId: string
  title: string
  transcript: TranscriptLine[]
  segments: Segment[]
  recordings: Recording[]
}

export type PlaybackSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5

// ================================
// Library Types (Personal Library)
// ================================

export interface LibrarySegment {
  id: string
  start: number
  end: number
  label: string
  lines: TranscriptLine[]
  createdAt: number
}

export interface LibraryVideo {
  id: string                    // YouTube video ID
  title: string
  thumbnail: string
  duration: number              // in seconds
  channelName: string
  transcript: TranscriptLine[]
  segments: LibrarySegment[]
  recordings: Recording[]
  addedAt: number
  lastPracticedAt: number | null
}

export interface LibraryGroup {
  id: string
  name: string
  emoji: string                 // For visual identification
  videos: LibraryVideo[]
  createdAt: number
  updatedAt: number
  order: number                 // For custom sorting
}

export interface Library {
  groups: LibraryGroup[]
  version: number               // For future migrations
}

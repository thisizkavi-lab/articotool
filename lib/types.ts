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
  createdAt: number
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
  platform: 'youtube' | 'instagram'
  title: string
  transcript: TranscriptLine[]
  segments: Segment[]
  recordings: Recording[]
  notes?: string
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
  notes?: string
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

// ================================
// Database Types (Supabase)
// ================================

export interface DbSession {
  id: string
  user_id: string
  video_id: string
  created_at: number
  updated_at: string
}

export interface DbSegment {
  id: string
  session_id: string
  user_id: string
  start_time: number
  end_time: number
  text: string | null
  created_at: string
}

export interface DbLibraryGroup {
  id: string
  user_id: string
  name: string
  emoji: string | null
  created_at: number
  updated_at: number
}

export interface DbLibraryVideo {
  row_id: string
  id: string // video_id
  group_id: string
  user_id: string
  title: string
  channel_name: string | null
  thumbnail: string | null
  duration: string | null
  transcript: TranscriptLine[] | null
  created_at: number
  notes: string | null
}

export interface DbRecording {
  id: string
  user_id: string
  segment_id: string | null
  session_id: string | null
  blob_path: string
  created_at: number
}

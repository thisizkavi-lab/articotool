"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Play, Pause, Trash2, Link2, Link2Off } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ComparisonPlayer() {
  const { 
    recordings, 
    activeSegmentId, 
    activeRecordingId, 
    setActiveRecording,
    removeRecording 
  } = useAppStore()

  const [isPlaying, setIsPlaying] = useState(false)
  const [syncPlay, setSyncPlay] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const segmentRecordings = recordings.filter(r => r.segmentId === activeSegmentId)
  const activeRecording = recordings.find(r => r.id === activeRecordingId)

  const play = useCallback(() => {
    if (activeRecording?.type === 'video' && videoRef.current) {
      videoRef.current.play()
    } else if (audioRef.current) {
      audioRef.current.play()
    }
    setIsPlaying(true)
  }, [activeRecording])

  const pause = useCallback(() => {
    if (videoRef.current) videoRef.current.pause()
    if (audioRef.current) audioRef.current.pause()
    setIsPlaying(false)
  }, [])

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  // Keyboard shortcut for sync play
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
        setSyncPlay(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!activeSegmentId) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground p-4 text-center">
        <p>Select a segment to see recordings</p>
      </div>
    )
  }

  if (segmentRecordings.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground p-4 text-center">
        <p>No recordings for this segment yet.<br />Record yourself to compare.</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <h3 className="text-sm font-medium">Your Recordings ({segmentRecordings.length})</h3>
        <Button
          variant={syncPlay ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setSyncPlay(!syncPlay)}
          title="Sync with original (S)"
        >
          {syncPlay ? <Link2 className="h-4 w-4 mr-1" /> : <Link2Off className="h-4 w-4 mr-1" />}
          Sync
        </Button>
      </div>

      {/* Active recording player */}
      {activeRecording && (
        <div className="p-4 border-b border-border/50">
          {activeRecording.type === 'video' ? (
            <video
              ref={videoRef}
              src={activeRecording.blobUrl}
              className="w-full aspect-video rounded-lg bg-black"
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          ) : (
            <audio
              ref={audioRef}
              src={activeRecording.blobUrl}
              className="w-full"
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          )}
        </div>
      )}

      {/* Recording list */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {segmentRecordings.map((recording, index) => {
            const isActive = recording.id === activeRecordingId

            return (
              <div
                key={recording.id}
                className={cn(
                  "group flex items-center gap-2 p-2 rounded transition-colors cursor-pointer",
                  isActive ? "bg-primary/20" : "hover:bg-secondary/50"
                )}
                onClick={() => setActiveRecording(recording.id)}
              >
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    setActiveRecording(recording.id)
                    if (isActive) togglePlay()
                  }}
                >
                  {isActive && isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span>Take #{index + 1}</span>
                    <span className="text-xs text-muted-foreground px-1.5 rounded bg-secondary">
                      {recording.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(recording.createdAt)}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeRecording(recording.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

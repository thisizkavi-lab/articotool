"use client"

import { useState, useCallback, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trash2, Play, ChevronUp, ChevronDown, Pencil, Check, X, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SegmentList() {
  const {
    segments,
    activeSegmentId,
    setActiveSegment,
    removeSegment,
    updateSegment,
    recordings,
    isLooping
  } = useAppStore()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  const getRecordingCount = (segmentId: string) => {
    return recordings.filter(r => r.segmentId === segmentId).length
  }

  const currentIndex = segments.findIndex(s => s.id === activeSegmentId)

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setActiveSegment(segments[currentIndex - 1].id)
    }
  }, [currentIndex, segments, setActiveSegment])

  const goToNext = useCallback(() => {
    if (currentIndex < segments.length - 1) {
      setActiveSegment(segments[currentIndex + 1].id)
    }
  }, [currentIndex, segments, setActiveSegment])

  const goHome = useCallback(() => {
    setActiveSegment(null)
  }, [setActiveSegment])

  const startEditing = (segment: { id: string; label: string }) => {
    setEditingId(segment.id)
    setEditName(segment.label)
  }

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      updateSegment(editingId, { label: editName.trim() })
    }
    setEditingId(null)
    setEditName('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  // Keyboard shortcuts for segment navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key.toLowerCase()) {
        case 'n':
          goToNext()
          break
        case 'p':
          goToPrevious()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrevious])

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <h3 className="text-sm font-medium">Segments ({segments.length})</h3>
        <div className="flex items-center gap-1">
          <Button
            variant={activeSegmentId === null ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={goHome}
            title="Full Video (H)"
          >
            <Home className="h-3 w-3" />
          </Button>
          {segments.length > 0 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={goToPrevious}
                disabled={currentIndex <= 0}
                title="Previous (P)"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={goToNext}
                disabled={currentIndex >= segments.length - 1 || currentIndex === -1}
                title="Next (N)"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {segments.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-muted-foreground text-center">
            No segments yet. Use the creator to add segments.
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {segments.map((segment, index) => {
              const isActive = segment.id === activeSegmentId
              const isEditing = editingId === segment.id
              const recordingCount = getRecordingCount(segment.id)

              return (
                <div
                  key={segment.id}
                  className={cn(
                    "group flex items-start gap-2 p-2 rounded transition-colors",
                    isActive ? "bg-primary/20 border border-primary/30" : "hover:bg-secondary/50"
                  )}
                >
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-8 w-8 shrink-0 transition-all",
                      isActive && isLooping && "bg-primary text-primary-foreground animate-pulse shadow-lg ring-2 ring-primary ring-offset-2 ring-offset-background"
                    )}
                    onClick={() => setActiveSegment(segment.id)}
                    title={isActive && isLooping ? "Looping Active" : "Play this segment"}
                  >
                    <Play className={cn("h-4 w-4", isActive && isLooping && "fill-current text-primary-foreground")} />
                  </Button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="tabular-nums font-medium">#{index + 1}</span>
                      <span className="tabular-nums">
                        {formatTime(segment.start)} - {formatTime(segment.end)}
                      </span>
                      {recordingCount > 0 && (
                        <span className="bg-primary/20 px-1.5 rounded text-primary">
                          {recordingCount} rec
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-1 mt-1">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit()
                            if (e.key === 'Escape') cancelEdit()
                          }}
                          className="h-6 text-sm"
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={saveEdit}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={cancelEdit}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <p
                        className={cn(
                          "text-sm truncate mt-0.5 cursor-pointer hover:text-primary",
                          isActive && "text-primary font-medium"
                        )}
                        onClick={() => setActiveSegment(segment.id)}
                        onDoubleClick={() => startEditing(segment)}
                        title="Click to play, double-click to rename"
                      >
                        {segment.label}
                      </p>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => startEditing(segment)}
                        title="Rename"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                        onClick={() => removeSegment(segment.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}

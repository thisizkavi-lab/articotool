"use client"

import { useRef, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TranscriptViewer() {
  const {
    transcript,
    currentTime,
    selectionStart,
    selectionEnd,
    setSelection,
    clearSelection,
    addSegment,
    segments,
    activeSegmentId
  } = useAppStore()

  const scrollRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLDivElement>(null)

  // Find current line index based on playback time
  const currentLineIndex = transcript.findIndex((line, index) => {
    const nextLine = transcript[index + 1]
    const lineEnd = nextLine ? nextLine.start : line.start + line.duration
    return currentTime >= line.start && currentTime < lineEnd
  })

  // Auto-scroll to current line
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [currentLineIndex])

  const handleLineClick = useCallback((index: number) => {
    const line = transcript[index]

    if (selectionStart === null) {
      // Start new selection
      setSelection(index, index)
    } else if (selectionEnd !== null && index >= selectionStart && index <= selectionEnd) {
      // Clicking inside selection - clear it
      clearSelection()
    } else {
      // Extend selection
      const newStart = Math.min(selectionStart, index)
      const newEnd = Math.max(selectionEnd ?? selectionStart, index)
      setSelection(newStart, newEnd)
    }
  }, [selectionStart, selectionEnd, setSelection, clearSelection, transcript])

  const createSegmentFromSelection = useCallback(() => {
    if (selectionStart === null || selectionEnd === null) return

    const startLine = transcript[selectionStart]
    const endLine = transcript[selectionEnd]
    const selectedLines = transcript.slice(selectionStart, selectionEnd + 1)

    const segment = {
      id: `segment-${Date.now()}`,
      start: startLine.start,
      end: endLine.start + endLine.duration,
      label: selectedLines.map(l => l.text).join(' ').slice(0, 50) + (selectedLines.map(l => l.text).join(' ').length > 50 ? '...' : ''),
      lines: selectedLines,
    }

    addSegment(segment)
    clearSelection()
  }, [selectionStart, selectionEnd, transcript, addSegment, clearSelection])

  const isLineInSelection = (index: number) => {
    if (selectionStart === null) return false
    const end = selectionEnd ?? selectionStart
    return index >= selectionStart && index <= end
  }

  const isLineInActiveSegment = (lineStart: number) => {
    if (!activeSegmentId) return false
    const activeSegment = segments.find(s => s.id === activeSegmentId)
    if (!activeSegment) return false
    return lineStart >= activeSegment.start && lineStart < activeSegment.end
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (transcript.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground p-4 text-center">
        <p>No transcript available.<br />Load a video with captions to see the transcript.</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <h3 className="text-sm font-medium">Transcript</h3>
        <div className="flex items-center gap-2">
          {selectionStart !== null && (
            <>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button size="sm" onClick={createSegmentFromSelection}>
                <Plus className="h-4 w-4 mr-1" />
                Create Segment
              </Button>
            </>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-3 space-y-1">
          {transcript.map((line, index) => {
            const isActive = index === currentLineIndex
            const isSelected = isLineInSelection(index)
            const isInSegment = isLineInActiveSegment(line.start)

            return (
              <div
                key={`${line.start}-${index}`}
                ref={isActive ? activeLineRef : null}
                onClick={() => handleLineClick(index)}
                className={cn(
                  "flex gap-3 p-2 rounded cursor-pointer transition-all text-sm",
                  // Active Line (Current Time)
                  isActive && "bg-primary/20 text-foreground scale-[1.02] shadow-sm font-medium",
                  // Selection
                  isSelected && "bg-accent/50 ring-1 ring-primary/50",
                  // Active Segment Filtering (Spotlight Mode)
                  activeSegmentId && !isInSegment && "opacity-20 grayscale blur-[0.5px]",
                  activeSegmentId && isInSegment && !isActive && "bg-secondary/30 opacity-100",

                  // Hover states
                  !isActive && !isSelected && !isInSegment && "hover:bg-secondary/30 hover:opacity-100"
                )}
              >
                <span className="text-xs text-muted-foreground w-10 shrink-0 tabular-nums">
                  {formatTime(line.start)}
                </span>
                <span className={cn(
                  "flex-1",
                  isActive && "font-medium"
                )}>
                  {line.text}
                </span>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {selectionStart !== null && selectionEnd !== null && (
        <div className="p-3 border-t border-border/50 bg-secondary/30">
          <p className="text-xs text-muted-foreground mb-2">
            Selected: {formatTime(transcript[selectionStart].start)} - {formatTime(transcript[selectionEnd].start + transcript[selectionEnd].duration)}
          </p>
          <Button size="sm" onClick={createSegmentFromSelection} className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            Create Segment from Selection
          </Button>
        </div>
      )}
    </div>
  )
}

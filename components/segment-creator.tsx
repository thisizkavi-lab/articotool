"use client"

import { useState, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, X, Check, Clock, MousePointer } from 'lucide-react'
import type { Segment } from '@/lib/types'

export function SegmentCreator() {
  const {
    currentTime,
    segmentCreationMode,
    pendingSegmentStart,
    selectionStart,
    selectionEnd,
    segments,
    startSegmentCreation,
    setSegmentStart,
    setSegmentEnd,
    cancelSegmentCreation,
    addSegment,
    setActiveSegment,
    clearSelection,
  } = useAppStore()

  const [segmentName, setSegmentName] = useState('')
  const [manualStart, setManualStart] = useState('')
  const [manualEnd, setManualEnd] = useState('')

  // Format time for display (mm:ss.ms)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  // Format time for input display (mm:ss.ss)
  const formatTimeForInput = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(2)
    return `${mins}:${secs.padStart(5, '0')}`
  }

  // Parse time string to seconds
  const parseTimeString = (timeStr: string): number | null => {
    const trimmed = timeStr.trim()
    
    // Format: mm:ss or mm:ss.ss or h:mm:ss or h:mm:ss.ss
    const colonMatch = trimmed.match(/^(\d+):(\d{1,2})(?:\.(\d{1,2}))?$/)
    if (colonMatch) {
      const [, minsOrHours, secs, ms = '0'] = colonMatch
      const minutes = parseInt(minsOrHours, 10)
      const seconds = parseInt(secs, 10)
      const milliseconds = parseInt(ms.padEnd(2, '0'), 10) / 100
      return minutes * 60 + seconds + milliseconds
    }

    // Format: just seconds (e.g., "125" or "125.5")
    const numMatch = trimmed.match(/^(\d+(?:\.\d+)?)$/)
    if (numMatch) {
      return parseFloat(numMatch[1])
    }

    return null
  }

  // Handle setting start from current time
  const handleSetStart = useCallback(() => {
    setSegmentStart(currentTime)
  }, [currentTime, setSegmentStart])

  // Handle setting end from current time
  const handleSetEnd = useCallback(() => {
    setSegmentEnd(currentTime)
  }, [currentTime, setSegmentEnd])

  // Handle creating segment from selection
  const handleCreateSegment = useCallback(() => {
    if (selectionStart === null || selectionEnd === null) return

    const start = Math.min(selectionStart, selectionEnd)
    const end = Math.max(selectionStart, selectionEnd)

    if (end - start < 0.5) {
      return // Minimum 0.5 second segment
    }

    const segment: Segment = {
      id: `segment-${Date.now()}`,
      label: segmentName.trim() || `Segment ${segments.length + 1}`,
      start,
      end,
      transcriptText: '',
    }

    addSegment(segment)
    setActiveSegment(segment.id)
    setSegmentName('')
    clearSelection()
  }, [selectionStart, selectionEnd, segmentName, segments.length, addSegment, setActiveSegment, clearSelection])

  // Handle manual time input
  const handleManualCreate = useCallback(() => {
    const start = parseTimeString(manualStart)
    const end = parseTimeString(manualEnd)

    if (start === null || end === null) return
    if (end <= start) return
    if (end - start < 0.5) return

    const segment: Segment = {
      id: `segment-${Date.now()}`,
      label: segmentName.trim() || `Segment ${segments.length + 1}`,
      start,
      end,
      transcriptText: '',
    }

    addSegment(segment)
    setActiveSegment(segment.id)
    setSegmentName('')
    setManualStart('')
    setManualEnd('')
  }, [manualStart, manualEnd, segmentName, segments.length, addSegment, setActiveSegment])

  // Check if we have a valid selection
  const hasValidSelection = selectionStart !== null && selectionEnd !== null

  // Check if manual inputs are valid
  const manualStartTime = parseTimeString(manualStart)
  const manualEndTime = parseTimeString(manualEnd)
  const hasValidManualInput = manualStartTime !== null && manualEndTime !== null && manualEndTime > manualStartTime

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Create Segment</h3>
        <div className="text-xs text-muted-foreground tabular-nums">
          Current: {formatTime(currentTime)}
        </div>
      </div>

      <Tabs defaultValue="buttons" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="buttons" className="text-xs">Buttons</TabsTrigger>
          <TabsTrigger value="click" className="text-xs">Click Mode</TabsTrigger>
          <TabsTrigger value="manual" className="text-xs">Manual</TabsTrigger>
        </TabsList>

        {/* Button-based method */}
        <TabsContent value="buttons" className="space-y-3 pt-3">
          <p className="text-xs text-muted-foreground">
            Play video, then click buttons to capture current timestamp.
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={pendingSegmentStart !== null ? "secondary" : "outline"}
              size="sm"
              onClick={handleSetStart}
              className="w-full"
            >
              <Clock className="h-3 w-3 mr-1" />
              Set Start
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSetEnd}
              disabled={segmentCreationMode !== 'waiting_for_end'}
              className="w-full bg-transparent"
            >
              <Clock className="h-3 w-3 mr-1" />
              Set End
            </Button>
          </div>

          {pendingSegmentStart !== null && segmentCreationMode === 'waiting_for_end' && (
            <div className="text-xs text-muted-foreground text-center">
              Start set at {formatTime(pendingSegmentStart)} — now set end point
            </div>
          )}

          {hasValidSelection && (
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="text-xs text-center text-muted-foreground">
                Selected: {formatTime(selectionStart!)} - {formatTime(selectionEnd!)}
              </div>
              <Input
                placeholder={`Segment ${segments.length + 1}`}
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
                className="h-8 text-sm"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelSegmentCreation}
                  className="flex-1 bg-transparent"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateSegment}
                  className="flex-1"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Create
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Click-on-video method */}
        <TabsContent value="click" className="space-y-3 pt-3">
          <p className="text-xs text-muted-foreground">
            Click the video area to mark timestamps while it plays.
          </p>
          
          {segmentCreationMode === 'idle' && (
            <Button
              variant="outline"
              size="sm"
              onClick={startSegmentCreation}
              className="w-full bg-transparent"
            >
              <MousePointer className="h-3 w-3 mr-2" />
              Start Marking
            </Button>
          )}

          {segmentCreationMode === 'waiting_for_start' && (
            <div className="space-y-2">
              <div className="p-3 bg-primary/10 rounded-lg text-center border border-primary/30">
                <MousePointer className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="text-xs text-primary font-medium">Click video to set START</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelSegmentCreation}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}

          {segmentCreationMode === 'waiting_for_end' && (
            <div className="space-y-2">
              <div className="p-3 bg-primary/10 rounded-lg text-center border border-primary/30">
                <MousePointer className="h-4 w-4 mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium text-primary">
                  Start: {formatTime(pendingSegmentStart!)}
                </p>
                <p className="text-xs text-primary/80">Click video to set END</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelSegmentCreation}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}

          {hasValidSelection && segmentCreationMode === 'idle' && (
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="text-xs text-center text-muted-foreground">
                Selected: {formatTime(selectionStart!)} - {formatTime(selectionEnd!)}
              </div>
              <Input
                placeholder={`Segment ${segments.length + 1}`}
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
                className="h-8 text-sm"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelSegmentCreation}
                  className="flex-1 bg-transparent"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateSegment}
                  className="flex-1"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Create
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Manual input method */}
        <TabsContent value="manual" className="space-y-3 pt-3">
          <p className="text-xs text-muted-foreground">
            Type exact timestamps (mm:ss or mm:ss.ss format).
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Start Time</Label>
              <Input
                placeholder="0:00"
                value={manualStart}
                onChange={(e) => setManualStart(e.target.value)}
                className="h-8 text-sm tabular-nums"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">End Time</Label>
              <Input
                placeholder="0:30"
                value={manualEnd}
                onChange={(e) => setManualEnd(e.target.value)}
                className="h-8 text-sm tabular-nums"
              />
            </div>
          </div>

          <Input
            placeholder={`Segment ${segments.length + 1}`}
            value={segmentName}
            onChange={(e) => setSegmentName(e.target.value)}
            className="h-8 text-sm"
          />

          <Button
            size="sm"
            onClick={handleManualCreate}
            disabled={!hasValidManualInput}
            className="w-full"
          >
            <Plus className="h-3 w-3 mr-1" />
            Create Segment
          </Button>

          {manualStart && manualEnd && !hasValidManualInput && (
            <p className="text-xs text-destructive text-center">
              Invalid time format or end must be after start
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

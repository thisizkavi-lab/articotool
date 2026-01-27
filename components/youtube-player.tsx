"use client"

import React, { useEffect, useRef, useCallback, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, RotateCcw, Repeat } from 'lucide-react'
import type { PlaybackSpeed } from '@/lib/types'

declare global {
  interface Window {
    YT: {
      Player: new (
        element: HTMLElement,
        config: {
          videoId: string
          playerVars?: Record<string, unknown>
          events?: {
            onReady?: () => void
            onStateChange?: (event: { data: number }) => void
          }
        }
      ) => YTPlayer
      PlayerState: {
        PLAYING: number
        PAUSED: number
        ENDED: number
      }
    }
    onYouTubeIframeAPIReady: () => void
  }
}

interface YTPlayer {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getCurrentTime: () => number
  getDuration: () => number
  setPlaybackRate: (rate: number) => void
  destroy: () => void
}

const SPEEDS: PlaybackSpeed[] = [0.5, 0.75, 1, 1.25, 1.5]

export function YouTubePlayer() {
  const playerRef = useRef<YTPlayer | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const loopIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousSegmentIdRef = useRef<string | null>(null)

  const {
    videoId,
    setCurrentTime,
    currentTime,
    isLooping,
    setLooping,
    playbackSpeed,
    setPlaybackSpeed,
    activeSegmentId,
    setActiveSegment,
    segments,
    segmentCreationMode,
    setSegmentStart,
    setSegmentEnd,
  } = useAppStore()

  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [isReady, setIsReady] = useState(false)

  const activeSegment = segments.find(s => s.id === activeSegmentId)

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT) return

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
  }, [])

  // Initialize player
  useEffect(() => {
    if (!videoId) return

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy()
        setIsReady(false)
      }

      if (!containerRef.current) return

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            setIsReady(true)
            setDuration(playerRef.current?.getDuration() || 0)
            playerRef.current?.setPlaybackRate(playbackSpeed)
          },
          onStateChange: (event: { data: number }) => {
            setIsPlaying(event.data === window.YT.PlayerState.PLAYING)
          },
        },
      })
    }

    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      window.onYouTubeIframeAPIReady = initPlayer
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (loopIntervalRef.current) clearInterval(loopIntervalRef.current)
    }
  }, [videoId, playbackSpeed])

  // Track current time
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const time = playerRef.current?.getCurrentTime() || 0
        setCurrentTime(time)
      }, 100)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, setCurrentTime])

  // Handle segment switching - seek to segment start when activeSegmentId changes
  useEffect(() => {
    if (activeSegmentId !== previousSegmentIdRef.current) {
      previousSegmentIdRef.current = activeSegmentId

      if (activeSegment && isReady && playerRef.current) {
        // Smoothly seek to segment start
        playerRef.current.seekTo(activeSegment.start, true)
        setCurrentTime(activeSegment.start)
        // Auto-play when switching segments
        playerRef.current.playVideo()
      }
    }
  }, [activeSegmentId, activeSegment, isReady, setCurrentTime])

  // Handle segment looping
  useEffect(() => {
    if (!isPlaying || !activeSegment || !isLooping) {
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current)
      }
      return
    }

    loopIntervalRef.current = setInterval(() => {
      const time = playerRef.current?.getCurrentTime() || 0
      // Small buffer (0.1s) to prevent clicking at the very end
      if (time >= activeSegment.end) {
        playerRef.current?.seekTo(activeSegment.start, true)
      }
    }, 30)

    return () => {
      if (loopIntervalRef.current) clearInterval(loopIntervalRef.current)
    }
  }, [isPlaying, activeSegment, isLooping])

  const play = useCallback(() => {
    playerRef.current?.playVideo()
  }, [])

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo()
  }, [])

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }, [isPlaying, play, pause])

  const seek = useCallback((time: number) => {
    playerRef.current?.seekTo(time, true)
    setCurrentTime(time)
  }, [setCurrentTime])

  const handleSpeedChange = useCallback((speed: PlaybackSpeed) => {
    setPlaybackSpeed(speed)
    playerRef.current?.setPlaybackRate(speed)
  }, [setPlaybackSpeed])

  const restart = useCallback(() => {
    if (activeSegment) {
      seek(activeSegment.start)
    } else {
      seek(0)
    }
    play()
  }, [activeSegment, seek, play])

  // Go to "Home" - deselect segment and play full video
  const goHome = useCallback(() => {
    setActiveSegment(null)
    seek(0)
  }, [setActiveSegment, seek])

  // Handle click on video for segment marking
  const handleVideoClick = useCallback(() => {
    const time = playerRef.current?.getCurrentTime() || currentTime

    if (segmentCreationMode === 'waiting_for_start') {
      setSegmentStart(time)
    } else if (segmentCreationMode === 'waiting_for_end') {
      setSegmentEnd(time)
    }
  }, [segmentCreationMode, currentTime, setSegmentStart, setSegmentEnd])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault()
          togglePlay()
          break
        case 'l':
          setLooping(!isLooping)
          break
        case 'h':
          goHome()
          break
        case 'arrowleft':
          seek(Math.max(0, currentTime - 5))
          break
        case 'arrowright':
          seek(Math.min(duration, currentTime + 5))
          break
        case 'arrowup':
          e.preventDefault()
          const currentIndex = SPEEDS.indexOf(playbackSpeed)
          if (currentIndex < SPEEDS.length - 1) {
            handleSpeedChange(SPEEDS[currentIndex + 1])
          }
          break
        case 'arrowdown':
          e.preventDefault()
          const currIndex = SPEEDS.indexOf(playbackSpeed)
          if (currIndex > 0) {
            handleSpeedChange(SPEEDS[currIndex - 1])
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePlay, isLooping, setLooping, currentTime, duration, seek, playbackSpeed, handleSpeedChange, goHome])

  if (!videoId) {
    return (
      <div className="aspect-video bg-secondary/30 rounded-lg flex items-center justify-center border border-border/30">
        <p className="text-muted-foreground">Paste a YouTube URL to begin</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
        <div ref={containerRef} className="w-full h-full" />
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
            <div className="animate-pulse text-muted-foreground">Loading player...</div>
          </div>
        )}
        {/* Clickable overlay for segment marking */}
        {segmentCreationMode !== 'idle' && (
          <button
            type="button"
            onClick={handleVideoClick}
            className="absolute inset-0 cursor-crosshair bg-primary/5 hover:bg-primary/10 transition-colors flex items-center justify-center"
          >
            <div className="bg-background/90 px-4 py-2 rounded-lg text-sm font-medium text-primary border border-primary/30">
              {segmentCreationMode === 'waiting_for_start' ? 'Click to set START' : 'Click to set END'}
            </div>
          </button>
        )}
      </div>

      {isReady && (
        <div className="space-y-3">
          {/* Segment Progress Bar - when segment is active */}
          {activeSegment && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{formatTime(activeSegment.start)}</span>
                <span className="font-medium text-foreground">{activeSegment.label}</span>
                <span>{formatTime(activeSegment.end)}</span>
              </div>
              <div
                className="h-3 bg-secondary rounded-full overflow-hidden cursor-pointer hover:h-4 transition-all"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const clickX = e.clientX - rect.left
                  const percent = clickX / rect.width
                  const newTime = activeSegment.start + (activeSegment.end - activeSegment.start) * percent
                  seek(newTime)
                }}
              >
                <div
                  className="h-full bg-primary transition-all duration-100"
                  style={{
                    width: `${Math.min(100, Math.max(0, ((currentTime - activeSegment.start) / (activeSegment.end - activeSegment.start)) * 100))}%`
                  }}
                />
              </div>
              <p className="text-xs text-center text-muted-foreground mt-1">
                Click bar to jump • {formatTime(currentTime)}
              </p>
            </div>
          )}

          {/* Full video progress bar - when no segment is active */}
          {!activeSegment && (
            <div className="space-y-1">
              <Slider
                value={[currentTime]}
                min={0}
                max={duration}
                step={0.1}
                onValueChange={([value]) => seek(value)}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {/* Playback Controls */}
          <div className="flex items-center justify-center gap-4">
            {activeSegment ? (
              <>
                <Button variant="outline" size="sm" onClick={goHome}>Full Video</Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const currentIndex = segments.findIndex(s => s.id === activeSegmentId)
                    if (currentIndex > 0) setActiveSegment(segments[currentIndex - 1].id)
                  }}
                  disabled={segments.findIndex(s => s.id === activeSegmentId) === 0}
                >
                  <span className="sr-only">Previous segment</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
                <Button variant="outline" size="icon" onClick={restart}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant={isLooping ? "default" : "outline"}
                  size="icon"
                  onClick={() => setLooping(!isLooping)}
                >
                  <Repeat className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const currentIndex = segments.findIndex(s => s.id === activeSegmentId)
                    if (currentIndex < segments.length - 1) setActiveSegment(segments[currentIndex + 1].id)
                  }}
                  disabled={segments.findIndex(s => s.id === activeSegmentId) === segments.length - 1}
                >
                  <span className="sr-only">Next segment</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="icon" onClick={restart} title="Restart">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="default" size="icon" onClick={togglePlay} title="Play/Pause (Space)">
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant={isLooping ? "secondary" : "outline"}
                  size="icon"
                  onClick={() => setLooping(!isLooping)}
                  title="Loop (L)"
                >
                  <Repeat className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Speed control - show when no segment active, or always if preferred */}
          {!activeSegment && (
            <div className="flex items-center justify-center gap-1">
              {SPEEDS.map((speed) => (
                <Button
                  key={speed}
                  variant={playbackSpeed === speed ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handleSpeedChange(speed)}
                  className="text-xs px-2 h-7"
                >
                  {speed}x
                </Button>
              ))}
            </div>
          )}

          {/* Segment info text */}
          {!activeSegment && segments.length > 0 && (
            <p className="text-xs text-center text-muted-foreground">
              Click a segment below to practice
            </p>
          )}
        </div>
      )}
    </div>
  )
}

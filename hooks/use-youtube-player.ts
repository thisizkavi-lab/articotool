"use client"

import { useEffect, useRef, useState, useCallback } from 'react'
import type { PlaybackSpeed } from '@/lib/types'
import { YT } from 'some-youtube-api-package' // Assuming a package provides YT

declare global {
  interface Window {
    YT: typeof YT
    onYouTubeIframeAPIReady: () => void
  }
}

interface UseYouTubePlayerProps {
  videoId: string | null
  onTimeUpdate?: (time: number) => void
}

export function useYouTubePlayer({ videoId, onTimeUpdate }: UseYouTubePlayerProps) {
  const playerRef = useRef<YT.Player | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT) {
      return
    }

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
  }, [])

  // Initialize player when videoId changes
  useEffect(() => {
    if (!videoId || !containerRef.current) return

    const initPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }

      playerRef.current = new window.YT.Player(containerRef.current!, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
        },
        events: {
          onReady: () => {
            setIsReady(true)
            setDuration(playerRef.current?.getDuration() || 0)
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [videoId])

  // Track current time
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const time = playerRef.current?.getCurrentTime() || 0
        setCurrentTime(time)
        onTimeUpdate?.(time)
      }, 100)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, onTimeUpdate])

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
  }, [])

  const setSpeed = useCallback((speed: PlaybackSpeed) => {
    playerRef.current?.setPlaybackRate(speed)
  }, [])

  const playSegment = useCallback((start: number, end: number, loop: boolean = false) => {
    seek(start)
    play()

    const checkEnd = setInterval(() => {
      const time = playerRef.current?.getCurrentTime() || 0
      if (time >= end) {
        if (loop) {
          seek(start)
        } else {
          pause()
          clearInterval(checkEnd)
        }
      }
    }, 100)

    return () => clearInterval(checkEnd)
  }, [seek, play, pause])

  return {
    containerRef,
    isReady,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    togglePlay,
    seek,
    setSpeed,
    playSegment,
  }
}

"use client"

import React from "react"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'

function extractVideoInfo(input: string): { id: string, platform: 'youtube' | 'instagram' } | null {
  // Instagram Patterns
  const instagramPatterns = [
    /(?:instagram\.com\/(?:p|reel)\/)([\w-]+)/,
  ]

  for (const pattern of instagramPatterns) {
    const match = input.match(pattern)
    if (match) return { id: match[1], platform: 'instagram' }
  }

  // YouTube Patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ]

  for (const pattern of youtubePatterns) {
    const match = input.match(pattern)
    if (match) return { id: match[1], platform: 'youtube' }
  }
  return null
}

export function VideoLoader() {
  const [url, setUrl] = useState('')
  const { loadVideo, isLoading, setError, reset } = useAppStore()

  const handleLoad = async () => {
    const videoInfo = extractVideoInfo(url.trim())

    if (!videoInfo) {
      setError('Invalid URL. Please use a YouTube or Instagram link.')
      return
    }

    await loadVideo(videoInfo.id, videoInfo.platform)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLoad()
    }
  }

  return (
    <div className="flex gap-3">
      <Input
        type="text"
        placeholder="Paste YouTube or Instagram URL..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-secondary/50 border-border/50 focus:border-primary/50"
        disabled={isLoading}
      />
      <Button
        onClick={handleLoad}
        disabled={isLoading || !url.trim()}
        className="min-w-[100px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading
          </>
        ) : (
          'Load Video'
        )}
      </Button>
    </div>
  )
}

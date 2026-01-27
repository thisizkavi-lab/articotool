"use client"

import React from "react"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'

function extractVideoId(input: string): string | null {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ]

  for (const pattern of patterns) {
    const match = input.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function VideoLoader() {
  const [url, setUrl] = useState('')
  const { loadVideo, isLoading, setError, reset } = useAppStore()

  const handleLoad = async () => {
    const videoId = extractVideoId(url.trim())

    if (!videoId) {
      setError('Invalid YouTube URL or video ID')
      return
    }

    await loadVideo(videoId)
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
        placeholder="Paste YouTube URL or video ID..."
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

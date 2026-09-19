"use client"

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'

const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/

function validVideoId(value: string | null | undefined): string | null {
  if (!value) return null
  return VIDEO_ID_PATTERN.test(value) ? value : null
}

export function extractVideoId(input: string): string | null {
  const value = input.trim()

  // Allow a raw 11-character YouTube video ID.
  const directId = validVideoId(value)
  if (directId) return directId

  // URL() requires a protocol, but pasted links sometimes omit it.
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`

  try {
    const parsed = new URL(candidate)
    const hostname = parsed.hostname
      .toLowerCase()
      .replace(/^www\./, '')
      .replace(/^m\./, '')
    const parts = parsed.pathname.split('/').filter(Boolean)

    if (hostname === 'youtu.be') {
      return validVideoId(parts[0])
    }

    if (
      hostname === 'youtube.com' ||
      hostname === 'music.youtube.com' ||
      hostname === 'youtube-nocookie.com'
    ) {
      if (parsed.pathname === '/watch') {
        return validVideoId(parsed.searchParams.get('v'))
      }

      if (
        parts.length >= 2 &&
        ['shorts', 'embed', 'live', 'v'].includes(parts[0])
      ) {
        return validVideoId(parts[1])
      }
    }
  } catch {
    // Fall through to the user-facing validation message below.
  }

  return null
}

export function VideoLoader() {
  const [url, setUrl] = useState('')
  const router = useRouter()
  const { isLoading, setError } = useAppStore()

  const handleLoad = async () => {
    const videoId = extractVideoId(url)

    if (!videoId) {
      setError('Invalid YouTube link. Paste a normal YouTube video, Shorts, Live, or youtu.be URL.')
      return
    }

    setError(null)
    router.replace(`/?v=${encodeURIComponent(videoId)}`, { scroll: false })
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
        placeholder="Paste YouTube URL..."
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

"use client"

import { useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { VideoLoader } from '@/components/video-loader'
import { YouTubePlayer } from '@/components/youtube-player'
import { TranscriptViewer } from '@/components/transcript-viewer'
import { SegmentCreator } from '@/components/segment-creator'
import { SegmentList } from '@/components/segment-list'
import { Recorder } from '@/components/recorder'
import { KeyboardHelp } from '@/components/keyboard-help'
import { useAppStore } from '@/lib/store'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

import { Suspense } from 'react'

function HomeContent() {
  const searchParams = useSearchParams()
  const { videoId, error, isLoading, initialize, setVideoId, setTranscript, setLoading, setError, reset } = useAppStore()

  // Load video from URL query param
  const loadVideoFromUrl = useCallback(async (id: string) => {
    reset()
    setLoading(true)
    setError(null)

    try {
      setVideoId(id)

      const response = await fetch(`/api/transcript?videoId=${id}`)
      const data = await response.json()

      if (data.transcript && data.transcript.length > 0) {
        setTranscript(data.transcript)
      } else {
        setError('No transcript available for this video. You can still practice without text.')
      }
    } catch (err) {
      setError('Failed to load video. Please check the URL and try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [reset, setLoading, setError, setVideoId, setTranscript])

  // Initialize from local storage on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Handle URL query parameter for video loading
  useEffect(() => {
    const urlVideoId = searchParams.get('v')
    if (urlVideoId && !videoId && !isLoading) {
      loadVideoFromUrl(urlVideoId)
    }
  }, [searchParams, videoId, isLoading, loadVideoFromUrl])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold tracking-tight">artiCO shadowing tool</h1>
            <span className="text-xs text-muted-foreground hidden sm:block">
              Shadow. Record. Compare. Repeat.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <a href="/library" className="text-xs">
                Library
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="/explore" className="text-xs">
                Explore
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="/history" className="text-xs">
                History
              </a>
            </Button>
            <KeyboardHelp />
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Video URL Input */}
        <div className="max-w-2xl mx-auto mb-6">
          <VideoLoader />
          {error && (
            <Alert variant="destructive" className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Main Layout */}
        {videoId && (
          <div className="space-y-6">
            {/* Top Row: Video (left) + Toggle Panel (right) - Same size */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Video Player */}
              <div className="bg-card rounded-lg border border-border/50 p-4">
                <YouTubePlayer />
              </div>

              {/* Right: Toggle Panel (Transcript / Record) - Same size as video */}
              <div className="bg-card rounded-lg border border-border/50 overflow-hidden flex flex-col min-h-[400px]">
                <Recorder />
              </div>
            </div>

            {/* Bottom Row: Segment Creator + Segment List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Segment Creator */}
              <div className="bg-card rounded-lg border border-border/50">
                <SegmentCreator />
              </div>

              {/* Segments List */}
              <div className="bg-card rounded-lg border border-border/50 h-[350px]">
                <SegmentList />
              </div>

              {/* Full Transcript (for reference) */}
              <div className="bg-card rounded-lg border border-border/50 h-[350px]">
                <TranscriptViewer />
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!videoId && !isLoading && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-3">Your Personal Speaking Gym</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Paste a YouTube URL above to load a video. Then segment the transcript,
              shadow the speaker, record yourself, and compare.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
              <span className="px-3 py-1 bg-secondary/50 rounded">No AI</span>
              <span className="px-3 py-1 bg-secondary/50 rounded">No Cloud</span>
              <span className="px-3 py-1 bg-secondary/50 rounded">Local Only</span>
              <span className="px-3 py-1 bg-secondary/50 rounded">Keyboard Driven</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-4 text-center text-xs text-muted-foreground">
        <p>All recordings stay in your browser. Nothing is uploaded.</p>
      </footer>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}

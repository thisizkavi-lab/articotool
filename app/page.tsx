"use client"

import { useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from "@/utils/supabase/client"
import { LogOut, User as UserIcon, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { VideoLoader } from '@/components/video-loader'
import { KeyboardHelp } from '@/components/keyboard-help'
import { useAppStore } from '@/lib/store'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UnifiedPracticeView } from '@/components/unified-practice-view'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function Header() {
  const { user, isLoading } = useAppStore()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
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

          <div className="h-4 w-[1px] bg-border mx-2" />

          {isLoading ? (
            <Button variant="ghost" size="sm" disabled>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </Button>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center">
                    <UserIcon className="h-4 w-4 text-primary" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" onClick={() => router.push('/login')}>
              Login
            </Button>
          )}

          <KeyboardHelp />
        </div>
      </div>
    </header>
  )
}

function HomeContent() {
  const searchParams = useSearchParams()
  const {
    videoId, error, isLoading, initialize,
    segments, recordings, addSegment, removeSegment, setSegments,
    addRecording, removeRecording, videoTitle, transcript,
    notes, setNotes, loadVideo, setTranscript
  } = useAppStore()

  // Initialize from local storage on mount
  useEffect(() => {
    initialize()
  }, [initialize])

  // Handle URL query parameter for video loading
  useEffect(() => {
    const urlVideoId = searchParams.get('v')
    if (urlVideoId && !videoId && !isLoading) {
      loadVideo(urlVideoId)
    }
  }, [searchParams, videoId, isLoading, loadVideo])

  // Handlers for UnifiedPracticeView
  const handleAddSegments = async (newSegments: any[], replaceTranscript?: boolean) => {
    const formattedSegments = newSegments.map(s => ({
      id: crypto.randomUUID(),
      ...s,
      createdAt: Date.now()
    }))
    setSegments([...segments, ...formattedSegments])
    if (replaceTranscript) {
      const allLines = newSegments.flatMap(s => s.lines).sort((a, b) => a.start - b.start)
      setTranscript(allLines)
    }
  }

  const handleClearSegments = async () => {
    if (confirm("Clear all segments?")) {
      setSegments([])
    }
  }

  const handleDeleteSegment = async (id: string) => {
    removeSegment(id)
  }

  const handleSaveRecording = async (rec: any) => {
    addRecording(rec)
  }

  const handleDeleteRecording = async (id: string) => {
    removeRecording(id)
  }

  const handleUpdateNotes = async (notes: string) => {
    setNotes(notes)
  }

  const handleUpdateTranscript = async (newTranscript: any[]) => {
    setTranscript(newTranscript)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Video URL Input */}
        <div className="max-w-2xl mx-auto mb-10">
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
          <UnifiedPracticeView
            video={{
              id: videoId,
              title: videoTitle || "Individual Video",
              segments: segments.map(s => ({ ...s, createdAt: s.createdAt || Date.now() })) as any[],
              transcript: transcript,
              thumbnail: "", channelName: "", duration: 0, addedAt: 0, lastPracticedAt: null, recordings: [],
              notes: notes
            }}
            recordings={recordings}
            onAddSegments={handleAddSegments}
            onClearSegments={handleClearSegments}
            onDeleteSegment={handleDeleteSegment}
            onSaveRecording={handleSaveRecording}
            onDeleteRecording={handleDeleteRecording}
            onUpdateNotes={handleUpdateNotes}
            onUpdateTranscript={handleUpdateTranscript}
            isLoading={isLoading}
          />
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

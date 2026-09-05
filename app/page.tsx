"use client"

import { useEffect, useMemo, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from "@/utils/supabase/client"
import { LogOut, User as UserIcon, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { VideoLoader } from '@/components/video-loader'
import { KeyboardHelp } from '@/components/keyboard-help'
import { useAppStore } from '@/lib/store'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UnifiedPracticeView } from '@/components/unified-practice-view'
import { getCuratedCollection } from '@/lib/curated-library'
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
            <a href="/library" className="text-xs">Library</a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="/curated" className="text-xs">Curated</a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="/explore" className="text-xs">Explore</a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="/history" className="text-xs">History</a>
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
            <Button variant="default" size="sm" onClick={() => router.push('/login')}>Login</Button>
          )}

          <KeyboardHelp />
        </div>
      </div>
    </header>
  )
}

function HomeContent() {
  const searchParams = useSearchParams()
  const urlVideoId = searchParams.get('v')
  const curatedId = searchParams.get('curated')
  const [initialized, setInitialized] = useState(false)
  const {
    videoId, error, isLoading, initialize,
    segments, recordings, removeSegment, setSegments,
    addRecording, removeRecording, videoTitle,
    notes, setNotes, loadVideo,
  } = useAppStore()

  const curatedCollection = useMemo(() => getCuratedCollection(curatedId), [curatedId])

  useEffect(() => {
    let cancelled = false

    initialize().finally(() => {
      if (!cancelled) setInitialized(true)
    })

    return () => {
      cancelled = true
    }
  }, [initialize])

  useEffect(() => {
    if (initialized && urlVideoId && urlVideoId !== videoId && !isLoading) {
      loadVideo(urlVideoId)
    }
  }, [initialized, urlVideoId, videoId, isLoading, loadVideo])

  // Curated clip boundaries are source-controlled and should always replace session clips.
  useEffect(() => {
    if (!initialized || !curatedCollection || isLoading || videoId !== curatedCollection.videoId) return
    setSegments(curatedCollection.segments.map(segment => ({ ...segment, lines: [] })))
  }, [initialized, curatedCollection, videoId, isLoading, setSegments])

  const handleAddSegments = async (newSegments: any[]) => {
    const formattedSegments = newSegments.map(s => ({
      id: crypto.randomUUID(),
      ...s,
      lines: [],
      createdAt: Date.now(),
    }))
    setSegments([...segments, ...formattedSegments])
  }

  const handleClearSegments = async () => {
    if (confirm("Clear all segments?")) setSegments([])
  }

  const handleDeleteSegment = async (id: string) => removeSegment(id)
  const handleSaveRecording = async (rec: any) => addRecording(rec)
  const handleDeleteRecording = async (id: string) => removeRecording(id)
  const handleUpdateNotes = async (nextNotes: string) => setNotes(nextNotes)

  const blockingError = error?.startsWith('No transcript available') ? null : error

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto mb-10">
          <VideoLoader />
          {blockingError && (
            <Alert variant="destructive" className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{blockingError}</AlertDescription>
            </Alert>
          )}
        </div>

        {videoId && (
          <UnifiedPracticeView
            video={{
              id: videoId,
              title: videoTitle || "Individual Video",
              segments: segments.map(s => ({ ...s, lines: [], createdAt: s.createdAt || Date.now() })) as any[],
              transcript: [],
              thumbnail: "",
              channelName: "",
              duration: 0,
              addedAt: 0,
              lastPracticedAt: null,
              recordings: [],
              notes,
            }}
            recordings={recordings}
            onAddSegments={handleAddSegments}
            onClearSegments={handleClearSegments}
            onDeleteSegment={handleDeleteSegment}
            onSaveRecording={handleSaveRecording}
            onDeleteRecording={handleDeleteRecording}
            onUpdateNotes={handleUpdateNotes}
            isLoading={isLoading}
          />
        )}

        {!videoId && !isLoading && (
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-3">Your Personal Speaking Gym</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Paste a YouTube URL, choose a segment, shadow the speaker, record yourself, and compare.
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
              <span className="px-3 py-1 bg-secondary/50 rounded">Focused</span>
              <span className="px-3 py-1 bg-secondary/50 rounded">Local Recording</span>
              <span className="px-3 py-1 bg-secondary/50 rounded">Loop Practice</span>
            </div>
          </div>
        )}
      </main>

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

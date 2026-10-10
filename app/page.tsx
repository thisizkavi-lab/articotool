"use client"

import { useEffect, useMemo, useState, Suspense, type ReactNode } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from "@/utils/supabase/client"
import { LogOut, User as UserIcon, AlertCircle, Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { VideoLoader } from '@/components/video-loader'
import { KeyboardHelp } from '@/components/keyboard-help'
import { FeaturedCollections, LandingHero } from '@/components/home-landing'
import { useAppStore } from '@/lib/store'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UnifiedPracticeView } from '@/components/unified-practice-view'
import { getCuratedCollection } from '@/lib/curated-library'
import { getThreeBlueCollection } from '@/lib/threeblue-curated'
import { getJackSandersCollection } from '@/lib/jack-sanders-curated'
import { getJohnathanBiCollection } from '@/lib/johnathan-bi-curated'
import { getGoldnrushCollection } from '@/lib/goldnrush-curated'
import { getEverydayEnglishCollection } from '@/lib/everyday-english-clips'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Curated leads: it's the clearest entry point for a first-time visitor.
const NAV_LINKS = [
  ['Curated', '/curated'],
  ['Explore', '/explore'],
  ['Library', '/library'],
  ['History', '/history'],
] as const

// Brand + navigation. Hook-free so it can also render in the server fallback.
function HeaderFrame({ onHomeClick, children }: { onHomeClick?: () => void; children?: ReactNode }) {
  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2">
        <div className="min-w-0 flex items-center gap-4">
          <h1 className="text-sm sm:text-xl font-semibold tracking-tight truncate">
            <Link href="/" onClick={onHomeClick} className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              artiCO shadowing tool
            </Link>
          </h1>
          <span className="text-xs text-muted-foreground hidden xl:block">
            Shadow. Record. Compare. Repeat.
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map(([label, href]) => (
              <Button key={href} variant="ghost" size="sm" asChild>
                <Link href={href} className="text-xs">{label}</Link>
              </Button>
            ))}
            <div className="h-4 w-[1px] bg-border mx-2" />
          </nav>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Practice</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {NAV_LINKS.map(([label, href]) => (
                <DropdownMenuItem key={href} asChild><Link href={href}>{label}</Link></DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {children}
        </div>
      </div>
    </header>
  )
}

function Header({ onHomeClick }: { onHomeClick: () => void }) {
  const { user, isLoading } = useAppStore()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <HeaderFrame onHomeClick={onHomeClick}>
      {isLoading ? (
        <Button variant="ghost" size="sm" disabled>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </Button>
      ) : user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
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
    </HeaderFrame>
  )
}

const PRIVACY_NOTE = 'All recordings stay in your browser. Nothing is uploaded.'

/*
 * Server-rendered first paint. HomeContent reads search params, so Next renders
 * this fallback as static HTML: visitors (and link previews / crawlers) get the
 * real landing page instead of a bare "Loading...".
 */
function HomeFallback() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeaderFrame />
      <main className="flex-1 container mx-auto px-4 pt-14 pb-16">
        <div className="max-w-2xl mx-auto mb-12">
          <LandingHero />
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Paste YouTube URL..."
              aria-label="YouTube URL"
              className="flex-1 bg-secondary/50 border-border/50"
              disabled
            />
            <Button disabled className="min-w-[100px]">Load Video</Button>
          </div>
        </div>
        <FeaturedCollections />
      </main>
      <footer className="border-t border-border/50 py-4 text-center text-xs text-muted-foreground">
        <p>{PRIVACY_NOTE}</p>
      </footer>
    </div>
  )
}

function HomeContent() {
  const searchParams = useSearchParams()
  const urlVideoId = searchParams.get('v')
  const curatedId = searchParams.get('curated')
  const [initialized, setInitialized] = useState(false)
  const [showHome, setShowHome] = useState(false)
  const {
    videoId, error, isLoading, initialize,
    segments, recordings, removeSegment, setSegments, setTranscript,
    addRecording, removeRecording, videoTitle,
    notes, setNotes, loadVideo,
  } = useAppStore()

  const curatedCollection = useMemo(
    () => getCuratedCollection(curatedId) || getThreeBlueCollection(curatedId) || getJackSandersCollection(curatedId) || getJohnathanBiCollection(curatedId) || getGoldnrushCollection(curatedId) || getEverydayEnglishCollection(curatedId),
    [curatedId],
  )

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
    if (initialized && urlVideoId && urlVideoId !== useAppStore.getState().videoId) {
      loadVideo(urlVideoId)
    }
  }, [initialized, urlVideoId, loadVideo])

  useEffect(() => {
    if (urlVideoId) setShowHome(false)
  }, [urlVideoId])

  // Curated clip boundaries are source-controlled and should always replace session clips.
  useEffect(() => {
    if (!initialized || !curatedCollection || isLoading || videoId !== curatedCollection.videoId) return
    const curatedSegments = curatedCollection.segments.map(segment => ({
      ...segment,
      lines: [...segment.lines],
    }))
    setSegments(curatedSegments)

    // Some performed sources do not expose captions through YouTube. A curated
    // source can still ship with a short, reviewed transcript layer so the
    // practice view remains shadowable while the background fetch stays optional.
    const curatedTranscript = curatedSegments
      .flatMap(segment => segment.lines)
      .sort((a, b) => a.start - b.start)
    if (curatedTranscript.length > 0) setTranscript(curatedTranscript)
  }, [initialized, curatedCollection, videoId, isLoading, setSegments, setTranscript])

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

  // Landing doesn't wait on hydration: it matches the server-rendered fallback,
  // so first-time visitors never see a blank flash. A restored session or a
  // ?v= link swaps it for the practice view.
  const showLanding = showHome || (!videoId && !urlVideoId)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onHomeClick={() => setShowHome(true)} />

      <main className={`flex-1 container mx-auto px-4 ${showLanding ? 'pt-14 pb-16' : 'py-6'}`}>
        <div className={`max-w-2xl mx-auto ${showLanding ? 'mb-12' : 'mb-10'}`}>
          {showLanding && <LandingHero />}
          <VideoLoader />
          {blockingError && (
            <Alert variant="destructive" className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{blockingError}</AlertDescription>
            </Alert>
          )}
        </div>

        {videoId && !showHome && (
          <UnifiedPracticeView
            key={videoId}
            video={{
              id: videoId,
              title: videoTitle || "Individual Video",
              segments,
              transcript: [],
              thumbnail: "",
              channelName: "",
              duration: 0,
              addedAt: 0,
              lastPracticedAt: null,
              recordings: [],
              notes,
            }}
            recordings={recordings.filter(recording => !recording.groupId && (!recording.videoId || recording.videoId === videoId))}
            onAddSegments={handleAddSegments}
            onClearSegments={handleClearSegments}
            onDeleteSegment={handleDeleteSegment}
            onSaveRecording={handleSaveRecording}
            onDeleteRecording={handleDeleteRecording}
            onUpdateNotes={handleUpdateNotes}
            isLoading={isLoading}
          />
        )}

        {showLanding && <FeaturedCollections />}
      </main>

      <footer className="border-t border-border/50 py-4 text-center text-xs text-muted-foreground">
        <p>{PRIVACY_NOTE}</p>
      </footer>
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  )
}

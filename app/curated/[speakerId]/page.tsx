import { ArrowLeft, Clock, Play, Sparkles, CheckCircle2, CircleDashed } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getCuratedSpeaker } from '@/lib/curated-library'

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default async function CuratedSpeakerPage({ params }: { params: Promise<{ speakerId: string }> }) {
  const { speakerId } = await params
  const speaker = getCuratedSpeaker(speakerId)
  if (!speaker) notFound()

  const readySources = speaker.sources.filter(source => source.status === 'ready')
  const readyClips = readySources.reduce((sum, source) => sum + source.segments.length, 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <a href="/curated" aria-label="Back to curated people">
              <ArrowLeft className="h-4 w-4" />
            </a>
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{speaker.name}</h1>
            <p className="text-xs text-muted-foreground">{readySources.length} ready sources · {readyClips} curated clips</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr] mb-12">
          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-secondary">
            <img src={speaker.portrait} alt={speaker.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Sparkles className="h-4 w-4" />
              Articulation study
            </div>
            <h2 className="text-3xl font-semibold tracking-tight mb-3">Learn the underlying speaking machinery.</h2>
            <p className="text-muted-foreground leading-relaxed max-w-3xl mb-5">{speaker.description}</p>
            <div className="flex flex-wrap gap-2">
              {speaker.focus.map(item => (
                <span key={item} className="text-xs px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-5">
          <h3 className="text-xl font-semibold tracking-tight">Sources</h3>
          <p className="text-sm text-muted-foreground mt-1">We curate one long-form source at a time. Ready sources open directly in the practice engine.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {speaker.sources.map(source => {
            const isReady = source.status === 'ready' && source.videoId !== null
            const totalPracticeSeconds = source.segments.reduce((sum, item) => sum + (item.end - item.start), 0)
            const practiceUrl = isReady ? `/?v=${source.videoId}&curated=${source.id}` : undefined

            return (
              <Card key={source.id} className={`overflow-hidden ${!isReady ? 'opacity-75' : ''}`}>
                {source.thumbnail ? (
                  <div className="aspect-video overflow-hidden bg-secondary">
                    <img src={source.thumbnail} alt={source.videoTitle} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video bg-secondary/50 flex items-center justify-center">
                    <CircleDashed className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                )}

                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    {isReady ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Curated
                      </>
                    ) : (
                      <>
                        <CircleDashed className="h-3.5 w-3.5" />
                        In the curation queue
                      </>
                    )}
                  </div>

                  <h4 className="text-lg font-semibold leading-snug mb-2">{source.sourceTitle}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{source.description}</p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {source.focus.slice(0, 4).map(item => (
                      <span key={item} className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">
                        {item}
                      </span>
                    ))}
                  </div>

                  {isReady ? (
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-xs text-muted-foreground">
                        <div>{source.segments.length} clips</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatTime(totalPracticeSeconds)} selected practice
                        </div>
                      </div>
                      <Button asChild size="sm">
                        <a href={practiceUrl}>
                          <Play className="h-4 w-4 mr-2" />
                          Practice
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Transcript audit and segment selection still to be completed.</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}

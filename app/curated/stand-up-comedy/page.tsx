import { ArrowLeft, CheckCircle2, Clock, Play } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CURATED_SPEAKERS } from '@/lib/curated-library'
import { STAND_UP_COMEDY_MODELS } from '@/lib/stand-up-comedy'

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function StandUpComedyPage() {
  const standUpModelIds = new Set(STAND_UP_COMEDY_MODELS.map(model => model.id))
  const standUpSpeakers = CURATED_SPEAKERS.filter(speaker => standUpModelIds.has(speaker.id))
  const readySources = standUpSpeakers.flatMap(speaker =>
    speaker.sources.filter(source => source.status === 'ready' && source.videoId !== null),
  )
  const pendingSources = standUpSpeakers.flatMap(speaker =>
    speaker.sources.filter(source => source.status !== 'ready'),
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/curated" aria-label="Back to curated collections">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Stand-up Comedy</h1>
            <p className="text-xs text-muted-foreground">English · performance language</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-7 max-w-7xl">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Videos</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Open a performance to practice its curated segments.</p>
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            {readySources.length} ready source{readySources.length === 1 ? '' : 's'} · {STAND_UP_COMEDY_MODELS.length} models
          </p>
        </div>

        {readySources.length > 0 ? (
          <div className="grid gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {readySources.map(source => {
              const totalPracticeSeconds = source.segments.reduce((sum, item) => sum + (item.end - item.start), 0)
              const practiceUrl = `/?v=${source.videoId}&curated=${source.id}`

              return (
                <Link key={source.id} href={practiceUrl} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
                  <article className="group">
                    <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary border border-border/40">
                      <img
                        src={source.thumbnail}
                        alt={source.videoTitle}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                      />

                      <div className="absolute top-2 left-2 rounded bg-black/75 px-1.5 py-0.5 text-[10px] text-white flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Curated
                      </div>

                      {source.duration > 0 && (
                        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white">
                          {formatTime(source.duration)}
                        </span>
                      )}

                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/25 group-hover:opacity-100">
                        <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                          <Play className="h-4 w-4 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 px-0.5">
                      <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {source.sourceTitle}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-1 truncate">
                        {source.speaker} · {source.channelName || 'Performance'}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                        <span>{source.segments.length} segments</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(totalPracticeSeconds)} selected
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
            No performances are ready to practice yet.
          </div>
        )}

        {pendingSources.length > 0 && (
          <section className="mt-12 border-t border-border/60 pt-7">
            <div className="mb-4">
              <h2 className="text-lg font-semibold tracking-tight">Still curating</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Candidates stay here until the source, transcript, and playback timebase are dependable.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {pendingSources.map(source => {
                const statusLabel = source.status === 'curating' ? 'Transcript review' : 'Queued'
                const statusClass = source.status === 'curating'
                  ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                  : 'bg-secondary text-secondary-foreground'

                return (
                  <div key={source.id} className="rounded-xl border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] text-muted-foreground">{source.speaker}</p>
                        <h3 className="text-sm font-semibold leading-snug mt-1">{source.sourceTitle}</h3>
                      </div>
                      <span className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-medium ${statusClass}`}>{statusLabel}</span>
                    </div>
                    {source.videoId && (
                      <a
                        href={`https://www.youtube.com/watch?v=${source.videoId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-xs font-medium text-primary hover:underline"
                      >
                        Open source
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

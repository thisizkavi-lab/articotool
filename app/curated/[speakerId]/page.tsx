import { ArrowLeft, Clock, Play, Sparkles, CheckCircle2 } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
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

  const readySources = speaker.sources.filter(source => source.status === 'ready' && source.videoId !== null)
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
            <p className="text-xs text-muted-foreground">{readySources.length} curated sources · {readyClips} shadowing clips</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-7 max-w-7xl">
        <section className="grid gap-6 md:grid-cols-[180px_1fr] items-center mb-9">
          <div className="aspect-square overflow-hidden rounded-xl bg-secondary max-w-[180px]">
            <img src={speaker.portrait} alt={speaker.name} className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Articulation study
            </div>
            <h2 className="text-2xl font-semibold tracking-tight mb-2">Only finished sources belong here.</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl mb-4">{speaker.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {speaker.focus.map(item => (
                <span key={item} className="text-[11px] px-2 py-1 rounded-md bg-secondary text-secondary-foreground">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">Ready to shadow</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Every source below already has hand-selected, playable clip boundaries.</p>
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">Open any source and start immediately.</p>
        </div>

        <div className="grid gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {readySources.map(source => {
            const totalPracticeSeconds = source.segments.reduce((sum, item) => sum + (item.end - item.start), 0)
            const practiceUrl = `/?v=${source.videoId}&curated=${source.id}`

            return (
              <a key={source.id} href={practiceUrl} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
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
                    <h4 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {source.sourceTitle}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-1 truncate">
                      {source.channelName || 'Naval corpus'}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-foreground">
                      <span>{source.segments.length} clips</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(totalPracticeSeconds)} selected
                      </span>
                    </div>
                  </div>
                </article>
              </a>
            )
          })}
        </div>
      </main>
    </div>
  )
}

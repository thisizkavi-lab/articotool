import { ArrowLeft, CheckCircle2, CircleDashed, ExternalLink, Languages, Play, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SourceStatus = 'ready' | 'curating' | 'queued'

type GoldnrushSource = {
  id: string
  title: string
  guest: string
  status: SourceStatus
  videoId: string | null
  duration: string
  clipCount: number
  note: string
}

const sources: GoldnrushSource[] = [
  {
    id: 'goldnrush-mendy-116',
    title: '関口メンディー · GOLDNRUSH Ep.116',
    guest: '関口メンディー',
    status: 'ready',
    videoId: 'aQ3rPDWuKrI',
    duration: '1:00:34',
    clipCount: 16,
    note: 'Natural phrasing, reframing, explanation, self-reflection, and clean single-speaker delivery.',
  },
  {
    id: 'goldnrush-ito-awa-137',
    title: '伊藤亜和 · GOLDNRUSH Ep.137',
    guest: '伊藤亜和',
    status: 'ready',
    videoId: 'FBA7X77QSPI',
    duration: '1:16:53',
    clipCount: 8,
    note: 'Thinking aloud, qualification, writing process, self-deprecation, and nuanced opinion.',
  },
  {
    id: 'goldnrush-zeebra-149',
    title: 'Zeebra · GOLDNRUSH Ep.149',
    guest: 'Zeebra',
    status: 'ready',
    videoId: '2mDTZiK4Dug',
    duration: '1:17:07',
    clipCount: 7,
    note: 'Clear opinion-building, originality, comparison, responsibility, and compact storytelling.',
  },
  {
    id: 'goldnrush-sarasa-154',
    title: 'さらさ · GOLDNRUSH Ep.154',
    guest: 'さらさ',
    status: 'ready',
    videoId: 'hTvGxeAMOuU',
    duration: '58:48',
    clipCount: 11,
    note: 'Young contemporary Japanese with introspection, emotional precision, values, and natural problem-solving language.',
  },
  {
    id: 'goldnrush-shigekix',
    title: 'Shigekix · GOLDNRUSH Ep.106',
    guest: 'Shigekix',
    status: 'ready',
    videoId: 'pN7VRUwrXn0',
    duration: '53:37',
    clipCount: 11,
    note: 'Energetic explanation, originality, creative identity, challenge, and motivating other people.',
  },
  {
    id: 'goldnrush-nishida-yuji',
    title: '西田有志 · GOLDNRUSH Ep.110',
    guest: '西田有志',
    status: 'ready',
    videoId: '5eCWPY7k0Z4',
    duration: '1:08:42',
    clipCount: 14,
    note: 'Direct practical Japanese on learning, feedback, teamwork, pressure, practice, and effort.',
  },
]

export default function GoldnrushJapanesePage() {
  const ready = sources.filter(source => source.status === 'ready').length
  const curating = sources.filter(source => source.status === 'curating').length
  const queued = sources.filter(source => source.status === 'queued').length
  const clips = sources.reduce((sum, source) => sum + source.clipCount, 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <a href="/curated" aria-label="Back to curated collections">
              <ArrowLeft className="h-4 w-4" />
            </a>
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Japanese · GOLDNRUSH</h1>
            <p className="text-xs text-muted-foreground">{ready} ready · {clips} clips · {curating} curating · {queued} queued</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-7 max-w-7xl">
        <section className="max-w-3xl mb-9">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Languages className="h-3.5 w-3.5" />
            Curated / Japanese / GOLDNRUSH
          </div>
          <h2 className="text-2xl font-semibold tracking-tight mb-2">Build native conversational Japanese carefully.</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Each source is reviewed separately. Only reusable guest turns with defensible timestamps, coherent boundaries, and strong conversational value are promoted into practice.
          </p>
          <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-secondary/20 px-3 py-2.5 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 mt-0.5 shrink-0" />
            <p>GOLDNRUSH v1 is ready: six speakers, 67 deliberately selected clips. Pick a voice and start shadowing.</p>
          </div>
        </section>

        <div className="grid gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map(source => {
            const isReady = source.status === 'ready'
            const isCurating = source.status === 'curating'
            const thumbnail = source.videoId ? `https://i.ytimg.com/vi/${source.videoId}/hqdefault.jpg` : null

            return (
              <article key={source.id} className="group">
                <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary border border-border/40">
                  {thumbnail ? (
                    <img src={thumbnail} alt={source.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-secondary/50">
                      <CircleDashed className="h-7 w-7 text-muted-foreground/35" />
                    </div>
                  )}

                  <div className={`absolute top-2 left-2 rounded px-1.5 py-0.5 text-[10px] text-white flex items-center gap-1 ${isReady ? 'bg-emerald-700/90' : isCurating ? 'bg-blue-700/90' : 'bg-black/75'}`}>
                    {isReady ? <CheckCircle2 className="h-3 w-3" /> : <CircleDashed className={`h-3 w-3 ${isCurating ? 'animate-spin' : ''}`} />}
                    {isReady ? 'Ready' : isCurating ? 'Curating' : 'Queued'}
                  </div>

                  {source.duration && (
                    <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white">
                      {source.duration}
                    </span>
                  )}
                </div>

                <div className="pt-2.5 px-0.5">
                  <h3 className="text-sm font-semibold leading-snug">{source.title}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    GOLDNRUSH Podcast · {source.guest}{source.clipCount ? ` · ${source.clipCount} clips` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2">{source.note}</p>

                  <div className="flex flex-wrap gap-3 mt-3">
                    {isReady && source.videoId && (
                      <a
                        href={`/?v=${source.videoId}&curated=${source.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold hover:text-primary transition-colors"
                      >
                        <Play className="h-3 w-3" />
                        Start shadowing
                      </a>
                    )}
                    {source.videoId && (
                      <a
                        href={`https://www.youtube.com/watch?v=${source.videoId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        Open source
                        <ExternalLink className="h-3 w-3" />
                        Open source
                      </a>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </main>
    </div>
  )
}

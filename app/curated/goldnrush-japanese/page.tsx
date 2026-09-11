import { ArrowLeft, CheckCircle2, CircleDashed, ExternalLink, Languages, Play, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { goldnrushMendy116 } from '@/lib/goldnrush-library'

const sources = [
  {
    id: goldnrushMendy116.id,
    title: '関口メンディー · GOLDNRUSH Ep.116',
    guest: '関口メンディー',
    status: 'ready' as const,
    videoId: goldnrushMendy116.videoId,
    duration: '1:00:34',
    clipCount: goldnrushMendy116.segments.length,
    note: 'Curated from the full Japanese conversation. The selected clips favor clean Mendy turns with natural qualification, storytelling, reframing, explanation, and reflective conversational rhythm.',
  },
  {
    id: 'goldnrush-ito-awa-137',
    title: '伊藤亜和 · GOLDNRUSH Ep.137',
    guest: '伊藤亜和',
    status: 'curating' as const,
    videoId: 'FBA7X77QSPI',
    duration: '1:16:53',
    clipCount: 0,
    note: 'Japanese transcript and speaker turns are next in the curation queue.',
  },
  {
    id: 'goldnrush-zeebra-149',
    title: 'Zeebra · GOLDNRUSH Ep.149',
    guest: 'Zeebra',
    status: 'queued' as const,
    videoId: null,
    duration: '',
    clipCount: 0,
    note: 'Queued for one-source-at-a-time Japanese transcript verification and clip selection.',
  },
  {
    id: 'goldnrush-sarasa-154',
    title: 'さらさ · GOLDNRUSH Ep.154',
    guest: 'さらさ',
    status: 'queued' as const,
    videoId: null,
    duration: '',
    clipCount: 0,
    note: 'Queued for one-source-at-a-time Japanese transcript verification and clip selection.',
  },
  {
    id: 'goldnrush-shigekix',
    title: 'Shigekix · GOLDNRUSH guest episode',
    guest: 'Shigekix',
    status: 'queued' as const,
    videoId: null,
    duration: '',
    clipCount: 0,
    note: 'Queued. Kansai speech should be preserved and tagged rather than normalized away when this source is curated.',
  },
  {
    id: 'goldnrush-nishida-yuji',
    title: '西田有志 · GOLDNRUSH guest episode',
    guest: '西田有志',
    status: 'queued' as const,
    videoId: null,
    duration: '',
    clipCount: 0,
    note: 'Queued for one-source-at-a-time Japanese transcript verification and clip selection.',
  },
]

export default function GoldnrushJapanesePage() {
  const ready = sources.filter(source => source.status === 'ready').length
  const curating = sources.filter(source => source.status === 'curating').length
  const queued = sources.filter(source => source.status === 'queued').length

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
            <p className="text-xs text-muted-foreground">{ready} ready · {curating} curating · {queued} queued</p>
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
            Sources are processed one at a time. The full Japanese conversation is used to find clean speaker turns, then only natural, reusable clips worth shadowing are promoted into practice.
          </p>
          <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-secondary/20 px-3 py-2.5 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 mt-0.5 shrink-0" />
            <p>Ready sources open directly in the existing shadowing screen. Curating and queued sources stay visible without pretending unfinished material is ready.</p>
          </div>
        </section>

        <div className="grid gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map(source => {
            const isReady = source.status === 'ready' && source.videoId
            const isCurating = source.status === 'curating'
            const thumbnail = source.videoId ? `https://i.ytimg.com/vi/${source.videoId}/hqdefault.jpg` : null
            const practiceUrl = isReady ? `/?v=${source.videoId}&curated=${source.id}` : undefined

            const card = (
              <article className={`group ${source.status === 'queued' ? 'opacity-70' : ''}`}>
                <div className="relative aspect-video overflow-hidden rounded-lg bg-secondary border border-border/40">
                  {thumbnail ? (
                    <img src={thumbnail} alt={source.title} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-secondary/50">
                      <CircleDashed className="h-7 w-7 text-muted-foreground/35" />
                    </div>
                  )}

                  <div className={`absolute top-2 left-2 rounded px-1.5 py-0.5 text-[10px] text-white flex items-center gap-1 ${isReady ? 'bg-emerald-700/90' : isCurating ? 'bg-blue-700/90' : 'bg-black/75'}`}>
                    {isReady ? <CheckCircle2 className="h-3 w-3" /> : <CircleDashed className={`h-3 w-3 ${isCurating ? 'animate-spin' : ''}`} />}
                    {isReady ? 'Curated' : isCurating ? 'Curating' : 'Queued'}
                  </div>

                  {source.duration && (
                    <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white">
                      {source.duration}
                    </span>
                  )}

                  {isReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/25 group-hover:opacity-100">
                      <div className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg">
                        <Play className="h-4 w-4 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2.5 px-0.5">
                  <h3 className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors">{source.title}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1">GOLDNRUSH Podcast · {source.guest}</p>
                  {isReady && <p className="text-[11px] font-medium mt-1.5">{source.clipCount} carefully selected clips</p>}
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2">{source.note}</p>

                  {!isReady && source.videoId && (
                    <a
                      href={`https://www.youtube.com/watch?v=${source.videoId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium mt-3 hover:text-primary transition-colors"
                    >
                      Open source
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </article>
            )

            return practiceUrl ? (
              <a key={source.id} href={practiceUrl} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
                {card}
              </a>
            ) : (
              <div key={source.id}>{card}</div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

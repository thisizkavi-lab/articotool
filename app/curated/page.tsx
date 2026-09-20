import { ArrowLeft, ArrowRight, BookOpen, Languages, Mic2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CURATED_SPEAKERS } from '@/lib/curated-library'
import { STAND_UP_COMEDY_MODELS } from '@/lib/stand-up-comedy'

export default function CuratedPage() {
  const standUpModelIds = new Set(STAND_UP_COMEDY_MODELS.map(model => model.id))
  const standUpSpeakers = CURATED_SPEAKERS.filter(speaker => standUpModelIds.has(speaker.id))
  const standUpReadySources = standUpSpeakers.flatMap(speaker => speaker.sources.filter(source => source.status === 'ready'))
  const standUpReadyClips = standUpReadySources.reduce((sum, source) => sum + source.segments.length, 0)
  const standUpReadyModels = standUpSpeakers.filter(speaker => speaker.sources.some(source => source.status === 'ready')).length

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" aria-label="Back to practice">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Curated</h1>
            <p className="text-xs text-muted-foreground">Speaking models worth studying deeply.</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Sparkles className="h-4 w-4" />
            Permanent training corpus
          </div>
          <h2 className="text-3xl font-semibold tracking-tight mb-3">Study a speaking system, not a random clip.</h2>
          <p className="text-muted-foreground">
            Each collection grows source by source, with only carefully selected segments promoted into practice.
            Sources being processed stay visible as curating; queued sources wait their turn.
          </p>
        </div>

        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold tracking-tight">English</h3>
              <p className="text-xs text-muted-foreground">Articulation, formulation, clarity, and high-level conversational English.</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {CURATED_SPEAKERS.filter(speaker => !standUpModelIds.has(speaker.id)).map(speaker => {
              const readySources = speaker.sources.filter(source => source.status === 'ready')
              const readyClips = readySources.reduce((sum, source) => sum + source.segments.length, 0)

              return (
                <Link key={speaker.id} href={`/curated/${speaker.id}`} className="block group">
                  <Card className="h-full overflow-hidden transition-colors group-hover:border-primary/50">
                    <div className="aspect-[16/9] bg-secondary overflow-hidden">
                      <img
                        src={speaker.portrait}
                        alt={speaker.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h4 className="text-2xl font-semibold tracking-tight">{speaker.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {readySources.length} ready source{readySources.length !== 1 ? 's' : ''} · {readyClips} curated clips
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground mt-1 transition-transform group-hover:translate-x-1" />
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{speaker.description}</p>

                      <div className="flex flex-wrap gap-2 mb-5">
                        {speaker.focus.slice(0, 4).map(item => (
                          <span key={item} className="text-xs px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground">
                            {item}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-sm font-medium">
                        <BookOpen className="h-4 w-4" />
                        Open study collection
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}

            <Link href="/curated/stand-up-comedy" className="block group">
              <Card className="h-full overflow-hidden transition-colors group-hover:border-primary/50">
                <div className="aspect-[16/9] bg-secondary flex items-center justify-center px-8">
                  <div className="text-center">
                    <Mic2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" strokeWidth={1.25} />
                    <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground">STAND-UP COMEDY</p>
                    <p className="mt-2 text-sm text-muted-foreground">Make ideas land like a performance.</p>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">English · performance language</p>
                      <h4 className="text-2xl font-semibold tracking-tight">Stand-up Comedy</h4>
                      <p className="text-sm text-muted-foreground mt-1">{STAND_UP_COMEDY_MODELS.length} reference models · {standUpReadyModels} active · {standUpReadyClips} clips ready</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground mt-1 transition-transform group-hover:translate-x-1" />
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    Study the mechanics behind memorable communication: story, rhythm, audience connection, structure, persuasion, and language.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {['Storytelling', 'Rhythm', 'Audience', 'Structure'].map(item => (
                      <span key={item} className="text-xs px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground">
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium">
                    <BookOpen className="h-4 w-4" />
                    Open reference collection
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Japanese</h3>
              <p className="text-xs text-muted-foreground">Natural contemporary conversation, rhythm, reactions, turn-taking, and reusable phrasing.</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <Link href="/curated/goldnrush-japanese" className="block group">
              <Card className="h-full overflow-hidden transition-colors group-hover:border-primary/50">
                <div className="aspect-[16/9] bg-secondary overflow-hidden">
                  <img
                    src="https://i.ytimg.com/vi/aQ3rPDWuKrI/hqdefault.jpg"
                    alt="GOLDNRUSH Japanese conversation corpus"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Japanese · GOLDNRUSH</p>
                      <h4 className="text-2xl font-semibold tracking-tight">GOLDNRUSH Podcast</h4>
                      <p className="text-sm text-muted-foreground mt-1">1 ready source · 16 curated clips · 1 curating · 4 queued</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground mt-1 transition-transform group-hover:translate-x-1" />
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    A Japanese conversation corpus built from carefully chosen GOLDNRUSH guests. Only verified clips are promoted into shadowing practice.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {['Conversation', 'Natural Japanese', 'Turn-taking', 'Shadowing'].map(item => (
                      <span key={item} className="text-xs px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground">
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium">
                    <BookOpen className="h-4 w-4" />
                    Open Japanese collection
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}

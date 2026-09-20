import { ArrowLeft, ArrowRight, BookOpen, Check, Mic2, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getCuratedSpeaker } from '@/lib/curated-library'
import { STAND_UP_COMEDY_MODELS } from '@/lib/stand-up-comedy'

export default function StandUpComedyPage() {
  const mikeSpeaker = getCuratedSpeaker('mike-birbiglia')
  const mikeReadySources = mikeSpeaker?.sources.filter(source => source.status === 'ready') ?? []
  const mikeReadyClips = mikeReadySources.reduce((sum, source) => sum + source.segments.length, 0)
  const mikeCuratingSources = mikeSpeaker?.sources.filter(source => source.status === 'curating').length ?? 0
  const mikeQueuedSources = mikeSpeaker?.sources.filter(source => source.status === 'queued').length ?? 0

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
            <p className="text-xs text-muted-foreground">English presentation reference models.</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <section className="max-w-3xl mb-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Sparkles className="h-4 w-4" />
            Communication through performance
          </div>
          <h2 className="text-3xl font-semibold tracking-tight mb-3">Make ideas land like a performance.</h2>
          <p className="text-muted-foreground leading-relaxed">
            These six comedians are reference models for becoming a stronger science communicator. We are studying the mechanics of delivery—how to structure a thought, hold attention, translate complexity, build an argument, and leave a line in someone&apos;s memory.
          </p>
        </section>

        <section className="mb-10 rounded-2xl border bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">First curation pass</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">Mike Birbiglia is ready to shadow.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                One full performed show has been reduced to {mikeReadyClips} short practice clips. The next performed candidates stay visible in the pipeline until their transcript and timebase are reliable enough to promote.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {mikeReadySources.length} source ready · {mikeCuratingSources} in transcript review · {mikeQueuedSources} queued
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link href="/curated/mike-birbiglia">
                <BookOpen className="h-4 w-4" />
                Open Mike&apos;s set
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3 mb-10">
          <div className="rounded-xl border bg-card px-5 py-4">
            <p className="text-2xl font-semibold">{STAND_UP_COMEDY_MODELS.length}</p>
            <p className="text-sm text-muted-foreground mt-1">reference models</p>
          </div>
          <div className="rounded-xl border bg-card px-5 py-4">
            <p className="text-2xl font-semibold">English</p>
            <p className="text-sm text-muted-foreground mt-1">communication track</p>
          </div>
          <div className="rounded-xl border bg-card px-5 py-4">
            <p className="text-2xl font-semibold">{mikeReadyClips}</p>
            <p className="text-sm text-muted-foreground mt-1">Mike clips ready</p>
          </div>
        </section>

        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">The reference shelf</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Start with the skill, then study the choices that make it work.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <Mic2 className="h-3.5 w-3.5" />
            {STAND_UP_COMEDY_MODELS.length} models
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {STAND_UP_COMEDY_MODELS.map((model, index) => (
            <Card key={model.id} className="h-full">
              <CardContent className="p-5 flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Model {String(index + 1).padStart(2, '0')}</p>
                    <h4 className="text-xl font-semibold tracking-tight">{model.name}</h4>
                    <p className="text-sm font-medium mt-1">{model.skill}</p>
                  </div>
                  <Mic2 className="h-5 w-5 text-muted-foreground shrink-0" strokeWidth={1.5} />
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mt-4">{model.description}</p>

                <div className="mt-5">
                  <p className="text-xs font-medium text-muted-foreground mb-2">What to study</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {model.study.map(item => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-5 border-t border-border/60">
                  {model.id === 'mike-birbiglia' ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/curated/mike-birbiglia">
                        <BookOpen className="h-4 w-4" />
                        Open curated clips
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground">Next in line · curation has not started yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-8 max-w-2xl">
          Clips are promoted only after performance, transcript, and playback review. Mike&apos;s page shows the ready set alongside the remaining source queue so the corpus grows deliberately.
        </p>
      </main>
    </div>
  )
}

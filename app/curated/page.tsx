import { ArrowLeft, ArrowRight, BookOpen, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CURATED_SPEAKERS } from '@/lib/curated-library'

export default function CuratedPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <a href="/" aria-label="Back to practice">
              <ArrowLeft className="h-4 w-4" />
            </a>
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Curated</h1>
            <p className="text-xs text-muted-foreground">People worth studying deeply.</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Sparkles className="h-4 w-4" />
            Permanent training corpus
          </div>
          <h2 className="text-3xl font-semibold tracking-tight mb-3">Study a person, not a random clip.</h2>
          <p className="text-muted-foreground">
            Each person has a growing set of carefully selected source videos and practice segments.
            Later this same structure can hold professors, lecturers, interviewers, and other models you want to learn from.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {CURATED_SPEAKERS.map(speaker => {
            const readySources = speaker.sources.filter(source => source.status === 'ready')
            const readyClips = readySources.reduce((sum, source) => sum + source.segments.length, 0)

            return (
              <a key={speaker.id} href={`/curated/${speaker.id}`} className="block group">
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
                        <h3 className="text-2xl font-semibold tracking-tight">{speaker.name}</h3>
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
              </a>
            )
          })}
        </div>
      </main>
    </div>
  )
}

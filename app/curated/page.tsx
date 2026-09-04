import { ArrowLeft, Clock, Play, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CURATED_COLLECTIONS } from '@/lib/curated-library'

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

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
            <p className="text-xs text-muted-foreground">Speaking material selected for deliberate practice.</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8 max-w-2xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Sparkles className="h-4 w-4" />
            Permanent training corpus
          </div>
          <h2 className="text-3xl font-semibold tracking-tight mb-3">Study the moments worth copying.</h2>
          <p className="text-muted-foreground">
            These clips are built into artiCO. They do not disappear when browser storage is cleared.
            Open a source and the selected segments are loaded directly into the practice view.
          </p>
        </div>

        <div className="space-y-8">
          {CURATED_COLLECTIONS.map(collection => {
            const totalPracticeSeconds = collection.segments.reduce((sum, item) => sum + (item.end - item.start), 0)
            const practiceUrl = `/?v=${collection.videoId}&curated=${collection.id}`

            return (
              <section key={collection.id} className="space-y-4">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid lg:grid-cols-[360px_1fr]">
                      <div className="aspect-video lg:aspect-auto lg:min-h-[250px] bg-secondary overflow-hidden">
                        <img
                          src={collection.thumbnail}
                          alt={collection.videoTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6 flex flex-col justify-between gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">{collection.speaker}</p>
                          <h3 className="text-2xl font-semibold tracking-tight mb-2">{collection.sourceTitle}</h3>
                          <p className="text-sm text-muted-foreground max-w-2xl mb-4">{collection.description}</p>

                          <div className="flex flex-wrap gap-2">
                            {collection.focus.map(item => (
                              <span key={item} className="text-xs px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{collection.segments.length} curated clips</span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              {formatTime(totalPracticeSeconds)} practice material
                            </span>
                          </div>
                          <Button asChild>
                            <a href={practiceUrl}>
                              <Play className="h-4 w-4 mr-2" />
                              Practice this source
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="border rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b bg-secondary/30">
                    <h4 className="text-sm font-medium">Curated segments</h4>
                  </div>
                  <div className="divide-y">
                    {collection.segments.map((item, index) => (
                      <a
                        key={item.id}
                        href={practiceUrl}
                        className="grid grid-cols-[48px_120px_1fr] gap-3 items-center px-4 py-3 hover:bg-secondary/40 transition-colors"
                      >
                        <span className="text-xs text-muted-foreground tabular-nums">#{index + 1}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {formatTime(item.start)}–{formatTime(item.end)}
                        </span>
                        <span className="text-sm font-medium min-w-0 truncate">{item.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      </main>
    </div>
  )
}

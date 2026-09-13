import { ArrowLeft, Search, Star } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { EVERYDAY_ENGLISH_ACCENT, getEverydayEnglishChapter } from '@/lib/everyday-english'

export default async function EverydayEnglishChapterPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params
  const chapter = getEverydayEnglishChapter(chapterId)
  if (!chapter) notFound()

  const coreCount = chapter.phrases.filter(item => item.priority === 'core').length

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <a href="/english" aria-label="Back to Everyday English">
              <ArrowLeft className="h-4 w-4" />
            </a>
          </Button>
          <div>
            <p className="text-xs text-muted-foreground">Everyday English · Chapter {String(chapter.number).padStart(2, '0')}</p>
            <h1 className="text-xl font-semibold tracking-tight">{chapter.title}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <section className="mb-8 max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight mb-3">{chapter.title}</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">{chapter.description}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-md bg-secondary">{chapter.phrases.length} targets</span>
            <span className="px-2.5 py-1 rounded-md bg-secondary">{coreCount} core</span>
            <span className="px-2.5 py-1 rounded-md bg-secondary">{EVERYDAY_ENGLISH_ACCENT.label}</span>
          </div>
        </section>

        <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          These targets are ready for transcript matching against the fixed native-speaker corpus.
        </div>

        <div className="grid gap-3">
          {chapter.phrases.map((item, index) => (
            <Card key={item.id}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-muted-foreground tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                      {item.priority === 'core' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          <Star className="h-3 w-3" />
                          Core
                        </span>
                      )}
                    </div>
                    <p className="text-xl font-semibold tracking-tight">{item.target}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.function}</p>
                    {item.note && <p className="text-xs text-muted-foreground mt-2">{item.note}</p>}
                  </div>

                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Clip match</p>
                    <p className="text-xs font-medium">Not matched yet</p>
                  </div>
                </div>

                {item.variants.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">Search variants</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.variants.map(variant => (
                        <span key={variant} className="text-[11px] px-2 py-1 rounded bg-secondary text-secondary-foreground">
                          {variant}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

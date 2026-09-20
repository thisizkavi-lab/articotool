import { ArrowLeft, ArrowRight, BookOpen, MapPin, Search } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  EVERYDAY_ENGLISH_ACCENT,
  EVERYDAY_ENGLISH_CHAPTERS,
  EVERYDAY_ENGLISH_PHRASE_COUNT,
} from '@/lib/everyday-english'

export default function EverydayEnglishPage() {
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
            <h1 className="text-xl font-semibold tracking-tight">Everyday English</h1>
            <p className="text-xs text-muted-foreground">Phrase-first American conversational English.</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="max-w-3xl mb-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MapPin className="h-4 w-4" />
            Target accent · {EVERYDAY_ENGLISH_ACCENT.label}
          </div>
          <h2 className="text-3xl font-semibold tracking-tight mb-3">Learn the phrases people actually use.</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The reference book gives us the situations and chapter structure. This curriculum keeps only high-value
            speaking targets, rewrites British-specific wording where needed, and prepares every phrase for matching
            against a fixed corpus of native American YouTube speech.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {EVERYDAY_ENGLISH_ACCENT.description}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-10">
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-1">Milestone 1</p>
              <p className="text-2xl font-semibold">{EVERYDAY_ENGLISH_CHAPTERS.length}</p>
              <p className="text-sm text-muted-foreground">Conversation Skills chapters</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-1">Curated now</p>
              <p className="text-2xl font-semibold">{EVERYDAY_ENGLISH_PHRASE_COUNT}</p>
              <p className="text-sm text-muted-foreground">American speaking targets</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-1">Next layer</p>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Search className="h-4 w-4" />
                Native clips
              </div>
              <p className="text-sm text-muted-foreground">Transcript matching inside a fixed NYC-American corpus</p>
            </CardContent>
          </Card>
        </div>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Conversation Skills</h3>
              <p className="text-xs text-muted-foreground">Start here before expanding into the rest of the book.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {EVERYDAY_ENGLISH_CHAPTERS.map(chapter => {
              const coreCount = chapter.phrases.filter(item => item.priority === 'core').length
              return (
                <Link key={chapter.id} href={`/english/${chapter.id}`} className="block group">
                  <Card className="h-full transition-colors group-hover:border-primary/50">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Chapter {String(chapter.number).padStart(2, '0')}</p>
                          <h4 className="text-xl font-semibold tracking-tight">{chapter.title}</h4>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground mt-1 transition-transform group-hover:translate-x-1" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mt-3 mb-4">{chapter.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {chapter.phrases.length} targets · {coreCount} core
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}

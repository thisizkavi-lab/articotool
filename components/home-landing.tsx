import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CURATED_SPEAKERS, type CuratedSpeaker } from '@/lib/curated-library'
import { JACK_SANDERS_SPEAKER } from '@/lib/jack-sanders-curated'
import { THREEBLUE_SPEAKER } from '@/lib/threeblue-curated'

/*
 * First-visit landing content for the home page.
 *
 * Deliberately hook-free so it can render in the server-side Suspense
 * fallback (real HTML for first paint, link previews and crawlers) and in
 * the hydrated client view without changing markup.
 */

const FEATURED: { speaker: CuratedSpeaker | undefined; skill: string }[] = [
  { speaker: CURATED_SPEAKERS.find(speaker => speaker.id === 'naval-ravikant'), skill: 'Articulation' },
  { speaker: JACK_SANDERS_SPEAKER, skill: 'Lecturing' },
  { speaker: THREEBLUE_SPEAKER, skill: 'Explanation' },
]

function readyClipCount(speaker: CuratedSpeaker) {
  return speaker.sources
    .filter(source => source.status === 'ready')
    .reduce((sum, source) => sum + source.segments.length, 0)
}

export function LandingHero() {
  return (
    <div className="text-center mb-8">
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance mb-3">
        Study how great speakers think out loud.
      </h2>
      <p className="text-muted-foreground text-balance max-w-xl mx-auto">
        Pick a speaker, shadow their best moments, record yourself, and compare. Or paste any YouTube video.
      </p>
    </div>
  )
}

export function FeaturedCollections() {
  const featured = FEATURED.filter((item): item is { speaker: CuratedSpeaker; skill: string } => Boolean(item.speaker))

  return (
    <section aria-labelledby="featured-collections" className="max-w-5xl mx-auto">
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <h3 id="featured-collections" className="text-sm font-medium text-muted-foreground">
          Or start with a curated collection
        </h3>
        <Link
          href="/curated"
          className="group inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          All collections
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
        {featured.map(({ speaker, skill }) => (
          <Link
            key={speaker.id}
            href={`/curated/${speaker.id}`}
            className="group flex sm:block items-center overflow-hidden rounded-xl border border-border/60 bg-card transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="w-32 shrink-0 self-stretch sm:w-auto sm:aspect-[16/9] overflow-hidden bg-secondary">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnails, matching /curated */}
              <img
                src={speaker.portrait}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
            <div className="min-w-0 p-3 sm:p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">{skill}</p>
              <p className="font-semibold leading-snug">{speaker.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{readyClipCount(speaker)} curated clips</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

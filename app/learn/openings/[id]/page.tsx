import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { OPENINGS } from '@/lib/chess-data/openings'

const BASE_URL = 'https://chess-vault.vercel.app'

export function generateStaticParams() {
  return OPENINGS.map(o => ({ id: o.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const opening = OPENINGS.find(o => o.id === id)
  if (!opening) return {}
  return {
    title: `${opening.name} (${opening.eco}) — Chess Opening Guide`,
    description: `Learn the ${opening.name} chess opening (${opening.eco}). ${opening.description} Interactive board, key ideas, variations, and win rates.`,
    alternates: { canonical: `${BASE_URL}/learn/openings/${id}` },
    openGraph: {
      title: `${opening.name} — Chess Opening`,
      description: opening.description,
      url: `${BASE_URL}/learn/openings/${id}`,
    },
  }
}

export default async function OpeningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const opening = OPENINGS.find(o => o.id === id)
  if (!opening) notFound()

  const relatedOpenings = OPENINGS.filter(o => o.id !== id && o.category === opening.category).slice(0, 4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${opening.name} (${opening.eco}) — Chess Opening Guide`,
    description: opening.description,
    url: `${BASE_URL}/learn/openings/${id}`,
    publisher: { '@type': 'Organization', name: 'ChessVault' },
    mainEntityOfPage: `${BASE_URL}/learn/openings/${id}`,
  }

  return (
    <div className="min-h-screen bg-[hsl(228,18%,3%)] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <nav className="flex items-center gap-2 text-sm text-white/40 mb-8">
          <Link href="/" className="hover:text-white/60 transition-colors">ChessVault</Link>
          <span>/</span>
          <Link href="/learn" className="hover:text-white/60 transition-colors">Learn</Link>
          <span>/</span>
          <Link href="/learn#openings" className="hover:text-white/60 transition-colors">Openings</Link>
          <span>/</span>
          <span className="text-white/70">{opening.name}</span>
        </nav>

        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2 py-1 rounded-md bg-white/[0.06] text-xs font-mono text-white/50">{opening.eco}</span>
            <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-xs font-medium text-emerald-400 capitalize">{opening.difficulty}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">{opening.name}</h1>
          <p className="text-lg text-white/60 leading-relaxed">{opening.description}</p>
        </header>

        {/* Stats */}
        {opening.winRate && (
          <section className="mb-10 grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <div className="text-2xl font-bold text-white">{opening.winRate.white}%</div>
              <div className="text-xs text-white/40 mt-1">White wins</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <div className="text-2xl font-bold text-white/60">{opening.winRate.draw}%</div>
              <div className="text-xs text-white/40 mt-1">Draw</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <div className="text-2xl font-bold text-white">{opening.winRate.black}%</div>
              <div className="text-xs text-white/40 mt-1">Black wins</div>
            </div>
          </section>
        )}

        {/* Move sequence */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Main Line Moves</h2>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex flex-wrap gap-1.5">
              {opening.moves.map((move, i) => (
                <span key={i} className="inline-flex items-center gap-1">
                  {i % 2 === 0 && <span className="text-xs text-white/30 mr-0.5">{Math.floor(i / 2) + 1}.</span>}
                  <span className="px-2 py-0.5 rounded bg-white/[0.05] text-sm font-mono text-white/80">{move}</span>
                </span>
              ))}
            </div>
          </div>
          {opening.moveAnnotations && opening.moveAnnotations.length > 0 && (
            <div className="mt-4 space-y-2">
              {opening.moveAnnotations.slice(0, 6).map((note, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-white/30 font-mono shrink-0">{i + 1}.</span>
                  <span className="text-white/50">{note}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Key Ideas */}
        {opening.keyIdeas && opening.keyIdeas.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">Key Ideas</h2>
            <ul className="space-y-3">
              {opening.keyIdeas.map((idea, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="text-white/60">{idea}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Variations */}
        {opening.variations && opening.variations.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">Variations</h2>
            <div className="space-y-3">
              {opening.variations.map((v, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <h3 className="font-semibold text-white/80 mb-1">{v.name}</h3>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {v.moves.map((m: string, j: number) => (
                      <span key={j} className="px-1.5 py-0.5 rounded bg-white/[0.05] text-xs font-mono text-white/60">{m}</span>
                    ))}
                  </div>
                  {v.description && <p className="text-sm text-white/40">{v.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mb-10 p-6 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/10 text-center">
          <h2 className="text-lg font-bold mb-2">Practice the {opening.name} interactively</h2>
          <p className="text-sm text-white/50 mb-4">See every move animated on the board with step-by-step explanations</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-colors text-sm">
            Open in ChessVault →
          </Link>
        </section>

        {/* Related */}
        {relatedOpenings.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">Related Openings</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedOpenings.map(o => (
                <Link key={o.id} href={`/learn/openings/${o.id}`} className="group p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/30 transition-all">
                  <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{o.name}</h3>
                  <p className="text-xs text-white/40 mt-1 line-clamp-1">{o.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <nav className="flex justify-between text-sm">
          <Link href="/learn#openings" className="text-emerald-400 hover:text-emerald-300 transition-colors">
            ← All Openings
          </Link>
          <Link href="/learn" className="text-white/40 hover:text-white/60 transition-colors">
            Learn Hub
          </Link>
        </nav>
      </div>
    </div>
  )
}

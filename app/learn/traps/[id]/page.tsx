import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TRAPS } from '@/lib/chess-data/traps'

const BASE_URL = 'https://chess-vault.vercel.app'

export function generateStaticParams() {
  return TRAPS.map(t => ({ id: t.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const trap = TRAPS.find(t => t.id === id)
  if (!trap) return {}
  return {
    title: `${trap.name} — Chess Trap Guide (${trap.opening})`,
    description: `Learn the ${trap.name} in the ${trap.opening}. ${trap.description} Step-by-step explanation with move annotations.`,
    alternates: { canonical: `${BASE_URL}/learn/traps/${id}` },
    openGraph: {
      title: `${trap.name} — Chess Trap`,
      description: trap.description,
      url: `${BASE_URL}/learn/traps/${id}`,
    },
  }
}

export default async function TrapPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const trap = TRAPS.find(t => t.id === id)
  if (!trap) notFound()

  const related = TRAPS.filter(t => t.id !== id).slice(0, 4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to play the ${trap.name}`,
    description: trap.description,
    url: `${BASE_URL}/learn/traps/${id}`,
    step: trap.explanation.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: step,
    })),
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
          <Link href="/learn#traps" className="hover:text-white/60 transition-colors">Traps</Link>
          <span>/</span>
          <span className="text-white/70">{trap.name}</span>
        </nav>

        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
              trap.difficulty === 'beginner' ? 'bg-emerald-500/10 text-emerald-400' :
              trap.difficulty === 'intermediate' ? 'bg-amber-500/10 text-amber-400' :
              'bg-red-500/10 text-red-400'
            } capitalize`}>{trap.difficulty}</span>
            <span className="px-2 py-1 rounded-md bg-white/[0.06] text-xs text-white/50">{trap.opening}</span>
            <span className="px-2 py-1 rounded-md bg-white/[0.06] text-xs text-white/50">{trap.side === 'white' ? '♔ White' : '♚ Black'} to play</span>
            <span className="px-2 py-1 rounded-md bg-primary/10 text-xs font-medium text-primary">+{trap.xpReward} XP</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">{trap.name}</h1>
          <p className="text-lg text-white/60 leading-relaxed">{trap.description}</p>
        </header>

        {/* Moves */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Move Sequence</h2>
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex flex-wrap gap-1.5">
              {trap.moves.map((move, i) => (
                <span key={i} className="inline-flex items-center gap-1">
                  {i % 2 === 0 && <span className="text-xs text-white/30 mr-0.5">{Math.floor(i / 2) + 1}.</span>}
                  <span className="px-2 py-0.5 rounded bg-white/[0.05] text-sm font-mono text-white/80">{move}</span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Step-by-step Explanation */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Step-by-Step Explanation</h2>
          <div className="space-y-4">
            {trap.explanation.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-white/60 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Move Annotations */}
        {trap.moveAnnotations && trap.moveAnnotations.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">Move Annotations</h2>
            <div className="space-y-2">
              {trap.moveAnnotations.map((note, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-white/30 font-mono shrink-0 w-16">
                    {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ''}{trap.moves[i]}
                  </span>
                  <span className="text-white/50">{note}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mb-10 p-6 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/10 text-center">
          <h2 className="text-lg font-bold mb-2">Practice the {trap.name} interactively</h2>
          <p className="text-sm text-white/50 mb-4">Play through the trap move-by-move on an animated board</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-400 transition-colors text-sm">
            Open in ChessVault →
          </Link>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">More Chess Traps</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {related.map(t => (
                <Link key={t.id} href={`/learn/traps/${t.id}`} className="group p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-emerald-500/30 transition-all">
                  <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{t.name}</h3>
                  <p className="text-xs text-white/40 mt-1">{t.opening} · {t.difficulty}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <nav className="flex justify-between text-sm">
          <Link href="/learn#traps" className="text-emerald-400 hover:text-emerald-300 transition-colors">
            ← All Traps
          </Link>
          <Link href="/learn" className="text-white/40 hover:text-white/60 transition-colors">
            Learn Hub
          </Link>
        </nav>
      </div>
    </div>
  )
}

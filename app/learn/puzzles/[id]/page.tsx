import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PUZZLES } from '@/lib/chess-data/puzzles'

const BASE_URL = 'https://chess-vault.vercel.app'

export function generateStaticParams() {
  return PUZZLES.map(p => ({ id: p.id }))
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const puzzle = PUZZLES.find(p => p.id === id)
  if (!puzzle) return {}
  return {
    title: `${puzzle.title} — Chess Puzzle (Rating ${puzzle.rating})`,
    description: `${puzzle.description} A ${puzzle.difficulty} chess puzzle rated ${puzzle.rating}. Themes: ${puzzle.themes.join(', ')}.`,
    alternates: { canonical: `${BASE_URL}/learn/puzzles/${id}` },
    openGraph: {
      title: `${puzzle.title} — Chess Puzzle`,
      description: puzzle.description,
      url: `${BASE_URL}/learn/puzzles/${id}`,
    },
  }
}

export default async function PuzzlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const puzzle = PUZZLES.find(p => p.id === id)
  if (!puzzle) notFound()

  const puzzleIndex = PUZZLES.findIndex(p => p.id === id)
  const related = PUZZLES.filter(p => p.id !== id && p.themes.some(t => puzzle.themes.includes(t))).slice(0, 4)
  const prevPuzzle = puzzleIndex > 0 ? PUZZLES[puzzleIndex - 1] : null
  const nextPuzzle = puzzleIndex < PUZZLES.length - 1 ? PUZZLES[puzzleIndex + 1] : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${puzzle.title} — Chess Puzzle (Rating ${puzzle.rating})`,
    description: puzzle.description,
    url: `${BASE_URL}/learn/puzzles/${id}`,
    publisher: { '@type': 'Organization', name: 'ChessVault' },
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
          <Link href="/learn#puzzles" className="hover:text-white/60 transition-colors">Puzzles</Link>
          <span>/</span>
          <span className="text-white/70">{puzzle.title}</span>
        </nav>

        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
              puzzle.difficulty === 'Easy' ? 'bg-amber-500/10 text-amber-400' :
              puzzle.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
              'bg-red-500/10 text-red-400'
            }`}>{puzzle.difficulty}</span>
            <span className="px-2 py-1 rounded-md bg-white/[0.06] text-xs font-mono text-white/50">Rating {puzzle.rating}</span>
            <span className="px-2 py-1 rounded-md bg-primary/10 text-xs font-medium text-primary">+{puzzle.xpReward} XP</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">{puzzle.title}</h1>
          <p className="text-lg text-white/60 leading-relaxed">{puzzle.description}</p>
        </header>

        {/* Themes */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">Puzzle Themes</h2>
          <div className="flex flex-wrap gap-2">
            {puzzle.themes.map(theme => (
              <span key={theme} className="px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-sm text-white/60">
                {theme}
              </span>
            ))}
          </div>
        </section>

        {/* Hint */}
        <section className="mb-10 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
          <h2 className="text-lg font-bold mb-3">💡 How to Approach This Puzzle</h2>
          <div className="space-y-2 text-white/50 text-sm">
            {puzzle.themes.includes('Checkmate') && <p>Look for forcing moves that lead to checkmate. Check the king's escape squares and potential mating patterns.</p>}
            {puzzle.themes.includes('Fork') && <p>Search for knight or queen moves that simultaneously attack two or more pieces.</p>}
            {puzzle.themes.includes('Pin') && <p>Look for opportunities to pin an opponent's piece against their king or a more valuable piece.</p>}
            {puzzle.themes.includes('Skewer') && <p>Find moves that attack a valuable piece, forcing it to move and exposing a piece behind it.</p>}
            {puzzle.themes.includes('Tactics') && <p>Look for combinations involving multiple tactical themes. Calculate forcing sequences carefully.</p>}
            {!puzzle.themes.includes('Checkmate') && !puzzle.themes.includes('Fork') && !puzzle.themes.includes('Pin') && !puzzle.themes.includes('Skewer') && !puzzle.themes.includes('Tactics') && (
              <p>Examine the position carefully, consider all checks and captures, and calculate the resulting positions.</p>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-10 p-6 rounded-2xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/10 text-center">
          <h2 className="text-lg font-bold mb-2">Solve this puzzle interactively</h2>
          <p className="text-sm text-white/50 mb-4">Drag pieces on the board, earn XP, and build your combo streak</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-500 text-white font-semibold hover:bg-amber-400 transition-colors text-sm">
            Play Now →
          </Link>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">Similar Puzzles</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {related.map(p => (
                <Link key={p.id} href={`/learn/puzzles/${p.id}`} className="group p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/30 transition-all">
                  <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors">{p.title}</h3>
                  <p className="text-xs text-white/40 mt-1">Rating {p.rating} · {p.difficulty}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Prev/Next */}
        <nav className="flex justify-between text-sm">
          {prevPuzzle ? (
            <Link href={`/learn/puzzles/${prevPuzzle.id}`} className="text-amber-400 hover:text-amber-300 transition-colors">
              ← {prevPuzzle.title}
            </Link>
          ) : <span />}
          {nextPuzzle ? (
            <Link href={`/learn/puzzles/${nextPuzzle.id}`} className="text-amber-400 hover:text-amber-300 transition-colors">
              {nextPuzzle.title} →
            </Link>
          ) : <span />}
        </nav>
      </div>
    </div>
  )
}

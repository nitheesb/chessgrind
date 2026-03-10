import type { Metadata } from 'next'
import Link from 'next/link'
import { OPENINGS } from '@/lib/chess-data/openings'
import { PUZZLES } from '@/lib/chess-data/puzzles'
import { TRAPS } from '@/lib/chess-data/traps'

const BASE_URL = 'https://chessgrind.vercel.app'

export const metadata: Metadata = {
  title: 'Learn Chess Online Free — Puzzles, Openings, Traps & AI | ChessGrind',
  description:
    'Master chess with interactive puzzles, opening guides, trap lessons, and AI opponents. Free chess training for beginners to advanced players.',
  alternates: { canonical: `${BASE_URL}/learn` },
  openGraph: {
    title: 'Learn Chess Online Free — Puzzles, Openings & Traps',
    description:
      'Interactive chess lessons with 50+ puzzles, 20 openings, 10 traps, and AI play. Track XP and achievements.',
    url: `${BASE_URL}/learn`,
  },
}

function formatName(id: string) {
  return id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function LearnPage() {
  const easyPuzzles = PUZZLES.filter(p => p.difficulty === 'Easy')
  const mediumPuzzles = PUZZLES.filter(p => p.difficulty === 'Medium')
  const hardPuzzles = PUZZLES.filter(p => p.difficulty === 'Hard')

  return (
    <div className="min-h-screen bg-[hsl(228,18%,3%)] text-white">
      {/* Hero */}
      <header className="relative overflow-hidden px-6 py-20 text-center">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.1) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative mx-auto max-w-3xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 mb-6 transition-colors">
            ← Back to ChessGrind
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Learn Chess Online — <span className="text-amber-400">Free</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Master chess with interactive puzzles, study opening theory, learn deadly traps, and practice against AI opponents from beginner to grandmaster.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm text-white/40">
            <span>🧩 {PUZZLES.length} Puzzles</span>
            <span>📖 {OPENINGS.length} Openings</span>
            <span>⚡ {TRAPS.length} Traps</span>
            <span>🤖 8 AI Levels</span>
          </div>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 px-8 py-3 rounded-full bg-amber-500 text-white font-semibold hover:bg-amber-400 transition-colors"
          >
            Start Playing Free →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-20 space-y-20">
        {/* Chess Openings */}
        <section id="openings">
          <h2 className="text-3xl font-bold mb-2">Chess Openings Guide</h2>
          <p className="text-white/50 mb-8 max-w-2xl">
            Study the most popular chess openings with interactive animated boards. See each move played out, learn key ideas, and understand variations.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {OPENINGS.map(opening => (
              <Link
                key={opening.id}
                href={`/learn/openings/${opening.id}`}
                className="group p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/30 hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors">{opening.name}</h3>
                  <span className="text-xs text-white/30 font-mono">{opening.eco}</span>
                </div>
                <p className="text-sm text-white/40 line-clamp-2 mb-3">{opening.description}</p>
                <div className="flex gap-3 text-xs text-white/30">
                  <span className="capitalize">{opening.difficulty}</span>
                  {opening.popularity && <span>Popularity: {opening.popularity}/5</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Chess Puzzles */}
        <section id="puzzles">
          <h2 className="text-3xl font-bold mb-2">Chess Puzzles by Difficulty</h2>
          <p className="text-white/50 mb-8 max-w-2xl">
            Sharpen your tactical vision with {PUZZLES.length} interactive puzzles. Find forks, pins, skewers, checkmates, and discovered attacks.
          </p>

          {[
            { label: 'Beginner Puzzles (Easy)', puzzles: easyPuzzles, color: 'amber' },
            { label: 'Intermediate Puzzles (Medium)', puzzles: mediumPuzzles, color: 'amber' },
            { label: 'Advanced Puzzles (Hard)', puzzles: hardPuzzles, color: 'red' },
          ].map(group => group.puzzles.length > 0 && (
            <div key={group.label} className="mb-10">
              <h3 className="text-xl font-semibold mb-4 text-white/80">{group.label}</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.puzzles.map(puzzle => (
                  <Link
                    key={puzzle.id}
                    href={`/learn/puzzles/${puzzle.id}`}
                    className="group p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/30 hover:bg-white/[0.05] transition-all"
                  >
                    <h4 className="font-medium text-white group-hover:text-amber-400 transition-colors mb-1">{puzzle.title}</h4>
                    <p className="text-xs text-white/40 line-clamp-2 mb-2">{puzzle.description}</p>
                    <div className="flex gap-2 text-xs text-white/30">
                      <span>Rating: {puzzle.rating}</span>
                      <span>·</span>
                      <span>{puzzle.themes.join(', ')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Chess Traps */}
        <section id="traps">
          <h2 className="text-3xl font-bold mb-2">Chess Traps to Win Fast</h2>
          <p className="text-white/50 mb-8 max-w-2xl">
            Learn sneaky traps that punish common mistakes. Surprise your opponents with tactics they won't see coming.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {TRAPS.map(trap => (
              <Link
                key={trap.id}
                href={`/learn/traps/${trap.id}`}
                className="group p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-amber-500/30 hover:bg-white/[0.05] transition-all"
              >
                <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors mb-1">{trap.name}</h3>
                <p className="text-xs text-white/30 mb-2">From the {trap.opening} · {trap.side === 'white' ? 'White' : 'Black'} to move</p>
                <p className="text-sm text-white/40 line-clamp-2">{trap.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ for SEO */}
        <section id="faq">
          <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6 max-w-3xl">
            {[
              { q: 'Is ChessGrind completely free?', a: 'Yes. All puzzles, openings, traps, and AI play are 100% free with no paywalls or subscriptions.' },
              { q: 'Do I need to create an account?', a: 'No. You can start playing immediately in demo mode. Your progress saves locally. Create an account to sync across devices.' },
              { q: 'What skill level is this for?', a: 'ChessGrind serves all levels — from complete beginners learning basic tactics to advanced players studying complex openings and deep traps.' },
              { q: 'How does the XP system work?', a: 'Earn XP by solving puzzles, learning openings, and completing challenges. Build combos for multiplied XP, maintain daily streaks, and unlock achievements as you improve.' },
              { q: 'Can I play against a computer?', a: 'Yes. ChessGrind features 8 AI difficulty levels from Beginner Bot (casual play) to Stockfish Beast (grandmaster-level challenge).' },
            ].map(item => (
              <details key={item.q} className="group">
                <summary className="cursor-pointer text-lg font-semibold text-white/80 hover:text-white transition-colors list-none flex items-center gap-2">
                  <span className="text-amber-400 group-open:rotate-90 transition-transform">›</span>
                  {item.q}
                </summary>
                <p className="mt-2 ml-5 text-white/50 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 rounded-3xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/10">
          <h2 className="text-2xl font-bold mb-3">Ready to improve your chess?</h2>
          <p className="text-white/50 mb-6">Start with a quick puzzle or explore an opening — no signup needed.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-amber-500 text-white font-semibold hover:bg-amber-400 transition-colors"
          >
            Start Playing Free →
          </Link>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8 px-6 text-center text-sm text-white/30">
        <p>© {new Date().getFullYear()} ChessGrind. Free chess learning platform.</p>
        <div className="mt-2 flex flex-wrap gap-4 justify-center">
          <Link href="/learn#openings" className="hover:text-white/50 transition-colors">Openings</Link>
          <Link href="/learn#puzzles" className="hover:text-white/50 transition-colors">Puzzles</Link>
          <Link href="/learn#traps" className="hover:text-white/50 transition-colors">Traps</Link>
          <Link href="/learn#faq" className="hover:text-white/50 transition-colors">FAQ</Link>
        </div>
      </footer>
    </div>
  )
}

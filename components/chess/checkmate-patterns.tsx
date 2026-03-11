'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, X, ChevronLeft, Star, Swords, BookOpen } from 'lucide-react'
import { MiniChessboard } from '@/components/chess/chessboard'
import { useSettings } from '@/lib/settings-context'

type Difficulty = 'easy' | 'medium' | 'hard'

interface CheckmatePattern {
  name: string
  description: string
  fen: string
  keySquares: string[]
  difficulty: Difficulty
  keyIdea: string
  winningMove: string
}

const PATTERNS: CheckmatePattern[] = [
  {
    name: 'Back Rank Mate',
    description: 'Rook or queen delivers mate on the 8th rank',
    fen: '6k1/5ppp/8/8/8/8/8/R3K3 w - - 0 1',
    keySquares: ['a8', 'g8'],
    difficulty: 'easy',
    keyIdea: 'The king is trapped behind its own pawns on the back rank with no escape squares.',
    winningMove: 'Ra8#',
  },
  {
    name: "Scholar's Mate",
    description: 'Queen and bishop attack f7',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    keySquares: ['f7', 'h5', 'c4'],
    difficulty: 'easy',
    keyIdea: 'Queen and bishop team up to attack the weak f7 pawn, which is only defended by the king.',
    winningMove: 'Qxf7#',
  },
  {
    name: "Fool's Mate",
    description: 'Fastest possible checkmate',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 2',
    keySquares: ['e1', 'h4', 'f3', 'g4'],
    difficulty: 'easy',
    keyIdea: "White weakens the e1-h4 diagonal fatally by playing f3 and g4. Black's queen delivers instant mate.",
    winningMove: 'Qh4#',
  },
  {
    name: 'Smothered Mate',
    description: 'Knight delivers mate, king surrounded by own pieces',
    fen: 'r1b3kr/ppp2Npp/8/8/8/8/PPP2PPP/RNB1KB1R b KQ - 0 1',
    keySquares: ['f7', 'g8', 'h8'],
    difficulty: 'medium',
    keyIdea: "The king is completely boxed in by its own pieces. The knight on f7 delivers checkmate because the king can't move.",
    winningMove: 'Nf7# (already delivered)',
  },
  {
    name: "Anastasia's Mate",
    description: 'Knight and rook combine on the h-file',
    fen: '4r1k1/3n1ppp/8/3N4/8/8/5PPP/4R1K1 w - - 0 1',
    keySquares: ['e7', 'd5', 'h7'],
    difficulty: 'hard',
    keyIdea: 'The knight restricts the king while the rook delivers mate along the e-file or h-file.',
    winningMove: 'Ne7+ followed by Rh1#',
  },
  {
    name: 'Arabian Mate',
    description: 'Knight and rook cooperate in the corner',
    fen: '5rk1/5p1p/8/8/8/8/5N2/4R1K1 w - - 0 1',
    keySquares: ['e8', 'f2', 'g8'],
    difficulty: 'medium',
    keyIdea: 'The rook controls the back rank while the knight covers the escape squares near the corner.',
    winningMove: 'Re8#',
  },
  {
    name: "Boden's Mate",
    description: 'Two bishops deliver checkmate on crossing diagonals',
    fen: '2k5/8/8/1B6/8/8/5B2/4K3 w - - 0 1',
    keySquares: ['a6', 'f2', 'b5', 'c8'],
    difficulty: 'medium',
    keyIdea: 'Two bishops crisscross diagonals to attack the king, which is trapped on the edge of the board.',
    winningMove: 'Ba6#',
  },
  {
    name: 'Epaulette Mate',
    description: 'Queen mates, king flanked by own pieces',
    fen: '3rkr2/8/8/8/4Q3/8/8/4K3 w - - 0 1',
    keySquares: ['e4', 'd8', 'f8', 'e8'],
    difficulty: 'medium',
    keyIdea: "The king's own rooks on d8 and f8 block its escape. The queen delivers mate from a distance.",
    winningMove: 'Qe8#',
  },
  {
    name: 'Greek Gift Sacrifice',
    description: 'Bishop sacrifices on h7 to expose the king',
    fen: 'r1bq1rk1/ppppnppp/4p3/8/1bBP4/2N1BN2/PPP2PPP/R2Q1RK1 w - - 0 1',
    keySquares: ['h7', 'c4', 'f3', 'g5'],
    difficulty: 'hard',
    keyIdea: 'The bishop is sacrificed on h7+ to strip the king of pawn cover, followed by Ng5+ and Qh5 for a mating attack.',
    winningMove: 'Bxh7+ Kxh7, Ng5+',
  },
  {
    name: "Légal's Mate",
    description: 'Knight delivers mate after queen sacrifice',
    fen: 'r1bqkb1r/pppp1ppp/2n5/4N3/4n3/2N5/PPPPQPPP/R1B1KB1R w KQkq - 0 1',
    keySquares: ['e5', 'c3', 'e2', 'e4'],
    difficulty: 'hard',
    keyIdea: 'White sacrifices the queen to set up a knight-driven checkmate. The knights and bishop coordinate to trap the king.',
    winningMove: 'Nc3xd5 (after Bxe2)',
  },
  {
    name: 'Opera Mate',
    description: 'Rook mates with bishop support on back rank',
    fen: '3qkb1r/4pppp/8/8/8/5B2/8/4RK2 w - - 0 1',
    keySquares: ['e1', 'f3', 'e8'],
    difficulty: 'medium',
    keyIdea: "The bishop controls the diagonal to cut off escape, while the rook delivers mate on the king's home square.",
    winningMove: 'Re8#',
  },
  {
    name: "Damiano's Mate",
    description: 'Queen sacrifices then mates with rook on h-file',
    fen: '5rk1/5pQp/8/8/8/8/5PPP/6K1 w - - 0 1',
    keySquares: ['g7', 'h7', 'g8'],
    difficulty: 'hard',
    keyIdea: 'The queen on g7 already threatens Qxh7#. The king is trapped by its own pawn and rook.',
    winningMove: 'Qxh7#',
  },
]

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  hard: 'bg-red-500/20 text-red-400',
}

const DIFFICULTY_STARS: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
}

interface CheckmatePatternsProps {
  onClose: () => void
}

export function CheckmatePatterns({ onClose }: CheckmatePatternsProps) {
  const { settings } = useSettings()
  const [selected, setSelected] = useState<CheckmatePattern | null>(null)
  const [filter, setFilter] = useState<Difficulty | 'all'>('all')

  const filtered = filter === 'all' ? PATTERNS : PATTERNS.filter((p) => p.difficulty === filter)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card relative w-full max-w-2xl max-h-[85vh] flex flex-col p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-bold text-foreground">Checkmate Patterns</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-4 overflow-y-auto"
            >
              <button
                onClick={() => setSelected(null)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to patterns
              </button>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-shrink-0 rounded-xl overflow-hidden border border-border">
                  <MiniChessboard
                    fen={selected.fen}
                    size={200}
                    boardStyle={settings.boardStyle}
                    pieceStyle={settings.pieceStyle}
                  />
                </div>

                <div className="flex flex-col gap-3 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-foreground">{selected.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${DIFFICULTY_COLORS[selected.difficulty]}`}
                    >
                      {selected.difficulty}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">{selected.description}</p>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-semibold text-foreground">Key Idea</span>
                        <p className="text-sm text-muted-foreground">{selected.keyIdea}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Swords className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-semibold text-foreground">Key Squares</span>
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          {selected.keySquares.map((sq) => (
                            <span
                              key={sq}
                              className="px-1.5 py-0.5 text-xs font-mono rounded bg-card border border-border text-foreground"
                            >
                              {sq}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-xs font-semibold text-foreground">Practice</span>
                        <p className="text-sm text-muted-foreground">
                          Winning move:{' '}
                          <span className="font-mono font-semibold text-primary">
                            {selected.winningMove}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col gap-4 overflow-hidden"
            >
              {/* Difficulty filter */}
              <div className="flex gap-2">
                {(['all', 'easy', 'medium', 'hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setFilter(level)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      filter === level
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : 'bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>

              {/* Cards grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pr-1">
                {filtered.map((pattern) => (
                  <motion.button
                    key={pattern.name}
                    onClick={() => setSelected(pattern)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex flex-col gap-2 p-3 rounded-xl bg-card border border-border text-left hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-semibold text-foreground truncate">
                        {pattern.name}
                      </span>
                      <div className="flex flex-shrink-0">
                        {Array.from({ length: DIFFICULTY_STARS[pattern.difficulty] }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold w-fit ${DIFFICULTY_COLORS[pattern.difficulty]}`}
                    >
                      {pattern.difficulty}
                    </span>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {pattern.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

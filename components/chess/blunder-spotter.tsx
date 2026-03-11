'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Zap, X, Eye, Trophy } from 'lucide-react'
import { Chess } from 'chess.js'
import { Chessboard } from '@/components/chess/chessboard'
import { useSettings } from '@/lib/settings-context'
import { useGame } from '@/lib/game-context'

const BEST_KEY = 'chessgrind-blunder-best'

interface BlunderPosition {
  fen: string
  blunderDescription: string
  correctMove: string
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

const POSITIONS: BlunderPosition[] = [
  {
    fen: 'r1bqk2r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    blunderDescription: 'Black played ...Nc6 instead of blocking the Scholar\'s Mate threat.',
    correctMove: 'Qxf7#',
    explanation: 'Scholar\'s Mate! The queen captures on f7 with checkmate since the king has no escape.',
    difficulty: 'easy',
  },
  {
    fen: 'rnbqkb1r/pppp1ppp/5n2/4p2Q/4P3/2N5/PPPP1PPP/R1B1KBNR w KQkq - 2 3',
    blunderDescription: 'Black played ...Nf6 attacking the queen but leaving f7 weak.',
    correctMove: 'Qxe5+',
    explanation: 'The queen takes the e5 pawn with check, forking the king and the rook on h8.',
    difficulty: 'easy',
  },
  {
    fen: 'r1bqkbnr/ppp2ppp/2np4/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
    blunderDescription: 'Black played ...d6 passively instead of developing.',
    correctMove: 'Ng5',
    explanation: 'Ng5 attacks the weak f7 square. Combined with the bishop on c4, this creates strong threats.',
    difficulty: 'medium',
  },
  {
    fen: 'rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4',
    blunderDescription: 'Black pinned the knight with ...Bb4 in the Nimzo-Indian.',
    correctMove: 'e3',
    explanation: 'e3 solidifies the center and prepares to develop the dark-squared bishop, maintaining a strong position.',
    difficulty: 'easy',
  },
  {
    fen: 'r1bqkb1r/pppppppp/2n2n2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 2 3',
    blunderDescription: 'Black developed both knights without challenging the center.',
    correctMove: 'd5',
    explanation: 'Pushing d5 attacks the knight on c6, gaining space and tempo. The center becomes dominant.',
    difficulty: 'medium',
  },
  {
    fen: 'rnbqk2r/ppp1bppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQkq - 2 5',
    blunderDescription: 'Black played a passive setup in the Queen\'s Gambit.',
    correctMove: 'cxd5',
    explanation: 'Capturing on d5 opens the position and creates an IQP structure favorable for White\'s active pieces.',
    difficulty: 'medium',
  },
  {
    fen: 'r1bqkbnr/pppppppp/2n5/8/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 2',
    blunderDescription: 'Black only developed the knight to c6 without contesting the center.',
    correctMove: 'd4',
    explanation: 'Playing d4 grabs the center with two pawns and opens lines for rapid development.',
    difficulty: 'easy',
  },
  {
    fen: 'r1b1kbnr/pppp1ppp/2n5/4p3/2BqP3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 4 5',
    blunderDescription: 'Black captured on d4 with the queen, exposed and centralized.',
    correctMove: 'Nc3',
    explanation: 'Nc3 develops with tempo, attacking the exposed queen and gaining time for development.',
    difficulty: 'easy',
  },
  {
    fen: 'rn1qkbnr/ppp1pppp/8/3p4/6b1/5N2/PPPPPPPP/RNBQKB1R w KQkq - 2 3',
    blunderDescription: 'Black developed the bishop to g4 early, pinning the knight.',
    correctMove: 'Ne5',
    explanation: 'Ne5 attacks the bishop on g4 and threatens to win it. The bishop has no good retreat.',
    difficulty: 'medium',
  },
  {
    fen: 'rnbqk1nr/pppp1ppp/4p3/8/1bPP4/8/PP2PPPP/RNBQKBNR w KQkq - 1 3',
    blunderDescription: 'Black played ...Bb4+ without preparation.',
    correctMove: 'Bd2',
    explanation: 'Bd2 blocks the check and offers a trade of bishops, after which White has a strong center.',
    difficulty: 'easy',
  },
  {
    fen: 'rnbqkb1r/ppp1pppp/3p1n2/8/3PP3/2N5/PPP2PPP/R1BQKBNR w KQkq - 0 4',
    blunderDescription: 'Black played the Pirc Defense but is behind in development.',
    correctMove: 'f3',
    explanation: 'f3 supports the e4 pawn and prepares Be3 + Qd2 for a strong pawn storm setup.',
    difficulty: 'medium',
  },
  {
    fen: 'r1bqkbnr/1ppp1ppp/p1n5/4p3/B3P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
    blunderDescription: 'Black played ...a6 in the Ruy Lopez, kicking the bishop.',
    correctMove: 'Ba4',
    explanation: 'Retreating to a4 maintains the pin on the knight and keeps pressure on Black\'s position.',
    difficulty: 'easy',
  },
  {
    fen: 'rnbq1rk1/ppp1ppbp/3p1np1/8/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQ - 0 6',
    blunderDescription: 'Black fianchettoed in the King\'s Indian but White has a big center.',
    correctMove: 'Be2',
    explanation: 'Be2 completes development and prepares to castle. White has a strong classical center.',
    difficulty: 'medium',
  },
  {
    fen: 'rnbqk2r/pp2ppbp/3p1np1/2p5/2PPP3/2N2N2/PP3PPP/R1BQKB1R w KQkq c6 0 5',
    blunderDescription: 'Black played ...c5 trying to challenge the center but is behind in development.',
    correctMove: 'd5',
    explanation: 'Pushing d5 closes the center and gains space. White can then focus on a kingside attack.',
    difficulty: 'hard',
  },
  {
    fen: 'r1bqk2r/ppppnppp/2n5/2b1p3/2B1P3/2P2N2/PP1P1PPP/RNBQK2R w KQkq - 4 5',
    blunderDescription: 'Black played ...Ne7 blocking the bishop instead of ...Nf6.',
    correctMove: 'd4',
    explanation: 'Playing d4 strikes at the center, and after exd4 cxd4, White has a strong mobile center and open lines.',
    difficulty: 'hard',
  },
]

interface BlunderSpotterProps {
  onClose: () => void
}

export function BlunderSpotter({ onClose }: BlunderSpotterProps) {
  const { addXP, incrementPuzzlesSolved } = useGame()
  const { settings } = useSettings()

  const [positionIndex, setPositionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [solved, setSolved] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [finished, setFinished] = useState(false)
  const [bestScore, setBestScore] = useState(0)

  const position = useMemo(() => POSITIONS[positionIndex], [positionIndex])

  const playerColor = useMemo(() => {
    return position.fen.split(' ')[1] === 'w' ? 'white' : 'black'
  }, [position])

  // Parse the correct move to get from/to squares
  const correctMoveSquares = useMemo(() => {
    try {
      const game = new Chess(position.fen)
      const move = game.move(position.correctMove)
      if (move) return { from: move.from, to: move.to }
    } catch {}
    return null
  }, [position])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(BEST_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        setBestScore(data.score ?? 0)
        setBestStreak(data.streak ?? 0)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (finished) {
      const currentBest = { score: Math.max(bestScore, score), streak: Math.max(bestStreak, streak) }
      try { localStorage.setItem(BEST_KEY, JSON.stringify(currentBest)) } catch {}
      setBestScore(currentBest.score)
      setBestStreak(currentBest.streak)
    }
  }, [finished, score, streak, bestScore, bestStreak])

  const nextPosition = useCallback(() => {
    if (positionIndex + 1 >= POSITIONS.length) {
      setFinished(true)
    } else {
      setPositionIndex(i => i + 1)
      setAttempts(0)
      setShowExplanation(false)
      setShowHint(false)
      setFlash(null)
    }
  }, [positionIndex])

  const handleMove = useCallback((from: string, to: string) => {
    if (showExplanation) return false
    if (!correctMoveSquares) return false

    setTotalAttempts(t => t + 1)

    if (from === correctMoveSquares.from && to === correctMoveSquares.to) {
      // Correct
      setScore(s => s + 1)
      setSolved(s => s + 1)
      setStreak(s => s + 1)
      setFlash('correct')
      setShowExplanation(true)
      incrementPuzzlesSolved()
      addXP(15)
      return true
    }

    // Wrong
    const newAttempts = attempts + 1
    setAttempts(newAttempts)
    setStreak(0)
    setFlash('wrong')
    setTimeout(() => setFlash(null), 500)

    if (newAttempts >= 2) {
      setShowHint(true)
    }
    if (newAttempts >= 3) {
      setShowExplanation(true)
    }
    return false
  }, [showExplanation, correctMoveSquares, attempts, incrementPuzzlesSolved, addXP])

  const restart = useCallback(() => {
    setPositionIndex(0)
    setScore(0)
    setStreak(0)
    setSolved(0)
    setTotalAttempts(0)
    setAttempts(0)
    setShowExplanation(false)
    setShowHint(false)
    setFlash(null)
    setFinished(false)
  }, [])

  const accuracy = totalAttempts > 0 ? Math.round((solved / totalAttempts) * 100) : 0

  // Finished screen
  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 p-6"
      >
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          All Positions Complete!
        </h2>

        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold text-primary">{score}/{POSITIONS.length}</p>
            <p className="text-xs text-muted-foreground">Solved</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold text-foreground">{accuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold text-amber-400">{Math.max(bestStreak, streak)}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{bestScore}</p>
            <p className="text-xs text-muted-foreground">Best Score</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={restart}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-2"
          >
            <Zap className="w-4 h-4" /> Play Again
          </button>
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-card text-muted-foreground font-semibold border border-border">
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    )
  }

  // Active game
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-3 p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-[400px]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-bold text-foreground">Blunder Spotter</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm w-full max-w-[400px]">
        <span className="text-muted-foreground">
          Position <span className="font-bold text-foreground">{positionIndex + 1}</span>/{POSITIONS.length}
        </span>
        <span className="text-green-400 font-bold">{score} solved</span>
        <span className="text-amber-400 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" />{streak} streak
        </span>
      </div>

      {/* Blunder description */}
      <div className="glass-card p-3 w-full max-w-[400px]">
        <p className="text-sm text-muted-foreground">
          <span className="text-yellow-400 font-semibold">Blunder: </span>
          {position.blunderDescription}
        </p>
        <p className="text-xs text-primary mt-1 font-medium">Find the refutation!</p>
      </div>

      {/* Board */}
      <div className="relative w-full aspect-square max-w-[400px]">
        <Chessboard
          fen={position.fen}
          onMove={handleMove}
          interactive={!showExplanation}
          flipped={playerColor === 'black'}
          boardStyle={settings.boardStyle}
          pieceStyle={settings.pieceStyle}
          showCoordinates={true}
          hintArrow={showHint && correctMoveSquares ? correctMoveSquares : null}
        />
        <AnimatePresence>
          {flash === 'correct' && (
            <motion.div
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-lg bg-green-400/30 pointer-events-none"
            />
          )}
          {flash === 'wrong' && (
            <motion.div
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-lg bg-red-400/30 pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Attempt indicator */}
      {attempts > 0 && !showExplanation && (
        <p className="text-xs text-red-400">
          {3 - attempts} attempt{3 - attempts !== 1 ? 's' : ''} remaining
          {showHint && ' — hint arrow shown'}
        </p>
      )}

      {/* Show hint button */}
      {!showHint && attempts > 0 && !showExplanation && (
        <button
          onClick={() => setShowHint(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> Show Hint
        </button>
      )}

      {/* Explanation */}
      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass-card p-4 w-full max-w-[400px]"
          >
            <p className="text-sm font-semibold text-foreground mb-1">
              {attempts < 3 ? '✅ Correct!' : '❌ Answer:'} {position.correctMove}
            </p>
            <p className="text-sm text-muted-foreground">{position.explanation}</p>
            <button
              onClick={nextPosition}
              className="mt-3 px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm w-full"
            >
              Next Position →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

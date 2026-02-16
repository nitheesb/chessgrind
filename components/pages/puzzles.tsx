'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chess } from 'chess.js'
import { Chessboard } from '@/components/chess/chessboard'
import { PUZZLES, getDifficultyBg } from '@/lib/chess-data'
import type { Puzzle } from '@/lib/chess-data'
import { useGame } from '@/lib/game-context'
import {
  ArrowLeft,
  Puzzle as PuzzleIcon,
  ChevronRight,
  Check,
  X,
  Zap,
  SkipForward,
  Lightbulb,
  Timer,
  Star,
  Trophy,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

interface PuzzlesPageProps {
  onBack: () => void
}

export function PuzzlesPage({ onBack }: PuzzlesPageProps) {
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null)
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')

  const filteredPuzzles = useMemo(() => {
    if (filterDifficulty === 'all') return PUZZLES
    return PUZZLES.filter(p => p.difficulty === filterDifficulty)
  }, [filterDifficulty])

  if (activePuzzle) {
    return <PuzzleSolver puzzle={activePuzzle} onBack={() => setActivePuzzle(null)} onNext={() => {
      const idx = PUZZLES.findIndex(p => p.id === activePuzzle.id)
      if (idx < PUZZLES.length - 1) {
        setActivePuzzle(PUZZLES[idx + 1])
      } else {
        setActivePuzzle(null)
      }
    }} />
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 pb-8"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Puzzle Rush</h1>
          <p className="text-xs text-muted-foreground">{PUZZLES.length} puzzles to solve</p>
        </div>
      </motion.div>

      {/* Puzzle stats */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 text-center">
          <PuzzleIcon className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{PUZZLES.length}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Star className="w-4 h-4 text-accent mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">0</p>
          <p className="text-[10px] text-muted-foreground">Solved</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Trophy className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">0%</p>
          <p className="text-[10px] text-muted-foreground">Accuracy</p>
        </div>
      </motion.div>

      {/* Filter */}
      <motion.div variants={item} className="flex gap-2 overflow-x-auto pb-1">
        {['all', 'easy', 'medium', 'hard', 'expert'].map((diff) => (
          <button
            key={diff}
            onClick={() => setFilterDifficulty(diff)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterDifficulty === diff
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            {diff === 'all' ? 'All' : diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Puzzle List */}
      <motion.div variants={item} className="flex flex-col gap-3">
        {filteredPuzzles.map((puzzle, idx) => (
          <motion.button
            key={puzzle.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActivePuzzle(puzzle)}
            className="w-full glass-card-hover p-4 flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
              #{idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getDifficultyBg(puzzle.difficulty)}`}>
                  {puzzle.difficulty}
                </span>
                <span className="text-[10px] text-muted-foreground">Rating: {puzzle.rating}</span>
              </div>
              <p className="text-sm font-semibold text-foreground truncate">{puzzle.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{puzzle.description}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-medium">+{puzzle.xpReward}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  )
}

function PuzzleSolver({ puzzle, onBack, onNext }: { puzzle: Puzzle; onBack: () => void; onNext: () => void }) {
  const { addXP, incrementPuzzlesSolved } = useGame()
  const [game, setGame] = useState(() => new Chess(puzzle.fen))
  const [moveIndex, setMoveIndex] = useState(0)
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong' | 'complete'>('playing')
  const [showHint, setShowHint] = useState(false)
  const [timer, setTimer] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [highlightSquares, setHighlightSquares] = useState<string[]>([])
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1)
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const handleMove = useCallback((from: string, to: string): boolean => {
    if (status !== 'playing') return false

    const expectedMove = puzzle.moves[moveIndex]
    if (!expectedMove) return false

    try {
      const gameCopy = new Chess(game.fen())
      const move = gameCopy.move({ from, to, promotion: 'q' })

      if (!move) return false

      // Check if this is the expected move (compare SAN)
      if (move.san === expectedMove) {
        setGame(gameCopy)
        setLastMove({ from, to })
        setMoveIndex(prev => prev + 1)

        // Check if puzzle is complete
        if (moveIndex >= puzzle.moves.length - 1) {
          setStatus('complete')
          if (timerRef.current) clearInterval(timerRef.current)
          addXP(puzzle.xpReward)
          incrementPuzzlesSolved()
        } else {
          setStatus('correct')
          // Auto-play opponent response after a delay
          setTimeout(() => {
            const nextMove = puzzle.moves[moveIndex + 1]
            if (nextMove) {
              const opponentGame = new Chess(gameCopy.fen())
              try {
                const opMove = opponentGame.move(nextMove)
                if (opMove) {
                  setGame(opponentGame)
                  setLastMove({ from: opMove.from, to: opMove.to })
                  setMoveIndex(prev => prev + 1)
                  setStatus('playing')
                }
              } catch {
                setStatus('playing')
              }
            }
          }, 500)
        }
        return true
      } else {
        setStatus('wrong')
        setTimeout(() => setStatus('playing'), 1500)
        return false
      }
    } catch {
      return false
    }
  }, [game, moveIndex, puzzle, status, addXP, incrementPuzzlesSolved])

  const handleHint = useCallback(() => {
    const expectedMove = puzzle.moves[moveIndex]
    if (!expectedMove) return

    try {
      const gameCopy = new Chess(game.fen())
      const legalMoves = gameCopy.moves({ verbose: true })
      const hintMove = legalMoves.find(m => m.san === expectedMove)

      if (hintMove) {
        setHighlightSquares([hintMove.from, hintMove.to])
        setShowHint(true)
        setTimeout(() => {
          setHighlightSquares([])
          setShowHint(false)
        }, 2000)
      }
    } catch {
      // ignore
    }
  }, [game, moveIndex, puzzle.moves])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const isWhiteToMove = game.turn() === 'w'

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-4 pb-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{puzzle.title}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getDifficultyBg(puzzle.difficulty)}`}>
                {puzzle.difficulty}
              </span>
              <span className="text-[10px] text-muted-foreground">Rating: {puzzle.rating}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-xs font-mono text-foreground">
            <Timer className="w-3 h-3 text-muted-foreground" />
            {formatTime(timer)}
          </div>
        </div>
      </div>

      {/* Turn indicator */}
      <div className="flex items-center justify-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isWhiteToMove ? 'bg-foreground/90' : 'bg-muted-foreground/30'}`} />
        <span className="text-sm font-medium text-muted-foreground">
          {status === 'complete' ? 'Puzzle Complete!' : `${isWhiteToMove ? 'White' : 'Black'} to move`}
        </span>
      </div>

      {/* Board */}
      <div className="flex justify-center">
        <Chessboard
          fen={game.fen()}
          size={Math.min(360, typeof window !== 'undefined' ? window.innerWidth - 48 : 360)}
          interactive={status === 'playing'}
          onMove={handleMove}
          highlightSquares={highlightSquares}
          lastMove={lastMove || undefined}
          showCoordinates
        />
      </div>

      {/* Status feedback */}
      <AnimatePresence mode="wait">
        {status === 'correct' && (
          <motion.div
            key="correct"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 py-2"
          >
            <Check className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Correct! Keep going...</span>
          </motion.div>
        )}
        {status === 'wrong' && (
          <motion.div
            key="wrong"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2 py-2"
          >
            <X className="w-5 h-5 text-destructive" />
            <span className="text-sm font-semibold text-destructive">Wrong move. Try again!</span>
          </motion.div>
        )}
        {status === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5 flex flex-col items-center gap-3 glow-primary"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.6 }}
              className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center"
            >
              <Trophy className="w-8 h-8 text-primary" />
            </motion.div>
            <div className="text-center">
              <p className="text-lg font-display font-bold text-foreground">Puzzle Solved!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Solved in {formatTime(timer)}
              </p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">+{puzzle.xpReward} XP</span>
              </div>
            </div>
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm"
            >
              Next Puzzle <SkipForward className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        {status === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center"
          >
            <button
              onClick={handleHint}
              disabled={showHint}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm font-medium disabled:opacity-40 transition-opacity"
            >
              <Lightbulb className="w-4 h-4" />
              Show Hint
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Description */}
      <div className="glass-card p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">{puzzle.description}</p>
        {puzzle.themes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {puzzle.themes.map((theme) => (
              <span key={theme} className="px-2 py-0.5 rounded-full text-[10px] bg-secondary text-muted-foreground capitalize">
                {theme}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

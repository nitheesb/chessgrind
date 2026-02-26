'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chess } from 'chess.js'
import { Chessboard } from '@/components/chess/chessboard'
import { PUZZLES, getDifficultyBg } from '@/lib/chess-data'
import type { Puzzle } from '@/lib/chess-data'
import { useGame } from '@/lib/game-context'
import { useSettings } from '@/lib/settings-context'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import {
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
  RefreshCw,
  ChevronLeft,
  Target,
  Clock,
  TrendingUp,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

interface DesktopPuzzlesProps {
  onNavigate: (page: string) => void
}

export function DesktopPuzzles({ onNavigate }: DesktopPuzzlesProps) {
  const { profile } = useGame()
  const { playSound } = useSoundAndHaptics()
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null)
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')

  const filteredPuzzles = useMemo(() => {
    if (filterDifficulty === 'all') return PUZZLES
    return PUZZLES.filter(p => p.difficulty === filterDifficulty)
  }, [filterDifficulty])

  const stats = {
    solved: profile.puzzlesSolved,
    total: PUZZLES.length,
    accuracy: profile.puzzlesAttempted > 0 
      ? Math.round((profile.puzzlesCorrect / profile.puzzlesAttempted) * 100) 
      : 0,
    rating: profile.puzzleRating || 800,
  }

  if (activePuzzle) {
    return (
      <DesktopPuzzleSolver
        key={activePuzzle.id}
        puzzle={activePuzzle}
        onBack={() => setActivePuzzle(null)}
        onNext={() => {
          const idx = PUZZLES.findIndex(p => p.id === activePuzzle.id)
          if (idx < PUZZLES.length - 1) {
            setActivePuzzle(PUZZLES[idx + 1])
          } else {
            setActivePuzzle(null)
          }
        }}
      />
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-8 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={item} className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Tactical Puzzles</h1>
        <p className="text-muted-foreground">Sharpen your tactical vision with {PUZZLES.length} puzzles</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 text-center">
          <PuzzleIcon className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-foreground">{stats.solved}</p>
          <p className="text-sm text-muted-foreground">Puzzles Solved</p>
        </div>
        <div className="glass-card p-5 text-center">
          <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-foreground">{stats.accuracy}%</p>
          <p className="text-sm text-muted-foreground">Accuracy</p>
        </div>
        <div className="glass-card p-5 text-center">
          <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-foreground">{stats.rating}</p>
          <p className="text-sm text-muted-foreground">Puzzle Rating</p>
        </div>
        <div className="glass-card p-5 text-center">
          <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-foreground">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total Puzzles</p>
        </div>
      </motion.div>

      {/* Filter */}
      <motion.div variants={item} className="flex gap-2 mb-6">
        {['all', 'easy', 'medium', 'hard', 'expert'].map((diff) => (
          <button
            key={diff}
            onClick={() => {
              playSound('click')
              setFilterDifficulty(diff)
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              filterDifficulty === diff
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            {diff === 'all' ? 'All Puzzles' : diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Puzzle Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPuzzles.map((puzzle, idx) => (
          <motion.button
            key={puzzle.id}
            onClick={() => {
              playSound('click')
              setActivePuzzle(puzzle)
            }}
            className="glass-card-hover p-5 text-left group"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                #{idx + 1}
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-semibold">+{puzzle.xpReward} XP</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{puzzle.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{puzzle.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getDifficultyBg(puzzle.difficulty)}`}>
                  {puzzle.difficulty}
                </span>
                <span className="text-xs text-muted-foreground">Rating: {puzzle.rating}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  )
}

function DesktopPuzzleSolver({ puzzle, onBack, onNext }: { puzzle: Puzzle; onBack: () => void; onNext: () => void }) {
  const { addXP, incrementPuzzlesSolved, updatePuzzleRating } = useGame()
  const { settings } = useSettings()
  const { playSound, triggerHaptic } = useSoundAndHaptics()
  const [game, setGame] = useState(() => new Chess(puzzle.fen))
  const [moveIndex, setMoveIndex] = useState(0)
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong' | 'complete' | 'opponent-moving'>('playing')
  const [hintActive, setHintActive] = useState(false)
  const hintActiveRef = useRef(false)
  const [timer, setTimer] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [hintArrow, setHintArrow] = useState<{ from: string; to: string } | null>(null)
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const processingRef = useRef(false)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1)
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Helper to calculate hint for current move
  const calculateHint = useCallback((currentGame: Chess, currentMoveIndex: number) => {
    const expectedMove = puzzle.moves[currentMoveIndex]
    if (!expectedMove) return null

    try {
      const gameCopy = new Chess(currentGame.fen())
      const move = gameCopy.move(expectedMove)
      if (move) {
        return { from: move.from, to: move.to }
      }
    } catch {
      // ignore
    }
    return null
  }, [puzzle.moves])

  const playOpponentMove = useCallback((currentGame: Chess, currentMoveIndex: number) => {
    const opponentMoveStr = puzzle.moves[currentMoveIndex]
    if (!opponentMoveStr) {
      setStatus('playing')
      return
    }

    setStatus('opponent-moving')
    
    setTimeout(() => {
      try {
        const opponentGame = new Chess(currentGame.fen())
        const opMove = opponentGame.move(opponentMoveStr)
        
        if (opMove) {
          setGame(opponentGame)
          setLastMove({ from: opMove.from, to: opMove.to })
          setMoveHistory(prev => [...prev, opMove.san])
          const nextIndex = currentMoveIndex + 1
          setMoveIndex(nextIndex)
          playSound('move')
          
          if (nextIndex >= puzzle.moves.length) {
            setStatus('complete')
            if (timerRef.current) clearInterval(timerRef.current)
            addXP(puzzle.xpReward)
            incrementPuzzlesSolved()
            updatePuzzleRating(puzzle.rating, true, timer)
            playSound('success')
            triggerHaptic('success')
          } else {
            setStatus('playing')
            // If hint was showing, update it for the next move
            if (hintActiveRef.current) {
              const newHint = calculateHint(opponentGame, nextIndex)
              setHintArrow(newHint)
            }
          }
        } else {
          setStatus('playing')
        }
      } catch {
        setStatus('playing')
      }
      processingRef.current = false
    }, 600)
  }, [puzzle.moves, puzzle.xpReward, puzzle.rating, addXP, incrementPuzzlesSolved, updatePuzzleRating, timer, playSound, triggerHaptic, calculateHint])

  const handleMove = useCallback((from: string, to: string): boolean => {
    if (status !== 'playing' || processingRef.current) return false
    processingRef.current = true

    const expectedMove = puzzle.moves[moveIndex]
    if (!expectedMove) {
      processingRef.current = false
      return false
    }

    try {
      const gameCopy = new Chess(game.fen())
      const move = gameCopy.move({ from, to, promotion: 'q' })

      if (!move) {
        processingRef.current = false
        return false
      }

      if (move.san === expectedMove) {
        setGame(gameCopy)
        setLastMove({ from, to })
        setHintArrow(null)
        setMoveHistory(prev => [...prev, move.san])
        
        const nextMoveIndex = moveIndex + 1

        if (nextMoveIndex >= puzzle.moves.length) {
          setMoveIndex(nextMoveIndex)
          setStatus('complete')
          if (timerRef.current) clearInterval(timerRef.current)
          addXP(puzzle.xpReward)
          incrementPuzzlesSolved()
          updatePuzzleRating(puzzle.rating, true, timer)
          playSound('success')
          triggerHaptic('success')
        } else {
          setMoveIndex(nextMoveIndex)
          setStatus('correct')
          playSound('move')
          
          setTimeout(() => {
            playOpponentMove(gameCopy, nextMoveIndex)
          }, 300)
        }
        return true
      } else {
        setStatus('wrong')
        playSound('fail')
        triggerHaptic('error')
        updatePuzzleRating(puzzle.rating, false, timer)
        processingRef.current = false
        return false
      }
    } catch {
      processingRef.current = false
      return false
    }
  }, [status, puzzle.moves, puzzle.xpReward, puzzle.rating, moveIndex, game, addXP, incrementPuzzlesSolved, updatePuzzleRating, timer, playOpponentMove, playSound, triggerHaptic])

  const handleRetry = useCallback(() => {
    playSound('click')
    setGame(new Chess(puzzle.fen))
    setMoveIndex(0)
    setStatus('playing')
    setLastMove(null)
    setHintArrow(null)
    setHintActive(false)
    hintActiveRef.current = false
    setMoveHistory([])
    setTimer(0)
    processingRef.current = false
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000)
  }, [puzzle.fen, playSound])

  const handleShowHint = useCallback(() => {
    playSound('click')
    const hint = calculateHint(game, moveIndex)
    if (hint) {
      setHintArrow(hint)
      setHintActive(true)
      hintActiveRef.current = true
    }
  }, [game, moveIndex, calculateHint, playSound])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const playerColor = game.turn() === 'w' ? 'white' : 'black'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-3 gap-8">
        {/* Left Panel - Puzzle Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <button
            onClick={() => {
              playSound('click')
              onBack()
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to puzzles
          </button>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <PuzzleIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{puzzle.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getDifficultyBg(puzzle.difficulty)}`}>
                    {puzzle.difficulty}
                  </span>
                  <span className="text-xs text-muted-foreground">Rating: {puzzle.rating}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{puzzle.description}</p>
          </div>

          {/* Timer & Stats */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-2xl font-mono font-bold text-foreground">{formatTime(timer)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-lg font-bold text-primary">+{puzzle.xpReward} XP</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Move {Math.floor(moveIndex / 2) + 1} of {Math.ceil(puzzle.moves.length / 2)}
            </div>
          </div>

          {/* Move History */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Move History</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {moveHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No moves yet</p>
              ) : (
                moveHistory.map((move, i) => (
                  <div key={i} className={`text-sm px-2 py-1 rounded ${
                    i % 2 === 0 ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {Math.floor(i / 2) + 1}{i % 2 === 0 ? '.' : '...'} {move}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <motion.button
              onClick={handleShowHint}
              disabled={status !== 'playing'}
              className="flex-1 py-3 rounded-xl bg-secondary text-muted-foreground font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 disabled:opacity-50 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Lightbulb className="w-5 h-5" />
              Hint
            </motion.button>
            <motion.button
              onClick={handleRetry}
              className="flex-1 py-3 rounded-xl bg-secondary text-muted-foreground font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className="w-5 h-5" />
              Retry
            </motion.button>
          </div>
        </motion.div>

        {/* Center - Chessboard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="col-span-2"
        >
          <div className="glass-card p-6">
            {/* Status Bar */}
            <AnimatePresence mode="wait">
              <motion.div
                key={status}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`mb-4 p-4 rounded-xl text-center font-medium ${
                  status === 'playing' || status === 'opponent-moving'
                    ? 'bg-blue-500/10 text-blue-500'
                    : status === 'correct'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : status === 'wrong'
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-amber-500/10 text-amber-500'
                }`}
              >
                {status === 'playing' && (
                  <span className="flex items-center justify-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${playerColor === 'white' ? 'bg-white border border-gray-300' : 'bg-gray-800'}`} />
                    {playerColor === 'white' ? 'White' : 'Black'} to move - Find the best move!
                  </span>
                )}
                {status === 'opponent-moving' && 'Opponent is thinking...'}
                {status === 'correct' && (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" /> Correct! Keep going...
                  </span>
                )}
                {status === 'wrong' && (
                  <span className="flex items-center justify-center gap-2">
                    <X className="w-5 h-5" /> Not quite. Try again!
                  </span>
                )}
                {status === 'complete' && (
                  <span className="flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5" /> Puzzle Complete! +{puzzle.xpReward} XP
                  </span>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Chessboard */}
            <div className="flex justify-center">
              <Chessboard
                fen={game.fen()}
                onMove={handleMove}
                orientation={puzzle.playerColor || 'white'}
                interactive={status === 'playing'}
                size={560}
                highlightSquares={lastMove ? [lastMove.from, lastMove.to] : []}
                showHint={hintArrow}
                boardStyle={settings.boardStyle}
                pieceStyle={settings.pieceStyle}
              />
            </div>

            {/* Complete Actions */}
            {status === 'complete' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex gap-4"
              >
                <motion.button
                  onClick={() => {
                    playSound('click')
                    onBack()
                  }}
                  className="flex-1 py-4 rounded-xl bg-secondary text-foreground font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back to Puzzles
                </motion.button>
                <motion.button
                  onClick={() => {
                    playSound('click')
                    onNext()
                  }}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Next Puzzle <SkipForward className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}

            {/* Wrong - Retry Button */}
            {status === 'wrong' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <motion.button
                  onClick={handleRetry}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RefreshCw className="w-5 h-5" /> Try Again
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedCounter } from '@/components/ui/animated-components'
import { Chess } from 'chess.js'
import { Chessboard } from '@/components/chess/chessboard'
import { EvalBar } from '@/components/chess/eval-bar'
import { Skeleton, SkeletonPuzzleList } from '@/components/ui/skeleton'
import { PUZZLES, getDifficultyBg } from '@/lib/chess-data'
import type { Puzzle } from '@/lib/chess-data'
import { useGame } from '@/lib/game-context'
import { useSettings } from '@/lib/settings-context'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import { ShareButtons } from '@/components/ui/share-buttons'
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
  Volume2,
  VolumeX,
  Minus,
  Plus,
  Flame,
} from 'lucide-react'

interface DesktopPuzzlesProps {
  onNavigate: (page: string) => void
}

export function DesktopPuzzles({ onNavigate }: DesktopPuzzlesProps) {
  const { profile } = useGame()
  const { playSound } = useSoundAndHaptics()
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null)
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [rushMinutes, setRushMinutes] = useState<3 | 5 | null>(null)

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

  if (rushMinutes) {
    return (
      <PuzzleRushMode minutes={rushMinutes} onBack={() => setRushMinutes(null)} />
    )
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
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Tactical Puzzles</h1>
        <p className="text-muted-foreground">Sharpen your tactical vision with {PUZZLES.length} puzzles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 text-center">
          <PuzzleIcon className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-foreground"><AnimatedCounter value={stats.solved} /></p>
          <p className="text-sm text-muted-foreground">Puzzles Solved</p>
        </div>
        <div className="glass-card p-5 text-center">
          <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-foreground"><AnimatedCounter value={stats.accuracy} suffix="%" /></p>
          <p className="text-sm text-muted-foreground">Accuracy</p>
        </div>
        <div className="glass-card p-5 text-center">
          <TrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-foreground"><AnimatedCounter value={stats.rating} /></p>
          <p className="text-sm text-muted-foreground">Puzzle Rating</p>
        </div>
        <div className="glass-card p-5 text-center">
          <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <p className="text-3xl font-bold text-foreground"><AnimatedCounter value={stats.total} /></p>
          <p className="text-sm text-muted-foreground">Total Puzzles</p>
        </div>
      </div>

      {/* Puzzle Rush */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-orange-400" />
          <h2 className="text-sm font-semibold text-foreground">Puzzle Rush</h2>
          <span className="text-xs text-muted-foreground">Solve as many as you can!</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { playSound('click'); setRushMinutes(3) }}
            className="flex-1 py-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 font-semibold text-sm hover:bg-orange-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Timer className="w-4 h-4" />
            3 min Rush
          </button>
          <button
            onClick={() => { playSound('click'); setRushMinutes(5) }}
            className="flex-1 py-3 rounded-xl bg-primary/10 border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
          >
            <Timer className="w-4 h-4" />
            5 min Rush
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex mb-6">
        <div className="segmented-control flex">
          {['all', 'easy', 'medium', 'hard', 'expert'].map((diff) => (
            <button
              key={diff}
              onClick={() => {
                playSound('click')
                setFilterDifficulty(diff)
              }}
              className="relative"
            >
              {filterDifficulty === diff && (
                <motion.div
                  layoutId="puzzle-filter-pill"
                  className="absolute inset-0 segmented-control-pill"
                  transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                />
              )}
              <span className={`relative z-10 ${
                filterDifficulty === diff ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {diff === 'all' ? 'All Puzzles' : diff.charAt(0).toUpperCase() + diff.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Puzzle Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPuzzles.map((puzzle, idx) => (
          <button
            key={puzzle.id}
            onClick={() => {
              playSound('click')
              setActivePuzzle(puzzle)
            }}
            className="glass-card-hover p-5 text-left group"
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
          </button>
        ))}
      </div>
    </div>
  )
}

function DesktopPuzzleSolver({ puzzle, onBack, onNext }: { puzzle: Puzzle; onBack: () => void; onNext: () => void }) {
  const { addXP, incrementPuzzlesSolved, updatePuzzleRating, trackPuzzleFailure, incrementCombo, resetCombo, recordPerfectSolve, profile } = useGame()
  const { settings, updateSetting } = useSettings()
  const { playSound, triggerHaptic } = useSoundAndHaptics()
  const [game, setGame] = useState(() => new Chess(puzzle.fen))
  const [moveIndex, setMoveIndex] = useState(0)
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong' | 'complete' | 'opponent-moving'>('playing')
  const [hintLevel, setHintLevel] = useState(0)
  const hintLevelRef = useRef(0)
  const [timer, setTimer] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [highlightSquares, setHighlightSquares] = useState<string[]>([])
  const [hintArrow, setHintArrow] = useState<{ from: string; to: string } | null>(null)
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const processingRef = useRef(false)
  const hadWrongMoveRef = useRef(false)
  const [wrongMoveHint, setWrongMoveHint] = useState<string | null>(null)
  const [earnedXP, setEarnedXP] = useState(0)
  const [boardSize, setBoardSize] = useState(520)
  const updateBoardSize = (delta: number) => {
    setBoardSize(prev => Math.min(Math.max(prev + delta, 360), 600))
  }

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

  // Handle puzzle completion with combo and perfect solve
  const completePuzzle = useCallback(() => {
    setStatus('complete')
    if (timerRef.current) clearInterval(timerRef.current)
    
    const comboMultiplier = incrementCombo()
    const isPerfect = !hadWrongMoveRef.current
    const perfectBonus = isPerfect ? 1.5 : 1
    const totalXP = Math.round(puzzle.xpReward * comboMultiplier * perfectBonus)
    
    setEarnedXP(totalXP)
    // Delay XP popup slightly so combo overlay appears first
    setTimeout(() => addXP(totalXP), 300)
    incrementPuzzlesSolved()
    updatePuzzleRating(puzzle.rating, true, timer)
    playSound('success')
    triggerHaptic('success')
    
    if (isPerfect) {
      recordPerfectSolve()
    }
  }, [puzzle.xpReward, puzzle.rating, timer, addXP, incrementPuzzlesSolved, updatePuzzleRating, incrementCombo, recordPerfectSolve, playSound, triggerHaptic])

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
            completePuzzle()
          } else {
            setStatus('playing')
            if (hintLevelRef.current >= 2) {
              const newHint = calculateHint(opponentGame, nextIndex)
              if (newHint) {
                setHintArrow(newHint)
                setHighlightSquares([newHint.from, newHint.to])
              }
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
  }, [puzzle.moves, completePuzzle, playSound, calculateHint])

  const handleMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    if (status !== 'playing' || processingRef.current) return false
    processingRef.current = true

    const expectedMove = puzzle.moves[moveIndex]
    if (!expectedMove) {
      processingRef.current = false
      return false
    }

    try {
      const gameCopy = new Chess(game.fen())
      const move = gameCopy.move({ from, to, promotion: promotion || 'q' })

      if (!move) {
        processingRef.current = false
        return false
      }

      if (move.san === expectedMove) {
        setGame(gameCopy)
        setLastMove({ from, to })
        setHintArrow(null)
        setHighlightSquares([])
        setMoveHistory(prev => [...prev, move.san])
        
        const nextMoveIndex = moveIndex + 1

        if (nextMoveIndex >= puzzle.moves.length) {
          setMoveIndex(nextMoveIndex)
          completePuzzle()
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
        hadWrongMoveRef.current = true
        setHintArrow(null)
        setWrongMoveHint(expectedMove)
        resetCombo()
        playSound('fail')
        triggerHaptic('error')
        trackPuzzleFailure(puzzle.themes)
        processingRef.current = false
        setTimeout(() => setWrongMoveHint(null), 3000)
        return false
      }
    } catch {
      processingRef.current = false
      return false
    }
  }, [status, puzzle.moves, puzzle.rating, puzzle.themes, moveIndex, game, completePuzzle, resetCombo, updatePuzzleRating, trackPuzzleFailure, timer, playOpponentMove, playSound, triggerHaptic])

  const handleRetry = useCallback(() => {
    playSound('click')
    setGame(new Chess(puzzle.fen))
    setMoveIndex(0)
    setStatus('playing')
    setLastMove(null)
    setHintArrow(null)
    setHighlightSquares([])
    setHintLevel(0)
    hintLevelRef.current = 0
    setMoveHistory([])
    setTimer(0)
    processingRef.current = false
    hadWrongMoveRef.current = false
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000)
  }, [puzzle.fen, playSound])

  const handleShowHint = useCallback(() => {
    if (hintLevel >= 3) return
    playSound('click')
    const nextLevel = hintLevel + 1
    setHintLevel(nextLevel)
    hintLevelRef.current = nextLevel
    const hint = calculateHint(game, moveIndex)
    if (!hint) return

    if (nextLevel === 1) {
      setHighlightSquares([hint.from])
      setHintArrow(null)
    } else if (nextLevel === 2) {
      setHighlightSquares([hint.from, hint.to])
      setHintArrow(null)
    } else {
      setHintArrow(hint)
      setHighlightSquares([hint.from, hint.to])
    }
  }, [game, moveIndex, calculateHint, hintLevel, playSound])

  const hintButtonLabel =
    hintLevel === 0 ? 'Hint: Piece' :
    hintLevel === 1 ? 'Hint: Target' :
    hintLevel === 2 ? 'Hint: Full' : 'Active'
  const hintXPCost = hintLevel * 5

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Player's color is determined by whose turn it is in the initial FEN
  const playerColor = puzzle.fen.split(' ')[1] === 'w' ? 'white' : 'black'

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
              disabled={status !== 'playing' || hintLevel >= 3}
              className="flex-1 py-3 rounded-xl bg-secondary text-muted-foreground font-medium flex flex-col items-center justify-center gap-1 hover:bg-secondary/80 disabled:opacity-50 transition-all"
            >
              <div className="flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" />
                <span className="text-sm">{hintButtonLabel}</span>
              </div>
              {hintXPCost > 0 && <span className="text-[10px] text-orange-400">-{hintXPCost} XP</span>}
            </motion.button>
            <motion.button
              onClick={handleRetry}
              className="flex-1 py-3 rounded-xl bg-secondary text-muted-foreground font-medium flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              Retry
            </motion.button>
            <button
              onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
              className="px-3 py-3 rounded-xl bg-secondary text-muted-foreground hover:bg-secondary/80 transition-all"
              title={settings.soundEnabled ? 'Mute' : 'Unmute'}
            >
              {settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
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
                    ? 'bg-amber-500/10 text-amber-500'
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
                    <Trophy className="w-5 h-5" /> Puzzle Complete! +{earnedXP || puzzle.xpReward} XP
                    {earnedXP > puzzle.xpReward && <span className="text-orange-400">🔥</span>}
                  </span>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Chessboard with eval bar */}
            <div className="flex justify-center items-stretch gap-3">
              <EvalBar game={game} size={boardSize} thickness={20} vertical />
              <div>
                <Chessboard
                  fen={game.fen()}
                  onMove={handleMove}
                  orientation={playerColor}
                  interactive={status === 'playing'}
                  size={boardSize}
                  highlightSquares={highlightSquares.length > 0 ? highlightSquares : (lastMove ? [lastMove.from, lastMove.to] : [])}
                  showHint={hintArrow}
                  isCheck={game.isCheck()}
                  boardStyle={settings.boardStyle}
                  pieceStyle={settings.pieceStyle}
                  allowArrowDrawing
                />
              </div>
            </div>

            {/* Board size controls */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <button onClick={() => updateBoardSize(-20)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                <Minus className="w-3 h-3 text-muted-foreground" />
              </button>
              <span className="text-[11px] text-muted-foreground font-mono w-16 text-center">{boardSize}px</span>
              <button onClick={() => updateBoardSize(20)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                <Plus className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>

            {/* Complete Actions */}
            {status === 'complete' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6"
              >
                {/* Success celebration card */}
                <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 via-primary/5 to-transparent border border-primary/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
                  <div className="flex items-center gap-4 relative z-10">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.3 }}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/30"
                    >
                      <Trophy className="w-8 h-8 text-white" />
                    </motion.div>
                    <div className="flex-1">
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl font-bold text-foreground"
                      >
                        Puzzle Complete! 🎉
                      </motion.p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5, type: 'spring' }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/15 text-primary font-bold text-sm border border-primary/20"
                        >
                          <Zap className="w-4 h-4" /> +{earnedXP || puzzle.xpReward} XP
                        </motion.span>
                        {earnedXP > puzzle.xpReward && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6, type: 'spring' }}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 font-bold text-sm border border-orange-500/20"
                          >
                            🔥 Combo Bonus!
                          </motion.span>
                        )}
                        {!hadWrongMoveRef.current && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.7, type: 'spring' }}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-500/15 text-violet-400 font-bold text-sm border border-violet-500/20"
                          >
                            ✨ Perfect!
                          </motion.span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <motion.button
                    onClick={() => {
                      playSound('click')
                      onBack()
                    }}
                    className="flex-1 py-4 rounded-xl bg-secondary text-foreground font-semibold flex items-center justify-center gap-2"
                  >
                    Back to Puzzles
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      playSound('click')
                      onNext()
                    }}
                    className="flex-1 py-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    Next Puzzle <SkipForward className="w-5 h-5" />
                  </motion.button>
                  <ShareButtons
                    compact
                    title={`I solved "${puzzle.title}" on ChessVault!`}
                    text={`🧩 I just solved "${puzzle.title}" (${puzzle.difficulty}) and earned ${earnedXP || puzzle.xpReward} XP on ChessVault!`}
                  />
                </div>
              </motion.div>
            )}

            {/* Wrong - Retry Button */}
            {status === 'wrong' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex flex-col items-center gap-3"
              >
                {wrongMoveHint && (
                  <p className="text-sm text-muted-foreground">Expected: <strong className="text-foreground">{wrongMoveHint}</strong></p>
                )}
                <motion.button
                  onClick={handleRetry}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold flex items-center justify-center gap-2"
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

function PuzzleRushMode({ minutes, onBack }: { minutes: 3 | 5; onBack: () => void }) {
  const { addXP, incrementPuzzlesSolved } = useGame()
  const { settings } = useSettings()
  const { playSound } = useSoundAndHaptics()
  const [timeLeft, setTimeLeft] = useState(minutes * 60)
  const [solved, setSolved] = useState(0)
  const [failed, setFailed] = useState(0)
  const [puzzleIdx, setPuzzleIdx] = useState(() => Math.floor(Math.random() * PUZZLES.length))
  const [game, setGame] = useState(() => new Chess(PUZZLES[puzzleIdx].fen))
  const [moveIndex, setMoveIndex] = useState(0)
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong' | 'done' | 'opponent-moving'>('playing')
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const processingRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const puzzle = PUZZLES[puzzleIdx]

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          setStatus('done')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const nextPuzzle = useCallback(() => {
    const nextIdx = (puzzleIdx + 1) % PUZZLES.length
    setPuzzleIdx(nextIdx)
    setGame(new Chess(PUZZLES[nextIdx].fen))
    setMoveIndex(0)
    setLastMove(null)
    setStatus('playing')
    processingRef.current = false
  }, [puzzleIdx])

  const handleMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    if (status !== 'playing' || processingRef.current) return false
    processingRef.current = true

    const expectedMove = puzzle.moves[moveIndex]
    if (!expectedMove) { processingRef.current = false; return false }

    try {
      const gameCopy = new Chess(game.fen())
      const move = gameCopy.move({ from, to, promotion: promotion || 'q' })
      if (!move) { processingRef.current = false; return false }

      if (move.san === expectedMove) {
        setGame(gameCopy)
        setLastMove({ from, to })
        const nextIdx = moveIndex + 1
        if (nextIdx >= puzzle.moves.length) {
          setSolved(s => s + 1)
          addXP(puzzle.xpReward)
          incrementPuzzlesSolved()
          playSound('success')
          setTimeout(() => nextPuzzle(), 800)
        } else {
          setMoveIndex(nextIdx)
          setStatus('correct')
          playSound('move')
          setTimeout(() => {
            try {
              const opGame = new Chess(gameCopy.fen())
              const opMove = opGame.move(puzzle.moves[nextIdx])
              if (opMove) {
                setGame(opGame)
                setLastMove({ from: opMove.from, to: opMove.to })
                setMoveIndex(nextIdx + 1)
              }
              setStatus('playing')
            } catch { setStatus('playing') }
            processingRef.current = false
          }, 500)
          return true
        }
        processingRef.current = false
        return true
      } else {
        setFailed(f => f + 1)
        setStatus('wrong')
        playSound('fail')
        processingRef.current = false
        setTimeout(() => nextPuzzle(), 1000)
        return false
      }
    } catch { processingRef.current = false; return false }
  }, [status, game, moveIndex, puzzle, addXP, incrementPuzzlesSolved, nextPuzzle, playSound])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  if (status === 'done') {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <div className="glass-card p-10">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-foreground mb-2">Puzzle Rush Over!</h2>
          <p className="text-muted-foreground mb-6">{minutes} minute challenge complete</p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="glass-card p-5 text-center">
              <p className="text-4xl font-bold text-primary">{solved}</p>
              <p className="text-sm text-muted-foreground">Solved</p>
            </div>
            <div className="glass-card p-5 text-center">
              <p className="text-4xl font-bold text-red-400">{failed}</p>
              <p className="text-sm text-muted-foreground">Failed</p>
            </div>
          </div>
          <button onClick={onBack} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-semibold">
            Back to Puzzles
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-5 h-5" /> Exit Rush
        </button>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 font-bold">
            <Check className="w-4 h-4" /> {solved}
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-xl ${timeLeft < 30 ? 'bg-red-500/10 text-red-400' : 'bg-secondary text-foreground'}`}>
            <Timer className="w-5 h-5" /> {formatTime(timeLeft)}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 font-bold">
            <X className="w-4 h-4" /> {failed}
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <Chessboard
          fen={game.fen()}
          onMove={handleMove}
          orientation={puzzle.fen.split(' ')[1] === 'w' ? 'white' : 'black'}
          interactive={status === 'playing'}
          size={500}
          highlightSquares={lastMove ? [lastMove.from, lastMove.to] : []}
          isCheck={game.isCheck()}
          boardStyle={settings.boardStyle}
          pieceStyle={settings.pieceStyle}
          allowArrowDrawing
        />
      </div>
    </div>
  )
}

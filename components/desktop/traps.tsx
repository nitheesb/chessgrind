'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chess } from 'chess.js'
import { Chessboard, MiniChessboard } from '@/components/chess/chessboard'
import { TRAPS } from '@/lib/chess-data'
import type { Trap } from '@/lib/chess-data'
import { useGame } from '@/lib/game-context'
import { useSettings } from '@/lib/settings-context'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import {
  Target,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Clock,
  Zap,
  Check,
  Eye,
  FlipVertical,
  BookOpen,
} from 'lucide-react'

interface DesktopTrapsProps {
  onNavigate: (page: string) => void
}

export function DesktopTraps({ onNavigate }: DesktopTrapsProps) {
  const { settings } = useSettings()
  const { playSound } = useSoundAndHaptics()
  const [activeTrap, setActiveTrap] = useState<Trap | null>(null)

  if (activeTrap) {
    return (
      <DesktopTrapViewer
        trap={activeTrap}
        onBack={() => setActiveTrap(null)}
      />
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
            <Target className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Opening Traps</h1>
            <p className="text-muted-foreground">Learn devastating traps to catch your opponents</p>
          </div>
        </div>
      </div>

      {/* Warning Card */}
      <div className="mb-8">
        <div className="glass-card p-5 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Master These Traps</h3>
              <p className="text-sm text-muted-foreground">
                Understanding opening traps helps you both spring them on opponents and avoid falling into them yourself. 
                Study the setup, the bait, and the punishment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Traps Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {TRAPS.map((trap) => (
          <button
            key={trap.id}
            onClick={() => {
              playSound('click')
              setActiveTrap(trap)
            }}
            className="glass-card-hover p-5 text-left group hover-lift"
          >
            <div className="flex gap-4">
              <div className="rounded-xl overflow-hidden shadow-md flex-shrink-0" style={{ width: 80, height: 80 }}>
                <MiniChessboard fen={trap.fen} size={80} boardStyle={settings.boardStyle} pieceStyle={settings.pieceStyle} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground mb-1 truncate">{trap.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{trap.description}</p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                    Trap
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {trap.moves.length} moves
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
              <span className="text-xs text-primary font-medium flex items-center gap-1">
                <Zap className="w-3 h-3" /> +{trap.xpReward} XP
              </span>
              <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                Study <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function DesktopTrapViewer({ trap, onBack }: { trap: Trap; onBack: () => void }) {
  const { addXP, incrementTrapsLearned } = useGame()
  const { settings } = useSettings()
  const { playSound } = useSoundAndHaptics()
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [boardFlipOverride, setBoardFlipOverride] = useState(false)
  const [showCoords, setShowCoords] = useState(true)

  const currentFen = useMemo(() => {
    if (currentMoveIndex < 0) return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    
    const game = new Chess()
    for (let i = 0; i <= currentMoveIndex && i < trap.moves.length; i++) {
      try { game.move(trap.moves[i]) } catch { break }
    }
    return game.fen()
  }, [currentMoveIndex, trap.moves])

  const markCompleted = useCallback(() => {
    if (!isCompleted) {
      setIsCompleted(true)
      addXP(trap.xpReward)
      incrementTrapsLearned()
    }
  }, [isCompleted, addXP, incrementTrapsLearned, trap.xpReward])

  const handleNext = useCallback(() => {
    if (currentMoveIndex < trap.moves.length - 1) {
      playSound('move')
      const nextIndex = currentMoveIndex + 1
      setCurrentMoveIndex(nextIndex)
      if (nextIndex === trap.moves.length - 1) {
        markCompleted()
      }
    }
  }, [currentMoveIndex, trap.moves.length, playSound, markCompleted])

  const handlePrev = useCallback(() => {
    if (currentMoveIndex >= 0) {
      playSound('click')
      setCurrentMoveIndex(prev => prev - 1)
    }
  }, [currentMoveIndex, playSound])

  const handleReset = useCallback(() => {
    playSound('click')
    setCurrentMoveIndex(-1)
    setIsAutoPlaying(false)
  }, [playSound])

  const handleAutoPlay = useCallback(() => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false)
      return
    }
    setIsAutoPlaying(true)
    setCurrentMoveIndex(-1)

    let idx = -1
    const interval = setInterval(() => {
      idx++
      if (idx >= trap.moves.length) {
        clearInterval(interval)
        setIsAutoPlaying(false)
        return
      }
      setCurrentMoveIndex(idx)
      if (idx === trap.moves.length - 1) {
        markCompleted()
      }
    }, 1200)
  }, [isAutoPlaying, trap.moves.length, markCompleted])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === ' ') {
        e.preventDefault()
        handleAutoPlay()
      } else if (e.key === 'r' || e.key === 'R') {
        handleReset()
      } else if (e.key === 'Escape') {
        onBack()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev, handleAutoPlay, handleReset, onBack])

  // Highlight the trap move
  const trapMoveIndex = (trap as Trap & { trapMoveIndex?: number }).trapMoveIndex !== undefined ? (trap as Trap & { trapMoveIndex?: number }).trapMoveIndex! : -1
  const isTrapMove = currentMoveIndex === trapMoveIndex

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-3 gap-8">
        {/* Left Panel */}
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
            Back to traps
          </button>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{trap.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                    Opening Trap
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{trap.description}</p>
          </div>

          {/* Step-by-Step Explanation */}
          {trap.explanation && trap.explanation.length > 0 && (
            <div className="glass-card p-5">
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="w-full flex items-center justify-between mb-1"
              >
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" /> Step-by-Step Explanation
                </h3>
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${showExplanation ? 'rotate-90' : ''}`} />
              </button>
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-2 mt-3">
                      {trap.explanation.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-primary">{idx + 1}</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Move List */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Move Sequence</h3>
            <div className="flex flex-wrap gap-2">
              {trap.moves.map((move, i) => (
                <button
                  key={i}
                  onClick={() => {
                    playSound('click')
                    setCurrentMoveIndex(i)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-all ${
                    i === currentMoveIndex
                      ? i === trapMoveIndex
                        ? 'bg-red-500 text-white'
                        : 'bg-primary text-primary-foreground'
                      : i < currentMoveIndex
                      ? 'bg-primary/10 text-primary'
                      : i === trapMoveIndex
                      ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  {i % 2 === 0 && <span className="text-xs opacity-60">{Math.floor(i/2) + 1}.</span>} {move}
                </button>
              ))}
            </div>
            {/* Move annotation */}
            {trap.moveAnnotations && currentMoveIndex >= 0 && trap.moveAnnotations[currentMoveIndex] && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <div className="flex items-start gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    <span className="font-mono font-semibold text-primary mr-1">
                      {trap.moves[currentMoveIndex]}
                    </span>
                    — {trap.moveAnnotations[currentMoveIndex]}
                  </p>
                </div>
              </div>
            )}
            {trapMoveIndex >= 0 && (
              <p className="text-xs text-red-500 mt-3 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Move {trapMoveIndex + 1} is the trap!
              </p>
            )}
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground/50 px-1">
            <span><kbd className="px-1 py-0.5 rounded bg-secondary text-[9px] font-mono">←→</kbd> Navigate</span>
            <span><kbd className="px-1 py-0.5 rounded bg-secondary text-[9px] font-mono">Space</kbd> Play</span>
            <span><kbd className="px-1 py-0.5 rounded bg-secondary text-[9px] font-mono">R</kbd> Reset</span>
            <span><kbd className="px-1 py-0.5 rounded bg-secondary text-[9px] font-mono">Esc</kbd> Back</span>
          </div>
        </motion.div>

        {/* Center - Board */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="col-span-2"
        >
          <div className="glass-card p-6">
            {/* Completion Banner */}
            <AnimatePresence>
              {isCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold text-primary">Trap Learned!</span>
                  <span className="text-xs text-primary/70">+{trap.xpReward} XP</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Trap Alert */}
            <AnimatePresence>
              {isTrapMove && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 font-semibold text-center flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-5 h-5" /> The Trap is Sprung!
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Progress</span>
                <span>{currentMoveIndex + 1} / {trap.moves.length}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${isTrapMove ? 'bg-red-500' : 'bg-primary'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentMoveIndex + 1) / trap.moves.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Board */}
            <div className="flex justify-center mb-4">
              <Chessboard
                fen={currentFen}
                onMove={() => false}
                flipped={trap.side === 'black' !== boardFlipOverride}
                interactive={false}
                size={560}
                showCoordinates={showCoords}
                boardStyle={settings.boardStyle}
                pieceStyle={settings.pieceStyle}
              />
            </div>

            {/* Board toggles */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                onClick={() => setBoardFlipOverride(!boardFlipOverride)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground text-xs transition-colors"
              >
                <FlipVertical className="w-3.5 h-3.5" />
                Flip
              </button>
              <button
                onClick={() => setShowCoords(!showCoords)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  showCoords ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Coords
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <motion.button
                onClick={handleReset}
                className="p-3 rounded-xl bg-secondary text-muted-foreground hover:bg-secondary/80 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={handlePrev}
                disabled={currentMoveIndex < 0}
                className="p-3 rounded-xl bg-secondary text-muted-foreground hover:bg-secondary/80 disabled:opacity-50 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={handleAutoPlay}
                className={`p-4 rounded-xl transition-all ${
                  isAutoPlaying
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {isAutoPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </motion.button>
              <motion.button
                onClick={handleNext}
                disabled={currentMoveIndex >= trap.moves.length - 1}
                className="p-3 rounded-xl bg-secondary text-muted-foreground hover:bg-secondary/80 disabled:opacity-50 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Current Move */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {currentMoveIndex < 0 ? 'Starting position' : (
                  <>
                    Move {currentMoveIndex + 1}: <span className={`font-mono font-semibold ${isTrapMove ? 'text-red-500' : 'text-foreground'}`}>{trap.moves[currentMoveIndex]}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

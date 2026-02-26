'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chess } from 'chess.js'
import { Chessboard, MiniChessboard } from '@/components/chess/chessboard'
import { TRAPS, getDifficultyBg } from '@/lib/chess-data'
import type { Trap } from '@/lib/chess-data'
import { useGame } from '@/lib/game-context'
import { useSettings } from '@/lib/settings-context'
import {
  ArrowLeft,
  Target,
  ChevronRight,
  Play,
  SkipBack,
  SkipForward,
  RotateCcw,
  Check,
  Zap,
  AlertTriangle,
  Eye,
  BookOpen,
  FlipVertical,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

interface TrapsPageProps {
  onBack: () => void
}

export function TrapsPage({ onBack }: TrapsPageProps) {
  const { settings } = useSettings()
  const [activeTrap, setActiveTrap] = useState<Trap | null>(null)
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')

  const filteredTraps = useMemo(() => {
    if (filterDifficulty === 'all') return TRAPS
    return TRAPS.filter(t => t.difficulty === filterDifficulty)
  }, [filterDifficulty])

  if (activeTrap) {
    return <TrapViewer trap={activeTrap} onBack={() => setActiveTrap(null)} />
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
          <h1 className="text-xl font-display font-bold text-foreground">Opening Traps</h1>
          <p className="text-xs text-muted-foreground">{TRAPS.length} traps to master</p>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div variants={item} className="glass-card p-4 flex items-start gap-3 border-accent/20">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Learn Devastating Traps</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Opening traps are sequences of moves that punish natural-looking replies. Master them to win quick games and avoid falling into them yourself!
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 text-center">
          <Target className="w-4 h-4 text-red-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{TRAPS.length}</p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Eye className="w-4 h-4 text-blue-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{TRAPS.filter(t => t.side === 'white').length}</p>
          <p className="text-[10px] text-muted-foreground">For White</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Eye className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground">{TRAPS.filter(t => t.side === 'black').length}</p>
          <p className="text-[10px] text-muted-foreground">For Black</p>
        </div>
      </motion.div>

      {/* Filter */}
      <motion.div variants={item} className="flex gap-2">
        {['all', 'beginner', 'intermediate', 'advanced'].map((diff) => (
          <button
            key={diff}
            onClick={() => setFilterDifficulty(diff)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filterDifficulty === diff
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            {diff === 'all' ? 'All' : diff.charAt(0).toUpperCase() + diff.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Trap List */}
      <motion.div variants={item} className="flex flex-col gap-3">
        {filteredTraps.map((trap) => (
          <motion.button
            key={trap.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTrap(trap)}
            className="w-full glass-card-hover p-4 flex items-center gap-3 text-left"
          >
            <div className="relative overflow-hidden rounded-lg flex-shrink-0" style={{ width: 64, height: 64 }}>
              <MiniChessboard fen={trap.fen} size={64} boardStyle={settings.boardStyle} pieceStyle={settings.pieceStyle} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getDifficultyBg(trap.difficulty)}`}>
                  {trap.difficulty}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-muted-foreground">
                  {trap.side === 'white' ? 'White' : 'Black'}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground truncate">{trap.name}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{trap.opening}</p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-medium">+{trap.xpReward}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  )
}

function TrapViewer({ trap, onBack }: { trap: Trap; onBack: () => void }) {
  const { addXP, incrementTrapsLearned } = useGame()
  const { settings } = useSettings()
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [boardFlipOverride, setBoardFlipOverride] = useState(false)
  const [showCoords, setShowCoords] = useState(true)

  const positions = useMemo(() => {
    const game = new Chess()
    const fens = [game.fen()]
    for (const move of trap.moves) {
      try {
        game.move(move)
        fens.push(game.fen())
      } catch {
        break
      }
    }
    return fens
  }, [trap.moves])

  const currentFen = positions[currentMoveIndex] || positions[0]

  const handleNext = useCallback(() => {
    if (currentMoveIndex < positions.length - 1) {
      setCurrentMoveIndex(prev => prev + 1)
      if (currentMoveIndex === positions.length - 2 && !isCompleted) {
        setIsCompleted(true)
        addXP(trap.xpReward)
        incrementTrapsLearned()
      }
    }
  }, [currentMoveIndex, positions.length, isCompleted, addXP, incrementTrapsLearned, trap.xpReward])

  const handlePrev = useCallback(() => {
    if (currentMoveIndex > 0) {
      setCurrentMoveIndex(prev => prev - 1)
    }
  }, [currentMoveIndex])

  const handleReset = useCallback(() => {
    setCurrentMoveIndex(0)
    setIsAutoPlaying(false)
  }, [])

  const handleAutoPlay = useCallback(() => {
    if (isAutoPlaying) {
      setIsAutoPlaying(false)
      return
    }
    setIsAutoPlaying(true)
    setCurrentMoveIndex(0)

    let idx = 0
    const interval = setInterval(() => {
      idx++
      if (idx >= positions.length) {
        clearInterval(interval)
        setIsAutoPlaying(false)
        return
      }
      setCurrentMoveIndex(idx)
      if (idx === positions.length - 1) {
        setIsCompleted(true)
        addXP(trap.xpReward)
        incrementTrapsLearned()
      }
    }, 1200)
  }, [isAutoPlaying, positions.length, addXP, incrementTrapsLearned, trap.xpReward])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === ' ' || e.key === 'Enter') {
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

  const boardSize = typeof window !== 'undefined' ? Math.min(360, window.innerWidth - 48) : 360

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-4 pb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getDifficultyBg(trap.difficulty)}`}>
              {trap.difficulty}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-secondary text-muted-foreground capitalize">
              {trap.side}
            </span>
          </div>
          <h1 className="text-lg font-display font-bold text-foreground truncate mt-0.5">{trap.name}</h1>
        </div>
      </div>

      {/* Board */}
      <div className="flex justify-center">
        <Chessboard
          fen={currentFen}
          size={boardSize}
          showCoordinates={showCoords}
          flipped={trap.side === 'black' !== boardFlipOverride}
          boardStyle={settings.boardStyle}
          pieceStyle={settings.pieceStyle}
        />
      </div>

      {/* Board controls */}
      <div className="flex items-center justify-center gap-2">
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
          Coords
        </button>
      </div>

      {/* Move controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleReset}
          disabled={currentMoveIndex === 0}
          className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center disabled:opacity-30 transition-opacity"
        >
          <RotateCcw className="w-4 h-4 text-foreground" />
        </button>
        <button
          onClick={handlePrev}
          disabled={currentMoveIndex === 0}
          className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center disabled:opacity-30 transition-opacity"
        >
          <SkipBack className="w-4 h-4 text-foreground" />
        </button>
        <button
          onClick={handleAutoPlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isAutoPlaying
              ? 'bg-accent text-accent-foreground'
              : 'bg-primary text-primary-foreground'
          }`}
        >
          <Play className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          disabled={currentMoveIndex >= positions.length - 1}
          className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center disabled:opacity-30 transition-opacity"
        >
          <SkipForward className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Keyboard shortcuts */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground/50">
        <span><kbd className="px-1 py-0.5 rounded bg-secondary text-[9px] font-mono">←→</kbd> Navigate</span>
        <span><kbd className="px-1 py-0.5 rounded bg-secondary text-[9px] font-mono">Space</kbd> Play</span>
        <span><kbd className="px-1 py-0.5 rounded bg-secondary text-[9px] font-mono">R</kbd> Reset</span>
      </div>

      {/* Move progress bar */}
      <div className="glass-card p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-muted-foreground font-medium">
            Move {currentMoveIndex}/{positions.length - 1}
          </p>
          {currentMoveIndex > 0 && (
            <p className="text-xs font-mono text-foreground">
              {Math.ceil(currentMoveIndex / 2)}.{currentMoveIndex % 2 === 1 ? '' : '..'}{trap.moves[currentMoveIndex - 1]}
            </p>
          )}
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${(currentMoveIndex / (positions.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {trap.moves.map((move, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentMoveIndex(idx + 1)}
              className={`px-1.5 py-0.5 rounded text-xs font-mono transition-colors ${
                currentMoveIndex === idx + 1
                  ? 'bg-primary text-primary-foreground'
                  : idx + 1 < currentMoveIndex
                    ? 'text-foreground'
                    : 'text-muted-foreground'
              }`}
            >
              {idx % 2 === 0 && <span className="text-muted-foreground mr-0.5">{Math.floor(idx / 2) + 1}.</span>}
              {move}
            </button>
          ))}
        </div>
        {/* Move annotation */}
        {trap.moveAnnotations && currentMoveIndex > 0 && trap.moveAnnotations[currentMoveIndex - 1] && (
          <div className="mt-3 pt-3 border-t border-border/30">
            <div className="flex items-start gap-2">
              <BookOpen className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-foreground/80 leading-relaxed">
                <span className="font-mono font-semibold text-primary mr-1">
                  {trap.moves[currentMoveIndex - 1]}
                </span>
                — {trap.moveAnnotations[currentMoveIndex - 1]}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Completion */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 justify-center"
          >
            <Check className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Trap Learned!</span>
            <span className="text-xs text-primary/70">+{trap.xpReward} XP</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Description */}
      <div className="glass-card p-4">
        <p className="text-sm text-foreground leading-relaxed">{trap.description}</p>
        <p className="text-xs text-muted-foreground mt-2">Opening: {trap.opening}</p>
      </div>

      {/* Explanation toggle */}
      <button
        onClick={() => setShowExplanation(!showExplanation)}
        className="glass-card-hover p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Step-by-Step Explanation</span>
        </div>
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
            <div className="flex flex-col gap-3">
              {trap.explanation.map((step, idx) => (
                <div key={idx} className="glass-card p-3 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-primary">{idx + 1}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

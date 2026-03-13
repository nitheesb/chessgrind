'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chess } from 'chess.js'
import { Chessboard, MiniChessboard } from '@/components/chess/chessboard'
import { OPENINGS } from '@/lib/chess-data'
import type { Opening } from '@/lib/chess-data'
import { useGame } from '@/lib/game-context'
import { useSettings } from '@/lib/settings-context'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import {
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  Star,
  Clock,
  Layers,
  Check,
  Lightbulb,
  Eye,
  EyeOff,
  FlipVertical,
  Zap,
} from 'lucide-react'

interface DesktopOpeningsProps {
  onNavigate: (page: string) => void
}

export function DesktopOpenings({ onNavigate }: DesktopOpeningsProps) {
  const { settings } = useSettings()
  const { playSound } = useSoundAndHaptics()
  const [activeOpening, setActiveOpening] = useState<Opening | null>(null)
  const [filterCategory, setFilterCategory] = useState<'all' | 'e4' | 'd4' | 'other'>('all')

  const filteredOpenings = useMemo(() => {
    if (filterCategory === 'all') return OPENINGS
    return OPENINGS.filter(o => o.category === filterCategory)
  }, [filterCategory])

  const groupedOpenings = useMemo(() => {
    const groups: Record<string, Opening[]> = {}
    filteredOpenings.forEach(opening => {
      const key = opening.difficulty
      if (!groups[key]) groups[key] = []
      groups[key].push(opening)
    })
    return groups
  }, [filteredOpenings])

  if (activeOpening) {
    return (
      <DesktopOpeningViewer
        opening={activeOpening}
        onBack={() => setActiveOpening(null)}
      />
    )
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar: category filter */}
      <div className="lm-sidebar border-r border-white/[0.06] p-5 space-y-2 bg-black/10">
        <h2 className="font-semibold mb-4" style={{ fontSize: 'var(--fs-md)' }}>Opening Library</h2>
        <p className="text-muted-foreground mb-6" style={{ fontSize: 'var(--fs-xs)' }}>
          {OPENINGS.length} curated lines
        </p>
        {(['all', 'e4', 'd4', 'other'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => {
              playSound('click')
              setFilterCategory(cat)
            }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              filterCategory === cat
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
            }`}
          >
            {cat === 'all' ? 'All Openings' : cat === 'e4' ? '1.e4 Openings' : cat === 'd4' ? '1.d4 Openings' : 'Other'}
          </button>
        ))}
      </div>

      {/* Right: opening groups by difficulty */}
      <div className="lm-right-panel p-5">
        {['beginner', 'intermediate', 'advanced'].map(difficulty => (
          groupedOpenings[difficulty] && (
            <div key={difficulty} className="mb-8">
              <h2 className="text-lg font-semibold text-foreground mb-4 capitalize flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                {difficulty} Openings
                <span className="text-sm font-normal text-muted-foreground">({groupedOpenings[difficulty].length})</span>
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedOpenings[difficulty].map((opening) => (
                  <button
                    key={opening.id}
                    onClick={() => {
                      playSound('click')
                      setActiveOpening(opening)
                    }}
                    className="glass-card-hover p-5 text-left group"
                  >
                    <div className="flex gap-4">
                      <div className="rounded-xl overflow-hidden shadow-md flex-shrink-0" style={{ width: 80, height: 80 }}>
                        <MiniChessboard fen={opening.fen} size={80} boardStyle={settings.boardStyle} pieceStyle={settings.pieceStyle} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                            {opening.eco}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-secondary text-muted-foreground">
                            {opening.category}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-foreground mb-1 truncate">{opening.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">{opening.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {opening.moves.length} moves
                      </span>
                      <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        Study <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  )
}

function DesktopOpeningViewer({ opening, onBack }: { opening: Opening; onBack: () => void }) {
  const { addXP, incrementOpeningsLearned } = useGame()
  const { settings } = useSettings()
  const { playSound } = useSoundAndHaptics()
  const [game, setGame] = useState(() => new Chess())
  const [moveIndex, setMoveIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [incorrectMove, setIncorrectMove] = useState(false)
  const [boardFlipped, setBoardFlipped] = useState(false)
  const [boardSize, setBoardSize] = useState(580)

  useEffect(() => {
    const update = () => {
      const val = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--lm-board-size'), 10)
      if (val > 0) setBoardSize(val)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(document.documentElement)
    return () => ro.disconnect()
  }, [])

  const isUserTurn = moveIndex % 2 === 0

  const expectedMove = useMemo(() => {
    if (moveIndex >= opening.moves.length) return null
    const tempGame = new Chess(game.fen())
    try {
      const move = tempGame.move(opening.moves[moveIndex])
      if (move) return { from: move.from, to: move.to }
    } catch { /* invalid */ }
    return null
  }, [game, moveIndex, opening.moves])

  // Auto-play opponent moves
  useEffect(() => {
    if (!isUserTurn && moveIndex < opening.moves.length && !isCompleted) {
      const timer = setTimeout(() => {
        const newGame = new Chess(game.fen())
        try {
          const move = newGame.move(opening.moves[moveIndex])
          if (move) {
            setLastMove({ from: move.from, to: move.to })
            setGame(newGame)
            setMoveIndex(moveIndex + 1)
            playSound('move')
          }
        } catch { /* invalid */ }
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [isUserTurn, moveIndex, opening.moves, game, isCompleted, playSound])

  // Check completion
  useEffect(() => {
    if (moveIndex >= opening.moves.length && !isCompleted) {
      setIsCompleted(true)
      playSound('success')
      addXP(15)
      incrementOpeningsLearned()
    }
  }, [moveIndex, opening.moves.length, isCompleted, addXP, incrementOpeningsLearned, playSound])

  const handleMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    if (!isUserTurn || moveIndex >= opening.moves.length) return false
    const expected = expectedMove
    if (!expected) return false

    if (from === expected.from && to === expected.to) {
      const newGame = new Chess(game.fen())
      try {
        const move = newGame.move({ from, to, promotion: promotion || 'q' })
        if (move) {
          setLastMove({ from, to })
          setGame(newGame)
          setMoveIndex(moveIndex + 1)
          setIncorrectMove(false)
          playSound(move.captured ? 'capture' : 'move')
          return true
        }
      } catch { return false }
    } else {
      setIncorrectMove(true)
      playSound('illegal')
      setTimeout(() => setIncorrectMove(false), 500)
    }
    return false
  }, [isUserTurn, moveIndex, opening.moves.length, expectedMove, game, playSound])

  const handleReset = useCallback(() => {
    playSound('click')
    setGame(new Chess())
    setMoveIndex(0)
    setLastMove(null)
    setIsCompleted(false)
    setIncorrectMove(false)
  }, [playSound])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') handleReset()
      else if (e.key === 'Escape') onBack()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleReset, onBack])

  const progress = (moveIndex / opening.moves.length) * 100

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: board + controls */}
      <div className="lm-board-panel flex items-center justify-center bg-black/20 border-r border-white/[0.06]">
        <div className="flex flex-col items-center gap-3 py-4 w-full px-5">
          {/* Progress Bar */}
          <div className="w-full">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{moveIndex} / {opening.moves.length} — {Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Status badge */}
          <div className="w-full text-center">
            <AnimatePresence mode="wait">
              {isCompleted ? (
                <motion.div
                  key="completed"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 text-amber-500"
                >
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">Opening complete! +15 XP</span>
                  <Zap className="w-4 h-4" />
                </motion.div>
              ) : isUserTurn ? (
                <motion.div
                  key="user-turn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary"
                >
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-sm font-medium">Your turn — play the next move</span>
                </motion.div>
              ) : (
                <motion.div
                  key="opponent-turn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-muted-foreground"
                >
                  <span className="text-sm">Opponent playing...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Board */}
          <div className={`lm-board-wrap lm-gpu ${incorrectMove ? 'animate-shake' : ''}`}>
            <Chessboard
              fen={game.fen()}
              interactive={isUserTurn && !isCompleted}
              onMove={handleMove}
              lastMove={lastMove || undefined}
              showHint={showHint && isUserTurn && expectedMove ? expectedMove : undefined}
              flipped={boardFlipped}
              size={boardSize}
              isCheck={game.isCheck()}
              boardStyle={settings.boardStyle}
              pieceStyle={settings.pieceStyle}
            />
          </div>

          {/* Controls: reset, hint, flip */}
          <div className="flex items-center justify-center gap-4">
            <motion.button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm font-medium">Reset</span>
            </motion.button>
            <motion.button
              onClick={() => { playSound('click'); setShowHint(!showHint) }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                showHint
                  ? 'bg-primary/10 text-primary'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {showHint ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="text-sm font-medium">{showHint ? 'Hint On' : 'Hint Off'}</span>
            </motion.button>
            <motion.button
              onClick={() => setBoardFlipped(!boardFlipped)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
            >
              <FlipVertical className="w-4 h-4" />
              <span className="text-sm font-medium">Flip</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Right: opening info + key ideas + move sequence */}
      <div className="lm-right-panel p-5 space-y-4">
        <button
          onClick={() => {
            playSound('click')
            onBack()
          }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to openings
        </button>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 rounded-lg text-sm font-semibold bg-primary/10 text-primary border border-primary/20">
              {opening.eco}
            </span>
            <span className="px-2 py-1 rounded-lg text-xs font-medium bg-secondary text-muted-foreground capitalize">
              {opening.difficulty}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{opening.name}</h2>
          <p className="text-muted-foreground">{opening.description}</p>
        </div>

        {/* Key Ideas */}
        {opening.keyIdeas && (
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" /> Key Ideas
            </h3>
            <ul className="space-y-2">
              {opening.keyIdeas.map((idea, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  {idea}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Move Sequence */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Move Sequence</h3>
          <div className="flex flex-wrap gap-1.5">
            {opening.moves.map((move, idx) => {
              const isWhite = idx % 2 === 0
              const isPlayed = idx < moveIndex
              const isCurrent = idx === moveIndex
              return (
                <span key={idx} className="flex items-center gap-0.5">
                  {isWhite && (
                    <span className="text-xs text-muted-foreground mr-0.5">{Math.floor(idx / 2) + 1}.</span>
                  )}
                  <span
                    className={`px-2 py-1 rounded-lg text-sm font-mono transition-all ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : isPlayed
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary text-muted-foreground/50'
                    }`}
                  >
                    {move}
                  </span>
                </span>
              )
            })}
          </div>
          {/* Move annotation */}
          {opening.moveAnnotations && moveIndex > 0 && opening.moveAnnotations[moveIndex - 1] && (
            <div className="mt-3 pt-3 border-t border-border/30">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-foreground/80 leading-relaxed">
                  <span className="font-mono font-semibold text-primary mr-1">
                    {opening.moves[moveIndex - 1]}
                  </span>
                  — {opening.moveAnnotations[moveIndex - 1]}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

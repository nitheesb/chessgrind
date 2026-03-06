'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chess } from 'chess.js'
import { Chessboard, MiniChessboard } from '@/components/chess/chessboard'
import { OPENINGS, getDifficultyBg } from '@/lib/chess-data'
import type { Opening } from '@/lib/chess-data'
import { useGame } from '@/lib/game-context'
import { useSettings } from '@/lib/settings-context'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import { staggerContainer, staggerItem } from '@/components/ui/animated-components'
import {
  ArrowLeft,
  ChevronRight,
  RotateCcw,
  Check,
  Zap,
  Star,
  Lightbulb,
  Eye,
  EyeOff,
  FlipVertical,
} from 'lucide-react'

interface OpeningsPageProps {
  onBack: () => void
}

export function OpeningsPage({ onBack }: OpeningsPageProps) {
  const { playSound } = useSoundAndHaptics()
  const { settings } = useSettings()
  const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null)
  const [filter, setFilter] = useState<'all' | 'e4' | 'd4' | 'other'>('all')

  const filteredOpenings = useMemo(() => {
    if (filter === 'all') return OPENINGS
    return OPENINGS.filter(o => o.category === filter)
  }, [filter])

  const handleSelect = (opening: Opening) => {
    playSound('click')
    setSelectedOpening(opening)
  }

  const handleFilterChange = (f: 'all' | 'e4' | 'd4' | 'other') => {
    playSound('click')
    setFilter(f)
  }

  if (selectedOpening) {
    return <OpeningPractice opening={selectedOpening} onBack={() => setSelectedOpening(null)} />
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 pb-8"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center active:bg-secondary/70"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground shimmer-text">Opening Explorer</h1>
          <p className="text-xs text-muted-foreground">{OPENINGS.length} openings to master</p>
        </div>
      </motion.div>

      {/* Filter tabs */}
      <motion.div variants={staggerItem} className="flex gap-2 relative">
        {(['all', 'e4', 'd4', 'other'] as const).map((f) => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className={`relative px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground active:bg-secondary/70'
            }`}
          >
            {f === 'all' ? 'All' : f === 'other' ? 'Flank' : `1.${f}`}
            {filter === f && (
              <motion.div
                layoutId="openings-filter-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              />
            )}
          </button>
        ))}
      </motion.div>

      {/* Openings list */}
      <motion.div variants={staggerItem} className="flex flex-col gap-2">
        {filteredOpenings.map((opening) => (
          <button
            key={opening.id}
            onClick={() => handleSelect(opening)}
            className="w-full bg-secondary rounded-xl p-3 flex items-center gap-3 text-left active:bg-secondary/70 hover-lift glow-card"
          >
            <div className="overflow-hidden rounded-lg flex-shrink-0" style={{ width: 56, height: 56 }}>
              <MiniChessboard fen={opening.fen} size={56} boardStyle={settings.boardStyle} pieceStyle={settings.pieceStyle} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-background text-muted-foreground">
                  {opening.eco}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getDifficultyBg(opening.difficulty)}`}>
                  {opening.difficulty}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground truncate">{opening.name}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{opening.description}</p>
              {/* Win rate bar */}
              <div className="mt-1.5 flex items-center gap-0.5 h-1.5 rounded-full overflow-hidden" title={`White ${opening.winRate.white}% | Draw ${opening.winRate.draw}% | Black ${opening.winRate.black}%`}>
                <div className="bg-white h-full rounded-l-full" style={{ width: `${opening.winRate.white}%` }} />
                <div className="bg-zinc-500 h-full" style={{ width: `${opening.winRate.draw}%` }} />
                <div className="bg-zinc-900 h-full rounded-r-full border border-white/10" style={{ width: `${opening.winRate.black}%` }} />
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[9px] text-white/70">W{opening.winRate.white}%</span>
                <span className="text-[9px] text-muted-foreground">D{opening.winRate.draw}%</span>
                <span className="text-[9px] text-white/40">B{opening.winRate.black}%</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </button>
        ))}
      </motion.div>
    </motion.div>
  )
}

function OpeningPractice({ opening, onBack }: { opening: Opening; onBack: () => void }) {
  const { addXP, incrementOpeningsLearned } = useGame()
  const { settings } = useSettings()
  const { playSound, triggerHaptic } = useSoundAndHaptics()
  const [game, setGame] = useState(() => new Chess())
  const [moveIndex, setMoveIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showHint, setShowHint] = useState(true)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [incorrectMove, setIncorrectMove] = useState(false)
  const [boardFlipped, setBoardFlipped] = useState(false)
  const [showCoords, setShowCoords] = useState(true)

  // Determine whose turn it is in the opening
  const isUserTurn = moveIndex % 2 === 0 // User plays white's moves

  // Get the expected move
  const expectedMove = useMemo(() => {
    if (moveIndex >= opening.moves.length) return null
    const tempGame = new Chess(game.fen())
    try {
      const move = tempGame.move(opening.moves[moveIndex])
      if (move) {
        return { from: move.from, to: move.to }
      }
    } catch {
      return null
    }
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
        } catch {
          // Invalid move
        }
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [isUserTurn, moveIndex, opening.moves, game, isCompleted, playSound])

  // Check completion
  useEffect(() => {
    if (moveIndex >= opening.moves.length && !isCompleted) {
      setIsCompleted(true)
      playSound('success')
      triggerHaptic('success')
      addXP(15)
      incrementOpeningsLearned()
    }
  }, [moveIndex, opening.moves.length, isCompleted, addXP, incrementOpeningsLearned, playSound, triggerHaptic])

  const handleMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    if (!isUserTurn || moveIndex >= opening.moves.length) return false

    const expected = expectedMove
    if (!expected) return false

    // Check if move matches expected
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
          triggerHaptic('light')
          return true
        }
      } catch {
        return false
      }
    } else {
      // Wrong move
      setIncorrectMove(true)
      playSound('illegal')
      triggerHaptic('error')
      setTimeout(() => setIncorrectMove(false), 500)
    }
    return false
  }, [isUserTurn, moveIndex, opening.moves.length, expectedMove, game, playSound, triggerHaptic])

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
      if (e.key === 'r' || e.key === 'R') {
        handleReset()
      } else if (e.key === 'Escape') {
        onBack()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleReset, onBack])

  const progress = (moveIndex / opening.moves.length) * 100

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center active:bg-secondary/70"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
            <span>Openings</span>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="truncate">{opening.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-secondary text-muted-foreground">
              {opening.eco}
            </span>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="flex justify-center">
        <div className={`transition-transform duration-100 ${incorrectMove ? 'animate-shake' : ''}`}>
          <Chessboard
            fen={game.fen()}
            size={Math.min(340, typeof window !== 'undefined' ? window.innerWidth - 48 : 340)}
            interactive={isUserTurn && !isCompleted}
            onMove={handleMove}
            lastMove={lastMove || undefined}
            showCoordinates={showCoords}
            showHint={showHint && isUserTurn && expectedMove ? expectedMove : undefined}
            isCheck={game.isCheck()}
            boardStyle={settings.boardStyle}
            pieceStyle={settings.pieceStyle}
            flipped={boardFlipped}
          />
        </div>
      </div>

      {/* Board controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setBoardFlipped(!boardFlipped)}
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

      {/* Status */}
      <div className="text-center">
        {isCompleted ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 text-green-500">
            <Check className="w-5 h-5" />
            <span className="font-semibold">Opening complete! +15 XP</span>
          </div>
        ) : isUserTurn ? (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary">
            <Lightbulb className="w-4 h-4" />
            <span className="text-sm font-medium">Your turn - play the next move</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-muted-foreground">
            <span className="text-sm">Opponent playing...</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="px-4">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>Move {moveIndex}/{opening.moves.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-foreground active:bg-secondary/70"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm font-medium">Reset</span>
        </button>
        <button
          onClick={() => { playSound('click'); setShowHint(!showHint); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${
            showHint 
              ? 'bg-primary/10 text-primary' 
              : 'bg-secondary text-muted-foreground'
          }`}
        >
          {showHint ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          <span className="text-sm font-medium">{showHint ? 'Hint On' : 'Hint Off'}</span>
        </button>
      </div>

      {/* Move list */}
      <div className="bg-secondary rounded-xl p-3">
        <p className="text-xs text-muted-foreground font-medium mb-2">Move sequence</p>
        <div className="flex flex-wrap gap-1">
          {opening.moves.map((move, idx) => {
            const moveNum = Math.floor(idx / 2) + 1
            const isWhite = idx % 2 === 0
            const isPlayed = idx < moveIndex
            const isCurrent = idx === moveIndex
            
            return (
              <span key={idx} className="flex items-center gap-0.5">
                {isWhite && (
                  <span className="text-[10px] text-muted-foreground mr-0.5">{moveNum}.</span>
                )}
                <span
                  className={`px-1.5 py-0.5 rounded text-xs font-mono ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : isPlayed
                        ? 'text-foreground'
                        : 'text-muted-foreground/50'
                  }`}
                >
                  {move}
                </span>
              </span>
            )
          })}
        </div>
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

      {/* Key Ideas */}
      <div className="bg-secondary rounded-xl p-3">
        <p className="text-xs text-muted-foreground font-medium mb-2">Key ideas</p>
        <ul className="space-y-1">
          {opening.keyIdeas.slice(0, 3).map((idea, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-foreground">
              <span className="text-primary">•</span>
              <span>{idea}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

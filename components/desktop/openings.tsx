'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chess } from 'chess.js'
import { Chessboard, MiniChessboard } from '@/components/chess/chessboard'
import { OPENINGS } from '@/lib/chess-data'
import type { Opening } from '@/lib/chess-data'
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
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const item = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] } },
}

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
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-8 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={item} className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Opening Library</h1>
        <p className="text-muted-foreground">Master the opening phase with {OPENINGS.length} curated lines</p>
      </motion.div>

      {/* Filter */}
      <motion.div variants={item} className="flex gap-2 mb-8">
        {(['all', 'e4', 'd4', 'other'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              playSound('click')
              setFilterCategory(cat)
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              filterCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            {cat === 'all' ? 'All Openings' : cat === 'e4' ? '1.e4 Openings' : cat === 'd4' ? '1.d4 Openings' : 'Other'}
          </button>
        ))}
      </motion.div>

      {/* Opening Grid by Difficulty */}
      {['beginner', 'intermediate', 'advanced'].map(difficulty => (
        groupedOpenings[difficulty] && (
          <motion.div key={difficulty} variants={item} className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 capitalize flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              {difficulty} Openings
              <span className="text-sm font-normal text-muted-foreground">({groupedOpenings[difficulty].length})</span>
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedOpenings[difficulty].map((opening) => (
                <motion.button
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
                </motion.button>
              ))}
            </div>
          </motion.div>
        )
      ))}
    </motion.div>
  )
}

function DesktopOpeningViewer({ opening, onBack }: { opening: Opening; onBack: () => void }) {
  const { settings } = useSettings()
  const { playSound } = useSoundAndHaptics()
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)

  const currentFen = useMemo(() => {
    if (currentMoveIndex < 0) return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    
    const game = new Chess()
    for (let i = 0; i <= currentMoveIndex && i < opening.moves.length; i++) {
      try {
        game.move(opening.moves[i])
      } catch { break }
    }
    return game.fen()
  }, [currentMoveIndex, opening.moves])

  // Determine board orientation based on first move or category
  const orientation = opening.category === 'e4' || opening.category === 'd4' || opening.category === 'other' ? 'white' : 'white'

  const handleNext = () => {
    if (currentMoveIndex < opening.moves.length - 1) {
      playSound('move')
      setCurrentMoveIndex(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentMoveIndex >= 0) {
      playSound('click')
      setCurrentMoveIndex(prev => prev - 1)
    }
  }

  const handleReset = () => {
    playSound('click')
    setCurrentMoveIndex(-1)
    setIsPlaying(false)
  }

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setCurrentMoveIndex(prev => {
        if (prev >= opening.moves.length - 1) {
          setIsPlaying(false)
          return prev
        }
        playSound('move')
        return prev + 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isPlaying, opening.moves.length, playSound])

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
            Back to openings
          </button>

          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 rounded-lg text-sm font-semibold bg-primary/10 text-primary border border-primary/20">
                {opening.eco}
              </span>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium bg-secondary text-muted-foreground capitalize`}>
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

          {/* Move List */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Move Sequence</h3>
            <div className="flex flex-wrap gap-2">
              {opening.moves.map((move, i) => (
                <button
                  key={i}
                  onClick={() => {
                    playSound('click')
                    setCurrentMoveIndex(i)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-all ${
                    i === currentMoveIndex
                      ? 'bg-primary text-primary-foreground'
                      : i < currentMoveIndex
                      ? 'bg-primary/10 text-primary'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                  }`}
                >
                  {i % 2 === 0 && <span className="text-xs opacity-60">{Math.floor(i/2) + 1}.</span>} {move}
                </button>
              ))}
            </div>
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
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Progress</span>
                <span>{currentMoveIndex + 1} / {opening.moves.length}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentMoveIndex + 1) / opening.moves.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Board */}
            <div className="flex justify-center mb-6">
              <Chessboard
                fen={currentFen}
                onMove={() => false}
                orientation={orientation}
                interactive={false}
                size={560}
                boardStyle={settings.boardStyle}
                pieceStyle={settings.pieceStyle}
              />
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
                onClick={() => {
                  playSound('click')
                  setIsPlaying(!isPlaying)
                }}
                className="p-4 rounded-xl bg-primary text-primary-foreground"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </motion.button>
              <motion.button
                onClick={handleNext}
                disabled={currentMoveIndex >= opening.moves.length - 1}
                className="p-3 rounded-xl bg-secondary text-muted-foreground hover:bg-secondary/80 disabled:opacity-50 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Current Move Display */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {currentMoveIndex < 0 ? 'Starting position' : (
                  <>
                    Move {currentMoveIndex + 1}: <span className="font-mono font-semibold text-foreground">{opening.moves[currentMoveIndex]}</span>
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

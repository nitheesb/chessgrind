'use client'

import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chess } from 'chess.js'
import { Chessboard, MiniChessboard } from '@/components/chess/chessboard'
import { OPENINGS, getDifficultyBg } from '@/lib/chess-data'
import type { Opening } from '@/lib/chess-data'
import { useGame } from '@/lib/game-context'
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Play,
  SkipBack,
  SkipForward,
  RotateCcw,
  Check,
  Zap,
  Star,
  Filter,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

interface OpeningsPageProps {
  onBack: () => void
}

export function OpeningsPage({ onBack }: OpeningsPageProps) {
  const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null)
  const [filter, setFilter] = useState<'all' | 'e4' | 'd4' | 'other'>('all')

  const filteredOpenings = useMemo(() => {
    if (filter === 'all') return OPENINGS
    return OPENINGS.filter(o => o.category === filter)
  }, [filter])

  if (selectedOpening) {
    return <OpeningDetail opening={selectedOpening} onBack={() => setSelectedOpening(null)} />
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
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Opening Explorer</h1>
          <p className="text-xs text-muted-foreground">{OPENINGS.length} openings to master</p>
        </div>
      </motion.div>

      {/* Filter tabs */}
      <motion.div variants={item} className="flex gap-2">
        {(['all', 'e4', 'd4', 'other'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === f
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {f === 'all' ? 'All' : f === 'other' ? 'Flank' : `1.${f}`}
          </button>
        ))}
      </motion.div>

      {/* Openings list */}
      <motion.div variants={item} className="flex flex-col gap-3">
        {filteredOpenings.map((opening) => (
          <motion.button
            key={opening.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedOpening(opening)}
            className="w-full glass-card-hover p-4 flex items-center gap-3 text-left"
          >
            <div className="relative overflow-hidden rounded-lg flex-shrink-0" style={{ width: 64, height: 64 }}>
              <MiniChessboard fen={opening.fen} size={64} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-secondary text-muted-foreground">
                  {opening.eco}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getDifficultyBg(opening.difficulty)}`}>
                  {opening.difficulty}
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground truncate">{opening.name}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{opening.description}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Star className="w-3 h-3" /> {opening.popularity}% popular
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {opening.variations.length} variations
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  )
}

function OpeningDetail({ opening, onBack }: { opening: Opening; onBack: () => void }) {
  const { addXP, incrementOpeningsLearned } = useGame()
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [activeTab, setActiveTab] = useState<'moves' | 'variations' | 'stats'>('moves')
  const [showNextMoveHint, setShowNextMoveHint] = useState(true)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)

  const positions = useMemo(() => {
    const game = new Chess()
    const fens = [game.fen()]
    const moves: { from: string; to: string }[] = []
    
    for (const move of opening.moves) {
      try {
        const moveResult = game.move(move)
        if (moveResult) {
          moves.push({ from: moveResult.from, to: moveResult.to })
        }
        fens.push(game.fen())
      } catch {
        break
      }
    }
    return { fens, moves }
  }, [opening.moves])

  const currentFen = positions.fens[currentMoveIndex] || positions.fens[0]
  
  // Get the next move to show as hint
  const nextMoveHint = useMemo(() => {
    if (currentMoveIndex >= positions.moves.length) return null
    return positions.moves[currentMoveIndex]
  }, [currentMoveIndex, positions.moves])

  const handleNext = useCallback(() => {
    if (currentMoveIndex < positions.fens.length - 1) {
      const newIndex = currentMoveIndex + 1
      setCurrentMoveIndex(newIndex)
      
      // Set the last move for highlighting
      if (currentMoveIndex < positions.moves.length) {
        setLastMove(positions.moves[currentMoveIndex])
      }
      
      if (newIndex === positions.fens.length - 1 && !isCompleted) {
        setIsCompleted(true)
        addXP(15)
        incrementOpeningsLearned()
      }
    }
  }, [currentMoveIndex, positions.fens.length, positions.moves, isCompleted, addXP, incrementOpeningsLearned])

  const handlePrev = useCallback(() => {
    if (currentMoveIndex > 0) {
      const newIndex = currentMoveIndex - 1
      setCurrentMoveIndex(newIndex)
      
      // Set the last move for highlighting (previous move)
      if (newIndex > 0) {
        setLastMove(positions.moves[newIndex - 1])
      } else {
        setLastMove(null)
      }
    }
  }, [currentMoveIndex, positions.moves])

  const handleReset = useCallback(() => {
    setCurrentMoveIndex(0)
    setLastMove(null)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-4 pb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-secondary text-muted-foreground">
              {opening.eco}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getDifficultyBg(opening.difficulty)}`}>
              {opening.difficulty}
            </span>
          </div>
          <h1 className="text-lg font-display font-bold text-foreground truncate mt-0.5">{opening.name}</h1>
        </div>
      </div>

      {/* Board */}
      <div className="flex justify-center">
        <Chessboard
          fen={currentFen}
          size={Math.min(360, typeof window !== 'undefined' ? window.innerWidth - 48 : 360)}
          showCoordinates
          lastMove={lastMove || undefined}
          hintArrow={nextMoveHint}
          showHintArrow={showNextMoveHint && !!nextMoveHint}
        />
      </div>

      {/* Hint toggle */}
      <div className="flex items-center justify-center">
        <button
          onClick={() => setShowNextMoveHint(!showNextMoveHint)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            showNextMoveHint 
              ? 'bg-primary/10 text-primary border border-primary/20' 
              : 'bg-secondary text-muted-foreground'
          }`}
        >
          <Play className="w-3 h-3" />
          {showNextMoveHint ? 'Hint On' : 'Show Next Move'}
        </button>
      </div>

      {/* Move controls */}
      <div className="flex items-center justify-center gap-3">
        <motion.button
          onClick={handleReset}
          disabled={currentMoveIndex === 0}
          className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center disabled:opacity-30 transition-opacity"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-4 h-4 text-foreground" />
        </motion.button>
        <motion.button
          onClick={handlePrev}
          disabled={currentMoveIndex === 0}
          className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center disabled:opacity-30 transition-opacity"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <SkipBack className="w-4 h-4 text-foreground" />
        </motion.button>
        <div className="px-4 py-2 rounded-lg bg-secondary text-sm font-mono text-foreground min-w-[120px] text-center">
          {currentMoveIndex === 0
            ? 'Start position'
            : `${Math.ceil(currentMoveIndex / 2)}. ${currentMoveIndex % 2 === 1 ? '' : '...'}${opening.moves[currentMoveIndex - 1]}`
          }
        </div>
        <motion.button
          onClick={handleNext}
          disabled={currentMoveIndex >= positions.fens.length - 1}
          className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center disabled:opacity-30 transition-opacity"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <SkipForward className="w-4 h-4 text-primary-foreground" />
        </motion.button>
      </div>

      {/* Move progress bar */}
      <div className="px-4">
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentMoveIndex / (positions.fens.length - 1)) * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">Start</span>
          <span className="text-[10px] text-muted-foreground">{currentMoveIndex}/{positions.fens.length - 1} moves</span>
        </div>
      </div>

      {/* Completion Badge */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 mx-auto"
          >
            <Check className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Opening Learned!</span>
            <span className="text-xs text-primary/70">+15 XP</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move list */}
      <div className="glass-card p-3">
        <p className="text-xs text-muted-foreground font-medium mb-2">Moves</p>
        <div className="flex flex-wrap gap-1">
          {opening.moves.map((move, idx) => {
            const moveNum = Math.floor(idx / 2) + 1
            const isWhite = idx % 2 === 0
            const isCurrentMove = currentMoveIndex === idx + 1
            const isPastMove = currentMoveIndex > idx + 1
            
            return (
              <span key={idx} className="flex items-center gap-0.5">
                {isWhite && (
                  <span className="text-[10px] text-muted-foreground mr-0.5">{moveNum}.</span>
                )}
                <motion.button
                  onClick={() => {
                    setCurrentMoveIndex(idx + 1)
                    if (idx > 0) {
                      setLastMove(positions.moves[idx - 1])
                    }
                  }}
                  className={`px-1.5 py-0.5 rounded text-xs font-mono transition-colors ${
                    isCurrentMove
                      ? 'bg-primary text-primary-foreground'
                      : isPastMove
                        ? 'text-foreground/70 hover:bg-secondary'
                        : 'text-muted-foreground hover:bg-secondary'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {move}
                </motion.button>
              </span>
            )
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-lg p-1">
        {(['moves', 'variations', 'stats'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all capitalize ${
              activeTab === tab
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'moves' && (
          <motion.div
            key="moves"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="glass-card p-4">
              <p className="text-sm text-foreground leading-relaxed">{opening.description}</p>
            </div>
            <div className="glass-card p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Key Ideas</h3>
              <div className="flex flex-col gap-2">
                {opening.keyIdeas.map((idea, idx) => (
                  <motion.div 
                    key={idx} 
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-primary">{idx + 1}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{idea}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'variations' && (
          <motion.div
            key="variations"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            {opening.variations.map((variation, idx) => (
              <motion.div 
                key={idx} 
                className="glass-card p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <h3 className="text-sm font-semibold text-foreground mb-1">{variation.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{variation.description}</p>
                <div className="flex flex-wrap gap-1">
                  {variation.moves.map((move, mIdx) => (
                    <span key={mIdx} className="flex items-center gap-0.5">
                      {mIdx % 2 === 0 && (
                        <span className="text-[10px] text-muted-foreground">{Math.floor(mIdx / 2) + 1}.</span>
                      )}
                      <span className="text-xs font-mono text-foreground">{move}</span>
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card p-4 flex flex-col gap-4"
          >
            <div>
              <p className="text-xs text-muted-foreground mb-2">Win Rate Distribution</p>
              <div className="flex h-4 rounded-full overflow-hidden">
                <motion.div
                  className="bg-foreground/90"
                  initial={{ width: 0 }}
                  animate={{ width: `${opening.winRate.white}%` }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                />
                <motion.div
                  className="bg-muted-foreground/50"
                  initial={{ width: 0 }}
                  animate={{ width: `${opening.winRate.draw}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
                <motion.div
                  className="bg-muted-foreground/20"
                  initial={{ width: 0 }}
                  animate={{ width: `${opening.winRate.black}%` }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                />
              </div>
              <div className="flex justify-between mt-2 text-[10px]">
                <span className="text-foreground">White {opening.winRate.white}%</span>
                <span className="text-muted-foreground">Draw {opening.winRate.draw}%</span>
                <span className="text-muted-foreground/70">Black {opening.winRate.black}%</span>
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <div>
                <p className="text-muted-foreground">Popularity</p>
                <p className="font-bold text-foreground">{opening.popularity}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-bold text-foreground">1.{opening.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Variations</p>
                <p className="font-bold text-foreground">{opening.variations.length}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chess } from 'chess.js'
import { Chessboard } from '@/components/chess/chessboard'
import { PUZZLES, getDifficultyBg } from '@/lib/chess-data'
import type { Puzzle } from '@/lib/chess-data'
import { useGame } from '@/lib/game-context'
import { useSettings } from '@/lib/settings-context'
import { AnimatedCounter, staggerContainer, staggerItem } from '@/components/ui/animated-components'
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
  FlipVertical,
} from 'lucide-react'

interface PuzzlesPageProps {
  onBack: () => void
}

export function PuzzlesPage({ onBack }: PuzzlesPageProps) {
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null)
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [filterTheme, setFilterTheme] = useState<string>('all')

  const filteredPuzzles = useMemo(() => {
    let result = PUZZLES
    if (filterDifficulty !== 'all') result = result.filter(p => p.difficulty === filterDifficulty)
    if (filterTheme !== 'all') result = result.filter(p => p.themes.some(t => t.toLowerCase().includes(filterTheme.toLowerCase())))
    return result
  }, [filterDifficulty, filterTheme])

  const uniqueThemes = useMemo(() => {
    const themes = new Set<string>()
    PUZZLES.forEach(p => p.themes.forEach(t => themes.add(t)))
    return Array.from(themes).sort()
  }, [])

  if (activePuzzle) {
    return (
      <PuzzleSolver 
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
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 pb-8"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground shimmer-text">Puzzle Rush</h1>
          <p className="text-xs text-muted-foreground">{PUZZLES.length} puzzles to solve</p>
        </div>
      </motion.div>

      {/* Puzzle stats */}
      <motion.div variants={staggerItem} className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 text-center">
          <PuzzleIcon className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground"><AnimatedCounter value={PUZZLES.length} /></p>
          <p className="text-[10px] text-muted-foreground">Total</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Star className="w-4 h-4 text-accent mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground"><AnimatedCounter value={0} /></p>
          <p className="text-[10px] text-muted-foreground">Solved</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Trophy className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-foreground"><AnimatedCounter value={0} suffix="%" /></p>
          <p className="text-[10px] text-muted-foreground">Accuracy</p>
        </div>
      </motion.div>

      {/* Filter */}
      <motion.div variants={staggerItem} className="flex gap-2 overflow-x-auto pb-1">
        {['all', 'easy', 'medium', 'hard', 'expert'].map((diff) => (
          <motion.button
            key={diff}
            onClick={() => setFilterDifficulty(diff)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterDifficulty === diff
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            {diff === 'all' ? 'All' : diff.charAt(0).toUpperCase() + diff.slice(1)}
          </motion.button>
        ))}
      </motion.div>

      {/* Theme filter */}
      <motion.div variants={staggerItem} className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterTheme('all')}
          className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all border ${
            filterTheme === 'all'
              ? 'bg-accent/10 text-accent border-accent/30'
              : 'bg-secondary/50 text-muted-foreground border-transparent'
          }`}
        >
          All Themes
        </button>
        {uniqueThemes.map((theme) => (
          <button
            key={theme}
            onClick={() => setFilterTheme(filterTheme === theme ? 'all' : theme)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all border capitalize ${
              filterTheme === theme
                ? 'bg-accent/10 text-accent border-accent/30'
                : 'bg-secondary/50 text-muted-foreground border-transparent'
            }`}
          >
            {theme}
          </button>
        ))}
      </motion.div>

      {/* Puzzle List */}
      <motion.div variants={staggerItem} className="flex flex-col gap-3">
        {filteredPuzzles.map((puzzle, idx) => (
          <motion.button
            key={puzzle.id}
            onClick={() => setActivePuzzle(puzzle)}
            className="w-full glass-card-hover glow-card p-4 flex items-center gap-3 text-left"
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
  const { addXP, incrementPuzzlesSolved, trackPuzzleFailure, incrementCombo, resetCombo, recordPerfectSolve, profile } = useGame()
  const { settings } = useSettings()
  const [game, setGame] = useState(() => new Chess(puzzle.fen))
  const [moveIndex, setMoveIndex] = useState(0)
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong' | 'complete' | 'opponent-moving'>('playing')
  const [timer, setTimer] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [highlightSquares, setHighlightSquares] = useState<string[]>([])
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [hintArrow, setHintArrow] = useState<{ from: string; to: string } | null>(null)
  const [hintActive, setHintActive] = useState(false)
  const processingRef = useRef(false)
  const hintActiveRef = useRef(false)
  const hadWrongMoveRef = useRef(false)
  const [boardFlipped, setBoardFlipped] = useState(false)
  const [showCoords, setShowCoords] = useState(true)
  const [earnedXP, setEarnedXP] = useState(0)

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
      const legalMoves = currentGame.moves({ verbose: true })
      const hintMove = legalMoves.find(m => m.san === expectedMove)
      if (hintMove) {
        return { from: hintMove.from, to: hintMove.to }
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
    
    if (isPerfect) {
      recordPerfectSolve()
    }
  }, [puzzle.xpReward, addXP, incrementPuzzlesSolved, incrementCombo, recordPerfectSolve])

  // Play opponent's move automatically
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
          const nextIndex = currentMoveIndex + 1
          setMoveIndex(nextIndex)
          
          if (nextIndex >= puzzle.moves.length) {
            completePuzzle()
          } else {
            setStatus('playing')
            if (hintActiveRef.current) {
              const newHint = calculateHint(opponentGame, nextIndex)
              setHintArrow(newHint)
              if (newHint) {
                setHighlightSquares([newHint.from, newHint.to])
              }
            }
          }
        } else {
          console.error('Failed to play opponent move:', opponentMoveStr)
          setStatus('playing')
        }
      } catch (error) {
        console.error('Error playing opponent move:', error)
        setStatus('playing')
      }
      processingRef.current = false
    }, 600)
  }, [puzzle.moves, completePuzzle, calculateHint])

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
        setHighlightSquares([])
        
        const nextMoveIndex = moveIndex + 1

        if (nextMoveIndex >= puzzle.moves.length) {
          setMoveIndex(nextMoveIndex)
          completePuzzle()
          processingRef.current = false
        } else {
          setStatus('correct')
          setMoveIndex(nextMoveIndex)
          setTimeout(() => {
            playOpponentMove(gameCopy, nextMoveIndex)
          }, 400)
        }
        return true
      } else {
        setStatus('wrong')
        hadWrongMoveRef.current = true
        resetCombo()
        trackPuzzleFailure(puzzle.themes)
        processingRef.current = false
        setTimeout(() => setStatus('playing'), 1500)
        return false
      }
    } catch {
      processingRef.current = false
      return false
    }
  }, [game, moveIndex, puzzle, status, completePuzzle, playOpponentMove, resetCombo, trackPuzzleFailure])

  const handleHint = useCallback(() => {
    const hint = calculateHint(game, moveIndex)
    if (hint) {
      setHintArrow(hint)
      setHighlightSquares([hint.from, hint.to])
      setHintActive(true)
      hintActiveRef.current = true
    }
  }, [game, moveIndex, calculateHint])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        if (status === 'playing' && !hintActive) {
          handleHint()
        }
      } else if (e.key === 'n' || e.key === 'N') {
        if (status === 'complete') {
          onNext()
        }
      } else if (e.key === 'Escape') {
        onBack()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [status, hintActive, handleHint, onNext, onBack])

  const isWhiteToMove = game.turn() === 'w'
  const canInteract = status === 'playing'

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
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
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
      <motion.div 
        className="flex items-center justify-center gap-2"
        animate={{ 
          opacity: status === 'opponent-moving' ? 0.6 : 1,
        }}
      >
        <motion.div 
          className={`w-3 h-3 rounded-full ${isWhiteToMove ? 'bg-white border border-gray-300' : 'bg-gray-800'}`}
          animate={status === 'opponent-moving' ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 0.8 }}
        />
        <span className="text-sm font-medium text-muted-foreground">
          {status === 'complete' 
            ? 'Puzzle Complete!' 
            : status === 'opponent-moving'
              ? 'Opponent moving...'
              : `${isWhiteToMove ? 'White' : 'Black'} to move`
          }
        </span>
      </motion.div>

      {/* Board */}
      <div className="flex justify-center">
        <div className={`gradient-border-card ${canInteract ? 'breathing-glow' : ''}`}>
          <Chessboard
            fen={game.fen()}
            size={Math.min(360, typeof window !== 'undefined' ? window.innerWidth - 48 : 360)}
            interactive={canInteract}
            onMove={handleMove}
            highlightSquares={highlightSquares}
            lastMove={lastMove || undefined}
            showCoordinates={showCoords}
            hintArrow={hintArrow}
            showHintArrow={!!hintArrow}
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

      {/* Status feedback */}
      <AnimatePresence mode="wait">
        {status === 'correct' && (
          <motion.div
            key="correct"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center justify-center gap-2 py-2"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.3 }}
            >
              <Check className="w-5 h-5 text-primary" />
            </motion.div>
            <span className="text-sm font-semibold text-primary">Correct! Keep going...</span>
          </motion.div>
        )}
        {status === 'wrong' && (
          <motion.div
            key="wrong"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, x: [0, -5, 5, -5, 5, 0] }}
            exit={{ opacity: 0 }}
            transition={{ x: { duration: 0.4 } }}
            className="flex items-center justify-center gap-2 py-2"
          >
            <X className="w-5 h-5 text-destructive" />
            <span className="text-sm font-semibold text-destructive">Wrong move. Try again!</span>
          </motion.div>
        )}
        {status === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="glass-card p-5 flex flex-col items-center gap-3 glow-primary"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center"
            >
              <Trophy className="w-8 h-8 text-primary" />
            </motion.div>
            <div className="text-center">
              <p className="text-lg font-display font-bold text-foreground">Puzzle Solved!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Solved in {formatTime(timer)}
              </p>
              <motion.div 
                className="flex items-center justify-center gap-1 mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">+{earnedXP || puzzle.xpReward} XP</span>
                {earnedXP > puzzle.xpReward && (
                  <span className="text-[10px] font-bold text-orange-400 ml-1">🔥 Bonus!</span>
                )}
              </motion.div>
            </div>
            <motion.button
              onClick={onNext}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm"
            >
              Next Puzzle <SkipForward className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
        {(status === 'playing' || status === 'opponent-moving') && status !== 'complete' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center"
          >
            <motion.button
              onClick={handleHint}
              disabled={hintActive || status === 'opponent-moving'}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm font-medium disabled:opacity-40 transition-all"
            >
              <Lightbulb className="w-4 h-4" />
              {hintActive ? 'Hint Active' : 'Show Hint'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcuts hint */}
      <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground/50">
        <span><kbd className="px-1 py-0.5 rounded bg-secondary text-[9px] font-mono">H</kbd> Hint</span>
        <span><kbd className="px-1 py-0.5 rounded bg-secondary text-[9px] font-mono">N</kbd> Next</span>
        <span><kbd className="px-1 py-0.5 rounded bg-secondary text-[9px] font-mono">Esc</kbd> Back</span>
      </div>

      {/* Move progress indicator */}
      <div className="flex items-center justify-center gap-1">
        {puzzle.moves.map((_, idx) => (
          <motion.div
            key={idx}
            className={`h-1.5 rounded-full transition-all ${
              idx < moveIndex 
                ? 'bg-primary w-4' 
                : idx === moveIndex 
                  ? 'bg-primary/50 w-3' 
                  : 'bg-secondary w-2'
            }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: idx * 0.05 }}
          />
        ))}
      </div>

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

'use client'

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chess } from 'chess.js'
import { Chessboard } from '@/components/chess/chessboard'
import { EvalBar } from '@/components/chess/eval-bar'
import { PUZZLES, getDifficultyBg } from '@/lib/chess-data'
import type { Puzzle } from '@/lib/chess-data'
import { useGame } from '@/lib/game-context'
import { useSettings } from '@/lib/settings-context'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import { ShareButtons } from '@/components/ui/share-buttons'
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
  RefreshCw,
  Volume2,
  VolumeX,
  Minus,
  Plus,
  Flame,
  Target,
} from 'lucide-react'

interface PuzzlesPageProps {
  onBack: () => void
}

export function PuzzlesPage({ onBack }: PuzzlesPageProps) {
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null)
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [filterTheme, setFilterTheme] = useState<string>('all')
  const [rushMinutes, setRushMinutes] = useState<3 | 5 | null>(null)
  const [visibleCount, setVisibleCount] = useState(20)

  const filteredPuzzles = useMemo(() => {
    let result = PUZZLES
    if (filterDifficulty !== 'all') result = result.filter(p => p.difficulty === filterDifficulty)
    if (filterTheme !== 'all') result = result.filter(p => p.themes.some(t => t.toLowerCase().includes(filterTheme.toLowerCase())))
    return result
  }, [filterDifficulty, filterTheme])

  const visiblePuzzles = useMemo(() => filteredPuzzles.slice(0, visibleCount), [filteredPuzzles, visibleCount])

  // Reset pagination when filters change
  useEffect(() => { setVisibleCount(20) }, [filterDifficulty, filterTheme])

  const uniqueThemes = useMemo(() => {
    const themes = new Set<string>()
    PUZZLES.forEach(p => p.themes.forEach(t => themes.add(t)))
    return Array.from(themes).sort()
  }, [])

  if (rushMinutes) {
    return <PuzzleRushMode minutes={rushMinutes} onBack={() => setRushMinutes(null)} />
  }

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
          <h1 className="text-xl font-display font-bold text-foreground shimmer-text">Puzzles</h1>
          <p className="text-xs text-muted-foreground">{PUZZLES.length} puzzles to solve</p>
        </div>
      </motion.div>

      {/* Puzzle Rush buttons (Feature 3) */}
      <motion.div variants={staggerItem} className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-orange-400" />
          <h2 className="text-sm font-semibold text-foreground">Puzzle Rush</h2>
          <span className="text-[10px] text-muted-foreground">Solve as many as you can!</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setRushMinutes(3)}
            className="flex-1 py-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 font-semibold text-sm hover:bg-orange-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Timer className="w-4 h-4" />
            3 min Rush
          </button>
          <button
            onClick={() => setRushMinutes(5)}
            className="flex-1 py-3 rounded-xl bg-primary/10 border border-primary/30 text-primary font-semibold text-sm hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
          >
            <Timer className="w-4 h-4" />
            5 min Rush
          </button>
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
        {visiblePuzzles.map((puzzle, idx) => (
          <motion.button
            key={puzzle.id}
            onClick={() => setActivePuzzle(puzzle)}
            className="w-full glass-card-hover glow-card p-4 flex items-center gap-3 text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
              #{PUZZLES.indexOf(puzzle) + 1}
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
        {visibleCount < filteredPuzzles.length && (
          <button
            onClick={() => setVisibleCount(c => c + 20)}
            className="w-full py-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Show more ({filteredPuzzles.length - visibleCount} remaining)
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}

function PuzzleSolver({ puzzle, onBack, onNext }: { puzzle: Puzzle; onBack: () => void; onNext: () => void }) {
  const { addXP, incrementPuzzlesSolved, updatePuzzleRating, trackPuzzleFailure, incrementCombo, resetCombo, recordPerfectSolve, profile } = useGame()
  const { settings, updateSetting } = useSettings()
  const { playSound, triggerHaptic, setSoundEnabled } = useSoundAndHaptics()
  // Sync sound toggle from settings into hook instance
  useEffect(() => { setSoundEnabled(settings.soundEnabled) }, [settings.soundEnabled, setSoundEnabled])
  const [game, setGame] = useState(() => new Chess(puzzle.fen))
  const [moveIndex, setMoveIndex] = useState(0)
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong' | 'complete' | 'opponent-moving'>('playing')
  const [timer, setTimer] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [highlightSquares, setHighlightSquares] = useState<string[]>([])
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [hintArrow, setHintArrow] = useState<{ from: string; to: string } | null>(null)
  // Feature 4: multi-level hints (0=none, 1=piece, 2=target, 3=full arrow)
  const [hintLevel, setHintLevel] = useState(0)
  const hintLevelRef = useRef(0)
  const processingRef = useRef(false)
  const hadWrongMoveRef = useRef(false)
  const [wrongMoveHint, setWrongMoveHint] = useState<string | null>(null)
  const [boardFlipped, setBoardFlipped] = useState(() => puzzle.fen.split(' ')[1] === 'b')
  const [showCoords, setShowCoords] = useState(true)
  const [earnedXP, setEarnedXP] = useState(0)
  // Feature 5: board size
  const [boardSize, setBoardSize] = useState(() => {
    if (typeof window === 'undefined') return 360
    const stored = localStorage.getItem('chessvault_board_size')
    if (stored) return Math.min(Math.max(parseInt(stored), 280), 600)
    return Math.min(480, window.innerWidth - 48)
  })
  const updateBoardSize = (delta: number) => {
    setBoardSize(prev => {
      const maxSize = typeof window !== 'undefined' ? Math.min(600, window.innerWidth - 48) : 600
      const next = Math.min(Math.max(prev + delta, 280), maxSize)
      localStorage.setItem('chessvault_board_size', String(next))
      return next
    })
  }

  // Keyboard move input
  const [keyboardInput, setKeyboardInput] = useState('')
  const [keyboardError, setKeyboardError] = useState(false)

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
    playSound('success')
    triggerHaptic('success')
    
    const comboMultiplier = incrementCombo()
    const isPerfect = !hadWrongMoveRef.current
    const perfectBonus = isPerfect ? 1.5 : 1
    const totalXP = Math.round(puzzle.xpReward * comboMultiplier * perfectBonus)
    
    setEarnedXP(totalXP)
    // Delay XP popup slightly so combo overlay appears first
    setTimeout(() => addXP(totalXP), 300)
    incrementPuzzlesSolved()
    updatePuzzleRating(puzzle.rating, true, timer)
    
    if (isPerfect) {
      recordPerfectSolve()
    }
  }, [puzzle.xpReward, puzzle.rating, timer, addXP, incrementPuzzlesSolved, updatePuzzleRating, incrementCombo, recordPerfectSolve, playSound, triggerHaptic])

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
            // Maintain hint level if active
            if (hintLevelRef.current >= 2) {
              const newHint = calculateHint(opponentGame, nextIndex)
              if (newHint) {
                setHintArrow(newHint)
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
        playSound('move')
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
        setHintArrow(null)
        setWrongMoveHint(expectedMove)
        playSound('fail')
        triggerHaptic('error')
        resetCombo()
        trackPuzzleFailure(puzzle.themes)
        processingRef.current = false
        setTimeout(() => { setStatus('playing'); setWrongMoveHint(null) }, 2000)
        return false
      }
    } catch {
      processingRef.current = false
      return false
    }
  }, [game, moveIndex, puzzle, status, completePuzzle, playOpponentMove, resetCombo, trackPuzzleFailure, playSound, triggerHaptic])

  // Feature 4: multi-level hint handler
  const handleHint = useCallback(() => {
    if (hintLevel >= 3) return
    const nextLevel = hintLevel + 1
    setHintLevel(nextLevel)
    hintLevelRef.current = nextLevel
    const hint = calculateHint(game, moveIndex)
    if (!hint) return

    if (nextLevel === 1) {
      // Level 1: highlight source piece only
      setHighlightSquares([hint.from])
      setHintArrow(null)
    } else if (nextLevel === 2) {
      // Level 2: highlight both squares
      setHighlightSquares([hint.from, hint.to])
      setHintArrow(null)
    } else {
      // Level 3: full arrow
      setHintArrow(hint)
      setHighlightSquares([hint.from, hint.to])
    }
  }, [game, moveIndex, calculateHint, hintLevel])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleRetry = useCallback(() => {
    setGame(new Chess(puzzle.fen))
    setMoveIndex(0)
    setStatus('playing')
    setLastMove(null)
    setHintArrow(null)
    setHighlightSquares([])
    setWrongMoveHint(null)
    setHintLevel(0)
    hintLevelRef.current = 0
    hadWrongMoveRef.current = false
    processingRef.current = false
    setTimer(0)
  }, [puzzle.fen])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        if (status === 'playing' && hintLevel < 3) {
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
  }, [status, hintLevel, handleHint, onNext, onBack])

  const isWhiteToMove = game.turn() === 'w'
  const canInteract = status === 'playing'

  const hintButtonLabel =
    hintLevel === 0 ? 'Hint: Piece' :
    hintLevel === 1 ? 'Hint: Target' :
    hintLevel === 2 ? 'Hint: Full' : 'Active'
  // XP cost: 5 per level
  const hintXPCost = hintLevel * 5

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
          {/* Sound toggle (Feature 8) */}
          <button
            onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
            className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"
            title={settings.soundEnabled ? 'Mute' : 'Unmute'}
          >
            {settings.soundEnabled
              ? <Volume2 className="w-3.5 h-3.5 text-foreground" />
              : <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
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

      {/* Board + Eval Bar (Feature 1 & 5) */}
      <div className="flex justify-center">
        <div className="flex items-stretch gap-2">
          <EvalBar game={game} size={boardSize} thickness={20} vertical />
          <div className={`gradient-border-card ${canInteract ? 'breathing-glow' : ''}`}>
            <Chessboard
              fen={game.fen()}
              size={boardSize}
              interactive={canInteract}
              onMove={handleMove}
              highlightSquares={highlightSquares}
              lastMove={lastMove || undefined}
              showCoordinates={showCoords}
              hintArrow={hintArrow}
              showHintArrow={!!hintArrow}
              isCheck={game.isCheck()}
              boardStyle={settings.boardStyle}
              pieceStyle={settings.pieceStyle}
              flipped={boardFlipped}
            />
          </div>
        </div>
      </div>

      {/* Board controls (Feature 5 + 8) */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
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
        {/* Board size controls */}
        <button onClick={() => updateBoardSize(-20)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
          <Minus className="w-3 h-3 text-muted-foreground" />
        </button>
        <span className="text-[10px] text-muted-foreground font-mono">{boardSize}px</span>
        <button onClick={() => updateBoardSize(20)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
          <Plus className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>

      {/* Keyboard move input */}
      {status === 'playing' && (
        <div className="flex items-center gap-2 px-1">
          <input
            type="text"
            value={keyboardInput}
            onChange={e => setKeyboardInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                const input = keyboardInput.trim()
                if (!input) return
                let success = false
                try {
                  const gameCopy = new Chess(game.fen())
                  const move = gameCopy.move(input)
                  if (move) {
                    success = handleMove(move.from, move.to, move.promotion)
                  }
                } catch {
                  if (input.length >= 4) {
                    const from = input.slice(0, 2)
                    const to = input.slice(2, 4)
                    const promotion = input.length > 4 ? input[4] : undefined
                    success = handleMove(from, to, promotion)
                  }
                }
                if (success) {
                  setKeyboardInput('')
                  setKeyboardError(false)
                } else {
                  setKeyboardError(true)
                  setTimeout(() => setKeyboardError(false), 1500)
                }
              }
            }}
            placeholder="Type move (e.g. e2e4, Nf3)"
            className={`flex-1 px-3 py-1.5 rounded-lg bg-secondary text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 transition-all ${
              keyboardError ? 'ring-1 ring-destructive animate-shake' : 'ring-primary/30 focus:ring-primary'
            }`}
          />
        </div>
      )}

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
            className="flex flex-col items-center gap-2 py-2"
          >
            <div className="flex items-center gap-2">
              <X className="w-5 h-5 text-destructive" />
              <span className="text-sm font-semibold text-destructive">Wrong move. Try again!</span>
            </div>
            {wrongMoveHint && (
              <span className="text-xs text-muted-foreground">Expected: <strong>{wrongMoveHint}</strong></span>
            )}
            <button
              onClick={handleRetry}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-secondary text-xs font-medium text-foreground"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
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
                {hintXPCost > 0 && (
                  <span className="text-[10px] text-muted-foreground ml-1">(-{hintXPCost} hints)</span>
                )}
              </motion.div>
            </div>
            <motion.button
              onClick={onNext}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm"
            >
              Next Puzzle <SkipForward className="w-4 h-4" />
            </motion.button>
            <ShareButtons
              compact
              title={`I solved "${puzzle.title}" on ChessVault!`}
              text={`🧩 I just solved "${puzzle.title}" (${puzzle.difficulty}) and earned ${earnedXP || puzzle.xpReward} XP on ChessVault!`}
            />
          </motion.div>
        )}
        {(status === 'playing' || status === 'opponent-moving') && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-2"
          >
            {/* Feature 4: Multi-level hint button */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={handleHint}
                disabled={hintLevel >= 3 || status === 'opponent-moving'}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 border border-accent/20 text-accent text-sm font-medium disabled:opacity-40 transition-all"
              >
                <Lightbulb className="w-4 h-4" />
                {hintButtonLabel}
              </motion.button>
            </div>
            {/* Hint level dots */}
            {hintLevel > 0 && (
              <div className="flex items-center gap-1">
                {[1, 2, 3].map(l => (
                  <div
                    key={l}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${l <= hintLevel ? 'bg-accent' : 'bg-secondary'}`}
                  />
                ))}
                <span className="text-[10px] text-muted-foreground ml-1">-{hintLevel * 5} XP</span>
              </div>
            )}
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

// Feature 3: Puzzle Rush Mode
function PuzzleRushMode({ minutes, onBack }: { minutes: 3 | 5; onBack: () => void }) {
  const { addXP } = useGame()
  const { settings } = useSettings()
  const { playSound, triggerHaptic, setSoundEnabled } = useSoundAndHaptics()
  // Sync sound toggle from settings into hook instance
  useEffect(() => { setSoundEnabled(settings.soundEnabled) }, [settings.soundEnabled, setSoundEnabled])

  // Shuffle puzzles for rush mode
  const shuffled = useMemo(() => [...PUZZLES].sort(() => Math.random() - 0.5), [])
  const [puzzleIdx, setPuzzleIdx] = useState(0)
  const [game, setGame] = useState(() => new Chess(shuffled[0].fen))
  const [timeLeft, setTimeLeft] = useState(minutes * 60)
  const [score, setScore] = useState(0)
  const [misses, setMisses] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [phase, setPhase] = useState<'playing' | 'feedback' | 'end'>('playing')
  const [feedbackType, setFeedbackType] = useState<'correct' | 'miss' | null>(null)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [moveIndex, setMoveIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const processingRef = useRef(false)

  const currentPuzzle = shuffled[puzzleIdx]

  // Countdown timer
  useEffect(() => {
    if (phase === 'end') return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          setPhase('end')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [phase])

  const goToNextPuzzle = useCallback(() => {
    const nextIdx = puzzleIdx + 1
    if (nextIdx >= shuffled.length) {
      setPhase('end')
      return
    }
    setPuzzleIdx(nextIdx)
    setGame(new Chess(shuffled[nextIdx].fen))
    setMoveIndex(0)
    setLastMove(null)
    processingRef.current = false
    setPhase('playing')
  }, [puzzleIdx, shuffled])

  const showFeedback = useCallback((type: 'correct' | 'miss') => {
    setFeedbackType(type)
    setPhase('feedback')
    setTimeout(() => {
      goToNextPuzzle()
    }, type === 'correct' ? 700 : 1500)
  }, [goToNextPuzzle])

  const handleMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    if (phase !== 'playing' || processingRef.current) return false
    processingRef.current = true

    const expectedMove = currentPuzzle.moves[moveIndex]
    if (!expectedMove) { processingRef.current = false; return false }

    try {
      const gameCopy = new Chess(game.fen())
      const move = gameCopy.move({ from, to, promotion: promotion || 'q' })
      if (!move) { processingRef.current = false; return false }

      if (move.san === expectedMove) {
        playSound('move')
        setGame(gameCopy)
        setLastMove({ from, to })
        const nextMoveIndex = moveIndex + 1

        if (nextMoveIndex >= currentPuzzle.moves.length) {
          // Puzzle solved!
          setScore(s => s + 1)
          setStreak(s => {
            const ns = s + 1
            setBestStreak(b => Math.max(b, ns))
            return ns
          })
          playSound('success')
          triggerHaptic('success')
          showFeedback('correct')
        } else {
          // Play opponent move
          setMoveIndex(nextMoveIndex)
          setTimeout(() => {
            const oppGame = new Chess(gameCopy.fen())
            const oppMove = oppGame.move(currentPuzzle.moves[nextMoveIndex])
            if (oppMove) {
              setGame(oppGame)
              setLastMove({ from: oppMove.from, to: oppMove.to })
              setMoveIndex(nextMoveIndex + 1)
            }
            processingRef.current = false
          }, 400)
        }
        return true
      } else {
        // Wrong move
        setMisses(m => m + 1)
        setStreak(0)
        playSound('fail')
        triggerHaptic('error')
        showFeedback('miss')
        return false
      }
    } catch {
      processingRef.current = false
      return false
    }
  }, [game, moveIndex, currentPuzzle, phase, showFeedback, playSound, triggerHaptic])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  const total = score + misses
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0
  const xpEarned = score * 5

  if (phase === 'end') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col gap-5 pb-8"
      >
        <div className="glass-card p-6 flex flex-col items-center gap-4 glow-primary">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-display font-bold text-foreground">{score}</p>
            <p className="text-sm text-muted-foreground">Puzzles Solved</p>
          </div>
          <div className="grid grid-cols-3 gap-4 w-full">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{accuracy}%</p>
              <p className="text-[10px] text-muted-foreground">Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{bestStreak}</p>
              <p className="text-[10px] text-muted-foreground">Best Streak</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-primary">+{xpEarned}</p>
              <p className="text-[10px] text-muted-foreground">XP Earned</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onBack}
              className="flex-1 py-3 rounded-lg bg-secondary text-foreground font-semibold text-sm"
            >
              Back to Puzzles
            </button>
            <button
              onClick={() => {
                addXP(xpEarned)
                onBack()
              }}
              className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" /> Claim XP
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  const rushBoardSize = typeof window !== 'undefined' ? Math.min(380, window.innerWidth - 48) : 360

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-3 pb-8"
    >
      {/* Rush header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          <span className="text-sm font-bold text-foreground">{minutes} Min Rush</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${timeLeft <= 30 ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-secondary text-foreground'}`}>
            <Timer className="w-3.5 h-3.5" />
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => { if (timerRef.current) clearInterval(timerRef.current); setPhase('end') }}
            className="px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground text-xs"
          >
            Give Up
          </button>
        </div>
      </div>

      {/* Score bar */}
      <div className="flex items-center justify-between glass-card p-3">
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-lg font-bold text-primary">{score}</p>
            <p className="text-[10px] text-muted-foreground">Score</p>
          </div>
          {streak > 1 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-bold text-orange-400">{streak}x</span>
            </div>
          )}
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Puzzle {puzzleIdx + 1}/{shuffled.length}</p>
        </div>
      </div>

      {/* Board */}
      <div className="flex justify-center relative">
        <Chessboard
          fen={game.fen()}
          size={rushBoardSize}
          interactive={phase === 'playing'}
          onMove={handleMove}
          lastMove={lastMove || undefined}
          isCheck={game.isCheck()}
          boardStyle={settings.boardStyle}
          pieceStyle={settings.pieceStyle}
          orientation={currentPuzzle.fen.split(' ')[1] === 'w' ? 'white' : 'black'}
        />
        {/* Feedback overlay */}
        <AnimatePresence>
          {phase === 'feedback' && feedbackType && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center rounded-xl"
              style={{ backgroundColor: feedbackType === 'correct' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)' }}
            >
              <div className={`px-6 py-3 rounded-xl font-bold text-lg ${feedbackType === 'correct' ? 'bg-primary text-white' : 'bg-destructive text-white'}`}>
                {feedbackType === 'correct' ? '✓ Correct!' : '✗ Miss'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Puzzle info */}
      <div className="flex items-center justify-between">
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getDifficultyBg(currentPuzzle.difficulty)}`}>
          {currentPuzzle.difficulty}
        </span>
        <span className="text-[10px] text-muted-foreground">{currentPuzzle.title}</span>
        <span className="text-[10px] text-muted-foreground">Rating: {currentPuzzle.rating}</span>
      </div>
    </motion.div>
  )
}

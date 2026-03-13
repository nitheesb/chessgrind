'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chess } from 'chess.js'
import { Chessboard, CapturedPieces } from '@/components/chess/chessboard'
import { EvalBar } from '@/components/chess/eval-bar'
import { AI_LEVELS } from '@/lib/chess-data'
import { useGame } from '@/lib/game-context'
import { useSettings } from '@/lib/settings-context'
import { getBestMove, getEngineConfig, analyzePosition } from '@/lib/chess-engine'
import { detectOpening } from '@/lib/opening-detection'
import { analyzeMoveQualities, getQualityColor } from '@/lib/move-quality'
import { staggerContainer, staggerItem } from '@/components/ui/animated-components'
import {
  ArrowLeft,
  Swords,
  Clock,
  RotateCcw,
  Flag,
  Zap,
  Trophy,
  Cpu,
  ChevronRight,
  Crown,
  Shield,
  Timer,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Minus,
  Plus,
  Eye,
  EyeOff,
  Copy,
  BookOpen,
} from 'lucide-react'

interface PlayAIProps {
  onBack: () => void
}

function CheckmateCelebration({ show }: { show: boolean }) {
  if (!show) return null
  const colors = ['#f59e0b', '#fbbf24', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4']
  return (
    <div className="fixed inset-0 pointer-events-none z-[200] overflow-hidden">
      {Array.from({ length: 20 }, (_, i) => {
        const color = colors[i % colors.length]
        const left = 30 + Math.random() * 40
        const delay = Math.random() * 0.5
        const duration = 1 + Math.random() * 1
        const size = 6 + Math.random() * 8
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: '45%',
              width: size,
              height: size,
              borderRadius: '50%',
              backgroundColor: color,
              animation: `confetti-fly-${i % 4} ${duration}s ${delay}s ease-out forwards`,
            }}
          />
        )
      })}
    </div>
  )
}

type TimeControl = { label: string; minutes: number; increment: number }

const TIME_CONTROLS: TimeControl[] = [
  { label: 'Unlimited', minutes: 0, increment: 0 },
  { label: '1 min', minutes: 1, increment: 0 },
  { label: '3 min', minutes: 3, increment: 0 },
  { label: '5 min', minutes: 5, increment: 0 },
  { label: '10 min', minutes: 10, increment: 0 },
  { label: '5|3', minutes: 5, increment: 3 },
  { label: '10|5', minutes: 10, increment: 5 },
]

export function PlayAIPage({ onBack }: PlayAIProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w')
  const [timeControl, setTimeControl] = useState<TimeControl>(TIME_CONTROLS[0])
  const [showAdvanced, setShowAdvanced] = useState(false)

  if (gameStarted && selectedLevel !== null) {
    return (
      <GameSession
        aiLevel={selectedLevel}
        playerColor={playerColor}
        timeControl={timeControl}
        onBack={() => {
          setGameStarted(false)
          setSelectedLevel(null)
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
          <h1 className="text-xl font-display font-bold text-foreground shimmer-text">Play vs Computer</h1>
          <p className="text-xs text-muted-foreground shimmer-text">Choose your opponent</p>
        </div>
      </motion.div>

      {/* Color Selection */}
      <motion.div variants={staggerItem} className="mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">Choose Your Side</p>
        <div className="grid grid-cols-3 gap-3">
          {(['w', 'b', 'random'] as const).map((color) => {
            const isSelected = playerColor === color || (color !== 'random' && playerColor === color)

            return (
              <button
                key={color}
                onClick={() => setPlayerColor(color === 'random' ? (Math.random() > 0.5 ? 'w' : 'b') : color)}
                className={`flex flex-col items-center gap-2.5 py-4 px-2 rounded-xl border transition-all duration-300 relative overflow-hidden group ${isSelected
                    ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-primary/50'
                    : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20'
                  }`}
              >
                {/* Subtle gradient hover block */}
                {!isSelected && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.03] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                )}

                {color === 'w' && <div className="w-8 h-8 rounded-full bg-white border text-black shadow-inner relative z-10" />}
                {color === 'b' && <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/20 shadow-inner relative z-10" />}
                {color === 'random' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex shadow-inner border border-white/20 relative z-10">
                    <div className="w-4 h-8 bg-white" />
                    <div className="w-4 h-8 bg-zinc-900" />
                  </div>
                )}
                <span className="text-xs font-semibold text-foreground capitalize tracking-wide relative z-10">
                  {color === 'w' ? 'White' : color === 'b' ? 'Black' : 'Random'}
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Advanced Options */}
      <motion.div variants={staggerItem}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full glass-card p-4"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Time Control</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-primary font-medium">{timeControl.label}</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </button>
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 pt-3">
                {TIME_CONTROLS.map((tc) => (
                  <button
                    key={tc.label}
                    onClick={() => setTimeControl(tc)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${timeControl.label === tc.label
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground'
                      }`}
                  >
                    {tc.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* AI Level Selection */}
      <motion.div variants={staggerItem}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
          Select Difficulty
        </h2>
        <div className="flex flex-col gap-3">
          {AI_LEVELS.map((level) => {
            const isActive = selectedLevel === level.level

            return (
              <motion.button
                key={level.level}
                onClick={() => {
                  setSelectedLevel(level.level)
                  setGameStarted(true)
                }}
                style={{
                  boxShadow: isActive ? `0 0 20px ${level.color}25` : undefined,
                  borderColor: isActive ? level.color : undefined
                }}
                className={`w-full p-4 rounded-xl border flex items-center gap-3 text-left transition-all duration-300 relative overflow-hidden group ${isActive
                    ? 'ring-1'
                    : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20'
                  }`}
              >
                {/* Subtle gradient hover block */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.03] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                )}

                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{ backgroundColor: isActive ? level.color : 'transparent' }}
                />

                {/* Level indicator */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border relative z-10"
                  style={{
                    backgroundColor: `${level.color}10`,
                    borderColor: `${level.color}30`,
                  }}
                >
                  <Cpu className={`w-6 h-6 transition-colors`} style={{ color: isActive ? level.color : undefined }} color={isActive ? undefined : 'currentColor'} />
                </div>

                <div className="flex-1 min-w-0 relative z-10">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-foreground tracking-wide">{level.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-secondary text-muted-foreground">
                      {level.rating}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">{level.description}</p>
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 group-hover:translate-x-1 group-hover:text-primary transition-all relative z-10" />
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

function GameSession({
  aiLevel,
  playerColor,
  timeControl,
  onBack,
}: {
  aiLevel: number
  playerColor: 'w' | 'b'
  timeControl: TimeControl
  onBack: () => void
}) {
  const { addXP, incrementGamesPlayed, addRecentGame } = useGame()
  const { settings, updateSetting } = useSettings()
  const [game, setGame] = useState(() => new Chess())
  const [gameOver, setGameOver] = useState(false)
  const [result, setResult] = useState<string>('')
  const [playerWon, setPlayerWon] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [showResignConfirm, setShowResignConfirm] = useState(false)
  const [premove, setPremove] = useState<{ from: string; to: string; promotion?: string } | null>(null)
  const [notationView, setNotationView] = useState<'list' | 'condensed'>('list')
  const [copiedPGN, setCopiedPGN] = useState(false)
  const [copiedFEN, setCopiedFEN] = useState(false)
  const notationRef = useRef<HTMLDivElement>(null)

  // Opening detection
  const currentOpening = useMemo(() => detectOpening(moveHistory), [moveHistory])

  // Real-time analysis
  const [analysis, setAnalysis] = useState<{ eval: number; bestLine: string[]; isMate: boolean; mateIn: number | null } | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(true)

  useEffect(() => {
    if (gameOver || moveHistory.length === 0) {
      setAnalysis(null)
      return
    }
    const result = analyzePosition(game, 4)
    setAnalysis(result)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveHistory.length, gameOver])

  // Move quality annotations (computed after game ends)
  const moveQualities = useMemo(() => {
    if (!gameOver || moveHistory.length === 0) return []
    return analyzeMoveQualities(moveHistory)
  }, [gameOver, moveHistory])

  // Board size state (Feature 5)
  const [boardSize, setBoardSize] = useState(() => {
    if (typeof window === 'undefined') return 360
    const stored = localStorage.getItem('chessgrind_board_size')
    if (stored) return Math.min(Math.max(parseInt(stored), 280), 600)
    return Math.min(480, window.innerWidth - 48)
  })
  const updateBoardSize = (delta: number) => {
    setBoardSize(prev => {
      const maxSize = typeof window !== 'undefined' ? Math.min(600, window.innerWidth - 48) : 600
      const next = Math.min(Math.max(prev + delta, 280), maxSize)
      localStorage.setItem('chessgrind_board_size', String(next))
      return next
    })
  }

  // Keyboard move input
  const [keyboardInput, setKeyboardInput] = useState('')
  const [keyboardError, setKeyboardError] = useState(false)

  // Timer state
  const [whiteTime, setWhiteTime] = useState(timeControl.minutes * 60)
  const [blackTime, setBlackTime] = useState(timeControl.minutes * 60)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const aiConfig = AI_LEVELS.find(l => l.level === aiLevel) || AI_LEVELS[0]
  const isPlayerTurn = game.turn() === playerColor

  // Timer logic
  useEffect(() => {
    if (gameOver || timeControl.minutes === 0) return

    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      if (game.turn() === 'w') {
        setWhiteTime(prev => {
          if (prev <= 0) {
            handleGameEnd('Time out', playerColor === 'b')
            return 0
          }
          return prev - 1
        })
      } else {
        setBlackTime(prev => {
          if (prev <= 0) {
            handleGameEnd('Time out', playerColor === 'w')
            return 0
          }
          return prev - 1
        })
      }
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.turn(), gameOver, timeControl.minutes])

  const handleGameEnd = useCallback((reason: string, playerIsWinner: boolean) => {
    setGameOver(true)
    setResult(reason)
    setPlayerWon(playerIsWinner)
    setPremove(null)
    incrementGamesPlayed()
    if (playerIsWinner) {
      addXP(20 + aiLevel * 10)
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 2000)
    } else {
      addXP(5)
    }
    if (timerRef.current) clearInterval(timerRef.current)
    addRecentGame({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      result: playerIsWinner ? 'win' : (reason === 'Draw' || reason === 'Stalemate') ? 'draw' : 'loss',
      opponent: aiConfig.name,
      moves: moveHistory.length,
    })
  }, [addXP, incrementGamesPlayed, aiLevel, addRecentGame, aiConfig.name, moveHistory.length])

  // AI move using shared chess engine
  const makeAIMove = useCallback((currentGame: Chess) => {
    if (currentGame.isGameOver()) return

    setIsThinking(true)

    setTimeout(() => {
      const config = getEngineConfig(aiConfig.depth)
      const bestMoveSan = getBestMove(currentGame, config)

      if (bestMoveSan) {
        try {
          const gameCopy = new Chess(currentGame.fen())
          const move = gameCopy.move(bestMoveSan)
          if (move) {
            setGame(gameCopy)
            setLastMove({ from: move.from, to: move.to })
            setMoveHistory(prev => [...prev, move.san])

            // Add increment
            if (timeControl.increment > 0) {
              if (currentGame.turn() === 'w') {
                setWhiteTime(prev => prev + timeControl.increment)
              } else {
                setBlackTime(prev => prev + timeControl.increment)
              }
            }

            // Check game end
            if (gameCopy.isCheckmate()) {
              handleGameEnd('Checkmate', gameCopy.turn() === playerColor ? false : true)
            } else if (gameCopy.isDraw()) {
              handleGameEnd('Draw', false)
            } else if (gameCopy.isStalemate()) {
              handleGameEnd('Stalemate', false)
            }
          }
        } catch {
          // fallback
        }
      }
      setIsThinking(false)
    }, 300 + Math.random() * 400)
  }, [aiConfig.depth, playerColor, timeControl.increment, handleGameEnd])

  // Trigger AI move when it's AI's turn
  useEffect(() => {
    if (!isPlayerTurn && !gameOver && !isThinking) {
      makeAIMove(game)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayerTurn, gameOver])

  const handlePlayerMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    if (gameOver) return false
    // Store as premove when it's AI's turn
    if (!isPlayerTurn) {
      setPremove({ from, to, promotion })
      return true // optimistic
    }

    try {
      const gameCopy = new Chess(game.fen())
      const move = gameCopy.move({ from, to, promotion: promotion || 'q' })
      if (!move) return false

      setGame(gameCopy)
      setLastMove({ from, to })
      setMoveHistory(prev => [...prev, move.san])

      // Add increment
      if (timeControl.increment > 0) {
        if (playerColor === 'w') {
          setWhiteTime(prev => prev + timeControl.increment)
        } else {
          setBlackTime(prev => prev + timeControl.increment)
        }
      }

      // Check game end
      if (gameCopy.isCheckmate()) {
        handleGameEnd('Checkmate', true)
      } else if (gameCopy.isDraw()) {
        handleGameEnd('Draw', false)
      } else if (gameCopy.isStalemate()) {
        handleGameEnd('Stalemate', false)
      }

      return true
    } catch {
      return false
    }
  }, [game, isPlayerTurn, gameOver, playerColor, timeControl.increment, handleGameEnd])

  // Execute premove when it becomes player's turn
  useEffect(() => {
    if (isPlayerTurn && premove && !gameOver) {
      const { from, to, promotion } = premove
      setPremove(null)
      try {
        const gameCopy = new Chess(game.fen())
        const move = gameCopy.move({ from, to, promotion: promotion || 'q' })
        if (!move) return // premove was illegal, silently discard
        setGame(gameCopy)
        setLastMove({ from, to })
        setMoveHistory(prev => [...prev, move.san])
        if (gameCopy.isCheckmate()) handleGameEnd('Checkmate', true)
        else if (gameCopy.isDraw()) handleGameEnd('Draw', false)
        else if (gameCopy.isStalemate()) handleGameEnd('Stalemate', false)
      } catch { /* illegal premove — discard */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayerTurn])

  const handleResign = useCallback(() => {
    handleGameEnd('Resignation', false)
    setShowResignConfirm(false)
  }, [handleGameEnd])

  const handleNewGame = useCallback(() => {
    setGame(new Chess())
    setGameOver(false)
    setResult('')
    setPlayerWon(false)
    setLastMove(null)
    setMoveHistory([])
    setIsThinking(false)
    setShowResignConfirm(false)
    setPremove(null)
    setWhiteTime(timeControl.minutes * 60)
    setBlackTime(timeControl.minutes * 60)
  }, [timeControl.minutes])

  const generatePGN = useCallback(() => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '.')
    let pgnResult = '*'
    if (result === 'Draw' || result === 'Stalemate') pgnResult = '1/2-1/2'
    else if (playerWon) pgnResult = playerColor === 'w' ? '1-0' : '0-1'
    else if (gameOver) pgnResult = playerColor === 'w' ? '0-1' : '1-0'
    const headers = [
      '[Event "ChessGrind Game"]',
      `[Date "${date}"]`,
      `[White "${playerColor === 'w' ? 'You' : aiConfig.name}"]`,
      `[Black "${playerColor === 'b' ? 'You' : aiConfig.name}"]`,
      `[Result "${pgnResult}"]`,
    ].join('\n')
    const movePairs = Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => {
      const w = moveHistory[i * 2] || ''
      const b = moveHistory[i * 2 + 1] ? ' ' + moveHistory[i * 2 + 1] : ''
      return `${i + 1}. ${w}${b}`
    })
    return `${headers}\n\n${movePairs.join(' ')} ${pgnResult}`
  }, [result, playerWon, playerColor, gameOver, aiConfig.name, moveHistory])

  // Auto-scroll notation to latest move
  useEffect(() => {
    if (notationRef.current) {
      notationRef.current.scrollTop = notationRef.current.scrollHeight
    }
  }, [moveHistory.length])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-3 pb-8"
    >
      <CheckmateCelebration show={showCelebration} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h2 className="text-sm font-semibold text-foreground">vs {aiConfig.name}</h2>
            <p className="text-[10px] text-muted-foreground">Rating: {aiConfig.rating}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Sound toggle (Feature 8) */}
          <button
            onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
            className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center"
            title={settings.soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {settings.soundEnabled
              ? <Volume2 className="w-4 h-4 text-foreground" />
              : <VolumeX className="w-4 h-4 text-muted-foreground" />}
          </button>
          {isThinking && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full"
              />
              <span className="text-xs text-accent font-medium">Thinking...</span>
            </div>
          )}
        </div>
      </div>

      {/* Opponent info (top) */}
      <div className="flex items-center justify-between glass-card p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <Cpu className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">{aiConfig.name}</p>
            <CapturedPieces fen={game.fen()} color={playerColor === 'w' ? 'b' : 'w'} pieceSize={14} />
          </div>
        </div>
        {timeControl.minutes > 0 && (
          <div className={`px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${game.turn() !== playerColor
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-secondary text-muted-foreground'
            }`}>
            {formatTime(playerColor === 'w' ? blackTime : whiteTime)}
          </div>
        )}
      </div>

      {/* Board + Eval Bar (Feature 1 & 5) */}
      <div className="flex justify-center">
        <div className="flex items-stretch gap-2">
          <EvalBar game={game} size={boardSize} thickness={20} vertical />
          <Chessboard
            fen={game.fen()}
            size={boardSize}
            interactive={isPlayerTurn && !gameOver}
            flipped={playerColor === 'b'}
            onMove={handlePlayerMove}
            lastMove={lastMove || undefined}
            showCoordinates
            isCheck={game.isCheck()}
            boardStyle={settings.boardStyle}
            pieceStyle={settings.pieceStyle}
            arrows={premove ? [{ from: premove.from, to: premove.to, color: 'orange' }] : []}
            blindfoldMode={settings.blindfoldMode}
          />
        </div>
      </div>

      {/* Opening name display */}
      {currentOpening && moveHistory.length <= 20 && (
        <div className="flex items-center justify-center gap-2 px-2">
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-primary font-medium">{currentOpening.eco}: {currentOpening.name}</span>
        </div>
      )}

      {/* Board size controls (Feature 5) + sound toggle */}
      <div className="flex items-center justify-center gap-2">
        <button onClick={() => updateBoardSize(-20)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center" title="Smaller board">
          <Minus className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <span className="text-xs text-muted-foreground font-mono w-12 text-center">{boardSize}px</span>
        <button onClick={() => updateBoardSize(20)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center" title="Larger board">
          <Plus className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <div className="w-px h-5 bg-border mx-1" />
        <button
          onClick={() => updateSetting('blindfoldMode', !settings.blindfoldMode)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${settings.blindfoldMode ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}
          title={settings.blindfoldMode ? 'Show pieces' : 'Blindfold mode'}
        >
          {settings.blindfoldMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(game.fen())
            setCopiedFEN(true)
            setTimeout(() => setCopiedFEN(false), 1500)
          }}
          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground"
          title="Copy FEN"
        >
          {copiedFEN ? <span className="text-xs text-primary">✓</span> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Live Analysis Panel */}
      {!gameOver && analysis && (
        <div className="glass-card p-3">
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">Engine Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold font-mono ${
                analysis.isMate ? 'text-red-400' : analysis.eval > 0 ? 'text-white' : analysis.eval < 0 ? 'text-zinc-500' : 'text-muted-foreground'
              }`}>
                {analysis.isMate ? `M${analysis.mateIn}` : `${analysis.eval > 0 ? '+' : ''}${analysis.eval.toFixed(1)}`}
              </span>
              {showAnalysis ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
            </div>
          </button>
          {showAnalysis && (
            <div className="mt-2 pt-2 border-t border-white/[0.06] space-y-2">
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.max(5, Math.min(95, 50 + analysis.eval * 10))}%`,
                    background: analysis.eval >= 0 ? '#e0e0e0' : '#4a4a4a',
                  }}
                />
              </div>
              {analysis.bestLine.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Best line</span>
                  <p className="text-xs font-mono text-foreground/80">{analysis.bestLine.join(' ')}</p>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground">
                {analysis.isMate ? 'Forced mate detected' :
                  analysis.eval > 3 ? 'Winning position' :
                  analysis.eval > 1.5 ? 'Clear advantage' :
                  analysis.eval > 0.5 ? 'Slight edge' :
                  analysis.eval > -0.5 ? 'Equal position' :
                  analysis.eval > -1.5 ? 'Slight disadvantage' :
                  analysis.eval > -3 ? 'Opponent has advantage' :
                  'Losing position'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Keyboard move input */}
      {!gameOver && (
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
                  // Try SAN notation first
                  const gameCopy = new Chess(game.fen())
                  const move = gameCopy.move(input)
                  if (move) {
                    success = handlePlayerMove(move.from, move.to, move.promotion)
                  }
                } catch {
                  // Try coordinate notation (e.g. e2e4, e7e8q)
                  if (input.length >= 4) {
                    const from = input.slice(0, 2)
                    const to = input.slice(2, 4)
                    const promotion = input.length > 4 ? input[4] : undefined
                    success = handlePlayerMove(from, to, promotion)
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

      {/* Player info (bottom) */}
      <div className="flex items-center justify-between glass-card p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Crown className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">You</p>
            <CapturedPieces fen={game.fen()} color={playerColor === 'w' ? 'w' : 'b'} pieceSize={14} />
          </div>
        </div>
        {timeControl.minutes > 0 && (
          <div className={`px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${isPlayerTurn && !gameOver
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-secondary text-muted-foreground'
            }`}>
            {formatTime(playerColor === 'w' ? whiteTime : blackTime)}
          </div>
        )}
      </div>

      {/* Turn indicator & controls */}
      {!gameOver && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isPlayerTurn ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`} />
            <span className="text-xs text-muted-foreground">
              {isPlayerTurn ? 'Your turn' : 'AI is thinking...'}
            </span>
            {premove && (
              <button
                onClick={() => setPremove(null)}
                className="ml-1 px-2 py-0.5 rounded bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-medium"
              >
                Pre-move: cancel
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewGame}
              className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center"
              title="New Game"
            >
              <RotateCcw className="w-4 h-4 text-foreground" />
            </button>
            <button
              onClick={() => setShowResignConfirm(true)}
              className="w-9 h-9 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center"
              title="Resign"
            >
              <Flag className="w-4 h-4 text-destructive" />
            </button>
          </div>
        </div>
      )}

      {/* Move list (compact horizontal scroll) */}
      {moveHistory.length > 0 && !gameOver && (
        <div className="flex gap-1 overflow-x-auto py-1 scrollbar-hide">
          {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => (
            <div key={i} className="flex-shrink-0 text-[11px] font-mono px-1.5 py-0.5 rounded bg-secondary/50">
              <span className="text-muted-foreground">{i + 1}.</span>{' '}
              <span className="text-foreground">{moveHistory[i * 2]}</span>
              {moveHistory[i * 2 + 1] && <span className="text-foreground/70"> {moveHistory[i * 2 + 1]}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Resign confirmation */}
      <AnimatePresence>
        {showResignConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass-card p-4 flex items-center justify-between"
          >
            <p className="text-sm text-foreground">Resign this game?</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowResignConfirm(false)}
                className="px-4 py-2 rounded-lg bg-secondary text-sm font-medium text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleResign}
                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium"
              >
                Resign
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Overlay */}
      <AnimatePresence>
        {gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`glass-card p-6 flex flex-col items-center gap-4 ${playerWon ? 'glow-primary' : ''}`}
          >
            <motion.div
              animate={playerWon ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.6 }}
              className={`w-16 h-16 rounded-full flex items-center justify-center ${playerWon ? 'bg-primary/20' : 'bg-secondary'
                }`}
            >
              {playerWon ? (
                <Trophy className="w-8 h-8 text-primary" />
              ) : (
                <Shield className="w-8 h-8 text-muted-foreground" />
              )}
            </motion.div>
            <div className="text-center">
              <p className="text-lg font-display font-bold text-foreground">
                {playerWon ? 'Victory!' : (result === 'Draw' || result === 'Stalemate') ? 'Draw' : 'Defeat'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{result}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">
                  +{playerWon ? 20 + aiLevel * 10 : 5} XP
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={onBack}
                className="flex-1 py-3 rounded-lg font-semibold text-sm text-white/80"
                style={{ background: '#454341', borderBottom: '3px solid #2b2927' }}
              >
                Back
              </button>
              <button
                onClick={handleNewGame}
                className="flex-1 py-3 rounded-lg font-bold text-sm text-white flex items-center justify-center gap-2"
                style={{ background: '#81b64c', borderBottom: '3px solid #5d8c34' }}
              >
                <RotateCcw className="w-4 h-4" />
                Rematch
              </button>
            </div>
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={() => {
                  const pgn = generatePGN()
                  const blob = new Blob([pgn], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `chessgrind-game-${Date.now()}.pgn`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="flex-1 py-2 rounded-lg bg-secondary text-muted-foreground text-xs font-medium hover:text-foreground transition-colors"
              >
                ↓ Download PGN
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatePGN()).then(() => {
                    setCopiedPGN(true)
                    setTimeout(() => setCopiedPGN(false), 2000)
                  })
                }}
                className="flex-1 py-2 rounded-lg bg-secondary text-muted-foreground text-xs font-medium hover:text-foreground transition-colors"
              >
                {copiedPGN ? '✓ Copied!' : '⎘ Copy PGN'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move History */}
      {moveHistory.length > 0 && (
        <div className="glass-card p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground font-medium">Moves ({Math.ceil(moveHistory.length / 2)})</p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setNotationView('list')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${notationView === 'list' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                List
              </button>
              <button
                onClick={() => setNotationView('condensed')}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${notationView === 'condensed' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Compact
              </button>
            </div>
          </div>
          <div ref={notationRef} className="max-h-32 overflow-y-auto scrollbar-hide">
            {notationView === 'list' ? (
              <div className="space-y-0.5">
                {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => {
                  const isLastPair = i === Math.ceil(moveHistory.length / 2) - 1
                  const wq = moveQualities[i * 2] || ''
                  const bq = moveQualities[i * 2 + 1] || ''
                  return (
                    <div key={i} className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-mono ${isLastPair ? 'bg-primary/10' : ''}`}>
                      <span className="text-muted-foreground w-5 text-right shrink-0">{i + 1}.</span>
                      <span className={`w-16 ${isLastPair && moveHistory.length % 2 !== 0 ? 'text-primary font-bold' : 'text-foreground'}`}>
                        {moveHistory[i * 2]}{wq && <span className={`ml-0.5 ${getQualityColor(wq)}`}>{wq}</span>}
                      </span>
                      {moveHistory[i * 2 + 1] && (
                        <span className={`w-16 ${isLastPair ? 'text-primary font-bold' : 'text-foreground/70'}`}>
                          {moveHistory[i * 2 + 1]}{bq && <span className={`ml-0.5 ${getQualityColor(bq)}`}>{bq}</span>}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-x-1 gap-y-0.5">
                {moveHistory.map((move, idx) => {
                  const isLast = idx === moveHistory.length - 1
                  return (
                    <span key={idx} className="inline-flex items-center gap-0.5">
                      {idx % 2 === 0 && (
                        <span className="text-[10px] text-muted-foreground">{Math.floor(idx / 2) + 1}.</span>
                      )}
                      <span className={`text-xs font-mono ${isLast ? 'text-primary font-bold' : 'text-foreground'}`}>{move}</span>
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}

'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chess } from 'chess.js'
import { Chessboard, CapturedPieces } from '@/components/chess/chessboard'
import { EvalBar } from '@/components/chess/eval-bar'
import { AI_LEVELS } from '@/lib/chess-data'
import { useGame } from '@/lib/game-context'
import { useSettings } from '@/lib/settings-context'
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
} from 'lucide-react'

interface PlayAIProps {
  onBack: () => void
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
          <h1 className="text-xl font-display font-bold text-foreground shimmer-text">Play vs AI</h1>
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
                    ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(52,211,153,0.15)] ring-1 ring-primary/50'
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
  const { addXP, incrementGamesPlayed } = useGame()
  const { settings, updateSetting } = useSettings()
  const [game, setGame] = useState(() => new Chess())
  const [gameOver, setGameOver] = useState(false)
  const [result, setResult] = useState<string>('')
  const [playerWon, setPlayerWon] = useState(false)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [showResignConfirm, setShowResignConfirm] = useState(false)

  // Board size state (Feature 5)
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
    incrementGamesPlayed()
    if (playerIsWinner) {
      addXP(20 + aiLevel * 10)
    } else {
      addXP(5)
    }
    if (timerRef.current) clearInterval(timerRef.current)
  }, [addXP, incrementGamesPlayed, aiLevel])

  // Simple AI move using minimax with alpha-beta pruning
  const makeAIMove = useCallback((currentGame: Chess) => {
    if (currentGame.isGameOver()) return

    setIsThinking(true)

    setTimeout(() => {
      const moves = currentGame.moves({ verbose: true })
      if (moves.length === 0) return

      let selectedMove
      const depth = Math.min(aiConfig.depth, 4) // Cap at 4 for performance
      const randomFactor = Math.max(0, 5 - depth) // More randomness at lower levels

      const pieceValues: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 }

      // Position bonus tables (simplified)
      const centerBonus = (sq: string) => {
        const file = sq.charCodeAt(0) - 97, rank = parseInt(sq[1]) - 1
        return (3.5 - Math.abs(file - 3.5)) * 5 + (3.5 - Math.abs(rank - 3.5)) * 5
      }

      const evaluate = (g: Chess): number => {
        if (g.isCheckmate()) return g.turn() === currentGame.turn() ? -99999 : 99999
        if (g.isDraw() || g.isStalemate()) return 0

        let score = 0
        const board = g.board()
        for (const row of board) {
          for (const sq of row) {
            if (!sq) continue
            const val = pieceValues[sq.type] + centerBonus(sq.square)
            score += sq.color === currentGame.turn() ? val : -val
          }
        }
        // Mobility bonus
        score += g.turn() === currentGame.turn() ? g.moves().length * 2 : -g.moves().length * 2
        return score
      }

      const minimax = (g: Chess, d: number, alpha: number, beta: number, maximizing: boolean): number => {
        if (d === 0 || g.isGameOver()) return evaluate(g)

        const gameMoves = g.moves()
        if (maximizing) {
          let maxEval = -Infinity
          for (const m of gameMoves) {
            g.move(m)
            const ev = minimax(g, d - 1, alpha, beta, false)
            g.undo()
            maxEval = Math.max(maxEval, ev)
            alpha = Math.max(alpha, ev)
            if (beta <= alpha) break
          }
          return maxEval
        } else {
          let minEval = Infinity
          for (const m of gameMoves) {
            g.move(m)
            const ev = minimax(g, d - 1, alpha, beta, true)
            g.undo()
            minEval = Math.min(minEval, ev)
            beta = Math.min(beta, ev)
            if (beta <= alpha) break
          }
          return minEval
        }
      }

      if (depth <= 1) {
        // Random with basic capture preference for easiest bot
        const captures = moves.filter(m => m.captured)
        const checks = moves.filter(m => m.san.includes('+'))
        if (checks.length > 0 && Math.random() > 0.5) {
          selectedMove = checks[Math.floor(Math.random() * checks.length)]
        } else if (captures.length > 0 && Math.random() > 0.4) {
          selectedMove = captures[Math.floor(Math.random() * captures.length)]
        } else {
          selectedMove = moves[Math.floor(Math.random() * moves.length)]
        }
      } else {
        // Minimax with alpha-beta pruning
        let bestScore = -Infinity
        let bestMoves: typeof moves = []
        const searchDepth = depth

        for (const move of moves) {
          const testGame = new Chess(currentGame.fen())
          testGame.move(move)
          const score = -minimax(testGame, searchDepth - 1, -Infinity, Infinity, false) + Math.random() * randomFactor * 40

          if (score > bestScore) {
            bestScore = score
            bestMoves = [move]
          } else if (Math.abs(score - bestScore) < randomFactor * 10) {
            bestMoves.push(move)
          }
        }
        selectedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)]
      }

      if (selectedMove) {
        try {
          const gameCopy = new Chess(currentGame.fen())
          gameCopy.move(selectedMove)
          setGame(gameCopy)
          setLastMove({ from: selectedMove.from, to: selectedMove.to })
          setMoveHistory(prev => [...prev, selectedMove.san])

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
        } catch {
          // fallback
        }
      }
      setIsThinking(false)
    }, 400 + Math.random() * 600) // Simulate thinking time
  }, [aiConfig.depth, playerColor, timeControl.increment, handleGameEnd])

  // Trigger AI move when it's AI's turn
  useEffect(() => {
    if (!isPlayerTurn && !gameOver && !isThinking) {
      makeAIMove(game)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayerTurn, gameOver])

  const handlePlayerMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    if (!isPlayerTurn || gameOver) return false

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
    setWhiteTime(timeControl.minutes * 60)
    setBlackTime(timeControl.minutes * 60)
  }, [timeControl.minutes])

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
          />
        </div>
      </div>

      {/* Board size controls (Feature 5) + sound toggle */}
      <div className="flex items-center justify-center gap-2">
        <button onClick={() => updateBoardSize(-20)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center" title="Smaller board">
          <Minus className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
        <span className="text-xs text-muted-foreground font-mono w-12 text-center">{boardSize}px</span>
        <button onClick={() => updateBoardSize(20)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center" title="Larger board">
          <Plus className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

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
                className="flex-1 py-3 rounded-lg bg-secondary text-foreground font-semibold text-sm"
              >
                Back
              </button>
              <button
                onClick={handleNewGame}
                className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Rematch
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move History */}
      {moveHistory.length > 0 && (
        <div className="glass-card p-3">
          <p className="text-xs text-muted-foreground font-medium mb-2">Moves</p>
          <div className="flex flex-wrap gap-x-1 gap-y-0.5 max-h-24 overflow-y-auto">
            {moveHistory.map((move, idx) => (
              <span key={idx} className="inline-flex items-center gap-0.5">
                {idx % 2 === 0 && (
                  <span className="text-[10px] text-muted-foreground">{Math.floor(idx / 2) + 1}.</span>
                )}
                <span className="text-xs font-mono text-foreground">{move}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

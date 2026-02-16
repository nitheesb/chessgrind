'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chess } from 'chess.js'
import { Chessboard } from '@/components/chess/chessboard'
import { AI_LEVELS } from '@/lib/chess-data'
import { useGame } from '@/lib/game-context'
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
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

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
          <h1 className="text-xl font-display font-bold text-foreground">Play vs AI</h1>
          <p className="text-xs text-muted-foreground">Choose your opponent</p>
        </div>
      </motion.div>

      {/* Color Selection */}
      <motion.div variants={item} className="glass-card p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Play as</p>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setPlayerColor('w')}
            className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border transition-all ${
              playerColor === 'w' ? 'border-primary bg-primary/10' : 'border-border bg-secondary'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-foreground/90 border-2 border-foreground/20" />
            <span className="text-xs font-medium text-foreground">White</span>
          </button>
          <button
            onClick={() => setPlayerColor('b')}
            className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border transition-all ${
              playerColor === 'b' ? 'border-primary bg-primary/10' : 'border-border bg-secondary'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-muted-foreground/30 border-2 border-muted-foreground/10" />
            <span className="text-xs font-medium text-foreground">Black</span>
          </button>
          <button
            onClick={() => setPlayerColor(Math.random() > 0.5 ? 'w' : 'b')}
            className="flex flex-col items-center gap-2 py-3 px-2 rounded-xl border border-border bg-secondary"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex">
              <div className="w-4 h-8 bg-foreground/90" />
              <div className="w-4 h-8 bg-muted-foreground/30" />
            </div>
            <span className="text-xs font-medium text-foreground">Random</span>
          </button>
        </div>
      </motion.div>

      {/* Advanced Options */}
      <motion.div variants={item}>
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
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      timeControl.label === tc.label
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
      <motion.div variants={item}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Select Difficulty
        </h2>
        <div className="flex flex-col gap-2.5">
          {AI_LEVELS.map((level) => (
            <motion.button
              key={level.level}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedLevel(level.level)
                setGameStarted(true)
              }}
              className={`w-full p-4 rounded-xl border flex items-center gap-3 text-left transition-all ${
                selectedLevel === level.level
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card/50 hover:border-border/80'
              }`}
            >
              {/* Level indicator */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border"
                style={{
                  backgroundColor: `${level.color}10`,
                  borderColor: `${level.color}30`,
                }}
              >
                <Cpu className="w-5 h-5" style={{ color: level.color }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-foreground">{level.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-secondary text-muted-foreground">
                    {level.rating}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{level.description}</p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                {Array.from({ length: Math.min(level.level, 5) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-4 rounded-full"
                    style={{ backgroundColor: level.color, opacity: 0.3 + (i * 0.15) }}
                  />
                ))}
              </div>

              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </motion.button>
          ))}
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
  const [game, setGame] = useState(() => new Chess())
  const [gameOver, setGameOver] = useState(false)
  const [result, setResult] = useState<string>('')
  const [playerWon, setPlayerWon] = useState(false)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [showResignConfirm, setShowResignConfirm] = useState(false)

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

  // Simple AI move using minimax-like evaluation
  const makeAIMove = useCallback((currentGame: Chess) => {
    if (currentGame.isGameOver()) return

    setIsThinking(true)

    setTimeout(() => {
      const moves = currentGame.moves({ verbose: true })
      if (moves.length === 0) return

      let selectedMove
      const depth = aiConfig.depth

      if (depth <= 2) {
        // Random with basic capture preference
        const captures = moves.filter(m => m.captured)
        const checks = moves.filter(m => m.san.includes('+'))
        if (checks.length > 0 && Math.random() > 0.5) {
          selectedMove = checks[Math.floor(Math.random() * checks.length)]
        } else if (captures.length > 0 && Math.random() > 0.3) {
          selectedMove = captures[Math.floor(Math.random() * captures.length)]
        } else {
          selectedMove = moves[Math.floor(Math.random() * moves.length)]
        }
      } else {
        // Better evaluation with piece values and positional scoring
        const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3.2, r: 5, q: 9, k: 0 }

        let bestScore = -Infinity
        let bestMoves: typeof moves = []

        for (const move of moves) {
          let score = 0
          // Capture value
          if (move.captured) {
            score += (pieceValues[move.captured] || 0) * 10
          }
          // Check bonus
          const testGame = new Chess(currentGame.fen())
          testGame.move(move)
          if (testGame.isCheckmate()) {
            score += 1000
          } else if (testGame.isCheck()) {
            score += 5
          }
          // Center control
          const centerSquares = ['d4', 'd5', 'e4', 'e5']
          if (centerSquares.includes(move.to)) score += 2
          // Development bonus
          if (['n', 'b'].includes(move.piece) && move.from[1] === '1') score += 3
          // Castling bonus
          if (move.san === 'O-O' || move.san === 'O-O-O') score += 8
          // Randomness based on level (lower level = more random)
          score += Math.random() * (20 / Math.sqrt(depth))

          // Avoid moving king early
          if (move.piece === 'k' && moveHistory.length < 20 && !move.san.startsWith('O')) score -= 5

          if (score > bestScore) {
            bestScore = score
            bestMoves = [move]
          } else if (score === bestScore) {
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
  }, [aiConfig.depth, moveHistory.length, playerColor, timeControl.increment, handleGameEnd])

  // Trigger AI move when it's AI's turn
  useEffect(() => {
    if (!isPlayerTurn && !gameOver && !isThinking) {
      makeAIMove(game)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayerTurn, gameOver])

  const handlePlayerMove = useCallback((from: string, to: string): boolean => {
    if (!isPlayerTurn || gameOver) return false

    try {
      const gameCopy = new Chess(game.fen())
      const move = gameCopy.move({ from, to, promotion: 'q' })
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

  const boardSize = typeof window !== 'undefined' ? Math.min(360, window.innerWidth - 48) : 360

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

      {/* Opponent info (top) */}
      <div className="flex items-center justify-between glass-card p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <Cpu className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">{aiConfig.name}</p>
            <p className="text-[10px] text-muted-foreground">{playerColor === 'w' ? 'Black' : 'White'}</p>
          </div>
        </div>
        {timeControl.minutes > 0 && (
          <div className={`px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${
            game.turn() !== playerColor
              ? 'bg-primary/10 text-primary border border-primary/20'
              : 'bg-secondary text-muted-foreground'
          }`}>
            {formatTime(playerColor === 'w' ? blackTime : whiteTime)}
          </div>
        )}
      </div>

      {/* Board */}
      <div className="flex justify-center">
        <Chessboard
          fen={game.fen()}
          size={boardSize}
          interactive={isPlayerTurn && !gameOver}
          flipped={playerColor === 'b'}
          onMove={handlePlayerMove}
          lastMove={lastMove || undefined}
          showCoordinates
        />
      </div>

      {/* Player info (bottom) */}
      <div className="flex items-center justify-between glass-card p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Crown className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">You</p>
            <p className="text-[10px] text-muted-foreground">{playerColor === 'w' ? 'White' : 'Black'}</p>
          </div>
        </div>
        {timeControl.minutes > 0 && (
          <div className={`px-3 py-1.5 rounded-lg font-mono text-sm font-bold ${
            isPlayerTurn && !gameOver
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
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                playerWon ? 'bg-primary/20' : 'bg-secondary'
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
                {playerWon ? 'Victory!' : result === 'Draw' ? 'Draw' : 'Defeat'}
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

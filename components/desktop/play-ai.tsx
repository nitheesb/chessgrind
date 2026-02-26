'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Chess } from 'chess.js'
import { Chessboard } from '@/components/chess/chessboard'
import { useGame } from '@/lib/game-context'
import { useSettings } from '@/lib/settings-context'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import {
  Swords,
  RotateCcw,
  Flag,
  Clock,
  Trophy,
  Cpu,
  User,
  ChevronLeft,
  Zap,
} from 'lucide-react'

interface DesktopPlayAIProps {
  onNavigate: (page: string) => void
}

type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'master'

const DIFFICULTY_CONFIG: Record<Difficulty, { name: string; depth: number; description: string; color: string }> = {
  beginner: { name: 'Beginner', depth: 1, description: 'Perfect for learning', color: 'emerald' },
  intermediate: { name: 'Intermediate', depth: 2, description: 'A fair challenge', color: 'blue' },
  advanced: { name: 'Advanced', depth: 3, description: 'For experienced players', color: 'purple' },
  master: { name: 'Master', depth: 4, description: 'The ultimate test', color: 'red' },
}

export function DesktopPlayAI({ onNavigate }: DesktopPlayAIProps) {
  const { addXP } = useGame()
  const { settings } = useSettings()
  const { playSound, triggerHaptic } = useSoundAndHaptics()
  const [gameStarted, setGameStarted] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate')
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white')
  const [game, setGame] = useState(() => new Chess())
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'draw'>('playing')
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [thinking, setThinking] = useState(false)
  const [timer, setTimer] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (gameStarted && gameStatus === 'playing') {
      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [gameStarted, gameStatus])

  const makeAIMove = useCallback((currentGame: Chess) => {
    if (currentGame.isGameOver()) return

    setThinking(true)
    
    setTimeout(() => {
      const moves = currentGame.moves({ verbose: true })
      if (moves.length === 0) return

      // Simple evaluation-based AI
      const depth = DIFFICULTY_CONFIG[difficulty].depth
      let bestMove = moves[0]
      
      if (depth === 1) {
        // Random move for beginner
        bestMove = moves[Math.floor(Math.random() * moves.length)]
      } else {
        // Prioritize captures and checks
        const captures = moves.filter(m => m.captured)
        const checks = moves.filter(m => {
          const testGame = new Chess(currentGame.fen())
          testGame.move(m)
          return testGame.inCheck()
        })
        
        if (checks.length > 0 && Math.random() > 0.3) {
          bestMove = checks[Math.floor(Math.random() * checks.length)]
        } else if (captures.length > 0 && Math.random() > 0.4) {
          bestMove = captures[Math.floor(Math.random() * captures.length)]
        } else {
          // Center control preference
          const centerMoves = moves.filter(m => 
            ['d4', 'd5', 'e4', 'e5', 'c4', 'c5', 'f4', 'f5'].includes(m.to)
          )
          if (centerMoves.length > 0 && Math.random() > 0.5) {
            bestMove = centerMoves[Math.floor(Math.random() * centerMoves.length)]
          } else {
            bestMove = moves[Math.floor(Math.random() * moves.length)]
          }
        }
      }

      const newGame = new Chess(currentGame.fen())
      const move = newGame.move(bestMove)
      
      if (move) {
        setGame(newGame)
        setLastMove({ from: move.from, to: move.to })
        setMoveHistory(prev => [...prev, move.san])
        playSound(move.captured ? 'capture' : 'move')
        
        if (newGame.isGameOver()) {
          if (timerRef.current) clearInterval(timerRef.current)
          if (newGame.isCheckmate()) {
            setGameStatus('lost')
            playSound('fail')
          } else {
            setGameStatus('draw')
          }
        }
      }
      setThinking(false)
    }, 500 + Math.random() * 500)
  }, [difficulty, playSound])

  const handleMove = useCallback((from: string, to: string): boolean => {
    if (gameStatus !== 'playing' || thinking) return false
    if ((playerColor === 'white' && game.turn() !== 'w') ||
        (playerColor === 'black' && game.turn() !== 'b')) return false

    try {
      const newGame = new Chess(game.fen())
      const move = newGame.move({ from, to, promotion: 'q' })
      
      if (move) {
        setGame(newGame)
        setLastMove({ from, to })
        setMoveHistory(prev => [...prev, move.san])
        playSound(move.captured ? 'capture' : 'move')
        triggerHaptic('medium')
        
        if (newGame.isGameOver()) {
          if (timerRef.current) clearInterval(timerRef.current)
          if (newGame.isCheckmate()) {
            setGameStatus('won')
            playSound('success')
            triggerHaptic('success')
            addXP(50 * (Object.keys(DIFFICULTY_CONFIG).indexOf(difficulty) + 1))
          } else {
            setGameStatus('draw')
          }
        } else {
          setTimeout(() => makeAIMove(newGame), 300)
        }
        return true
      }
    } catch {}
    return false
  }, [game, gameStatus, thinking, playerColor, difficulty, playSound, triggerHaptic, addXP, makeAIMove])

  const startGame = useCallback(() => {
    playSound('click')
    setGameStarted(true)
    setGame(new Chess())
    setGameStatus('playing')
    setLastMove(null)
    setMoveHistory([])
    setTimer(0)
    
    if (playerColor === 'black') {
      setTimeout(() => makeAIMove(new Chess()), 500)
    }
  }, [playerColor, playSound, makeAIMove])

  const resetGame = useCallback(() => {
    playSound('click')
    setGameStarted(false)
    setGame(new Chess())
    setGameStatus('playing')
    setLastMove(null)
    setMoveHistory([])
    setTimer(0)
    setThinking(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [playSound])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!gameStarted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-8 max-w-4xl mx-auto"
      >
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/30">
            <Swords className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">Play vs AI</h1>
          <p className="text-lg text-muted-foreground">Test your skills against the computer</p>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4 text-center">Select Difficulty</h2>
          <div className="grid grid-cols-4 gap-4">
            {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG[Difficulty]][]).map(([key, config]) => (
              <motion.button
                key={key}
                onClick={() => {
                  playSound('click')
                  setDifficulty(key)
                }}
                className={`p-5 rounded-2xl border-2 transition-all ${
                  difficulty === key
                    ? `border-${config.color}-500 bg-${config.color}-500/10`
                    : 'border-border hover:border-border/80 bg-card'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Cpu className={`w-8 h-8 mb-3 mx-auto ${difficulty === key ? `text-${config.color}-500` : 'text-muted-foreground'}`} />
                <h3 className="font-semibold text-foreground mb-1">{config.name}</h3>
                <p className="text-xs text-muted-foreground">{config.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-foreground mb-4 text-center">Choose Your Side</h2>
          <div className="flex justify-center gap-4">
            {(['white', 'black'] as const).map((color) => (
              <motion.button
                key={color}
                onClick={() => {
                  playSound('click')
                  setPlayerColor(color)
                }}
                className={`px-8 py-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                  playerColor === color
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-border/80'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className={`w-6 h-6 rounded-full ${color === 'white' ? 'bg-white border-2 border-gray-300' : 'bg-gray-800'}`} />
                <span className="font-semibold text-foreground capitalize">{color}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <motion.button
            onClick={startGame}
            className="px-12 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold text-lg shadow-xl shadow-primary/30"
            whileHover={{ scale: 1.05, boxShadow: '0 25px 50px -12px rgba(var(--primary), 0.4)' }}
            whileTap={{ scale: 0.95 }}
          >
            Start Game
          </motion.button>
        </div>
      </motion.div>
    )
  }

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
            onClick={resetGame}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            New Game
          </button>

          {/* Players */}
          <div className="glass-card p-5 space-y-4">
            <div className={`flex items-center gap-3 p-3 rounded-xl ${
              game.turn() === (playerColor === 'white' ? 'b' : 'w') ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/50'
            }`}>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{DIFFICULTY_CONFIG[difficulty].name} AI</p>
                <p className="text-xs text-muted-foreground capitalize">{playerColor === 'white' ? 'Black' : 'White'}</p>
              </div>
              {thinking && (
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </div>
            
            <div className={`flex items-center gap-3 p-3 rounded-xl ${
              game.turn() === (playerColor === 'white' ? 'w' : 'b') ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/50'
            }`}>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">You</p>
                <p className="text-xs text-muted-foreground capitalize">{playerColor}</p>
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Time</span>
              </div>
              <span className="text-2xl font-mono font-bold text-foreground">{formatTime(timer)}</span>
            </div>
          </div>

          {/* Move History */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Move History</h3>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {moveHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No moves yet</p>
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  {moveHistory.map((move, i) => (
                    <div key={i} className={`text-sm px-2 py-1 rounded ${
                      i % 2 === 0 ? 'bg-secondary/50' : ''
                    }`}>
                      {i % 2 === 0 && <span className="text-muted-foreground">{Math.floor(i/2) + 1}.</span>} {move}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <motion.button
              onClick={resetGame}
              className="flex-1 py-3 rounded-xl bg-secondary text-muted-foreground font-medium flex items-center justify-center gap-2 hover:bg-secondary/80"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </motion.button>
            <motion.button
              onClick={() => {
                playSound('click')
                setGameStatus('lost')
                if (timerRef.current) clearInterval(timerRef.current)
              }}
              className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-500 font-medium flex items-center justify-center gap-2 hover:bg-red-500/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Flag className="w-5 h-5" />
              Resign
            </motion.button>
          </div>
        </motion.div>

        {/* Center - Board */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-2"
        >
          <div className="glass-card p-6">
            {/* Game Status */}
            {gameStatus !== 'playing' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 p-4 rounded-xl text-center font-semibold ${
                  gameStatus === 'won' 
                    ? 'bg-emerald-500/10 text-emerald-500' 
                    : gameStatus === 'lost'
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-amber-500/10 text-amber-500'
                }`}
              >
                {gameStatus === 'won' && (
                  <span className="flex items-center justify-center gap-2">
                    <Trophy className="w-5 h-5" /> Victory! You won the game!
                  </span>
                )}
                {gameStatus === 'lost' && 'Game Over - AI Wins'}
                {gameStatus === 'draw' && 'Game Drawn'}
              </motion.div>
            )}

            {/* Board */}
            <div className="flex justify-center">
              <Chessboard
                fen={game.fen()}
                onMove={handleMove}
                orientation={playerColor}
                interactive={gameStatus === 'playing' && !thinking}
                size={560}
                highlightSquares={lastMove ? [lastMove.from, lastMove.to] : []}
                boardStyle={settings.boardStyle}
                pieceStyle={settings.pieceStyle}
              />
            </div>

            {/* Reward info */}
            {gameStatus === 'won' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-semibold">
                  <Zap className="w-5 h-5" />
                  +{50 * (Object.keys(DIFFICULTY_CONFIG).indexOf(difficulty) + 1)} XP earned!
                </div>
              </motion.div>
            )}

            {gameStatus !== 'playing' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex gap-4 justify-center"
              >
                <motion.button
                  onClick={resetGame}
                  className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold shadow-lg shadow-primary/25"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Play Again
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

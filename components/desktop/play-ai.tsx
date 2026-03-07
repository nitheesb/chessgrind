'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Chess } from 'chess.js'
import { Chessboard, CapturedPieces } from '@/components/chess/chessboard'
import { EvalBar } from '@/components/chess/eval-bar'
import { useGame } from '@/lib/game-context'
import { useSettings } from '@/lib/settings-context'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import { getBestMove, getEngineConfig } from '@/lib/chess-engine'
import {
  Swords,
  RotateCcw,
  Flag,
  Clock,
  Trophy,
  Cpu,
  User,
  ChevronLeft,
  ChevronRight,
  Zap,
  Volume2,
  VolumeX,
  Minus,
  Plus,
} from 'lucide-react'



interface DesktopPlayAIProps {
  onNavigate: (page: string) => void
}

type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'master'

const DIFFICULTY_CONFIG: Record<Difficulty, { name: string; depth: number; description: string; color: string }> = {
  beginner: { name: 'Beginner', depth: 1, description: 'Perfect for learning', color: 'amber' },
  intermediate: { name: 'Intermediate', depth: 3, description: 'A fair challenge', color: 'blue' },
  advanced: { name: 'Advanced', depth: 5, description: 'For experienced players', color: 'purple' },
  master: { name: 'Master', depth: 6, description: 'The ultimate test', color: 'red' },
}

const COLOR_CLASSES: Record<string, { border: string; bg: string; text: string; activeStyle: string }> = {
  amber: { border: 'border-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-500', activeStyle: 'shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50' },
  blue: { border: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-500', activeStyle: 'shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/50' },
  purple: { border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-500', activeStyle: 'shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/50' },
  red: { border: 'border-red-500', bg: 'bg-red-500/10', text: 'text-red-500', activeStyle: 'shadow-[0_0_20px_rgba(239,68,68,0.15)] ring-1 ring-red-500/50' },
}

export function DesktopPlayAI({ onNavigate }: DesktopPlayAIProps) {
  const { addXP } = useGame()
  const { settings, updateSetting } = useSettings()
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
  const [boardSize, setBoardSize] = useState(520)
  const updateBoardSize = (delta: number) => {
    setBoardSize(prev => Math.min(Math.max(prev + delta, 360), 600))
  }
  const [premove, setPremove] = useState<{ from: string; to: string; promotion?: string } | null>(null)
  const [notationView, setNotationView] = useState<'list' | 'condensed'>('list')
  const [copiedPGN, setCopiedPGN] = useState(false)
  const notationRef = useRef<HTMLDivElement>(null)
  const isPlayerTurn = game.turn() === (playerColor === 'white' ? 'w' : 'b')

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
      const config = getEngineConfig(DIFFICULTY_CONFIG[difficulty].depth)
      const bestMove = getBestMove(currentGame, config)

      if (bestMove) {
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
      }
      setThinking(false)
    }, 300 + Math.random() * 400)
  }, [difficulty, playSound])

  const handleMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    if (gameStatus !== 'playing' || thinking) return false
    // Store as premove when it's AI's turn
    if (!isPlayerTurn) {
      setPremove({ from, to, promotion })
      return true
    }

    try {
      const newGame = new Chess(game.fen())
      const move = newGame.move({ from, to, promotion: promotion || 'q' })

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
    } catch { }
    return false
  }, [game, gameStatus, thinking, isPlayerTurn, difficulty, playSound, triggerHaptic, addXP, makeAIMove])

  // Execute premove when it becomes the player's turn
  useEffect(() => {
    if (isPlayerTurn && premove && gameStatus === 'playing') {
      const { from, to, promotion } = premove
      setPremove(null)
      try {
        const newGame = new Chess(game.fen())
        const move = newGame.move({ from, to, promotion: promotion || 'q' })
        if (!move) return
        setGame(newGame)
        setLastMove({ from, to })
        setMoveHistory(prev => [...prev, move.san])
        playSound(move.captured ? 'capture' : 'move')
        if (newGame.isGameOver()) {
          if (timerRef.current) clearInterval(timerRef.current)
          if (newGame.isCheckmate()) {
            setGameStatus('won')
            addXP(50 * (Object.keys(DIFFICULTY_CONFIG).indexOf(difficulty) + 1))
          } else {
            setGameStatus('draw')
          }
        } else {
          setTimeout(() => makeAIMove(newGame), 300)
        }
      } catch { /* illegal premove — discard */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayerTurn])

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
    setPremove(null)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [playSound])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const generatePGN = useCallback(() => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '.')
    const pgnResult = gameStatus === 'draw' ? '1/2-1/2' :
      gameStatus === 'won' ? (playerColor === 'white' ? '1-0' : '0-1') :
      gameStatus === 'lost' ? (playerColor === 'white' ? '0-1' : '1-0') : '*'
    const whitePlayer = playerColor === 'white' ? 'You' : `${DIFFICULTY_CONFIG[difficulty].name} AI`
    const blackPlayer = playerColor === 'black' ? 'You' : `${DIFFICULTY_CONFIG[difficulty].name} AI`
    const headers = [
      '[Event "ChessVault Game"]',
      `[Date "${date}"]`,
      `[White "${whitePlayer}"]`,
      `[Black "${blackPlayer}"]`,
      `[Result "${pgnResult}"]`,
    ].join('\n')
    const movePairs = Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => {
      const w = moveHistory[i * 2] || ''
      const b = moveHistory[i * 2 + 1] ? ' ' + moveHistory[i * 2 + 1] : ''
      return `${i + 1}. ${w}${b}`
    })
    return `${headers}\n\n${movePairs.join(' ')} ${pgnResult}`
  }, [gameStatus, playerColor, difficulty, moveHistory])

  // Auto-scroll notation to latest move
  useEffect(() => {
    if (notationRef.current) {
      notationRef.current.scrollTop = notationRef.current.scrollHeight
    }
  }, [moveHistory.length])

  if (!gameStarted) {
    return (
      <div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-8 max-w-4xl mx-auto"
      >
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mx-auto mb-6">
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
                className={`p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group ${difficulty === key
                  ? `${COLOR_CLASSES[config.color].border} ${COLOR_CLASSES[config.color].bg} ${COLOR_CLASSES[config.color].activeStyle}`
                  : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20'
                  }`}
              >
                {/* Subtle gradient hover block */}
                {difficulty !== key && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.03] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                )}
                <Cpu className={`w-8 h-8 mb-4 mx-auto relative z-10 transition-colors ${difficulty === key ? COLOR_CLASSES[config.color].text : 'text-muted-foreground group-hover:text-foreground'}`} />
                <h3 className="font-semibold text-foreground mb-1.5 relative z-10 tracking-wide">{config.name}</h3>
                <p className="text-xs text-muted-foreground relative z-10">{config.description}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-foreground mb-4 text-center">Choose Your Side</h2>
          <div className="flex justify-center gap-4">
            {(['white', 'black', 'random'] as const).map((color) => (
              <motion.button
                key={color}
                onClick={() => {
                  playSound('click')
                  setPlayerColor(color === 'random' ? (Math.random() < 0.5 ? 'white' : 'black') : color)
                }}
                className={`px-8 py-4 rounded-2xl border transition-all duration-300 flex items-center gap-3 relative overflow-hidden group ${playerColor === color || (color !== 'random' && playerColor === color)
                  ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-primary/50'
                  : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20'
                  }`}
              >
                {/* Subtle gradient hover block */}
                {!(playerColor === color || (color !== 'random' && playerColor === color)) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.03] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                )}
                <span className={`w-6 h-6 rounded-full relative z-10 shadow-inner ${color === 'white' ? 'bg-white border text-black' :
                  color === 'black' ? 'bg-zinc-900 border border-white/20' :
                    'bg-gradient-to-br from-white to-zinc-900 border border-white/20'
                  }`} />
                <span className="font-semibold text-foreground capitalize relative z-10 tracking-wide">{color}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center mt-6">
          <motion.button
            onClick={startGame}
            className="px-14 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <span className="relative z-10 flex items-center justify-center gap-2">Start Game <ChevronRight className="w-5 h-5" /></span>
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-3 gap-8">
        {/* Left Panel */}
        <div
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
            <div className={`flex items-center gap-3 p-3 rounded-xl ${game.turn() === (playerColor === 'white' ? 'b' : 'w') ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/50'
              }`}>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{DIFFICULTY_CONFIG[difficulty].name} AI</p>
                <CapturedPieces fen={game.fen()} color={playerColor === 'white' ? 'b' : 'w'} pieceSize={14} />
              </div>
              {thinking && (
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </div>

            <div className={`flex items-center gap-3 p-3 rounded-xl ${game.turn() === (playerColor === 'white' ? 'w' : 'b') ? 'bg-primary/10 border border-primary/30' : 'bg-secondary/50'
              }`}>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">You</p>
                <CapturedPieces fen={game.fen()} color={playerColor === 'white' ? 'w' : 'b'} pieceSize={14} />
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
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Move History</h3>
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
            <div ref={notationRef} className="max-h-48 overflow-y-auto scrollbar-hide">
              {moveHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No moves yet</p>
              ) : notationView === 'list' ? (
                <div className="space-y-0.5 font-mono text-sm">
                  {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => {
                    const isLastPair = i === Math.ceil(moveHistory.length / 2) - 1
                    return (
                      <div key={i} className={`flex gap-2 px-2 py-0.5 rounded ${isLastPair ? 'bg-primary/10' : i % 2 === 0 ? 'bg-secondary/30' : ''}`}>
                        <span className="text-muted-foreground w-6 text-right">{i + 1}.</span>
                        <span className={`w-16 ${isLastPair && moveHistory.length % 2 !== 0 ? 'text-primary font-bold' : 'text-foreground'}`}>{moveHistory[i * 2]}</span>
                        <span className={`w-16 ${isLastPair && moveHistory.length % 2 === 0 ? 'text-primary font-bold' : 'text-foreground/70'}`}>{moveHistory[i * 2 + 1] || ''}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-x-1 gap-y-0.5 font-mono text-sm">
                  {moveHistory.map((move, idx) => {
                    const isLast = idx === moveHistory.length - 1
                    return (
                      <span key={idx} className="inline-flex items-center gap-0.5">
                        {idx % 2 === 0 && (
                          <span className="text-muted-foreground">{Math.floor(idx / 2) + 1}.</span>
                        )}
                        <span className={isLast ? 'text-primary font-bold' : 'text-foreground'}>{move}</span>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <motion.button
              onClick={resetGame}
              className="flex-1 py-3 rounded-xl bg-secondary text-muted-foreground font-medium flex items-center justify-center gap-2 hover:bg-secondary/80"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </motion.button>
            <motion.button
              onClick={() => {
                if (!window.confirm('Are you sure you want to resign?')) return
                playSound('click')
                setGameStatus('lost')
                if (timerRef.current) clearInterval(timerRef.current)
              }}
              className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-500 font-medium flex items-center justify-center gap-2 hover:bg-red-500/20"
            >
              <Flag className="w-5 h-5" />
              Resign
            </motion.button>
          </div>
        </div>

        {/* Center - Board */}
        <div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-2"
        >
          <div className="glass-card p-6">
            {/* Game Status */}
            {gameStatus !== 'playing' && (
              <div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 p-4 rounded-xl text-center font-semibold ${gameStatus === 'won'
                  ? 'bg-amber-500/10 text-amber-500'
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
              </div>
            )}

            {/* Board with EvalBar */}
            <div className="flex justify-center items-stretch gap-3">
              <EvalBar game={game} size={boardSize} thickness={20} vertical />
              <div>
                <Chessboard
                  fen={game.fen()}
                  onMove={handleMove}
                  orientation={playerColor}
                  interactive={gameStatus === 'playing' && !thinking}
                  size={boardSize}
                  highlightSquares={lastMove ? [lastMove.from, lastMove.to] : []}
                  arrows={premove ? [{ from: premove.from, to: premove.to, color: 'orange' }] : []}
                  isCheck={game.isCheck()}
                  boardStyle={settings.boardStyle}
                  pieceStyle={settings.pieceStyle}
                  allowArrowDrawing
                />
              </div>
            </div>

            {/* Board controls */}
            <div className="flex items-center justify-center gap-2 mt-3">
              <button
                onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                className="px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground hover:bg-secondary/80 transition-colors text-xs flex items-center gap-1.5"
                title={settings.soundEnabled ? 'Mute' : 'Unmute'}
              >
                {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button onClick={() => updateBoardSize(-20)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                <Minus className="w-3 h-3 text-muted-foreground" />
              </button>
              <span className="text-[11px] text-muted-foreground font-mono w-16 text-center">{boardSize}px</span>
              <button onClick={() => updateBoardSize(20)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
                <Plus className="w-3 h-3 text-muted-foreground" />
              </button>
              {premove && (
                <span className="text-[11px] text-orange-400 font-medium ml-2">Premove set</span>
              )}
            </div>

            {/* Reward info */}
            {gameStatus === 'won' && (
              <div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-center"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-semibold">
                  <Zap className="w-5 h-5" />
                  +{50 * (Object.keys(DIFFICULTY_CONFIG).indexOf(difficulty) + 1)} XP earned!
                </div>
              </div>
            )}

            {gameStatus !== 'playing' && (
              <div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex flex-col items-center gap-3"
              >
                <div className="flex gap-4 justify-center">
                  <motion.button
                    onClick={resetGame}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold"
                  >
                    Play Again
                  </motion.button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const pgn = generatePGN()
                      const blob = new Blob([pgn], { type: 'text/plain' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `chessvault-game-${Date.now()}.pgn`
                      a.click()
                      URL.revokeObjectURL(url)
                    }}
                    className="px-4 py-2 rounded-lg bg-secondary text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
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
                    className="px-4 py-2 rounded-lg bg-secondary text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
                  >
                    {copiedPGN ? '✓ Copied!' : '⎘ Copy PGN'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

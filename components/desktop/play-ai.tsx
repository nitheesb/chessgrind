'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Chess } from 'chess.js'
import { Chessboard, CapturedPieces } from '@/components/chess/chessboard'
import { EvalBar } from '@/components/chess/eval-bar'
import { CoachPanel, BlunderCheckNudge, type CoachArrow } from '@/components/chess/coach-panel'
import { useGame } from '@/lib/game-context'
import { useSettings } from '@/lib/settings-context'
import type { CoachMode } from '@/lib/settings-context'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import { getEngineConfig } from '@/lib/chess-engine'
import { getBestMoveAsync, analyzePositionAsync } from '@/lib/chess-worker-client'
import { detectOpening } from '@/lib/opening-detection'
import { analyzeMoveQualities, getQualityColor } from '@/lib/move-quality'
import { GameReview } from '@/components/chess/game-review'
import { formatTime } from '@/lib/utils'
import {
  Swords,
  RotateCcw,
  Flag,
  Clock,
  Trophy,
  User,
  ChevronLeft,
  ChevronRight,
  Zap,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Copy,
  BookOpen,
  BarChart3,
  TrendingUp,
} from 'lucide-react'



interface DesktopPlayAIProps {
  onNavigate: (page: string) => void
}

type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'master'

import { TIME_CONTROLS } from '@/lib/chess-constants'

const DIFFICULTY_CONFIG: Record<Difficulty, { name: string; depth: number; description: string; color: string; useStockfish: boolean; stockfishSkill?: number; botName: string; botEmoji: string; botStyle: string; rating: number }> = {
  beginner: { name: 'Beginner', depth: 1, description: 'Perfect for learning', color: 'amber', useStockfish: false, botName: 'Pawny', botEmoji: '🐣', botStyle: 'Random and unpredictable', rating: 400 },
  intermediate: { name: 'Intermediate', depth: 3, description: 'A fair challenge', color: 'blue', useStockfish: false, botName: 'Chester', botEmoji: '🎩', botStyle: 'Solid openings, shaky endgames', rating: 800 },
  advanced: { name: 'Advanced', depth: 5, description: 'Stockfish engine', color: 'purple', useStockfish: true, stockfishSkill: 13, botName: 'Magnus Jr.', botEmoji: '🎯', botStyle: 'Positional and precise', rating: 1500 },
  master: { name: 'Master', depth: 6, description: 'Full Stockfish 18', color: 'red', useStockfish: true, stockfishSkill: 20, botName: 'The Machine', botEmoji: '🤖', botStyle: 'Perfect play', rating: 2800 },
}

const COLOR_CLASSES: Record<string, { border: string; bg: string; text: string; activeStyle: string }> = {
  amber: { border: 'border-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-500', activeStyle: 'shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50' },
  blue: { border: 'border-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-500', activeStyle: 'shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/50' },
  purple: { border: 'border-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-500', activeStyle: 'shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/50' },
  red: { border: 'border-red-500', bg: 'bg-red-500/10', text: 'text-red-500', activeStyle: 'shadow-[0_0_20px_rgba(239,68,68,0.15)] ring-1 ring-red-500/50' },
}

export function DesktopPlayAI({ onNavigate }: DesktopPlayAIProps) {
  const { addXP, addRecentGame, updateGameRating, profile } = useGame()
  const { settings, updateSetting } = useSettings()
  const { playSound, triggerHaptic } = useSoundAndHaptics()
  const [gameStarted, setGameStarted] = useState(false)
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate')
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white')
  const [timeControl, setTimeControl] = useState<TimeControl>(TIME_CONTROLS[0])
  const [game, setGame] = useState(() => new Chess())
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'draw'>('playing')
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [thinking, setThinking] = useState(false)
  const [timer, setTimer] = useState(0)
  const [whiteTime, setWhiteTime] = useState(0)
  const [blackTime, setBlackTime] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [boardSize, setBoardSize] = useState(700)

  useEffect(() => {
    const update = () => {
      const val = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--lm-board-size'), 10)
      if (val > 0) setBoardSize(val)
    }
    update()
    // ResizeObserver on root to catch layout manager updates
    const ro = new ResizeObserver(update)
    ro.observe(document.documentElement)
    return () => ro.disconnect()
  }, [])

  const [premove, setPremove] = useState<{ from: string; to: string; promotion?: string } | null>(null)
  const [notationView, setNotationView] = useState<'list' | 'condensed'>('list')
  const [copiedPGN, setCopiedPGN] = useState(false)
  const [copiedFEN, setCopiedFEN] = useState(false)
  const [showGameReview, setShowGameReview] = useState(false)
  const [lastRatingChange, setLastRatingChange] = useState<number | null>(null)
  const notationRef = useRef<HTMLDivElement>(null)
  const isPlayerTurn = game.turn() === (playerColor === 'white' ? 'w' : 'b')
  const [lastMoveIsPlayer, setLastMoveIsPlayer] = useState(false)

  // Coach mode state
  const [coachArrows, setCoachArrows] = useState<CoachArrow[]>([])
  const [blunderCheck, setBlunderCheck] = useState<{ show: boolean; message: string; pendingMove: { from: string; to: string; promotion?: string } | null }>({
    show: false, message: '', pendingMove: null,
  })

  // Opening detection
  const currentOpening = useMemo(() => detectOpening(moveHistory), [moveHistory])

  // Real-time analysis
  const [analysis, setAnalysis] = useState<{ eval: number; bestLine: string[]; isMate: boolean; mateIn: number | null } | null>(null)

  // Run analysis after each move (debounced to avoid blocking the main thread)
  useEffect(() => {
    if (!gameStarted || gameStatus !== 'playing' || moveHistory.length === 0) {
      setAnalysis(null)
      return
    }
    const tid = setTimeout(() => {
      analyzePositionAsync(game.fen(), 4).then(result => {
        setAnalysis(result)
      })
    }, 50)
    return () => clearTimeout(tid)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moveHistory.length, gameStarted, gameStatus])

  // Move quality annotations
  const moveQualities = useMemo(() => {
    if (gameStatus === 'playing' || moveHistory.length === 0) return []
    return analyzeMoveQualities(moveHistory)
  }, [gameStatus, moveHistory])

  // Timer logic — countdown for timed games, count-up for unlimited
  useEffect(() => {
    if (!gameStarted || gameStatus !== 'playing') return
    if (timeControl.minutes === 0) {
      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000)
    } else {
      timerRef.current = setInterval(() => {
        const isWhiteTurn = game.turn() === 'w'
        if (isWhiteTurn) {
          setWhiteTime(prev => {
            if (prev <= 1) { handleGameEnd('lost'); return 0 }
            return prev - 1
          })
        } else {
          setBlackTime(prev => {
            if (prev <= 1) { handleGameEnd('won'); return 0 }
            return prev - 1
          })
        }
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [gameStarted, gameStatus, timeControl.minutes, game.turn()])

  const handleGameEnd = useCallback((result: 'won' | 'lost' | 'draw') => {
    if (timerRef.current) clearInterval(timerRef.current)
    setGameStatus(result)
    const gameResult = result === 'won' ? 'win' as const : result === 'lost' ? 'loss' as const : 'draw' as const
    const opponentRating = DIFFICULTY_CONFIG[difficulty].rating

    // Update game rating
    updateGameRating(opponentRating, gameResult)

    // Calculate rating change for display
    const K = 32
    const expected = 1 / (1 + Math.pow(10, (opponentRating - profile.rating) / 400))
    const actual = gameResult === 'win' ? 1 : gameResult === 'draw' ? 0.5 : 0
    const ratingChange = Math.round(K * (actual - expected))
    setLastRatingChange(ratingChange)

    // Record game
    addRecentGame({
      id: `game-${Date.now()}`,
      date: new Date().toISOString(),
      result: gameResult,
      opponent: DIFFICULTY_CONFIG[difficulty].botName,
      moves: moveHistory.length,
      ratingChange,
    })

    if (result === 'won') {
      playSound('success')
      triggerHaptic('success')
      addXP(50 * (Object.keys(DIFFICULTY_CONFIG).indexOf(difficulty) + 1))
    } else if (result === 'lost') {
      playSound('fail')
    }
  }, [playSound, triggerHaptic, addXP, difficulty, addRecentGame, updateGameRating, profile.rating, moveHistory.length])

  const [fallbackNotice, setFallbackNotice] = useState(false)

  const makeAIMove = useCallback((currentGame: Chess) => {
    if (currentGame.isGameOver()) return

    setThinking(true)

    // Scale artificial delay with difficulty - easy levels respond faster
    const depthVal = DIFFICULTY_CONFIG[difficulty].depth
    const delay = depthVal <= 2 ? 100 + Math.random() * 200 : 300 + Math.random() * 400
    const config = getEngineConfig(depthVal, DIFFICULTY_CONFIG[difficulty].useStockfish, DIFFICULTY_CONFIG[difficulty].stockfishSkill)
    const fen = currentGame.fen()

    setTimeout(async () => {
      let bestMove = await getBestMoveAsync(fen, config)

      // Retry once if Stockfish returned null
      if (!bestMove && config.useStockfish) {
        console.warn('[play-ai] Stockfish returned null, retrying...')
        bestMove = await getBestMoveAsync(fen, config)
      }

      // Fallback to custom engine if still null
      if (!bestMove && config.useStockfish) {
        console.warn('[play-ai] Stockfish retry failed, falling back to custom engine')
        const fallbackConfig = getEngineConfig(3, false)
        bestMove = await getBestMoveAsync(fen, fallbackConfig)
        setFallbackNotice(true)
        setTimeout(() => setFallbackNotice(false), 3000)
      }

      if (bestMove) {
        const newGame = new Chess(fen)
        const move = newGame.move(bestMove)

        if (move) {
          setLastMoveIsPlayer(false)
          setGame(newGame)
          setLastMove({ from: move.from, to: move.to })
          setMoveHistory(prev => [...prev, move.san])
          playSound(move.captured ? 'capture' : 'move')
          if (timeControl.increment > 0) {
            setBlackTime(prev => prev + timeControl.increment)
          }

          if (newGame.isGameOver()) {
            handleGameEnd(newGame.isCheckmate() ? 'lost' : 'draw')
          }
        }
      }
      setThinking(false)
    }, delay)
  }, [difficulty, playSound, timeControl.increment, handleGameEnd])

  const executeMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    try {
      const newGame = new Chess(game.fen())
      const move = newGame.move({ from, to, promotion: promotion || 'q' })

      if (move) {
        setLastMoveIsPlayer(true)
        setCoachArrows([])
        setGame(newGame)
        setLastMove({ from, to })
        setMoveHistory(prev => [...prev, move.san])
        playSound(move.captured ? 'capture' : 'move')
        triggerHaptic('medium')
        if (timeControl.increment > 0) {
          setWhiteTime(prev => prev + timeControl.increment)
        }

        if (newGame.isGameOver()) {
          handleGameEnd(newGame.isCheckmate() ? 'won' : 'draw')
        } else {
          setTimeout(() => makeAIMove(newGame), 300)
        }
        return true
      }
    } catch { }
    return false
  }, [game, playSound, triggerHaptic, makeAIMove, timeControl.increment, handleGameEnd])

  const handleMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    if (gameStatus !== 'playing' || thinking) return false
    // Store as premove when it's AI's turn
    if (!isPlayerTurn) {
      setPremove({ from, to, promotion })
      return true
    }

    // Blunder check
    if (settings.blunderCheck && settings.coachMode !== 'off') {
      const gameCopy = new Chess(game.fen())
      try {
        const move = gameCopy.move({ from, to, promotion: promotion || 'q' })
        if (!move) return false

        analyzePositionAsync(game.fen(), 10, true).then(before => {
          analyzePositionAsync(gameCopy.fen(), 10, true).then(after => {
            const isWhite = game.turn() === 'w'
            const beforeEval = isWhite ? before.eval : -before.eval
            const afterEval = isWhite ? -after.eval : after.eval
            const evalDrop = beforeEval - afterEval

            if (evalDrop >= 1.5) {
              setBlunderCheck({
                show: true,
                message: evalDrop >= 3 ? 'Are you sure? This loses significant material.' :
                  'Are you sure? This loses the exchange.',
                pendingMove: { from, to, promotion },
              })
            } else {
              executeMove(from, to, promotion)
            }
          })
        })
        return true
      } catch {
        return false
      }
    }

    return executeMove(from, to, promotion)
  }, [game, gameStatus, thinking, isPlayerTurn, settings.blunderCheck, settings.coachMode, executeMove])

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
          handleGameEnd(newGame.isCheckmate() ? 'won' : 'draw')
        } else {
          setTimeout(() => makeAIMove(newGame), 300)
        }
      } catch { /* illegal premove — discard */ }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayerTurn])

  const startGame = useCallback(() => {
    playSound('gamestart')
    setGameStarted(true)
    setGame(new Chess())
    setGameStatus('playing')
    setLastMove(null)
    setMoveHistory([])
    setTimer(0)
    setWhiteTime(timeControl.minutes * 60)
    setBlackTime(timeControl.minutes * 60)
    setAnalysis(null)

    if (playerColor === 'black') {
      setTimeout(() => makeAIMove(new Chess()), 500)
    }
  }, [playerColor, playSound, makeAIMove, timeControl.minutes])

  const resetGame = useCallback(() => {
    playSound('click')
    setGameStarted(false)
    setGame(new Chess())
    setGameStatus('playing')
    setLastMove(null)
    setMoveHistory([])
    setTimer(0)
    setWhiteTime(0)
    setBlackTime(0)
    setThinking(false)
    setPremove(null)
    setAnalysis(null)
    setLastRatingChange(null)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [playSound])

  const generatePGN = useCallback(() => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '.')
    const pgnResult = gameStatus === 'draw' ? '1/2-1/2' :
      gameStatus === 'won' ? (playerColor === 'white' ? '1-0' : '0-1') :
      gameStatus === 'lost' ? (playerColor === 'white' ? '0-1' : '1-0') : '*'
    const whitePlayer = playerColor === 'white' ? 'You' : DIFFICULTY_CONFIG[difficulty].botName
    const blackPlayer = playerColor === 'black' ? 'You' : DIFFICULTY_CONFIG[difficulty].botName
    const headers = [
      '[Event "ChessGrind Game"]',
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

  // Auto-start game on first move from setup screen
  const handleSetupMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    const freshGame = new Chess()
    try {
      const move = freshGame.move({ from, to, promotion: promotion || 'q' })
      if (!move) return false

      // Start the game with current settings
      setGameStarted(true)
      setGame(freshGame)
      setGameStatus('playing')
      setLastMove({ from, to })
      setMoveHistory([move.san])
      setTimer(0)
      setWhiteTime(timeControl.minutes * 60)
      setBlackTime(timeControl.minutes * 60)
      setAnalysis(null)
        playSound(move.captured ? 'capture' : 'move')
      triggerHaptic('medium')

      // Trigger AI response after a short delay
      if (!freshGame.isGameOver()) {
        setTimeout(() => makeAIMove(freshGame), 300)
      }
      return true
    } catch {
      return false
    }
  }, [playSound, triggerHaptic, makeAIMove, timeControl.minutes])

  if (!gameStarted) {
    return (
      <div className="flex h-full overflow-hidden lm-gpu">
        {/* Left: interactive board — make a move to start */}
        <div className="lm-board-panel flex items-center justify-center bg-black/20 border-r border-white/[0.06]">
          <div className="flex flex-col items-center gap-3">
            <div className="lm-board-wrap flex items-center justify-center">
              <Chessboard
                fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                interactive={true}
                onMove={handleSetupMove}
                orientation={playerColor}
                size={boardSize}
                boardStyle={settings.boardStyle}
                pieceStyle={settings.pieceStyle}
              />
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">Make a move to start playing</p>
          </div>
        </div>
        {/* Right: compact setup options */}
        <div className="lm-right-panel flex flex-col">
          <div className="flex-1 overflow-y-auto p-5 max-w-xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#312e2b', border: '1px solid #3d3a37' }}>
                <Swords className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Play vs Computer</h1>
                <p className="text-sm text-muted-foreground">Choose settings or just make a move</p>
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-foreground mb-3 text-center">Select Difficulty</h2>
              <div className="grid grid-cols-4 gap-3">
                {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG[Difficulty]][]).map(([key, config]) => (
                  <motion.button
                    key={key}
                    onClick={() => {
                      playSound('click')
                      setDifficulty(key)
                    }}
                    className={`p-3 rounded-xl border transition-all duration-300 relative overflow-hidden group ${difficulty === key
                      ? `${COLOR_CLASSES[config.color].border} ${COLOR_CLASSES[config.color].bg} ${COLOR_CLASSES[config.color].activeStyle}`
                      : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20'
                      }`}
                  >
                    {difficulty !== key && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.03] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                    )}
                    <span className="text-2xl mb-1 block relative z-10">{config.botEmoji}</span>
                    <h3 className="font-semibold text-foreground mb-0.5 relative z-10 tracking-wide text-sm">{config.botName}</h3>
                    <p className={`text-[11px] mb-1 relative z-10 ${difficulty === key ? COLOR_CLASSES[config.color].text : 'text-muted-foreground'}`}>{config.botStyle}</p>
                    <p className="text-[10px] text-muted-foreground/60 relative z-10">{config.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-foreground mb-3 text-center">Choose Your Side</h2>
              <div className="flex justify-center gap-3">
                {(['white', 'black', 'random'] as const).map((color) => (
                  <motion.button
                    key={color}
                    onClick={() => {
                      playSound('click')
                      setPlayerColor(color === 'random' ? (Math.random() < 0.5 ? 'white' : 'black') : color)
                    }}
                    className={`px-6 py-3 rounded-xl border transition-all duration-300 flex items-center gap-2.5 relative overflow-hidden group ${playerColor === color || (color !== 'random' && playerColor === color)
                      ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-primary/50'
                      : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20'
                      }`}
                  >
                    {!(playerColor === color || (color !== 'random' && playerColor === color)) && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.03] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                    )}
                    <span className={`w-5 h-5 rounded-full relative z-10 shadow-inner ${color === 'white' ? 'bg-white border text-black' :
                      color === 'black' ? 'bg-zinc-900 border border-white/20' :
                        'bg-gradient-to-br from-white to-zinc-900 border border-white/20'
                      }`} />
                    <span className="font-semibold text-foreground capitalize relative z-10 tracking-wide text-sm">{color}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Time Control */}
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-foreground mb-3 text-center">Time Control</h2>
              <div className="flex flex-wrap justify-center gap-2">
                {TIME_CONTROLS.map((tc) => (
                  <motion.button
                    key={tc.label}
                    onClick={() => { playSound('click'); setTimeControl(tc) }}
                    className={`px-4 py-2 rounded-lg border transition-all duration-300 text-sm relative overflow-hidden group ${timeControl.label === tc.label
                      ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-primary/50 text-primary font-semibold'
                      : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20 text-muted-foreground'
                      }`}
                  >
                    <Clock className="w-3.5 h-3.5 inline mr-1" />
                    {tc.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Pinned Play button */}
          <div className="flex-shrink-0 p-5 pt-3 border-t border-white/[0.06] bg-background/80 backdrop-blur-sm">
            <motion.button
              onClick={startGame}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-lg font-bold text-lg text-white transition-all duration-200 relative overflow-hidden"
              style={{
                background: '#81b64c',
                borderBottom: '4px solid #5d8c34',
                boxShadow: '0 4px 12px rgba(129, 182, 76, 0.3)',
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">Play <ChevronRight className="w-5 h-5" /></span>
            </motion.button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden lm-gpu">
      {/* Game Review Modal */}
      {showGameReview && (
        <div className="fixed inset-0 z-[100] bg-background">
          <GameReview
            pgn={generatePGN()}
            playerColor={playerColor === 'white' ? 'w' : 'b'}
            opponent={DIFFICULTY_CONFIG[difficulty].botName}
            onClose={() => setShowGameReview(false)}
          />
        </div>
      )}

      {/* Left: board + eval bar */}
      <div className="lm-board-panel flex items-center justify-center bg-black/20 border-r border-white/[0.06]">
        <div className="flex flex-col items-center gap-3 py-4">
          {/* Game Status Banner */}
          {gameStatus !== 'playing' && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`px-5 py-3 rounded-xl text-center font-semibold ${gameStatus === 'won'
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
            </motion.div>
          )}

          {/* Opening name */}
          {currentOpening && moveHistory.length <= 20 && (
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-primary font-medium">{currentOpening.eco}: {currentOpening.name}</span>
            </div>
          )}

          {/* Board + EvalBar */}
          <div className="flex items-stretch gap-2 lm-gpu">
            <EvalBar game={game} size={boardSize} thickness={18} vertical />
            <div className="lm-board-wrap">
              <Chessboard
                fen={game.fen()}
                onMove={handleMove}
                orientation={playerColor}
                interactive={gameStatus === 'playing' && !thinking}
                size={boardSize}
                highlightSquares={lastMove ? [lastMove.from, lastMove.to] : []}
                arrows={[
                  ...(premove ? [{ from: premove.from, to: premove.to, color: 'orange' }] : []),
                  ...coachArrows.map(a => ({ from: a.from, to: a.to, color: a.color })),
                ]}
                isCheck={game.isCheck()}
                boardStyle={settings.boardStyle}
                pieceStyle={settings.pieceStyle}
                allowArrowDrawing
                blindfoldMode={settings.blindfoldMode}
                isPlayerMove={lastMoveIsPlayer}
              />
            </div>
          </div>

          {/* Board controls: sound, blindfold, copy FEN, premove indicator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
              className="px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground hover:bg-secondary/80 transition-colors text-xs flex items-center gap-1.5"
              title={settings.soundEnabled ? 'Mute' : 'Unmute'}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <div className="w-px h-5 bg-border mx-1" />
            <button
              onClick={() => updateSetting('blindfoldMode', !settings.blindfoldMode)}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${settings.blindfoldMode ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}
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
              className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:bg-secondary/80 transition-colors"
              title="Copy FEN"
            >
              {copiedFEN ? <span className="text-[10px] text-primary">✓</span> : <Copy className="w-3 h-3" />}
            </button>
            {premove && (
              <span className="text-[11px] text-orange-400 font-medium ml-2">Premove set</span>
            )}
          </div>
        </div>
      </div>

      {/* Right: chess.com-style game panel */}
      <div className="lm-right-panel flex flex-col h-full overflow-hidden">
        {/* AI Player Bar (top) */}
        <div className="flex-shrink-0 px-4 pt-4 pb-2">
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            game.turn() === (playerColor === 'white' ? 'b' : 'w') ? 'bg-white/[0.08]' : ''
          }`}>
            <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center flex-shrink-0 text-lg">
              {DIFFICULTY_CONFIG[difficulty].botEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground truncate">{DIFFICULTY_CONFIG[difficulty].botName}</span>
                {thinking && <span className="text-[11px] text-muted-foreground">Thinking...</span>}
              </div>
              <CapturedPieces fen={game.fen()} color={playerColor === 'white' ? 'b' : 'w'} pieceSize={12} />
            </div>
            {timeControl.minutes > 0 && (
              <div className={`font-mono text-sm font-bold tabular-nums px-2 py-1 rounded ${
                (playerColor === 'white' ? blackTime : whiteTime) < 30 ? 'text-red-400 bg-red-500/10' : 'text-foreground bg-white/[0.06]'
              }`}>
                {formatTime(playerColor === 'white' ? blackTime : whiteTime)}
              </div>
            )}
            {timeControl.minutes === 0 && (
              <div className="font-mono text-xs text-muted-foreground tabular-nums">
                {formatTime(timer)}
              </div>
            )}
          </div>
          {/* Thinking indicator bar */}
          {thinking && (
            <div className="h-[3px] mt-1 rounded-full overflow-hidden bg-white/[0.06]">
              <div className="h-full w-1/3 rounded-full animate-thinking-bar" style={{
                background: 'linear-gradient(90deg, transparent, #81b64c, transparent)',
                animation: 'thinkingBar 1.2s ease-in-out infinite',
              }} />
            </div>
          )}
        </div>

        {/* Fallback notice */}
        {fallbackNotice && (
          <div className="mx-4 mb-1 px-3 py-1.5 rounded-md bg-amber-500/10 text-amber-400 text-xs text-center">
            Using fallback engine
          </div>
        )}

        {/* Game status banner */}
        {gameStatus !== 'playing' && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.9 }}
            animate={{ opacity: 1, scaleY: 1 }}
            className={`mx-4 mb-1 px-4 py-3 rounded-lg text-center font-semibold text-sm ${
              gameStatus === 'won' ? 'bg-amber-500/10 text-amber-400' :
              gameStatus === 'lost' ? 'bg-red-500/10 text-red-400' :
              'bg-zinc-500/10 text-zinc-400'
            }`}
          >
            {gameStatus === 'won' && <span className="flex items-center justify-center gap-2"><Trophy className="w-4 h-4" /> You won!</span>}
            {gameStatus === 'lost' && 'AI wins'}
            {gameStatus === 'draw' && 'Draw'}
            <div className="text-xs mt-1 font-normal flex items-center justify-center gap-3">
              {gameStatus === 'won' && (
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" /> +{50 * (Object.keys(DIFFICULTY_CONFIG).indexOf(difficulty) + 1)} XP
                </span>
              )}
              {lastRatingChange != null && (
                <span className={`flex items-center gap-1 font-bold ${lastRatingChange > 0 ? 'text-amber-400' : lastRatingChange < 0 ? 'text-red-400' : 'text-muted-foreground'}`}>
                  <TrendingUp className="w-3 h-3" /> {lastRatingChange > 0 ? '+' : ''}{lastRatingChange} Rating
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Opening name (in opening phase) */}
        {currentOpening && moveHistory.length <= 20 && gameStatus === 'playing' && (
          <div className="mx-4 mb-1 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.04]">
            <BookOpen className="w-3 h-3 text-primary flex-shrink-0" />
            <span className="text-[11px] text-muted-foreground truncate">{currentOpening.eco}: {currentOpening.name}</span>
          </div>
        )}

        {/* Notation Panel — fills available space */}
        <div className="flex-1 mx-4 mt-1 mb-2 flex flex-col min-h-0 rounded-lg border border-white/[0.06] bg-black/20 overflow-hidden">
          {/* Notation header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06] flex-shrink-0">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Moves</span>
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

          {/* Move list */}
          <div ref={notationRef} className="flex-1 overflow-y-auto scrollbar-hide">
            {moveHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground italic p-4 text-center">No moves yet</p>
            ) : notationView === 'list' ? (
              <div className="font-mono text-sm">
                {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => {
                  const isLastPair = i === Math.ceil(moveHistory.length / 2) - 1
                  const wq = moveQualities[i * 2] || ''
                  const bq = moveQualities[i * 2 + 1] || ''
                  return (
                    <div key={i} className={`flex gap-1 px-3 py-1.5 ${isLastPair ? 'bg-primary/10' : i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                      <span className="text-muted-foreground w-7 text-right shrink-0">{i + 1}.</span>
                      <span className={`flex-1 px-2 rounded cursor-default ${isLastPair && moveHistory.length % 2 !== 0 ? 'text-primary font-bold' : 'text-foreground'}`}>
                        {moveHistory[i * 2]}{wq && <span className={`ml-0.5 ${getQualityColor(wq)}`}>{wq}</span>}
                      </span>
                      <span className={`flex-1 px-2 rounded cursor-default ${isLastPair && moveHistory.length % 2 === 0 ? 'text-primary font-bold' : 'text-foreground/70'}`}>
                        {moveHistory[i * 2 + 1] || ''}{bq && <span className={`ml-0.5 ${getQualityColor(bq)}`}>{bq}</span>}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-x-1 gap-y-0.5 font-mono text-sm p-3">
                {moveHistory.map((move, idx) => {
                  const isLast = idx === moveHistory.length - 1
                  return (
                    <span key={idx} className="inline-flex items-center gap-0.5">
                      {idx % 2 === 0 && <span className="text-muted-foreground">{Math.floor(idx / 2) + 1}.</span>}
                      <span className={isLast ? 'text-primary font-bold' : 'text-foreground'}>{move}</span>
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Player Bar (bottom) */}
        <div className="flex-shrink-0 px-4 pb-2">
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            game.turn() === (playerColor === 'white' ? 'w' : 'b') ? 'bg-white/[0.08]' : ''
          }`}>
            <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-foreground">You</span>
              <CapturedPieces fen={game.fen()} color={playerColor === 'white' ? 'w' : 'b'} pieceSize={12} />
            </div>
            {timeControl.minutes > 0 && (
              <div className={`font-mono text-sm font-bold tabular-nums px-2 py-1 rounded ${
                (playerColor === 'white' ? whiteTime : blackTime) < 30 ? 'text-red-400 bg-red-500/10' : 'text-foreground bg-white/[0.06]'
              }`}>
                {formatTime(playerColor === 'white' ? whiteTime : blackTime)}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 px-4 pb-2">
          {gameStatus === 'playing' ? (
            <div className="flex gap-2">
              <button
                onClick={resetGame}
                className="flex-1 py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-2 text-white/80 transition-all"
                style={{ background: '#454341', borderBottom: '2px solid #2b2927' }}
              >
                <RotateCcw className="w-4 h-4" /> New Game
              </button>
              <button
                onClick={() => {
                  if (!window.confirm('Are you sure you want to resign?')) return
                  playSound('click')
                  setGameStatus('lost')
                  if (timerRef.current) clearInterval(timerRef.current)
                }}
                className="flex-1 py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-2 text-white/80 transition-all"
                style={{ background: '#c33', borderBottom: '2px solid #992222' }}
              >
                <Flag className="w-4 h-4" /> Resign
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <motion.button
                  onClick={() => setShowGameReview(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-2.5 rounded-md font-bold text-sm text-white flex items-center justify-center gap-2"
                  style={{ background: '#5b9bd5', borderBottom: '3px solid #4178a8' }}
                >
                  <BarChart3 className="w-4 h-4" /> Review Game
                </motion.button>
                <motion.button
                  onClick={resetGame}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-2.5 rounded-md font-bold text-sm text-white"
                  style={{ background: '#81b64c', borderBottom: '3px solid #5d8c34' }}
                >
                  Play Again
                </motion.button>
              </div>
              <div className="flex gap-2 justify-center">
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
                  className="px-3 py-1.5 rounded-md bg-secondary text-muted-foreground text-xs font-medium hover:text-foreground transition-colors"
                >
                  Download PGN
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatePGN()).then(() => {
                      setCopiedPGN(true)
                      setTimeout(() => setCopiedPGN(false), 2000)
                    })
                  }}
                  className="px-3 py-1.5 rounded-md bg-secondary text-muted-foreground text-xs font-medium hover:text-foreground transition-colors"
                >
                  {copiedPGN ? 'Copied!' : 'Copy PGN'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI Coach Panel */}
        {gameStatus === 'playing' && settings.coachMode !== 'off' && (
          <div className="flex-shrink-0 px-4 pb-2">
            <div className="rounded-lg border border-white/[0.06] bg-black/20 p-3">
              <CoachPanel
                fen={game.fen()}
                moveHistory={moveHistory}
                isPlayerTurn={isPlayerTurn}
                isThinking={thinking}
                gameOver={gameStatus !== 'playing'}
                coachMode={settings.coachMode}
                onCoachModeChange={(mode) => updateSetting('coachMode', mode)}
                blunderCheck={settings.blunderCheck}
                onArrows={setCoachArrows}
              />
            </div>
          </div>
        )}

        {/* Blunder Check Nudge */}
        <BlunderCheckNudge
          show={blunderCheck.show}
          message={blunderCheck.message}
          onPlayAnyway={() => {
            if (blunderCheck.pendingMove) {
              executeMove(blunderCheck.pendingMove.from, blunderCheck.pendingMove.to, blunderCheck.pendingMove.promotion)
            }
            setBlunderCheck({ show: false, message: '', pendingMove: null })
          }}
          onTakeBack={() => {
            setBlunderCheck({ show: false, message: '', pendingMove: null })
          }}
        />

        {/* Collapsible Analysis */}
        <div className="flex-shrink-0 px-4 pb-4">
          <details className="rounded-lg border border-white/[0.06] bg-black/20 overflow-hidden">
            <summary className="px-3 py-2 cursor-pointer text-[11px] font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors select-none flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-primary" /> Engine Analysis
            </summary>
            <div className="px-3 pb-3 pt-1">
              {analysis ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Eval</span>
                    <span className={`text-sm font-bold font-mono ${
                      analysis.isMate ? 'text-red-400' :
                      analysis.eval > 0.5 ? 'text-white' :
                      analysis.eval < -0.5 ? 'text-zinc-500' : 'text-muted-foreground'
                    }`}>
                      {analysis.isMate
                        ? `M${analysis.mateIn ?? '?'}`
                        : `${analysis.eval > 0 ? '+' : ''}${analysis.eval.toFixed(1)}`}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.max(5, Math.min(95, 50 + analysis.eval * 10))}%`,
                        background: analysis.eval >= 0
                          ? 'linear-gradient(90deg, #f0f0f0, #e0e0e0)'
                          : 'linear-gradient(90deg, #3a3a3a, #4a4a4a)',
                      }}
                    />
                  </div>
                  {analysis.bestLine.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Best line</span>
                      <p className="text-xs font-mono text-foreground/80 mt-0.5">{analysis.bestLine.join(' ')}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">Make a move to see analysis</p>
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}

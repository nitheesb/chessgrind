'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PenTool, BookOpen, X, Timer, Trophy } from 'lucide-react'
import { Chess, type Square as ChessSquare } from 'chess.js'
import { PUZZLES } from '@/lib/chess-data'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8']
const BEST_SCORE_KEY = 'chessgrind-notation-best'
const ROUND_DURATION = 30

const PIECE_SYMBOLS: Record<string, string> = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
}

type Mode = 'read' | 'write'

function getRandomPosition(): { fen: string; game: Chess; move: ReturnType<Chess['move']> } | null {
  const puzzle = PUZZLES[Math.floor(Math.random() * PUZZLES.length)]
  try {
    const game = new Chess(puzzle.fen)
    const legalMoves = game.moves({ verbose: true })
    if (legalMoves.length === 0) return null
    const chosen = legalMoves[Math.floor(Math.random() * legalMoves.length)]
    const move = game.move(chosen.san)
    if (!move) return null
    // Undo to get the position before the move
    game.undo()
    return { fen: game.fen(), game, move }
  } catch {
    return null
  }
}

function fenToBoard(fen: string): (string | null)[][] {
  const board: (string | null)[][] = []
  const rows = fen.split(' ')[0].split('/')
  for (const row of rows) {
    const boardRow: (string | null)[] = []
    for (const ch of row) {
      if (ch >= '1' && ch <= '8') {
        for (let i = 0; i < parseInt(ch); i++) boardRow.push(null)
      } else {
        const color = ch === ch.toUpperCase() ? 'w' : 'b'
        boardRow.push(color + ch.toUpperCase())
      }
    }
    board.push(boardRow)
  }
  return board
}

interface NotationTrainerProps {
  onClose: () => void
}

export function NotationTrainer({ onClose }: NotationTrainerProps) {
  const [mode, setMode] = useState<Mode | null>(null)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION)
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null)

  // Current question state
  const [currentFen, setCurrentFen] = useState<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
  const [currentMove, setCurrentMove] = useState<{ san: string; from: string; to: string } | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [clickedFrom, setClickedFrom] = useState<string | null>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(BEST_SCORE_KEY)
      if (stored) setBestScore(parseInt(stored, 10))
    } catch {}
  }, [])

  useEffect(() => {
    if (!started || finished) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setFinished(true)
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [started, finished])

  useEffect(() => {
    if (finished && score > bestScore) {
      setBestScore(score)
      try { localStorage.setItem(BEST_SCORE_KEY, String(score)) } catch {}
    }
  }, [finished, score, bestScore])

  const loadNewQuestion = useCallback(() => {
    let attempt = 0
    let result = getRandomPosition()
    while (!result && attempt < 10) {
      result = getRandomPosition()
      attempt++
    }
    if (result) {
      setCurrentFen(result.fen)
      setCurrentMove({ san: result.move.san, from: result.move.from, to: result.move.to })
    }
    setInputValue('')
    setClickedFrom(null)
  }, [])

  const handleCorrect = useCallback(() => {
    setCorrect(c => c + 1)
    setScore(s => s + 1)
    setFlash('correct')
    setTimeout(() => { setFlash(null); loadNewQuestion() }, 400)
  }, [loadNewQuestion])

  const handleWrong = useCallback(() => {
    setWrong(w => w + 1)
    setFlash('wrong')
    setTimeout(() => { setFlash(null); loadNewQuestion() }, 400)
  }, [loadNewQuestion])

  // Read mode: player types notation
  const handleSubmitNotation = useCallback(() => {
    if (!currentMove) return
    const trimmed = inputValue.trim()
    // Normalize castling
    const normalize = (s: string) => s.replace(/0/g, 'O').replace(/o/g, 'O').replace(/[+#!?]/g, '')
    if (normalize(trimmed) === normalize(currentMove.san)) {
      handleCorrect()
    } else {
      handleWrong()
    }
  }, [inputValue, currentMove, handleCorrect, handleWrong])

  // Write mode: player clicks from-square then to-square
  const handleSquareClick = useCallback((file: number, rank: number) => {
    if (!currentMove || mode !== 'write') return
    const square = FILES[file] + RANKS[rank]
    if (!clickedFrom) {
      setClickedFrom(square)
    } else {
      if (clickedFrom === currentMove.from && square === currentMove.to) {
        handleCorrect()
      } else {
        handleWrong()
      }
      setClickedFrom(null)
    }
  }, [currentMove, mode, clickedFrom, handleCorrect, handleWrong])

  const startGame = useCallback((m: Mode) => {
    setMode(m)
    setStarted(true)
    setFinished(false)
    setScore(0)
    setCorrect(0)
    setWrong(0)
    setTimeLeft(ROUND_DURATION)
    setFlash(null)
    setInputValue('')
    setClickedFrom(null)
    loadNewQuestion()
  }, [loadNewQuestion])

  const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0
  const board = useMemo(() => fenToBoard(currentFen), [currentFen])

  // Mode selection
  if (!started) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 p-6"
      >
        <div className="flex items-center justify-between w-full max-w-sm">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <PenTool className="w-5 h-5 text-primary" />
            Notation Trainer
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Practice reading and writing algebraic chess notation. {ROUND_DURATION} seconds per round!
        </p>

        {bestScore > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="w-4 h-4 text-amber-400" />
            Best score: <span className="font-bold text-foreground">{bestScore}</span>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => startGame('read')}
            className="glass-card p-4 flex items-center gap-3 hover:border-primary/40 transition-colors text-left"
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Read Mode</p>
              <p className="text-xs text-muted-foreground">See a move on the board, type the notation</p>
            </div>
          </button>

          <button
            onClick={() => startGame('write')}
            className="glass-card p-4 flex items-center gap-3 hover:border-primary/40 transition-colors text-left"
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <PenTool className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Write Mode</p>
              <p className="text-xs text-muted-foreground">See notation text, click the correct squares</p>
            </div>
          </button>
        </div>
      </motion.div>
    )
  }

  // Results screen
  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 p-6"
      >
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Timer className="w-6 h-6 text-primary" />
          Time&apos;s Up!
        </h2>

        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold text-primary">{score}</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold text-foreground">{accuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{correct}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold text-red-400">{wrong}</p>
            <p className="text-xs text-muted-foreground">Wrong</p>
          </div>
        </div>

        {score >= bestScore && score > 0 && (
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
            <Trophy className="w-4 h-4" />
            New Best Score!
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => startGame(mode!)}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-2"
          >
            Play Again
          </button>
          <button
            onClick={() => { setStarted(false); setFinished(false) }}
            className="px-6 py-2.5 rounded-xl bg-card text-foreground font-semibold border border-border"
          >
            Modes
          </button>
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-card text-muted-foreground font-semibold border border-border">
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    )
  }

  // Active game
  const boardSize = 288
  const squareSize = boardSize / 8

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-3 p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full" style={{ maxWidth: boardSize + 24 }}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-green-400">{correct} ✓</span>
          <span className="text-sm text-red-400">{wrong} ✗</span>
        </div>
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-muted-foreground" />
          <span className={`text-lg font-mono font-bold ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-foreground'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Write mode: show the notation to play */}
      {mode === 'write' && currentMove && (
        <motion.div
          key={currentMove.san}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-mono font-bold text-primary tracking-wider"
        >
          {currentMove.san}
        </motion.div>
      )}

      {/* Board */}
      <div className="flex flex-col items-center">
        <div className="flex">
          <div className="flex flex-col justify-around pr-1" style={{ height: boardSize }}>
            {RANKS.slice().reverse().map(r => (
              <span key={r} className="text-[10px] text-muted-foreground font-mono leading-none">{r}</span>
            ))}
          </div>

          <div
            style={{ width: boardSize, height: boardSize }}
            className="relative rounded-md overflow-hidden border border-border/30"
          >
            {Array.from({ length: 64 }, (_, i) => {
              const file = i % 8
              const rank = 7 - Math.floor(i / 8)
              const square = FILES[file] + RANKS[rank]
              const isLight = (file + rank) % 2 === 1
              const piece = board[7 - rank]?.[file]

              // Highlight from/to squares in read mode
              const isFrom = mode === 'read' && currentMove?.from === square
              const isTo = mode === 'read' && currentMove?.to === square
              const isClicked = clickedFrom === square

              let bgClass = isLight ? 'bg-amber-100' : 'bg-amber-600/80'
              if (isFrom || isTo) bgClass = isLight ? 'bg-blue-200' : 'bg-blue-500/80'
              if (isClicked) bgClass = 'bg-yellow-400/70'
              if (flash === 'correct' && (isFrom || isTo)) bgClass = 'bg-green-500'
              if (flash === 'wrong') bgClass = isLight ? 'bg-amber-100' : 'bg-amber-600/80'

              return (
                <div
                  key={square}
                  onClick={() => handleSquareClick(file, rank)}
                  className={`absolute transition-colors duration-150 ${bgClass} ${mode === 'write' ? 'cursor-pointer' : ''}`}
                  style={{
                    width: squareSize,
                    height: squareSize,
                    left: file * squareSize,
                    top: (7 - rank) * squareSize,
                  }}
                >
                  {piece && (
                    <span className="absolute inset-0 flex items-center justify-center text-lg select-none pointer-events-none" style={{ fontSize: squareSize * 0.7 }}>
                      {PIECE_SYMBOLS[piece] ?? ''}
                    </span>
                  )}
                  {/* Arrow indicator for read mode */}
                  {isTo && mode === 'read' && (
                    <div className="absolute inset-1 rounded-full border-2 border-blue-400/60" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex justify-around pl-4" style={{ width: boardSize + 16 }}>
          {FILES.map(f => (
            <span key={f} className="text-[10px] text-muted-foreground font-mono">{f}</span>
          ))}
        </div>
      </div>

      {/* Read mode: text input for notation */}
      {mode === 'read' && (
        <div className="flex gap-2 w-full max-w-xs">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmitNotation() }}
            placeholder="e.g. Nf3, exd5, O-O"
            className="flex-1 px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm font-mono focus:outline-none focus:border-primary"
            autoFocus
          />
          <button
            onClick={handleSubmitNotation}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm"
          >
            ✓
          </button>
        </div>
      )}

      {/* Write mode hint */}
      {mode === 'write' && (
        <p className="text-xs text-muted-foreground">
          {clickedFrom ? `Selected: ${clickedFrom} — now click the destination` : 'Click the piece to move, then its destination'}
        </p>
      )}

      <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-1">
        ← Back
      </button>
    </motion.div>
  )
}

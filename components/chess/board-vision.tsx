'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Target, X, Play, Timer, Trophy } from 'lucide-react'

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8']
const BEST_SCORE_KEY = 'board-vision-best-score'
const ROUND_DURATION = 30

type Mode = 'name' | 'find'

function randomSquare(): string {
  return FILES[Math.floor(Math.random() * 8)] + RANKS[Math.floor(Math.random() * 8)]
}

function generateChoices(correct: string): string[] {
  const choices = new Set<string>([correct])
  while (choices.size < 4) {
    choices.add(randomSquare())
  }
  return Array.from(choices).sort(() => Math.random() - 0.5)
}

interface BoardVisionTrainerProps {
  onClose: () => void
}

export function BoardVisionTrainer({ onClose }: BoardVisionTrainerProps) {
  const [mode, setMode] = useState<Mode | null>(null)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [target, setTarget] = useState(randomSquare)
  const [choices, setChoices] = useState<string[]>(() => generateChoices(target))
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [score, setScore] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION)
  const [flash, setFlash] = useState<{ square: string; ok: boolean } | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const questionStartRef = useRef(Date.now())
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

  const nextQuestion = useCallback(() => {
    const sq = randomSquare()
    setTarget(sq)
    setChoices(generateChoices(sq))
    setSelectedAnswer(null)
    questionStartRef.current = Date.now()
  }, [])

  const handleCorrectAnswer = useCallback(() => {
    const elapsed = (Date.now() - questionStartRef.current) / 1000
    const timeBonus = Math.max(0, Math.floor((3 - elapsed) * 2))
    setCorrect(c => c + 1)
    setScore(s => s + 1 + timeBonus)
    setFlash({ square: target, ok: true })
    setTimeout(() => { setFlash(null); nextQuestion() }, 400)
  }, [target, nextQuestion])

  const handleWrongAnswer = useCallback((square: string) => {
    setWrong(w => w + 1)
    setFlash({ square, ok: false })
    setTimeout(() => { setFlash(null); nextQuestion() }, 400)
  }, [nextQuestion])

  // "Name the Square" mode: click a choice button
  const handleChoiceClick = useCallback((choice: string) => {
    if (!started || finished || selectedAnswer) return
    setSelectedAnswer(choice)
    if (choice === target) {
      handleCorrectAnswer()
    } else {
      handleWrongAnswer(target)
    }
  }, [started, finished, selectedAnswer, target, handleCorrectAnswer, handleWrongAnswer])

  // "Find the Square" mode: click a square on the board
  const handleBoardClick = useCallback((file: number, rank: number) => {
    if (!started || finished) return
    const clicked = FILES[file] + RANKS[rank]
    if (clicked === target) {
      handleCorrectAnswer()
    } else {
      handleWrongAnswer(clicked)
    }
  }, [started, finished, target, handleCorrectAnswer, handleWrongAnswer])

  const startGame = useCallback((m: Mode) => {
    setMode(m)
    setStarted(true)
    setFinished(false)
    setCorrect(0)
    setWrong(0)
    setScore(0)
    setTimeLeft(ROUND_DURATION)
    setFlash(null)
    setSelectedAnswer(null)
    const sq = randomSquare()
    setTarget(sq)
    setChoices(generateChoices(sq))
    questionStartRef.current = Date.now()
  }, [])

  const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0

  // --- Mode Selection ---
  if (!started) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 p-6"
      >
        <div className="flex items-center justify-between w-full max-w-sm">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Board Vision
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Train your board vision with timed challenges. Pick a mode and identify squares as fast as you can!
        </p>

        {bestScore > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="w-4 h-4 text-amber-400" />
            Best score: <span className="font-bold text-foreground">{bestScore}</span>
          </div>
        )}

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => startGame('name')}
            className="glass-card p-4 flex items-center gap-3 hover:border-primary/40 transition-colors text-left"
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Name the Square</p>
              <p className="text-xs text-muted-foreground">A square is highlighted — pick its name</p>
            </div>
          </button>

          <button
            onClick={() => startGame('find')}
            className="glass-card p-4 flex items-center gap-3 hover:border-primary/40 transition-colors text-left"
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Find the Square</p>
              <p className="text-xs text-muted-foreground">A name is shown — click the correct square</p>
            </div>
          </button>
        </div>
      </motion.div>
    )
  }

  // --- Results ---
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
            <Play className="w-4 h-4" /> Play Again
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

  // --- Game Board ---
  const boardSize = 288
  const squareSize = boardSize / 8
  const targetFile = FILES.indexOf(target[0])
  const targetRank = RANKS.indexOf(target[1])

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
          <span className="text-xs text-muted-foreground">Pts: {score}</span>
        </div>
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-muted-foreground" />
          <span className={`text-lg font-mono font-bold ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-foreground'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {/* Prompt for "Find the Square" mode */}
      {mode === 'find' && (
        <motion.div
          key={target}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-mono font-bold text-primary tracking-wider"
        >
          {target}
        </motion.div>
      )}

      {/* Board with labels */}
      <div className="flex flex-col items-center">
        <div className="flex">
          {/* Rank labels (left side) */}
          <div className="flex flex-col justify-around pr-1" style={{ height: boardSize }}>
            {RANKS.slice().reverse().map(r => (
              <span key={r} className="text-[10px] text-muted-foreground font-mono leading-none">{r}</span>
            ))}
          </div>

          {/* Board grid */}
          <div
            style={{ width: boardSize, height: boardSize }}
            className="relative rounded-md overflow-hidden border border-border/30"
          >
            {Array.from({ length: 64 }, (_, i) => {
              const file = i % 8
              const rank = 7 - Math.floor(i / 8)
              const square = FILES[file] + RANKS[rank]
              const isLight = (file + rank) % 2 === 1
              const isHighlighted = mode === 'name' && file === targetFile && rank === targetRank
              const isFlashing = flash?.square === square

              let bgClass = isLight ? 'bg-amber-100' : 'bg-amber-600/80'
              if (isFlashing) {
                bgClass = flash.ok ? 'bg-green-500' : 'bg-red-500'
              }

              return (
                <div
                  key={square}
                  onClick={() => mode === 'find' ? handleBoardClick(file, rank) : undefined}
                  className={`absolute transition-colors duration-150 ${bgClass} ${mode === 'find' ? 'cursor-pointer hover:brightness-110' : ''}`}
                  style={{
                    width: squareSize,
                    height: squareSize,
                    left: file * squareSize,
                    top: (7 - rank) * squareSize,
                  }}
                >
                  <AnimatePresence>
                    {isHighlighted && !isFlashing && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute inset-1 rounded-full bg-primary/70 border-2 border-primary"
                      />
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>

        {/* File labels (bottom) */}
        <div className="flex justify-around pl-4" style={{ width: boardSize + 16 }}>
          {FILES.map(f => (
            <span key={f} className="text-[10px] text-muted-foreground font-mono">{f}</span>
          ))}
        </div>
      </div>

      {/* Multiple-choice for "Name the Square" mode */}
      {mode === 'name' && (
        <div className="grid grid-cols-4 gap-2 w-full" style={{ maxWidth: boardSize }}>
          <AnimatePresence mode="popLayout">
            {choices.map(c => (
              <motion.button
                key={c}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => handleChoiceClick(c)}
                disabled={!!selectedAnswer}
                className={`py-2.5 rounded-lg font-mono font-bold text-sm transition-colors border
                  ${selectedAnswer === c
                    ? c === target ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400'
                    : 'bg-card border-border text-foreground hover:border-primary/50'
                  }`}
              >
                {c}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}

      <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-1">
        ← Back
      </button>
    </motion.div>
  )
}

'use client'

import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'

// Coordinate Training mini-game
// Flash a coordinate, user clicks the correct square on the board
// Trains board visualization skills

interface CoordinateTrainerProps {
  size?: number
  onClose: () => void
}

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8']

function randomSquare(): string {
  return FILES[Math.floor(Math.random() * 8)] + RANKS[Math.floor(Math.random() * 8)]
}

export function CoordinateTrainer({ size = 320, onClose }: CoordinateTrainerProps) {
  const { playSound, triggerHaptic } = useSoundAndHaptics()
  const [target, setTarget] = useState(randomSquare)
  const [score, setScore] = useState(0)
  const [mistakes, setMistakes] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [flash, setFlash] = useState<{ square: string; correct: boolean } | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const squareSize = size / 8

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

  const handleSquareClick = useCallback((file: number, rank: number) => {
    if (!started || finished) return
    const clicked = FILES[file] + RANKS[rank]
    if (clicked === target) {
      playSound('move')
      triggerHaptic('light')
      setScore(s => s + 1)
      setStreak(s => {
        const next = s + 1
        setBestStreak(b => Math.max(b, next))
        return next
      })
      setFlash({ square: clicked, correct: true })
      setTarget(randomSquare())
    } else {
      playSound('illegal')
      triggerHaptic('error')
      setMistakes(m => m + 1)
      setStreak(0)
      setFlash({ square: clicked, correct: false })
    }
    setTimeout(() => setFlash(null), 300)
  }, [started, finished, target, playSound, triggerHaptic])

  const accuracy = score + mistakes > 0 ? Math.round((score / (score + mistakes)) * 100) : 0

  if (!started) {
    return (
      <div className="flex flex-col items-center gap-6 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">🎯 Coordinate Trainer</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            A coordinate will appear. Click the correct square as fast as you can! You have 30 seconds.
          </p>
        </div>
        <button
          onClick={() => { setStarted(true); playSound('click') }}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold text-lg"
        >
          Start!
        </button>
        <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Back
        </button>
      </div>
    )
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center gap-4 p-6">
        <h2 className="text-2xl font-bold text-foreground">⏱️ Time&apos;s Up!</h2>
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold text-primary">{score}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold text-foreground">{accuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold text-foreground">{bestStreak}</p>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold text-red-400">{mistakes}</p>
            <p className="text-xs text-muted-foreground">Mistakes</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setScore(0); setMistakes(0); setStreak(0); setBestStreak(0)
              setTimeLeft(30); setFinished(false); setTarget(randomSquare())
            }}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold"
          >
            Play Again
          </button>
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-secondary text-foreground font-semibold">
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Header */}
      <div className="flex items-center justify-between w-full px-2" style={{ maxWidth: size }}>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-primary">{score} ✓</span>
          <span className="text-sm text-red-400">{mistakes} ✗</span>
          {streak >= 3 && <span className="text-sm text-amber-400">🔥 {streak}</span>}
        </div>
        <span className={`text-lg font-mono font-bold ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-foreground'}`}>
          {timeLeft}s
        </span>
      </div>

      {/* Target coordinate */}
      <div className="text-4xl font-mono font-bold text-primary tracking-wider">
        {target}
      </div>

      {/* Board */}
      <div
        style={{ width: size, height: size }}
        className="relative rounded-lg overflow-hidden border border-border/30"
      >
        {Array.from({ length: 64 }, (_, i) => {
          const file = i % 8
          const rank = 7 - Math.floor(i / 8)
          const square = FILES[file] + RANKS[rank]
          const isLight = (file + rank) % 2 === 1
          const isFlash = flash?.square === square
          return (
            <div
              key={square}
              onClick={() => handleSquareClick(file, rank)}
              style={{
                width: squareSize,
                height: squareSize,
                position: 'absolute',
                left: file * squareSize,
                top: (7 - rank) * squareSize,
                backgroundColor: isFlash
                  ? flash.correct ? '#22c55e' : '#ef4444'
                  : isLight ? '#ebecd0' : '#739552',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
            />
          )
        })}
      </div>

      <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-1">
        ← Back
      </button>
    </div>
  )
}

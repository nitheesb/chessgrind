'use client'

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Chess } from 'chess.js'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Trophy, X, Play, Zap } from 'lucide-react'
import { PUZZLES } from '@/lib/chess-data'
import { useGame } from '@/lib/game-context'
import { useSettings } from '@/lib/settings-context'
import { Chessboard } from '@/components/chess/chessboard'

type Phase = 'select' | 'playing' | 'gameover'

const TIME_OPTIONS = [
  { label: '1 min', seconds: 60 },
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
] as const

const BEST_SCORE_KEY = 'puzzle-rush-best-score'

function getRandomPuzzle(excludeId?: string): (typeof PUZZLES)[number] {
  const pool = excludeId ? PUZZLES.filter((p) => p.id !== excludeId) : PUZZLES
  return pool[Math.floor(Math.random() * pool.length)]
}

export function PuzzleRush({ onClose }: { onClose: () => void }) {
  const { addXP, incrementPuzzlesSolved } = useGame()
  const { settings } = useSettings()

  const [phase, setPhase] = useState<Phase>('select')
  const [selectedTime, setSelectedTime] = useState(180)
  const [timeLeft, setTimeLeft] = useState(0)
  const [score, setScore] = useState(0)
  const [puzzle, setPuzzle] = useState(() => getRandomPuzzle())
  const [flash, setFlash] = useState<'correct' | null>(null)
  const [bestScore, setBestScore] = useState(0)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load best score from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BEST_SCORE_KEY)
      if (stored) setBestScore(parseInt(stored, 10))
    } catch {}
  }, [])

  // Compute the expected move (from+to) for the current puzzle
  const expectedMove = useMemo(() => {
    try {
      const game = new Chess(puzzle.fen)
      const move = game.move(puzzle.moves[0])
      if (move) return { from: move.from, to: move.to }
    } catch {}
    return null
  }, [puzzle])

  // Determine which color the player plays (the side to move in the FEN)
  const playerColor = useMemo(() => {
    const parts = puzzle.fen.split(' ')
    return parts[1] === 'w' ? 'white' : 'black'
  }, [puzzle])

  // Timer countdown
  useEffect(() => {
    if (phase !== 'playing') return
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          timerRef.current = null
          setPhase('gameover')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase])

  // Save best score on game over
  useEffect(() => {
    if (phase === 'gameover') {
      if (score > bestScore) {
        setBestScore(score)
        try {
          localStorage.setItem(BEST_SCORE_KEY, score.toString())
        } catch {}
      }
    }
  }, [phase, score, bestScore])

  const startGame = useCallback(() => {
    setScore(0)
    setTimeLeft(selectedTime)
    setPuzzle(getRandomPuzzle())
    setFlash(null)
    setPhase('playing')
  }, [selectedTime])

  const handleMove = useCallback(
    (from: string, to: string) => {
      if (phase !== 'playing' || !expectedMove) return false
      if (from === expectedMove.from && to === expectedMove.to) {
        // Correct
        setScore((s) => s + 1)
        incrementPuzzlesSolved()
        addXP(10)
        setFlash('correct')
        setTimeout(() => {
          setFlash(null)
          setPuzzle((prev) => getRandomPuzzle(prev.id))
        }, 400)
        return true
      }
      // Wrong — game over
      if (timerRef.current) clearInterval(timerRef.current)
      setPhase('gameover')
      return false
    },
    [phase, expectedMove, incrementPuzzlesSolved, addXP]
  )

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card relative w-full max-w-lg p-6 flex flex-col gap-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-bold text-foreground">Puzzle Rush</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Time Selection */}
          {phase === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-6 py-4"
            >
              <p className="text-muted-foreground text-sm">
                Solve as many puzzles as you can before time runs out!
              </p>

              <div className="flex gap-3">
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.seconds}
                    onClick={() => setSelectedTime(opt.seconds)}
                    className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      selectedTime === opt.seconds
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : 'bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Timer className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                    {opt.label}
                  </button>
                ))}
              </div>

              {bestScore > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  Best: {bestScore}
                </div>
              )}

              <button
                onClick={startGame}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary text-white font-bold text-base hover:brightness-110 transition-all shadow-lg shadow-primary/30"
              >
                <Play className="w-5 h-5" />
                Start
              </button>
            </motion.div>
          )}

          {/* Playing */}
          {phase === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-3"
            >
              {/* Stats bar */}
              <div className="flex w-full items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="font-bold text-foreground">{score}</span>
                  <span className="text-muted-foreground">solved</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 font-mono font-bold ${
                    timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-foreground'
                  }`}
                >
                  <Timer className="w-4 h-4" />
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Board with flash overlay */}
              <div className="relative w-full aspect-square max-w-[400px]">
                <Chessboard
                  fen={puzzle.fen}
                  onMove={handleMove}
                  flipped={playerColor === 'black'}
                  boardStyle={settings.boardStyle}
                  pieceStyle={settings.pieceStyle}
                  showCoordinates={true}
                />
                <AnimatePresence>
                  {flash === 'correct' && (
                    <motion.div
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 rounded-lg bg-green-400/30 pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </div>

              <p className="text-xs text-muted-foreground">
                Find the best move! ({puzzle.difficulty})
              </p>
            </motion.div>
          )}

          {/* Game Over */}
          {phase === 'gameover' && (
            <motion.div
              key="gameover"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-5 py-4"
            >
              <Trophy className="w-12 h-12 text-yellow-400" />
              <h3 className="text-2xl font-bold text-foreground">Time&apos;s Up!</h3>

              <div className="flex gap-6">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-foreground">{score}</span>
                  <span className="text-xs text-muted-foreground">Score</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold text-yellow-400">
                    {Math.max(bestScore, score)}
                  </span>
                  <span className="text-xs text-muted-foreground">Best</span>
                </div>
              </div>

              {score > 0 && score >= bestScore && (
                <motion.p
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-sm font-semibold text-green-400"
                >
                  🎉 New Best Score!
                </motion.p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setPhase('select')}
                  className="px-5 py-2.5 rounded-xl bg-card text-foreground font-semibold text-sm hover:brightness-110 transition-all"
                >
                  Change Time
                </button>
                <button
                  onClick={startGame}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/30"
                >
                  <Play className="w-4 h-4" />
                  Play Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

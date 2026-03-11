'use client'

import { useState, useCallback, useMemo } from 'react'
import { Chess } from 'chess.js'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, X, Brain, Trophy, CheckCircle } from 'lucide-react'
import { MiniChessboard } from '@/components/chess/chessboard'
import { useSettings } from '@/lib/settings-context'

interface Position {
  fen: string
  targetSquare: string
  pieceName: string
}

const POSITIONS: Position[] = [
  // Easy: open positions, few pieces
  { fen: 'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 1 1', targetSquare: 'f3', pieceName: 'Knight' },
  { fen: '8/8/8/4R3/8/8/8/4K2k w - - 0 1', targetSquare: 'e5', pieceName: 'Rook' },
  { fen: '8/8/8/3B4/8/8/8/4K2k w - - 0 1', targetSquare: 'd5', pieceName: 'Bishop' },
  { fen: '8/8/8/3Q4/8/8/8/4K2k w - - 0 1', targetSquare: 'd5', pieceName: 'Queen' },
  { fen: '4k3/8/8/8/3N4/8/8/4K3 w - - 0 1', targetSquare: 'd4', pieceName: 'Knight' },
  // Medium: some pieces present
  { fen: 'r1bqkb1r/pppppppp/2n2n2/8/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', targetSquare: 'f3', pieceName: 'Knight' },
  { fen: 'rnbqkbnr/pppp1ppp/8/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 0 2', targetSquare: 'c4', pieceName: 'Bishop' },
  { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', targetSquare: 'c4', pieceName: 'Bishop' },
  { fen: 'rnbq1rk1/ppppppbp/5np1/8/2PP4/2N2N2/PP2PPPP/R1BQKB1R w KQ - 4 4', targetSquare: 'c3', pieceName: 'Knight' },
  { fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 4', targetSquare: 'c3', pieceName: 'Knight' },
  // Hard: complex positions
  { fen: 'r2q1rk1/ppp2ppp/2np1n2/2b1p1B1/2B1P1b1/2NP1N2/PPP2PPP/R2Q1RK1 w - - 6 8', targetSquare: 'f3', pieceName: 'Knight' },
  { fen: 'r1bq1rk1/pp2ppbp/2np1np1/8/3NP3/2N1BP2/PPPQ2PP/R3KB1R w KQ - 2 8', targetSquare: 'd4', pieceName: 'Knight' },
  { fen: 'r2qr1k1/pp1nbppp/2p2n2/3p2B1/3P4/2NBP3/PPQ2PPP/R3K2R w KQ - 2 10', targetSquare: 'd3', pieceName: 'Bishop' },
  { fen: '2r1r1k1/pp1q1ppp/2n1pn2/3p4/3P4/1PN1PN2/P1Q2PPP/2RR2K1 w - - 0 14', targetSquare: 'c2', pieceName: 'Queen' },
  { fen: 'r4rk1/1bq1bppp/p1nppn2/1p6/3NP3/1BN1BP2/PPPQ2PP/2KR3R w - - 0 12', targetSquare: 'd4', pieceName: 'Knight' },
]

const QUESTIONS_PER_ROUND = 10
const BEST_KEY = 'chessgrind-movecalc-best'

function countLegalMoves(fen: string, square: string): number {
  const game = new Chess(fen)
  const moves = game.moves({ square: square as never, verbose: true })
  return moves.length
}

function generateOptions(correct: number): number[] {
  const opts = new Set<number>([correct])
  while (opts.size < 4) {
    const offset = Math.floor(Math.random() * 5) - 2
    const val = correct + offset
    if (val >= 0 && val !== correct) opts.add(val)
    if (opts.size < 4) {
      const val2 = correct + Math.floor(Math.random() * 3) + 1
      opts.add(val2)
    }
  }
  return Array.from(opts).sort((a, b) => a - b)
}

export function MoveCalculator({ onClose }: { onClose: () => void }) {
  const { settings } = useSettings()
  const [phase, setPhase] = useState<'menu' | 'playing' | 'results'>('menu')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [best, setBest] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem(BEST_KEY) || '0', 10)
    }
    return 0
  })

  const shuffledPositions = useMemo(() => {
    const shuffled = [...POSITIONS].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, QUESTIONS_PER_ROUND)
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const currentPos = shuffledPositions[questionIndex]
  const correctAnswer = useMemo(
    () => (currentPos ? countLegalMoves(currentPos.fen, currentPos.targetSquare) : 0),
    [currentPos]
  )
  const options = useMemo(() => generateOptions(correctAnswer), [correctAnswer])

  const startGame = useCallback(() => {
    setPhase('playing')
    setQuestionIndex(0)
    setScore(0)
    setSelected(null)
    setShowAnswer(false)
  }, [])

  const handleSelect = useCallback(
    (value: number) => {
      if (showAnswer) return
      setSelected(value)
      setShowAnswer(true)
      if (value === correctAnswer) {
        setScore((s) => s + 1)
      }
    },
    [showAnswer, correctAnswer]
  )

  const nextQuestion = useCallback(() => {
    if (questionIndex + 1 >= QUESTIONS_PER_ROUND) {
      const finalScore = score + (selected === correctAnswer ? 0 : 0)
      if (finalScore > best) {
        setBest(finalScore)
        if (typeof window !== 'undefined') {
          localStorage.setItem(BEST_KEY, String(finalScore))
        }
      }
      setPhase('results')
    } else {
      setQuestionIndex((i) => i + 1)
      setSelected(null)
      setShowAnswer(false)
    }
  }, [questionIndex, score, selected, correctAnswer, best])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card p-6 w-full max-w-lg mx-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Move Calculator</h2>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted/50 transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-4"
          >
            <Brain className="w-12 h-12 text-primary" />
            <p className="text-center text-muted-foreground text-sm">
              Count how many legal moves a highlighted piece has. Train your calculation ability!
            </p>
            {best > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Trophy className="w-4 h-4 text-yellow-500" />
                Best: {best}/{QUESTIONS_PER_ROUND}
              </div>
            )}
            <button
              onClick={startGame}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Start Training
            </button>
          </motion.div>
        )}

        {phase === 'playing' && currentPos && (
          <motion.div
            key={`q-${questionIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
              <span>
                Question {questionIndex + 1}/{QUESTIONS_PER_ROUND}
              </span>
              <span>
                Score: {score}/{questionIndex + (showAnswer ? 1 : 0)}
              </span>
            </div>

            <div className="rounded-lg overflow-hidden">
              <MiniChessboard
                fen={currentPos.fen}
                size={280}
                boardStyle={settings.boardStyle}
                pieceStyle={settings.pieceStyle}
              />
            </div>

            <p className="text-foreground font-medium text-center">
              How many legal moves does the{' '}
              <span className="text-primary font-bold">{currentPos.pieceName}</span> on{' '}
              <span className="text-primary font-bold">{currentPos.targetSquare}</span> have?
            </p>

            <div className="grid grid-cols-4 gap-3 w-full">
              {options.map((opt) => {
                let btnClass = 'bg-card border border-border hover:border-primary/50'
                if (showAnswer) {
                  if (opt === correctAnswer) btnClass = 'bg-green-500/20 border border-green-500'
                  else if (opt === selected) btnClass = 'bg-red-500/20 border border-red-500'
                }
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelect(opt)}
                    disabled={showAnswer}
                    className={`${btnClass} rounded-lg py-3 text-lg font-bold text-foreground transition-colors`}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>

            {showAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-2"
              >
                {selected === correctAnswer ? (
                  <div className="flex items-center gap-1 text-green-500 font-semibold">
                    <CheckCircle className="w-4 h-4" /> Correct!
                  </div>
                ) : (
                  <p className="text-red-400 font-semibold">
                    Incorrect — answer is {correctAnswer}
                  </p>
                )}
                <button
                  onClick={nextQuestion}
                  className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  {questionIndex + 1 >= QUESTIONS_PER_ROUND ? 'See Results' : 'Next'}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <Trophy className="w-12 h-12 text-yellow-500" />
            <h3 className="text-xl font-bold text-foreground">Round Complete!</h3>
            <div className="bg-card rounded-lg p-4 w-full text-center space-y-1">
              <p className="text-2xl font-bold text-primary">
                {score}/{QUESTIONS_PER_ROUND}
              </p>
              <p className="text-sm text-muted-foreground">
                Accuracy: {Math.round((score / QUESTIONS_PER_ROUND) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">
                Best: {best}/{QUESTIONS_PER_ROUND}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Play Again
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-card border border-border text-foreground rounded-lg font-semibold hover:border-primary/50 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

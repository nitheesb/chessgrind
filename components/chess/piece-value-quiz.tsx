'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, Trophy, X, CheckCircle, XCircle } from 'lucide-react'
import { Chess } from 'chess.js'

const BEST_SCORE_KEY = 'chessgrind-piece-quiz-best'
const TOTAL_QUESTIONS = 20

const PIECE_VALUES: Record<string, number> = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: Infinity,
}
const PIECE_NAMES: Record<string, string> = {
  p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King',
}
const VALUE_PIECES = ['p', 'n', 'b', 'r', 'q'] as const

// FEN positions for material-counting questions
const MATERIAL_FENS = [
  'r1bqkb1r/pppppppp/2n2n2/8/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
  'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
  'rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 1 4',
  'r1bqkbnr/pppppppp/2n5/8/3PP3/8/PPP2PPP/RNBQKBNR b KQkq - 0 2',
  'rnbq1rk1/ppp1bppp/4pn2/3p4/2PP4/2N1PN2/PP3PPP/R1BQKB1R w KQ - 2 6',
]

type QuestionType = 'value' | 'compare' | 'material' | 'trade'

interface Question {
  type: QuestionType
  text: string
  options: string[]
  correctIndex: number
}

function countMaterial(fen: string, color: 'w' | 'b'): number {
  const game = new Chess(fen)
  const board = game.board()
  let total = 0
  for (const row of board) {
    for (const sq of row) {
      if (sq && sq.color === color && sq.type !== 'k') {
        total += PIECE_VALUES[sq.type] ?? 0
      }
    }
  }
  return total
}

function generateValueQuestion(): Question {
  const piece = VALUE_PIECES[Math.floor(Math.random() * VALUE_PIECES.length)]
  const correct = String(PIECE_VALUES[piece])
  const wrongSet = new Set<string>()
  while (wrongSet.size < 3) {
    const v = Math.floor(Math.random() * 12) + 1
    const s = String(v)
    if (s !== correct) wrongSet.add(s)
  }
  const options = [correct, ...wrongSet]
  options.sort(() => Math.random() - 0.5)
  return {
    type: 'value',
    text: `What is the value of a ${PIECE_NAMES[piece]}?`,
    options,
    correctIndex: options.indexOf(correct),
  }
}

function generateCompareQuestion(): Question {
  const shuffled = [...VALUE_PIECES].sort(() => Math.random() - 0.5)
  const a = shuffled[0]
  let b = shuffled[1]
  // Ensure they have different values
  if (PIECE_VALUES[a] === PIECE_VALUES[b]) {
    b = VALUE_PIECES.find(p => PIECE_VALUES[p] !== PIECE_VALUES[a]) ?? shuffled[2]
  }
  const correct = PIECE_VALUES[a] > PIECE_VALUES[b] ? PIECE_NAMES[a] : PIECE_NAMES[b]
  const wrongSet = new Set<string>([correct])
  const allNames = VALUE_PIECES.map(p => PIECE_NAMES[p])
  while (wrongSet.size < 4) {
    wrongSet.add(allNames[Math.floor(Math.random() * allNames.length)])
  }
  const options = Array.from(wrongSet).sort(() => Math.random() - 0.5)
  return {
    type: 'compare',
    text: `Which piece is more valuable: ${PIECE_NAMES[a]} or ${PIECE_NAMES[b]}?`,
    options,
    correctIndex: options.indexOf(correct),
  }
}

function generateMaterialQuestion(): Question {
  const fen = MATERIAL_FENS[Math.floor(Math.random() * MATERIAL_FENS.length)]
  const color = Math.random() > 0.5 ? 'w' : 'b'
  const total = countMaterial(fen, color)
  const correct = String(total)
  const wrongSet = new Set<string>()
  while (wrongSet.size < 3) {
    const offset = Math.floor(Math.random() * 10) - 5
    const v = String(total + offset)
    if (v !== correct && parseInt(v) > 0) wrongSet.add(v)
  }
  // Guarantee 3 wrong answers
  let fallback = total + 1
  while (wrongSet.size < 3) {
    const v = String(fallback)
    if (v !== correct) wrongSet.add(v)
    fallback++
  }
  const options = [correct, ...wrongSet]
  options.sort(() => Math.random() - 0.5)
  return {
    type: 'material',
    text: `What's the total value of ${color === 'w' ? "White's" : "Black's"} remaining pieces (excl. King)?`,
    options,
    correctIndex: options.indexOf(correct),
  }
}

function generateTradeQuestion(): Question {
  const trades = [
    { desc: 'a Rook for a Bishop and a Pawn', giving: 5, getting: 4, good: false },
    { desc: 'a Queen for two Rooks', giving: 9, getting: 10, good: true },
    { desc: 'a Bishop for three Pawns', giving: 3, getting: 3, good: false },
    { desc: 'a Rook for a Knight', giving: 5, getting: 3, good: false },
    { desc: 'two Bishops for a Rook and a Pawn', giving: 6, getting: 6, good: false },
    { desc: 'a Queen for a Rook, Bishop, and Knight', giving: 9, getting: 11, good: true },
    { desc: 'a Knight for three Pawns', giving: 3, getting: 3, good: false },
    { desc: 'a Queen for a Rook and a Pawn', giving: 9, getting: 6, good: false },
  ]
  const trade = trades[Math.floor(Math.random() * trades.length)]
  const correct = trade.good ? 'Good trade' : 'Bad trade'
  const options = ['Good trade', 'Bad trade', 'Equal trade', 'Depends on position']
  options.sort(() => Math.random() - 0.5)
  return {
    type: 'trade',
    text: `Is trading ${trade.desc} a good trade (material-wise)?`,
    options,
    correctIndex: options.indexOf(correct),
  }
}

function generateQuestion(): Question {
  const r = Math.random()
  if (r < 0.3) return generateValueQuestion()
  if (r < 0.55) return generateCompareQuestion()
  if (r < 0.8) return generateMaterialQuestion()
  return generateTradeQuestion()
}

interface PieceValueQuizProps {
  onClose: () => void
}

export function PieceValueQuiz({ onClose }: PieceValueQuizProps) {
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [wrong, setWrong] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const [questions] = useState<Question[]>(() =>
    Array.from({ length: TOTAL_QUESTIONS }, () => generateQuestion())
  )

  const currentQuestion = useMemo(() => questions[questionIndex], [questions, questionIndex])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(BEST_SCORE_KEY)
      if (stored) setBestScore(parseInt(stored, 10))
    } catch {}
  }, [])

  useEffect(() => {
    if (finished && score > bestScore) {
      setBestScore(score)
      try { localStorage.setItem(BEST_SCORE_KEY, String(score)) } catch {}
    }
  }, [finished, score, bestScore])

  const handleAnswer = useCallback((idx: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(idx)
    setShowResult(true)
    const isCorrect = idx === currentQuestion.correctIndex
    if (isCorrect) {
      setCorrect(c => c + 1)
      setScore(s => s + 1)
    } else {
      setWrong(w => w + 1)
    }
    setTimeout(() => {
      setSelectedAnswer(null)
      setShowResult(false)
      if (questionIndex + 1 >= TOTAL_QUESTIONS) {
        setFinished(true)
      } else {
        setQuestionIndex(i => i + 1)
      }
    }, 1200)
  }, [selectedAnswer, currentQuestion, questionIndex])

  const startQuiz = useCallback(() => {
    setStarted(true)
    setFinished(false)
    setQuestionIndex(0)
    setScore(0)
    setCorrect(0)
    setWrong(0)
    setSelectedAnswer(null)
    setShowResult(false)
  }, [])

  const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0

  // Start screen
  if (!started) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 p-6"
      >
        <div className="flex items-center justify-between w-full max-w-sm">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Piece Value Quiz
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground text-center max-w-xs">
          Test your knowledge of chess piece values! {TOTAL_QUESTIONS} questions covering values, comparisons, material counting, and trade evaluation.
        </p>

        <div className="glass-card p-4 text-sm text-muted-foreground max-w-xs space-y-1">
          <p>♙ Pawn = 1 · ♘ Knight = 3 · ♗ Bishop = 3</p>
          <p>♖ Rook = 5 · ♕ Queen = 9 · ♔ King = ∞</p>
        </div>

        {bestScore > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="w-4 h-4 text-amber-400" />
            Best score: <span className="font-bold text-foreground">{bestScore}/{TOTAL_QUESTIONS}</span>
          </div>
        )}

        <button
          onClick={startQuiz}
          className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/30"
        >
          Start Quiz
        </button>
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
          <Trophy className="w-6 h-6 text-amber-400" />
          Quiz Complete!
        </h2>

        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
          <div className="glass-card p-4 text-center">
            <p className="text-3xl font-bold text-primary">{score}/{TOTAL_QUESTIONS}</p>
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
            onClick={startQuiz}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-2"
          >
            Play Again
          </button>
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl bg-card text-muted-foreground font-semibold border border-border">
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    )
  }

  // Active quiz
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-4 p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-sm">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-green-400">{correct} ✓</span>
          <span className="text-sm text-red-400">{wrong} ✗</span>
        </div>
        <span className="text-sm text-muted-foreground font-mono">
          {questionIndex + 1}/{TOTAL_QUESTIONS}
        </span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm h-1.5 rounded-full bg-card overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((questionIndex + 1) / TOTAL_QUESTIONS) * 100}%` }}
        />
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={questionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass-card p-5 w-full max-w-sm"
        >
          <p className="text-foreground font-semibold text-center mb-4">
            {currentQuestion.text}
          </p>

          <div className="grid grid-cols-2 gap-2">
            {currentQuestion.options.map((opt, idx) => {
              let btnClass = 'bg-card border-border text-foreground hover:border-primary/50'
              if (showResult) {
                if (idx === currentQuestion.correctIndex) {
                  btnClass = 'bg-green-500/20 border-green-500 text-green-400'
                } else if (idx === selectedAnswer && idx !== currentQuestion.correctIndex) {
                  btnClass = 'bg-red-500/20 border-red-500 text-red-400'
                }
              }
              return (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAnswer(idx)}
                  disabled={selectedAnswer !== null}
                  className={`py-3 px-4 rounded-lg font-semibold text-sm transition-colors border ${btnClass}`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    {showResult && idx === currentQuestion.correctIndex && <CheckCircle className="w-4 h-4" />}
                    {showResult && idx === selectedAnswer && idx !== currentQuestion.correctIndex && <XCircle className="w-4 h-4" />}
                    {opt}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

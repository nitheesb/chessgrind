'use client'

import { useMemo } from 'react'
import { Chess } from 'chess.js'
import { motion } from 'framer-motion'

const PIECE_VALUES: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 }

const centerBonus = (sq: string) => {
  const file = sq.charCodeAt(0) - 97
  const rank = parseInt(sq[1]) - 1
  return (3.5 - Math.abs(file - 3.5)) * 3 + (3.5 - Math.abs(rank - 3.5)) * 3
}

function computeEval(game: Chess): { score: number; mateIn?: number } {
  if (game.isCheckmate()) {
    // current turn is the loser
    return { score: game.turn() === 'w' ? -100 : 100, mateIn: 0 }
  }
  if (game.isDraw() || game.isStalemate()) return { score: 0 }

  let score = 0
  const board = game.board()
  for (const row of board) {
    for (const sq of row) {
      if (!sq) continue
      const val = PIECE_VALUES[sq.type] + centerBonus(sq.square)
      score += sq.color === 'w' ? val : -val
    }
  }
  // Normalize to -10..+10
  return { score: Math.max(-10, Math.min(10, score / 100)) }
}

interface EvalBarProps {
  game: Chess
  /** Bar dimension along the evaluation axis */
  size?: number
  /** Bar thickness */
  thickness?: number
  /** Orientation */
  vertical?: boolean
}

export function EvalBar({ game, size = 360, thickness = 20, vertical = true }: EvalBarProps) {
  const { score, mateIn } = useMemo(() => computeEval(game), [game])

  const clampedScore = isFinite(score) ? score : score > 0 ? 10 : -10
  // whitePercent: 50 = even, >50 = white ahead, <50 = black ahead
  const whitePercent = Math.round(((clampedScore + 10) / 20) * 100)
  const label =
    mateIn !== undefined
      ? `M${mateIn}`
      : clampedScore === 0
      ? '0.0'
      : `${clampedScore > 0 ? '+' : ''}${clampedScore.toFixed(1)}`

  if (vertical) {
    return (
      <div
        title={`Eval: ${label}`}
        style={{
          width: thickness,
          height: size,
          position: 'relative',
          borderRadius: 6,
          overflow: 'hidden',
          flexShrink: 0,
          backgroundColor: '#111',
        }}
      >
        {/* White fills from bottom */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#f0f0f0',
          }}
          animate={{ height: `${whitePercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        {/* Score label */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 8,
            fontWeight: 700,
            color: whitePercent > 55 ? '#333' : '#eee',
            writingMode: 'vertical-rl',
            userSelect: 'none',
            pointerEvents: 'none',
            letterSpacing: 0.5,
          }}
        >
          {label}
        </div>
      </div>
    )
  }

  // Horizontal (for mobile, placed below or above board)
  return (
    <div
      title={`Eval: ${label}`}
      style={{
        height: thickness,
        width: size,
        position: 'relative',
        borderRadius: 6,
        overflow: 'hidden',
        flexShrink: 0,
        backgroundColor: '#111',
      }}
    >
      {/* White fills from left */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          backgroundColor: '#f0f0f0',
        }}
        animate={{ width: `${whitePercent}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 8,
          fontWeight: 700,
          color: whitePercent > 55 ? '#333' : '#eee',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {label}
      </div>
    </div>
  )
}

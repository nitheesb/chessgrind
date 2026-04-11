'use client'

import React, { memo } from 'react'

export type PieceStyleType = 'neo' | 'classic'

interface ChessPieceProps {
  piece: string
  size?: number
  className?: string
  pieceStyle?: PieceStyleType
}

// Memoized piece component — uses high-quality SVG images from /pieces/{style}/
export const ChessPiece = memo(function ChessPiece({ piece, size = 45, className = '', pieceStyle = 'neo' }: ChessPieceProps) {
  const color = piece[0] // 'w' or 'b'
  const type = piece[1] // K, Q, R, B, N, P

  // Map style names to folder names (neo/classic have SVG assets)
  const folder = pieceStyle === 'classic' ? 'classic' : 'neo'
  const src = `/pieces/${folder}/${color}${type}.svg`

  return (
    <img
      src={src}
      alt={`${color === 'w' ? 'White' : 'Black'} ${type}`}
      width={size}
      height={size}
      className={className}
      draggable={false}
      style={{
        willChange: 'transform',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    />
  )
})

// Convert FEN piece character to our piece format
export function fenToPiece(fenChar: string): string | null {
  const map: Record<string, string> = {
    'K': 'wK', 'Q': 'wQ', 'R': 'wR', 'B': 'wB', 'N': 'wN', 'P': 'wP',
    'k': 'bK', 'q': 'bQ', 'r': 'bR', 'b': 'bB', 'n': 'bN', 'p': 'bP',
  }
  return map[fenChar] || null
}

// Parse FEN string into board array
export function parseFEN(fen: string): (string | null)[][] {
  const rows = fen.split(' ')[0].split('/')
  const board: (string | null)[][] = []

  for (const row of rows) {
    const boardRow: (string | null)[] = []
    for (const char of row) {
      if (/\d/.test(char)) {
        for (let i = 0; i < parseInt(char); i++) {
          boardRow.push(null)
        }
      } else {
        boardRow.push(fenToPiece(char))
      }
    }
    board.push(boardRow)
  }

  return board
}

import { WHITE_PIECE_SYMBOLS } from '@/lib/chess-constants'

export function getPieceSymbol(type: string): string {
  return WHITE_PIECE_SYMBOLS[type.toUpperCase()] || ''
}

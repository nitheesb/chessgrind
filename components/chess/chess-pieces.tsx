'use client'

import React from 'react'

// Beautiful SVG chess pieces - Unicode-based for crisp rendering at any size
const PIECE_UNICODE: Record<string, string> = {
  'wK': '\u2654', 'wQ': '\u2655', 'wR': '\u2656', 'wB': '\u2657', 'wN': '\u2658', 'wP': '\u2659',
  'bK': '\u265A', 'bQ': '\u265B', 'bR': '\u265C', 'bB': '\u265D', 'bN': '\u265E', 'bP': '\u265F',
}

interface ChessPieceProps {
  piece: string // e.g., 'wK', 'bQ', etc.
  size?: number
  className?: string
}

export function ChessPiece({ piece, size = 48, className = '' }: ChessPieceProps) {
  const unicode = PIECE_UNICODE[piece]
  if (!unicode) return null

  const isWhite = piece.startsWith('w')

  return (
    <span
      className={`inline-flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{
        fontSize: size * 0.85,
        lineHeight: 1,
        width: size,
        height: size,
        color: isWhite ? '#f0e6d3' : '#1a1a2e',
        textShadow: isWhite
          ? '0 1px 3px rgba(0,0,0,0.4), 0 0px 1px rgba(0,0,0,0.6)'
          : '0 1px 2px rgba(0,0,0,0.3), 0 0 8px rgba(255,255,255,0.1)',
        filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.3))`,
      }}
    >
      {unicode}
    </span>
  )
}

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

export function getPieceSymbol(type: string): string {
  const symbols: Record<string, string> = {
    'K': '\u2654', 'Q': '\u2655', 'R': '\u2656', 'B': '\u2657', 'N': '\u2658', 'P': '\u2659',
  }
  return symbols[type.toUpperCase()] || ''
}

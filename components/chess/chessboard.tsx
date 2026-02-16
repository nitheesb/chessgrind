'use client'

import React, { useState, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChessPiece, parseFEN } from './chess-pieces'

interface ChessboardProps {
  fen: string
  onMove?: (from: string, to: string) => boolean
  interactive?: boolean
  flipped?: boolean
  size?: number
  highlightSquares?: string[]
  lastMove?: { from: string; to: string }
  showCoordinates?: boolean
  animationSpeed?: number
}

function squareToIndex(square: string): { row: number; col: number } {
  const col = square.charCodeAt(0) - 97
  const row = 8 - parseInt(square[1])
  return { row, col }
}

function indexToSquare(row: number, col: number): string {
  return String.fromCharCode(97 + col) + (8 - row)
}

export function Chessboard({
  fen,
  onMove,
  interactive = false,
  flipped = false,
  size = 360,
  highlightSquares = [],
  lastMove,
  showCoordinates = true,
  animationSpeed = 0.2,
}: ChessboardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [dragPiece, setDragPiece] = useState<{ piece: string; from: string; x: number; y: number } | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const squareSize = size / 8

  const board = useMemo(() => parseFEN(fen), [fen])

  const getDisplayRow = useCallback((row: number) => flipped ? 7 - row : row, [flipped])
  const getDisplayCol = useCallback((col: number) => flipped ? 7 - col : col, [flipped])

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (!interactive) return

    const actualRow = getDisplayRow(row)
    const actualCol = getDisplayCol(col)
    const square = indexToSquare(actualRow, actualCol)
    const piece = board[actualRow]?.[actualCol]

    if (selectedSquare) {
      if (square === selectedSquare) {
        setSelectedSquare(null)
        return
      }
      if (onMove) {
        const success = onMove(selectedSquare, square)
        if (!success && piece) {
          setSelectedSquare(square)
          return
        }
      }
      setSelectedSquare(null)
    } else if (piece) {
      setSelectedSquare(square)
    }
  }, [interactive, selectedSquare, board, onMove, getDisplayRow, getDisplayCol])

  const handleTouchStart = useCallback((e: React.TouchEvent, row: number, col: number) => {
    if (!interactive) return
    e.preventDefault()

    const actualRow = getDisplayRow(row)
    const actualCol = getDisplayCol(col)
    const piece = board[actualRow]?.[actualCol]
    const square = indexToSquare(actualRow, actualCol)

    if (piece) {
      const touch = e.touches[0]
      setDragPiece({
        piece,
        from: square,
        x: touch.clientX,
        y: touch.clientY,
      })
      setSelectedSquare(square)
    } else if (selectedSquare) {
      if (onMove) {
        onMove(selectedSquare, square)
      }
      setSelectedSquare(null)
    }
  }, [interactive, board, selectedSquare, onMove, getDisplayRow, getDisplayCol])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragPiece) return
    e.preventDefault()
    const touch = e.touches[0]
    setDragPiece(prev => prev ? { ...prev, x: touch.clientX, y: touch.clientY } : null)
  }, [dragPiece])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!dragPiece || !boardRef.current) {
      setDragPiece(null)
      return
    }
    e.preventDefault()

    const rect = boardRef.current.getBoundingClientRect()
    const touch = e.changedTouches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    const col = Math.floor(x / squareSize)
    const row = Math.floor(y / squareSize)

    if (col >= 0 && col < 8 && row >= 0 && row < 8) {
      const actualRow = getDisplayRow(row)
      const actualCol = getDisplayCol(col)
      const targetSquare = indexToSquare(actualRow, actualCol)

      if (targetSquare !== dragPiece.from && onMove) {
        onMove(dragPiece.from, targetSquare)
      }
    }

    setDragPiece(null)
    setSelectedSquare(null)
  }, [dragPiece, squareSize, onMove, getDisplayRow, getDisplayCol])

  const isHighlighted = useCallback((row: number, col: number) => {
    const square = indexToSquare(row, col)
    return highlightSquares.includes(square)
  }, [highlightSquares])

  const isLastMove = useCallback((row: number, col: number) => {
    if (!lastMove) return false
    const square = indexToSquare(row, col)
    return square === lastMove.from || square === lastMove.to
  }, [lastMove])

  const isSelected = useCallback((row: number, col: number) => {
    if (!selectedSquare) return false
    const square = indexToSquare(row, col)
    return square === selectedSquare
  }, [selectedSquare])

  return (
    <div className="relative inline-block">
      <div
        ref={boardRef}
        className="relative rounded-lg overflow-hidden shadow-2xl border-2 border-border/30"
        style={{ width: size, height: size }}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Board squares */}
        {Array.from({ length: 8 }, (_, row) => (
          Array.from({ length: 8 }, (_, col) => {
            const actualRow = getDisplayRow(row)
            const actualCol = getDisplayCol(col)
            const isLight = (actualRow + actualCol) % 2 === 0
            const piece = board[actualRow]?.[actualCol]
            const square = indexToSquare(actualRow, actualCol)
            const highlighted = isHighlighted(actualRow, actualCol)
            const lastMoveSquare = isLastMove(actualRow, actualCol)
            const selected = isSelected(actualRow, actualCol)
            const isDragging = dragPiece?.from === square

            return (
              <div
                key={`${row}-${col}`}
                className={`absolute no-select ${interactive ? 'cursor-pointer' : ''}`}
                style={{
                  left: col * squareSize,
                  top: row * squareSize,
                  width: squareSize,
                  height: squareSize,
                }}
                onClick={() => handleSquareClick(row, col)}
                onTouchStart={(e) => handleTouchStart(e, row, col)}
              >
                {/* Square background */}
                <div
                  className="absolute inset-0 transition-colors duration-150"
                  style={{
                    backgroundColor: selected
                      ? 'rgba(34, 197, 94, 0.5)'
                      : lastMoveSquare
                        ? isLight ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.3)'
                        : highlighted
                          ? 'rgba(250, 204, 21, 0.4)'
                          : isLight
                            ? '#b8c4a0'
                            : '#6d8b4e',
                  }}
                />

                {/* Highlight dot for possible moves */}
                {highlighted && !piece && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="rounded-full bg-black/20"
                      style={{ width: squareSize * 0.3, height: squareSize * 0.3 }}
                    />
                  </div>
                )}

                {/* Piece */}
                <AnimatePresence mode="popLayout">
                  {piece && !isDragging && (
                    <motion.div
                      key={`${square}-${piece}`}
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: animationSpeed, ease: 'easeOut' }}
                    >
                      <ChessPiece piece={piece} size={squareSize * 0.9} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Coordinates */}
                {showCoordinates && col === 0 && (
                  <span
                    className="absolute top-0.5 left-1 text-[9px] font-bold select-none pointer-events-none"
                    style={{ color: isLight ? '#6d8b4e' : '#b8c4a0' }}
                  >
                    {8 - actualRow}
                  </span>
                )}
                {showCoordinates && row === 7 && (
                  <span
                    className="absolute bottom-0 right-1 text-[9px] font-bold select-none pointer-events-none"
                    style={{ color: isLight ? '#6d8b4e' : '#b8c4a0' }}
                  >
                    {String.fromCharCode(97 + actualCol)}
                  </span>
                )}
              </div>
            )
          })
        ))}
      </div>

      {/* Dragging piece overlay */}
      {dragPiece && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: dragPiece.x - squareSize * 0.5,
            top: dragPiece.y - squareSize * 0.75,
            width: squareSize,
            height: squareSize,
          }}
        >
          <ChessPiece piece={dragPiece.piece} size={squareSize * 1.2} />
        </div>
      )}
    </div>
  )
}

// Mini chessboard for previews
export function MiniChessboard({ fen, size = 120 }: { fen: string; size?: number }) {
  const board = useMemo(() => parseFEN(fen), [fen])
  const squareSize = size / 8

  return (
    <div
      className="relative rounded-md overflow-hidden shadow-lg border border-border/20"
      style={{ width: size, height: size }}
    >
      {Array.from({ length: 8 }, (_, row) => (
        Array.from({ length: 8 }, (_, col) => {
          const isLight = (row + col) % 2 === 0
          const piece = board[row]?.[col]

          return (
            <div
              key={`${row}-${col}`}
              className="absolute"
              style={{
                left: col * squareSize,
                top: row * squareSize,
                width: squareSize,
                height: squareSize,
                backgroundColor: isLight ? '#b8c4a0' : '#6d8b4e',
              }}
            >
              {piece && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ChessPiece piece={piece} size={squareSize * 0.85} />
                </div>
              )}
            </div>
          )
        })
      ))}
    </div>
  )
}

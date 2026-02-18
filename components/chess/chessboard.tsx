'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
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
  hintArrow?: { from: string; to: string } | null
  showHintArrow?: boolean
}

// Board colors - clean and professional
const COLORS = {
  lightSquare: '#ebecd0',
  darkSquare: '#739552',
  selectedLight: '#f7f683',
  selectedDark: '#bbcc44',
  lastMoveLight: '#f7f683',
  lastMoveDark: '#bbcc44',
  highlightLight: '#ffff33',
  highlightDark: '#cccc00',
}

function squareToIndex(square: string): { row: number; col: number } {
  const col = square.charCodeAt(0) - 97
  const row = 8 - parseInt(square[1])
  return { row, col }
}

function indexToSquare(row: number, col: number): string {
  return String.fromCharCode(97 + col) + (8 - row)
}

function getSquarePosition(square: string, squareSize: number, flipped: boolean): { x: number; y: number } {
  const { row, col } = squareToIndex(square)
  const displayCol = flipped ? 7 - col : col
  const displayRow = flipped ? 7 - row : row
  return {
    x: displayCol * squareSize + squareSize / 2,
    y: displayRow * squareSize + squareSize / 2,
  }
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
  animationSpeed = 0.15,
  hintArrow,
  showHintArrow = false,
}: ChessboardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [dragPiece, setDragPiece] = useState<{ piece: string; from: string; x: number; y: number } | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const squareSize = size / 8
  const prevFenRef = useRef(fen)
  const [movingPiece, setMovingPiece] = useState<{ piece: string; from: string; to: string } | null>(null)

  const board = useMemo(() => parseFEN(fen), [fen])

  // Detect piece movement for animation
  useEffect(() => {
    if (prevFenRef.current !== fen && lastMove) {
      const prevBoard = parseFEN(prevFenRef.current)
      const { row: fromRow, col: fromCol } = squareToIndex(lastMove.from)
      const piece = prevBoard[fromRow]?.[fromCol]
      if (piece) {
        setMovingPiece({ piece, from: lastMove.from, to: lastMove.to })
        setTimeout(() => setMovingPiece(null), animationSpeed * 1000 + 50)
      }
    }
    prevFenRef.current = fen
  }, [fen, lastMove, animationSpeed])

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
      setDragPiece({ piece, from: square, x: touch.clientX, y: touch.clientY })
      setSelectedSquare(square)
    } else if (selectedSquare) {
      if (onMove) onMove(selectedSquare, square)
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

  // Render move arrow
  const renderArrow = useCallback((from: string, to: string, color: string = 'rgba(255, 170, 0, 0.8)') => {
    const fromPos = getSquarePosition(from, squareSize, flipped)
    const toPos = getSquarePosition(to, squareSize, flipped)
    
    const dx = toPos.x - fromPos.x
    const dy = toPos.y - fromPos.y
    const length = Math.sqrt(dx * dx + dy * dy)
    const arrowHeadSize = squareSize * 0.4
    const lineWidth = squareSize * 0.2
    
    return (
      <motion.svg
        key={`arrow-${from}-${to}`}
        className="absolute inset-0 pointer-events-none"
        style={{ width: size, height: size }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.9, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth={arrowHeadSize}
            markerHeight={arrowHeadSize}
            refX={arrowHeadSize * 0.6}
            refY={arrowHeadSize * 0.5}
            orient="auto"
          >
            <polygon
              points={`0 0, ${arrowHeadSize} ${arrowHeadSize * 0.5}, 0 ${arrowHeadSize}`}
              fill={color}
            />
          </marker>
        </defs>
        <line
          x1={fromPos.x}
          y1={fromPos.y}
          x2={toPos.x - (dx / length) * arrowHeadSize * 0.8}
          y2={toPos.y - (dy / length) * arrowHeadSize * 0.8}
          stroke={color}
          strokeWidth={lineWidth}
          strokeLinecap="round"
          markerEnd="url(#arrowhead)"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}
        />
      </motion.svg>
    )
  }, [squareSize, flipped, size])

  // Calculate position for animated piece
  const getAnimatedPiecePosition = useCallback((from: string, to: string) => {
    const fromPos = getSquarePosition(from, squareSize, flipped)
    const toPos = getSquarePosition(to, squareSize, flipped)
    return { fromPos, toPos }
  }, [squareSize, flipped])

  return (
    <div className="relative inline-block select-none">
      <div
        ref={boardRef}
        className="relative overflow-hidden rounded-sm"
        style={{ 
          width: size, 
          height: size,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}
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
            const isMovingFrom = movingPiece?.from === square
            const isMovingTo = movingPiece?.to === square

            // Determine square color
            let bgColor = isLight ? COLORS.lightSquare : COLORS.darkSquare
            if (selected) {
              bgColor = isLight ? COLORS.selectedLight : COLORS.selectedDark
            } else if (lastMoveSquare) {
              bgColor = isLight ? COLORS.lastMoveLight : COLORS.lastMoveDark
            }

            return (
              <div
                key={`${row}-${col}`}
                className={`absolute ${interactive ? 'cursor-pointer' : ''}`}
                style={{
                  left: col * squareSize,
                  top: row * squareSize,
                  width: squareSize,
                  height: squareSize,
                  backgroundColor: bgColor,
                  transition: 'background-color 0.15s ease',
                }}
                onClick={() => handleSquareClick(row, col)}
                onTouchStart={(e) => handleTouchStart(e, row, col)}
              >
                {/* Move indicator dot */}
                {highlighted && !piece && (
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <div
                      className="rounded-full opacity-40"
                      style={{ 
                        width: squareSize * 0.33, 
                        height: squareSize * 0.33,
                        backgroundColor: '#000',
                      }}
                    />
                  </motion.div>
                )}

                {/* Capture indicator ring */}
                {highlighted && piece && (
                  <motion.div 
                    className="absolute inset-[5%] rounded-full"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    style={{
                      border: `${squareSize * 0.08}px solid rgba(0,0,0,0.35)`,
                    }}
                  />
                )}

                {/* Static piece (not being dragged or animated) */}
                {piece && !isDragging && !isMovingFrom && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ChessPiece piece={piece} size={squareSize * 0.9} />
                  </div>
                )}

                {/* Piece arriving (animated) */}
                {isMovingTo && movingPiece && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center z-10"
                    initial={{ 
                      x: getAnimatedPiecePosition(movingPiece.from, movingPiece.to).fromPos.x - 
                         getAnimatedPiecePosition(movingPiece.from, movingPiece.to).toPos.x,
                      y: getAnimatedPiecePosition(movingPiece.from, movingPiece.to).fromPos.y - 
                         getAnimatedPiecePosition(movingPiece.from, movingPiece.to).toPos.y,
                    }}
                    animate={{ x: 0, y: 0 }}
                    transition={{ 
                      duration: animationSpeed, 
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                  >
                    <ChessPiece piece={movingPiece.piece} size={squareSize * 0.9} />
                  </motion.div>
                )}

                {/* Coordinates */}
                {showCoordinates && col === 0 && (
                  <span
                    className="absolute top-0.5 left-1 text-[11px] font-bold select-none pointer-events-none"
                    style={{ color: isLight ? COLORS.darkSquare : COLORS.lightSquare }}
                  >
                    {8 - actualRow}
                  </span>
                )}
                {showCoordinates && row === 7 && (
                  <span
                    className="absolute bottom-0 right-1 text-[11px] font-bold select-none pointer-events-none"
                    style={{ color: isLight ? COLORS.darkSquare : COLORS.lightSquare }}
                  >
                    {String.fromCharCode(97 + actualCol)}
                  </span>
                )}
              </div>
            )
          })
        ))}

        {/* Hint arrow */}
        <AnimatePresence>
          {showHintArrow && hintArrow && renderArrow(hintArrow.from, hintArrow.to)}
        </AnimatePresence>
      </div>

      {/* Dragging piece */}
      {dragPiece && (
        <motion.div
          className="fixed pointer-events-none z-50"
          initial={{ scale: 1 }}
          animate={{ scale: 1.1 }}
          style={{
            left: dragPiece.x - squareSize * 0.5,
            top: dragPiece.y - squareSize * 0.6,
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))',
          }}
        >
          <ChessPiece piece={dragPiece.piece} size={squareSize * 0.95} />
        </motion.div>
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
      className="relative rounded-sm overflow-hidden"
      style={{ 
        width: size, 
        height: size,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
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
                backgroundColor: isLight ? COLORS.lightSquare : COLORS.darkSquare,
              }}
            >
              {piece && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ChessPiece piece={piece} size={squareSize * 0.88} />
                </div>
              )}
            </div>
          )
        })
      ))}
    </div>
  )
}

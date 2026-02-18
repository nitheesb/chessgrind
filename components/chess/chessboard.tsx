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

function squareToIndex(square: string): { row: number; col: number } {
  const col = square.charCodeAt(0) - 97
  const row = 8 - parseInt(square[1])
  return { row, col }
}

function indexToSquare(row: number, col: number): string {
  return String.fromCharCode(97 + col) + (8 - row)
}

// Get pixel position for a square
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
  animationSpeed = 0.25,
  hintArrow,
  showHintArrow = false,
}: ChessboardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [dragPiece, setDragPiece] = useState<{ piece: string; from: string; x: number; y: number } | null>(null)
  const [animatingPiece, setAnimatingPiece] = useState<{ piece: string; from: string; to: string } | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const squareSize = size / 8
  const prevFenRef = useRef(fen)

  const board = useMemo(() => parseFEN(fen), [fen])

  // Track piece movements for animation
  useEffect(() => {
    if (prevFenRef.current !== fen && lastMove) {
      const prevBoard = parseFEN(prevFenRef.current)
      const { row: fromRow, col: fromCol } = squareToIndex(lastMove.from)
      const piece = prevBoard[fromRow]?.[fromCol]
      if (piece) {
        setAnimatingPiece({ piece, from: lastMove.from, to: lastMove.to })
        setTimeout(() => setAnimatingPiece(null), animationSpeed * 1000)
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

  // Render arrow for hints
  const renderArrow = useCallback((from: string, to: string, color: string = 'rgba(34, 197, 94, 0.8)') => {
    const fromPos = getSquarePosition(from, squareSize, flipped)
    const toPos = getSquarePosition(to, squareSize, flipped)
    
    const dx = toPos.x - fromPos.x
    const dy = toPos.y - fromPos.y
    const length = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx) * 180 / Math.PI
    
    const arrowHeadSize = squareSize * 0.35
    const lineWidth = squareSize * 0.15
    
    return (
      <motion.svg
        key={`arrow-${from}-${to}`}
        className="absolute inset-0 pointer-events-none"
        style={{ width: size, height: size }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth={arrowHeadSize}
            markerHeight={arrowHeadSize}
            refX={arrowHeadSize * 0.5}
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
          x2={toPos.x - (dx / length) * arrowHeadSize * 0.7}
          y2={toPos.y - (dy / length) * arrowHeadSize * 0.7}
          stroke={color}
          strokeWidth={lineWidth}
          strokeLinecap="round"
          markerEnd="url(#arrowhead)"
          style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
        />
        {/* Glow effect */}
        <line
          x1={fromPos.x}
          y1={fromPos.y}
          x2={toPos.x - (dx / length) * arrowHeadSize * 0.7}
          y2={toPos.y - (dy / length) * arrowHeadSize * 0.7}
          stroke={color}
          strokeWidth={lineWidth * 2}
          strokeLinecap="round"
          opacity={0.3}
          style={{ filter: 'blur(4px)' }}
        />
      </motion.svg>
    )
  }, [squareSize, flipped, size])

  return (
    <div className="relative inline-block">
      {/* Board outer frame */}
      <div className="p-1 rounded-xl bg-gradient-to-br from-amber-900/40 via-amber-800/30 to-amber-900/40 shadow-2xl">
        <div
          ref={boardRef}
          className="relative rounded-lg overflow-hidden"
          style={{ 
            width: size, 
            height: size,
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.4)',
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
              const isAnimating = animatingPiece?.to === square

              // Calculate gradient colors for 3D effect
              const lightColor = isLight 
                ? 'linear-gradient(135deg, #e8dcc4 0%, #d4c4a8 50%, #c8b898 100%)'
                : 'linear-gradient(135deg, #7d9a5a 0%, #6b8a4a 50%, #5a7a3a 100%)'

              return (
                <div
                  key={`${row}-${col}`}
                  className={`absolute no-select ${interactive ? 'cursor-pointer active:brightness-110' : ''}`}
                  style={{
                    left: col * squareSize,
                    top: row * squareSize,
                    width: squareSize,
                    height: squareSize,
                  }}
                  onClick={() => handleSquareClick(row, col)}
                  onTouchStart={(e) => handleTouchStart(e, row, col)}
                >
                  {/* Square background with gradient */}
                  <div
                    className="absolute inset-0 transition-all duration-150"
                    style={{
                      background: selected
                        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.6) 0%, rgba(22, 163, 74, 0.7) 100%)'
                        : lastMoveSquare
                          ? isLight 
                            ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.4), rgba(234, 179, 8, 0.5))'
                            : 'linear-gradient(135deg, rgba(34, 197, 94, 0.35), rgba(22, 163, 74, 0.45))'
                          : highlighted
                            ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.5), rgba(234, 179, 8, 0.6))'
                            : lightColor,
                      boxShadow: selected 
                        ? 'inset 0 0 12px rgba(34, 197, 94, 0.5)' 
                        : lastMoveSquare
                          ? 'inset 0 0 8px rgba(250, 204, 21, 0.3)'
                          : 'inset 1px 1px 0 rgba(255,255,255,0.1), inset -1px -1px 0 rgba(0,0,0,0.1)',
                    }}
                  />

                  {/* Highlight dot for possible moves */}
                  {highlighted && !piece && (
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      <div
                        className="rounded-full"
                        style={{ 
                          width: squareSize * 0.32, 
                          height: squareSize * 0.32,
                          background: 'radial-gradient(circle, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.15) 100%)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        }}
                      />
                    </motion.div>
                  )}

                  {/* Capture ring indicator */}
                  {highlighted && piece && (
                    <motion.div 
                      className="absolute inset-1 rounded-full border-[3px] border-black/25"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      style={{ boxShadow: 'inset 0 0 8px rgba(0,0,0,0.2)' }}
                    />
                  )}

                  {/* Piece with animation */}
                  <AnimatePresence mode="popLayout">
                    {piece && !isDragging && (
                      <motion.div
                        key={`${square}-${piece}-${fen}`}
                        className="absolute inset-0 flex items-center justify-center"
                        initial={isAnimating ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
                        animate={{ 
                          scale: 1, 
                          opacity: 1,
                          transition: { 
                            type: 'spring', 
                            stiffness: 300, 
                            damping: 25,
                            duration: animationSpeed 
                          }
                        }}
                        exit={{ scale: 0.5, opacity: 0, transition: { duration: animationSpeed * 0.5 } }}
                        whileHover={interactive ? { scale: 1.05 } : {}}
                        whileTap={interactive ? { scale: 0.95 } : {}}
                      >
                        <ChessPiece piece={piece} size={squareSize * 0.88} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Coordinates */}
                  {showCoordinates && col === 0 && (
                    <span
                      className="absolute top-0.5 left-1 text-[10px] font-bold select-none pointer-events-none"
                      style={{ 
                        color: isLight ? 'rgba(90, 122, 58, 0.9)' : 'rgba(200, 184, 152, 0.9)',
                        textShadow: '0 1px 1px rgba(0,0,0,0.1)',
                      }}
                    >
                      {8 - actualRow}
                    </span>
                  )}
                  {showCoordinates && row === 7 && (
                    <span
                      className="absolute bottom-0 right-1 text-[10px] font-bold select-none pointer-events-none"
                      style={{ 
                        color: isLight ? 'rgba(90, 122, 58, 0.9)' : 'rgba(200, 184, 152, 0.9)',
                        textShadow: '0 1px 1px rgba(0,0,0,0.1)',
                      }}
                    >
                      {String.fromCharCode(97 + actualCol)}
                    </span>
                  )}
                </div>
              )
            })
          ))}

          {/* Hint arrow overlay */}
          <AnimatePresence>
            {showHintArrow && hintArrow && renderArrow(hintArrow.from, hintArrow.to)}
          </AnimatePresence>
        </div>
      </div>

      {/* Dragging piece overlay */}
      {dragPiece && (
        <motion.div
          className="fixed pointer-events-none z-50"
          initial={{ scale: 1 }}
          animate={{ scale: 1.15 }}
          style={{
            left: dragPiece.x - squareSize * 0.55,
            top: dragPiece.y - squareSize * 0.75,
            width: squareSize,
            height: squareSize,
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))',
          }}
        >
          <ChessPiece piece={dragPiece.piece} size={squareSize * 1.1} />
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
      className="relative rounded-md overflow-hidden"
      style={{ 
        width: size, 
        height: size,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3), inset 0 0 8px rgba(0,0,0,0.2)',
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
                background: isLight 
                  ? 'linear-gradient(135deg, #e8dcc4 0%, #d4c4a8 100%)'
                  : 'linear-gradient(135deg, #7d9a5a 0%, #5a7a3a 100%)',
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

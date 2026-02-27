'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect, memo } from 'react'
import { ChessPiece, parseFEN } from './chess-pieces'
import { getGlobalSoundHaptics } from '@/lib/use-sound-haptics'

export type BoardStyle = 'green' | 'brown' | 'blue' | 'purple' | 'pink'

export const BOARD_THEMES: Record<BoardStyle, { light: string; dark: string; selectedLight: string; selectedDark: string }> = {
  green: { light: '#ebecd0', dark: '#739552', selectedLight: '#f7f769', selectedDark: '#bbcb2b' },
  brown: { light: '#f0d9b5', dark: '#b58863', selectedLight: '#f7ec59', selectedDark: '#daa520' },
  blue:  { light: '#dee3e6', dark: '#8ca2ad', selectedLight: '#c3d9e6', selectedDark: '#6f9bb3' },
  purple:{ light: '#e8dff0', dark: '#9068b0', selectedLight: '#d8c4f0', selectedDark: '#a87cd4' },
  pink:  { light: '#f5dce0', dark: '#d4778a', selectedLight: '#f7b4c4', selectedDark: '#e8607a' },
}

interface ChessboardProps {
  fen: string
  onMove?: (from: string, to: string) => boolean
  interactive?: boolean
  flipped?: boolean
  orientation?: 'white' | 'black'
  size?: number
  highlightSquares?: string[]
  lastMove?: { from: string; to: string }
  showCoordinates?: boolean
  hintArrow?: { from: string; to: string } | null
  showHint?: { from: string; to: string } | null
  showHintArrow?: boolean
  onPieceSelect?: () => void
  onPieceMove?: (captured: boolean) => void
  boardStyle?: BoardStyle
  pieceStyle?: 'standard' | 'neo' | 'classic' | 'minimal' | 'pink'
}

const squareToIndex = (square: string) => ({
  row: 8 - parseInt(square[1]),
  col: square.charCodeAt(0) - 97
})

const indexToSquare = (row: number, col: number) => 
  String.fromCharCode(97 + col) + (8 - row)

// Memoized square component for performance
const Square = memo(function Square({
  row,
  col,
  piece,
  isLight,
  isSelected,
  isLastMove,
  isHighlighted,
  squareSize,
  onClick,
  onTouchStart,
  interactive,
  theme,
  pieceStyle,
}: {
  row: number
  col: number
  piece: string | null
  isLight: boolean
  isSelected: boolean
  isLastMove: boolean
  isHighlighted: boolean
  squareSize: number
  onClick: () => void
  onTouchStart: (e: React.TouchEvent) => void
  interactive: boolean
  theme: typeof BOARD_THEMES[BoardStyle]
  pieceStyle?: 'standard' | 'neo' | 'classic' | 'minimal' | 'pink'
}) {
  // Determine background color
  let bg = isLight ? theme.light : theme.dark
  if (isSelected || isLastMove) {
    bg = isLight ? theme.selectedLight : theme.selectedDark
  }

  return (
    <div
      className={interactive ? 'cursor-pointer' : ''}
      style={{
        position: 'absolute',
        left: col * squareSize,
        top: row * squareSize,
        width: squareSize,
        height: squareSize,
        backgroundColor: bg,
      }}
      onClick={onClick}
      onTouchStart={onTouchStart}
    >
      {/* Move indicator - dot for empty, ring for capture */}
      {isHighlighted && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {piece ? (
            // Capture ring
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: `${squareSize * 0.08}px solid rgba(0,0,0,0.14)`,
              boxSizing: 'border-box',
            }} />
          ) : (
            // Move dot
            <div style={{
              width: squareSize * 0.33,
              height: squareSize * 0.33,
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.14)',
            }} />
          )}
        </div>
      )}

      {/* Piece */}
      {piece && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <ChessPiece piece={piece} size={squareSize * 0.85} pieceStyle={pieceStyle} />
        </div>
      )}
    </div>
  )
})

// Animated piece during movement
function AnimatedPiece({
  piece,
  from,
  to,
  squareSize,
  flipped,
  onComplete,
  pieceStyle,
}: {
  piece: string
  from: string
  to: string
  squareSize: number
  flipped: boolean
  onComplete: () => void
  pieceStyle?: 'standard' | 'neo' | 'classic' | 'minimal' | 'pink'
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const rafRef = useRef<number>()
  const startTimeRef = useRef<number>()

  const getPos = useCallback((square: string) => {
    const { row, col } = squareToIndex(square)
    const displayCol = flipped ? 7 - col : col
    const displayRow = flipped ? 7 - row : row
    return {
      x: displayCol * squareSize,
      y: displayRow * squareSize,
    }
  }, [squareSize, flipped])

  useEffect(() => {
    const fromPos = getPos(from)
    const toPos = getPos(to)
    const duration = 120 // ms - fast and snappy

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      
      // Ease out cubic for snappy feel
      const eased = 1 - Math.pow(1 - progress, 3)
      
      setPosition({
        x: fromPos.x + (toPos.x - fromPos.x) * eased,
        y: fromPos.y + (toPos.y - fromPos.y) * eased,
      })

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        onComplete()
      }
    }

    setPosition(fromPos)
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [from, to, getPos, onComplete])

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: squareSize,
        height: squareSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      <ChessPiece piece={piece} size={squareSize * 0.85} pieceStyle={pieceStyle} />
    </div>
  )
}

// Hint indicator component - subtle pulsing circles
function HintIndicator({
  from,
  to,
  squareSize,
  flipped,
}: {
  from: string
  to: string
  squareSize: number
  flipped: boolean
}) {
  const getPos = (square: string) => {
    const { row, col } = squareToIndex(square)
    const displayCol = flipped ? 7 - col : col
    const displayRow = flipped ? 7 - row : row
    return {
      x: displayCol * squareSize,
      y: displayRow * squareSize,
    }
  }

  const fromPos = getPos(from)
  const toPos = getPos(to)

  return (
    <>
      {/* Source square - pulsing ring */}
      <div
        style={{
          position: 'absolute',
          left: fromPos.x,
          top: fromPos.y,
          width: squareSize,
          height: squareSize,
          pointerEvents: 'none',
          zIndex: 35,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: squareSize * 0.1,
            borderRadius: '50%',
            border: `3px solid rgba(255, 170, 0, 0.9)`,
            animation: 'hint-pulse 1.2s ease-in-out infinite',
            boxShadow: '0 0 12px rgba(255, 170, 0, 0.5)',
          }}
        />
      </div>
      {/* Target square - filled dot */}
      <div
        style={{
          position: 'absolute',
          left: toPos.x,
          top: toPos.y,
          width: squareSize,
          height: squareSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 35,
        }}
      >
        <div
          style={{
            width: squareSize * 0.35,
            height: squareSize * 0.35,
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 170, 0, 0.85)',
            animation: 'hint-pulse 1.2s ease-in-out infinite',
            boxShadow: '0 0 10px rgba(255, 170, 0, 0.6)',
          }}
        />
      </div>
      <style jsx>{`
        @keyframes hint-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
      `}</style>
    </>
  )
}

export function Chessboard({
  fen,
  onMove,
  interactive = false,
  flipped = false,
  orientation,
  size = 360,
  highlightSquares = [],
  lastMove,
  showCoordinates = true,
  hintArrow,
  showHint,
  showHintArrow = false,
  boardStyle = 'green',
  pieceStyle = 'standard',
}: ChessboardProps) {
  // Support both flipped and orientation props
  const isFlipped = orientation ? orientation === 'black' : flipped
  const theme = BOARD_THEMES[boardStyle]
  
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  const [dragPiece, setDragPiece] = useState<{ piece: string; from: string; x: number; y: number } | null>(null)
  const [animating, setAnimating] = useState<{ piece: string; from: string; to: string } | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const prevFenRef = useRef(fen)
  const squareSize = size / 8

  // Use either hintArrow or showHint
  const activeHint = hintArrow || showHint

  const board = useMemo(() => parseFEN(fen), [fen])

  // Detect moves and animate
  useEffect(() => {
    if (prevFenRef.current !== fen && lastMove) {
      const prevBoard = parseFEN(prevFenRef.current)
      const { row, col } = squareToIndex(lastMove.from)
      const piece = prevBoard[row]?.[col]
      if (piece) {
        setAnimating({ piece, from: lastMove.from, to: lastMove.to })
      }
    }
    prevFenRef.current = fen
  }, [fen, lastMove])

  const getActualCoords = useCallback((displayRow: number, displayCol: number) => ({
    row: isFlipped ? 7 - displayRow : displayRow,
    col: isFlipped ? 7 - displayCol : displayCol,
  }), [isFlipped])

  const handleSquareClick = useCallback((displayRow: number, displayCol: number) => {
    if (!interactive) return
    
    const { row, col } = getActualCoords(displayRow, displayCol)
    const square = indexToSquare(row, col)
    const piece = board[row]?.[col]
    const soundHaptics = getGlobalSoundHaptics()

    if (selectedSquare) {
      if (square === selectedSquare) {
        setSelectedSquare(null)
        return
      }
      if (onMove) {
        const targetPiece = board[row]?.[col]
        const success = onMove(selectedSquare, square)
        if (success) {
          // Play appropriate sound
          soundHaptics.playSound(targetPiece ? 'capture' : 'move')
          soundHaptics.triggerHaptic(targetPiece ? 'medium' : 'light')
        } else if (piece) {
          // Selecting a different piece
          soundHaptics.playSound('click')
          soundHaptics.triggerHaptic('selection')
          setSelectedSquare(square)
          return
        } else {
          // Invalid move
          soundHaptics.playSound('illegal')
          soundHaptics.triggerHaptic('error')
        }
      }
      setSelectedSquare(null)
    } else if (piece) {
      soundHaptics.playSound('click')
      soundHaptics.triggerHaptic('selection')
      setSelectedSquare(square)
    }
  }, [interactive, selectedSquare, board, onMove, getActualCoords])

  const handleTouchStart = useCallback((e: React.TouchEvent, displayRow: number, displayCol: number) => {
    if (!interactive) return
    e.preventDefault()

    const { row, col } = getActualCoords(displayRow, displayCol)
    const piece = board[row]?.[col]
    const square = indexToSquare(row, col)
    const soundHaptics = getGlobalSoundHaptics()

    if (piece) {
      const touch = e.touches[0]
      soundHaptics.playSound('click')
      soundHaptics.triggerHaptic('selection')
      setDragPiece({ piece, from: square, x: touch.clientX, y: touch.clientY })
      setSelectedSquare(square)
    } else if (selectedSquare) {
      const targetPiece = board[row]?.[col]
      if (onMove) {
        const success = onMove(selectedSquare, square)
        if (success) {
          soundHaptics.playSound(targetPiece ? 'capture' : 'move')
          soundHaptics.triggerHaptic(targetPiece ? 'medium' : 'light')
        }
      }
      setSelectedSquare(null)
    }
  }, [interactive, board, selectedSquare, onMove, getActualCoords])

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
    const displayCol = Math.floor(x / squareSize)
    const displayRow = Math.floor(y / squareSize)
    const soundHaptics = getGlobalSoundHaptics()

    if (displayCol >= 0 && displayCol < 8 && displayRow >= 0 && displayRow < 8) {
      const { row, col } = getActualCoords(displayRow, displayCol)
      const targetSquare = indexToSquare(row, col)
      const targetPiece = board[row]?.[col]
      if (targetSquare !== dragPiece.from && onMove) {
        const success = onMove(dragPiece.from, targetSquare)
        if (success) {
          soundHaptics.playSound(targetPiece ? 'capture' : 'move')
          soundHaptics.triggerHaptic(targetPiece ? 'medium' : 'light')
        }
      }
    }

    setDragPiece(null)
    setSelectedSquare(null)
  }, [dragPiece, squareSize, onMove, getActualCoords, board])

  // Pre-compute square states for performance
  const highlightSet = useMemo(() => new Set(highlightSquares), [highlightSquares])
  const lastMoveSet = useMemo(() => {
    if (!lastMove) return new Set<string>()
    return new Set([lastMove.from, lastMove.to])
  }, [lastMove])

  return (
    <div className="relative inline-block select-none touch-none">
      <div
        ref={boardRef}
        className="relative overflow-hidden rounded"
        style={{ 
          width: size, 
          height: size,
          boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
        }}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Render squares */}
        {Array.from({ length: 64 }, (_, i) => {
          const displayRow = Math.floor(i / 8)
          const displayCol = i % 8
          const { row, col } = getActualCoords(displayRow, displayCol)
          const square = indexToSquare(row, col)
          const piece = board[row]?.[col]
          const isLight = (row + col) % 2 === 0
          const isDragging = dragPiece?.from === square
          const isAnimatingFrom = animating?.from === square

          return (
            <Square
              key={square}
              row={displayRow}
              col={displayCol}
              piece={isDragging || isAnimatingFrom ? null : piece}
              isLight={isLight}
              isSelected={selectedSquare === square}
              isLastMove={lastMoveSet.has(square) && !animating}
              isHighlighted={highlightSet.has(square)}
              squareSize={squareSize}
              onClick={() => handleSquareClick(displayRow, displayCol)}
              onTouchStart={(e) => handleTouchStart(e, displayRow, displayCol)}
              interactive={interactive}
              theme={theme}
              pieceStyle={pieceStyle}
            />
          )
        })}

        {/* Coordinates */}
        {showCoordinates && (
          <>
            {Array.from({ length: 8 }, (_, i) => {
              const { row } = getActualCoords(i, 0)
              const isLight = (row + (isFlipped ? 7 : 0)) % 2 === 0
              return (
                <span
                  key={`rank-${i}`}
                  className="absolute text-[11px] font-bold pointer-events-none"
                  style={{
                    left: 2,
                    top: i * squareSize + 2,
                    color: isLight ? theme.dark : theme.light,
                  }}
                >
                  {isFlipped ? i + 1 : 8 - i}
                </span>
              )
            })}
            {Array.from({ length: 8 }, (_, i) => {
              const { col } = getActualCoords(7, i)
              const isLight = ((isFlipped ? 7 : 0) + col) % 2 === 0
              return (
                <span
                  key={`file-${i}`}
                  className="absolute text-[11px] font-bold pointer-events-none"
                  style={{
                    right: (7 - i) * squareSize + 2,
                    bottom: 1,
                    color: isLight ? theme.dark : theme.light,
                  }}
                >
                  {String.fromCharCode(97 + col)}
                </span>
              )
            })}
          </>
        )}

        {/* Animated piece */}
        {animating && (
          <AnimatedPiece
            piece={animating.piece}
            from={animating.from}
            to={animating.to}
            squareSize={squareSize}
            flipped={isFlipped}
            onComplete={() => setAnimating(null)}
            pieceStyle={pieceStyle}
          />
        )}

        {/* Hint indicator */}
        {(showHintArrow && hintArrow) || activeHint ? (
          <HintIndicator
            from={(activeHint || hintArrow)!.from}
            to={(activeHint || hintArrow)!.to}
            squareSize={squareSize}
            flipped={isFlipped}
          />
        ) : null}
      </div>

      {/* Dragged piece */}
      {dragPiece && (
        <div
          style={{
            position: 'fixed',
            left: dragPiece.x - squareSize * 0.45,
            top: dragPiece.y - squareSize * 0.55,
            zIndex: 100,
            pointerEvents: 'none',
            transform: 'scale(1.1)',
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))',
          }}
        >
          <ChessPiece piece={dragPiece.piece} size={squareSize * 0.85} pieceStyle={pieceStyle} />
        </div>
      )}
    </div>
  )
}

// Mini chessboard for previews
export const MiniChessboard = memo(function MiniChessboard({ fen, size = 120, boardStyle = 'green', pieceStyle = 'standard' }: { fen: string; size?: number; boardStyle?: BoardStyle; pieceStyle?: 'standard' | 'neo' | 'classic' | 'minimal' | 'pink' }) {
  const board = useMemo(() => parseFEN(fen), [fen])
  const squareSize = size / 8
  const miniTheme = BOARD_THEMES[boardStyle]

  return (
    <div
      className="relative rounded overflow-hidden"
      style={{ 
        width: size, 
        height: size,
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
      }}
    >
      {Array.from({ length: 64 }, (_, i) => {
        const row = Math.floor(i / 8)
        const col = i % 8
        const isLight = (row + col) % 2 === 0
        const piece = board[row]?.[col]

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: col * squareSize,
              top: row * squareSize,
              width: squareSize,
              height: squareSize,
              backgroundColor: isLight ? miniTheme.light : miniTheme.dark,
            }}
          >
            {piece && (
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ChessPiece piece={piece} size={squareSize * 0.85} pieceStyle={pieceStyle} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
})

'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chess } from 'chess.js'
import { ChessPiece, parseFEN } from './chess-pieces'
import { getGlobalSoundHaptics } from '@/lib/use-sound-haptics'

export type BoardStyle = 'green' | 'brown' | 'blue' | 'purple' | 'pink' | 'tournament' | 'ocean'

export const BOARD_THEMES: Record<BoardStyle, { light: string; dark: string; selectedLight: string; selectedDark: string }> = {
  green: { light: '#ebecd0', dark: '#739552', selectedLight: '#f7f769', selectedDark: '#bbcb2b' },
  brown: { light: '#f0d9b5', dark: '#b58863', selectedLight: '#f7ec59', selectedDark: '#daa520' },
  blue: { light: '#dee3e6', dark: '#8ca2ad', selectedLight: '#c3d9e6', selectedDark: '#6f9bb3' },
  purple: { light: '#e8dff0', dark: '#9068b0', selectedLight: '#d8c4f0', selectedDark: '#a87cd4' },
  pink: { light: '#f5dce0', dark: '#d4778a', selectedLight: '#f7b4c4', selectedDark: '#e8607a' },
  tournament: { light: '#f5f5f5', dark: '#2d2d2d', selectedLight: '#e8e82a', selectedDark: '#b0b000' },
  ocean: { light: '#c9e8f0', dark: '#4a8fa8', selectedLight: '#aee5f5', selectedDark: '#2a7090' },
}

interface ChessboardProps {
  fen: string
  onMove?: (from: string, to: string, promotion?: string) => boolean
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
  pieceStyle?: 'neo' | 'classic'
  isCheck?: boolean
  arrows?: Array<{ from: string; to: string; color?: string }>
  onArrowDraw?: (arrows: Array<{ from: string; to: string; color?: string }>) => void
  allowArrowDrawing?: boolean
  blindfoldMode?: boolean
  isPlayerMove?: boolean
}

const squareToIndex = (square: string) => ({
  row: 8 - parseInt(square[1]),
  col: square.charCodeAt(0) - 97
})

const indexToSquare = (row: number, col: number) =>
  String.fromCharCode(97 + col) + (8 - row)

function getPieceName(piece: string): string {
  const names: Record<string, string> = { K: 'King', Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight', P: 'Pawn' }
  return names[piece[1]] || piece
}

const PIECE_SYMBOLS: Record<string, string> = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
}
const LONG_PRESS_VALUES: Record<string, number> = { K: 0, Q: 9, R: 5, B: 3, N: 3, P: 1 }

// Memoized square component for performance
const Square = memo(function Square({
  row,
  col,
  piece,
  isLight,
  isSelected,
  isLastMove,
  isHighlighted,
  isLegalMove,
  isInCheck,
  squareSize,
  onClick,
  onTouchStart,
  onMouseDown,
  onMouseUp,
  interactive,
  theme,
  pieceStyle,
  square,
  onKeyDown,
  blindfoldMode,
}: {
  row: number
  col: number
  piece: string | null
  isLight: boolean
  isSelected: boolean
  isLastMove: boolean
  isHighlighted: boolean
  isLegalMove: boolean
  isInCheck: boolean
  squareSize: number
  onClick: () => void
  onTouchStart: (e: React.TouchEvent) => void
  onMouseDown?: (e: React.MouseEvent) => void
  onMouseUp?: (e: React.MouseEvent) => void
  interactive: boolean
  theme: typeof BOARD_THEMES[BoardStyle]
  pieceStyle?: 'neo' | 'classic'
  square: string
  onKeyDown?: (e: React.KeyboardEvent, sq: string) => void
  blindfoldMode?: boolean
}) {
  // Determine background color
  let bg = isLight ? theme.light : theme.dark
  if (isSelected || isLastMove) {
    bg = isLight ? theme.selectedLight : theme.selectedDark
  }

  const showLegalIndicator = isLegalMove || isHighlighted
  const ariaLabel = square + (piece ? `, ${piece[0] === 'w' ? 'white' : 'black'} ${getPieceName(piece)}` : '') + (showLegalIndicator ? ', legal move' : '')

  return (
    <div
      role="gridcell"
      aria-label={ariaLabel}
      tabIndex={interactive ? 0 : -1}
      className={interactive ? 'cursor-pointer' : ''}
      style={{
        position: 'absolute',
        left: col * squareSize,
        top: row * squareSize,
        width: squareSize,
        height: squareSize,
        backgroundColor: bg,
        transition: 'background-color 0.15s ease',
      }}
      onClick={onClick}
      onTouchStart={onTouchStart}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onKeyDown={onKeyDown ? (e) => onKeyDown(e, square) : undefined}
    >
      {/* Selected piece glow */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          inset: 0,
          boxShadow: 'inset 0 0 12px rgba(245,158,11,0.5)',
          zIndex: 1,
          pointerEvents: 'none',
        }} />
      )}

      {/* Check indicator on king */}
      {isInCheck && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(255,0,0,0.6) 0%, rgba(255,0,0,0.3) 50%, transparent 70%)',
          zIndex: 1,
        }} />
      )}

      {/* Legal move indicator - dot for empty, corner triangles for capture */}
      {showLegalIndicator && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        >
          {piece ? (
            /* Capture indicator: triangular corners */
            <>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 0, height: 0, borderTop: `${squareSize * 0.2}px solid rgba(0,0,0,0.25)`, borderRight: `${squareSize * 0.2}px solid transparent` }} />
              <div style={{ position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderTop: `${squareSize * 0.2}px solid rgba(0,0,0,0.25)`, borderLeft: `${squareSize * 0.2}px solid transparent` }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: 0, height: 0, borderBottom: `${squareSize * 0.2}px solid rgba(0,0,0,0.25)`, borderRight: `${squareSize * 0.2}px solid transparent` }} />
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 0, height: 0, borderBottom: `${squareSize * 0.2}px solid rgba(0,0,0,0.25)`, borderLeft: `${squareSize * 0.2}px solid transparent` }} />
            </>
          ) : (
            /* Move dot with subtle shadow */
            <div style={{
              width: squareSize * 0.3,
              height: squareSize * 0.3,
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.2)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              transition: 'transform 0.15s ease',
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
          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))',
          transform: isSelected ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 0.15s ease, opacity 0.2s ease',
          zIndex: 3,
          opacity: blindfoldMode ? 0 : 1,
        }}>
          <ChessPiece piece={piece} size={squareSize * 0.85} pieceStyle={pieceStyle} />
        </div>
      )}
    </div>
  )
})

// Animated piece during movement — spring physics via framer-motion
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
  pieceStyle?: 'neo' | 'classic'
}) {
  const getPos = useCallback((square: string) => {
    const { row, col } = squareToIndex(square)
    const displayCol = flipped ? 7 - col : col
    const displayRow = flipped ? 7 - row : row
    return {
      x: displayCol * squareSize,
      y: displayRow * squareSize,
    }
  }, [squareSize, flipped])

  const fromPos = getPos(from)
  const toPos = getPos(to)

  return (
    <motion.div
      initial={{ x: fromPos.x, y: fromPos.y }}
      animate={{ x: toPos.x, y: toPos.y }}
      transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
      style={{
        position: 'absolute',
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
    </motion.div>
  )
}

// Snap-back animation for illegal drag drops
function SnapBackPiece({
  piece,
  fromX,
  fromY,
  toSquare,
  squareSize,
  flipped,
  boardRect,
  onComplete,
  pieceStyle,
}: {
  piece: string
  fromX: number
  fromY: number
  toSquare: string
  squareSize: number
  flipped: boolean
  boardRect: DOMRect
  onComplete: () => void
  pieceStyle?: 'neo' | 'classic'
}) {
  const { row, col } = squareToIndex(toSquare)
  const displayCol = flipped ? 7 - col : col
  const displayRow = flipped ? 7 - row : row
  // Convert board-relative target to fixed screen coords
  const targetX = boardRect.left + displayCol * squareSize + squareSize * 0.075
  const targetY = boardRect.top + displayRow * squareSize + squareSize * 0.075

  return (
    <motion.div
      initial={{ x: fromX - squareSize * 0.45, y: fromY - squareSize * 0.55, scale: 1.1 }}
      animate={{ x: targetX, y: targetY, scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.7 }}
      onAnimationComplete={onComplete}
      style={{
        position: 'fixed',
        width: squareSize * 0.85,
        height: squareSize * 0.85,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))',
      }}
    >
      <ChessPiece piece={piece} size={squareSize * 0.85} pieceStyle={pieceStyle} />
    </motion.div>
  )
}

// Captured piece fly-off animation
function CapturedPieceAnim({
  piece,
  square,
  squareSize,
  flipped,
  capturedByColor,
  onComplete,
  pieceStyle,
}: {
  piece: string
  square: string
  squareSize: number
  flipped: boolean
  capturedByColor: 'w' | 'b'
  onComplete: () => void
  pieceStyle?: 'neo' | 'classic'
}) {
  const { row, col } = squareToIndex(square)
  const displayCol = flipped ? 7 - col : col
  const displayRow = flipped ? 7 - row : row
  const x = displayCol * squareSize
  const y = displayRow * squareSize
  // Fly toward the capturing side (top or bottom of board)
  const exitY = capturedByColor === 'w' ? -squareSize * 1.5 : squareSize * 9.5

  return (
    <motion.div
      initial={{ x, y, opacity: 1, scale: 1, rotate: 0 }}
      animate={{ x: x + (Math.random() - 0.5) * squareSize, y: exitY, opacity: 0, scale: 0.4, rotate: (Math.random() - 0.5) * 30 }}
      transition={{ duration: 0.45, ease: 'easeIn' }}
      onAnimationComplete={onComplete}
      style={{
        position: 'absolute',
        width: squareSize,
        height: squareSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 45,
        pointerEvents: 'none',
      }}
    >
      <ChessPiece piece={piece} size={squareSize * 0.85} pieceStyle={pieceStyle} />
    </motion.div>
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
  pieceStyle = 'neo',
  isCheck = false,
  arrows: externalArrows = [],
  onArrowDraw,
  allowArrowDrawing = false,
  blindfoldMode = false,
  isPlayerMove = false,
}: ChessboardProps) {
  // Support both flipped and orientation props
  const isFlipped = orientation ? orientation === 'black' : flipped
  const theme = BOARD_THEMES[boardStyle]

  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)
  // Drag state: only piece/from are in React state (change rarely), x/y in ref for 60fps
  const [dragInfo, setDragInfo] = useState<{ piece: string; from: string } | null>(null)
  const dragNodeRef = useRef<HTMLDivElement>(null)
  const dragPosRef = useRef({ x: 0, y: 0 })
  const dragOffsetRef = useRef({ x: 0, y: 0 }) // Offset from click to piece center
  const [animating, setAnimating] = useState<{ piece: string; from: string; to: string } | null>(null)
  const [captureAnim, setCaptureAnim] = useState<{ piece: string; square: string; byColor: 'w' | 'b' } | null>(null)
  const [snapBack, setSnapBack] = useState<{ piece: string; from: string; x: number; y: number } | null>(null)
  const [promotionPending, setPromotionPending] = useState<{ from: string; to: string; color: 'w' | 'b' } | null>(null)
  const [longPressTooltip, setLongPressTooltip] = useState<{ piece: string; x: number; y: number } | null>(null)
  // Arrow drawing state
  const [drawnArrows, setDrawnArrows] = useState<Array<{ from: string; to: string; color?: string }>>([])
  const rightDragRef = useRef<{ from: string | null; modifiers: { ctrl: boolean; shift: boolean } }>({ from: null, modifiers: { ctrl: false, shift: false } })
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const prevFenRef = useRef(fen)
  // Touch tap vs drag detection
  const wasTouchDragRef = useRef(false)
  const touchStartPosRef = useRef({ x: 0, y: 0 })
  const tapActionRef = useRef<'select' | 'deselect' | null>(null)
  // Mouse drag support
  const mouseDragStartRef = useRef<{ x: number; y: number } | null>(null)
  const mouseDragPendingRef = useRef<{ piece: string; from: string } | null>(null)
  const wasMouseDragRef = useRef(false)
  const squareSize = size / 8

  // Direct DOM update for drag position — zero React re-renders
  const updateDragPos = useCallback((x: number, y: number) => {
    dragPosRef.current = { x, y }
    if (dragNodeRef.current) {
      const ox = dragOffsetRef.current.x
      const oy = dragOffsetRef.current.y
      dragNodeRef.current.style.transform = `translate3d(${x - ox}px, ${y - oy}px, 0) scale(1.1)`
    }
  }, [])

  // Start drag helper
  const startDrag = useCallback((piece: string, from: string, clientX: number, clientY: number) => {
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect()
      const { row, col } = squareToIndex(from)
      const displayCol = isFlipped ? 7 - col : col
      const displayRow = isFlipped ? 7 - row : row
      const pieceCenterX = rect.left + (displayCol + 0.5) * squareSize
      const pieceCenterY = rect.top + (displayRow + 0.5) * squareSize
      // Offset so piece appears at click point relative to its center
      dragOffsetRef.current = {
        x: squareSize * 0.425,
        y: squareSize * 0.425 + Math.min(15, (clientY - pieceCenterY) * 0.15),
      }
    } else {
      dragOffsetRef.current = { x: squareSize * 0.425, y: squareSize * 0.5 }
    }
    dragPosRef.current = { x: clientX, y: clientY }
    setDragInfo({ piece, from })
    requestAnimationFrame(() => updateDragPos(clientX, clientY))
  }, [squareSize, isFlipped, updateDragPos])

  // Use either hintArrow or showHint
  const activeHint = hintArrow || showHint

  const board = useMemo(() => parseFEN(fen), [fen])

  // Find king square for check highlighting
  const checkSquare = useMemo(() => {
    if (!isCheck) return null
    // Determine whose turn it is from FEN
    const turn = fen.split(' ')[1] || 'w'
    const kingPiece = turn === 'w' ? 'wK' : 'bK'
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r]?.[c] === kingPiece) return indexToSquare(r, c)
      }
    }
    return null
  }, [isCheck, fen, board])

  // Check if a move is a pawn promotion
  const isPromotionMove = useCallback((from: string, to: string) => {
    const { row: fromRow, col: fromCol } = squareToIndex(from)
    const piece = board[fromRow]?.[fromCol]
    if (!piece || !piece.endsWith('P')) return false
    const toRank = parseInt(to[1])
    return (piece === 'wP' && toRank === 8) || (piece === 'bP' && toRank === 1)
  }, [board])

  // Detect moves, animate piece, and trigger capture animation
  useEffect(() => {
    if (prevFenRef.current !== fen && lastMove) {
      // Skip animation for the player's own move (instant feedback)
      if (!isPlayerMove) {
        const prevBoard = parseFEN(prevFenRef.current)
        const { row, col } = squareToIndex(lastMove.from)
        const piece = prevBoard[row]?.[col]
        if (piece) {
          setAnimating({ piece, from: lastMove.from, to: lastMove.to })
        }
      }
      // Check for capture: was there an opponent piece on the target square?
      const prevBoard = parseFEN(prevFenRef.current)
      const { row: toRow, col: toCol } = squareToIndex(lastMove.to)
      const { row: fromRow, col: fromCol } = squareToIndex(lastMove.from)
      const capturedPiece = prevBoard[toRow]?.[toCol]
      const movingPiece = prevBoard[fromRow]?.[fromCol]
      if (capturedPiece && movingPiece && capturedPiece[0] !== movingPiece[0]) {
        setCaptureAnim({ piece: capturedPiece, square: lastMove.to, byColor: movingPiece[0] as 'w' | 'b' })
      }
    }
    prevFenRef.current = fen
  }, [fen, lastMove, isPlayerMove])

  const getActualCoords = useCallback((displayRow: number, displayCol: number) => ({
    row: isFlipped ? 7 - displayRow : displayRow,
    col: isFlipped ? 7 - displayCol : displayCol,
  }), [isFlipped])

  // Get display coordinates for a square (for SVG arrows)
  const getSquareCenter = useCallback((square: string) => {
    const { row, col } = squareToIndex(square)
    const displayCol = isFlipped ? 7 - col : col
    const displayRow = isFlipped ? 7 - row : row
    return {
      x: (displayCol + 0.5) * squareSize,
      y: (displayRow + 0.5) * squareSize,
    }
  }, [squareSize, isFlipped])

  // Arrow color helper
  const getArrowColor = (color?: string) => {
    if (color === 'red') return 'rgba(220,50,50,0.85)'
    if (color === 'blue') return 'rgba(50,100,220,0.85)'
    if (color === 'orange') return 'rgba(245,158,11,0.9)'
    return 'rgba(0,200,80,0.85)'
  }

  // All arrows to render (external + drawn)
  const allArrows = useMemo(() => [...externalArrows, ...drawnArrows], [externalArrows, drawnArrows])

  // Handle mousedown (right-click: arrow, left-click: start drag tracking)
  const handleMouseDown = useCallback((e: React.MouseEvent, displayRow: number, displayCol: number) => {
    // Right-click: arrow drawing
    if (e.button === 2 && allowArrowDrawing) {
      e.preventDefault()
      const { row, col } = getActualCoords(displayRow, displayCol)
      const square = indexToSquare(row, col)
      rightDragRef.current = { from: square, modifiers: { ctrl: e.ctrlKey, shift: e.shiftKey } }
      return
    }
    // Left-click: prepare for potential mouse drag
    if (e.button === 0 && interactive) {
      const { row, col } = getActualCoords(displayRow, displayCol)
      const piece = board[row]?.[col]
      if (piece) {
        wasMouseDragRef.current = false
        mouseDragStartRef.current = { x: e.clientX, y: e.clientY }
        mouseDragPendingRef.current = { piece, from: indexToSquare(row, col) }
      }
    }
  }, [allowArrowDrawing, getActualCoords, interactive, board])

  // Handle right-click mouseup (complete arrow)
  const handleMouseUp = useCallback((e: React.MouseEvent, displayRow: number, displayCol: number) => {
    if (e.button !== 2 || !allowArrowDrawing) return
    e.preventDefault()
    const { from, modifiers } = rightDragRef.current
    if (!from) return
    const { row, col } = getActualCoords(displayRow, displayCol)
    const to = indexToSquare(row, col)
    if (from === to) {
      rightDragRef.current = { from: null, modifiers: { ctrl: false, shift: false } }
      return
    }
    const color = modifiers.ctrl ? 'red' : modifiers.shift ? 'blue' : 'green'
    setDrawnArrows(prev => {
      // Toggle off if same arrow exists
      const exists = prev.findIndex(a => a.from === from && a.to === to)
      if (exists >= 0) return prev.filter((_, i) => i !== exists)
      return [...prev, { from, to, color }]
    })
    if (onArrowDraw) {
      setDrawnArrows(prev => {
        onArrowDraw(prev)
        return prev
      })
    }
    rightDragRef.current = { from: null, modifiers: { ctrl: false, shift: false } }
  }, [allowArrowDrawing, getActualCoords, onArrowDraw])

  // Board-level mouse move for drag — direct DOM update, no React re-render
  const handleBoardMouseMove = useCallback((e: React.MouseEvent) => {
    if (!mouseDragStartRef.current || !mouseDragPendingRef.current) return
    if (!wasMouseDragRef.current) {
      const dx = e.clientX - mouseDragStartRef.current.x
      const dy = e.clientY - mouseDragStartRef.current.y
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        wasMouseDragRef.current = true
        const { piece, from } = mouseDragPendingRef.current
        startDrag(piece, from, e.clientX, e.clientY)
        setSelectedSquare(from)
      }
    } else if (dragInfo) {
      updateDragPos(e.clientX, e.clientY)
    }
  }, [dragInfo, startDrag, updateDragPos])

  // Board-level mouse up for drag drop — with snap-back on illegal
  const handleBoardMouseUp = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    mouseDragStartRef.current = null
    mouseDragPendingRef.current = null
    if (!wasMouseDragRef.current) {
      return // Was a click - let onClick handle it
    }
    if (!dragInfo || !boardRef.current) {
      setDragInfo(null)
      return
    }
    const rect = boardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const displayCol = Math.floor(x / squareSize)
    const displayRow = Math.floor(y / squareSize)
    const soundHaptics = getGlobalSoundHaptics()
    let moved = false
    if (displayCol >= 0 && displayCol < 8 && displayRow >= 0 && displayRow < 8) {
      const { row, col } = getActualCoords(displayRow, displayCol)
      const targetSquare = indexToSquare(row, col)
      const targetPiece = board[row]?.[col]
      if (targetSquare !== dragInfo.from && onMove) {
        if (isPromotionMove(dragInfo.from, targetSquare)) {
          const { row: fromRow2, col: fromCol2 } = squareToIndex(dragInfo.from)
          const p = board[fromRow2]?.[fromCol2]
          setPromotionPending({ from: dragInfo.from, to: targetSquare, color: p?.startsWith('w') ? 'w' : 'b' })
          setDragInfo(null)
          setSelectedSquare(null)
          return
        }
        const success = onMove(dragInfo.from, targetSquare)
        if (success) {
          soundHaptics.playSound(targetPiece ? 'capture' : 'move')
          soundHaptics.triggerHaptic(targetPiece ? 'medium' : 'light')
          moved = true
        }
      }
    }
    // Snap back on illegal move or same-square drop
    if (!moved && dragInfo) {
      setSnapBack({ piece: dragInfo.piece, from: dragInfo.from, x: dragPosRef.current.x, y: dragPosRef.current.y })
      soundHaptics.playSound('illegal')
      soundHaptics.triggerHaptic('error')
    }
    setDragInfo(null)
    setSelectedSquare(null)
  }, [dragInfo, squareSize, onMove, getActualCoords, board, isPromotionMove])

  const handleSquareClick = useCallback((displayRow: number, displayCol: number) => {
    if (!interactive) return
    // Skip if this was a mouse drag (already handled in handleBoardMouseUp)
    if (wasMouseDragRef.current) { wasMouseDragRef.current = false; return }

    // Left-click clears drawn arrows
    if (allowArrowDrawing && drawnArrows.length > 0) {
      setDrawnArrows([])
      if (onArrowDraw) onArrowDraw([])
    }

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
        // Check for pawn promotion
        if (isPromotionMove(selectedSquare, square)) {
          const { row: fromRow, col: fromCol } = squareToIndex(selectedSquare)
          const piece2 = board[fromRow]?.[fromCol]
          setPromotionPending({ from: selectedSquare, to: square, color: piece2?.startsWith('w') ? 'w' : 'b' })
          setSelectedSquare(null)
          return
        }
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
  }, [interactive, selectedSquare, board, onMove, getActualCoords, allowArrowDrawing, drawnArrows.length, onArrowDraw])

  const handleSquareKeyDown = useCallback((e: React.KeyboardEvent, sq: string) => {
    if (!interactive) return
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      const { row, col } = squareToIndex(sq)
      const displayRow = isFlipped ? 7 - row : row
      const displayCol = isFlipped ? 7 - col : col
      handleSquareClick(displayRow, displayCol)
      return
    }
    const DIRS: Record<string, [number, number]> = {
      ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
    }
    if (e.key in DIRS) {
      e.preventDefault()
      const { row, col } = squareToIndex(sq)
      const displayRow = isFlipped ? 7 - row : row
      const displayCol = isFlipped ? 7 - col : col
      const [dRow, dCol] = DIRS[e.key]
      const newDisplayRow = Math.max(0, Math.min(7, displayRow + dRow))
      const newDisplayCol = Math.max(0, Math.min(7, displayCol + dCol))
      if (boardRef.current) {
        const newActualRow = isFlipped ? 7 - newDisplayRow : newDisplayRow
        const newActualCol = isFlipped ? 7 - newDisplayCol : newDisplayCol
        const targetSq = indexToSquare(newActualRow, newActualCol)
        const cell = boardRef.current.querySelector(`[aria-label^="${targetSq}"]`)
        if (cell instanceof HTMLElement) cell.focus()
      }
    }
  }, [interactive, isFlipped, handleSquareClick])

  const handleTouchStart = useCallback((e: React.TouchEvent, displayRow: number, displayCol: number) => {
    if (!interactive) return
    e.preventDefault()

    const { row, col } = getActualCoords(displayRow, displayCol)
    const piece = board[row]?.[col]
    const square = indexToSquare(row, col)
    const soundHaptics = getGlobalSoundHaptics()
    const touch = e.touches[0]

    wasTouchDragRef.current = false
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY }
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current)

    // If a piece is already selected, try to move first
    if (selectedSquare) {
      if (square === selectedSquare) {
        tapActionRef.current = 'deselect'
        if (piece) {
          longPressTimerRef.current = setTimeout(() => {
            setLongPressTooltip({ piece, x: touch.clientX, y: touch.clientY })
            setTimeout(() => setLongPressTooltip(null), 2000)
          }, 600)
          startDrag(piece, square, touch.clientX, touch.clientY)
        }
        return
      }

      if (onMove) {
        if (isPromotionMove(selectedSquare, square)) {
          const { row: fromRow2, col: fromCol2 } = squareToIndex(selectedSquare)
          const p = board[fromRow2]?.[fromCol2]
          setPromotionPending({ from: selectedSquare, to: square, color: p?.startsWith('w') ? 'w' : 'b' })
          setSelectedSquare(null)
          tapActionRef.current = null
          return
        }
        const targetPiece = board[row]?.[col]
        const success = onMove(selectedSquare, square)
        if (success) {
          soundHaptics.playSound(targetPiece ? 'capture' : 'move')
          soundHaptics.triggerHaptic(targetPiece ? 'medium' : 'light')
          setSelectedSquare(null)
          tapActionRef.current = null
          return
        }
      }

      if (piece) {
        soundHaptics.playSound('click')
        soundHaptics.triggerHaptic('selection')
        longPressTimerRef.current = setTimeout(() => {
          setLongPressTooltip({ piece, x: touch.clientX, y: touch.clientY })
          setTimeout(() => setLongPressTooltip(null), 2000)
        }, 600)
        startDrag(piece, square, touch.clientX, touch.clientY)
        setSelectedSquare(square)
        tapActionRef.current = 'select'
      } else {
        soundHaptics.playSound('illegal')
        soundHaptics.triggerHaptic('error')
        setSelectedSquare(null)
        tapActionRef.current = null
      }
      return
    }

    // No selection - if piece, select it and start drag
    if (piece) {
      soundHaptics.playSound('click')
      soundHaptics.triggerHaptic('selection')
      longPressTimerRef.current = setTimeout(() => {
        setLongPressTooltip({ piece, x: touch.clientX, y: touch.clientY })
        setTimeout(() => setLongPressTooltip(null), 2000)
      }, 600)
      startDrag(piece, square, touch.clientX, touch.clientY)
      setSelectedSquare(square)
      tapActionRef.current = 'select'
    }
  }, [interactive, board, selectedSquare, onMove, getActualCoords, isPromotionMove, startDrag])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragInfo) return
    e.preventDefault()
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    const touch = e.touches[0]
    if (!wasTouchDragRef.current) {
      const dx = touch.clientX - touchStartPosRef.current.x
      const dy = touch.clientY - touchStartPosRef.current.y
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        wasTouchDragRef.current = true
      }
    }
    updateDragPos(touch.clientX, touch.clientY)
  }, [dragInfo, updateDragPos])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
    if (!dragInfo || !boardRef.current) {
      setDragInfo(null)
      return
    }
    e.preventDefault()

    // Tap (not drag) - preserve selection for tap-to-move workflow
    if (!wasTouchDragRef.current) {
      setDragInfo(null)
      if (tapActionRef.current === 'deselect') {
        setSelectedSquare(null)
      }
      tapActionRef.current = null
      return
    }

    // Drag drop
    const rect = boardRef.current.getBoundingClientRect()
    const touch = e.changedTouches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    const displayCol = Math.floor(x / squareSize)
    const displayRow = Math.floor(y / squareSize)
    const soundHaptics = getGlobalSoundHaptics()
    let moved = false

    if (displayCol >= 0 && displayCol < 8 && displayRow >= 0 && displayRow < 8) {
      const { row, col } = getActualCoords(displayRow, displayCol)
      const targetSquare = indexToSquare(row, col)
      const targetPiece = board[row]?.[col]
      if (targetSquare !== dragInfo.from && onMove) {
        if (isPromotionMove(dragInfo.from, targetSquare)) {
          const { row: fromRow2, col: fromCol2 } = squareToIndex(dragInfo.from)
          const p = board[fromRow2]?.[fromCol2]
          setPromotionPending({ from: dragInfo.from, to: targetSquare, color: p?.startsWith('w') ? 'w' : 'b' })
          setDragInfo(null)
          setSelectedSquare(null)
          return
        }
        const success = onMove(dragInfo.from, targetSquare)
        if (success) {
          soundHaptics.playSound(targetPiece ? 'capture' : 'move')
          soundHaptics.triggerHaptic(targetPiece ? 'medium' : 'light')
          moved = true
        }
      }
    }

    // Snap back on illegal move
    if (!moved && dragInfo) {
      setSnapBack({ piece: dragInfo.piece, from: dragInfo.from, x: dragPosRef.current.x, y: dragPosRef.current.y })
      soundHaptics.playSound('illegal')
      soundHaptics.triggerHaptic('error')
    }

    setDragInfo(null)
    setSelectedSquare(null)
  }, [dragInfo, squareSize, onMove, getActualCoords, board, isPromotionMove])

  // Pre-compute square states for performance
  const highlightSet = useMemo(() => new Set(highlightSquares), [highlightSquares])
  const lastMoveSet = useMemo(() => {
    if (!lastMove) return new Set<string>()
    return new Set([lastMove.from, lastMove.to])
  }, [lastMove])

  // Compute legal moves for the selected square
  const legalMoveSet = useMemo(() => {
    if (!selectedSquare || !interactive) return new Set<string>()
    try {
      const chess = new Chess(fen)
      const moves = chess.moves({ square: selectedSquare as any, verbose: true })
      return new Set(moves.map(m => m.to))
    } catch {
      return new Set<string>()
    }
  }, [selectedSquare, fen, interactive])

  return (
    <div className="relative inline-block select-none touch-none">
      <div
        ref={boardRef}
        role="grid"
        aria-label="Chess board"
        className="relative overflow-hidden rounded-[4px] bg-black"
        style={{
          width: size,
          height: size,
          transition: 'width 0.3s cubic-bezier(0.25,0.1,0.25,1), height 0.3s cubic-bezier(0.25,0.1,0.25,1)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)',
        }}
        onContextMenu={(e) => e.preventDefault()}
        onMouseMove={handleBoardMouseMove}
        onMouseUp={handleBoardMouseUp}
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
          const isDragging = dragInfo?.from === square
          const isSnappingBack = snapBack?.from === square
          const isAnimatingFrom = animating?.from === square

          return (
            <Square
              key={square}
              row={displayRow}
              col={displayCol}
              piece={isDragging || isAnimatingFrom || isSnappingBack ? null : piece}
              isLight={isLight}
              isSelected={selectedSquare === square}
              isLastMove={lastMoveSet.has(square) && !animating}
              isHighlighted={highlightSet.has(square)}
              isLegalMove={legalMoveSet.has(square)}
              isInCheck={checkSquare === square}
              squareSize={squareSize}
              onClick={() => handleSquareClick(displayRow, displayCol)}
              onTouchStart={(e) => handleTouchStart(e, displayRow, displayCol)}
              onMouseDown={(e: React.MouseEvent) => handleMouseDown(e, displayRow, displayCol)}
              onMouseUp={(e: React.MouseEvent) => handleMouseUp(e, displayRow, displayCol)}
              interactive={interactive && !promotionPending}
              theme={theme}
              pieceStyle={pieceStyle}
              square={square}
              onKeyDown={handleSquareKeyDown}
              blindfoldMode={blindfoldMode}
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

        {/* Captured piece fly-off animation */}
        <AnimatePresence>
          {captureAnim && (
            <CapturedPieceAnim
              piece={captureAnim.piece}
              square={captureAnim.square}
              squareSize={squareSize}
              flipped={isFlipped}
              capturedByColor={captureAnim.byColor}
              onComplete={() => setCaptureAnim(null)}
              pieceStyle={pieceStyle}
            />
          )}
        </AnimatePresence>

        {/* Hint indicator */}
        {(showHintArrow && hintArrow) || activeHint ? (
          <HintIndicator
            from={(activeHint || hintArrow)!.from}
            to={(activeHint || hintArrow)!.to}
            squareSize={squareSize}
            flipped={isFlipped}
          />
        ) : null}

        {/* SVG arrows overlay */}
        {allArrows.length > 0 && (
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: size,
              height: size,
              pointerEvents: 'none',
              zIndex: 40,
            }}
          >
            <defs>
              {['green', 'red', 'blue', 'orange'].map(c => {
                const fill = getArrowColor(c)
                return (
                  <marker
                    key={c}
                    id={`arrowhead-${c}`}
                    markerWidth="4"
                    markerHeight="4"
                    refX="2"
                    refY="2"
                    orient="auto"
                  >
                    <polygon points="0 0, 4 2, 0 4" fill={fill} />
                  </marker>
                )
              })}
            </defs>
            {allArrows.map((arrow, idx) => {
              const from = getSquareCenter(arrow.from)
              const to = getSquareCenter(arrow.to)
              const color = arrow.color || 'green'
              const stroke = getArrowColor(color)
              const shaft = squareSize * 0.15
              // Shorten end slightly for arrowhead
              const dx = to.x - from.x
              const dy = to.y - from.y
              const len = Math.sqrt(dx * dx + dy * dy)
              const endX = to.x - (dx / len) * shaft * 2
              const endY = to.y - (dy / len) * shaft * 2
              return (
                <line
                  key={idx}
                  x1={from.x}
                  y1={from.y}
                  x2={endX}
                  y2={endY}
                  stroke={stroke}
                  strokeWidth={shaft}
                  strokeLinecap="round"
                  markerEnd={`url(#arrowhead-${color})`}
                />
              )
            })}
          </svg>
        )}
      </div>

      {/* Dragged piece — positioned via ref, not React state */}
      {dragInfo && (
        <div
          ref={dragNodeRef}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 100,
            pointerEvents: 'none',
            willChange: 'transform',
            filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.5)) drop-shadow(0 0 20px rgba(245,158,11,0.15))',
          }}
        >
          <ChessPiece piece={dragInfo.piece} size={squareSize * 0.85} pieceStyle={pieceStyle} />
        </div>
      )}

      {/* Snap-back animation on illegal drop */}
      <AnimatePresence>
        {snapBack && boardRef.current && (
          <SnapBackPiece
            piece={snapBack.piece}
            fromX={snapBack.x}
            fromY={snapBack.y}
            toSquare={snapBack.from}
            squareSize={squareSize}
            flipped={isFlipped}
            boardRect={boardRef.current.getBoundingClientRect()}
            onComplete={() => setSnapBack(null)}
            pieceStyle={pieceStyle}
          />
        )}
      </AnimatePresence>

      {/* Promotion dialog */}
      {promotionPending && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: '12px',
          }}
          onClick={() => setPromotionPending(null)}
        >
          <div
            style={{
              display: 'flex',
              gap: 4,
              padding: 8,
              borderRadius: 12,
              background: 'rgba(30,30,40,0.95)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {(['Q', 'R', 'B', 'N'] as const).map((p) => (
              <button
                key={p}
                style={{
                  width: squareSize * 1.1,
                  height: squareSize * 1.1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,158,11,0.2)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                onClick={() => {
                  if (onMove && promotionPending) {
                    const soundHaptics = getGlobalSoundHaptics()
                    const success = onMove(promotionPending.from, promotionPending.to, p.toLowerCase())
                    if (success) {
                      soundHaptics.playSound('move')
                      soundHaptics.triggerHaptic('medium')
                    }
                  }
                  setPromotionPending(null)
                }}
              >
                <ChessPiece
                  piece={`${promotionPending.color}${p}`}
                  size={squareSize * 0.85}
                  pieceStyle={pieceStyle}
                />
              </button>
            ))}
          </div>
        </div>
      )}

    {/* Long press piece info tooltip */}
    {longPressTooltip && (
      <div
        className="fixed pointer-events-none z-[250]"
        style={{
          left: longPressTooltip.x,
          top: longPressTooltip.y - 64,
          transform: 'translateX(-50%)',
        }}
      >
        <div style={{
          background: 'rgba(15,15,25,0.96)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 8,
          padding: '6px 12px',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          color: '#fff',
          fontSize: 14,
          fontWeight: 500,
        }}>
          {PIECE_SYMBOLS[longPressTooltip.piece]} {getPieceName(longPressTooltip.piece)}{LONG_PRESS_VALUES[longPressTooltip.piece[1]] > 0 ? ` = ${LONG_PRESS_VALUES[longPressTooltip.piece[1]]} pts` : ''}
        </div>
      </div>
    )}
    </div>
  )
}

// Mini chessboard for previews
export const MiniChessboard = memo(function MiniChessboard({ fen, size = 120, boardStyle = 'green', pieceStyle = 'standard' }: { fen: string; size?: number; boardStyle?: BoardStyle; pieceStyle?: 'neo' | 'classic' }) {
  const board = useMemo(() => parseFEN(fen), [fen])
  const squareSize = size / 8
  const miniTheme = BOARD_THEMES[boardStyle]

  return (
    <div
      className="relative rounded overflow-hidden"
      style={{
        width: size,
        height: size,
        boxShadow: '0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
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

// Captured pieces & material balance display
const STARTING_PIECES: Record<string, number> = { P: 8, N: 2, B: 2, R: 2, Q: 1 }
const PIECE_VALUES: Record<string, number> = { P: 1, N: 3, B: 3, R: 5, Q: 9 }
const PIECE_ORDER = ['Q', 'R', 'B', 'N', 'P']

export function CapturedPieces({ fen, color, pieceSize = 16 }: { fen: string; color: 'w' | 'b'; pieceSize?: number }) {
  const captured = useMemo(() => {
    const board = parseFEN(fen)
    const currentCount: Record<string, Record<string, number>> = { w: { P: 0, N: 0, B: 0, R: 0, Q: 0 }, b: { P: 0, N: 0, B: 0, R: 0, Q: 0 } }

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r]?.[c]
        if (piece) {
          const side = piece[0] as 'w' | 'b'
          const type = piece[1]
          if (currentCount[side][type] !== undefined) currentCount[side][type]++
        }
      }
    }

    // Captured by 'color' = opponent's missing pieces
    const opponent = color === 'w' ? 'b' : 'w'
    const pieces: string[] = []
    let materialDiff = 0

    for (const type of PIECE_ORDER) {
      const missing = STARTING_PIECES[type] - currentCount[opponent][type]
      for (let i = 0; i < missing; i++) pieces.push(`${opponent}${type}`)
      materialDiff += (currentCount[color][type] - currentCount[opponent][type]) * PIECE_VALUES[type]
    }

    return { pieces, advantage: materialDiff }
  }, [fen, color])

  if (captured.pieces.length === 0 && captured.advantage <= 0) return null

  return (
    <div className="flex items-center gap-0.5 min-h-[20px]">
      {captured.pieces.map((p, i) => (
        <div key={i} style={{ marginLeft: i > 0 ? -pieceSize * 0.3 : 0 }}>
          <ChessPiece piece={p} size={pieceSize} />
        </div>
      ))}
      {captured.advantage > 0 && (
        <span className="text-xs font-bold text-muted-foreground ml-1">+{captured.advantage}</span>
      )}
    </div>
  )
}

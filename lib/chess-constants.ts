/** Chess file letters a-h */
export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const

/** Chess rank numbers 1-8 */
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const

/** Unicode piece symbols keyed by color+type (e.g. 'wK', 'bQ') */
export const PIECE_SYMBOLS: Record<string, string> = {
  wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
  bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟',
}

/** White piece symbols keyed by piece type letter */
export const WHITE_PIECE_SYMBOLS: Record<string, string> = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
}

export interface TimeControl {
  label: string
  minutes: number
  increment: number
}

export const TIME_CONTROLS: TimeControl[] = [
  { label: 'Unlimited', minutes: 0, increment: 0 },
  { label: '1 min', minutes: 1, increment: 0 },
  { label: '3 min', minutes: 3, increment: 0 },
  { label: '5 min', minutes: 5, increment: 0 },
  { label: '10 min', minutes: 10, increment: 0 },
  { label: '5|3', minutes: 5, increment: 3 },
  { label: '10|5', minutes: 10, increment: 5 },
]

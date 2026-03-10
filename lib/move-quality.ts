import { Chess } from 'chess.js'

export type MoveQuality = '!!' | '!' | '' | '?!' | '?' | '??'

const PIECE_VALUES: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }

function materialBalance(game: Chess): number {
  const board = game.board()
  let balance = 0
  for (const row of board) {
    for (const sq of row) {
      if (!sq) continue
      const val = PIECE_VALUES[sq.type] || 0
      balance += sq.color === 'w' ? val : -val
    }
  }
  return balance
}

export function analyzeMoveQualities(moves: string[]): MoveQuality[] {
  if (moves.length === 0) return []
  const game = new Chess()
  const qualities: MoveQuality[] = []
  let prevBalance = materialBalance(game)

  for (let i = 0; i < moves.length; i++) {
    const isWhiteMove = i % 2 === 0
    try {
      game.move(moves[i])
    } catch {
      qualities.push('')
      continue
    }
    const newBalance = materialBalance(game)
    const delta = newBalance - prevBalance
    // For white moves, positive delta is good; for black, negative delta is good
    const swing = isWhiteMove ? delta : -delta

    if (game.isCheckmate()) {
      qualities.push('!!')
    } else if (game.isCheck() && swing >= 0) {
      qualities.push('!')
    } else if (swing <= -5) {
      qualities.push('??')
    } else if (swing <= -2) {
      qualities.push('?')
    } else if (swing < 0) {
      qualities.push('?!')
    } else if (swing >= 3) {
      qualities.push('!!')
    } else if (swing >= 1) {
      qualities.push('!')
    } else {
      qualities.push('')
    }
    prevBalance = newBalance
  }
  return qualities
}

export function getQualityColor(q: MoveQuality): string {
  switch (q) {
    case '!!': return 'text-emerald-400'
    case '!': return 'text-green-400'
    case '?!': return 'text-yellow-400'
    case '?': return 'text-orange-400'
    case '??': return 'text-red-400'
    default: return ''
  }
}

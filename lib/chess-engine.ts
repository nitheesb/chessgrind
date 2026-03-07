/**
 * ChessVault Chess Engine
 * Negamax with alpha-beta pruning, quiescence search,
 * piece-square tables, move ordering, and opening book.
 */
import { Chess } from 'chess.js'

// --- Piece Values (centipawns) ---
const PIECE_VALUE: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
}

// --- Piece-Square Tables ---
// From white's perspective. Index 0 = a8, index 63 = h1.
// For black pieces, we mirror vertically: (7 - row) * 8 + col

const PST_PAWN = [
   0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0,
]

const PST_KNIGHT = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
]

const PST_BISHOP = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
]

const PST_ROOK = [
   0,  0,  0,  0,  0,  0,  0,  0,
   5, 10, 10, 10, 10, 10, 10,  5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
   0,  0,  0,  5,  5,  0,  0,  0,
]

const PST_QUEEN = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20,
]

const PST_KING_MG = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20,
]

const PST_KING_EG = [
  -50,-40,-30,-20,-20,-30,-40,-50,
  -30,-20,-10,  0,  0,-10,-20,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 30, 40, 40, 30,-10,-30,
  -30,-10, 20, 30, 30, 20,-10,-30,
  -30,-30,  0,  0,  0,  0,-30,-30,
  -50,-30,-30,-30,-30,-30,-30,-50,
]

const PST: Record<string, number[]> = {
  p: PST_PAWN,
  n: PST_KNIGHT,
  b: PST_BISHOP,
  r: PST_ROOK,
  q: PST_QUEEN,
  k: PST_KING_MG,
}

function getPSTValue(piece: string, color: string, row: number, col: number, isEndgame: boolean): number {
  const table = (piece === 'k' && isEndgame) ? PST_KING_EG : PST[piece]
  if (!table) return 0
  const index = color === 'w' ? row * 8 + col : (7 - row) * 8 + col
  return table[index]
}

// --- Evaluation ---
function evaluate(game: Chess): number {
  if (game.isCheckmate()) return -99999
  if (game.isDraw() || game.isStalemate()) return 0

  const turn = game.turn()
  const board = game.board()
  let score = 0
  let totalMaterial = 0
  let friendlyBishops = 0
  let enemyBishops = 0

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const sq = board[row][col]
      if (!sq) continue
      const material = PIECE_VALUE[sq.type]
      if (sq.type !== 'k' && sq.type !== 'p') totalMaterial += material
      if (sq.type === 'b') {
        if (sq.color === turn) friendlyBishops++
        else enemyBishops++
      }
    }
  }

  const isEndgame = totalMaterial < 2600

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const sq = board[row][col]
      if (!sq) continue
      const material = PIECE_VALUE[sq.type]
      const positional = getPSTValue(sq.type, sq.color, row, col, isEndgame)
      const value = material + positional
      score += sq.color === turn ? value : -value
    }
  }

  // Bishop pair bonus
  if (friendlyBishops >= 2) score += 40
  if (enemyBishops >= 2) score -= 40

  // Check bonus
  if (game.isCheck()) score += 15

  return score
}

// --- Move Ordering (MVV-LVA, promotions, checks, castling) ---
function orderMoves(game: Chess): string[] {
  const moves = game.moves({ verbose: true })

  const scored = moves.map(move => {
    let score = 0
    if (move.san.includes('#')) return { san: move.san, score: 100000 }
    if (move.captured) {
      score += (PIECE_VALUE[move.captured] || 0) * 10 - (PIECE_VALUE[move.piece] || 0)
    }
    if (move.promotion) score += PIECE_VALUE[move.promotion] || 0
    if (move.san.includes('+')) score += 500
    if (move.flags.includes('k') || move.flags.includes('q')) score += 60
    return { san: move.san, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored.map(m => m.san)
}

// --- Quiescence Search ---
function quiescence(game: Chess, alpha: number, beta: number, depth: number): number {
  const standPat = evaluate(game)
  if (depth <= 0) return standPat
  if (standPat >= beta) return beta
  if (standPat > alpha) alpha = standPat

  const moves = game.moves({ verbose: true })
  // Only search captures and promotions (and checks at depth > 2)
  const tactical = moves.filter(m =>
    m.captured || m.promotion || (depth > 2 && m.san.includes('+'))
  )

  // Order captures by MVV-LVA
  tactical.sort((a, b) => {
    const aVal = (a.captured ? PIECE_VALUE[a.captured] || 0 : 0) * 10 - (PIECE_VALUE[a.piece] || 0)
    const bVal = (b.captured ? PIECE_VALUE[b.captured] || 0 : 0) * 10 - (PIECE_VALUE[b.piece] || 0)
    return bVal - aVal
  })

  for (const move of tactical) {
    game.move(move.san)
    const score = -quiescence(game, -beta, -alpha, depth - 1)
    game.undo()
    if (score >= beta) return beta
    if (score > alpha) alpha = score
  }

  return alpha
}

// --- Negamax with Alpha-Beta ---
function negamax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  useQuiescence: boolean,
): number {
  if (game.isGameOver()) {
    if (game.isCheckmate()) return -99999 - depth
    return 0
  }
  if (depth === 0) {
    return useQuiescence ? quiescence(game, alpha, beta, 6) : evaluate(game)
  }

  const moves = orderMoves(game)
  for (const move of moves) {
    game.move(move)
    const score = -negamax(game, depth - 1, -beta, -alpha, useQuiescence)
    game.undo()
    if (score >= beta) return beta
    if (score > alpha) alpha = score
  }
  return alpha
}

// --- Opening Book ---
// Key: piece placement + side to move (first 2 FEN fields)
const OPENING_BOOK: Record<string, string[]> = {
  // Starting position - white's first move
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w': ['e4', 'd4', 'Nf3', 'c4'],
  // After 1.e4
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b': ['e5', 'c5', 'e6', 'c6', 'd5', 'Nf6'],
  // After 1.d4
  'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b': ['d5', 'Nf6', 'e6', 'f5'],
  // After 1.Nf3
  'rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b': ['d5', 'Nf6', 'c5', 'e6'],
  // After 1.c4
  'rnbqkbnr/pppppppp/8/8/2P5/8/PP1PPPPP/RNBQKBNR b': ['e5', 'Nf6', 'c5', 'e6'],
  // After 1.e4 e5
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w': ['Nf3', 'Bc4', 'f4', 'Nc3'],
  // After 1.e4 c5 (Sicilian)
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w': ['Nf3', 'Nc3', 'c3', 'd4'],
  // After 1.e4 e6 (French)
  'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w': ['d4', 'Nf3', 'd3'],
  // After 1.e4 c6 (Caro-Kann)
  'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w': ['d4', 'Nc3', 'Nf3'],
  // After 1.e4 d5 (Scandinavian)
  'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w': ['exd5', 'Nc3', 'e5'],
  // After 1.e4 Nf6 (Alekhine)
  'rnbqkb1r/pppppppp/5n2/8/4P3/8/PPPP1PPP/RNBQKBNR w': ['e5', 'Nc3'],
  // After 1.e4 e5 2.Nf3
  'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b': ['Nc6', 'Nf6', 'd6'],
  // After 1.e4 e5 2.Nf3 Nc6
  'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w': ['Bb5', 'Bc4', 'd4', 'Nc3'],
  // After 1.e4 e5 2.Nf3 Nc6 3.Bb5 (Ruy Lopez)
  'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b': ['a6', 'Nf6', 'f5', 'd6'],
  // After 1.e4 e5 2.Nf3 Nc6 3.Bc4 (Italian)
  'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b': ['Bc5', 'Nf6', 'd6'],
  // After 1.d4 d5
  'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w': ['c4', 'Nf3', 'Bf4', 'e3'],
  // After 1.d4 Nf6
  'rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w': ['c4', 'Nf3', 'Bg5', 'Bf4'],
  // After 1.d4 d5 2.c4 (QGD)
  'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b': ['e6', 'c6', 'dxc4', 'Nf6'],
  // After 1.d4 Nf6 2.c4 (Indian systems)
  'rnbqkb1r/pppppppp/5n2/8/2PP4/8/PP2PPPP/RNBQKBNR b': ['e6', 'g6', 'e5', 'c5'],
  // After 1.d4 Nf6 2.c4 g6 (King's Indian)
  'rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w': ['Nc3', 'Nf3', 'g3'],
  // After 1.d4 Nf6 2.c4 e6 (Nimzo/QID)
  'rnbqkb1r/pppp1ppp/4pn2/8/2PP4/8/PP2PPPP/RNBQKBNR w': ['Nc3', 'Nf3', 'g3'],
  // Sicilian Najdorf approach
  'rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b': ['d6', 'Nc6', 'e6', 'a6'],
  // London System
  'rnbqkb1r/pppppppp/5n2/8/3P4/5N2/PPP1PPPP/RNBQKB1R b': ['d5', 'e6', 'g6', 'c5'],
}

function getBookMove(game: Chess): string | null {
  const fenParts = game.fen().split(' ')
  const key = fenParts[0] + ' ' + fenParts[1]
  const bookMoves = OPENING_BOOK[key]
  if (!bookMoves) return null

  const legalMoves = game.moves()
  const validBookMoves = bookMoves.filter(m => legalMoves.includes(m))
  if (validBookMoves.length === 0) return null

  return validBookMoves[Math.floor(Math.random() * validBookMoves.length)]
}

// --- Engine Configuration ---
export interface EngineConfig {
  depth: number
  randomness: number // centipawns of noise (0 = deterministic)
  useQuiescence: boolean
  useOpeningBook: boolean
}

// Preset configs mapped to depth values for backward compatibility
const DEPTH_PRESETS: Record<number, Partial<EngineConfig>> = {
  1: { randomness: 300, useQuiescence: false, useOpeningBook: false },
  2: { randomness: 150, useQuiescence: false, useOpeningBook: false },
  3: { randomness: 80, useQuiescence: true, useOpeningBook: true },
  4: { randomness: 40, useQuiescence: true, useOpeningBook: true },
  5: { randomness: 15, useQuiescence: true, useOpeningBook: true },
  6: { randomness: 0, useQuiescence: true, useOpeningBook: true },
}

/**
 * Get the best move for the current position.
 * @param game - Chess.js game instance (will NOT be mutated)
 * @param config - Engine configuration
 * @returns The best move in SAN notation, or null if no moves available
 */
export function getBestMove(game: Chess, config: EngineConfig): string | null {
  const moves = game.moves({ verbose: true })
  if (moves.length === 0) return null
  if (moves.length === 1) return moves[0].san

  // Check opening book
  if (config.useOpeningBook) {
    const bookMove = getBookMove(game)
    if (bookMove) return bookMove
  }

  // Depth 1: random with basic tactical awareness
  if (config.depth <= 1) {
    const checks = moves.filter(m => m.san.includes('+'))
    const captures = moves.filter(m => m.captured)
    if (checks.length > 0 && Math.random() > 0.4) {
      return checks[Math.floor(Math.random() * checks.length)].san
    }
    if (captures.length > 0 && Math.random() > 0.3) {
      return captures[Math.floor(Math.random() * captures.length)].san
    }
    return moves[Math.floor(Math.random() * moves.length)].san
  }

  // Clone game for search (we mutate during search with move/undo)
  const searchGame = new Chess(game.fen())
  const orderedMoves = orderMoves(searchGame)

  let bestScore = -Infinity
  let bestMoves: string[] = []

  for (const move of orderedMoves) {
    searchGame.move(move)
    const score =
      -negamax(searchGame, config.depth - 1, -Infinity, Infinity, config.useQuiescence) +
      (config.randomness > 0 ? (Math.random() - 0.5) * 2 * config.randomness : 0)
    searchGame.undo()

    if (score > bestScore) {
      bestScore = score
      bestMoves = [move]
    } else if (config.randomness > 0 && Math.abs(score - bestScore) < config.randomness * 0.5) {
      bestMoves.push(move)
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)] || orderedMoves[0]
}

/**
 * Get engine config for a given depth level.
 * Convenience function for backward compatibility.
 */
export function getEngineConfig(depth: number): EngineConfig {
  const preset = DEPTH_PRESETS[Math.min(depth, 6)] || DEPTH_PRESETS[6]
  return {
    depth: Math.max(1, depth),
    randomness: preset.randomness ?? 0,
    useQuiescence: preset.useQuiescence ?? true,
    useOpeningBook: preset.useOpeningBook ?? true,
  }
}

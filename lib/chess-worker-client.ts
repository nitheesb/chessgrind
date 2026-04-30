/**
 * Chess Worker Client
 * Provides async wrappers for getBestMove and analyzePosition.
 * Routes to either the custom engine (low levels) or Stockfish WASM (high levels).
 */
import { Chess } from 'chess.js'
import type { EngineConfig } from './chess-engine'
import {
  getStockfishMove,
  analyzeWithStockfish,
  analyzeMultiPV,
  stopStockfish,
  terminateStockfish,
  type StockfishSearchOptions,
  type StockfishAnalysis,
  type StockfishInfoEvent,
  type MultiPVAnalysis,
} from './stockfish-client'

export type { StockfishAnalysis, StockfishInfoEvent, MultiPVAnalysis }

type PendingResolver = (value: unknown) => void

let worker: Worker | null = null
const pending = new Map<string, PendingResolver>()
let nextId = 0

function getWorker(): Worker {
  if (worker) return worker
  // next/webpack and turbopack both handle `new URL('...', import.meta.url)`
  worker = new Worker(new URL('./engine.worker', import.meta.url))
  worker.onmessage = (e: MessageEvent) => {
    const { id, result, error } = e.data
    const resolve = pending.get(id)
    if (resolve) {
      if (error) {
        console.warn('[chess-worker] worker error for request', id, error)
      }
      resolve(error ? null : result)
      pending.delete(id)
    }
  }
  worker.onerror = (e) => {
    console.error('[chess-worker] error', e)
    pending.forEach((resolve) => resolve(null))
    pending.clear()
    worker = null
  }
  return worker
}

export function prewarmChessWorker() {
  try {
    getWorker()
  } catch (error) {
    console.warn('[chess-worker] prewarm failed:', error)
  }
}

/** Stockfish search options mapped from engine config */
function stockfishOptionsFromConfig(config: EngineConfig): StockfishSearchOptions {
  // Map custom engine depth to Stockfish parameters
  const skillLevel = config.stockfishSkill ?? 20
  if (config.depth <= 4) {
    return { depth: 8, movetime: 500, skillLevel }
  } else if (config.depth <= 5) {
    return { depth: 15, movetime: 2000, skillLevel }
  } else {
    return { depth: 20, movetime: 5000, skillLevel }
  }
}

export async function getBestMoveAsync(
  fen: string,
  config: EngineConfig,
): Promise<string | null> {
  // Use Stockfish for depth >= 4 (levels 5+)
  if (config.useStockfish) {
    const opts = stockfishOptionsFromConfig(config)
    try {
      return await getStockfishMove(fen, opts)
    } catch (e) {
      console.error('[chess-worker] Stockfish call failed:', e)
      return null
    }
  }

  // Use custom engine for low levels
  return new Promise((resolve) => {
    const id = String(nextId++)
    pending.set(id, (r) => resolve(r as string | null))
    try {
      getWorker().postMessage({ id, type: 'getBestMove', fen, config })
    } catch {
      pending.delete(id)
      resolve(null)
    }
  })
}

export function analyzePositionAsync(
  fen: string,
  depth = 4,
  useStockfish = true,
  onProgress?: (info: StockfishAnalysis) => void,
  onInfoEvent?: (info: StockfishInfoEvent) => void,
): Promise<{
  eval: number
  bestLine: string[]
  isMate: boolean
  mateIn: number | null
  depth?: number
}> {
  // Always prefer Stockfish for analysis (much better quality)
  if (useStockfish) {
    return analyzeWithStockfish(fen, { depth: Math.max(depth, 16) }, onProgress, onInfoEvent)
  }

  // Fallback to custom engine
  return new Promise((resolve) => {
    const id = String(nextId++)
    const fallback = { eval: 0, bestLine: [], isMate: false, mateIn: null }
    pending.set(id, (r) =>
      resolve((r as typeof fallback) ?? fallback),
    )
    try {
      getWorker().postMessage({ id, type: 'analyzePosition', fen, depth })
    } catch {
      pending.delete(id)
      resolve(fallback)
    }
  })
}

/**
 * Analyze a position with Multi-PV (top N lines).
 * Returns an array of lines with eval for each.
 */
export function analyzeMultiPVAsync(
  fen: string,
  depth = 20,
  multiPV = 3,
  onProgress?: (info: StockfishAnalysis) => void,
  onInfoEvent?: (info: StockfishInfoEvent) => void,
): Promise<MultiPVAnalysis> {
  return analyzeMultiPV(fen, { depth }, multiPV, onProgress, onInfoEvent)
}

// --- Move Classification for Game Review ---

export type MoveClassification =
  | 'brilliant' | 'great' | 'best' | 'excellent' | 'good'
  | 'book' | 'inaccuracy' | 'mistake' | 'blunder' | 'miss'

export interface MoveReview {
  ply: number
  move: string // SAN
  fen: string // FEN after this move
  fenBefore: string // FEN before this move
  eval: number // eval after this move (white perspective)
  bestMove: string // best move (SAN)
  bestEval: number // eval of the best move (white perspective)
  classification: MoveClassification
  cpLoss: number // centipawn loss (0 for best moves)
  bestLine: string[] // PV from this position
  isMate: boolean
  mateIn: number | null
}

export interface GameReviewResult {
  moves: MoveReview[]
  whiteAccuracy: number // 0-100
  blackAccuracy: number // 0-100
  whiteAvgCPL: number
  blackAvgCPL: number
}

/**
 * Classify a move based on centipawn loss from the best move.
 */
function classifyMove(
  cpLoss: number,
  isBook: boolean,
  isBrilliant: boolean,
  missedTacticSwing: number,
): MoveClassification {
  if (isBook) return 'book'
  if (isBrilliant) return 'brilliant'
  if (missedTacticSwing >= 200) return 'miss'
  if (cpLoss <= 0) return 'best'
  if (cpLoss <= 10) return 'excellent'
  if (cpLoss <= 25) return 'good'
  if (cpLoss <= 50) return 'great'
  if (cpLoss <= 100) return 'inaccuracy'
  if (cpLoss <= 200) return 'mistake'
  return 'blunder'
}

/**
 * Full-depth game review: analyze every move and produce classifications.
 * This is the core pipeline for the chess.com-style post-game review.
 *
 * @param pgn - PGN string of the game
 * @param options.depth - Analysis depth (14 for casual, 18 for advanced)
 * @param options.onProgress - Callback with progress 0-1
 * @param options.bookMoves - Set of FEN keys that are in the opening book
 */
export async function reviewGameAsync(
  pgn: string,
  options: {
    depth?: number
    onProgress?: (progress: number) => void
    bookMoves?: Set<string>
  } = {},
): Promise<GameReviewResult> {
  const depth = options.depth ?? 16
  const onProgress = options.onProgress

  // Parse the PGN
  const game = new Chess()
  game.loadPgn(pgn)
  const history = game.history()
  const totalMoves = history.length

  if (totalMoves === 0) {
    return { moves: [], whiteAccuracy: 100, blackAccuracy: 100, whiteAvgCPL: 0, blackAvgCPL: 0 }
  }

  // Walk through the game, analyzing each position
  const reviewGame = new Chess()
  const moves: MoveReview[] = []
  let prevEval = 0 // Starting eval (white perspective)

  // First, get the eval of the starting position
  try {
    const startAnalysis = await analyzeWithStockfish(reviewGame.fen(), { depth: Math.min(depth, 12) })
    prevEval = startAnalysis.eval
  } catch {
    // Starting position is roughly 0.2-0.3 for white
    prevEval = 0.2
  }

  for (let i = 0; i < totalMoves; i++) {
    const fenBefore = reviewGame.fen()
    const isWhiteMove = i % 2 === 0
    const moveSAN = history[i]

    // Check if this position is in the opening book
    const isBook = options.bookMoves?.has(fenBefore.split(' ').slice(0, 2).join(' ')) ?? false

    // Analyze the position BEFORE the move to get the best move
    let bestEval = prevEval
    let bestMove = moveSAN
    let bestLine: string[] = []
    let isMate = false
    let mateIn: number | null = null

    if (!isBook) {
      try {
        const analysis = await analyzeWithStockfish(fenBefore, { depth })
        // Eval is from the side-to-move perspective in Stockfish, normalize to white
        bestEval = isWhiteMove ? analysis.eval : -analysis.eval
        bestLine = analysis.bestLine
        bestMove = analysis.bestLine[0] || moveSAN
        isMate = analysis.isMate
        mateIn = analysis.mateIn
      } catch {
        // If analysis fails, treat as best move
      }
    }

    // Make the move
    reviewGame.move(moveSAN)
    const fenAfter = reviewGame.fen()

    // Analyze after the move to get the actual eval
    let evalAfterMove = prevEval
    if (!isBook) {
      try {
        const afterAnalysis = await analyzeWithStockfish(fenAfter, { depth: Math.min(depth, 12) })
        // After the move, it's the opponent's turn, so negate
        evalAfterMove = isWhiteMove ? -afterAnalysis.eval : afterAnalysis.eval
      } catch {
        evalAfterMove = prevEval
      }
    }

    // Calculate centipawn loss (always positive, 0 = best)
    const evalDiff = bestEval - evalAfterMove
    const cpLoss = Math.max(0, Math.round(evalDiff * 100))

    // Check for missed tactic: was there a big swing the player missed?
    const missedTacticSwing = Math.max(0, (bestEval - evalAfterMove) * 100)

    // Check for brilliant: a sacrifice that maintains advantage
    const isBrilliant = !isBook && cpLoss === 0 && moveSAN.includes('x') &&
      Math.abs(bestEval) > 1.5 && bestLine.length > 0 && bestMove === moveSAN

    const classification = classifyMove(cpLoss, isBook, isBrilliant, missedTacticSwing)

    moves.push({
      ply: i + 1,
      move: moveSAN,
      fen: fenAfter,
      fenBefore,
      eval: evalAfterMove,
      bestMove,
      bestEval,
      classification,
      cpLoss,
      bestLine,
      isMate,
      mateIn,
    })

    prevEval = evalAfterMove

    // Report progress
    if (onProgress) {
      onProgress((i + 1) / totalMoves)
    }
  }

  // Calculate accuracy per side using Lichess formula: 100 * exp(-0.004 * avgCPL)
  const whiteMoves = moves.filter((_, i) => i % 2 === 0)
  const blackMoves = moves.filter((_, i) => i % 2 === 1)

  const whiteAvgCPL = whiteMoves.length > 0
    ? whiteMoves.reduce((sum, m) => sum + m.cpLoss, 0) / whiteMoves.length
    : 0
  const blackAvgCPL = blackMoves.length > 0
    ? blackMoves.reduce((sum, m) => sum + m.cpLoss, 0) / blackMoves.length
    : 0

  const whiteAccuracy = Math.min(100, Math.max(0, Math.round(100 * Math.exp(-0.004 * whiteAvgCPL))))
  const blackAccuracy = Math.min(100, Math.max(0, Math.round(100 * Math.exp(-0.004 * blackAvgCPL))))

  return {
    moves,
    whiteAccuracy,
    blackAccuracy,
    whiteAvgCPL: Math.round(whiteAvgCPL),
    blackAvgCPL: Math.round(blackAvgCPL),
  }
}

/** Stop any running Stockfish analysis */
export function stopAnalysis() {
  stopStockfish()
}

/** Terminate all workers */
export function terminateWorker() {
  worker?.terminate()
  worker = null
  pending.clear()
  terminateStockfish()
}

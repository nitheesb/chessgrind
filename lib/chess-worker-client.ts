/**
 * Chess Worker Client
 * Provides async wrappers for getBestMove and analyzePosition.
 * Routes to either the custom engine (low levels) or Stockfish WASM (high levels).
 */
import type { EngineConfig } from './chess-engine'
import {
  getStockfishMove,
  analyzeWithStockfish,
  stopStockfish,
  terminateStockfish,
  type StockfishSearchOptions,
  type StockfishAnalysis,
} from './stockfish-client'

type PendingResolver = (value: unknown) => void

let worker: Worker | null = null
const pending = new Map<string, PendingResolver>()
let nextId = 0

function getWorker(): Worker {
  if (worker) return worker
  // next/webpack and turbopack both handle `new URL('...', import.meta.url)`
  worker = new Worker(new URL('./engine.worker', import.meta.url))
  worker.onmessage = (e: MessageEvent) => {
    const { id, result } = e.data
    const resolve = pending.get(id)
    if (resolve) {
      resolve(result)
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

/** Stockfish search options mapped from engine config */
function stockfishOptionsFromConfig(config: EngineConfig): StockfishSearchOptions {
  // Map custom engine depth to Stockfish parameters
  // Custom depth 4 → SF depth 10, depth 5 → SF depth 15, depth 6+ → SF depth 20
  if (config.depth <= 4) {
    return { depth: 10, movetime: 800 }
  } else if (config.depth <= 5) {
    return { depth: 15, movetime: 2000 }
  } else {
    return { depth: 20, movetime: 5000 }
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
): Promise<{
  eval: number
  bestLine: string[]
  isMate: boolean
  mateIn: number | null
  depth?: number
}> {
  // Always prefer Stockfish for analysis (much better quality)
  if (useStockfish) {
    return analyzeWithStockfish(fen, { depth: Math.max(depth, 16) }, onProgress)
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

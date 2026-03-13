/**
 * Chess Worker Client
 * Provides async wrappers for getBestMove and analyzePosition
 * that run inside a Web Worker — keeping the main thread free.
 */
import type { EngineConfig } from './chess-engine'

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
    // Resolve all pending with null so callers don't hang
    pending.forEach((resolve) => resolve(null))
    pending.clear()
    worker = null // force recreation on next call
  }
  return worker
}

export function getBestMoveAsync(
  fen: string,
  config: EngineConfig,
): Promise<string | null> {
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
): Promise<{
  eval: number
  bestLine: string[]
  isMate: boolean
  mateIn: number | null
}> {
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

/** Terminate the worker (call on component unmount if needed) */
export function terminateWorker() {
  worker?.terminate()
  worker = null
  pending.clear()
}

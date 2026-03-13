/**
 * Chess Engine Web Worker
 * Runs getBestMove and analyzePosition off the main thread
 * so the UI never freezes during engine search.
 */
import { Chess } from 'chess.js'
import { getBestMove, analyzePosition } from './chess-engine'

self.onmessage = (e: MessageEvent) => {
  const { id, type, fen, config, depth } = e.data
  try {
    const game = new Chess(fen)
    if (type === 'getBestMove') {
      const result = getBestMove(game, config)
      ;(self as unknown as Worker).postMessage({ id, result })
    } else if (type === 'analyzePosition') {
      const result = analyzePosition(game, depth ?? 4)
      ;(self as unknown as Worker).postMessage({ id, result })
    }
  } catch (err) {
    ;(self as unknown as Worker).postMessage({ id, error: String(err), result: null })
  }
}

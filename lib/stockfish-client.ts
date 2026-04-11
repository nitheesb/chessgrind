/**
 * Stockfish WASM Client
 * Communicates with Stockfish 18 via UCI protocol over a Web Worker.
 * Lazy-loads the engine only when first needed (~7MB WASM download).
 */
import { Chess } from 'chess.js'

// --- Types ---

export interface StockfishMoveResult {
  bestMove: string // SAN notation (e.g. "e4", "Nf3")
  ponder?: string // SAN notation of ponder move
}

export interface StockfishAnalysis {
  eval: number // centipawns / 100 (positive = white advantage)
  bestLine: string[] // SAN moves
  depth: number
  isMate: boolean
  mateIn: number | null
}

export interface StockfishSearchOptions {
  depth?: number // search to this depth
  movetime?: number // search for this many ms
  nodes?: number // search this many nodes
  skillLevel?: number // Stockfish Skill Level 0-20 (default 20 = max strength)
}

// --- State ---

let worker: Worker | null = null
let isReady = false
let initPromise: Promise<void> | null = null
let initRejecter: ((err: Error) => void) | null = null
let currentAnalysisCallback: ((info: StockfishAnalysis) => void) | null = null
let bestMoveResolver: ((result: StockfishMoveResult | null) => void) | null = null
let analysisResolver: ((result: StockfishAnalysis) => void) | null = null
let latestAnalysis: StockfishAnalysis = { eval: 0, bestLine: [], depth: 0, isMate: false, mateIn: null }
let currentFen = '' // FEN being analyzed, for SAN conversion
let currentRequestId = 0 // Prevents stale responses resolving wrong promises

// --- UCI Output Parsing ---

function parseBestMove(line: string): { bestMove: string; ponder?: string } | null {
  const match = line.match(/^bestmove\s+(\S+)(?:\s+ponder\s+(\S+))?/)
  if (!match) return null
  return { bestMove: match[1], ponder: match[2] }
}

function parseInfoLine(line: string): Partial<StockfishAnalysis> & { pvMoves?: string[] } {
  const result: Partial<StockfishAnalysis> & { pvMoves?: string[] } = {}

  // Depth
  const depthMatch = line.match(/\bdepth\s+(\d+)/)
  if (depthMatch) result.depth = parseInt(depthMatch[1])

  // Score
  const cpMatch = line.match(/\bscore\s+cp\s+(-?\d+)/)
  if (cpMatch) {
    result.eval = parseInt(cpMatch[1]) / 100
    result.isMate = false
    result.mateIn = null
  }
  const mateMatch = line.match(/\bscore\s+mate\s+(-?\d+)/)
  if (mateMatch) {
    const mateIn = parseInt(mateMatch[1])
    result.isMate = true
    result.mateIn = mateIn
    result.eval = mateIn > 0 ? 100 : -100 // large value for mate
  }

  // PV (principal variation) - long algebraic moves
  const pvMatch = line.match(/\bpv\s+(.+)$/)
  if (pvMatch) {
    result.pvMoves = pvMatch[1].trim().split(/\s+/)
  }

  return result
}

/**
 * Convert a list of UCI long-algebraic moves to SAN notation.
 * Uses chess.js to walk through the moves from the given FEN.
 */
function uciToSan(fen: string, uciMoves: string[]): string[] {
  try {
    const g = new Chess(fen)
    const sanMoves: string[] = []
    for (const uci of uciMoves) {
      const from = uci.slice(0, 2)
      const to = uci.slice(2, 4)
      const promotion = uci.length > 4 ? uci[4] : undefined
      try {
        const move = g.move({ from, to, promotion })
        if (move) {
          sanMoves.push(move.san)
        } else {
          break
        }
      } catch {
        break
      }
    }
    return sanMoves
  } catch {
    return []
  }
}

/**
 * Convert a single UCI move to SAN for a given FEN.
 */
function uciMovToSan(fen: string, uci: string): string | null {
  try {
    const g = new Chess(fen)
    const from = uci.slice(0, 2)
    const to = uci.slice(2, 4)
    const promotion = uci.length > 4 ? uci[4] : undefined
    const move = g.move({ from, to, promotion })
    return move ? move.san : null
  } catch {
    return null
  }
}

// --- Worker Management ---

function createWorker(): Worker {
  const w = new Worker('/stockfish/stockfish-18-lite-single.js')
  w.onmessage = handleMessage
  w.onerror = (e) => {
    console.error('[stockfish] worker error', e)
    isReady = false
    worker = null
    initPromise = null
    // Reject pending init if still waiting
    if (initRejecter) {
      initRejecter(new Error('Stockfish worker error'))
      initRejecter = null
    }
    // Resolve any pending promises with null
    if (bestMoveResolver) {
      bestMoveResolver(null)
      bestMoveResolver = null
    }
    if (analysisResolver) {
      analysisResolver(latestAnalysis)
      analysisResolver = null
    }
  }
  return w
}

function handleMessage(e: MessageEvent) {
  const line = typeof e.data === 'string' ? e.data : String(e.data)

  // Init sequence
  if (line === 'uciok' || line === 'readyok') {
    // handled by init promise
    return
  }

  // Info lines during search
  if (line.startsWith('info') && line.includes(' pv ')) {
    const parsed = parseInfoLine(line)
    if (parsed.depth !== undefined) {
      const sanMoves = parsed.pvMoves ? uciToSan(currentFen, parsed.pvMoves) : latestAnalysis.bestLine
      latestAnalysis = {
        eval: parsed.eval ?? latestAnalysis.eval,
        bestLine: sanMoves.length > 0 ? sanMoves : latestAnalysis.bestLine,
        depth: parsed.depth,
        isMate: parsed.isMate ?? latestAnalysis.isMate,
        mateIn: parsed.mateIn !== undefined ? parsed.mateIn : latestAnalysis.mateIn,
      }
      // Stream updates to callback if registered
      if (currentAnalysisCallback) {
        currentAnalysisCallback({ ...latestAnalysis })
      }
    }
    return
  }

  // Best move result
  if (line.startsWith('bestmove')) {
    const parsed = parseBestMove(line)

    if (bestMoveResolver && parsed) {
      const san = uciMovToSan(currentFen, parsed.bestMove)
      bestMoveResolver(san ? {
        bestMove: san,
        ponder: parsed.ponder ? uciMovToSan(currentFen, parsed.ponder) || undefined : undefined,
      } : null)
      bestMoveResolver = null
    }

    if (analysisResolver) {
      analysisResolver({ ...latestAnalysis })
      analysisResolver = null
    }
    return
  }
}

function sendUCI(cmd: string) {
  worker?.postMessage(cmd)
}

// --- Public API ---

/**
 * Initialize the Stockfish engine. Called automatically on first use.
 * Returns immediately if already initialized.
 */
export function initStockfish(): Promise<void> {
  if (isReady) return Promise.resolve()
  if (initPromise) return initPromise

  initPromise = new Promise<void>((resolve, reject) => {
    initRejecter = reject
    worker = createWorker()

    // 15-second timeout for WASM load + init
    const initTimeout = setTimeout(() => {
      console.error('[stockfish] init timed out after 15s')
      worker?.terminate()
      worker = null
      isReady = false
      initPromise = null
      initRejecter = null
      reject(new Error('Stockfish init timeout'))
    }, 15000)

    let gotUciOk = false

    const originalOnMessage = worker.onmessage
    worker.onmessage = (e: MessageEvent) => {
      const line = typeof e.data === 'string' ? e.data : String(e.data)

      if (line === 'uciok' && !gotUciOk) {
        gotUciOk = true
        // Configure engine
        sendUCI('setoption name Hash value 16')
        sendUCI('setoption name Threads value 1')
        sendUCI('isready')
        return
      }

      if (line === 'readyok' && gotUciOk) {
        clearTimeout(initTimeout)
        isReady = true
        initRejecter = null
        // Restore normal message handler
        if (worker) worker.onmessage = handleMessage
        resolve()
        return
      }
    }

    sendUCI('uci')
  })

  return initPromise
}

/**
 * Get the best move for a position using Stockfish.
 * Returns SAN notation (e.g. "e4", "Nf3").
 */
export async function getStockfishMove(
  fen: string,
  options: StockfishSearchOptions = {},
): Promise<string | null> {
  await initStockfish()

  // Cancel any ongoing search
  sendUCI('stop')

  // Resolve any stale pending request with null
  if (bestMoveResolver) {
    bestMoveResolver(null)
    bestMoveResolver = null
  }

  const requestId = ++currentRequestId

  return new Promise<string | null>((resolve) => {
    currentFen = fen
    bestMoveResolver = (result) => {
      // Only resolve if this is still the current request
      if (currentRequestId !== requestId) {
        resolve(null)
        return
      }
      resolve(result?.bestMove ?? null)
    }

    // Set Skill Level if specified (0-20, default 20 = max strength)
    if (options.skillLevel !== undefined) {
      sendUCI('setoption name Skill Level value ' + Math.max(0, Math.min(20, options.skillLevel)))
    }

    sendUCI('position fen ' + fen)

    // Build go command
    let goCmd = 'go'
    if (options.depth) goCmd += ' depth ' + options.depth
    if (options.movetime) goCmd += ' movetime ' + options.movetime
    if (options.nodes) goCmd += ' nodes ' + options.nodes
    // Default: search for 1 second
    if (!options.depth && !options.movetime && !options.nodes) {
      goCmd += ' movetime 1000'
    }

    sendUCI(goCmd)

    // Safety timeout: resolve null if no response in 30s
    const safetyTimeout = setTimeout(() => {
      if (bestMoveResolver && currentRequestId === requestId) {
        bestMoveResolver(null)
        bestMoveResolver = null
        sendUCI('stop')
      }
    }, 30000)

    // Store original resolver so we can clear timeout on normal resolution
    const originalResolver = bestMoveResolver
    bestMoveResolver = (result) => {
      clearTimeout(safetyTimeout)
      originalResolver(result)
    }
  })
}

/**
 * Analyze a position with Stockfish. Returns eval + best line.
 * Optionally accepts a streaming callback for intermediate results.
 */
export async function analyzeWithStockfish(
  fen: string,
  options: StockfishSearchOptions = {},
  onProgress?: (info: StockfishAnalysis) => void,
): Promise<StockfishAnalysis> {
  await initStockfish()

  // Cancel any ongoing search
  sendUCI('stop')

  return new Promise<StockfishAnalysis>((resolve) => {
    currentFen = fen
    currentAnalysisCallback = onProgress || null
    latestAnalysis = { eval: 0, bestLine: [], depth: 0, isMate: false, mateIn: null }

    analysisResolver = (result) => {
      currentAnalysisCallback = null
      resolve(result)
    }

    sendUCI('position fen ' + fen)

    let goCmd = 'go'
    if (options.depth) goCmd += ' depth ' + options.depth
    if (options.movetime) goCmd += ' movetime ' + options.movetime
    if (!options.depth && !options.movetime) {
      goCmd += ' depth 20'
    }

    sendUCI(goCmd)

    // Safety timeout
    const safetyTimeout = setTimeout(() => {
      if (analysisResolver) {
        currentAnalysisCallback = null
        analysisResolver({ ...latestAnalysis })
        analysisResolver = null
        sendUCI('stop')
      }
    }, 30000)

    const originalResolver = analysisResolver
    analysisResolver = (result) => {
      clearTimeout(safetyTimeout)
      originalResolver(result)
    }
  })
}

/**
 * Stop the current Stockfish search.
 */
export function stopStockfish() {
  if (worker && isReady) {
    sendUCI('stop')
  }
  currentAnalysisCallback = null
  bestMoveResolver = null
  analysisResolver = null
}

/**
 * Terminate the Stockfish worker entirely.
 */
export function terminateStockfish() {
  stopStockfish()
  worker?.terminate()
  worker = null
  isReady = false
  initPromise = null
}

/**
 * Check if Stockfish is currently loaded.
 */
export function isStockfishReady(): boolean {
  return isReady
}

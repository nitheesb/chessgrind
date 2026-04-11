/**
 * Lichess API Client
 * Centralized client for Lichess API integration.
 * Handles rate limiting, caching, and response parsing.
 */
import { Chess } from 'chess.js'

// --- Types ---

export interface LichessPuzzle {
  id: string
  fen: string // Initial FEN before the first move
  moves: string[] // UCI moves (first move is opponent's, then yours, etc.)
  rating: number
  themes: string[]
  gameUrl?: string
}

export interface LichessDailyPuzzle {
  puzzle: LichessPuzzle
  game: {
    id: string
    pgn: string
    players: { white: { name: string; rating: number }; black: { name: string; rating: number } }
  }
}

export interface OpeningExplorerMove {
  uci: string
  san: string
  white: number
  draws: number
  black: number
  averageRating?: number
}

export interface OpeningExplorerResult {
  white: number
  draws: number
  black: number
  moves: OpeningExplorerMove[]
  topGames?: Array<{
    id: string
    white: { name: string; rating: number }
    black: { name: string; rating: number }
    winner?: 'white' | 'black'
    year: number
  }>
  opening?: { eco: string; name: string }
}

export interface LichessGame {
  id: string
  rated: boolean
  variant: string
  speed: string
  status: string
  players: {
    white: { user?: { name: string; id: string }; rating?: number; aiLevel?: number }
    black: { user?: { name: string; id: string }; rating?: number; aiLevel?: number }
  }
  winner?: 'white' | 'black'
  moves?: string
  pgn?: string
  opening?: { eco: string; name: string; ply: number }
  clock?: { initial: number; increment: number }
  createdAt: number
}

// --- Rate Limiter ---

class RateLimiter {
  private pending: Promise<void> = Promise.resolve()
  private minInterval: number

  constructor(requestsPerSecond: number) {
    this.minInterval = 1000 / requestsPerSecond
  }

  async wait(): Promise<void> {
    this.pending = this.pending.then(
      () => new Promise((resolve) => setTimeout(resolve, this.minInterval))
    )
    return this.pending
  }
}

// --- Cache ---

const cache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

function setCache(key: string, data: unknown) {
  cache.set(key, { data, timestamp: Date.now() })
  // Evict old entries if cache grows too large
  if (cache.size > 200) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)
    for (let i = 0; i < 50; i++) cache.delete(oldest[i][0])
  }
}

// --- Rate limiters ---

const mainLimiter = new RateLimiter(2) // 2 req/s for main API
const explorerLimiter = new RateLimiter(1) // 1 req/s for opening explorer

// --- Helpers ---

let lichessToken: string | null = null

export function setLichessToken(token: string | null) {
  lichessToken = token
}

export function getLichessToken(): string | null {
  return lichessToken
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = { 'Accept': 'application/json' }
  // Only include auth header when using client-side token (direct to Lichess)
  if (lichessToken) {
    headers['Authorization'] = `Bearer ${lichessToken}`
  }
  return headers
}

/**
 * Get the base URL for API calls.
 * When a client-side token is set, calls go directly to Lichess.
 * Otherwise, calls go through our server-side proxy (which has the site-wide token).
 */
function getBaseUrl(endpoint: 'api' | 'explorer'): string {
  if (lichessToken) {
    return endpoint === 'explorer' ? 'https://explorer.lichess.org' : 'https://lichess.org/api'
  }
  // Route through server-side proxy
  return endpoint === 'explorer' ? '/api/lichess/explorer' : '/api/lichess'
}

async function fetchWithRetry(url: string, options: RequestInit = {}, limiter: RateLimiter): Promise<Response> {
  await limiter.wait()
  const res = await fetch(url, options)

  if (res.status === 429) {
    // Respect Retry-After header, default 2s, cap at 60s
    const retryAfter = res.headers.get('Retry-After')
    const waitMs = Math.min((retryAfter ? parseInt(retryAfter, 10) * 1000 : 2000) || 2000, 60_000)
    await new Promise(r => setTimeout(r, waitMs))
    await limiter.wait()
    return fetch(url, options)
  }

  return res
}

// --- Puzzle API ---

/**
 * Get the daily puzzle from Lichess (no auth required)
 */
export async function getDailyPuzzle(): Promise<LichessDailyPuzzle | null> {
  const cacheKey = 'lichess:daily-puzzle'
  const cached = getCached<LichessDailyPuzzle>(cacheKey)
  if (cached) return cached

  try {
    const res = await fetchWithRetry(
      `${getBaseUrl('api')}/puzzle/daily`,
      { headers: getHeaders() },
      mainLimiter,
    )
    if (!res.ok) return null
    const data = await res.json()

    const puzzle: LichessDailyPuzzle = {
      puzzle: {
        id: data.puzzle?.id || '',
        fen: '',
        moves: data.puzzle?.solution || [],
        rating: data.puzzle?.rating || 1500,
        themes: data.puzzle?.themes || [],
      },
      game: {
        id: data.game?.id || '',
        pgn: data.game?.pgn || '',
        players: data.game?.players || { white: { name: '?', rating: 0 }, black: { name: '?', rating: 0 } },
      },
    }

    // The puzzle FEN comes from playing the game PGN up to initialPly
    if (data.puzzle?.initialPly != null && data.game?.pgn) {
      puzzle.puzzle.fen = extractFenFromPgn(data.game.pgn, data.puzzle.initialPly)
    }

    setCache(cacheKey, puzzle)
    return puzzle
  } catch (e) {
    console.error('[lichess] daily puzzle error:', e)
    return null
  }
}

/**
 * Get a specific puzzle by ID (no auth required)
 */
export async function getPuzzleById(id: string): Promise<LichessPuzzle | null> {
  const cacheKey = `lichess:puzzle:${id}`
  const cached = getCached<LichessPuzzle>(cacheKey)
  if (cached) return cached

  try {
    const res = await fetchWithRetry(
      `${getBaseUrl('api')}/puzzle/${id}`,
      { headers: getHeaders() },
      mainLimiter,
    )
    if (!res.ok) return null
    const data = await res.json()

    const puzzle: LichessPuzzle = {
      id: data.puzzle?.id || id,
      fen: '',
      moves: data.puzzle?.solution || [],
      rating: data.puzzle?.rating || 1500,
      themes: data.puzzle?.themes || [],
    }

    if (data.puzzle?.initialPly != null && data.game?.pgn) {
      puzzle.fen = extractFenFromPgn(data.game.pgn, data.puzzle.initialPly)
    }

    setCache(cacheKey, puzzle)
    return puzzle
  } catch (e) {
    console.error('[lichess] puzzle by id error:', e)
    return null
  }
}

// --- Opening Explorer API ---

/**
 * Query the Lichess opening explorer for a position.
 * @param fen - FEN of the position to look up
 * @param source - 'masters' for OTB master games, 'lichess' for online games
 */
export async function getOpeningExplorer(
  fen: string,
  source: 'masters' | 'lichess' = 'lichess',
  options: { speeds?: string; ratings?: string } = {},
): Promise<OpeningExplorerResult | null> {
  const cacheKey = `lichess:explorer:${source}:${fen}:${options.speeds || ''}:${options.ratings || ''}`
  const cached = getCached<OpeningExplorerResult>(cacheKey)
  if (cached) return cached

  try {
    const params = new URLSearchParams({ fen })
    if (source === 'lichess') {
      if (options.speeds) params.set('speeds', options.speeds)
      if (options.ratings) params.set('ratings', options.ratings)
    }
    params.set('moves', '12')
    params.set('topGames', '3')

    const res = await fetchWithRetry(
      `${getBaseUrl('explorer')}/${source}?${params}`,
      { headers: { 'Accept': 'application/json' } },
      explorerLimiter,
    )
    if (!res.ok) return null
    const data = await res.json()

    const result: OpeningExplorerResult = {
      white: data.white || 0,
      draws: data.draws || 0,
      black: data.black || 0,
      moves: (data.moves || []).map((m: Record<string, unknown>) => ({
        uci: m.uci as string,
        san: m.san as string,
        white: (m.white as number) || 0,
        draws: (m.draws as number) || 0,
        black: (m.black as number) || 0,
        averageRating: m.averageRating as number | undefined,
      })),
      topGames: data.topGames || [],
      opening: data.opening || undefined,
    }

    setCache(cacheKey, result)
    return result
  } catch (e) {
    console.error('[lichess] explorer error:', e)
    return null
  }
}

// --- Player Games API ---

/**
 * Fetch recent games for a Lichess user
 * @param username - Lichess username
 * @param max - Maximum number of games (default 20)
 */
export async function getPlayerGames(
  username: string,
  options: { max?: number; rated?: boolean; perfType?: string } = {},
): Promise<LichessGame[]> {
  const max = options.max || 20
  const cacheKey = `lichess:games:${username}:${max}:${options.rated ?? ''}:${options.perfType ?? ''}`
  const cached = getCached<LichessGame[]>(cacheKey)
  if (cached) return cached

  try {
    const params = new URLSearchParams({
      max: String(max),
      opening: 'true',
      pgnInJson: 'true',
      clocks: 'true',
    })
    if (options.rated !== undefined) params.set('rated', String(options.rated))
    if (options.perfType) params.set('perfType', options.perfType)

    const res = await fetchWithRetry(
      `${getBaseUrl('api')}/games/user/${encodeURIComponent(username)}?${params}`,
      {
        headers: {
          ...getHeaders(),
          'Accept': 'application/x-ndjson',
        },
      },
      mainLimiter,
    )
    if (!res.ok) return []

    const text = await res.text()
    const games: LichessGame[] = text
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => {
        try { return JSON.parse(line) as LichessGame }
        catch { return null }
      })
      .filter((g): g is LichessGame => g !== null)

    setCache(cacheKey, games)
    return games
  } catch (e) {
    console.error('[lichess] games error:', e)
    return []
  }
}

/**
 * Export a single game by ID
 */
export async function getGameById(gameId: string): Promise<LichessGame | null> {
  const cacheKey = `lichess:game:${gameId}`
  const cached = getCached<LichessGame>(cacheKey)
  if (cached) return cached

  try {
    const baseUrl = lichessToken
      ? `https://lichess.org/game/export/${gameId}`
      : `/api/lichess/game-export/${gameId}`
    const res = await fetchWithRetry(
      `${baseUrl}?pgnInJson=true&opening=true&clocks=true`,
      { headers: getHeaders() },
      mainLimiter,
    )
    if (!res.ok) return null
    const data = await res.json()
    setCache(cacheKey, data)
    return data as LichessGame
  } catch (e) {
    console.error('[lichess] game by id error:', e)
    return null
  }
}

// --- Helpers ---

/**
 * Extract FEN at a given ply from PGN text.
 * Uses chess.js to replay the game.
 */
function extractFenFromPgn(pgn: string, ply: number): string {
  try {
    const game = new Chess()

    // Strip PGN headers and result
    const movesText = pgn
      .replace(/\[.*?\]\s*/g, '')
      .replace(/\{.*?\}/g, '')
      .replace(/\d+\.\.\./g, '')
      .replace(/\d+\./g, '')
      .replace(/(1-0|0-1|1\/2-1\/2|\*)\s*$/, '')
      .trim()

    const moves = movesText.split(/\s+/).filter(Boolean)

    for (let i = 0; i < Math.min(ply, moves.length); i++) {
      try {
        game.move(moves[i])
      } catch {
        break
      }
    }

    return game.fen()
  } catch {
    return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
  }
}

/**
 * Convert a Lichess puzzle to the app's Puzzle format
 */
export function lichessPuzzleToAppPuzzle(lp: LichessPuzzle): {
  id: string
  fen: string
  moves: string[]
  rating: number
  themes: string[]
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  xpReward: number
  source: 'lichess'
  lichessId: string
} {
  const difficulty = lp.rating < 1200 ? 'easy'
    : lp.rating < 1600 ? 'medium'
    : lp.rating < 2000 ? 'hard'
    : 'expert'

  return {
    id: `lichess-${lp.id}`,
    fen: lp.fen,
    moves: lp.moves,
    rating: lp.rating,
    themes: lp.themes,
    title: `Lichess Puzzle ${lp.id}`,
    description: `Rating: ${lp.rating} • ${lp.themes.slice(0, 3).join(', ')}`,
    difficulty,
    xpReward: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : difficulty === 'hard' ? 35 : 50,
    source: 'lichess' as const,
    lichessId: lp.id,
  }
}

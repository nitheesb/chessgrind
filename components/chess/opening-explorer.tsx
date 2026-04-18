'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { getOpeningExplorer, type OpeningExplorerResult, type OpeningExplorerMove } from '@/lib/lichess-api'
import { Database, Globe, ChevronDown, ExternalLink } from 'lucide-react'

interface OpeningExplorerProps {
  fen: string
  onMoveClick?: (uci: string, san: string) => void
  compact?: boolean
}

type DBSource = 'masters' | 'lichess'

const SPEED_OPTIONS = [
  { value: 'ultraBullet', label: 'UltraBullet' },
  { value: 'bullet', label: 'Bullet' },
  { value: 'blitz', label: 'Blitz' },
  { value: 'rapid', label: 'Rapid' },
  { value: 'classical', label: 'Classical' },
  { value: 'correspondence', label: 'Corr' },
]

const RATING_OPTIONS = [
  { value: '1000', label: '1000+' },
  { value: '1200', label: '1200+' },
  { value: '1400', label: '1400+' },
  { value: '1600', label: '1600+' },
  { value: '1800', label: '1800+' },
  { value: '2000', label: '2000+' },
  { value: '2200', label: '2200+' },
  { value: '2500', label: '2500+' },
]

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

function WinDrawLossBar({ white, draws, black }: { white: number; draws: number; black: number }) {
  const total = white + draws + black
  if (total === 0) return null
  const wPct = (white / total) * 100
  const dPct = (draws / total) * 100
  const bPct = (black / total) * 100

  return (
    <div className="flex w-full h-5 rounded overflow-hidden text-[10px] font-semibold leading-5">
      {wPct > 0 && (
        <div className="bg-white text-black text-center truncate" style={{ width: `${wPct}%` }}>
          {wPct >= 10 ? `${wPct.toFixed(0)}%` : ''}
        </div>
      )}
      {dPct > 0 && (
        <div className="bg-zinc-500 text-white text-center truncate" style={{ width: `${dPct}%` }}>
          {dPct >= 10 ? `${dPct.toFixed(0)}%` : ''}
        </div>
      )}
      {bPct > 0 && (
        <div className="bg-zinc-900 text-zinc-300 text-center truncate" style={{ width: `${bPct}%` }}>
          {bPct >= 10 ? `${bPct.toFixed(0)}%` : ''}
        </div>
      )}
    </div>
  )
}

function MiniWinBar({ white, draws, black }: { white: number; draws: number; black: number }) {
  const total = white + draws + black
  if (total === 0) return null
  const wPct = (white / total) * 100
  const dPct = (draws / total) * 100

  return (
    <div className="flex w-16 h-2.5 rounded-sm overflow-hidden bg-zinc-900 flex-shrink-0">
      <div className="bg-white" style={{ width: `${wPct}%` }} />
      <div className="bg-zinc-500" style={{ width: `${dPct}%` }} />
    </div>
  )
}

export function OpeningExplorer({ fen, onMoveClick, compact }: OpeningExplorerProps) {
  const [data, setData] = useState<OpeningExplorerResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [source, setSource] = useState<DBSource>('lichess')
  const [speeds, setSpeeds] = useState<string[]>(['blitz', 'rapid', 'classical'])
  const [minRating, setMinRating] = useState('1600')
  const [showFilters, setShowFilters] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef(0)

  const fetchData = useCallback(async (fen: string, id: number, src: DBSource, spds: string[], rating: string) => {
    setLoading(true)
    setError(false)
    try {
      const options = src === 'lichess' ? {
        speeds: spds.join(','),
        ratings: RATING_OPTIONS.filter(r => parseInt(r.value) >= parseInt(rating)).map(r => r.value).join(','),
      } : {}
      const result = await getOpeningExplorer(fen, src, options)
      if (abortRef.current === id) {
        setData(result)
        setError(result === null)
      }
    } catch {
      if (abortRef.current === id) { setData(null); setError(true) }
    } finally {
      if (abortRef.current === id) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const id = ++abortRef.current
    debounceRef.current = setTimeout(() => {
      fetchData(fen, id, source, speeds, minRating)
    }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [fen, source, speeds, minRating, fetchData])

  const toggleSpeed = useCallback((speed: string) => {
    setSpeeds(prev => {
      if (prev.includes(speed)) return prev.length > 1 ? prev.filter(s => s !== speed) : prev
      return [...prev, speed]
    })
  }, [])

  const totalGames = data ? data.white + data.draws + data.black : 0
  const sortedMoves: OpeningExplorerMove[] = data
    ? [...data.moves].sort((a, b) => (b.white + b.draws + b.black) - (a.white + a.draws + a.black))
    : []

  return (
    <div className="rounded-lg border border-white/[0.06] bg-black/20 text-sm">
      {/* Header with source toggle */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Explorer</span>
          {loading && (
            <div className="h-3 w-3 border-[1.5px] border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSource('masters')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              source === 'masters' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Database className="w-3 h-3" />
            Masters
          </button>
          <button
            onClick={() => setSource('lichess')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              source === 'lichess' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Globe className="w-3 h-3" />
            Lichess
          </button>
          {source === 'lichess' && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-0.5 rounded text-[10px] transition-colors ${showFilters ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {/* Lichess filters */}
      {source === 'lichess' && showFilters && (
        <div className="px-3 py-2 border-b border-white/[0.06] space-y-1.5">
          <div>
            <span className="text-[10px] text-muted-foreground">Time controls</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {SPEED_OPTIONS.map(s => (
                <button
                  key={s.value}
                  onClick={() => toggleSpeed(s.value)}
                  className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                    speeds.includes(s.value) ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground/60 hover:text-muted-foreground'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">Min rating</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {RATING_OPTIONS.map(r => (
                <button
                  key={r.value}
                  onClick={() => setMinRating(r.value)}
                  className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
                    minRating === r.value ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground/60 hover:text-muted-foreground'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-3 py-2">
        {/* Loading state */}
        {loading && !data && (
          <div className="flex items-center justify-center py-4 text-muted-foreground text-xs">
            Loading position data...
          </div>
        )}

        {/* No data state */}
        {!loading && (error || (data && totalGames === 0)) && (
          <div className="text-center py-4 text-muted-foreground text-xs">
            No games found for this position
          </div>
        )}

        {/* Results */}
        {data && totalGames > 0 && (
          <div className="space-y-2">
            {/* Opening name */}
            {data.opening && (
              <div className="text-xs text-muted-foreground">
                <span className="font-mono text-foreground/70 mr-1.5">{data.opening.eco}</span>
                {data.opening.name}
              </div>
            )}

            {/* Overall win/draw/loss bar */}
            <div className="space-y-1">
              <WinDrawLossBar white={data.white} draws={data.draws} black={data.black} />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <div className="flex gap-2">
                  <span className="text-white/80">White {((data.white / totalGames) * 100).toFixed(0)}%</span>
                  <span>Draw {((data.draws / totalGames) * 100).toFixed(0)}%</span>
                  <span className="text-white/40">Black {((data.black / totalGames) * 100).toFixed(0)}%</span>
                </div>
                <span>{formatNumber(totalGames)} games</span>
              </div>
            </div>

            {/* Move list */}
            {sortedMoves.length > 0 && (
              <div className="space-y-0.5">
                {/* Column headers */}
                <div className="grid grid-cols-[2.5rem_1fr_3rem_3.5rem] gap-x-2 text-[10px] text-muted-foreground uppercase tracking-wider px-1 pb-1 border-b border-white/[0.06]">
                  <span>Move</span>
                  <span>Result</span>
                  <span className="text-right">Games</span>
                  <span className="text-right">{source === 'masters' ? 'Avg' : 'Perf'}</span>
                </div>

                {sortedMoves.slice(0, compact ? 8 : 12).map((move) => {
                  const moveTotal = move.white + move.draws + move.black
                  const winPct = moveTotal > 0 ? ((move.white / moveTotal) * 100).toFixed(0) : '—'
                  return (
                    <div
                      key={move.uci}
                      onClick={() => onMoveClick?.(move.uci, move.san)}
                      className={`grid grid-cols-[2.5rem_1fr_3rem_3.5rem] gap-x-2 items-center px-1 py-1 rounded transition-colors ${
                        onMoveClick ? 'cursor-pointer hover:bg-white/[0.06] active:bg-white/[0.08]' : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      <span className="font-bold text-foreground">{move.san}</span>
                      <MiniWinBar white={move.white} draws={move.draws} black={move.black} />
                      <span className="text-xs text-muted-foreground text-right tabular-nums">
                        {formatNumber(moveTotal)}
                      </span>
                      <span className="text-xs text-muted-foreground text-right tabular-nums">
                        {move.averageRating ?? '—'}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Top Games (masters only, or if available) */}
            {!compact && data.topGames && data.topGames.length > 0 && (
              <div className="pt-1">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Notable Games</div>
                {data.topGames.slice(0, 3).map((game, idx) => (
                  <a
                    key={game.id || idx}
                    href={`https://lichess.org/${game.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-1 py-1 rounded hover:bg-white/[0.04] transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className={`truncate ${game.winner === 'white' ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                          {game.white.name} ({game.white.rating})
                        </span>
                        <span className="text-muted-foreground/50 flex-shrink-0">vs</span>
                        <span className={`truncate ${game.winner === 'black' ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                          {game.black.name} ({game.black.rating})
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 flex-shrink-0">{game.year}</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground/30 group-hover:text-muted-foreground/60 flex-shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { getOpeningExplorer, type OpeningExplorerResult, type OpeningExplorerMove } from '@/lib/lichess-api'

interface OpeningExplorerProps {
  fen: string
}

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
        <div
          className="bg-white text-black text-center truncate"
          style={{ width: `${wPct}%` }}
        >
          {wPct >= 10 ? `${wPct.toFixed(1)}%` : ''}
        </div>
      )}
      {dPct > 0 && (
        <div
          className="bg-zinc-500 text-white text-center truncate"
          style={{ width: `${dPct}%` }}
        >
          {dPct >= 10 ? `${dPct.toFixed(1)}%` : ''}
        </div>
      )}
      {bPct > 0 && (
        <div
          className="bg-zinc-900 text-zinc-300 text-center truncate"
          style={{ width: `${bPct}%` }}
        >
          {bPct >= 10 ? `${bPct.toFixed(1)}%` : ''}
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
    <div className="flex w-16 h-2 rounded-sm overflow-hidden bg-zinc-900 flex-shrink-0">
      <div className="bg-white" style={{ width: `${wPct}%` }} />
      <div className="bg-zinc-500" style={{ width: `${dPct}%` }} />
    </div>
  )
}

export function OpeningExplorer({ fen }: OpeningExplorerProps) {
  const [data, setData] = useState<OpeningExplorerResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef(0)

  const fetchData = useCallback(async (fen: string, id: number) => {
    setLoading(true)
    setError(false)
    try {
      const result = await getOpeningExplorer(fen, 'lichess')
      // Only update if this is still the latest request
      if (abortRef.current === id) {
        setData(result)
        setError(result === null)
      }
    } catch {
      if (abortRef.current === id) {
        setData(null)
        setError(true)
      }
    } finally {
      if (abortRef.current === id) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const id = ++abortRef.current
    debounceRef.current = setTimeout(() => {
      fetchData(fen, id)
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [fen, fetchData])

  const totalGames = data ? data.white + data.draws + data.black : 0
  const sortedMoves: OpeningExplorerMove[] = data
    ? [...data.moves].sort((a, b) => (b.white + b.draws + b.black) - (a.white + a.draws + a.black))
    : []

  return (
    <div className="rounded-lg border border-border bg-card text-card-foreground p-3 space-y-3 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Opening Explorer</h3>
        {loading && (
          <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
        )}
      </div>

      {/* Loading state */}
      {loading && !data && (
        <div className="flex items-center justify-center py-6 text-muted-foreground text-xs">
          Loading position data...
        </div>
      )}

      {/* No data state */}
      {!loading && (error || (data && totalGames === 0)) && (
        <div className="text-center py-6 text-muted-foreground text-xs">
          No data for this position
        </div>
      )}

      {/* Results */}
      {data && totalGames > 0 && (
        <>
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
            <div className="text-xs text-muted-foreground text-right">
              {formatNumber(totalGames)} games
            </div>
          </div>

          {/* Move list */}
          {sortedMoves.length > 0 && (
            <div className="space-y-0.5">
              {/* Column headers */}
              <div className="grid grid-cols-[2.5rem_1fr_3rem_4rem] gap-x-2 text-[10px] text-muted-foreground uppercase tracking-wider px-1 pb-1 border-b border-border">
                <span>Move</span>
                <span>Result</span>
                <span className="text-right">Games</span>
                <span className="text-right">Avg</span>
              </div>

              {sortedMoves.map((move) => {
                const moveTotal = move.white + move.draws + move.black
                return (
                  <div
                    key={move.uci}
                    className="grid grid-cols-[2.5rem_1fr_3rem_4rem] gap-x-2 items-center px-1 py-1 rounded hover:bg-muted/50 transition-colors"
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
        </>
      )}
    </div>
  )
}

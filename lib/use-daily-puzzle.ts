'use client'

import { useState, useEffect } from 'react'
import { getDailyPuzzle, lichessPuzzleToAppPuzzle } from './lichess-api'
import type { Puzzle } from './chess-data'

const SESSION_KEY = 'lichess_daily_puzzle'

export function useDailyPuzzle(): { puzzle: Puzzle | null; loading: boolean; error: string | null } {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    // Check sessionStorage first
    try {
      const cached = sessionStorage.getItem(SESSION_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed && parsed.fen && parsed.moves?.length) {
          setPuzzle(parsed)
          setLoading(false)
          return
        }
      }
    } catch { }

    async function fetchPuzzle() {
      try {
        const daily = await getDailyPuzzle()
        if (cancelled) return

        if (!daily || !daily.puzzle.fen || !daily.puzzle.moves.length) {
          setError('No daily puzzle available')
          setLoading(false)
          return
        }

        const appPuzzle: Puzzle = {
          ...lichessPuzzleToAppPuzzle(daily.puzzle),
          title: 'Daily Puzzle',
          description: `Rating: ${daily.puzzle.rating} • From Lichess`,
        }

        setPuzzle(appPuzzle)
        try {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(appPuzzle))
        } catch { }
      } catch {
        if (!cancelled) setError('Failed to fetch daily puzzle')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchPuzzle()
    return () => { cancelled = true }
  }, [])

  return { puzzle, loading, error }
}

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Chess } from 'chess.js'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Chessboard } from '@/components/chess/chessboard'
import { useSettings } from '@/lib/settings-context'

interface GameMeta {
  White?: string
  Black?: string
  Result?: string
  Date?: string
  Event?: string
}

interface MoveEntry {
  san: string
  fen: string
  from: string
  to: string
}

const SAMPLE_GAMES: { name: string; pgn: string }[] = [
  {
    name: 'Immortal Game (1851)',
    pgn: '1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5 8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3 Ng8 15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2 Na6 21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7#',
  },
  {
    name: 'Opera Game (1858)',
    pgn: '1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8#',
  },
  {
    name: "Kasparov's Immortal (1999)",
    pgn: '1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 Nbd7 8. Bh6 Bxh6 9. Qxh6 Bb7 10. a3 e5 11. O-O-O Qe7 12. Kb1 a6 13. Nc1 O-O-O 14. Nb3 exd4 15. Rxd4 c5 16. Rd1 Nb6 17. g3 Kb8 18. Na5 Ba8 19. Bh3 d5 20. Qf4+ Ka7 21. Rhe1 d4 22. Nd5 Nbxd5 23. exd5 Qd6 24. Rxd4 cxd4 25. Re7+ Kb6 26. Qxd4+ Kxa5 27. b4+ Ka4 28. Qc3 Qxd5 29. Ra7 Bb7 30. Rxb7 Qc4 31. Qxf6 Kxa3 32. Qxa6+ Kxb4 33. c3+ Kxc3 34. Qa1+ Kd2 35. Qb2+ Kd1 36. Bf1 Rd2 37. Rd7 Rxd7 38. Bxc4 bxc4 39. Qxh8 Rd3 40. Qa8 c3 41. Qa4+ Ke1 42. f4 f5 43. Kc1 Rd2 44. Qa7',
  },
]

function parseGame(pgn: string): { moves: MoveEntry[]; meta: GameMeta; startFen: string } | null {
  try {
    const game = new Chess()
    game.loadPgn(pgn)
    const headers = game.header()
    const meta: GameMeta = {
      White: headers['White'] ?? undefined,
      Black: headers['Black'] ?? undefined,
      Result: headers['Result'] ?? undefined,
      Date: headers['Date'] ?? undefined,
      Event: headers['Event'] ?? undefined,
    }
    const verboseMoves = game.history({ verbose: true })
    const startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

    const replay = new Chess()
    const moves: MoveEntry[] = verboseMoves.map((m) => {
      replay.move(m.san)
      return { san: m.san, fen: replay.fen(), from: m.from, to: m.to }
    })

    return { moves, meta, startFen }
  } catch {
    return null
  }
}

export function PGNViewer({ onClose }: { onClose: () => void }) {
  const { settings } = useSettings()
  const [pgnText, setPgnText] = useState('')
  const [error, setError] = useState('')
  const [moves, setMoves] = useState<MoveEntry[]>([])
  const [meta, setMeta] = useState<GameMeta>({})
  const [startFen, setStartFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
  const [moveIndex, setMoveIndex] = useState(-1)
  const [loaded, setLoaded] = useState(false)
  const [autoPlaying, setAutoPlaying] = useState(false)
  const [flipped, setFlipped] = useState(false)
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const moveListRef = useRef<HTMLDivElement>(null)

  const currentFen = moveIndex >= 0 && moveIndex < moves.length ? moves[moveIndex].fen : startFen
  const lastMove =
    moveIndex >= 0 && moveIndex < moves.length
      ? { from: moves[moveIndex].from, to: moves[moveIndex].to }
      : undefined

  const loadPgn = useCallback(
    (pgn: string) => {
      const result = parseGame(pgn)
      if (!result || result.moves.length === 0) {
        setError('Invalid PGN. Please check the format and try again.')
        return
      }
      setMoves(result.moves)
      setMeta(result.meta)
      setStartFen(result.startFen)
      setMoveIndex(-1)
      setLoaded(true)
      setError('')
      setAutoPlaying(false)
    },
    []
  )

  const goFirst = useCallback(() => setMoveIndex(-1), [])
  const goBack = useCallback(() => setMoveIndex((i) => Math.max(-1, i - 1)), [])
  const goForward = useCallback(
    () => setMoveIndex((i) => Math.min(moves.length - 1, i + 1)),
    [moves.length]
  )
  const goLast = useCallback(() => setMoveIndex(moves.length - 1), [moves.length])

  const toggleAutoPlay = useCallback(() => {
    setAutoPlaying((prev) => !prev)
  }, [])

  useEffect(() => {
    if (autoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setMoveIndex((i) => {
          if (i >= moves.length - 1) {
            setAutoPlaying(false)
            return i
          }
          return i + 1
        })
      }, 1000)
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current)
    }
  }, [autoPlaying, moves.length])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!loaded) return
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          goBack()
          break
        case 'ArrowRight':
          e.preventDefault()
          goForward()
          break
        case 'Home':
          e.preventDefault()
          goFirst()
          break
        case 'End':
          e.preventDefault()
          goLast()
          break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [loaded, goBack, goForward, goFirst, goLast])

  useEffect(() => {
    if (moveListRef.current) {
      const activeEl = moveListRef.current.querySelector('[data-active="true"]')
      if (activeEl) activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [moveIndex])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card p-6 w-full max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">PGN Viewer</h2>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted/50 transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!loaded ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <textarea
              value={pgnText}
              onChange={(e) => {
                setPgnText(e.target.value)
                setError('')
              }}
              placeholder="Paste PGN here..."
              className="w-full h-40 bg-card border border-border rounded-lg p-3 text-foreground text-sm font-mono resize-none focus:outline-none focus:border-primary/50"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={() => loadPgn(pgnText)}
              disabled={!pgnText.trim()}
              className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Load Game
            </button>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Famous Games:</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_GAMES.map((g) => (
                  <button
                    key={g.name}
                    onClick={() => {
                      setPgnText(g.pgn)
                      loadPgn(g.pgn)
                    }}
                    className="px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-foreground hover:border-primary/50 transition-colors"
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="viewer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {(meta.White || meta.Black || meta.Event) && (
              <div className="bg-card rounded-lg p-3 text-sm space-y-0.5">
                {meta.Event && (
                  <p className="text-muted-foreground text-xs">{meta.Event}{meta.Date ? ` · ${meta.Date}` : ''}</p>
                )}
                {(meta.White || meta.Black) && (
                  <p className="text-foreground font-medium">
                    {meta.White || '?'} vs {meta.Black || '?'}
                    {meta.Result ? ` — ${meta.Result}` : ''}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-shrink-0 rounded-lg overflow-hidden">
                <Chessboard
                  fen={currentFen}
                  flipped={flipped}
                  lastMove={lastMove}
                  interactive={false}
                  size={320}
                  showCoordinates={settings.showCoordinates}
                  boardStyle={settings.boardStyle}
                  pieceStyle={settings.pieceStyle}
                />
              </div>

              <div
                ref={moveListRef}
                className="flex-1 bg-card rounded-lg p-3 max-h-[320px] overflow-y-auto text-sm"
              >
                <div className="flex flex-wrap gap-x-1 gap-y-0.5">
                  {moves.map((m, i) => {
                    const isWhite = i % 2 === 0
                    const moveNum = Math.floor(i / 2) + 1
                    const isActive = i === moveIndex
                    return (
                      <span key={i} className="inline-flex items-center">
                        {isWhite && (
                          <span className="text-muted-foreground mr-0.5">{moveNum}.</span>
                        )}
                        <button
                          data-active={isActive}
                          onClick={() => setMoveIndex(i)}
                          className={`px-1 rounded ${
                            isActive
                              ? 'bg-primary text-primary-foreground font-bold'
                              : 'text-foreground hover:bg-muted/50'
                          }`}
                        >
                          {m.san}
                        </button>
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={goFirst}
                className="p-2 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                title="First move"
              >
                <SkipBack className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={goBack}
                className="p-2 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                title="Previous move"
              >
                <ChevronLeft className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={toggleAutoPlay}
                className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                title={autoPlaying ? 'Pause' : 'Auto-play'}
              >
                {autoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={goForward}
                className="p-2 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                title="Next move"
              >
                <ChevronRight className="w-4 h-4 text-foreground" />
              </button>
              <button
                onClick={goLast}
                className="p-2 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                title="Last move"
              >
                <SkipForward className="w-4 h-4 text-foreground" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setFlipped((f) => !f)}
                className="px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-foreground hover:border-primary/50 transition-colors"
              >
                Flip Board
              </button>
              <button
                onClick={() => {
                  setLoaded(false)
                  setAutoPlaying(false)
                  setMoves([])
                  setMeta({})
                  setMoveIndex(-1)
                }}
                className="px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-foreground hover:border-primary/50 transition-colors"
              >
                Load New Game
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

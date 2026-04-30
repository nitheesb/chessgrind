'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chess } from 'chess.js'
import { Chessboard, MiniChessboard } from '@/components/chess/chessboard'
import { reviewGameAsync, type MoveReview, type GameReviewResult, type MoveClassification } from '@/lib/chess-worker-client'
import { detectOpening } from '@/lib/opening-detection'
import { useSettings } from '@/lib/settings-context'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip as RechartsTooltip,
} from 'recharts'
import {
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Target,
  Brain,
  Sparkles,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react'

// --- Types ---

interface GameReviewProps {
  pgn: string
  playerColor: 'w' | 'b'
  opponent: string
  onClose: () => void
  onPlayFromHere?: (fen: string) => void
  compact?: boolean // mobile layout
}

// --- Classification config ---

const CLASSIFICATION_CONFIG: Record<MoveClassification, { label: string; symbol: string; color: string; bg: string }> = {
  brilliant:   { label: 'Brilliant',   symbol: '!!', color: '#26c9a7', bg: 'bg-teal-500/10' },
  great:       { label: 'Great',       symbol: '!',  color: '#5b9bd5', bg: 'bg-blue-500/10' },
  best:        { label: 'Best',        symbol: '★',  color: '#81b64c', bg: 'bg-green-500/10' },
  excellent:   { label: 'Excellent',   symbol: '',   color: '#81b64c', bg: 'bg-green-500/10' },
  good:        { label: 'Good',        symbol: '',   color: '#97af8b', bg: 'bg-green-500/5' },
  book:        { label: 'Book',        symbol: '📖', color: '#c4a55a', bg: 'bg-amber-500/10' },
  inaccuracy:  { label: 'Inaccuracy',  symbol: '?!', color: '#f7c631', bg: 'bg-yellow-500/10' },
  mistake:     { label: 'Mistake',     symbol: '?',  color: '#e58c2a', bg: 'bg-orange-500/10' },
  blunder:     { label: 'Blunder',     symbol: '??', color: '#ca3431', bg: 'bg-red-500/10' },
  miss:        { label: 'Miss',        symbol: '✗',  color: '#ca3431', bg: 'bg-red-500/10' },
}

function getAccuracyLabel(accuracy: number): string {
  if (accuracy >= 95) return 'Master'
  if (accuracy >= 90) return 'Expert'
  if (accuracy >= 80) return 'Club'
  if (accuracy >= 65) return 'Intermediate'
  return 'Beginner'
}

// --- Game Review Component ---

export function GameReview({
  pgn,
  playerColor,
  opponent,
  onClose,
  onPlayFromHere,
  compact = false,
}: GameReviewProps) {
  const { settings } = useSettings()
  const [review, setReview] = useState<GameReviewResult | null>(null)
  const [progress, setProgress] = useState(0)
  const [currentPly, setCurrentPly] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(true)

  // Parse the game to get positions for each ply
  const { positions, moves } = useMemo(() => {
    const game = new Chess()
    try { game.loadPgn(pgn) } catch { return { positions: [game.fen()], moves: [] } }
    const history = game.history()
    const positionList: string[] = []
    const replayGame = new Chess()
    positionList.push(replayGame.fen())
    for (const move of history) {
      replayGame.move(move)
      positionList.push(replayGame.fen())
    }
    return { positions: positionList, moves: history }
  }, [pgn])

  const opening = useMemo(() => detectOpening(moves), [moves])

  // Run the analysis
  useEffect(() => {
    setIsAnalyzing(true)
    setProgress(0)
    reviewGameAsync(pgn, {
      depth: 16,
      onProgress: setProgress,
    }).then(result => {
      setReview(result)
      setIsAnalyzing(false)
    }).catch(() => {
      setIsAnalyzing(false)
    })
  }, [pgn])

  // Navigation
  const goTo = useCallback((ply: number) => {
    setCurrentPly(Math.max(0, Math.min(ply, positions.length - 1)))
  }, [positions.length])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goTo(currentPly - 1)
      else if (e.key === 'ArrowRight') goTo(currentPly + 1)
      else if (e.key === 'Home') goTo(0)
      else if (e.key === 'End') goTo(positions.length - 1)
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentPly, goTo, positions.length, onClose])

  // Current move review data
  const currentMoveReview = review && currentPly > 0 ? review.moves[currentPly - 1] : null

  // Eval chart data
  const chartData = useMemo(() => {
    if (!review) return []
    return review.moves.map((m, i) => ({
      ply: i + 1,
      eval: Math.max(-6, Math.min(6, m.eval)),
      classification: m.classification,
    }))
  }, [review])

  // Critical moments (top 3 biggest eval swings)
  const criticalMoments = useMemo(() => {
    if (!review) return []
    const swings = review.moves
      .map((m, i) => ({ ...m, index: i, swing: m.cpLoss }))
      .filter(m => m.classification === 'blunder' || m.classification === 'mistake' || m.classification === 'miss')
      .sort((a, b) => b.swing - a.swing)
      .slice(0, 3)
    return swings
  }, [review])

  // Phase breakdown
  const phaseBreakdown = useMemo(() => {
    if (!review) return null
    const totalPieces = (fen: string) => {
      return fen.split(' ')[0].replace(/[/0-9]/g, '').length
    }

    const opening: MoveReview[] = []
    const middlegame: MoveReview[] = []
    const endgame: MoveReview[] = []

    review.moves.forEach((m, i) => {
      const moveNum = Math.floor(i / 2) + 1
      const pieces = totalPieces(m.fen)
      if (moveNum <= 12) opening.push(m)
      else if (pieces < 16) endgame.push(m)
      else middlegame.push(m)
    })

    const calcAccuracy = (moves: MoveReview[]) => {
      if (moves.length === 0) return 100
      const avgCPL = moves.reduce((sum, m) => sum + m.cpLoss, 0) / moves.length
      return Math.min(100, Math.max(0, Math.round(100 * Math.exp(-0.004 * avgCPL))))
    }

    return {
      opening: { accuracy: calcAccuracy(opening.filter((_, i) => (playerColor === 'w' ? i % 2 === 0 : i % 2 === 1))), moves: opening.length },
      middlegame: { accuracy: calcAccuracy(middlegame.filter((_, i) => (playerColor === 'w' ? i % 2 === 0 : i % 2 === 1))), moves: middlegame.length },
      endgame: { accuracy: calcAccuracy(endgame.filter((_, i) => (playerColor === 'w' ? i % 2 === 0 : i % 2 === 1))), moves: endgame.length },
    }
  }, [review, playerColor])

  // Classification counts for the player
  const classificationCounts = useMemo(() => {
    if (!review) return {}
    const counts: Partial<Record<MoveClassification, number>> = {}
    review.moves.forEach((m, i) => {
      const isPlayerMove = playerColor === 'w' ? i % 2 === 0 : i % 2 === 1
      if (!isPlayerMove) return
      counts[m.classification] = (counts[m.classification] || 0) + 1
    })
    return counts
  }, [review, playerColor])

  const playerAccuracy = review ? (playerColor === 'w' ? review.whiteAccuracy : review.blackAccuracy) : 0

  // --- Analyzing state ---
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-8 min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full"
        />
        <div className="text-center">
          <p className="text-lg font-semibold text-foreground">Analyzing your game...</p>
          <p className="text-sm text-muted-foreground mt-1">
            {Math.round(progress * 100)}% — Move {Math.round(progress * moves.length)} of {moves.length}
          </p>
        </div>
        <div className="w-64 h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            style={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    )
  }

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">Analysis failed. Try again.</p>
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-secondary text-foreground">
          Close
        </button>
      </div>
    )
  }

  // --- Desktop Layout ---
  if (!compact) {
    return (
      <div className="flex h-full overflow-hidden">
        {/* Left: Board */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center p-4 bg-black/20 border-r border-white/[0.06]" style={{ width: '45%' }}>
          <Chessboard
            fen={positions[currentPly]}
            size={Math.min(500, typeof window !== 'undefined' ? window.innerHeight - 200 : 500)}
            interactive={false}
            flipped={playerColor === 'b'}
            boardStyle={settings.boardStyle}
            pieceStyle={settings.pieceStyle}
            lastMove={currentMoveReview ? { from: '', to: '' } : undefined}
          />
          {/* Navigation controls */}
          <div className="flex items-center gap-2 mt-4">
            <button onClick={() => goTo(0)} className="px-3 py-1.5 rounded-lg bg-secondary text-foreground text-sm">⏮</button>
            <button onClick={() => goTo(currentPly - 1)} className="px-3 py-1.5 rounded-lg bg-secondary text-foreground"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-sm font-mono text-muted-foreground w-16 text-center">{currentPly} / {moves.length}</span>
            <button onClick={() => goTo(currentPly + 1)} className="px-3 py-1.5 rounded-lg bg-secondary text-foreground"><ChevronRight className="w-4 h-4" /></button>
            <button onClick={() => goTo(positions.length - 1)} className="px-3 py-1.5 rounded-lg bg-secondary text-foreground text-sm">⏭</button>
          </div>
        </div>

        {/* Center: Move list with badges */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-white/[0.06]" style={{ minWidth: 200 }}>
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Moves</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="font-mono text-sm">
              {Array.from({ length: Math.ceil(moves.length / 2) }, (_, i) => {
                const wPly = i * 2
                const bPly = i * 2 + 1
                const wReview = review.moves[wPly]
                const bReview = review.moves[bPly]
                return (
                  <div key={i} className={`flex gap-1 px-3 py-1 ${currentPly === wPly + 1 || currentPly === bPly + 1 ? 'bg-primary/10' : i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                    <span className="text-muted-foreground w-7 text-right shrink-0">{i + 1}.</span>
                    <button
                      onClick={() => goTo(wPly + 1)}
                      className={`flex-1 px-1 rounded text-left hover:bg-white/[0.05] ${currentPly === wPly + 1 ? 'text-primary font-bold' : 'text-foreground'}`}
                    >
                      {moves[wPly]}
                      {wReview && <MoveClassBadge classification={wReview.classification} inline />}
                    </button>
                    {moves[bPly] && (
                      <button
                        onClick={() => goTo(bPly + 1)}
                        className={`flex-1 px-1 rounded text-left hover:bg-white/[0.05] ${currentPly === bPly + 1 ? 'text-primary font-bold' : 'text-foreground/70'}`}
                      >
                        {moves[bPly]}
                        {bReview && <MoveClassBadge classification={bReview.classification} inline />}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Analysis panel */}
        <div className="flex-shrink-0 flex flex-col overflow-y-auto p-4 gap-4" style={{ width: '30%', minWidth: 280 }}>
          {/* Close button */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Game Review</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Accuracy headline */}
          <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 text-center">
            <p className="text-4xl font-bold text-foreground">{playerAccuracy}%</p>
            <p className="text-sm text-muted-foreground mt-1">
              {getAccuracyLabel(playerAccuracy)} accuracy
            </p>
            {opening && (
              <p className="text-xs text-primary mt-2">{opening.eco}: {opening.name}</p>
            )}
          </div>

          {/* Eval Chart */}
          <EvalChart data={chartData} currentPly={currentPly} onClickPly={goTo} />

          {/* Classification counts */}
          <ClassificationSummary counts={classificationCounts} />

          {/* Phase breakdown */}
          {phaseBreakdown && <PhaseBreakdown phases={phaseBreakdown} />}

          {/* Critical Moments */}
          {criticalMoments.length > 0 && (
            <div className="rounded-lg border border-white/[0.06] bg-black/20 p-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Critical Moments</h3>
              <div className="space-y-2">
                {criticalMoments.map((m, idx) => (
                  <button
                    key={idx}
                    onClick={() => goTo(m.ply)}
                    className="w-full text-left p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-foreground">
                        Move {Math.ceil(m.ply / 2)}: {m.move}
                      </span>
                      <MoveClassBadge classification={m.classification} />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Best was {m.bestMove} ({m.cpLoss > 0 ? `-${(m.cpLoss / 100).toFixed(1)}` : '0'} pawns)
                    </p>
                    {onPlayFromHere && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-primary">
                        <Play className="w-3 h-3" /> Play from here
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Current move analysis */}
          {currentMoveReview && (
            <div className="rounded-lg border border-white/[0.06] bg-black/20 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground">Move {Math.ceil(currentMoveReview.ply / 2)}</span>
                <MoveClassBadge classification={currentMoveReview.classification} />
              </div>
              <p className="text-sm font-mono text-foreground">{currentMoveReview.move}</p>
              {currentMoveReview.classification !== 'best' && currentMoveReview.classification !== 'book' && (
                <p className="text-xs text-muted-foreground mt-1">
                  Best: <span className="font-mono text-primary">{currentMoveReview.bestMove}</span>
                  {' '}({currentMoveReview.bestLine.slice(0, 4).join(' ')})
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- Mobile Layout (vertical stepper) ---
  return (
    <div className="flex flex-col gap-3 pb-24">
      {/* Close button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Game Review</h2>
        <button onClick={onClose} className="p-2 rounded-lg bg-secondary text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Accuracy headline */}
      <div className="glass-card p-5 text-center">
        <p className="text-4xl font-bold text-foreground">{playerAccuracy}%</p>
        <p className="text-sm text-muted-foreground mt-1">{getAccuracyLabel(playerAccuracy)} accuracy</p>
        {opening && (
          <p className="text-xs text-primary mt-2">{opening.eco}: {opening.name}</p>
        )}
      </div>

      {/* Board with navigation */}
      <div className="flex flex-col items-center gap-2">
        <Chessboard
          fen={positions[currentPly]}
          size={Math.min(340, typeof window !== 'undefined' ? window.innerWidth - 40 : 340)}
          interactive={false}
          flipped={playerColor === 'b'}
          boardStyle={settings.boardStyle}
          pieceStyle={settings.pieceStyle}
        />
        <div className="flex items-center gap-3">
          <button onClick={() => goTo(0)} className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-xs">⏮</button>
          <button onClick={() => goTo(currentPly - 1)} className="p-1.5 rounded-lg bg-secondary text-foreground"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-xs font-mono text-muted-foreground w-14 text-center">{currentPly}/{moves.length}</span>
          <button onClick={() => goTo(currentPly + 1)} className="p-1.5 rounded-lg bg-secondary text-foreground"><ChevronRight className="w-4 h-4" /></button>
          <button onClick={() => goTo(positions.length - 1)} className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-xs">⏭</button>
        </div>
      </div>

      {/* Current move info */}
      {currentMoveReview && (
        <div className="glass-card p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-foreground">{currentMoveReview.move}</span>
            <MoveClassBadge classification={currentMoveReview.classification} />
          </div>
          {currentMoveReview.classification !== 'best' && currentMoveReview.classification !== 'book' && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Best: <span className="font-mono text-primary">{currentMoveReview.bestMove}</span>
            </p>
          )}
        </div>
      )}

      {/* Eval Chart */}
      <div className="glass-card p-3">
        <EvalChart data={chartData} currentPly={currentPly} onClickPly={goTo} />
      </div>

      {/* Classification counts */}
      <div className="glass-card p-3">
        <ClassificationSummary counts={classificationCounts} />
      </div>

      {/* Phase breakdown */}
      {phaseBreakdown && (
        <div className="glass-card p-3">
          <PhaseBreakdown phases={phaseBreakdown} />
        </div>
      )}

      {/* Critical Moments */}
      {criticalMoments.length > 0 && (
        <div className="glass-card p-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Critical Moments</h3>
          <div className="space-y-2">
            {criticalMoments.map((m, idx) => (
              <button
                key={idx}
                onClick={() => goTo(m.ply)}
                className="w-full text-left p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-foreground">Move {Math.ceil(m.ply / 2)}: {m.move}</span>
                  <MoveClassBadge classification={m.classification} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Best was {m.bestMove}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// --- Sub-components ---

function MoveClassBadge({ classification, inline }: { classification: MoveClassification; inline?: boolean }) {
  const config = CLASSIFICATION_CONFIG[classification]
  if (!config.symbol && !inline) return null
  if (classification === 'excellent' || classification === 'good') return null

  return (
    <span
      className={`${inline ? 'ml-0.5 text-[10px]' : 'px-1.5 py-0.5 rounded text-[10px] font-bold'}`}
      style={{ color: config.color, backgroundColor: inline ? undefined : `${config.color}15` }}
    >
      {config.symbol || config.label}
    </span>
  )
}

function EvalChart({
  data,
  currentPly,
  onClickPly,
}: {
  data: { ply: number; eval: number; classification: MoveClassification }[]
  currentPly: number
  onClickPly: (ply: number) => void
}) {
  if (data.length === 0) return null

  type ChartClickState = {
    activePayload?: Array<{ payload?: { ply?: number } }>
  }

  return (
    <div className="w-full">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Evaluation</h3>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            onClick={(e) => {
              const ply = (e as ChartClickState | undefined)?.activePayload?.[0]?.payload?.ply
              if (typeof ply === 'number') {
                onClickPly(ply)
              }
            }}
          >
            <defs>
              <linearGradient id="evalGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e0e0e0" stopOpacity={0.3} />
                <stop offset="50%" stopColor="#e0e0e0" stopOpacity={0} />
                <stop offset="50%" stopColor="#3a3a3a" stopOpacity={0} />
                <stop offset="100%" stopColor="#3a3a3a" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <XAxis dataKey="ply" hide />
            <YAxis domain={[-6, 6]} hide />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
            {currentPly > 0 && (
              <ReferenceLine x={currentPly} stroke="rgba(245,158,11,0.5)" strokeDasharray="3 3" />
            )}
            <Area
              type="monotone"
              dataKey="eval"
              stroke="rgba(255,255,255,0.3)"
              fill="url(#evalGradient)"
              strokeWidth={1.5}
              dot={(props: any) => {
                const { cx, cy, payload } = props
                const config = CLASSIFICATION_CONFIG[payload.classification as MoveClassification]
                if (payload.classification === 'best' || payload.classification === 'excellent' || payload.classification === 'good' || payload.classification === 'book') {
                  return <circle key={payload.ply} cx={cx} cy={cy} r={0} fill="transparent" />
                }
                return <circle key={payload.ply} cx={cx} cy={cy} r={3} fill={config.color} stroke="none" />
              }}
              activeDot={{ r: 5, fill: '#f59e0b' }}
            />
            <RechartsTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null
                const d = payload[0].payload
                const config = CLASSIFICATION_CONFIG[d.classification as MoveClassification]
                return (
                  <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-xs">
                    <p className="font-mono text-foreground">Move {Math.ceil(d.ply / 2)}</p>
                    <p className="text-muted-foreground">Eval: {d.eval > 0 ? '+' : ''}{d.eval.toFixed(1)}</p>
                    <p style={{ color: config.color }}>{config.label}</p>
                  </div>
                )
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function ClassificationSummary({ counts }: { counts: Partial<Record<MoveClassification, number>> }) {
  const order: MoveClassification[] = ['brilliant', 'great', 'best', 'excellent', 'good', 'book', 'inaccuracy', 'mistake', 'blunder', 'miss']

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Move Quality</h3>
      <div className="grid grid-cols-2 gap-1">
        {order.map(cls => {
          const config = CLASSIFICATION_CONFIG[cls]
          const count = counts[cls] || 0
          if (count === 0 && (cls === 'brilliant' || cls === 'miss')) return null
          return (
            <div key={cls} className="flex items-center justify-between px-2 py-1 rounded" style={{ backgroundColor: count > 0 ? `${config.color}08` : 'transparent' }}>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                <span className="text-[11px] text-foreground">{config.label}</span>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PhaseBreakdown({ phases }: {
  phases: {
    opening: { accuracy: number; moves: number }
    middlegame: { accuracy: number; moves: number }
    endgame: { accuracy: number; moves: number }
  }
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Phase Accuracy</h3>
      <div className="grid grid-cols-3 gap-2">
        {(['opening', 'middlegame', 'endgame'] as const).map(phase => {
          const data = phases[phase]
          if (data.moves === 0) return (
            <div key={phase} className="text-center p-2 rounded-lg bg-white/[0.02]">
              <p className="text-[10px] text-muted-foreground capitalize">{phase}</p>
              <p className="text-xs text-muted-foreground">—</p>
            </div>
          )
          return (
            <div key={phase} className="text-center p-2 rounded-lg bg-white/[0.03]">
              <p className="text-[10px] text-muted-foreground capitalize">{phase}</p>
              <p className="text-lg font-bold text-foreground">{data.accuracy}%</p>
              <p className="text-[10px] text-muted-foreground">{data.moves} moves</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

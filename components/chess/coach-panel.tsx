'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chess } from 'chess.js'
import {
  analyzePositionAsync,
  analyzeMultiPVAsync,
  stopAnalysis,
  type StockfishInfoEvent,
  type MultiPVAnalysis,
} from '@/lib/chess-worker-client'
import { detectOpening } from '@/lib/opening-detection'
import type { CoachMode } from '@/lib/settings-context'
import {
  Lightbulb,
  Brain,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
  BookOpen,
  Eye,
  EyeOff,
  Target,
} from 'lucide-react'

// --- Types ---

interface CoachPanelProps {
  fen: string
  moveHistory: string[]
  isPlayerTurn: boolean
  isThinking: boolean // AI is computing
  gameOver: boolean
  coachMode: CoachMode
  onCoachModeChange: (mode: CoachMode) => void
  blunderCheck: boolean
  compact?: boolean // mobile layout
  /** Called when coach wants to show arrows on the board */
  onArrows?: (arrows: CoachArrow[]) => void
  /** Called when coach detects a threat */
  onThreat?: (threat: ThreatInfo | null) => void
}

export interface CoachArrow {
  from: string
  to: string
  color: string
  opacity?: number
}

export interface ThreatInfo {
  piece: string
  square: string
  message: string
}

export interface MissedTactic {
  evalSwing: number
  bestMove: string
  bestLine: string[]
  message: string
}

interface SearchStats {
  depth: number
  nodes?: number
  nps?: number
  seldepth?: number
}

// --- Coach Panel Component ---

export function CoachPanel({
  fen,
  moveHistory,
  isPlayerTurn,
  isThinking,
  gameOver,
  coachMode,
  onCoachModeChange,
  blunderCheck,
  compact = false,
  onArrows,
  onThreat,
}: CoachPanelProps) {
  const [multiPV, setMultiPV] = useState<MultiPVAnalysis | null>(null)
  const [searchStats, setSearchStats] = useState<SearchStats | null>(null)
  const [threat, setThreat] = useState<ThreatInfo | null>(null)
  const [missedTactic, setMissedTactic] = useState<MissedTactic | null>(null)
  const [showMissedTactic, setShowMissedTactic] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [showBestMoveArrows, setShowBestMoveArrows] = useState(true)
  const prevFenRef = useRef(fen)
  const prevEvalRef = useRef(0)
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showHint, setShowHint] = useState(false)
  const analysisAbortRef = useRef(false)

  // Opening detection
  const currentOpening = useMemo(() => detectOpening(moveHistory), [moveHistory])
  const isInBook = currentOpening !== null && moveHistory.length <= 24

  // --- Hint timer (8s thinking time) ---
  useEffect(() => {
    if (coachMode !== 'hints' || !isPlayerTurn || gameOver) {
      setShowHint(false)
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
      return
    }
    setShowHint(false)
    hintTimerRef.current = setTimeout(() => setShowHint(true), 8000)
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    }
  }, [coachMode, isPlayerTurn, gameOver, fen])

  // --- Multi-PV analysis (Full Coach mode) ---
  useEffect(() => {
    if (coachMode !== 'full' || gameOver || moveHistory.length === 0) {
      setMultiPV(null)
      setSearchStats(null)
      return
    }

    analysisAbortRef.current = false
    const currentFen = fen

    const onInfoEvent = (info: StockfishInfoEvent) => {
      if (analysisAbortRef.current) return
      setSearchStats({
        depth: info.depth,
        nodes: info.nodes,
        nps: info.nps,
        seldepth: info.seldepth,
      })
    }

    analyzeMultiPVAsync(currentFen, 18, 3, undefined, onInfoEvent).then(result => {
      if (analysisAbortRef.current) return
      setMultiPV(result)

      // Generate arrows for best move(s)
      if (showBestMoveArrows && onArrows && result.lines.length > 0) {
        const arrows: CoachArrow[] = []
        result.lines.forEach((line, idx) => {
          if (line.bestLine.length > 0) {
            // Parse first move to get from/to
            const firstMove = line.bestLine[0]
            const arrowData = sanToSquares(currentFen, firstMove)
            if (arrowData) {
              arrows.push({
                from: arrowData.from,
                to: arrowData.to,
                color: idx === 0 ? '#81b64c' : idx === 1 ? '#5d8c34' : '#3d6620',
                opacity: idx === 0 ? 0.8 : idx === 1 ? 0.5 : 0.3,
              })
            }
          }
        })
        onArrows(arrows)
      }
    })

    return () => {
      analysisAbortRef.current = true
      stopAnalysis()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, coachMode, gameOver, moveHistory.length])

  // --- Threat detection (before player moves) ---
  useEffect(() => {
    if (coachMode === 'off' || !isPlayerTurn || gameOver || moveHistory.length === 0) {
      setThreat(null)
      onThreat?.(null)
      return
    }

    // Run a quick 1-ply analysis from opponent's perspective
    const game = new Chess(fen)
    const moves = game.moves({ verbose: true })
    if (moves.length === 0) return

    // Simulate each opponent reply at depth 1 to find threats
    let worstThreat: ThreatInfo | null = null
    let worstValue = 0

    // Check opponent's best move by analyzing current position
    analyzePositionAsync(fen, 8, true).then(result => {
      if (result.bestLine.length > 0) {
        const bestReply = result.bestLine[0]
        const replyData = sanToSquares(fen, bestReply)
        if (replyData) {
          const tempGame = new Chess(fen)
          try {
            const move = tempGame.move(bestReply)
            if (move && move.captured) {
              const capturedValue = pieceValue(move.captured)
              if (capturedValue >= 2) {
                worstThreat = {
                  piece: move.captured,
                  square: move.to,
                  message: `Your ${pieceName(move.captured)} on ${move.to} is hanging`,
                }
                worstValue = capturedValue
              }
            }
            // Check for mate threat
            if (tempGame.isCheckmate()) {
              worstThreat = {
                piece: 'k',
                square: '',
                message: 'Mate threat detected!',
              }
            }
          } catch {}
        }
      }

      setThreat(worstThreat)
      onThreat?.(worstThreat)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fen, isPlayerTurn, coachMode, gameOver])

  // --- Tactic sniffer (after player's move) ---
  useEffect(() => {
    if (coachMode === 'off' || gameOver || moveHistory.length < 2) return
    if (isPlayerTurn) return // Only check after player has moved

    const currentEval = multiPV?.lines[0]?.eval ?? 0
    const prevEval = prevEvalRef.current
    const evalSwing = Math.abs(currentEval - prevEval)

    // If there was a big swing (>1.5 pawns) that wasn't in the player's favor
    if (evalSwing >= 1.5 && currentEval < prevEval - 1.0) {
      // Player missed a tactic
      analyzePositionAsync(prevFenRef.current, 14, true).then(result => {
        if (result.bestLine.length > 0) {
          setMissedTactic({
            evalSwing,
            bestMove: result.bestLine[0],
            bestLine: result.bestLine.slice(0, 5),
            message: `There was a tactic — you could have played ${result.bestLine[0]}`,
          })
        }
      })
    } else {
      setMissedTactic(null)
      setShowMissedTactic(false)
    }

    // Track previous state
    prevEvalRef.current = currentEval
    prevFenRef.current = fen
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayerTurn, moveHistory.length])

  // Update eval tracking when multiPV updates
  useEffect(() => {
    if (multiPV?.lines[0]) {
      prevEvalRef.current = multiPV.lines[0].eval
    }
  }, [multiPV])

  // --- Hint arrow (Hints mode) ---
  useEffect(() => {
    if (coachMode !== 'hints' || !showHint || !isPlayerTurn || gameOver) {
      if (coachMode === 'hints') onArrows?.([])
      return
    }

    analyzePositionAsync(fen, 10, true).then(result => {
      if (result.bestLine.length > 0) {
        const move = sanToSquares(fen, result.bestLine[0])
        if (move && onArrows) {
          onArrows([{ from: move.from, to: move.to, color: '#fbbf24', opacity: 0.6 }])
        }
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showHint, fen, coachMode, isPlayerTurn, gameOver])

  if (coachMode === 'off') return null

  return (
    <div className={`flex flex-col gap-2 ${compact ? '' : ''}`}>
      {/* Coach Mode Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2"
        >
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">AI Coach</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
        </button>
        <div className="flex items-center gap-1">
          {(['off', 'hints', 'full'] as CoachMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => onCoachModeChange(mode)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                coachMode === mode
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {mode === 'off' ? 'Off' : mode === 'hints' ? 'Hints' : 'Full'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Hint mode: pulsing lightbulb */}
            {coachMode === 'hints' && isPlayerTurn && !gameOver && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/10">
                {showHint ? (
                  <>
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                    </motion.div>
                    <span className="text-xs text-amber-300">Hint available — check the board</span>
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Thinking... hint in a moment</span>
                  </>
                )}
              </div>
            )}

            {/* Threat warning */}
            {threat && isPlayerTurn && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/15"
              >
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-300">{threat.message}</span>
              </motion.div>
            )}

            {/* Opening awareness */}
            {isInBook && coachMode === 'full' && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <BookOpen className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[11px] text-primary font-medium">{currentOpening?.eco}: {currentOpening?.name}</span>
                  {multiPV?.lines[0]?.bestLine && multiPV.lines[0].bestLine.length > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Main line continues: {multiPV.lines[0].bestLine.slice(0, 3).join(' ')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Out of book warning */}
            {!isInBook && moveHistory.length > 0 && moveHistory.length <= 24 && coachMode === 'full' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/5 border border-orange-500/10">
                <Target className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[11px] text-orange-300">Out of book — sharp territory</span>
              </div>
            )}

            {/* Full Coach: Multi-PV lines */}
            {coachMode === 'full' && multiPV && multiPV.lines.length > 0 && (
              <div className="rounded-lg border border-white/[0.06] bg-black/20 overflow-hidden">
                {/* Header with search stats */}
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Analysis
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                    {searchStats && (
                      <>
                        <span>d{searchStats.depth}{searchStats.seldepth ? `/${searchStats.seldepth}` : ''}</span>
                        {searchStats.nps && <span>{formatNPS(searchStats.nps)}</span>}
                        {searchStats.nodes && <span>{formatNodes(searchStats.nodes)}</span>}
                      </>
                    )}
                    <button
                      onClick={() => {
                        setShowBestMoveArrows(!showBestMoveArrows)
                        if (showBestMoveArrows) onArrows?.([])
                      }}
                      className={`p-0.5 rounded ${showBestMoveArrows ? 'text-primary' : 'text-muted-foreground'}`}
                      title={showBestMoveArrows ? 'Hide arrows' : 'Show arrows'}
                    >
                      {showBestMoveArrows ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* PV Lines */}
                <div className="divide-y divide-white/[0.04]">
                  {multiPV.lines.map((line, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-1.5 flex items-start gap-2 ${idx === 0 ? 'bg-white/[0.02]' : ''}`}
                    >
                      <span className={`text-sm font-bold font-mono w-12 flex-shrink-0 text-right ${
                        line.isMate ? 'text-red-400' :
                        line.eval > 0.5 ? 'text-white' :
                        line.eval < -0.5 ? 'text-zinc-500' : 'text-muted-foreground'
                      }`}>
                        {line.isMate
                          ? `M${line.mateIn ?? '?'}`
                          : `${line.eval > 0 ? '+' : ''}${line.eval.toFixed(1)}`}
                      </span>
                      <p className="text-xs font-mono text-foreground/80 leading-relaxed">
                        {line.bestLine.slice(0, compact ? 4 : 6).join(' ')}
                        {line.bestLine.length > (compact ? 4 : 6) && <span className="text-muted-foreground"> ...</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Thinking visualization (when AI is computing) */}
            {isThinking && coachMode === 'full' && searchStats && (
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full flex-shrink-0"
                />
                <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
                  <span>Depth {searchStats.depth}</span>
                  {searchStats.nps && <span>{formatNPS(searchStats.nps)} n/s</span>}
                </div>
              </div>
            )}

            {/* Missed tactic toast */}
            <AnimatePresence>
              {missedTactic && !showMissedTactic && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={() => setShowMissedTactic(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/5 border border-amber-500/15 text-left hover:bg-amber-500/10 transition-colors"
                >
                  <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-xs text-amber-300">There was a tactic — show me</span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Missed tactic detail card */}
            <AnimatePresence>
              {showMissedTactic && missedTactic && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-lg border border-amber-500/15 bg-amber-500/5 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-amber-300">What you missed</span>
                      <button
                        onClick={() => {
                          setShowMissedTactic(false)
                          setMissedTactic(null)
                        }}
                        className="text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        Dismiss
                      </button>
                    </div>
                    <p className="text-xs text-foreground/80 mb-1">
                      Best move: <span className="font-mono font-bold text-amber-300">{missedTactic.bestMove}</span>
                    </p>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      {missedTactic.bestLine.join(' ')}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1.5">
                      Eval swing: {missedTactic.evalSwing.toFixed(1)} pawns
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// --- Blunder Check Component ---

interface BlunderCheckProps {
  show: boolean
  message: string
  onPlayAnyway: () => void
  onTakeBack: () => void
}

export function BlunderCheckNudge({ show, message, onPlayAnyway, onTakeBack }: BlunderCheckProps) {
  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
    >
      <div className="rounded-xl border border-red-500/20 bg-[#1a1a1a]/95 backdrop-blur-sm p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{message}</p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={onPlayAnyway}
                className="flex-1 py-2 rounded-lg bg-secondary text-sm font-medium text-foreground hover:bg-secondary/80 transition-colors"
              >
                Play anyway
              </button>
              <button
                onClick={onTakeBack}
                className="flex-1 py-2 rounded-lg bg-primary/10 text-sm font-medium text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                Take back
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// --- Helpers ---

function sanToSquares(fen: string, san: string): { from: string; to: string } | null {
  try {
    const game = new Chess(fen)
    const move = game.move(san)
    if (move) return { from: move.from, to: move.to }
    return null
  } catch {
    return null
  }
}

function pieceValue(piece: string): number {
  const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }
  return values[piece.toLowerCase()] ?? 0
}

function pieceName(piece: string): string {
  const names: Record<string, string> = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' }
  return names[piece.toLowerCase()] ?? piece
}

function formatNPS(nps: number): string {
  if (nps >= 1_000_000) return `${(nps / 1_000_000).toFixed(1)}M`
  if (nps >= 1_000) return `${(nps / 1_000).toFixed(0)}k`
  return String(nps)
}

function formatNodes(nodes: number): string {
  if (nodes >= 1_000_000) return `${(nodes / 1_000_000).toFixed(1)}Mn`
  if (nodes >= 1_000) return `${(nodes / 1_000).toFixed(0)}kn`
  return `${nodes}n`
}

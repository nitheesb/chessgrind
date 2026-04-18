'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Chess } from 'chess.js'
import { Chessboard, CapturedPieces } from '@/components/chess/chessboard'
import { EvalBar } from '@/components/chess/eval-bar'
import {
  analyzePositionAsync,
  analyzeMultiPVAsync,
  stopAnalysis,
  type StockfishInfoEvent,
  type MultiPVAnalysis,
} from '@/lib/chess-worker-client'
import { detectOpening } from '@/lib/opening-detection'
import { OpeningExplorer } from '@/components/chess/opening-explorer'
import { useSettings } from '@/lib/settings-context'
import { useMobileBoardSize } from '@/lib/use-mobile-board-size'
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Copy,
  FlipVertical,
  Zap,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Download,
  Upload,
  Eye,
  EyeOff,
} from 'lucide-react'

interface AnalysisPageProps {
  onBack: () => void
  initialFen?: string
  initialPgn?: string
}

export function AnalysisPage({ onBack, initialFen, initialPgn }: AnalysisPageProps) {
  const { settings } = useSettings()
  const boardSize = useMobileBoardSize(520)
  const [game, setGame] = useState(() => {
    if (initialPgn) {
      const g = new Chess()
      try { g.loadPgn(initialPgn) } catch {}
      return g
    }
    if (initialFen) return new Chess(initialFen)
    return new Chess()
  })
  const [flipped, setFlipped] = useState(false)
  const [moveHistory, setMoveHistory] = useState<string[]>(() => {
    if (initialPgn) {
      const g = new Chess()
      try { g.loadPgn(initialPgn); return g.history() } catch {}
    }
    return []
  })
  const [currentPly, setCurrentPly] = useState(moveHistory.length)
  const [positions, setPositions] = useState<string[]>(() => {
    const g = new Chess()
    const pos = [g.fen()]
    if (initialPgn) {
      try {
        g.loadPgn(initialPgn)
        const replay = new Chess()
        for (const m of g.history()) { replay.move(m); pos.push(replay.fen()) }
      } catch {}
    }
    return pos
  })

  // Engine state
  const [engineOn, setEngineOn] = useState(true)
  const [engineDepth, setEngineDepth] = useState(20)
  const [multiPVCount, setMultiPVCount] = useState(3)
  const [multiPV, setMultiPV] = useState<MultiPVAnalysis | null>(null)
  const [searchStats, setSearchStats] = useState<{ depth: number; nodes?: number; nps?: number; seldepth?: number } | null>(null)
  const [copiedFEN, setCopiedFEN] = useState(false)
  const [copiedPGN, setCopiedPGN] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const analysisAbortRef = useRef(false)

  const currentFen = positions[currentPly] || game.fen()
  const opening = useMemo(() => detectOpening(moveHistory.slice(0, currentPly)), [moveHistory, currentPly])

  // Run engine analysis when position changes
  useEffect(() => {
    if (!engineOn) {
      setMultiPV(null)
      setSearchStats(null)
      return
    }

    analysisAbortRef.current = false
    const fen = currentFen

    const onInfoEvent = (info: StockfishInfoEvent) => {
      if (analysisAbortRef.current) return
      setSearchStats({
        depth: info.depth,
        nodes: info.nodes,
        nps: info.nps,
        seldepth: info.seldepth,
      })
    }

    analyzeMultiPVAsync(fen, engineDepth, multiPVCount, undefined, onInfoEvent).then(result => {
      if (!analysisAbortRef.current) setMultiPV(result)
    })

    return () => {
      analysisAbortRef.current = true
      stopAnalysis()
    }
  }, [currentFen, engineOn, engineDepth, multiPVCount])

  // Handle move (free movement — both sides playable)
  const handleMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    const fen = positions[currentPly] || game.fen()
    const g = new Chess(fen)
    try {
      const move = g.move({ from, to, promotion: promotion || 'q' })
      if (!move) return false

      // If we're not at the end of the line, create a branch
      const newHistory = [...moveHistory.slice(0, currentPly), move.san]
      const newPositions = [...positions.slice(0, currentPly + 1), g.fen()]

      setGame(g)
      setMoveHistory(newHistory)
      setPositions(newPositions)
      setCurrentPly(currentPly + 1)
      return true
    } catch {
      return false
    }
  }, [game, currentPly, moveHistory, positions])

  // Navigation
  const goTo = useCallback((ply: number) => {
    const p = Math.max(0, Math.min(ply, positions.length - 1))
    setCurrentPly(p)
    setGame(new Chess(positions[p]))
  }, [positions])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      switch (e.key) {
        case 'ArrowLeft': goTo(currentPly - 1); break
        case 'ArrowRight': goTo(currentPly + 1); break
        case 'f': case 'F': setFlipped(f => !f); break
        case 'e': case 'E': setEngineOn(on => !on); break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentPly, goTo])

  const handleImport = useCallback(() => {
    const text = importText.trim()
    if (!text) return

    // Try as FEN first
    try {
      const g = new Chess(text)
      setGame(g)
      setMoveHistory([])
      setPositions([g.fen()])
      setCurrentPly(0)
      setShowImport(false)
      setImportText('')
      return
    } catch {}

    // Try as PGN
    try {
      const g = new Chess()
      g.loadPgn(text)
      const history = g.history()
      const replay = new Chess()
      const pos = [replay.fen()]
      for (const m of history) { replay.move(m); pos.push(replay.fen()) }
      setGame(new Chess(pos[pos.length - 1]))
      setMoveHistory(history)
      setPositions(pos)
      setCurrentPly(pos.length - 1)
      setShowImport(false)
      setImportText('')
    } catch {}
  }, [importText])

  const generatePGN = useCallback(() => {
    const movePairs = Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => {
      const w = moveHistory[i * 2] || ''
      const b = moveHistory[i * 2 + 1] ? ' ' + moveHistory[i * 2 + 1] : ''
      return `${i + 1}. ${w}${b}`
    })
    return movePairs.join(' ')
  }, [moveHistory])

  const resetBoard = useCallback(() => {
    const g = new Chess()
    setGame(g)
    setMoveHistory([])
    setPositions([g.fen()])
    setCurrentPly(0)
  }, [])

  const handleExplorerMove = useCallback((uci: string, san: string) => {
    const fen = positions[currentPly] || game.fen()
    const g = new Chess(fen)
    try {
      const from = uci.slice(0, 2)
      const to = uci.slice(2, 4)
      const promotion = uci.length > 4 ? uci[4] : undefined
      const move = g.move({ from, to, promotion })
      if (!move) return
      const newHistory = [...moveHistory.slice(0, currentPly), move.san]
      const newPositions = [...positions.slice(0, currentPly + 1), g.fen()]
      setGame(g); setMoveHistory(newHistory); setPositions(newPositions); setCurrentPly(currentPly + 1)
    } catch {}
  }, [game, currentPly, moveHistory, positions])

  const formatNPS = (nps: number) => nps >= 1e6 ? `${(nps / 1e6).toFixed(1)}M` : nps >= 1e3 ? `${(nps / 1e3).toFixed(0)}k` : String(nps)

  return (
    <div className="flex flex-col gap-3 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Analysis Board</h1>
          <p className="text-xs text-muted-foreground">Free analysis with Stockfish 18</p>
        </div>
      </div>

      {/* Opening */}
      {opening && (
        <div className="flex items-center gap-2 px-2">
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs text-primary font-medium">{opening.eco}: {opening.name}</span>
        </div>
      )}

      {/* Board + Eval */}
      <div className="flex justify-center">
        <div className="flex items-stretch gap-2">
          <EvalBar game={new Chess(currentFen)} size={boardSize} thickness={20} vertical />
          <Chessboard
            fen={currentFen}
            size={boardSize}
            interactive
            flipped={flipped}
            onMove={handleMove}
            showCoordinates
            isCheck={new Chess(currentFen).isCheck()}
            boardStyle={settings.boardStyle}
            pieceStyle={settings.pieceStyle}
          />
        </div>
      </div>

      {/* Board tools */}
      <div className="flex items-center justify-center gap-2">
        <button onClick={() => setFlipped(!flipped)} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground" title="Flip board (F)">
          <FlipVertical className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => { navigator.clipboard.writeText(currentFen); setCopiedFEN(true); setTimeout(() => setCopiedFEN(false), 1500) }}
          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground" title="Copy FEN">
          {copiedFEN ? <span className="text-xs text-primary">✓</span> : <Copy className="w-3.5 h-3.5" />}
        </button>
        <button onClick={() => { navigator.clipboard.writeText(generatePGN()); setCopiedPGN(true); setTimeout(() => setCopiedPGN(false), 1500) }}
          className="px-2 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground text-xs" title="Copy PGN">
          {copiedPGN ? '✓' : 'PGN'}
        </button>
        <button onClick={() => setShowImport(!showImport)}
          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground" title="Import FEN/PGN">
          <Upload className="w-3.5 h-3.5" />
        </button>
        <button onClick={resetBoard}
          className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground" title="Reset">
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Import dialog */}
      {showImport && (
        <div className="glass-card p-3">
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste FEN or PGN here..."
            className="w-full h-20 bg-black/40 border border-white/10 rounded-lg p-2 text-xs font-mono text-foreground resize-none"
          />
          <div className="flex gap-2 mt-2">
            <button onClick={handleImport} className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium">Load</button>
            <button onClick={() => { setShowImport(false); setImportText('') }} className="flex-1 py-1.5 rounded-lg bg-secondary text-foreground text-xs">Cancel</button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-center gap-2">
        <button onClick={() => goTo(0)} className="px-2 py-1 rounded-lg bg-secondary text-foreground text-xs">⏮</button>
        <button onClick={() => goTo(currentPly - 1)} className="p-1.5 rounded-lg bg-secondary text-foreground"><ChevronLeft className="w-4 h-4" /></button>
        <span className="text-xs font-mono text-muted-foreground w-14 text-center">{currentPly}/{positions.length - 1}</span>
        <button onClick={() => goTo(currentPly + 1)} className="p-1.5 rounded-lg bg-secondary text-foreground"><ChevronRight className="w-4 h-4" /></button>
        <button onClick={() => goTo(positions.length - 1)} className="px-2 py-1 rounded-lg bg-secondary text-foreground text-xs">⏭</button>
      </div>

      {/* Engine Panel */}
      <div className="glass-card p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">Stockfish 18</span>
          </div>
          <div className="flex items-center gap-2">
            {searchStats && (
              <span className="text-[10px] font-mono text-muted-foreground">
                d{searchStats.depth}{searchStats.seldepth ? `/${searchStats.seldepth}` : ''} {searchStats.nps ? formatNPS(searchStats.nps) + ' n/s' : ''}
              </span>
            )}
            <button
              onClick={() => setEngineOn(!engineOn)}
              className={`p-1 rounded ${engineOn ? 'text-primary' : 'text-muted-foreground'}`}
              title="Toggle engine (E)"
            >
              {engineOn ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Depth + MultiPV controls */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">Depth</span>
            <select
              value={engineDepth}
              onChange={(e) => setEngineDepth(Number(e.target.value))}
              className="bg-secondary text-foreground text-xs rounded px-1.5 py-0.5 border border-white/10"
            >
              {[10, 14, 16, 18, 20, 22].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-muted-foreground">Lines</span>
            <select
              value={multiPVCount}
              onChange={(e) => setMultiPVCount(Number(e.target.value))}
              className="bg-secondary text-foreground text-xs rounded px-1.5 py-0.5 border border-white/10"
            >
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* PV Lines */}
        {multiPV && multiPV.lines.length > 0 ? (
          <div className="space-y-1">
            {multiPV.lines.map((line, idx) => (
              <div key={idx} className={`flex items-start gap-2 px-2 py-1 rounded ${idx === 0 ? 'bg-white/[0.03]' : ''}`}>
                <span className={`text-sm font-bold font-mono w-12 flex-shrink-0 text-right ${
                  line.isMate ? 'text-red-400' : line.eval > 0.5 ? 'text-white' : line.eval < -0.5 ? 'text-zinc-500' : 'text-muted-foreground'
                }`}>
                  {line.isMate ? `M${line.mateIn ?? '?'}` : `${line.eval > 0 ? '+' : ''}${line.eval.toFixed(1)}`}
                </span>
                <p className="text-xs font-mono text-foreground/80 leading-relaxed">
                  {line.bestLine.slice(0, 8).join(' ')}
                </p>
              </div>
            ))}
          </div>
        ) : engineOn ? (
          <p className="text-xs text-muted-foreground italic">Analyzing...</p>
        ) : (
          <p className="text-xs text-muted-foreground italic">Engine paused</p>
        )}
      </div>

      {/* Move list */}
      {moveHistory.length > 0 && (
        <div className="glass-card p-3">
          <p className="text-xs text-muted-foreground font-medium mb-1">Moves</p>
          <div className="flex flex-wrap gap-x-1 gap-y-0.5">
            {moveHistory.map((move, idx) => (
              <span key={idx} className="inline-flex items-center gap-0.5">
                {idx % 2 === 0 && <span className="text-[10px] text-muted-foreground">{Math.floor(idx / 2) + 1}.</span>}
                <button
                  onClick={() => goTo(idx + 1)}
                  className={`text-xs font-mono px-0.5 rounded hover:bg-white/[0.05] ${currentPly === idx + 1 ? 'text-primary font-bold bg-primary/10' : 'text-foreground'}`}
                >
                  {move}
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Opening Explorer */}
      <OpeningExplorer fen={currentFen} onMoveClick={handleExplorerMove} compact />
    </div>
  )
}

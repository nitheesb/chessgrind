'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Chess } from 'chess.js'
import { Chessboard, CapturedPieces } from '@/components/chess/chessboard'
import { EvalBar } from '@/components/chess/eval-bar'
import {
  analyzeMultiPVAsync,
  stopAnalysis,
  type StockfishInfoEvent,
  type MultiPVAnalysis,
} from '@/lib/chess-worker-client'
import { detectOpening } from '@/lib/opening-detection'
import { OpeningExplorer } from '@/components/chess/opening-explorer'
import { useSettings } from '@/lib/settings-context'
import {
  Play,
  Pause,
  RotateCcw,
  Copy,
  FlipVertical,
  Zap,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Upload,
  Download,
} from 'lucide-react'

interface DesktopAnalysisProps {
  onNavigate: (page: string) => void
  initialFen?: string
  initialPgn?: string
}

export function DesktopAnalysis({ onNavigate, initialFen, initialPgn }: DesktopAnalysisProps) {
  const { settings } = useSettings()
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
  const [currentPly, setCurrentPly] = useState(() => {
    if (initialPgn) {
      const g = new Chess()
      try { g.loadPgn(initialPgn); return g.history().length } catch {}
    }
    return 0
  })
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

  // Board size from layout manager
  const [boardSize, setBoardSize] = useState(700)
  useEffect(() => {
    const update = () => {
      const val = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--lm-board-size'), 10)
      if (val > 0) setBoardSize(val)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(document.documentElement)
    return () => ro.disconnect()
  }, [])

  // Engine state
  const [engineOn, setEngineOn] = useState(true)
  const [engineDepth, setEngineDepth] = useState(20)
  const [multiPVCount, setMultiPVCount] = useState(3)
  const [multiPV, setMultiPV] = useState<MultiPVAnalysis | null>(null)
  const [searchStats, setSearchStats] = useState<{ depth: number; nodes?: number; nps?: number; seldepth?: number } | null>(null)
  const [copiedFEN, setCopiedFEN] = useState(false)
  const [copiedPGN, setCopiedPGN] = useState(false)
  const [showExplorer, setShowExplorer] = useState(true)
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const analysisAbortRef = useRef(false)
  const notationRef = useRef<HTMLDivElement>(null)

  const currentFen = positions[currentPly] || game.fen()
  const opening = useMemo(() => detectOpening(moveHistory.slice(0, currentPly)), [moveHistory, currentPly])

  // Run engine
  useEffect(() => {
    if (!engineOn) { setMultiPV(null); setSearchStats(null); return }
    analysisAbortRef.current = false
    const fen = currentFen
    const onInfo = (info: StockfishInfoEvent) => {
      if (analysisAbortRef.current) return
      setSearchStats({ depth: info.depth, nodes: info.nodes, nps: info.nps, seldepth: info.seldepth })
    }
    analyzeMultiPVAsync(fen, engineDepth, multiPVCount, undefined, onInfo).then(r => {
      if (!analysisAbortRef.current) setMultiPV(r)
    })
    return () => { analysisAbortRef.current = true; stopAnalysis() }
  }, [currentFen, engineOn, engineDepth, multiPVCount])

  const handleMove = useCallback((from: string, to: string, promotion?: string): boolean => {
    const fen = positions[currentPly] || game.fen()
    const g = new Chess(fen)
    try {
      const move = g.move({ from, to, promotion: promotion || 'q' })
      if (!move) return false
      const newHistory = [...moveHistory.slice(0, currentPly), move.san]
      const newPositions = [...positions.slice(0, currentPly + 1), g.fen()]
      setGame(g)
      setMoveHistory(newHistory)
      setPositions(newPositions)
      setCurrentPly(currentPly + 1)
      return true
    } catch { return false }
  }, [game, currentPly, moveHistory, positions])

  const goTo = useCallback((ply: number) => {
    const p = Math.max(0, Math.min(ply, positions.length - 1))
    setCurrentPly(p)
    setGame(new Chess(positions[p]))
  }, [positions])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      switch (e.key) {
        case 'ArrowLeft': goTo(currentPly - 1); break
        case 'ArrowRight': goTo(currentPly + 1); break
        case 'f': case 'F': setFlipped(f => !f); break
        case 'e': case 'E': setEngineOn(on => !on); break
        case ' ': e.preventDefault(); break // prevent page scroll
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentPly, goTo])

  const handleImport = useCallback(() => {
    const text = importText.trim()
    if (!text) return
    try { const g = new Chess(text); setGame(g); setMoveHistory([]); setPositions([g.fen()]); setCurrentPly(0); setShowImport(false); setImportText(''); return } catch {}
    try {
      const g = new Chess(); g.loadPgn(text)
      const h = g.history(); const replay = new Chess(); const pos = [replay.fen()]
      for (const m of h) { replay.move(m); pos.push(replay.fen()) }
      setGame(new Chess(pos[pos.length - 1])); setMoveHistory(h); setPositions(pos); setCurrentPly(pos.length - 1); setShowImport(false); setImportText('')
    } catch {}
  }, [importText])

  const generatePGN = useCallback(() => {
    return Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => {
      const w = moveHistory[i * 2] || ''
      const b = moveHistory[i * 2 + 1] ? ' ' + moveHistory[i * 2 + 1] : ''
      return `${i + 1}. ${w}${b}`
    }).join(' ')
  }, [moveHistory])

  const resetBoard = useCallback(() => {
    const g = new Chess()
    setGame(g); setMoveHistory([]); setPositions([g.fen()]); setCurrentPly(0)
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

  useEffect(() => {
    if (notationRef.current) notationRef.current.scrollTop = notationRef.current.scrollHeight
  }, [moveHistory.length])

  return (
    <div className="flex h-full overflow-hidden lm-gpu">
      {/* Left: Board */}
      <div className="lm-board-panel flex items-center justify-center bg-black/20 border-r border-white/[0.06]">
        <div className="flex flex-col items-center gap-3 py-4">
          {opening && (
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs text-primary font-medium">{opening.eco}: {opening.name}</span>
            </div>
          )}

          <div className="flex items-stretch gap-2 lm-gpu">
            <EvalBar game={new Chess(currentFen)} size={boardSize} thickness={18} vertical />
            <div className="lm-board-wrap">
              <Chessboard
                fen={currentFen}
                onMove={handleMove}
                orientation={flipped ? 'black' : 'white'}
                interactive
                size={boardSize}
                isCheck={new Chess(currentFen).isCheck()}
                boardStyle={settings.boardStyle}
                pieceStyle={settings.pieceStyle}
                allowArrowDrawing
              />
            </div>
          </div>

          {/* Board tools + navigation */}
          <div className="flex items-center gap-2">
            <button onClick={() => goTo(0)} className="px-2 py-1 rounded-lg bg-secondary text-foreground text-xs">⏮</button>
            <button onClick={() => goTo(currentPly - 1)} className="p-1 rounded-lg bg-secondary text-foreground"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs font-mono text-muted-foreground w-14 text-center">{currentPly}/{positions.length - 1}</span>
            <button onClick={() => goTo(currentPly + 1)} className="p-1 rounded-lg bg-secondary text-foreground"><ChevronRight className="w-4 h-4" /></button>
            <button onClick={() => goTo(positions.length - 1)} className="px-2 py-1 rounded-lg bg-secondary text-foreground text-xs">⏭</button>
            <div className="w-px h-5 bg-border mx-1" />
            <button onClick={() => setFlipped(!flipped)} className="p-1 rounded-lg bg-secondary text-muted-foreground" title="Flip (F)"><FlipVertical className="w-3.5 h-3.5" /></button>
            <button onClick={() => { navigator.clipboard.writeText(currentFen); setCopiedFEN(true); setTimeout(() => setCopiedFEN(false), 1500) }}
              className="p-1 rounded-lg bg-secondary text-muted-foreground" title="Copy FEN">
              {copiedFEN ? <span className="text-[10px] text-primary">✓</span> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => setShowImport(!showImport)} className="p-1 rounded-lg bg-secondary text-muted-foreground" title="Import"><Upload className="w-3.5 h-3.5" /></button>
            <button onClick={resetBoard} className="p-1 rounded-lg bg-secondary text-muted-foreground" title="Reset"><RotateCcw className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>

      {/* Right: Engine + Moves */}
      <div className="lm-right-panel flex flex-col h-full overflow-hidden">
        {/* Engine Panel */}
        <div className="flex-shrink-0 px-4 pt-4 pb-2">
          <div className="rounded-lg border border-white/[0.06] bg-black/20 p-3">
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
                <button onClick={() => setEngineOn(!engineOn)} className={`p-1 rounded ${engineOn ? 'text-primary' : 'text-muted-foreground'}`}>
                  {engineOn ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground">Depth</span>
                <select value={engineDepth} onChange={(e) => setEngineDepth(Number(e.target.value))}
                  className="bg-secondary text-foreground text-xs rounded px-1.5 py-0.5 border border-white/10">
                  {[10, 14, 16, 18, 20, 22].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground">Lines</span>
                <select value={multiPVCount} onChange={(e) => setMultiPVCount(Number(e.target.value))}
                  className="bg-secondary text-foreground text-xs rounded px-1.5 py-0.5 border border-white/10">
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
                      {line.bestLine.slice(0, 10).join(' ')}
                    </p>
                  </div>
                ))}
              </div>
            ) : engineOn ? (
              <p className="text-xs text-muted-foreground italic">Analyzing...</p>
            ) : (
              <p className="text-xs text-muted-foreground italic">Engine paused — press E to resume</p>
            )}
          </div>
        </div>

        {/* Import dialog */}
        {showImport && (
          <div className="flex-shrink-0 px-4 pb-2">
            <div className="rounded-lg border border-white/[0.06] bg-black/20 p-3">
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste FEN or PGN here..."
                className="w-full h-20 bg-black/40 border border-white/10 rounded-lg p-2 text-xs font-mono text-foreground resize-none"
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button onClick={handleImport} className="flex-1 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium">Load</button>
                <button onClick={() => { setShowImport(false); setImportText('') }} className="flex-1 py-1.5 rounded-lg bg-secondary text-foreground text-xs">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Move list */}
        <div className="flex-1 mx-4 mt-1 mb-2 flex flex-col min-h-0 rounded-lg border border-white/[0.06] bg-black/20 overflow-hidden">
          <div className="px-3 py-2 border-b border-white/[0.06] flex-shrink-0">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Moves</span>
          </div>
          <div ref={notationRef} className="flex-1 overflow-y-auto scrollbar-hide">
            {moveHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground italic p-4 text-center">Make a move or import a game</p>
            ) : (
              <div className="font-mono text-sm">
                {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => (
                  <div key={i} className={`flex gap-1 px-3 py-1.5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                    <span className="text-muted-foreground w-7 text-right shrink-0">{i + 1}.</span>
                    <button
                      onClick={() => goTo(i * 2 + 1)}
                      className={`flex-1 px-2 rounded text-left hover:bg-white/[0.05] ${currentPly === i * 2 + 1 ? 'text-primary font-bold bg-primary/10' : 'text-foreground'}`}
                    >
                      {moveHistory[i * 2]}
                    </button>
                    {moveHistory[i * 2 + 1] && (
                      <button
                        onClick={() => goTo(i * 2 + 2)}
                        className={`flex-1 px-2 rounded text-left hover:bg-white/[0.05] ${currentPly === i * 2 + 2 ? 'text-primary font-bold bg-primary/10' : 'text-foreground/70'}`}
                      >
                        {moveHistory[i * 2 + 1]}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Opening Explorer */}
        <div className="flex-shrink-0 mx-4 mb-4">
          <OpeningExplorer fen={currentFen} onMoveClick={handleExplorerMove} compact />
        </div>
      </div>
    </div>
  )
}

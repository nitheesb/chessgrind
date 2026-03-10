'use client'

import { useState, useCallback } from 'react'
import { Chess } from 'chess.js'
import { Chessboard } from '@/components/chess/chessboard'
import { ENDGAME_POSITIONS, type EndgamePosition } from '@/lib/endgame-positions'
import { useSettings } from '@/lib/settings-context'
import { useGame } from '@/lib/game-context'
import { getBestMove, getEngineConfig } from '@/lib/chess-engine'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import { ArrowLeft, Crown, ChevronRight, RotateCcw, Lightbulb } from 'lucide-react'

interface EndgamePracticeProps {
  onBack: () => void
}

export function EndgamePractice({ onBack }: EndgamePracticeProps) {
  const { settings } = useSettings()
  const { addXP } = useGame()
  const { playSound, triggerHaptic } = useSoundAndHaptics()
  const [activePosition, setActivePosition] = useState<EndgamePosition | null>(null)
  const [game, setGame] = useState<Chess | null>(null)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const [status, setStatus] = useState<'playing' | 'won' | 'lost' | 'draw'>('playing')
  const [moveCount, setMoveCount] = useState(0)

  const startPosition = useCallback((pos: EndgamePosition) => {
    setActivePosition(pos)
    setGame(new Chess(pos.fen))
    setLastMove(null)
    setStatus('playing')
    setMoveCount(0)
    playSound('click')
    triggerHaptic('selection')
  }, [playSound, triggerHaptic])

  const handleMove = useCallback((from: string, to: string, promotion?: string) => {
    if (!game || status !== 'playing') return false
    const gameCopy = new Chess(game.fen())
    try {
      const move = gameCopy.move({ from, to, promotion: promotion || 'q' })
      if (!move) return false
      setGame(gameCopy)
      setLastMove({ from, to })
      setMoveCount(c => c + 1)
      playSound(move.captured ? 'capture' : 'move')

      if (gameCopy.isGameOver()) {
        if (gameCopy.isCheckmate()) {
          setStatus('won')
          addXP(15)
          playSound('move')
        } else {
          setStatus('draw')
        }
        return true
      }

      // AI response
      setTimeout(() => {
        const config = getEngineConfig(4)
        const aiMove = getBestMove(gameCopy, config)
        if (aiMove) {
          const next = new Chess(gameCopy.fen())
          const m = next.move(aiMove)
          if (m) {
            setGame(next)
            setLastMove({ from: m.from, to: m.to })
            playSound(m.captured ? 'capture' : 'move')
            if (next.isGameOver()) {
              setStatus(next.isCheckmate() ? 'lost' : 'draw')
            }
          }
        }
      }, 300)
      return true
    } catch { return false }
  }, [game, status, playSound, addXP])

  if (!activePosition || !game) {
    const categories = ['basic', 'intermediate', 'advanced'] as const
    return (
      <div className="flex flex-col gap-4 pb-6">
        <div className="flex items-center gap-3 px-1">
          <button onClick={onBack} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-foreground">Endgame Practice</h1>
            <p className="text-xs text-muted-foreground">Master essential endgame techniques</p>
          </div>
        </div>

        {categories.map(cat => (
          <div key={cat}>
            <h2 className="text-sm font-semibold text-foreground capitalize mb-2 px-1">{cat}</h2>
            <div className="flex flex-col gap-2">
              {ENDGAME_POSITIONS.filter(p => p.category === cat).map(pos => (
                <button
                  key={pos.id}
                  onClick={() => startPosition(pos)}
                  className="w-full glass-card-hover p-4 flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{pos.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{pos.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const boardSize = typeof window !== 'undefined' ? Math.min(420, window.innerWidth - 48) : 360

  return (
    <div className="flex flex-col gap-3 pb-6">
      <div className="flex items-center gap-3 px-1">
        <button onClick={() => setActivePosition(null)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-foreground">{activePosition.name}</h1>
          <p className="text-xs text-muted-foreground">{activePosition.goal}</p>
        </div>
        <span className="text-xs text-muted-foreground font-mono">{moveCount} moves</span>
      </div>

      <div className="flex justify-center">
        <Chessboard
          fen={game.fen()}
          size={boardSize}
          interactive={status === 'playing'}
          onMove={handleMove}
          lastMove={lastMove || undefined}
          showCoordinates
          isCheck={game.isCheck()}
          boardStyle={settings.boardStyle}
          pieceStyle={settings.pieceStyle}
        />
      </div>

      {/* Tip */}
      <div className="glass-card p-3 flex items-start gap-2">
        <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">{activePosition.tip}</p>
      </div>

      {status !== 'playing' && (
        <div className="glass-card p-4 text-center">
          <p className="text-lg font-bold text-foreground mb-2">
            {status === 'won' ? '🎉 Well done!' : status === 'draw' ? '🤝 Draw' : '❌ Try again'}
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            {status === 'won' ? `Completed in ${moveCount} moves. +15 XP` : activePosition.tip}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => startPosition(activePosition)} className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Retry
            </button>
            <button onClick={() => setActivePosition(null)} className="px-5 py-2 rounded-xl bg-secondary text-foreground font-semibold text-sm">
              Back to List
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, X, ChevronRight, BookOpen } from 'lucide-react'
import { MiniChessboard } from '@/components/chess/chessboard'
import { useSettings } from '@/lib/settings-context'

interface PawnStructure {
  name: string
  description: string
  fen: string
  strategicIdeas: string[]
  pros: string[]
  cons: string[]
  commonOpenings: string[]
}

const PAWN_STRUCTURES: PawnStructure[] = [
  {
    name: 'Isolated Queen\'s Pawn (IQP)',
    description: 'A d-pawn with no friendly pawns on the c or e files. Common in many 1.d4 openings.',
    fen: '4k3/pp3ppp/8/8/3P4/8/PP3PPP/4K3 w - - 0 1',
    strategicIdeas: ['Use the d-pawn as a battering ram to open lines', 'Place pieces actively to compensate for the weak pawn', 'Attack on the kingside using open lines'],
    pros: ['Open c and e files for rooks', 'Active piece play', 'Space advantage in the center'],
    cons: ['Pawn can become a target in the endgame', 'Weak d5 square for opponent', 'Endgames are often difficult'],
    commonOpenings: ['Queen\'s Gambit Accepted', 'Tarrasch Defense', 'Nimzo-Indian Defense'],
  },
  {
    name: 'Hanging Pawns',
    description: 'Side-by-side pawns on c4 and d4 (or c5/d5) with no pawn support on adjacent files.',
    fen: '4k3/pp3ppp/8/8/2PP4/8/PP3PPP/4K3 w - - 0 1',
    strategicIdeas: ['Advance one of the pawns to create a passed pawn', 'Keep the pawns mobile and supported by pieces', 'Control central squares'],
    pros: ['Control key central squares', 'Dynamic pawn duo', 'Can create a passed pawn'],
    cons: ['Can become weak if blockaded', 'Vulnerable to attack on the half-open files', 'Advancing one pawn may weaken the other'],
    commonOpenings: ['Queen\'s Gambit Declined', 'English Opening', 'Catalan Opening'],
  },
  {
    name: 'Pawn Chain',
    description: 'A diagonal line of pawns supporting each other, like e4-d5-c6 or d4-e5-f6.',
    fen: '4k3/pp3ppp/2p5/3p4/4P3/8/PP3PPP/4K3 w - - 0 1',
    strategicIdeas: ['Attack the base of the pawn chain', 'Use the space advantage behind the chain', 'Maneuver pieces to exploit the fixed structure'],
    pros: ['Solid and hard to break down', 'Space advantage on one side', 'Clear strategic plans'],
    cons: ['Base pawn can be a weakness', 'Restricted piece mobility behind the chain', 'Opponent can attack the base'],
    commonOpenings: ['French Defense', 'King\'s Indian Defense', 'Advance Caro-Kann'],
  },
  {
    name: 'Doubled Pawns',
    description: 'Two pawns of the same color on the same file, usually created after a capture.',
    fen: '4k3/pp3ppp/8/8/8/4P3/PP2PPPP/4K3 w - - 0 1',
    strategicIdeas: ['Use the open file next to the doubled pawns', 'Try to undouble the pawns with a pawn break', 'Compensate with active piece play'],
    pros: ['Open files for rooks', 'Extra central control', 'Can be fine in the middlegame'],
    cons: ['Reduced pawn mobility', 'Weakness in endgames', 'Cannot protect each other'],
    commonOpenings: ['Nimzo-Indian Defense', 'Exchange Ruy Lopez', 'Scotch Game'],
  },
  {
    name: 'Backward Pawn',
    description: 'A pawn that cannot be advanced because the adjacent pawns have moved ahead, leaving it unprotected.',
    fen: '4k3/pp3ppp/8/4p3/8/3P4/PP3PPP/4K3 w - - 0 1',
    strategicIdeas: ['Try to advance the backward pawn', 'Use piece play to compensate', 'Blockade opponent\'s backward pawn with a piece'],
    pros: ['Controls squares ahead of it', 'May support a future pawn break'],
    cons: ['Easy target for opponent pieces', 'The square in front is weak', 'Limits piece mobility on that file'],
    commonOpenings: ['Sicilian Defense (Najdorf)', 'Open Sicilian', 'Queen\'s Gambit Declined'],
  },
  {
    name: 'Passed Pawn',
    description: 'A pawn with no opposing pawns blocking or able to capture it on its path to promotion.',
    fen: '4k3/pp3ppp/8/8/3P4/8/PP4PP/4K3 w - - 0 1',
    strategicIdeas: ['Advance the passed pawn supported by pieces', 'Use the passed pawn to distract opponent pieces', 'Create a second weakness'],
    pros: ['Can promote to a queen', 'Ties down opponent pieces', 'Powerful in endgames'],
    cons: ['Can be blockaded', 'May need piece support to advance', 'Opponent may sacrifice material to stop it'],
    commonOpenings: ['Pawn endgames', 'Queen\'s Gambit', 'Ruy Lopez'],
  },
  {
    name: 'Connected Passed Pawns',
    description: 'Two or more passed pawns on adjacent files that can protect each other as they advance.',
    fen: '4k3/pp3ppp/8/8/2PP4/8/PP4PP/4K3 w - - 0 1',
    strategicIdeas: ['Advance the pawns together', 'One pawn shields the other from capture', 'Force the opponent to give up material'],
    pros: ['Very powerful in endgames', 'Hard to stop both pawns', 'Support each other\'s advance'],
    cons: ['Still vulnerable to pieces if not supported', 'Can be blockaded by a piece on the right square'],
    commonOpenings: ['Pawn endgames', 'Rook endgames', 'Exchange variations'],
  },
  {
    name: 'Pawn Majority',
    description: 'Having more pawns than the opponent on one side of the board (e.g., 3 vs 2 on the queenside).',
    fen: '4k3/p4ppp/8/8/8/8/PPP2PPP/4K3 w - - 0 1',
    strategicIdeas: ['Create a passed pawn with the majority', 'Advance the majority in the endgame', 'Trade pawns on the minority side'],
    pros: ['Can create a passed pawn', 'Endgame advantage', 'Strategic initiative on one flank'],
    cons: ['Opponent has majority on the other side', 'Must be activated at the right moment', 'Middlegame advantage may be small'],
    commonOpenings: ['Exchange Ruy Lopez', 'Queen\'s Gambit Exchange', 'Carlsbad Structure'],
  },
  {
    name: 'Pawn Islands',
    description: 'Groups of connected pawns separated by open files. Fewer islands generally means a healthier pawn structure.',
    fen: '4k3/p1p2p1p/8/8/8/8/P1P2P1P/4K3 w - - 0 1',
    strategicIdeas: ['Minimize your own pawn islands', 'Target the opponent\'s isolated pawn groups', 'Use open files between islands for rooks'],
    pros: ['Open files between islands provide rook activity'],
    cons: ['More islands means more weaknesses', 'Isolated groups are harder to defend', 'Endgame liability'],
    commonOpenings: ['Symmetrical English', 'Exchange variations', 'Open games'],
  },
  {
    name: 'Hedgehog Structure',
    description: 'Pawns on a6, b6, d6, and e6 forming a solid but flexible defensive wall, ready to spring forward.',
    fen: '4k3/2p2p1p/pp1pp3/8/8/8/PPPPPPPP/4K3 w - - 0 1',
    strategicIdeas: ['Wait for the right moment to break with ...b5 or ...d5', 'Keep pieces behind the pawn wall', 'Counter-attack when the opponent overextends'],
    pros: ['Very solid and hard to break', 'Flexible - can strike back with pawn breaks', 'Good for patient players'],
    cons: ['Less space', 'Requires precise timing for breaks', 'Passive if mishandled'],
    commonOpenings: ['English Opening', 'Symmetrical English', 'Sicilian Kan'],
  },
]

interface PawnStructureGuideProps {
  onClose: () => void
}

export function PawnStructureGuide({ onClose }: PawnStructureGuideProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const { settings } = useSettings()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-4 p-4 max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Pawn Structures
        </h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <p className="text-sm text-muted-foreground">
        Learn the 10 most important pawn structures in chess. Tap a structure to explore its strategic ideas.
      </p>

      {/* Grid of structure cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PAWN_STRUCTURES.map((structure, idx) => (
          <motion.button
            key={structure.name}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedIndex(selectedIndex === idx ? null : idx)}
            className={`glass-card p-3 flex items-center gap-3 text-left transition-colors ${
              selectedIndex === idx ? 'border-primary/50' : 'hover:border-primary/30'
            }`}
          >
            <div className="flex-shrink-0">
              <MiniChessboard
                fen={structure.fen}
                size={72}
                boardStyle={settings.boardStyle}
                pieceStyle={settings.pieceStyle}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">{structure.name}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{structure.description}</p>
            </div>
            <ChevronRight className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${
              selectedIndex === idx ? 'rotate-90' : ''
            }`} />
          </motion.button>
        ))}
      </div>

      {/* Expanded detail panel */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-5 flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <MiniChessboard
                  fen={PAWN_STRUCTURES[selectedIndex].fen}
                  size={140}
                  boardStyle={settings.boardStyle}
                  pieceStyle={settings.pieceStyle}
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">{PAWN_STRUCTURES[selectedIndex].name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{PAWN_STRUCTURES[selectedIndex].description}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Strategic Ideas
                </h4>
                <ul className="space-y-1">
                  {PAWN_STRUCTURES[selectedIndex].strategicIdeas.map((idea, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">&#x2022;</span>
                      {idea}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-green-400 mb-1.5">Pros</h4>
                  <ul className="space-y-1">
                    {PAWN_STRUCTURES[selectedIndex].pros.map((pro, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-green-400">+</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-red-400 mb-1.5">Cons</h4>
                  <ul className="space-y-1">
                    {PAWN_STRUCTURES[selectedIndex].cons.map((con, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-red-400">-</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1.5">Common Openings</h4>
                <div className="flex flex-wrap gap-1.5">
                  {PAWN_STRUCTURES[selectedIndex].commonOpenings.map((opening, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-primary/10 text-xs text-primary font-medium">
                      {opening}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

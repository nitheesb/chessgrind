// Endgame practice positions - curated training positions
export interface EndgamePosition {
  id: string
  name: string
  category: 'basic' | 'intermediate' | 'advanced'
  fen: string
  description: string
  goal: string
  tip: string
}

export const ENDGAME_POSITIONS: EndgamePosition[] = [
  {
    id: 'kq-vs-k',
    name: 'King + Queen vs King',
    category: 'basic',
    fen: '4k3/8/8/8/8/8/8/4K2Q w - - 0 1',
    description: 'The most basic checkmate pattern. Drive the enemy king to the edge.',
    goal: 'Deliver checkmate',
    tip: 'Use your queen to restrict the king, then bring your king closer.',
  },
  {
    id: 'kr-vs-k',
    name: 'King + Rook vs King',
    category: 'basic',
    fen: '4k3/8/8/8/8/8/8/R3K3 w - - 0 1',
    description: 'Essential rook endgame technique. Cut off the king rank by rank.',
    goal: 'Deliver checkmate',
    tip: 'Use the rook to cut off files/ranks, then march your king.',
  },
  {
    id: 'kbb-vs-k',
    name: 'King + 2 Bishops vs King',
    category: 'intermediate',
    fen: '4k3/8/8/8/8/8/8/2B1KB2 w - - 0 1',
    description: 'Two bishops work together to create a diagonal cage.',
    goal: 'Deliver checkmate',
    tip: 'Bishops control diagonals. Drive the king to a corner of the same color as your bishop pair.',
  },
  {
    id: 'kp-vs-k',
    name: 'King + Pawn vs King',
    category: 'basic',
    fen: '8/8/4k3/8/4P3/4K3/8/8 w - - 0 1',
    description: 'The key concept of opposition. Can you promote the pawn?',
    goal: 'Promote the pawn and win',
    tip: 'The king must lead the pawn. Gain the opposition!',
  },
  {
    id: 'lucena',
    name: 'Lucena Position',
    category: 'intermediate',
    fen: '1K1k4/1P6/8/8/8/8/1r6/5R2 w - - 0 1',
    description: 'The most important rook endgame technique. Build a bridge!',
    goal: 'Promote the pawn using the bridge technique',
    tip: 'Rd1, Rd4, then Kc7/Kb8 and Rd8+ to shield your king.',
  },
  {
    id: 'philidor',
    name: 'Philidor Position',
    category: 'intermediate',
    fen: '8/3k4/8/3PK3/8/8/8/3r3R w - - 0 1',
    description: 'The key defensive technique in rook endings.',
    goal: 'Defend and draw from the weaker side',
    tip: 'Keep the rook on the 6th rank (Philidor) or go behind the pawn (Lucena defense).',
  },
  {
    id: 'kbn-vs-k',
    name: 'King + Bishop + Knight vs King',
    category: 'advanced',
    fen: '4k3/8/8/8/8/8/8/1N2KB2 w - - 0 1',
    description: 'The hardest basic checkmate. Requires precise technique.',
    goal: 'Deliver checkmate (corner matching bishop color)',
    tip: 'Drive the king to the corner that matches your bishop\'s color.',
  },
  {
    id: 'opposite-bishops',
    name: 'Opposite Color Bishops',
    category: 'advanced',
    fen: '8/5p2/4k1p1/4P1P1/3K1P2/8/1b6/6B1 w - - 0 1',
    description: 'Opposite-colored bishops are drawish. Can you convert the advantage?',
    goal: 'Try to win with the extra pawn',
    tip: 'Create two passed pawns far apart. One bishop can\'t cover both.',
  },
  {
    id: 'queen-vs-pawn',
    name: 'Queen vs Pawn on 7th',
    category: 'intermediate',
    fen: '8/3Pk3/8/8/8/8/8/4K2q w - - 0 1',
    description: 'Can the queen stop a pawn on the 7th rank?',
    goal: 'Promote the pawn or win the queen',
    tip: 'Check the enemy king toward the pawn, then approach with your king.',
  },
  {
    id: 'rook-vs-pawns',
    name: 'Rook vs Connected Pawns',
    category: 'advanced',
    fen: '8/8/8/3kpp2/8/8/3K4/R7 w - - 0 1',
    description: 'Rook vs connected passed pawns. Attack from behind!',
    goal: 'Stop the pawns and win',
    tip: 'Place your rook behind the pawns. They can\'t advance safely.',
  },
  {
    id: 'tablebase-draw',
    name: 'King + Rook vs King + Bishop',
    category: 'advanced',
    fen: '8/8/4k3/8/8/8/3bK3/R7 w - - 0 1',
    description: 'Generally a draw with correct defense. Test your technique.',
    goal: 'Try to win or hold the draw',
    tip: 'The bishop can defend if the defending king stays centralized.',
  },
  {
    id: 'pawn-race',
    name: 'Pawn Race',
    category: 'basic',
    fen: '8/p7/8/8/8/8/7P/8 w - - 0 1',
    description: 'Both sides have a passed pawn. Who promotes first?',
    goal: 'Promote your pawn first or draw',
    tip: 'Count the squares! Pawn races are all about calculation.',
  },
]

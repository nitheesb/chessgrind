// Chess learning data - types, helpers, and re-exports
// Data arrays are in separate files for code splitting

export interface Opening {
  id: string
  name: string
  eco: string
  moves: string[]
  fen: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: 'e4' | 'd4' | 'other'
  popularity: number
  winRate: { white: number; draw: number; black: number }
  keyIdeas: string[]
  moveAnnotations?: string[]
  variations: { name: string; moves: string[]; description: string }[]
  learned?: boolean
}

export interface Puzzle {
  id: string
  fen: string
  moves: string[] // alternating: opponent move, your move, opponent response, your move...
  rating: number
  themes: string[]
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  xpReward: number
  solved?: boolean
}

export interface Trap {
  id: string
  name: string
  opening: string
  moves: string[]
  fen: string
  description: string
  explanation: string[]
  moveAnnotations?: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  side: 'white' | 'black'
  xpReward: number
  learned?: boolean
}

// Re-export data from split files
export { OPENINGS } from './chess-data/openings'
export { PUZZLES } from './chess-data/puzzles'
export { TRAPS } from './chess-data/traps'

export const AI_LEVELS = [
  { level: 1, name: 'Beginner Bot', rating: 400, description: 'Makes random moves, perfect for learning', depth: 1, icon: 'P', color: '#4ade80' },
  { level: 2, name: 'Casual Player', rating: 600, description: 'Knows basic tactics but misses a lot', depth: 2, icon: 'P', color: '#4ade80' },
  { level: 3, name: 'Club Player', rating: 800, description: 'Understands basic strategy and openings', depth: 3, icon: 'N', color: '#60a5fa' },
  { level: 4, name: 'Tournament Player', rating: 1000, description: 'Solid player with good tactical vision', depth: 3, icon: 'N', color: '#60a5fa' },
  { level: 5, name: 'Expert', rating: 1200, description: 'Strong player who rarely blunders', depth: 4, icon: 'B', color: '#a78bfa' },
  { level: 6, name: 'Master', rating: 1400, description: 'Plays at a master level with deep calculation', depth: 5, icon: 'R', color: '#f59e0b' },
  { level: 7, name: 'Grandmaster', rating: 1600, description: 'Near-perfect play with devastating attacks', depth: 5, icon: 'Q', color: '#f59e0b' },
  { level: 8, name: 'Stockfish Beast', rating: 2000, description: 'Maximum engine strength. Good luck!', depth: 6, icon: 'K', color: '#ef4444' },
]

export const PUZZLE_THEMES = [
  'All Puzzles',
  'Checkmate',
  'Tactics',
  'Forks',
  'Pins',
  'Back Rank',
  'Sacrifice',
  'Endgame',
  'Strategy',
]

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'beginner':
    case 'easy':
      return 'text-amber-400'
    case 'intermediate':
    case 'medium':
      return 'text-yellow-400'
    case 'advanced':
    case 'hard':
      return 'text-orange-400'
    case 'expert':
      return 'text-red-400'
    default:
      return 'text-muted-foreground'
  }
}

export function getDifficultyBg(difficulty: string): string {
  switch (difficulty) {
    case 'beginner':
    case 'easy':
      return 'bg-amber-400/10 text-amber-400 border-amber-400/20'
    case 'intermediate':
    case 'medium':
      return 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'
    case 'advanced':
    case 'hard':
      return 'bg-orange-400/10 text-orange-400 border-orange-400/20'
    case 'expert':
      return 'bg-red-400/10 text-red-400 border-red-400/20'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-400 border-gray-400/20'
    case 'rare':
      return 'text-blue-400 border-blue-400/30'
    case 'epic':
      return 'text-purple-400 border-purple-400/30'
    case 'legendary':
      return 'text-yellow-400 border-yellow-400/30'
    default:
      return 'text-muted-foreground border-border'
  }
}

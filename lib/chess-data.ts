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
  source?: 'static' | 'lichess'
  lichessId?: string
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
  { level: 1, name: 'Beginner Bot', rating: 400, description: 'Makes random moves, perfect for learning', depth: 1, icon: 'P', color: '#4ade80', useStockfish: false, botName: 'Pawny', botEmoji: '🐣', botPersonality: 'Enthusiastic beginner who loves chess but keeps forgetting how pieces move.', botStyle: 'Random and unpredictable' },
  { level: 2, name: 'Casual Player', rating: 600, description: 'Knows basic tactics but misses a lot', depth: 2, icon: 'P', color: '#4ade80', useStockfish: false, botName: 'Woody', botEmoji: '🪵', botPersonality: 'A chill player who enjoys the game but gets distracted easily.', botStyle: 'Slow and steady' },
  { level: 3, name: 'Club Player', rating: 800, description: 'Understands basic strategy and openings', depth: 3, icon: 'N', color: '#60a5fa', useStockfish: false, botName: 'Chester', botEmoji: '🎩', botPersonality: 'Polite club regular who studies openings but panics in the middlegame.', botStyle: 'Solid openings, shaky endgames' },
  { level: 4, name: 'Tournament Player', rating: 1200, description: 'Solid player with real tactical vision', depth: 4, icon: 'N', color: '#60a5fa', useStockfish: true, stockfishSkill: 5, botName: 'Vera', botEmoji: '⚔️', botPersonality: 'Competitive tournament player with tactical tricks up her sleeve.', botStyle: 'Tactical and aggressive' },
  { level: 5, name: 'Expert', rating: 1500, description: 'Stockfish engine — strong and precise', depth: 4, icon: 'B', color: '#a78bfa', useStockfish: true, stockfishSkill: 10, botName: 'Magnus Jr.', botEmoji: '🎯', botPersonality: 'Precise and methodical. Punishes every inaccuracy.', botStyle: 'Positional and precise' },
  { level: 6, name: 'Master', rating: 1800, description: 'Stockfish engine — master-level depth', depth: 5, icon: 'R', color: '#f59e0b', useStockfish: true, stockfishSkill: 15, botName: 'Grandmistress', botEmoji: '👑', botPersonality: 'A seasoned master with deep strategic understanding and killer endgame technique.', botStyle: 'Strategic and patient' },
  { level: 7, name: 'Grandmaster', rating: 2200, description: 'Stockfish engine — devastating attacks', depth: 5, icon: 'Q', color: '#f59e0b', useStockfish: true, stockfishSkill: 18, botName: 'Tal\'s Ghost', botEmoji: '🔥', botPersonality: 'Channels the spirit of Mikhail Tal. Sacrifices everywhere.', botStyle: 'Sacrificial and attacking' },
  { level: 8, name: 'Stockfish Max', rating: 2800, description: 'Full-strength Stockfish 18. Good luck!', depth: 6, icon: 'K', color: '#ef4444', useStockfish: true, stockfishSkill: 20, botName: 'The Machine', botEmoji: '🤖', botPersonality: 'Full-strength Stockfish 18. No mercy. No mistakes.', botStyle: 'Perfect play' },
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

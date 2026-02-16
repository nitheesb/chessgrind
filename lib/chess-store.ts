// Client-side game state store using React context pattern
// This manages the ephemeral game state; backend sync is handled separately

export interface UserProfile {
  username: string
  avatar: string
  level: number
  xp: number
  xpToNext: number
  rating: number
  streak: number
  bestStreak: number
  gamesPlayed: number
  puzzlesSolved: number
  openingsLearned: number
  trapsLearned: number
  achievements: Achievement[]
  dailyChallengeCompleted: boolean
  joinDate: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedDate?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface DailyChallenge {
  id: string
  type: 'puzzle' | 'opening' | 'trap'
  title: string
  description: string
  fen: string
  solution: string[]
  xpReward: number
  completed: boolean
}

export const LEVELS = [
  { level: 1, title: 'Pawn', xpRequired: 0, icon: 'P' },
  { level: 2, title: 'Squire', xpRequired: 100, icon: 'P' },
  { level: 3, title: 'Knight Apprentice', xpRequired: 300, icon: 'N' },
  { level: 4, title: 'Knight', xpRequired: 600, icon: 'N' },
  { level: 5, title: 'Bishop Initiate', xpRequired: 1000, icon: 'B' },
  { level: 6, title: 'Bishop', xpRequired: 1500, icon: 'B' },
  { level: 7, title: 'Rook Guard', xpRequired: 2200, icon: 'R' },
  { level: 8, title: 'Rook', xpRequired: 3000, icon: 'R' },
  { level: 9, title: 'Queen Commander', xpRequired: 4000, icon: 'Q' },
  { level: 10, title: 'Queen', xpRequired: 5200, icon: 'Q' },
  { level: 11, title: 'King Aspirant', xpRequired: 6500, icon: 'K' },
  { level: 12, title: 'King', xpRequired: 8000, icon: 'K' },
  { level: 13, title: 'Grandmaster', xpRequired: 10000, icon: 'K' },
  { level: 14, title: 'Chess Legend', xpRequired: 13000, icon: 'K' },
  { level: 15, title: 'Chess Immortal', xpRequired: 17000, icon: 'K' },
]

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-move', name: 'First Move', description: 'Play your first game', icon: 'P', earned: false, rarity: 'common' },
  { id: 'puzzle-solver', name: 'Puzzle Solver', description: 'Solve 10 puzzles', icon: 'N', earned: false, rarity: 'common' },
  { id: 'opening-student', name: 'Opening Student', description: 'Learn 5 openings', icon: 'B', earned: false, rarity: 'common' },
  { id: 'streak-3', name: 'Hot Streak', description: 'Maintain a 3-day streak', icon: 'R', earned: false, rarity: 'common' },
  { id: 'trap-master', name: 'Trap Master', description: 'Learn all traps', icon: 'Q', earned: false, rarity: 'rare' },
  { id: 'streak-7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: 'K', earned: false, rarity: 'rare' },
  { id: 'puzzle-50', name: 'Puzzle Addict', description: 'Solve 50 puzzles', icon: 'Q', earned: false, rarity: 'rare' },
  { id: 'ai-crusher', name: 'AI Crusher', description: 'Beat level 5 AI', icon: 'R', earned: false, rarity: 'epic' },
  { id: 'speed-demon', name: 'Speed Demon', description: 'Solve a puzzle in under 10 seconds', icon: 'N', earned: false, rarity: 'epic' },
  { id: 'grandmaster', name: 'Grandmaster', description: 'Reach level 13', icon: 'K', earned: false, rarity: 'legendary' },
  { id: 'streak-30', name: 'Monthly Dedication', description: 'Maintain a 30-day streak', icon: 'K', earned: false, rarity: 'legendary' },
  { id: 'all-openings', name: 'Encyclopedia', description: 'Learn all openings', icon: 'K', earned: false, rarity: 'legendary' },
]

export const DEFAULT_PROFILE: UserProfile = {
  username: 'ChessLearner',
  avatar: 'K',
  level: 1,
  xp: 0,
  xpToNext: 100,
  rating: 800,
  streak: 0,
  bestStreak: 0,
  gamesPlayed: 0,
  puzzlesSolved: 0,
  openingsLearned: 0,
  trapsLearned: 0,
  achievements: ALL_ACHIEVEMENTS,
  dailyChallengeCompleted: false,
  joinDate: new Date().toISOString(),
}

export function getLevelInfo(xp: number) {
  let currentLevel = LEVELS[0]
  let nextLevel = LEVELS[1]
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      currentLevel = LEVELS[i]
      nextLevel = LEVELS[i + 1] || LEVELS[i]
      break
    }
  }
  const xpIntoLevel = xp - currentLevel.xpRequired
  const xpForLevel = nextLevel.xpRequired - currentLevel.xpRequired
  const progress = xpForLevel > 0 ? (xpIntoLevel / xpForLevel) * 100 : 100
  return { currentLevel, nextLevel, progress, xpIntoLevel, xpForLevel }
}

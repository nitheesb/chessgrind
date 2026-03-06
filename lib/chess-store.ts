// Client-side game state store using React context pattern
// This manages the ephemeral game state; backend sync is handled separately

export interface WeeklyMission {
  id: string
  title: string
  description: string
  target: number
  progress: number
  xpReward: number
  completed: boolean
  icon: string
  weekStart: string
}

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
  lastDailyDate: string
  joinDate: string
  puzzleRating: number
  puzzlesAttempted: number
  puzzlesCorrect: number
  failedPuzzleThemes: Record<string, number>
  // Addictiveness features
  combo: number
  bestCombo: number
  perfectSolves: number
  lastActiveDate: string
  dailyBonusClaimed: boolean
  // Activity tracking
  activityDates: Record<string, number>
  // Recent games
  recentGames: Array<{
    id: string
    date: string
    result: 'win' | 'loss' | 'draw'
    opponent: string
    moves: number
    pgn?: string
  }>
  // Puzzle rating history
  puzzleRatingHistory: Array<{ date: string; rating: number }>
  // Weekly missions
  weeklyMissions: WeeklyMission[]
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
  earnedDate?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  progress?: number
  target?: number
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
  { id: 'first-move', name: 'First Move', description: 'Play your first game', icon: '♟', earned: false, rarity: 'common', progress: 0, target: 1 },
  { id: 'puzzle-10', name: 'Puzzle Solver', description: 'Solve 10 puzzles', icon: '🧩', earned: false, rarity: 'common', progress: 0, target: 10 },
  { id: 'opening-5', name: 'Opening Student', description: 'Learn 5 openings', icon: '📚', earned: false, rarity: 'common', progress: 0, target: 5 },
  { id: 'streak-3', name: 'Hot Streak', description: 'Maintain a 3-day streak', icon: '🔥', earned: false, rarity: 'common', progress: 0, target: 3 },
  { id: 'daily-first', name: 'Daily Devotion', description: 'Complete your first daily', icon: '📅', earned: false, rarity: 'common', progress: 0, target: 1 },
  { id: 'trap-master', name: 'Trap Master', description: 'Learn all traps', icon: '🪤', earned: false, rarity: 'rare', progress: 0, target: 5 },
  { id: 'streak-7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⚔️', earned: false, rarity: 'rare', progress: 0, target: 7 },
  { id: 'puzzle-50', name: 'Puzzle Addict', description: 'Solve 50 puzzles', icon: '🏆', earned: false, rarity: 'rare', progress: 0, target: 50 },
  { id: 'rating-1000', name: 'Four Digits', description: 'Reach 1000 puzzle rating', icon: '📈', earned: false, rarity: 'rare', progress: 0, target: 1000 },
  { id: 'ai-crusher', name: 'AI Crusher', description: 'Beat level 5 AI', icon: '🤖', earned: false, rarity: 'epic', progress: 0, target: 1 },
  { id: 'speed-demon', name: 'Speed Demon', description: 'Solve a puzzle in under 10 seconds', icon: '⚡', earned: false, rarity: 'epic', progress: 0, target: 1 },
  { id: 'perfect-week', name: 'Perfect Week', description: 'Complete daily challenges for 7 days', icon: '🌟', earned: false, rarity: 'epic', progress: 0, target: 7 },
  { id: 'grandmaster', name: 'Grandmaster', description: 'Reach level 13', icon: '👑', earned: false, rarity: 'legendary', progress: 0, target: 13 },
  { id: 'streak-30', name: 'Monthly Dedication', description: 'Maintain a 30-day streak', icon: '💎', earned: false, rarity: 'legendary', progress: 0, target: 30 },
  { id: 'all-openings', name: 'Encyclopedia', description: 'Learn all openings', icon: '📖', earned: false, rarity: 'legendary', progress: 0, target: 10 },
  { id: 'puzzle-100', name: 'Puzzle Master', description: 'Solve 100 puzzles', icon: '🎯', earned: false, rarity: 'legendary', progress: 0, target: 100 },
  { id: 'combo-5', name: 'On Fire', description: 'Get a 5x puzzle combo', icon: '🔥', earned: false, rarity: 'rare', progress: 0, target: 5 },
  { id: 'combo-10', name: 'Unstoppable', description: 'Get a 10x puzzle combo', icon: '💥', earned: false, rarity: 'epic', progress: 0, target: 10 },
  { id: 'perfect-10', name: 'Perfectionist', description: 'Solve 10 puzzles without mistakes', icon: '✨', earned: false, rarity: 'rare', progress: 0, target: 10 },
  { id: 'daily-7', name: 'Loyal Player', description: 'Claim daily bonus 7 days in a row', icon: '🎁', earned: false, rarity: 'rare', progress: 0, target: 7 },
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
  lastDailyDate: '',
  joinDate: new Date().toISOString(),
  puzzleRating: 800,
  puzzlesAttempted: 0,
  puzzlesCorrect: 0,
  failedPuzzleThemes: {},
  combo: 0,
  bestCombo: 0,
  perfectSolves: 0,
  lastActiveDate: '',
  dailyBonusClaimed: false,
  activityDates: {},
  recentGames: [],
  puzzleRatingHistory: [],
  weeklyMissions: [],
}

// Get XP multiplier based on combo count
export function getComboMultiplier(combo: number): number {
  if (combo >= 10) return 3
  if (combo >= 5) return 2
  if (combo >= 3) return 1.5
  return 1
}

// Get daily bonus XP based on consecutive days
export function getDailyBonusXP(streak: number): number {
  if (streak >= 30) return 75
  if (streak >= 14) return 50
  if (streak >= 7) return 30
  if (streak >= 3) return 20
  return 10
}

// Calculate new puzzle rating using ELO formula
export function calculatePuzzleRating(
  currentRating: number,
  puzzleRating: number,
  solved: boolean,
  timeSeconds: number
): number {
  const K = 32 // Rating adjustment factor
  const expected = 1 / (1 + Math.pow(10, (puzzleRating - currentRating) / 400))
  const actual = solved ? 1 : 0
  
  // Time bonus/penalty
  let timeFactor = 1
  if (solved) {
    if (timeSeconds < 10) timeFactor = 1.3  // Speed bonus
    else if (timeSeconds < 30) timeFactor = 1.1
    else if (timeSeconds > 120) timeFactor = 0.8 // Slow penalty
  }
  
  const change = Math.round(K * (actual - expected) * timeFactor)
  return Math.max(100, currentRating + change) // Minimum rating 100
}

// Get daily puzzle based on date
export function getDailyPuzzleIndex(puzzleCount: number): number {
  const today = new Date()
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  )
  return dayOfYear % puzzleCount
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

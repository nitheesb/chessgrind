import { Redis } from '@upstash/redis'

// Initialize Redis client with environment variables
// Support both Vercel KV naming and Upstash naming
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export default redis

// User profile key prefix
const USER_PREFIX = 'user:'
const SESSION_PREFIX = 'session:'

export interface StoredUserProfile {
  id: string
  username: string
  passwordHash: string
  avatar: string
  level: number
  xp: number
  rating: number
  streak: number
  bestStreak: number
  gamesPlayed: number
  puzzlesSolved: number
  openingsLearned: number
  trapsLearned: number
  achievements: string[] // Array of earned achievement IDs
  dailyChallengeCompleted: boolean
  dailyChallengeDate: string
  joinDate: string
  lastActive: string
}

export async function getUserById(userId: string): Promise<StoredUserProfile | null> {
  return redis.get<StoredUserProfile>(`${USER_PREFIX}${userId}`)
}

export async function getUserByUsername(username: string): Promise<StoredUserProfile | null> {
  const userId = await redis.get<string>(`username:${username.toLowerCase()}`)
  if (!userId) return null
  return getUserById(userId)
}

export async function createUser(user: StoredUserProfile): Promise<void> {
  // Store user by ID
  await redis.set(`${USER_PREFIX}${user.id}`, user)
  // Store username -> ID mapping for lookups
  await redis.set(`username:${user.username.toLowerCase()}`, user.id)
}

export async function updateUser(userId: string, updates: Partial<StoredUserProfile>): Promise<StoredUserProfile | null> {
  const user = await getUserById(userId)
  if (!user) return null

  const updatedUser = { ...user, ...updates, lastActive: new Date().toISOString() }
  await redis.set(`${USER_PREFIX}${userId}`, updatedUser)
  return updatedUser
}

export async function createSession(userId: string, sessionId: string, expiresIn = 60 * 60 * 24 * 7): Promise<void> {
  await redis.setex(`${SESSION_PREFIX}${sessionId}`, expiresIn, userId)
}

export async function getSession(sessionId: string): Promise<string | null> {
  return redis.get<string>(`${SESSION_PREFIX}${sessionId}`)
}

export async function deleteSession(sessionId: string): Promise<void> {
  await redis.del(`${SESSION_PREFIX}${sessionId}`)
}

// Daily streak management
export async function updateStreak(userId: string): Promise<{ streak: number; bestStreak: number }> {
  const user = await getUserById(userId)
  if (!user) return { streak: 0, bestStreak: 0 }

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const lastActiveDate = user.lastActive.split('T')[0]

  let newStreak = user.streak

  if (lastActiveDate === yesterday) {
    newStreak = user.streak + 1
  } else if (lastActiveDate !== today) {
    newStreak = 1
  }

  const newBestStreak = Math.max(newStreak, user.bestStreak)

  await updateUser(userId, { streak: newStreak, bestStreak: newBestStreak })

  return { streak: newStreak, bestStreak: newBestStreak }
}

// Leaderboard functions
export async function updateLeaderboard(userId: string, xp: number): Promise<void> {
  await redis.zadd('leaderboard:xp', { score: xp, member: userId })
}

export async function getLeaderboard(limit = 10): Promise<{ userId: string; xp: number }[]> {
  const results = await redis.zrange<string[]>('leaderboard:xp', 0, limit - 1, { rev: true, withScores: true })
  
  const leaderboard: { userId: string; xp: number }[] = []
  for (let i = 0; i < results.length; i += 2) {
    leaderboard.push({
      userId: results[i],
      xp: Number(results[i + 1]),
    })
  }
  return leaderboard
}

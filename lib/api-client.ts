// API client for communicating with backend
const API_BASE = '/api'

interface ApiResponse<T = unknown> {
  success?: boolean
  error?: string
  [key: string]: unknown
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T & ApiResponse> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'API request failed')
  }

  return data
}

// Auth API
export const authApi = {
  async register(username: string, password: string) {
    return fetchApi<{
      success: boolean
      user: UserProfileResponse
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },

  async login(username: string, password: string) {
    return fetchApi<{
      success: boolean
      user: UserProfileResponse
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },

  async logout() {
    return fetchApi<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    })
  },

  async getSession() {
    return fetchApi<{
      authenticated: boolean
      user?: UserProfileResponse
    }>('/auth/session')
  },
}

// User API
export const userApi = {
  async syncProgress(updates: Partial<ProgressUpdate>) {
    return fetchApi<{
      success: boolean
      user: { level: number; xp: number; xpToNext: number }
    }>('/user/sync', {
      method: 'POST',
      body: JSON.stringify(updates),
    })
  },

  async updateProgress(action: ProgressAction, value?: unknown) {
    return fetchApi<{
      success: boolean
      xpGained: number
      leveledUp: boolean
      newLevel: { level: number; title: string } | null
      user: { xp: number; level: number; xpToNext: number }
    }>('/user/progress', {
      method: 'POST',
      body: JSON.stringify({ action, value }),
    })
  },

  async getProgress() {
    return fetchApi<ProgressData>('/user/sync')
  },
}

// Types
export interface UserProfileResponse {
  id: string
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

export interface ProgressUpdate {
  xp: number
  gamesPlayed: number
  puzzlesSolved: number
  openingsLearned: number
  trapsLearned: number
  achievements: string[]
  dailyChallengeCompleted: boolean
}

export interface ProgressData {
  xp: number
  level: number
  xpToNext: number
  gamesPlayed: number
  puzzlesSolved: number
  openingsLearned: number
  trapsLearned: number
  streak: number
  bestStreak: number
  achievements: string[]
}

export type ProgressAction =
  | 'addXP'
  | 'completePuzzle'
  | 'completeOpening'
  | 'completeTrap'
  | 'completeGame'
  | 'earnAchievement'

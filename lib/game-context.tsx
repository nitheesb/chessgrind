'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { type UserProfile, DEFAULT_PROFILE, getLevelInfo, LEVELS, ALL_ACHIEVEMENTS, calculatePuzzleRating, getComboMultiplier, getDailyBonusXP, type WeeklyMission } from './chess-store'
import { authApi, userApi, type UserProfileResponse } from './api-client'
import { generateWeeklyMissions, getWeekStart } from './weekly-missions'

interface GameContextType {
  profile: UserProfile
  isLoggedIn: boolean
  isLoading: boolean
  authError: string | null
  login: (username: string, password?: string) => Promise<{ success: boolean; error?: string }>
  register: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  addXP: (amount: number) => void
  incrementStreak: () => void
  incrementGamesPlayed: () => void
  incrementPuzzlesSolved: () => void
  incrementOpeningsLearned: () => void
  incrementTrapsLearned: () => void
  completeDaily: () => void
  earnAchievement: (id: string) => void
  updateAchievementProgress: (id: string, progress: number) => void
  updatePuzzleRating: (puzzleRating: number, solved: boolean, timeSeconds: number) => void
  trackPuzzleFailure: (themes: string[]) => void
  checkAndUpdateStreak: () => void
  incrementCombo: () => number
  resetCombo: () => void
  recordPerfectSolve: () => void
  claimDailyBonus: () => number
  xpAnimation: { show: boolean; amount: number }
  levelUpAnimation: { show: boolean; level: number; title: string }
  achievementAnimation: { show: boolean; achievement: { name: string; icon: string; rarity: string } | null }
  comboAnimation: { show: boolean; combo: number; multiplier: number }
  dailyBonusAnimation: { show: boolean; amount: number; streak: number }
  perfectSolveAnimation: { show: boolean }
  dismissXPAnimation: () => void
  dismissLevelUp: () => void
  dismissAchievement: () => void
  dismissComboAnimation: () => void
  dismissDailyBonus: () => void
  dismissPerfectSolve: () => void
  syncToBackend: () => Promise<void>
  isBackendEnabled: boolean
  hasSeenOnboarding: boolean
  setHasSeenOnboarding: (seen: boolean) => void
  recordActivity: () => void
  addRecentGame: (game: { id: string; date: string; result: 'win' | 'loss' | 'draw'; opponent: string; moves: number; pgn?: string }) => void
  updateWeeklyMission: (id: string, increment: number) => void
}

const GameContext = createContext<GameContextType | null>(null)

// Check if backend is configured
const isBackendConfigured = () => {
  // Only check on client side
  if (typeof window === 'undefined') {
    return false // Will be updated in useEffect
  }
  // On Vercel deployment, backend should be available
  if (window.location.hostname !== 'localhost') {
    return true
  }
  // For localhost, default to demo mode
  return false
}

function mapApiUserToProfile(apiUser: UserProfileResponse): UserProfile {
  return {
    username: apiUser.username,
    avatar: apiUser.avatar,
    level: apiUser.level,
    xp: apiUser.xp,
    xpToNext: apiUser.xpToNext,
    rating: apiUser.rating,
    streak: apiUser.streak,
    bestStreak: apiUser.bestStreak,
    gamesPlayed: apiUser.gamesPlayed,
    puzzlesSolved: apiUser.puzzlesSolved || 0,
    openingsLearned: apiUser.openingsLearned,
    trapsLearned: apiUser.trapsLearned,
    achievements: apiUser.achievements,
    dailyChallengeCompleted: apiUser.dailyChallengeCompleted,
    lastDailyDate: apiUser.lastDailyDate || '',
    joinDate: apiUser.joinDate,
    puzzleRating: apiUser.puzzleRating || 800,
    puzzlesAttempted: apiUser.puzzlesAttempted || 0,
    puzzlesCorrect: apiUser.puzzlesCorrect || 0,
    failedPuzzleThemes: apiUser.failedPuzzleThemes || {},
    combo: 0,
    bestCombo: (apiUser as Record<string, unknown>).bestCombo as number || 0,
    perfectSolves: (apiUser as Record<string, unknown>).perfectSolves as number || 0,
    lastActiveDate: '',
    dailyBonusClaimed: false,
    activityDates: (apiUser as Record<string, unknown>).activityDates as Record<string, number> || {},
    recentGames: (apiUser as Record<string, unknown>).recentGames as UserProfile['recentGames'] || [],
    puzzleRatingHistory: (apiUser as Record<string, unknown>).puzzleRatingHistory as UserProfile['puzzleRatingHistory'] || [],
    weeklyMissions: (apiUser as Record<string, unknown>).weeklyMissions as WeeklyMission[] || [],
  }
}

const STORAGE_KEY = 'chessgrind_profile'

function loadProfileFromStorage(): UserProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as UserProfile
      // Reset transient state
      parsed.combo = 0
      // Only reset dailyBonusClaimed if it's a new day (preserve today's claim)
      const today = new Date().toDateString()
      if (parsed.lastActiveDate !== today) {
        parsed.dailyBonusClaimed = false
      }
      // Ensure new fields exist
      if (!parsed.activityDates) parsed.activityDates = {}
      if (!parsed.recentGames) parsed.recentGames = []
      if (!parsed.puzzleRatingHistory) parsed.puzzleRatingHistory = []
      if (!parsed.weeklyMissions) parsed.weeklyMissions = []
      if (parsed.puzzlesSolved == null) parsed.puzzlesSolved = 0
      if (parsed.puzzlesAttempted == null) parsed.puzzlesAttempted = 0
      if (parsed.puzzlesCorrect == null) parsed.puzzlesCorrect = 0
      // Ensure achievements are full objects (not string IDs)
      if (parsed.achievements && parsed.achievements.length > 0 && typeof parsed.achievements[0] === 'string') {
        const earnedIds = new Set(parsed.achievements as unknown as string[])
        parsed.achievements = ALL_ACHIEVEMENTS.map(a => ({ ...a, earned: earnedIds.has(a.id) }))
      } else if (!parsed.achievements || parsed.achievements.length === 0) {
        parsed.achievements = ALL_ACHIEVEMENTS
      }
      return parsed
    }
  } catch { /* corrupt data — ignore */ }
  return null
}

function saveProfileToStorage(profile: UserProfile) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  } catch { /* storage full — ignore */ }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [xpAnimation, setXPAnimation] = useState({ show: false, amount: 0 })
  const [levelUpAnimation, setLevelUpAnimation] = useState({ show: false, level: 0, title: '' })
  const [achievementAnimation, setAchievementAnimation] = useState<{ show: boolean; achievement: { name: string; icon: string; rarity: string } | null }>({ show: false, achievement: null })
  const [comboAnimation, setComboAnimation] = useState({ show: false, combo: 0, multiplier: 1 })
  const [dailyBonusAnimation, setDailyBonusAnimation] = useState({ show: false, amount: 0, streak: 0 })
  const [perfectSolveAnimation, setPerfectSolveAnimation] = useState({ show: false })
  const [isBackendEnabled, setIsBackendEnabled] = useState(false)
  const [pendingSync, setPendingSync] = useState(false)
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(true) // Default true to avoid flash

  // Detect backend availability on client side
  useEffect(() => {
    setIsBackendEnabled(isBackendConfigured())
  }, [])

  // Load profile from localStorage on mount (local-mode fallback)
  useEffect(() => {
    const saved = loadProfileFromStorage()
    if (saved && saved.username !== 'ChessLearner') {
      setProfile(saved)
      setIsLoggedIn(true)
    }
  }, [])

  // Auto-save profile to localStorage on every change
  useEffect(() => {
    if (isLoggedIn && profile.username !== 'ChessLearner') {
      saveProfileToStorage(profile)
    }
  }, [isLoggedIn, profile])

  // Load onboarding state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('chessgrind_onboarding_seen')
      setHasSeenOnboardingState(seen === 'true')
    }
  }, [])

  const setHasSeenOnboarding = useCallback((seen: boolean) => {
    setHasSeenOnboardingState(seen)
    if (typeof window !== 'undefined') {
      localStorage.setItem('chessgrind_onboarding_seen', String(seen))
    }
  }, [])

  // Check and refresh weekly missions if it's a new week
  useEffect(() => {
    if (!isLoggedIn) return
    const weekStart = getWeekStart()
    setProfile(prev => {
      if (prev.weeklyMissions.length === 0 || prev.weeklyMissions[0].weekStart !== weekStart.toISOString()) {
        return { ...prev, weeklyMissions: generateWeeklyMissions(weekStart) }
      }
      return prev
    })
  }, [isLoggedIn])

  // Check for existing session on mount
  useEffect(() => {
    let mounted = true
    
    const checkSession = async () => {
      if (!isBackendEnabled) {
        if (mounted) setIsLoading(false)
        return
      }

      try {
        const response = await authApi.getSession()
        if (mounted && response.authenticated && response.user) {
          setProfile(mapApiUserToProfile(response.user))
          setIsLoggedIn(true)
        }
      } catch (error) {
        // Backend not available, disable it and allow local mode
        console.warn('Backend not available, using local mode')
        if (mounted) setIsBackendEnabled(false)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    checkSession()
    
    return () => { mounted = false }
  }, []) // Only run on mount

  // Sync to backend when there are pending changes
  const syncToBackend = useCallback(async () => {
    if (!isBackendEnabled || !isLoggedIn) return

    try {
      await userApi.syncProgress({
        xp: profile.xp,
        gamesPlayed: profile.gamesPlayed,
        puzzlesSolved: profile.puzzlesSolved,
        openingsLearned: profile.openingsLearned,
        trapsLearned: profile.trapsLearned,
        achievements: profile.achievements.filter(a => a.earned).map(a => a.id),
        dailyChallengeCompleted: profile.dailyChallengeCompleted,
      })
      setPendingSync(false)
    } catch (error) {
      console.error('Failed to sync to backend:', error)
    }
  }, [isBackendEnabled, isLoggedIn, profile])

  // Auto-sync on changes (debounced)
  useEffect(() => {
    if (!pendingSync || !isBackendEnabled || !isLoggedIn) return

    const timeout = setTimeout(() => {
      syncToBackend()
    }, 2000)

    return () => clearTimeout(timeout)
  }, [pendingSync, syncToBackend, isBackendEnabled, isLoggedIn])

  const register = useCallback(async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null)

    if (!isBackendEnabled) {
      // Local mode: just set username
      setProfile(prev => ({ ...prev, username }))
      setIsLoggedIn(true)
      return { success: true }
    }

    try {
      const response = await authApi.register(username, password)
      if (response.success && response.user) {
        setProfile(mapApiUserToProfile(response.user))
        setIsLoggedIn(true)
        return { success: true }
      }
      return { success: false, error: 'Registration failed' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      setAuthError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [isBackendEnabled])

  const login = useCallback(async (username: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null)

    if (!isBackendEnabled || !password) {
      // Local demo mode: just set username
      setProfile(prev => ({ ...prev, username }))
      setIsLoggedIn(true)
      return { success: true }
    }

    try {
      const response = await authApi.login(username, password)
      if (response.success && response.user) {
        setProfile(mapApiUserToProfile(response.user))
        setIsLoggedIn(true)
        return { success: true }
      }
      return { success: false, error: 'Login failed' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setAuthError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [isBackendEnabled])

  const logout = useCallback(async () => {
    if (isBackendEnabled) {
      try {
        await authApi.logout()
      } catch (error) {
        console.error('Logout error:', error)
      }
    }
    setIsLoggedIn(false)
    setProfile(DEFAULT_PROFILE)
    setAuthError(null)
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY)
  }, [isBackendEnabled])

  const recordActivity = useCallback(() => {
    const today = new Date().toDateString()
    setProfile(prev => {
      const newDates = { ...prev.activityDates }
      const isFirstActivityToday = !newDates[today]
      newDates[today] = (newDates[today] || 0) + 1
      // Increment w-streak mission once per day
      const missions = isFirstActivityToday
        ? prev.weeklyMissions.map(m => {
            if (m.id !== 'w-streak') return m
            const np = Math.min(m.progress + 1, m.target)
            return { ...m, progress: np, completed: np >= m.target }
          })
        : prev.weeklyMissions
      return {
        ...prev,
        activityDates: newDates,
        weeklyMissions: missions,
        lastDailyDate: today,
      }
    })
  }, [])

  const addXP = useCallback((amount: number) => {
    recordActivity()
    setProfile(prev => {
      const newXP = prev.xp + amount
      const oldLevelInfo = getLevelInfo(prev.xp)
      const newLevelInfo = getLevelInfo(newXP)

      // Check for level up
      if (newLevelInfo.currentLevel.level > oldLevelInfo.currentLevel.level) {
        setTimeout(() => {
          setLevelUpAnimation({
            show: true,
            level: newLevelInfo.currentLevel.level,
            title: newLevelInfo.currentLevel.title,
          })
        }, 600)
      }

      const nextLevelData = LEVELS.find(l => l.level === newLevelInfo.currentLevel.level + 1)
      return {
        ...prev,
        xp: newXP,
        level: newLevelInfo.currentLevel.level,
        xpToNext: nextLevelData ? nextLevelData.xpRequired - newXP : 0,
      }
    })
    setXPAnimation({ show: true, amount })
    setTimeout(() => setXPAnimation({ show: false, amount: 0 }), 2000)
    setPendingSync(true)
  }, [])

  const incrementStreak = useCallback(() => {
    setProfile(prev => ({
      ...prev,
      streak: prev.streak + 1,
      bestStreak: Math.max(prev.bestStreak, prev.streak + 1),
    }))
    setPendingSync(true)
  }, [])

  const incrementGamesPlayed = useCallback(() => {
    setProfile(prev => {
      const missions = prev.weeklyMissions.map(m => {
        if (m.id !== 'w-games') return m
        const np = Math.min(m.progress + 1, m.target)
        return { ...m, progress: np, completed: np >= m.target }
      })
      return { ...prev, gamesPlayed: prev.gamesPlayed + 1, weeklyMissions: missions }
    })
    setPendingSync(true)
  }, [])

  const incrementPuzzlesSolved = useCallback(() => {
    setProfile(prev => {
      const missions = prev.weeklyMissions.map(m => {
        if (m.id !== 'w-puzzles') return m
        const np = Math.min(m.progress + 1, m.target)
        return { ...m, progress: np, completed: np >= m.target }
      })
      return { ...prev, puzzlesSolved: prev.puzzlesSolved + 1, weeklyMissions: missions }
    })
    setPendingSync(true)
  }, [])

  const incrementOpeningsLearned = useCallback(() => {
    setProfile(prev => {
      const missions = prev.weeklyMissions.map(m => {
        if (m.id !== 'w-openings') return m
        const np = Math.min(m.progress + 1, m.target)
        return { ...m, progress: np, completed: np >= m.target }
      })
      return { ...prev, openingsLearned: prev.openingsLearned + 1, weeklyMissions: missions }
    })
    setPendingSync(true)
  }, [])

  const incrementTrapsLearned = useCallback(() => {
    setProfile(prev => ({ ...prev, trapsLearned: prev.trapsLearned + 1 }))
    setPendingSync(true)
  }, [])

  const completeDaily = useCallback(() => {
    const today = new Date().toDateString()
    setProfile(prev => ({ 
      ...prev, 
      dailyChallengeCompleted: true,
      lastDailyDate: today,
    }))
    setPendingSync(true)
  }, [])

  const checkAndUpdateStreak = useCallback(() => {
    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    
    setProfile(prev => {
      if (prev.lastDailyDate === today) {
        return prev // Already updated today
      }
      if (prev.lastDailyDate === yesterday) {
        // Continuing streak
        return {
          ...prev,
          streak: prev.streak + 1,
          bestStreak: Math.max(prev.bestStreak, prev.streak + 1),
          dailyChallengeCompleted: false,
        }
      }
      // Streak broken
      return {
        ...prev,
        streak: 0,
        dailyChallengeCompleted: false,
      }
    })
  }, [])

  const earnAchievement = useCallback((id: string) => {
    setProfile(prev => {
      const achievement = prev.achievements.find(a => a.id === id)
      if (!achievement || achievement.earned) return prev
      
      // Show achievement animation
      setTimeout(() => {
        setAchievementAnimation({
          show: true,
          achievement: { name: achievement.name, icon: achievement.icon, rarity: achievement.rarity },
        })
        setTimeout(() => setAchievementAnimation({ show: false, achievement: null }), 3000)
      }, 500)
      
      return {
        ...prev,
        achievements: prev.achievements.map(a =>
          a.id === id ? { ...a, earned: true, earnedDate: new Date().toISOString() } : a
        ),
      }
    })
    setPendingSync(true)
  }, [])

  const updateAchievementProgress = useCallback((id: string, progress: number) => {
    setProfile(prev => {
      const achievement = prev.achievements.find(a => a.id === id)
      if (!achievement || achievement.earned) return prev
      
      const newProgress = Math.max(achievement.progress || 0, progress)
      const shouldEarn = achievement.target && newProgress >= achievement.target
      
      if (shouldEarn) {
        setTimeout(() => {
          setAchievementAnimation({
            show: true,
            achievement: { name: achievement.name, icon: achievement.icon, rarity: achievement.rarity },
          })
          setTimeout(() => setAchievementAnimation({ show: false, achievement: null }), 3000)
        }, 500)
      }
      
      return {
        ...prev,
        achievements: prev.achievements.map(a =>
          a.id === id 
            ? { 
                ...a, 
                progress: newProgress, 
                earned: shouldEarn || a.earned,
                earnedDate: shouldEarn ? new Date().toISOString() : a.earnedDate,
              } 
            : a
        ),
      }
    })
    setPendingSync(true)
  }, [])

  const updatePuzzleRating = useCallback((puzzleRating: number, solved: boolean, timeSeconds: number) => {
    setProfile(prev => {
      const newRating = calculatePuzzleRating(prev.puzzleRating, puzzleRating, solved, timeSeconds)
      const newHistory = [...prev.puzzleRatingHistory, { date: new Date().toISOString(), rating: newRating }]
      return {
        ...prev,
        puzzleRating: newRating,
        puzzlesAttempted: prev.puzzlesAttempted + 1,
        puzzlesCorrect: solved ? prev.puzzlesCorrect + 1 : prev.puzzlesCorrect,
        puzzleRatingHistory: newHistory.slice(-100),
      }
    })
    setPendingSync(true)
  }, [])

  const trackPuzzleFailure = useCallback((themes: string[]) => {
    setProfile(prev => {
      const updated = { ...prev.failedPuzzleThemes }
      themes.forEach(t => {
        updated[t] = (updated[t] || 0) + 1
      })
      return { ...prev, failedPuzzleThemes: updated }
    })
  }, [])

  const addRecentGame = useCallback((game: { id: string; date: string; result: 'win' | 'loss' | 'draw'; opponent: string; moves: number; pgn?: string }) => {
    setProfile(prev => ({
      ...prev,
      recentGames: [game, ...prev.recentGames].slice(0, 10),
    }))
    setPendingSync(true)
  }, [])

  const updateWeeklyMission = useCallback((id: string, increment: number) => {
    setProfile(prev => {
      const missions = prev.weeklyMissions.map(m => {
        if (m.id !== id) return m
        const newProgress = Math.min(m.progress + increment, m.target)
        return { ...m, progress: newProgress, completed: newProgress >= m.target }
      })
      return { ...prev, weeklyMissions: missions }
    })
    setPendingSync(true)
  }, [])

  const dismissXPAnimation = useCallback(() => setXPAnimation({ show: false, amount: 0 }), [])
  const dismissLevelUp = useCallback(() => setLevelUpAnimation({ show: false, level: 0, title: '' }), [])
  const dismissAchievement = useCallback(() => setAchievementAnimation({ show: false, achievement: null }), [])
  const dismissComboAnimation = useCallback(() => setComboAnimation({ show: false, combo: 0, multiplier: 1 }), [])
  const dismissDailyBonus = useCallback(() => setDailyBonusAnimation({ show: false, amount: 0, streak: 0 }), [])
  const dismissPerfectSolve = useCallback(() => setPerfectSolveAnimation({ show: false }), [])

  // Increment combo on correct puzzle solve, returns XP multiplier
  const incrementCombo = useCallback((): number => {
    let currentCombo = 0
    setProfile(prev => {
      currentCombo = prev.combo
      const newCombo = prev.combo + 1
      const mult = getComboMultiplier(newCombo)
      // Show combo overlay, auto-dismiss after 1.8s
      setComboAnimation({ show: true, combo: newCombo, multiplier: mult })
      setTimeout(() => setComboAnimation(prev => prev.combo === newCombo ? { show: false, combo: 0, multiplier: 1 } : prev), 1800)
      return {
        ...prev,
        combo: newCombo,
        bestCombo: Math.max(prev.bestCombo, newCombo),
      }
    })
    const newCombo = currentCombo + 1
    // Track combo achievements
    if (newCombo >= 5) updateAchievementProgress('combo-5', newCombo)
    if (newCombo >= 10) updateAchievementProgress('combo-10', newCombo)
    return getComboMultiplier(newCombo)
  }, [updateAchievementProgress])

  const resetCombo = useCallback(() => {
    setProfile(prev => ({ ...prev, combo: 0 }))
  }, [])

  const recordPerfectSolve = useCallback(() => {
    // Delay perfect solve flash so it doesn't overlap with combo overlay
    setTimeout(() => {
      setPerfectSolveAnimation({ show: true })
      setTimeout(() => setPerfectSolveAnimation({ show: false }), 1500)
    }, 600)
    setProfile(prev => {
      const newCount = prev.perfectSolves + 1
      setTimeout(() => updateAchievementProgress('perfect-10', newCount), 300)
      return { ...prev, perfectSolves: newCount }
    })
    setPendingSync(true)
  }, [updateAchievementProgress])

  // Claim daily bonus XP, returns amount awarded
  const claimDailyBonus = useCallback((): number => {
    const today = new Date().toDateString()
    let bonusAmount = 0
    let shouldAward = false
    setProfile(prev => {
      if (prev.dailyBonusClaimed && prev.lastActiveDate === today) return prev
      bonusAmount = getDailyBonusXP(prev.streak)
      shouldAward = true
      setDailyBonusAnimation({ show: true, amount: bonusAmount, streak: prev.streak })
      return {
        ...prev,
        dailyBonusClaimed: true,
        lastActiveDate: today,
      }
    })
    // Use shouldAward flag since bonusAmount is set synchronously inside updater
    if (shouldAward && bonusAmount > 0) {
      setTimeout(() => addXP(bonusAmount), 800)
    }
    return bonusAmount
  }, [addXP])

  return (
    <GameContext.Provider
      value={{
        profile,
        isLoggedIn,
        isLoading,
        authError,
        login,
        register,
        logout,
        addXP,
        incrementStreak,
        incrementGamesPlayed,
        incrementPuzzlesSolved,
        incrementOpeningsLearned,
        incrementTrapsLearned,
        completeDaily,
        earnAchievement,
        updateAchievementProgress,
        updatePuzzleRating,
        trackPuzzleFailure,
        checkAndUpdateStreak,
        incrementCombo,
        resetCombo,
        recordPerfectSolve,
        claimDailyBonus,
        xpAnimation,
        levelUpAnimation,
        achievementAnimation,
        comboAnimation,
        dailyBonusAnimation,
        perfectSolveAnimation,
        dismissXPAnimation,
        dismissLevelUp,
        dismissAchievement,
        dismissComboAnimation,
        dismissDailyBonus,
        dismissPerfectSolve,
        syncToBackend,
        isBackendEnabled,
        hasSeenOnboarding,
        setHasSeenOnboarding,
        recordActivity,
        addRecentGame,
        updateWeeklyMission,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) throw new Error('useGame must be used within a GameProvider')
  return context
}

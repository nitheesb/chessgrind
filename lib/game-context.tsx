'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { type UserProfile, DEFAULT_PROFILE, getLevelInfo, LEVELS, ALL_ACHIEVEMENTS, calculatePuzzleRating } from './chess-store'
import { authApi, userApi, type UserProfileResponse } from './api-client'

interface GameContextType {
  profile: UserProfile
  isLoggedIn: boolean
  isLoading: boolean
  authError: string | null
  login: (username: string, password?: string) => Promise<boolean>
  register: (username: string, password: string) => Promise<boolean>
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
  checkAndUpdateStreak: () => void
  xpAnimation: { show: boolean; amount: number }
  levelUpAnimation: { show: boolean; level: number; title: string }
  achievementAnimation: { show: boolean; achievement: { name: string; icon: string; rarity: string } | null }
  dismissXPAnimation: () => void
  dismissLevelUp: () => void
  dismissAchievement: () => void
  syncToBackend: () => Promise<void>
  isBackendEnabled: boolean
  hasSeenOnboarding: boolean
  setHasSeenOnboarding: (seen: boolean) => void
}

const GameContext = createContext<GameContextType | null>(null)

// Check if backend is configured
const isBackendConfigured = () => {
  // On Vercel deployment, backend should be available
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
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
    puzzlesSolved: apiUser.puzzlesSolved,
    openingsLearned: apiUser.openingsLearned,
    trapsLearned: apiUser.trapsLearned,
    achievements: apiUser.achievements,
    dailyChallengeCompleted: apiUser.dailyChallengeCompleted,
    lastDailyDate: apiUser.lastDailyDate || '',
    joinDate: apiUser.joinDate,
    puzzleRating: apiUser.puzzleRating || 800,
    puzzlesAttempted: apiUser.puzzlesAttempted || 0,
    puzzlesCorrect: apiUser.puzzlesCorrect || 0,
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [xpAnimation, setXPAnimation] = useState({ show: false, amount: 0 })
  const [levelUpAnimation, setLevelUpAnimation] = useState({ show: false, level: 0, title: '' })
  const [achievementAnimation, setAchievementAnimation] = useState<{ show: boolean; achievement: { name: string; icon: string; rarity: string } | null }>({ show: false, achievement: null })
  const [isBackendEnabled, setIsBackendEnabled] = useState(isBackendConfigured())
  const [pendingSync, setPendingSync] = useState(false)
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(true) // Default true to avoid flash

  // Load onboarding state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const seen = localStorage.getItem('chessvault_onboarding_seen')
      setHasSeenOnboardingState(seen === 'true')
    }
  }, [])

  const setHasSeenOnboarding = useCallback((seen: boolean) => {
    setHasSeenOnboardingState(seen)
    if (typeof window !== 'undefined') {
      localStorage.setItem('chessvault_onboarding_seen', String(seen))
    }
  }, [])

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

  const register = useCallback(async (username: string, password: string): Promise<boolean> => {
    setAuthError(null)

    if (!isBackendEnabled) {
      // Local mode: just set username
      setProfile(prev => ({ ...prev, username }))
      setIsLoggedIn(true)
      return true
    }

    try {
      const response = await authApi.register(username, password)
      if (response.success && response.user) {
        setProfile(mapApiUserToProfile(response.user))
        setIsLoggedIn(true)
        return true
      }
      return false
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Registration failed')
      return false
    }
  }, [isBackendEnabled])

  const login = useCallback(async (username: string, password?: string): Promise<boolean> => {
    setAuthError(null)

    if (!isBackendEnabled || !password) {
      // Local demo mode: just set username
      setProfile(prev => ({ ...prev, username }))
      setIsLoggedIn(true)
      return true
    }

    try {
      const response = await authApi.login(username, password)
      if (response.success && response.user) {
        setProfile(mapApiUserToProfile(response.user))
        setIsLoggedIn(true)
        return true
      }
      return false
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Login failed')
      return false
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
  }, [isBackendEnabled])

  const addXP = useCallback((amount: number) => {
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
    setProfile(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }))
    setPendingSync(true)
  }, [])

  const incrementPuzzlesSolved = useCallback(() => {
    setProfile(prev => ({ ...prev, puzzlesSolved: prev.puzzlesSolved + 1 }))
    setPendingSync(true)
  }, [])

  const incrementOpeningsLearned = useCallback(() => {
    setProfile(prev => ({ ...prev, openingsLearned: prev.openingsLearned + 1 }))
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
      return {
        ...prev,
        puzzleRating: newRating,
        puzzlesAttempted: prev.puzzlesAttempted + 1,
        puzzlesCorrect: solved ? prev.puzzlesCorrect + 1 : prev.puzzlesCorrect,
      }
    })
    setPendingSync(true)
  }, [])

  const dismissXPAnimation = useCallback(() => setXPAnimation({ show: false, amount: 0 }), [])
  const dismissLevelUp = useCallback(() => setLevelUpAnimation({ show: false, level: 0, title: '' }), [])
  const dismissAchievement = useCallback(() => setAchievementAnimation({ show: false, achievement: null }), [])

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
        checkAndUpdateStreak,
        xpAnimation,
        levelUpAnimation,
        achievementAnimation,
        dismissXPAnimation,
        dismissLevelUp,
        dismissAchievement,
        syncToBackend,
        isBackendEnabled,
        hasSeenOnboarding,
        setHasSeenOnboarding,
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

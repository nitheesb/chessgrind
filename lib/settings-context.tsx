'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { setLichessToken } from './lichess-api'

export type CoachMode = 'off' | 'hints' | 'full'

export interface AppSettings {
  soundEnabled: boolean
  hapticEnabled: boolean
  showCoordinates: boolean
  autoQueen: boolean
  showHints: boolean
  theme: 'dark' | 'light' | 'system'
  pieceStyle: 'neo' | 'classic'
  boardStyle: 'green' | 'brown' | 'blue' | 'purple' | 'pink' | 'tournament' | 'ocean'
  reducedMotion: boolean
  blindfoldMode: boolean
  zenMode: boolean
  lichessToken: string
  lichessUsername: string
  coachMode: CoachMode
  blunderCheck: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  hapticEnabled: true,
  showCoordinates: true,
  autoQueen: true,
  showHints: true,
  theme: 'dark',
  pieceStyle: 'neo',
  boardStyle: 'green',
  reducedMotion: false,
  blindfoldMode: false,
  zenMode: false,
  lichessToken: '',
  lichessUsername: '',
  coachMode: 'off',
  blunderCheck: true,
}

interface SettingsContextType {
  settings: AppSettings
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextType | null>(null)

const STORAGE_KEY = 'chessgrind_settings'

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [loaded, setLoaded] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Migrate stale pieceStyle values to valid options
        if (parsed.pieceStyle && parsed.pieceStyle !== 'neo' && parsed.pieceStyle !== 'classic') {
          parsed.pieceStyle = 'neo'
        }
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      }
    } catch { }
    setLoaded(true)
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    if (!loaded || typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch { }
  }, [settings, loaded])

  // Apply theme class to html element, listen for system theme changes
  useEffect(() => {
    if (!loaded) return
    const root = document.documentElement

    const applyTheme = (prefersDark: boolean) => {
      if (settings.theme === 'dark' || (settings.theme === 'system' && prefersDark)) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    applyTheme(mql.matches)

    if (settings.theme === 'system') {
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches)
      mql.addEventListener('change', handler)
      return () => mql.removeEventListener('change', handler)
    }
  }, [settings.theme, loaded])

  // Apply reduced-motion class to html element
  useEffect(() => {
    if (!loaded) return
    const root = document.documentElement
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }
  }, [settings.reducedMotion, loaded])

  // Apply zen-mode class to html element
  useEffect(() => {
    if (!loaded) return
    const root = document.documentElement
    if (settings.zenMode) {
      root.classList.add('zen-mode')
    } else {
      root.classList.remove('zen-mode')
    }
  }, [settings.zenMode, loaded])

  // Sync Lichess token to API client
  useEffect(() => {
    if (loaded && settings.lichessToken) {
      setLichessToken(settings.lichessToken)
    }
  }, [settings.lichessToken, loaded])

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used within SettingsProvider')
  return context
}

'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export interface AppSettings {
  soundEnabled: boolean
  hapticEnabled: boolean
  showCoordinates: boolean
  autoQueen: boolean
  showHints: boolean
  theme: 'dark' | 'light' | 'system'
  pieceStyle: 'standard' | 'neo' | 'classic' | 'minimal' | 'pink'
  boardStyle: 'green' | 'brown' | 'blue' | 'purple' | 'pink' | 'tournament' | 'ocean'
  reducedMotion: boolean
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

  // Apply theme class to html element
  useEffect(() => {
    if (!loaded) return
    const root = document.documentElement
    if (settings.theme === 'dark') {
      root.classList.add('dark')
    } else if (settings.theme === 'light') {
      root.classList.remove('dark')
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) root.classList.add('dark')
      else root.classList.remove('dark')
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

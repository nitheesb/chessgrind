'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/lib/game-context'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import { LoginPage } from '@/components/pages/login'
import { Dashboard } from '@/components/pages/dashboard'
import { OpeningsPage } from '@/components/pages/openings'
import { PuzzlesPage } from '@/components/pages/puzzles'
import { PlayAIPage } from '@/components/pages/play-ai'
import { TrapsPage } from '@/components/pages/traps'
import { ProfilePage } from '@/components/pages/profile'
import { SettingsPage } from '@/components/pages/settings'
import { XPPopup, LevelUpOverlay } from '@/components/ui/xp-animations'
import { AchievementPopup } from '@/components/ui/achievement-popup'
import { SplashScreen } from '@/components/ui/splash-screen'
import {
  Home,
  Puzzle,
  BookOpen,
  Swords,
  Target,
  User,
} from 'lucide-react'

type Page = 'dashboard' | 'puzzles' | 'openings' | 'play' | 'traps' | 'profile' | 'settings'

interface NavItem {
  id: Page
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { id: 'puzzles', label: 'Puzzles', icon: <Puzzle className="w-5 h-5" /> },
  { id: 'openings', label: 'Learn', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'play', label: 'Play', icon: <Swords className="w-5 h-5" /> },
  { id: 'traps', label: 'Traps', icon: <Target className="w-5 h-5" /> },
]

export function AppShell() {
  const { 
    isLoggedIn, 
    achievementAnimation, 
    dismissAchievement,
    checkAndUpdateStreak,
  } = useGame()
  const { playSound, triggerHaptic } = useSoundAndHaptics()
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    checkAndUpdateStreak()
  }, [checkAndUpdateStreak])

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false)
  }, [])

  const handleNavigate = useCallback((page: string) => {
    playSound('click')
    triggerHaptic('selection')
    setCurrentPage(page as Page)
  }, [playSound, triggerHaptic])

  const handleBack = useCallback(() => {
    playSound('click')
    triggerHaptic('light')
    setCurrentPage('dashboard')
  }, [playSound, triggerHaptic])

  const handleNavClick = useCallback((pageId: Page) => {
    playSound('click')
    triggerHaptic('selection')
    setCurrentPage(pageId)
  }, [playSound, triggerHaptic])

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  if (!isLoggedIn) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Global overlays */}
      <XPPopup />
      <LevelUpOverlay />
      <AchievementPopup
        show={achievementAnimation.show}
        achievement={achievementAnimation.achievement}
        onDismiss={dismissAchievement}
      />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-20">
        <AnimatePresence mode="wait" initial={false}>
          {currentPage === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <Dashboard onNavigate={handleNavigate} />
            </motion.div>
          )}
          {currentPage === 'puzzles' && (
            <motion.div
              key="puzzles"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <PuzzlesPage onBack={handleBack} />
            </motion.div>
          )}
          {currentPage === 'openings' && (
            <motion.div
              key="openings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <OpeningsPage onBack={handleBack} />
            </motion.div>
          )}
          {currentPage === 'play' && (
            <motion.div
              key="play"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <PlayAIPage onBack={handleBack} />
            </motion.div>
          )}
          {currentPage === 'traps' && (
            <motion.div
              key="traps"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <TrapsPage onBack={handleBack} />
            </motion.div>
          )}
          {currentPage === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <ProfilePage onBack={handleBack} onNavigate={handleNavigate} />
            </motion.div>
          )}
          {currentPage === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <SettingsPage onBack={handleBack} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border safe-bottom">
        <div className="max-w-lg mx-auto flex items-stretch justify-around">
          {NAV_ITEMS.map((navItem) => {
            const isActive = currentPage === navItem.id
            return (
              <button
                key={navItem.id}
                onClick={() => handleNavClick(navItem.id)}
                className={`relative flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.span 
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  {navItem.icon}
                </motion.span>
                <span className="text-[10px] font-medium">{navItem.label}</span>
              </button>
            )
          })}
          <button
            onClick={() => handleNavClick('profile')}
            className={`relative flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors ${
              currentPage === 'profile' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {currentPage === 'profile' && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full bg-primary"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <motion.span 
              animate={{ scale: currentPage === 'profile' ? 1.1 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <User className="w-5 h-5" />
            </motion.span>
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

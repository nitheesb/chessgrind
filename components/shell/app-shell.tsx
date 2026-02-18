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
import { Onboarding } from '@/components/ui/onboarding'
import {
  Home,
  Puzzle,
  BookOpen,
  Swords,
  Target,
  User,
  Settings,
} from 'lucide-react'

type Page = 'dashboard' | 'puzzles' | 'openings' | 'play' | 'traps' | 'profile' | 'settings'

interface NavItem {
  id: Page
  label: string
  icon: React.ReactNode
  activeIcon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Home',
    icon: <Home className="w-5 h-5" />,
    activeIcon: <Home className="w-5 h-5" />,
  },
  {
    id: 'puzzles',
    label: 'Puzzles',
    icon: <Puzzle className="w-5 h-5" />,
    activeIcon: <Puzzle className="w-5 h-5" />,
  },
  {
    id: 'openings',
    label: 'Learn',
    icon: <BookOpen className="w-5 h-5" />,
    activeIcon: <BookOpen className="w-5 h-5" />,
  },
  {
    id: 'play',
    label: 'Play',
    icon: <Swords className="w-5 h-5" />,
    activeIcon: <Swords className="w-5 h-5" />,
  },
  {
    id: 'traps',
    label: 'Traps',
    icon: <Target className="w-5 h-5" />,
    activeIcon: <Target className="w-5 h-5" />,
  },
]

export function AppShell() {
  const { 
    isLoggedIn, 
    achievementAnimation, 
    dismissAchievement,
    hasSeenOnboarding,
    setHasSeenOnboarding,
    checkAndUpdateStreak,
  } = useGame()
  const { playSound, triggerHaptic } = useSoundAndHaptics()
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [showSplash, setShowSplash] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Check streak on mount
  useEffect(() => {
    checkAndUpdateStreak()
  }, [checkAndUpdateStreak])

  // Show onboarding after splash for first-time users
  const handleSplashComplete = useCallback(() => {
    setShowSplash(false)
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
  }, [hasSeenOnboarding])

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false)
    setHasSeenOnboarding(true)
  }, [setHasSeenOnboarding])

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

  // Splash screen
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  // Onboarding
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
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
      <main className="flex-1 overflow-y-auto px-5 pt-4 pb-24">
        <AnimatePresence mode="wait">
          {currentPage === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Dashboard onNavigate={handleNavigate} />
            </motion.div>
          )}
          {currentPage === 'puzzles' && (
            <motion.div
              key="puzzles"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <PuzzlesPage onBack={handleBack} />
            </motion.div>
          )}
          {currentPage === 'openings' && (
            <motion.div
              key="openings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <OpeningsPage onBack={handleBack} />
            </motion.div>
          )}
          {currentPage === 'play' && (
            <motion.div
              key="play"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <PlayAIPage onBack={handleBack} />
            </motion.div>
          )}
          {currentPage === 'traps' && (
            <motion.div
              key="traps"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <TrapsPage onBack={handleBack} />
            </motion.div>
          )}
          {currentPage === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ProfilePage onBack={handleBack} onNavigate={handleNavigate} />
            </motion.div>
          )}
          {currentPage === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SettingsPage onBack={handleBack} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border/50 safe-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-around px-2 pt-2 pb-1">
          {NAV_ITEMS.map((navItem) => {
            const isActive = currentPage === navItem.id
            return (
              <button
                key={navItem.id}
                onClick={() => handleNavClick(navItem.id)}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-2 w-8 h-0.5 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                  {isActive ? navItem.activeIcon : navItem.icon}
                </span>
                <span className={`text-[10px] font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {navItem.label}
                </span>
              </button>
            )
          })}
          {/* Profile button */}
          <button
            onClick={() => handleNavClick('profile')}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              currentPage === 'profile' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {currentPage === 'profile' && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute -top-2 w-8 h-0.5 rounded-full bg-primary"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <User className="w-5 h-5" />
            <span className={`text-[10px] font-medium ${currentPage === 'profile' ? 'text-primary' : 'text-muted-foreground'}`}>
              Profile
            </span>
          </button>
        </div>
      </nav>
    </div>
  )
}

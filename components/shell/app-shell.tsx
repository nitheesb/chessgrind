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

const NAV_ORDER: Page[] = ['dashboard', 'puzzles', 'openings', 'play', 'traps', 'profile', 'settings']

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
          <motion.div
            key={currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.2, 0, 0, 1] }}
          >
            {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
            {currentPage === 'puzzles' && <PuzzlesPage onBack={handleBack} />}
            {currentPage === 'openings' && <OpeningsPage onBack={handleBack} />}
            {currentPage === 'play' && <PlayAIPage onBack={handleBack} />}
            {currentPage === 'traps' && <TrapsPage onBack={handleBack} />}
            {currentPage === 'profile' && <ProfilePage onBack={handleBack} onNavigate={handleNavigate} />}
            {currentPage === 'settings' && <SettingsPage onBack={handleBack} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar — Apple Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
        style={{
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderTop: '0.5px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div className="max-w-lg mx-auto flex items-stretch justify-around">
          {NAV_ITEMS.map((navItem) => {
            const isActive = currentPage === navItem.id
            return (
              <button
                key={navItem.id}
                onClick={() => handleNavClick(navItem.id)}
                className={`relative flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors duration-200 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[2px] rounded-full bg-primary"
                    transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
                  />
                )}
                <span className="transition-transform duration-200" style={{ transform: isActive ? 'scale(1.08)' : 'scale(1)' }}>
                  {navItem.icon}
                </span>
                <span className="text-[10px] font-medium">{navItem.label}</span>
              </button>
            )
          })}
          <button
            onClick={() => handleNavClick('profile')}
            className={`relative flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors duration-200 ${
              currentPage === 'profile' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {currentPage === 'profile' && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[2px] rounded-full bg-primary"
                transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
              />
            )}
            <span className="transition-transform duration-200" style={{ transform: currentPage === 'profile' ? 'scale(1.08)' : 'scale(1)' }}>
              <User className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

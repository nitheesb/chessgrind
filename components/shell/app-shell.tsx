'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
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

const pageVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction * 40,
  }),
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * -40,
  }),
}

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
  const directionRef = useRef(0)

  useEffect(() => {
    checkAndUpdateStreak()
  }, [checkAndUpdateStreak])

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false)
  }, [])

  const handleNavigate = useCallback((page: string) => {
    playSound('click')
    triggerHaptic('selection')
    setCurrentPage(prev => {
      directionRef.current = NAV_ORDER.indexOf(page as Page) >= NAV_ORDER.indexOf(prev) ? 1 : -1
      return page as Page
    })
  }, [playSound, triggerHaptic])

  const handleBack = useCallback(() => {
    playSound('click')
    triggerHaptic('light')
    setCurrentPage(prev => {
      directionRef.current = -1
      return 'dashboard'
    })
  }, [playSound, triggerHaptic])

  const handleNavClick = useCallback((pageId: Page) => {
    playSound('click')
    triggerHaptic('selection')
    setCurrentPage(prev => {
      directionRef.current = NAV_ORDER.indexOf(pageId) >= NAV_ORDER.indexOf(prev) ? 1 : -1
      return pageId
    })
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
        <AnimatePresence mode="wait" initial={false} custom={directionRef.current}>
          <motion.div
            key={currentPage}
            custom={directionRef.current}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
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

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border safe-bottom overflow-hidden">
        {/* Animated gradient top border */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px] animate-gradient"
          style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.6), transparent)', backgroundSize: '300% 100%' }}
        />
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
                <div className="relative">
                  {isActive && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary/20 blur-md" />
                  )}
                  <motion.span
                    className="relative"
                    animate={{ scale: isActive ? 1.15 : 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  >
                    {navItem.icon}
                  </motion.span>
                </div>
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
            <div className="relative">
              {currentPage === 'profile' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary/20 blur-md" />
              )}
              <motion.span
                className="relative"
                animate={{ scale: currentPage === 'profile' ? 1.15 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <User className="w-5 h-5" />
              </motion.span>
            </div>
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

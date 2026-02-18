'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/lib/game-context'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
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
  Settings,
  LogOut,
  Crown,
  Trophy,
  Flame,
} from 'lucide-react'

// Desktop pages
import { DesktopDashboard } from '@/components/desktop/dashboard'
import { DesktopPuzzles } from '@/components/desktop/puzzles'
import { DesktopOpenings } from '@/components/desktop/openings'
import { DesktopPlayAI } from '@/components/desktop/play-ai'
import { DesktopTraps } from '@/components/desktop/traps'
import { DesktopProfile } from '@/components/desktop/profile'
import { DesktopSettings } from '@/components/desktop/settings'
import { DesktopLogin } from '@/components/desktop/login'

type Page = 'dashboard' | 'puzzles' | 'openings' | 'play' | 'traps' | 'profile' | 'settings'

interface NavItem {
  id: Page
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
  { id: 'puzzles', label: 'Puzzles', icon: <Puzzle className="w-5 h-5" /> },
  { id: 'openings', label: 'Openings', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'play', label: 'Play AI', icon: <Swords className="w-5 h-5" /> },
  { id: 'traps', label: 'Traps', icon: <Target className="w-5 h-5" /> },
]

const SECONDARY_NAV: NavItem[] = [
  { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
]

export function DesktopShell() {
  const {
    isLoggedIn,
    profile,
    logout,
    achievementAnimation,
    dismissAchievement,
    checkAndUpdateStreak,
  } = useGame()
  const { playSound } = useSoundAndHaptics()
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')
  const [showSplash, setShowSplash] = useState(true)
  const [sidebarHovered, setSidebarHovered] = useState(false)

  useEffect(() => {
    checkAndUpdateStreak()
  }, [checkAndUpdateStreak])

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false)
  }, [])

  const handleNavigate = useCallback((page: string) => {
    playSound('click')
    setCurrentPage(page as Page)
  }, [playSound])

  const handleLogout = useCallback(() => {
    playSound('click')
    logout()
  }, [playSound, logout])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case '1': e.preventDefault(); handleNavigate('dashboard'); break
          case '2': e.preventDefault(); handleNavigate('puzzles'); break
          case '3': e.preventDefault(); handleNavigate('openings'); break
          case '4': e.preventDefault(); handleNavigate('play'); break
          case '5': e.preventDefault(); handleNavigate('traps'); break
        }
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [handleNavigate])

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  if (!isLoggedIn) {
    return <DesktopLogin />
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Global overlays */}
      <XPPopup />
      <LevelUpOverlay />
      <AchievementPopup
        show={achievementAnimation.show}
        achievement={achievementAnimation.achievement}
        onDismiss={dismissAchievement}
      />

      {/* Sidebar */}
      <motion.aside
        className="fixed left-0 top-0 bottom-0 z-40 bg-card/95 backdrop-blur-xl border-r border-border/50 flex flex-col"
        initial={{ width: 72 }}
        animate={{ width: sidebarHovered ? 240 : 72 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border/50">
          <motion.div
            className="flex items-center gap-3"
            initial={false}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <AnimatePresence>
              {sidebarHovered && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-bold text-lg text-foreground whitespace-nowrap"
                >
                  ChessVault
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* User Stats Summary */}
        <div className="px-3 py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <span className="text-sm font-bold text-primary">{profile?.level || 1}</span>
            </div>
            <AnimatePresence>
              {sidebarHovered && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-foreground truncate">{profile?.username || 'Player'}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      {profile?.streak || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-500" />
                      {profile?.puzzleRating || 800}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-hidden">
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.id
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktop-nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className={`flex-shrink-0 ${isActive ? 'text-primary' : ''}`}>
                  {item.icon}
                </span>
                <AnimatePresence>
                  {sidebarHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex-1 text-left min-w-0"
                    >
                      <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </nav>

        {/* Secondary Navigation */}
        <div className="py-4 px-2 border-t border-border/50 space-y-1">
          {SECONDARY_NAV.map((item) => {
            const isActive = currentPage === item.id
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {item.icon}
                <AnimatePresence>
                  {sidebarHovered && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}

          {/* Logout button */}
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-5 h-5" />
            <AnimatePresence>
              {sidebarHovered && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main 
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: sidebarHovered ? 240 : 72 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="min-h-screen"
          >
            {currentPage === 'dashboard' && <DesktopDashboard onNavigate={handleNavigate} />}
            {currentPage === 'puzzles' && <DesktopPuzzles onNavigate={handleNavigate} />}
            {currentPage === 'openings' && <DesktopOpenings onNavigate={handleNavigate} />}
            {currentPage === 'play' && <DesktopPlayAI onNavigate={handleNavigate} />}
            {currentPage === 'traps' && <DesktopTraps onNavigate={handleNavigate} />}
            {currentPage === 'profile' && <DesktopProfile onNavigate={handleNavigate} />}
            {currentPage === 'settings' && <DesktopSettings onNavigate={handleNavigate} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

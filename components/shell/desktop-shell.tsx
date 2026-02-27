'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/lib/game-context'
import { getLevelInfo } from '@/lib/chess-store'
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
  Zap,
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

const NAV_ORDER: Page[] = ['dashboard', 'puzzles', 'openings', 'play', 'traps', 'profile', 'settings']

const desktopPageVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction * 60,
    scale: 0.98,
  }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * -60,
    scale: 0.98,
  }),
}

function NavTooltip({ label, show }: { label: string; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="sidebar-tooltip"
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -4 }}
          transition={{ duration: 0.15 }}
        >
          {label}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

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
  const [hoveredNavItem, setHoveredNavItem] = useState<string | null>(null)
  const directionRef = useRef(0)
  const { currentLevel, progress } = getLevelInfo(profile.xp)

  useEffect(() => {
    checkAndUpdateStreak()
  }, [checkAndUpdateStreak])

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false)
  }, [])

  const handleNavigate = useCallback((page: string) => {
    playSound('click')
    setCurrentPage(prev => {
      directionRef.current = NAV_ORDER.indexOf(page as Page) >= NAV_ORDER.indexOf(prev) ? 1 : -1
      return page as Page
    })
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
    <div className="min-h-screen flex bg-background relative">
      {/* Ambient background effects */}
      <div className="ambient-bg" />
      <div className="noise-overlay" />

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
        className="fixed left-0 top-0 bottom-0 z-40 flex flex-col"
        initial={{ width: 72 }}
        animate={{ width: sidebarHovered ? 260 : 72 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => { setSidebarHovered(false); setHoveredNavItem(null) }}
        style={{
          background: 'linear-gradient(180deg, hsl(222 22% 6%) 0%, hsl(222 22% 5%) 100%)',
          borderRight: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/[0.04]">
          <motion.div
            className="flex items-center gap-3"
            initial={false}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 relative overflow-hidden">
              <Crown className="w-6 h-6 text-white relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-600/50 to-transparent" />
            </div>
            <AnimatePresence>
              {sidebarHovered && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="font-display font-bold text-lg text-foreground whitespace-nowrap"
                >
                  ChessVault
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* User Stats Summary */}
        <div className="px-3 py-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 relative">
              <span className="text-sm font-bold text-primary">{profile?.level || 1}</span>
              {/* Subtle glow ring */}
              <div className="absolute inset-0 rounded-full animate-glow-pulse" />
            </div>
            <AnimatePresence>
              {sidebarHovered && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-foreground truncate">{profile?.username || 'Player'}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      {profile?.streak || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-500" />
                      {profile?.puzzleRating || 800}
                    </span>
                  </div>
                  {/* Mini XP bar */}
                  <div className="mt-2 h-1.5 rounded-full xp-bar-track overflow-hidden">
                    <motion.div
                      className="h-full rounded-full xp-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Lv.{currentLevel.level} {currentLevel.title}
                  </p>
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
                onMouseEnter={() => !sidebarHovered && setHoveredNavItem(item.id)}
                onMouseLeave={() => setHoveredNavItem(null)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'
                  }`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktop-nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-gradient-to-b from-primary to-emerald-400 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    style={{ boxShadow: '0 0 12px rgba(34, 197, 94, 0.4)' }}
                  />
                )}
                <span className={`relative flex-shrink-0 transition-transform duration-200 ${isActive ? 'text-primary' : 'group-hover:scale-110'}`}>
                  {isActive && (
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full"
                      style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)' }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  {item.icon}
                </span>
                <AnimatePresence>
                  {sidebarHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="flex-1 text-left min-w-0"
                    >
                      <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                {/* Tooltip when sidebar collapsed */}
                {!sidebarHovered && <NavTooltip label={item.label} show={hoveredNavItem === item.id} />}
              </motion.button>
            )
          })}
        </nav>

        {/* Secondary Navigation */}
        <div className="py-4 px-2 border-t border-white/[0.04] space-y-1">
          {SECONDARY_NAV.map((item) => {
            const isActive = currentPage === item.id
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                onMouseEnter={() => !sidebarHovered && setHoveredNavItem(item.id)}
                onMouseLeave={() => setHoveredNavItem(null)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'
                  }`}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className={`relative flex-shrink-0 ${isActive ? 'text-primary' : ''}`}>
                  {isActive && (
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full"
                      style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.3) 0%, transparent 70%)' }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.8, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}
                  {item.icon}
                </span>
                <AnimatePresence>
                  {sidebarHovered && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!sidebarHovered && <NavTooltip label={item.label} show={hoveredNavItem === item.id} />}
              </motion.button>
            )
          })}

          {/* Logout button */}
          <motion.button
            onClick={handleLogout}
            onMouseEnter={() => !sidebarHovered && setHoveredNavItem('logout')}
            onMouseLeave={() => setHoveredNavItem(null)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 relative"
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.97 }}
          >
            <LogOut className="w-5 h-5" />
            <AnimatePresence>
              {sidebarHovered && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
            {!sidebarHovered && <NavTooltip label="Logout" show={hoveredNavItem === 'logout'} />}
          </motion.button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <motion.main
        className="flex-1 transition-all duration-300 relative z-10"
        style={{ marginLeft: sidebarHovered ? 260 : 72 }}
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
      >
        <AnimatePresence mode="wait" custom={directionRef.current}>
          <motion.div
            key={currentPage}
            custom={directionRef.current}
            variants={desktopPageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
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
      </motion.main>
    </div>
  )
}

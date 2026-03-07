'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/lib/game-context'
import { getLevelInfo } from '@/lib/chess-store'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import { XPPopup, LevelUpOverlay } from '@/components/ui/xp-animations'
import { AchievementPopup } from '@/components/ui/achievement-popup'
import { ComboOverlay, DailyBonusPopup, PerfectSolveFlash } from '@/components/ui/game-rewards'
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
  Flame,
  Zap,
} from 'lucide-react'
import { CursorSpotlight } from '@/components/ui/effects'
import { CommandPalette, CommandPaletteTrigger } from '@/components/ui/command-palette'

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
  const { currentLevel, progress } = getLevelInfo(profile.xp)

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
    <div className="min-h-screen flex bg-background relative">
      {/* Mesh gradient background — gives glass something to blur */}
      <div className="mesh-gradient" />
      <div className="noise-overlay" />
      <CursorSpotlight />

      {/* Global overlays */}
      <XPPopup />
      <LevelUpOverlay />
      <ComboOverlay />
      <PerfectSolveFlash />
      <DailyBonusPopup />
      <CommandPalette onNavigate={handleNavigate} />
      <AchievementPopup
        show={achievementAnimation.show}
        achievement={achievementAnimation.achievement}
        onDismiss={dismissAchievement}
      />

      {/* Sidebar — Apple Sidebar */}
      <aside
        className="fixed left-0 top-0 bottom-0 z-40 flex flex-col w-[220px]"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'saturate(150%) blur(20px)',
          WebkitBackdropFilter: 'saturate(150%) blur(20px)',
          borderRight: '0.5px solid rgba(255, 255, 255, 0.10)',
          boxShadow: 'inset -0.5px 0 0 0 rgba(255,255,255,0.05), 4px 0 24px rgba(0,0,0,0.1)',
        }}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center relative overflow-hidden">
              <Crown className="w-4.5 h-4.5 text-white relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
            </div>
            <span className="font-display font-bold text-[15px] tracking-tight shimmer-text">ChessVault</span>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/12 flex items-center justify-center border border-primary/15">
              <span className="text-xs font-semibold text-primary">{profile?.level || 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{profile?.username || 'Player'}</p>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                <span className="flex items-center gap-0.5">
                  <Flame className="w-3 h-3 text-orange-400" />
                  {profile?.streak || 0}
                </span>
                <span className="flex items-center gap-0.5">
                  <Zap className="w-3 h-3 text-amber-400" />
                  {profile?.xp || 0}
                </span>
              </div>
              {/* XP bar */}
              <div className="mt-1.5 h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full xp-bar-fill relative transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 py-2 px-2.5 space-y-0.5 overflow-hidden">
          {/* Command palette trigger */}
          <div className="mb-2">
            <CommandPaletteTrigger />
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-[9px] rounded-xl text-left transition-all duration-300 relative overflow-hidden group ${isActive
                  ? 'bg-primary/10 text-primary font-semibold shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-primary/20'
                  : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'
                  }`}
              >
                {/* Subtle gradient hover block */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/[0.03] to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                )}
                {isActive && (
                  <motion.div
                    layoutId="desktop-nav-indicator"
                    className="absolute left-0 top-[6px] bottom-[6px] w-[3px] bg-primary rounded-r-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  />
                )}
                <span className={`flex-shrink-0 z-10 ${isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-[13px] tracking-wide z-10">{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Secondary Navigation */}
        <div className="py-2 px-2.5 border-t border-white/[0.06] space-y-0.5">
          {SECONDARY_NAV.map((item) => {
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-[9px] rounded-xl text-left transition-all duration-300 relative overflow-hidden group ${isActive
                  ? 'bg-primary/10 text-primary font-semibold shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-primary/20'
                  : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'
                  }`}
              >
                {/* Subtle gradient hover block */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/[0.03] to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                )}
                <span className={`flex-shrink-0 z-10 ${isActive ? 'text-primary drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-[13px] tracking-wide z-10">{item.label}</span>
              </button>
            )
          })}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[13px] font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="flex-1 relative z-10"
        style={{ marginLeft: 220 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
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

'use client'

import { useState, useCallback, useEffect, useRef, useTransition, lazy, Suspense } from 'react'
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
import { CommandPalette, CommandPaletteTrigger } from '@/components/ui/command-palette'

// Desktop pages
import { DesktopDashboard } from '@/components/desktop/dashboard'
import { DesktopLogin } from '@/components/desktop/login'

// Lazy load all non-dashboard pages for faster initial render
const DesktopOpenings = lazy(() => import('@/components/desktop/openings').then(m => ({ default: m.DesktopOpenings })))
const DesktopTraps = lazy(() => import('@/components/desktop/traps').then(m => ({ default: m.DesktopTraps })))
const DesktopProfile = lazy(() => import('@/components/desktop/profile').then(m => ({ default: m.DesktopProfile })))
const DesktopSettings = lazy(() => import('@/components/desktop/settings').then(m => ({ default: m.DesktopSettings })))
const DesktopPuzzles = lazy(() => import('@/components/desktop/puzzles').then(m => ({ default: m.DesktopPuzzles })))
const DesktopPlayAI = lazy(() => import('@/components/desktop/play-ai').then(m => ({ default: m.DesktopPlayAI })))
const CoordinateTrainerPage = lazy(() => import('@/components/chess/coordinate-trainer').then(m => ({ default: m.CoordinateTrainer })))
const EndgamePracticePage = lazy(() => import('@/components/pages/endgame-practice').then(m => ({ default: m.EndgamePractice })))
const PuzzleRushPage = lazy(() => import('@/components/chess/puzzle-rush').then(m => ({ default: m.PuzzleRush })))
const BoardVisionPage = lazy(() => import('@/components/chess/board-vision').then(m => ({ default: m.BoardVisionTrainer })))
const CheckmatePatternsPage = lazy(() => import('@/components/chess/checkmate-patterns').then(m => ({ default: m.CheckmatePatterns })))
const PieceValueQuizPage = lazy(() => import('@/components/chess/piece-value-quiz').then(m => ({ default: m.PieceValueQuiz })))
const NotationTrainerPage = lazy(() => import('@/components/chess/notation-trainer').then(m => ({ default: m.NotationTrainer })))
const PawnStructuresPage = lazy(() => import('@/components/chess/pawn-structures').then(m => ({ default: m.PawnStructureGuide })))
const BlunderSpotterPage = lazy(() => import('@/components/chess/blunder-spotter').then(m => ({ default: m.BlunderSpotter })))
const MoveCalculatorPage = lazy(() => import('@/components/chess/move-calculator').then(m => ({ default: m.MoveCalculator })))
const PGNViewerPage = lazy(() => import('@/components/chess/pgn-viewer').then(m => ({ default: m.PGNViewer })))
const DailyCalendarPage = lazy(() => import('@/components/chess/daily-calendar').then(m => ({ default: m.DailyCalendar })))

type Page = 'dashboard' | 'puzzles' | 'openings' | 'play' | 'traps' | 'profile' | 'settings' | 'coords' | 'endgame' | 'puzzle-rush' | 'board-vision' | 'checkmate-patterns' | 'piece-quiz' | 'notation-trainer' | 'pawn-structures' | 'blunder-spotter' | 'move-calculator' | 'pgn-viewer' | 'daily-calendar'

function DesktopPageSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto animate-pulse">
      <div className="h-48 rounded-2xl bg-secondary mb-8" />
      <div className="grid grid-cols-4 gap-5 mb-8">
        {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-xl bg-secondary" />)}
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="h-64 rounded-xl bg-secondary" />
        <div className="h-64 rounded-xl bg-secondary" />
      </div>
    </div>
  )
}

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
  const [currentPage, setCurrentPage] = useState<Page>('play')
  const [showSplash, setShowSplash] = useState(true)
  const [, startTransition] = useTransition()
  const { currentLevel, progress } = getLevelInfo(profile.xp)
  const preloadedRef = useRef<Set<string>>(new Set(['dashboard']))

  useEffect(() => {
    checkAndUpdateStreak()
  }, [checkAndUpdateStreak])

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false)
  }, [])

  const handleNavigate = useCallback((page: string) => {
    playSound('click')
    startTransition(() => {
      setCurrentPage(page as Page)
    })
  }, [playSound])

  // Preload page modules on nav hover for instant switching
  const handleNavHover = useCallback((pageId: string) => {
    if (preloadedRef.current.has(pageId)) return
    preloadedRef.current.add(pageId)
    const importMap: Record<string, () => Promise<unknown>> = {
      openings: () => import('@/components/desktop/openings'),
      traps: () => import('@/components/desktop/traps'),
      profile: () => import('@/components/desktop/profile'),
      settings: () => import('@/components/desktop/settings'),
      puzzles: () => import('@/components/desktop/puzzles'),
      play: () => import('@/components/desktop/play-ai'),
    }
    importMap[pageId]?.()
  }, [])

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

  // Allow Play AI without login; gate other pages
  if (!isLoggedIn && currentPage !== 'play') {
    return <DesktopLogin />
  }

  return (
    <div className="min-h-screen flex bg-background relative">
      {/* Lightweight ambient background — static radial gradients, no blur/animation */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute w-[600px] h-[600px] rounded-full opacity-100" style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)',
          top: '-10%', right: '-5%',
        }} />
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-100" style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.025) 0%, transparent 70%)',
          bottom: '-5%', left: '-3%',
        }} />
      </div>

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
            <span className="font-display font-bold text-[15px] tracking-tight shimmer-text">ChessGrind</span>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-white/[0.06]">
          {isLoggedIn ? (
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
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Guest</p>
                <p className="text-[11px] text-muted-foreground">Sign in to save progress</p>
              </div>
            </div>
          )}
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
                onMouseEnter={() => handleNavHover(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-[9px] rounded-xl text-left transition-colors duration-150 relative overflow-hidden group ${isActive
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
                onMouseEnter={() => handleNavHover(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-[9px] rounded-xl text-left transition-colors duration-150 relative overflow-hidden group ${isActive
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

          {/* Logout / Sign In */}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-150"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[13px] font-medium">Logout</span>
            </button>
          ) : (
            <button
              onClick={() => handleNavigate('dashboard')}
              className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-primary hover:bg-primary/10 transition-all duration-150"
            >
              <User className="w-5 h-5" />
              <span className="text-[13px] font-medium">Sign In</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className="flex-1 relative z-10"
        style={{ marginLeft: 220 }}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="min-h-screen"
          >
            {currentPage === 'dashboard' && <DesktopDashboard onNavigate={handleNavigate} />}
            {currentPage !== 'dashboard' && (
              <Suspense fallback={<DesktopPageSkeleton />}>
                {currentPage === 'openings' && <DesktopOpenings onNavigate={handleNavigate} />}
                {currentPage === 'traps' && <DesktopTraps onNavigate={handleNavigate} />}
                {currentPage === 'profile' && <DesktopProfile onNavigate={handleNavigate} />}
                {currentPage === 'settings' && <DesktopSettings onNavigate={handleNavigate} />}
                {currentPage === 'puzzles' && <DesktopPuzzles onNavigate={handleNavigate} />}
                {currentPage === 'play' && <DesktopPlayAI onNavigate={handleNavigate} />}
                {currentPage === 'coords' && <div className="p-8 max-w-4xl mx-auto"><CoordinateTrainerPage onClose={() => handleNavigate('dashboard')} /></div>}
                {currentPage === 'endgame' && <div className="p-8 max-w-4xl mx-auto"><EndgamePracticePage onBack={() => handleNavigate('dashboard')} /></div>}
                {currentPage === 'puzzle-rush' && <div className="p-8 max-w-4xl mx-auto"><PuzzleRushPage onClose={() => handleNavigate('dashboard')} /></div>}
                {currentPage === 'board-vision' && <div className="p-8 max-w-4xl mx-auto"><BoardVisionPage onClose={() => handleNavigate('dashboard')} /></div>}
                {currentPage === 'checkmate-patterns' && <div className="p-8 max-w-5xl mx-auto"><CheckmatePatternsPage onClose={() => handleNavigate('dashboard')} /></div>}
                {currentPage === 'piece-quiz' && <div className="p-8 max-w-4xl mx-auto"><PieceValueQuizPage onClose={() => handleNavigate('dashboard')} /></div>}
                {currentPage === 'notation-trainer' && <div className="p-8 max-w-4xl mx-auto"><NotationTrainerPage onClose={() => handleNavigate('dashboard')} /></div>}
                {currentPage === 'pawn-structures' && <div className="p-8 max-w-5xl mx-auto"><PawnStructuresPage onClose={() => handleNavigate('dashboard')} /></div>}
                {currentPage === 'blunder-spotter' && <div className="p-8 max-w-4xl mx-auto"><BlunderSpotterPage onClose={() => handleNavigate('dashboard')} /></div>}
                {currentPage === 'move-calculator' && <div className="p-8 max-w-4xl mx-auto"><MoveCalculatorPage onClose={() => handleNavigate('dashboard')} /></div>}
                {currentPage === 'pgn-viewer' && <div className="p-8 max-w-5xl mx-auto"><PGNViewerPage onClose={() => handleNavigate('dashboard')} /></div>}
                {currentPage === 'daily-calendar' && <div className="p-8 max-w-4xl mx-auto"><DailyCalendarPage onClose={() => handleNavigate('dashboard')} /></div>}
              </Suspense>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

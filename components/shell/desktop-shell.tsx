'use client'

import { useState, useCallback, useEffect, useRef, useTransition, lazy, Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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
import { CommandPalette } from '@/components/ui/command-palette'

// Desktop pages
import { DesktopDashboard } from '@/components/desktop/dashboard'
import { DesktopLogin } from '@/components/desktop/login'

// Lazy load all non-primary pages
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


// Board-mode pages use the board-left layout (lm-board-panel + lm-right-panel)
const BOARD_PAGES = new Set<Page>(['play', 'puzzles', 'openings', 'traps'])

function BoardPageSkeleton() {
  return (
    <div className="flex h-full animate-pulse">
      <div className="lm-board-panel bg-secondary/20" />
      <div className="lm-right-panel p-6 space-y-4">
        <div className="h-8 w-48 rounded-xl bg-secondary" />
        <div className="h-32 rounded-xl bg-secondary" />
        <div className="h-24 rounded-xl bg-secondary" />
      </div>
    </div>
  )
}

function ScrollPageSkeleton() {
  return (
    <div className="p-8 max-w-5xl mx-auto animate-pulse space-y-6">
      <div className="h-12 w-64 rounded-xl bg-secondary" />
      <div className="grid grid-cols-3 gap-5">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 rounded-xl bg-secondary" />)}
      </div>
    </div>
  )
}

const PRIMARY_TABS = [
  { id: 'play' as Page,     label: 'Play AI',   icon: Swords },
  { id: 'puzzles' as Page,  label: 'Puzzles',   icon: Puzzle },
  { id: 'openings' as Page, label: 'Openings',  icon: BookOpen },
  { id: 'traps' as Page,    label: 'Traps',     icon: Target },
  { id: 'dashboard' as Page,label: 'Dashboard', icon: Home },
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
  const [currentPage, setCurrentPage] = useState<Page>('play')
  const [showSplash, setShowSplash] = useState(true)
  const [, startTransition] = useTransition()
  const { progress } = getLevelInfo(profile.xp)
  const preloadedRef = useRef<Set<string>>(new Set(['play']))

  useEffect(() => { checkAndUpdateStreak() }, [checkAndUpdateStreak])

  const handleSplashComplete = useCallback(() => setShowSplash(false), [])

  const handleNavigate = useCallback((page: string) => {
    playSound('click')
    startTransition(() => setCurrentPage(page as Page))
  }, [playSound])

  const handleNavHover = useCallback((pageId: string) => {
    if (preloadedRef.current.has(pageId)) return
    preloadedRef.current.add(pageId)
    const importMap: Record<string, () => Promise<unknown>> = {
      openings: () => import('@/components/desktop/openings'),
      traps:    () => import('@/components/desktop/traps'),
      profile:  () => import('@/components/desktop/profile'),
      settings: () => import('@/components/desktop/settings'),
      puzzles:  () => import('@/components/desktop/puzzles'),
      play:     () => import('@/components/desktop/play-ai'),
    }
    importMap[pageId]?.()
  }, [])

  const handleLogout = useCallback(() => { playSound('click'); logout() }, [playSound, logout])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return
      const map: Record<string, Page> = { '1': 'play', '2': 'puzzles', '3': 'openings', '4': 'traps', '5': 'dashboard' }
      if (map[e.key]) { e.preventDefault(); handleNavigate(map[e.key]) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleNavigate])

  if (showSplash) return <SplashScreen onComplete={handleSplashComplete} />
  if (!isLoggedIn && currentPage !== 'play') return <DesktopLogin onBack={() => handleNavigate('play')} />

  const isBoardPage = BOARD_PAGES.has(currentPage)

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute rounded-full lm-gpu" style={{
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)',
          top: '-10%', right: '-5%',
        }} />
        <div className="absolute rounded-full lm-gpu" style={{
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(99,102,241,0.025) 0%, transparent 70%)',
          bottom: '-5%', left: '-3%',
        }} />
      </div>

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

      <header
        className="lm-topbar flex-none flex items-center px-4 gap-3 z-40 border-b border-white/[0.06]"
        style={{ background: 'rgba(10,9,8,0.92)', backdropFilter: 'saturate(160%) blur(20px)', WebkitBackdropFilter: 'saturate(160%) blur(20px)' }}
      >
        <div className="flex items-center gap-2 flex-none">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center lm-gpu">
            <Crown className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold shimmer-text" style={{ fontSize: 'var(--fs-sm)' }}>ChessGrind</span>
        </div>

        <nav className="flex items-center gap-0.5 flex-none">
          {PRIMARY_TABS.map(tab => {
            const Icon = tab.icon
            const isActive = currentPage === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleNavigate(tab.id)}
                onMouseEnter={() => handleNavHover(tab.id)}
                className={'relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors duration-150 ' + (isActive ? 'text-primary border-b-2 border-primary -mb-px' : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]')}
                style={{ fontSize: 'var(--fs-sm)' }}
              >
                <Icon className="w-3.5 h-3.5 relative z-10 flex-none" />
                <span className="relative z-10 whitespace-nowrap">{tab.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2 flex-none">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-3 px-3 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <span className="flex items-center gap-1" style={{ fontSize: 'var(--fs-xs)' }}>
                  <Flame className="w-3.5 h-3.5 text-orange-400 flex-none" />
                  <span className="text-muted-foreground font-mono">{profile.streak || 0}</span>
                </span>
                <span className="flex items-center gap-1" style={{ fontSize: 'var(--fs-xs)' }}>
                  <Zap className="w-3.5 h-3.5 text-amber-400 flex-none" />
                  <span className="text-muted-foreground font-mono">{profile.xp || 0}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold border border-primary/20" style={{ fontSize: 'var(--fs-xs)' }}>
                  Lv.{profile.level || 1}
                </span>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[10px] text-muted-foreground/60">{Math.round(progress)}%</span>
                  <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full rounded-full xp-bar-fill lm-gpu" style={{ width: Math.min(progress, 100) + '%', transition: 'width 0.7s ease-out' }} />
                  </div>
                </div>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <button onClick={() => handleNavigate('profile')} onMouseEnter={() => handleNavHover('profile')} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors" title="Profile">
                <User className="w-4 h-4" />
              </button>
              <button onClick={() => handleNavigate('settings')} onMouseEnter={() => handleNavHover('settings')} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors" title="Settings">
                <Settings className="w-4 h-4" />
              </button>
              <button onClick={handleLogout} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => handleNavigate('dashboard')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors" style={{ fontSize: 'var(--fs-sm)' }}>
                <User className="w-3.5 h-3.5" /> Sign In
              </button>
              <button onClick={() => handleNavigate('settings')} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </header>

      <main className="lm-content flex-none relative z-10">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentPage}
            className="h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
          >
            {isBoardPage && (
              <Suspense fallback={<BoardPageSkeleton />}>
                {currentPage === 'play'     && <DesktopPlayAI   onNavigate={handleNavigate} />}
                {currentPage === 'puzzles'  && <DesktopPuzzles  onNavigate={handleNavigate} />}
                {currentPage === 'openings' && <DesktopOpenings onNavigate={handleNavigate} />}
                {currentPage === 'traps'    && <DesktopTraps    onNavigate={handleNavigate} />}
              </Suspense>
            )}
            {!isBoardPage && (
              <div className="h-full overflow-y-auto overflow-x-hidden">
                {currentPage === 'dashboard' && <DesktopDashboard onNavigate={handleNavigate} />}
                <Suspense fallback={<ScrollPageSkeleton />}>
                  {currentPage === 'profile'  && <DesktopProfile  onNavigate={handleNavigate} />}
                  {currentPage === 'settings' && <DesktopSettings onNavigate={handleNavigate} />}
                  {currentPage === 'coords'   && <div className="p-8 max-w-4xl mx-auto"><CoordinateTrainerPage onClose={() => handleNavigate('dashboard')} /></div>}
                  {currentPage === 'endgame'  && <div className="p-8 max-w-4xl mx-auto"><EndgamePracticePage  onBack={() => handleNavigate('dashboard')} /></div>}
                  {currentPage === 'puzzle-rush'        && <div className="p-8 max-w-4xl mx-auto"><PuzzleRushPage         onClose={() => handleNavigate('dashboard')} /></div>}
                  {currentPage === 'board-vision'       && <div className="p-8 max-w-4xl mx-auto"><BoardVisionPage        onClose={() => handleNavigate('dashboard')} /></div>}
                  {currentPage === 'checkmate-patterns' && <div className="p-8 max-w-5xl mx-auto"><CheckmatePatternsPage  onClose={() => handleNavigate('dashboard')} /></div>}
                  {currentPage === 'piece-quiz'         && <div className="p-8 max-w-4xl mx-auto"><PieceValueQuizPage     onClose={() => handleNavigate('dashboard')} /></div>}
                  {currentPage === 'notation-trainer'   && <div className="p-8 max-w-4xl mx-auto"><NotationTrainerPage    onClose={() => handleNavigate('dashboard')} /></div>}
                  {currentPage === 'pawn-structures'    && <div className="p-8 max-w-5xl mx-auto"><PawnStructuresPage     onClose={() => handleNavigate('dashboard')} /></div>}
                  {currentPage === 'blunder-spotter'    && <div className="p-8 max-w-4xl mx-auto"><BlunderSpotterPage     onClose={() => handleNavigate('dashboard')} /></div>}
                  {currentPage === 'move-calculator'    && <div className="p-8 max-w-4xl mx-auto"><MoveCalculatorPage     onClose={() => handleNavigate('dashboard')} /></div>}
                  {currentPage === 'pgn-viewer'         && <div className="p-8 max-w-5xl mx-auto"><PGNViewerPage          onClose={() => handleNavigate('dashboard')} /></div>}
                  {currentPage === 'daily-calendar'     && <div className="p-8 max-w-4xl mx-auto"><DailyCalendarPage      onClose={() => handleNavigate('dashboard')} /></div>}
                </Suspense>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

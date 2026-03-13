'use client'

import { useState, useCallback, useEffect, useTransition, lazy, Suspense } from 'react'
import { useGame } from '@/lib/game-context'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import { LoginPage } from '@/components/pages/login'
import { Dashboard } from '@/components/pages/dashboard'

// Lazy load all non-dashboard pages for faster initial render
const OpeningsPage = lazy(() => import('@/components/pages/openings').then(m => ({ default: m.OpeningsPage })))
const TrapsPage = lazy(() => import('@/components/pages/traps').then(m => ({ default: m.TrapsPage })))
const ProfilePage = lazy(() => import('@/components/pages/profile').then(m => ({ default: m.ProfilePage })))
const SettingsPage = lazy(() => import('@/components/pages/settings').then(m => ({ default: m.SettingsPage })))
const PuzzlesPage = lazy(() => import('@/components/pages/puzzles').then(m => ({ default: m.PuzzlesPage })))
const PlayAIPage = lazy(() => import('@/components/pages/play-ai').then(m => ({ default: m.PlayAIPage })))
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
} from 'lucide-react'

type Page = 'dashboard' | 'puzzles' | 'openings' | 'play' | 'traps' | 'profile' | 'settings' | 'coords' | 'endgame' | 'puzzle-rush' | 'board-vision' | 'checkmate-patterns' | 'piece-quiz' | 'notation-trainer' | 'pawn-structures' | 'blunder-spotter' | 'move-calculator' | 'pgn-viewer' | 'daily-calendar'

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-10 w-32 rounded-xl bg-secondary" />
      <div className="aspect-square w-full max-w-[340px] mx-auto rounded-2xl bg-secondary" />
      <div className="h-12 rounded-xl bg-secondary" />
      <div className="h-12 rounded-xl bg-secondary" />
    </div>
  )
}

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
  const [currentPage, setCurrentPage] = useState<Page>('play')
  const [showSplash, setShowSplash] = useState(true)
  const [, startTransition] = useTransition()

  useEffect(() => {
    checkAndUpdateStreak()
  }, [checkAndUpdateStreak])

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false)
  }, [])

  const handleNavigate = useCallback((page: string) => {
    playSound('click')
    triggerHaptic('selection')
    startTransition(() => {
      setCurrentPage(page as Page)
    })
  }, [playSound, triggerHaptic])

  const handleBack = useCallback(() => {
    playSound('click')
    triggerHaptic('light')
    startTransition(() => {
      setCurrentPage('dashboard')
    })
  }, [playSound, triggerHaptic])

  const handleNavClick = useCallback((pageId: Page) => {
    playSound('click')
    triggerHaptic('selection')
    startTransition(() => {
      setCurrentPage(pageId)
    })
  }, [playSound, triggerHaptic])

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  // Allow Play AI without login; gate other pages
  if (!isLoggedIn && currentPage !== 'play') {
    return <LoginPage onBack={() => handleNavigate('play')} />
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* Global overlays */}
      <XPPopup />
      <LevelUpOverlay />
      <ComboOverlay />
      <PerfectSolveFlash />
      <DailyBonusPopup />
      <AchievementPopup
        show={achievementAnimation.show}
        achievement={achievementAnimation.achievement}
        onDismiss={dismissAchievement}
      />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-20 relative z-10">
        <div key={currentPage}>
          {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
          {currentPage !== 'dashboard' && (
            <Suspense fallback={<PageSkeleton />}>
              {currentPage === 'openings' && <OpeningsPage onBack={handleBack} />}
              {currentPage === 'traps' && <TrapsPage onBack={handleBack} />}
              {currentPage === 'profile' && <ProfilePage onBack={handleBack} onNavigate={handleNavigate} />}
              {currentPage === 'settings' && <SettingsPage onBack={handleBack} />}
              {currentPage === 'puzzles' && <PuzzlesPage onBack={handleBack} />}
              {currentPage === 'play' && <PlayAIPage onBack={handleBack} />}
              {currentPage === 'coords' && <CoordinateTrainerPage onClose={handleBack} />}
              {currentPage === 'endgame' && <EndgamePracticePage onBack={handleBack} />}
              {currentPage === 'puzzle-rush' && <PuzzleRushPage onClose={handleBack} />}
              {currentPage === 'board-vision' && <BoardVisionPage onClose={handleBack} />}
              {currentPage === 'checkmate-patterns' && <CheckmatePatternsPage onClose={handleBack} />}
              {currentPage === 'piece-quiz' && <PieceValueQuizPage onClose={handleBack} />}
              {currentPage === 'notation-trainer' && <NotationTrainerPage onClose={handleBack} />}
              {currentPage === 'pawn-structures' && <PawnStructuresPage onClose={handleBack} />}
              {currentPage === 'blunder-spotter' && <BlunderSpotterPage onClose={handleBack} />}
              {currentPage === 'move-calculator' && <MoveCalculatorPage onClose={handleBack} />}
              {currentPage === 'pgn-viewer' && <PGNViewerPage onClose={handleBack} />}
              {currentPage === 'daily-calendar' && <DailyCalendarPage onClose={handleBack} />}
            </Suspense>
          )}
        </div>
      </main>

      {/* Bottom Navigation Bar — Apple Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom"
        style={{
          background: 'rgba(12, 14, 20, 0.92)',
          borderTop: '0.5px solid rgba(255, 255, 255, 0.10)',
        }}
      >
        <div className="max-w-lg mx-auto flex items-stretch justify-around">
          {NAV_ITEMS.map((navItem) => {
            const isActive = currentPage === navItem.id
            return (
              <button
                key={navItem.id}
                onClick={() => handleNavClick(navItem.id)}
                className={`relative flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
              >
                {isActive && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[2px] rounded-full bg-primary shadow-[0_2px_10px_rgba(245,158,11,0.8)]"
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
            className={`relative flex-1 flex flex-col items-center gap-0.5 py-2 transition-colors duration-200 ${currentPage === 'profile' ? 'text-primary' : 'text-muted-foreground'
              }`}
          >
            {currentPage === 'profile' && (
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[2px] rounded-full bg-primary shadow-[0_2px_10px_rgba(245,158,11,0.8)]"
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

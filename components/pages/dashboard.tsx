'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '@/lib/game-context'
import { useSettings } from '@/lib/settings-context'
import { getLevelInfo, getDailyPuzzleIndex } from '@/lib/chess-store'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import { XPBar, StatCard } from '@/components/ui/xp-animations'
import { MiniChessboard } from '@/components/chess/chessboard'
import { StreakWarning, NextAchievementPreview } from '@/components/ui/game-rewards'
import { PUZZLES, OPENINGS } from '@/lib/chess-data'
import {
  Trophy,
  Flame,
  Puzzle,
  BookOpen,
  Swords,
  Target,
  ChevronRight,
  Zap,
  TrendingUp,
  Calendar,
  Settings,
} from 'lucide-react'
import {
  AnimatedCounter,
  ProgressRing,
  TextReveal,
  staggerContainer,
  staggerItem,
} from '@/components/ui/animated-components'
import { OdometerCounter, TypewriterText } from '@/components/ui/effects'

interface DashboardProps {
  onNavigate: (page: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { profile, claimDailyBonus } = useGame()
  const { settings } = useSettings()
  const { playSound, triggerHaptic } = useSoundAndHaptics()
  const { currentLevel, progress } = getLevelInfo(profile.xp)
  const dailyBonusChecked = useRef(false)

  const dailyPuzzleIndex = getDailyPuzzleIndex(PUZZLES.length)
  const dailyPuzzle = PUZZLES[dailyPuzzleIndex]

  // Auto-claim daily bonus on first dashboard load
  useEffect(() => {
    if (!dailyBonusChecked.current && profile.username !== 'ChessLearner') {
      dailyBonusChecked.current = true
      const today = new Date().toDateString()
      if (!profile.dailyBonusClaimed || profile.lastActiveDate !== today) {
        setTimeout(() => claimDailyBonus(), 1500)
      }
    }
  }, [profile.username, profile.dailyBonusClaimed, profile.lastActiveDate, claimDailyBonus])

  const handleNavigate = (page: string) => {
    playSound('click')
    triggerHaptic('selection')
    onNavigate(page)
  }

  const quickActions = [
    {
      id: 'puzzles',
      label: 'Puzzles',
      icon: <Puzzle className="w-5 h-5" />,
      gradient: 'from-amber-500 to-orange-500',
      page: 'puzzles',
    },
    {
      id: 'openings',
      label: 'Learn',
      icon: <BookOpen className="w-5 h-5" />,
      gradient: 'from-blue-500 to-cyan-500',
      page: 'openings',
    },
    {
      id: 'play',
      label: 'Play AI',
      icon: <Swords className="w-5 h-5" />,
      gradient: 'from-emerald-500 to-green-500',
      page: 'play',
    },
    {
      id: 'traps',
      label: 'Traps',
      icon: <Target className="w-5 h-5" />,
      gradient: 'from-red-500 to-pink-500',
      page: 'traps',
    },
  ]

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 pb-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="relative flex items-center justify-between overflow-hidden rounded-2xl p-3 -mx-3">
        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
            <span className="text-xl font-bold text-white">{profile.username.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground shimmer-text">
              <TypewriterText text={profile.username} speed={60} />
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Level {currentLevel.level}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-primary font-medium">{currentLevel.title}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => handleNavigate('settings')}
          className="relative w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={staggerItem} className="grid grid-cols-3 gap-2">
        <div className="glow-card bg-secondary rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
            <Zap className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-foreground"><OdometerCounter value={profile.xp} /></p>
          <p className="text-[10px] text-muted-foreground">XP</p>
        </div>
        <div className="glow-card bg-secondary rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
            <Flame className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-foreground"><OdometerCounter value={profile.streak} /></p>
          <p className="text-[10px] text-muted-foreground">Day Streak</p>
        </div>
        <div className="glow-card bg-secondary rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-foreground"><OdometerCounter value={profile.rating} /></p>
          <p className="text-[10px] text-muted-foreground">Rating</p>
        </div>
      </motion.div>

      {/* Level Progress */}
      <motion.div variants={staggerItem} className="bg-secondary rounded-xl p-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground">Level {currentLevel.level}</span>
          <span className="text-primary font-medium">{Math.round(progress)}%</span>
        </div>
        <XPBar />
      </motion.div>

      {/* Streak Warning */}
      <motion.div variants={staggerItem}>
        <StreakWarning />
      </motion.div>

      {/* Next Achievement */}
      <motion.div variants={staggerItem}>
        <NextAchievementPreview />
      </motion.div>

      {/* Combo indicator */}
      {profile.combo > 0 && (
        <motion.div variants={staggerItem} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <span className="text-lg">🔥</span>
          <span className="text-xs font-bold text-orange-400">{profile.combo}x Puzzle Combo Active</span>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div variants={staggerItem} className="grid grid-cols-4 gap-2">
        {quickActions.map((action) => (
          <motion.button
            key={action.id}
            onClick={() => handleNavigate(action.page)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary active:bg-secondary/70 transition-colors w-full"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-sm`}>
              {action.icon}
            </div>
            <span className="text-[11px] font-medium text-foreground">{action.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Streak Widget */}
      <motion.div variants={staggerItem} className="breathing-glow bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground"><AnimatedCounter value={profile.streak} /></p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">{profile.bestStreak}</p>
            <p className="text-[10px] text-muted-foreground">Best Streak</p>
          </div>
        </div>
        {/* Streak dots for last 7 days */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-amber-500/10">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => {
            const isActive = idx < profile.streak % 7 || (profile.streak >= 7 && true)
            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive
                    ? 'bg-amber-500 text-white'
                    : 'bg-secondary text-muted-foreground'
                }`}>
                  {isActive ? '✓' : day}
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Daily Challenge */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground shimmer-text">Daily Challenge</h2>
          {profile.dailyChallengeCompleted && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-medium">
              Completed ✓
            </span>
          )}
        </div>
        <motion.button
          onClick={() => handleNavigate('puzzles')}
          className="w-full gradient-border-card bg-secondary rounded-xl p-3 flex items-center gap-3 text-left"
        >
          <div className="relative overflow-hidden rounded-lg flex-shrink-0" style={{ width: 64, height: 64 }}>
            <MiniChessboard fen={dailyPuzzle.fen} size={64} boardStyle={settings.boardStyle} pieceStyle={settings.pieceStyle} />
            {profile.dailyChallengeCompleted && (
              <div className="absolute inset-0 bg-green-500/30 backdrop-blur-[1px] flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-medium text-amber-500">Today's Puzzle</span>
            </div>
            <p className="text-sm font-semibold text-foreground truncate">{dailyPuzzle.title}</p>
            <div className="flex items-center gap-1 mt-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span className="text-xs text-amber-500">+{dailyPuzzle.xpReward} XP</span>
            </div>
          </div>
          <ProgressRing
            progress={profile.dailyChallengeCompleted ? 100 : 0}
            size={36}
            strokeWidth={3}
            color="hsl(142, 71%, 45%)"
            className="flex-shrink-0"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </ProgressRing>
        </motion.button>
      </motion.div>

      {/* Continue Learning */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground shimmer-text">Continue Learning</h2>
          <button
            onClick={() => handleNavigate('openings')}
            className="text-xs text-primary font-medium"
          >
            See all
          </button>
        </div>
        <motion.button
          onClick={() => handleNavigate('openings')}
          className="w-full bg-secondary rounded-xl p-3 flex items-center gap-3 text-left"
        >
          <div className="overflow-hidden rounded-lg flex-shrink-0" style={{ width: 64, height: 64 }}>
            <MiniChessboard fen={OPENINGS[0].fen} size={64} boardStyle={settings.boardStyle} pieceStyle={settings.pieceStyle} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{OPENINGS[0].name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{OPENINGS[0].description}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-500">
                {OPENINGS[0].eco}
              </span>
              <span className="text-[10px] text-muted-foreground capitalize">{OPENINGS[0].difficulty}</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </motion.button>
      </motion.div>

      {/* Progress Stats */}
      <motion.div variants={staggerItem}>
        <h2 className="text-sm font-semibold text-foreground shimmer-text mb-2">Your Progress</h2>
        <div className="grid grid-cols-2 gap-2">
          <div className="glow-card rounded-xl">
            <StatCard
              label="Games Played"
              value={profile.gamesPlayed}
              icon={<Swords className="w-4 h-4" />}
            />
          </div>
          <div className="glow-card rounded-xl">
            <StatCard
              label="Puzzles Solved"
              value={profile.puzzlesSolved}
              icon={<Puzzle className="w-4 h-4" />}
            />
          </div>
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground shimmer-text">Achievements</h2>
          <button
            onClick={() => handleNavigate('profile')}
            className="text-xs text-primary font-medium"
          >
            {profile.achievements.filter(a => a.earned).length}/{profile.achievements.length}
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {profile.achievements.slice(0, 5).map((achievement) => (
            <div
              key={achievement.id}
              className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-xl ${
                achievement.earned
                  ? 'bg-amber-500/10'
                  : 'bg-secondary opacity-40'
              }`}
            >
              {achievement.earned ? achievement.icon : '🔒'}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

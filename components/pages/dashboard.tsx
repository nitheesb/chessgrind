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
import { ActivityHeatmap } from '@/components/ui/activity-heatmap'
import { WeeklyMissions } from '@/components/ui/weekly-missions'
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
  Play,
} from 'lucide-react'
import {
  AnimatedCounter,
  ProgressRing,
  TextReveal,
  staggerContainer,
  staggerItem,
} from '@/components/ui/animated-components'
import { OdometerCounter, TypewriterText } from '@/components/ui/effects'

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return `${Math.floor(diffDays / 7)}w ago`
}

const CHESS_TIPS = [
  "Control the center with pawns and pieces in the opening.",
  "Knights are better in closed positions, bishops in open ones.",
  "Don't move the same piece twice in the opening.",
  "Castle early to protect your king.",
  "Rooks belong on open files and the 7th rank.",
  "In endgames, your king becomes a powerful piece.",
  "Always ask 'Why did my opponent make that move?' before responding.",
  "Passed pawns must be pushed!",
  "Coordinate your pieces — a team effort wins games.",
  "Tactics flow from a strategically superior position.",
  "Every pawn move creates permanent weaknesses.",
  "The threat is often stronger than the execution.",
]

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

  const today = new Date()
  const startOfYear = new Date(today.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
  const tip = CHESS_TIPS[dayOfYear % CHESS_TIPS.length]

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
      gradient: 'from-amber-500 to-yellow-600',
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center">
            <span className="text-xl font-bold text-white">{profile.username.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground shimmer-text mb-0.5">
              <TypewriterText text={profile.username} speed={60} />
            </h1>
            <button
              onClick={() => handleNavigate('puzzles')}
              className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-semibold border border-primary/20 shadow-[0_0_10px_rgba(245,158,11,0.15)] hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:bg-primary/20 transition-all text-xs flex items-center gap-1.5"
            >
              <Play className="w-3 h-3" fill="currentColor" />
              Continue Training
            </button>
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
        <div className="glass-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
            <Zap className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-foreground"><OdometerCounter value={profile.xp} /></p>
          <p className="text-[11px] text-muted-foreground font-medium">Total XP</p>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
            <Flame className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-foreground"><OdometerCounter value={profile.streak} /></p>
          <p className="text-[11px] text-muted-foreground font-medium">Day Streak</p>
        </div>
        <div className="glass-card p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-foreground"><OdometerCounter value={profile.rating} /></p>
          <p className="text-[11px] text-muted-foreground font-medium">Rating</p>
        </div>
      </motion.div>

      {/* Level Progress */}
      <motion.div variants={staggerItem} className="glass-card p-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground">Level {currentLevel.level}</span>
          <span className="text-primary font-medium">{Math.round(progress)}%</span>
        </div>
        <XPBar />
      </motion.div>

      {/* Welcome banner for new users */}
      {profile.xp === 0 && profile.puzzlesSolved === 0 && (
        <motion.div variants={staggerItem} className="rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-4">
          <h2 className="text-sm font-bold text-foreground mb-1">👋 Welcome to ChessVault!</h2>
          <p className="text-xs text-muted-foreground mb-3">Start with a quick puzzle to earn your first XP and begin your journey.</p>
          <motion.button
            onClick={() => handleNavigate('puzzles')}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-2 rounded-lg bg-amber-500 text-white text-xs font-semibold"
          >
            Solve Your First Puzzle →
          </motion.button>
        </motion.div>
      )}

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
      <motion.div variants={staggerItem} className="grid grid-cols-2 gap-2.5">
        {quickActions.map((action) => (
          <motion.button
            key={action.id}
            onClick={() => handleNavigate(action.page)}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 p-3.5 glass-card-hover group relative overflow-hidden transition-colors w-full text-left border border-white/5 hover:border-white/10"
          >
            {/* Hover gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500`} />
            {/* Animated sweep line */}
            <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] group-hover:animate-[shine-sweep_1.5s_ease-in-out_infinite]" />

            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-[0_4px_8px_rgba(0,0,0,0.3)] ring-1 ring-white/20 shrink-0 relative z-10`}>
              {action.icon}
            </div>
            <span className="text-sm font-semibold text-foreground relative z-10">{action.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Weekly Missions */}
      {profile.weeklyMissions.length > 0 && (
        <motion.div variants={staggerItem}>
          <h2 className="text-sm font-semibold text-foreground shimmer-text mb-2">Weekly Missions</h2>
          <WeeklyMissions missions={profile.weeklyMissions} />
        </motion.div>
      )}

      {/* Streak Widget */}
      <motion.div variants={staggerItem} className="breathing-glow bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground flex items-center gap-1"><AnimatedCounter value={profile.streak} /> <span className="text-xl">🔥</span></p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">{profile.bestStreak}</p>
            <p className="text-[10px] text-muted-foreground">Best Streak</p>
          </div>
        </div>
        {/* 7-day visual tracker showing actual Mon-Sun */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-amber-500/10">
          {(() => {
            const today = new Date()
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            // Get current week Mon-Sun
            const weekDates = Array.from({ length: 7 }, (_, i) => {
              const d = new Date(today)
              const dow = today.getDay() === 0 ? 6 : today.getDay() - 1 // 0=Mon
              d.setDate(today.getDate() - dow + i)
              return d
            })
            return weekDates.map((date, idx) => {
              const dateKey = date.toDateString()
              const isToday = date.toDateString() === today.toDateString()
              const hasActivity = (profile.activityDates[dateKey] || 0) > 0
              const isFuture = date > today
              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    isFuture ? 'bg-secondary/30 text-muted-foreground/30' :
                    hasActivity ? 'bg-amber-500 text-white shadow-[0_0_8px_rgba(245,158,11,0.4)]' :
                    isToday ? 'bg-secondary border border-amber-500/40 text-amber-500' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    {hasActivity ? '✓' : days[idx].charAt(0)}
                  </div>
                  <span className={`text-[9px] ${isToday ? 'text-amber-400' : 'text-muted-foreground/50'}`}>
                    {days[idx]}
                  </span>
                </div>
              )
            })
          })()}
        </div>
      </motion.div>

      {/* Daily Challenge */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground shimmer-text">Daily Challenge</h2>
          {profile.dailyChallengeCompleted && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold shadow-[0_0_10px_rgba(245,158,11,0.1)]">
              Completed ✓
            </span>
          )}
        </div>
        <motion.button
          onClick={() => handleNavigate('puzzles')}
          className={`w-full glass-card-hover group relative overflow-hidden rounded-xl p-3 flex items-center gap-3 text-left border hover:border-white/10 ${
            profile.dailyChallengeCompleted ? 'border-amber-500/30' : 'border-white/5'
          }`}
        >
          {/* Subtle accent glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 group-hover:bg-primary/10 transition-colors duration-500" />

          <div className="relative overflow-hidden rounded-lg flex-shrink-0 shadow-[0_4px_15px_rgba(0,0,0,0.3)] ring-1 ring-white/10" style={{ width: 64, height: 64 }}>
            <MiniChessboard fen={dailyPuzzle.fen} size={64} boardStyle={settings.boardStyle} pieceStyle={settings.pieceStyle} />
            {profile.dailyChallengeCompleted && (
              <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-[1px] flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
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
              {profile.dailyChallengeCompleted && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold">✓ Done today</span>
              )}
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
            color="hsl(38, 92%, 50%)"
            className="flex-shrink-0"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </ProgressRing>
        </motion.button>
      </motion.div>

      {/* Recent Games */}
      {profile.recentGames.length > 0 && (
        <motion.div variants={staggerItem}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-foreground shimmer-text">Recent Games</h2>
            <button onClick={() => handleNavigate('profile')} className="text-xs text-primary font-medium">
              View All
            </button>
          </div>
          <div className="glass-card p-3 flex flex-col gap-1">
            {profile.recentGames.slice(0, 3).map((game) => (
              <div key={game.id} className="flex items-center gap-3 py-1.5 border-b border-border/20 last:border-0">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  game.result === 'win' ? 'bg-amber-500/10 text-amber-400' :
                  game.result === 'draw' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {game.result === 'win' ? 'W' : game.result === 'draw' ? 'D' : 'L'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">vs {game.opponent}</p>
                  <p className="text-[10px] text-muted-foreground">{game.moves} moves</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{getTimeAgo(game.date)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

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
        {/* Activity compact heatmap */}
        <div className="glass-card p-3 mt-2">
          <p className="text-[10px] text-muted-foreground font-medium mb-2">Activity (last 52 weeks)</p>
          <ActivityHeatmap activityDates={profile.activityDates} compact />
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
              className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-xl ${achievement.earned
                  ? 'bg-amber-500/10'
                  : 'bg-secondary opacity-40'
                }`}
            >
              {achievement.earned ? achievement.icon : '🔒'}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Chess Tip of the Day */}
      <motion.div variants={staggerItem} className="rounded-xl bg-blue-500/5 border border-blue-500/15 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-xs font-semibold text-blue-400 mb-1">Chess Tip</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

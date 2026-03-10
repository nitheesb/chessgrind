'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '@/lib/game-context'
import { useSettings } from '@/lib/settings-context'
import { getLevelInfo, getDailyPuzzleIndex } from '@/lib/chess-store'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import { XPBar } from '@/components/ui/xp-animations'
import { MiniChessboard } from '@/components/chess/chessboard'
import { PUZZLES } from '@/lib/chess-data/puzzles'
import { WeeklyMissions } from '@/components/ui/weekly-missions'
import {
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
  Crown,
  Crosshair,
} from 'lucide-react'
import {
  ProgressRing,
  staggerContainer,
  staggerItem,
} from '@/components/ui/animated-components'
import { OdometerCounter } from '@/components/ui/effects'

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
    { id: 'puzzles', label: 'Puzzles', desc: 'Train tactics', icon: <Puzzle className="w-5 h-5" />, gradient: 'from-amber-500 to-orange-600', page: 'puzzles' },
    { id: 'openings', label: 'Learn', desc: 'Opening theory', icon: <BookOpen className="w-5 h-5" />, gradient: 'from-blue-500 to-indigo-600', page: 'openings' },
    { id: 'play', label: 'Play AI', desc: 'Test skills', icon: <Swords className="w-5 h-5" />, gradient: 'from-violet-500 to-purple-600', page: 'play' },
    { id: 'traps', label: 'Traps', desc: 'Learn tricks', icon: <Target className="w-5 h-5" />, gradient: 'from-rose-500 to-pink-600', page: 'traps' },
    { id: 'coords', label: 'Coords', desc: 'Board vision', icon: <Crosshair className="w-5 h-5" />, gradient: 'from-cyan-500 to-teal-600', page: 'coords' },
    { id: 'endgame', label: 'Endgames', desc: 'Practice endings', icon: <Crown className="w-5 h-5" />, gradient: 'from-yellow-500 to-amber-600', page: 'endgame' },
  ]

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-3.5 pb-6"
    >
      {/* Hero Header */}
      <motion.div variants={staggerItem} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/80 border border-border/50 p-4">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/[0.08] to-transparent rounded-full translate-x-1/4 -translate-y-1/4" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">{profile.username}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">Lvl {currentLevel.level}</span>
                <span className="text-[10px] text-primary font-medium">{currentLevel.title}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigate('puzzles')}
              className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
            >
              <Play className="w-3.5 h-3.5" fill="currentColor" />
              Play
            </button>
            <button
              onClick={() => handleNavigate('settings')}
              className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground"
            >
              <Settings className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
        <div className="mt-3 relative z-10">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-muted-foreground">Level {currentLevel.level}</span>
            <span className="text-primary font-medium">{Math.round(progress)}%</span>
          </div>
          <XPBar />
        </div>
      </motion.div>

      {/* Key Stats */}
      <motion.div variants={staggerItem} className="grid grid-cols-4 gap-2">
        <div className="glass-card p-2.5 text-center">
          <TrendingUp className="w-3.5 h-3.5 text-blue-400 mx-auto mb-1" />
          <p className="text-base font-bold text-foreground"><OdometerCounter value={profile.rating} /></p>
          <p className="text-[9px] text-muted-foreground font-medium">Rating</p>
        </div>
        <div className="glass-card p-2.5 text-center">
          <Flame className="w-3.5 h-3.5 text-orange-400 mx-auto mb-1" />
          <p className="text-base font-bold text-foreground"><OdometerCounter value={profile.streak} /></p>
          <p className="text-[9px] text-muted-foreground font-medium">Streak</p>
        </div>
        <div className="glass-card p-2.5 text-center">
          <Puzzle className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
          <p className="text-base font-bold text-foreground"><OdometerCounter value={profile.puzzlesSolved} /></p>
          <p className="text-[9px] text-muted-foreground font-medium">Solved</p>
        </div>
        <div className="glass-card p-2.5 text-center">
          <Zap className="w-3.5 h-3.5 text-yellow-400 mx-auto mb-1" />
          <p className="text-base font-bold text-foreground"><OdometerCounter value={profile.xp} /></p>
          <p className="text-[9px] text-muted-foreground font-medium">XP</p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 gap-2.5">
        {quickActions.map((action) => (
          <motion.button
            key={action.id}
            onClick={() => handleNavigate(action.page)}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col p-3.5 glass-card-hover group relative overflow-hidden w-full text-left border border-white/5"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500`} />
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-md ring-1 ring-white/20 mb-2.5 relative z-10`}>
              {action.icon}
            </div>
            <span className="text-sm font-semibold text-foreground relative z-10">{action.label}</span>
            <span className="text-[10px] text-muted-foreground relative z-10 mt-0.5">{action.desc}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Daily Challenge */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground">Daily Challenge</h2>
          {profile.dailyChallengeCompleted && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
              Completed ✓
            </span>
          )}
        </div>
        <motion.button
          onClick={() => handleNavigate('puzzles')}
          className={`w-full glass-card-hover group relative overflow-hidden rounded-xl p-3 flex items-center gap-3 text-left border ${
            profile.dailyChallengeCompleted ? 'border-amber-500/30' : 'border-white/5'
          }`}
        >
          <div className="relative overflow-hidden rounded-lg flex-shrink-0 shadow-md ring-1 ring-white/10" style={{ width: 64, height: 64 }}>
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
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Today's Puzzle</span>
            </div>
            <p className="text-sm font-semibold text-foreground truncate">{dailyPuzzle.title}</p>
            <div className="flex items-center gap-1 mt-1">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-xs text-primary">+{dailyPuzzle.xpReward} XP</span>
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

      {/* Weekly Missions */}
      {profile.weeklyMissions.length > 0 && (
        <motion.div variants={staggerItem}>
          <h2 className="text-sm font-semibold text-foreground mb-2">Weekly Missions</h2>
          <WeeklyMissions missions={profile.weeklyMissions} />
        </motion.div>
      )}

      {/* Streak Widget */}
      <motion.div variants={staggerItem} className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{profile.streak} 🔥</p>
              <p className="text-[10px] text-muted-foreground">Day Streak · Best: {profile.bestStreak}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-amber-500/10">
          {(() => {
            const today = new Date()
            const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
            const weekDates = Array.from({ length: 7 }, (_, i) => {
              const d = new Date(today)
              const dow = today.getDay() === 0 ? 6 : today.getDay() - 1
              d.setDate(today.getDate() - dow + i)
              return d
            })
            return weekDates.map((date, idx) => {
              const dateKey = date.toDateString()
              const isToday = date.toDateString() === today.toDateString()
              const hasActivity = (profile.activityDates[dateKey] || 0) > 0
              const isFuture = date > today
              return (
                <div key={idx} className="flex flex-col items-center gap-0.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    isFuture ? 'bg-secondary/30 text-muted-foreground/30' :
                    hasActivity ? 'bg-amber-500 text-white' :
                    isToday ? 'bg-secondary border border-amber-500/40 text-amber-500' :
                    'bg-secondary text-muted-foreground'
                  }`}>
                    {hasActivity ? '✓' : days[idx]}
                  </div>
                </div>
              )
            })
          })()}
        </div>
      </motion.div>

      {/* Chess Tip */}
      <motion.div variants={staggerItem} className="rounded-xl bg-accent/5 border border-accent/15 p-3.5">
        <div className="flex items-start gap-2.5">
          <span className="text-lg">💡</span>
          <div>
            <p className="text-[10px] font-semibold text-accent mb-0.5">Tip of the Day</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

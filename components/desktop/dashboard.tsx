'use client'

import { useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '@/lib/game-context'
import { useSettings } from '@/lib/settings-context'
import { getLevelInfo, getDailyPuzzleIndex } from '@/lib/chess-store'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import { MiniChessboard } from '@/components/chess/chessboard'
import { AnimatedCounter } from '@/components/ui/animated-components'
import { OdometerCounter, TypewriterText, RevealGrid } from '@/components/ui/effects'
import { StreakWarning, NextAchievementPreview } from '@/components/ui/game-rewards'
import { PUZZLES, OPENINGS } from '@/lib/chess-data'
import { WeeklyMissions } from '@/components/ui/weekly-missions'
import { ActivityHeatmap } from '@/components/ui/activity-heatmap'
import {
  Trophy,
  Flame,
  Puzzle,
  BookOpen,
  Swords,
  Target,
  ChevronRight,
  Zap,
  Crown,
  TrendingUp,
  Calendar,
  Clock,
  Star,
  Award,
  Play,
  Sparkles,
} from 'lucide-react'



interface DesktopDashboardProps {
  onNavigate: (page: string) => void
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

export function DesktopDashboard({ onNavigate }: DesktopDashboardProps) {
  const { profile, claimDailyBonus } = useGame()
  const { settings } = useSettings()
  const { playSound } = useSoundAndHaptics()
  const { currentLevel, nextLevel, progress, xpIntoLevel, xpForLevel } = getLevelInfo(profile.xp)
  const dailyPuzzleIndex = getDailyPuzzleIndex(PUZZLES.length)
  const dailyPuzzle = PUZZLES[dailyPuzzleIndex]
  const dailyBonusChecked = useRef(false)

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

  const handleNavigate = useCallback((page: string) => {
    playSound('click')
    onNavigate(page)
  }, [playSound, onNavigate])

  const stats = [
    { label: 'Puzzles Solved', value: profile.puzzlesSolved, icon: <Puzzle className="w-5 h-5" />, colorClass: 'text-amber-400', bgClass: 'bg-amber-500/10', hoverCard: 'stat-card-amber' },
    { label: 'Current Streak', value: profile.streak, icon: <Flame className="w-5 h-5" />, colorClass: 'text-orange-400', bgClass: 'bg-orange-500/10', hoverCard: 'stat-card-orange' },
    { label: 'Puzzle Rating', value: profile.puzzleRating || 800, icon: <TrendingUp className="w-5 h-5" />, colorClass: 'text-blue-400', bgClass: 'bg-blue-500/10', hoverCard: 'stat-card-blue' },
    { label: 'Achievements', value: profile.achievements.filter(a => a.earned).length, icon: <Trophy className="w-5 h-5" />, colorClass: 'text-amber-400', bgClass: 'bg-amber-500/10', hoverCard: 'stat-card-amber' },
  ]

  const quickActions = [
    { id: 'puzzles', label: 'Tactical Puzzles', description: 'Sharpen your tactical vision', icon: <Puzzle className="w-7 h-7" />, gradient: 'from-amber-500 to-orange-600' },
    { id: 'openings', label: 'Opening Theory', description: 'Master the opening moves', icon: <BookOpen className="w-7 h-7" />, gradient: 'from-blue-500 to-indigo-600' },
    { id: 'play', label: 'Play vs AI', description: 'Test your skills against computer', icon: <Swords className="w-7 h-7" />, gradient: 'from-violet-500 to-purple-600' },
    { id: 'traps', label: 'Opening Traps', description: 'Learn devastating traps', icon: <Target className="w-7 h-7" />, gradient: 'from-rose-500 to-pink-600' },
  ]

  return (
    <div
      className="p-8 max-w-7xl mx-auto"
    >
      {/* Hero Header */}
      <div className="mb-10">
        <div className="glass-card p-10 relative overflow-hidden accent-line-top" >
          {/* Background decoration orbs */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-primary/[0.06] to-transparent rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-gradient-to-tr from-blue-500/[0.04] to-transparent rounded-full -translate-x-1/4 translate-y-1/4" />
          <div className="absolute top-1/2 right-1/4 w-[200px] h-[200px] bg-gradient-to-br from-purple-500/[0.03] to-transparent rounded-full" />

          <div className="flex items-center justify-between relative z-10">
            <div>
              <motion.p
                className="text-sm font-medium text-primary/80 mb-3 flex items-center gap-1.5 tracking-wide uppercase"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Sparkles className="w-4 h-4" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </motion.p>
              <motion.h1
                className="text-5xl xl:text-6xl font-display font-bold hero-text-large mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                Welcome back,<br />
                <TypewriterText text={profile.username + '.'} speed={60} delay={600} />
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex items-center gap-4 mt-6"
              >
                <button
                  onClick={() => handleNavigate('puzzles')}
                  className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2"
                >
                  <Play className="w-4 h-4" fill="currentColor" />
                  Continue Training
                </button>
                <p className="text-muted-foreground text-sm">
                  Resume your chess mastery journey
                </p>
              </motion.div>
            </div>
            <div
              className="flex items-center gap-6"
            >
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Level</p>
                <p className="text-4xl font-display font-bold text-foreground">{currentLevel.level}</p>
                <p className="text-sm text-primary font-medium">{currentLevel.title}</p>
              </div>
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center relative overflow-hidden shadow-lg shadow-amber-500/20">
                <Crown className="w-10 h-10 text-white relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="mb-10">
        <div className="glass-card p-7 relative overflow-hidden">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Experience</p>
                <p className="text-xl font-display font-bold text-foreground">
                  <AnimatedCounter value={profile.xp} duration={1.5} suffix=" XP" />
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Progress</p>
              <p className="text-xl font-display font-bold text-primary">
                <AnimatedCounter value={Math.round(progress)} suffix="%" />
              </p>
            </div>
          </div>
          <div className="h-3 rounded-full xp-bar-track overflow-hidden" role="progressbar" aria-valuenow={Math.min(Math.round(progress), 100)} aria-valuemin={0} aria-valuemax={100} aria-label="XP progress">
            <div
              className="h-full rounded-full xp-bar-fill relative transition-all duration-700 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <p className="text-xs text-muted-foreground">{xpIntoLevel} / {xpForLevel} XP</p>
            {nextLevel.level !== currentLevel.level && (
              <p className="text-xs text-muted-foreground">Next: <span className="text-primary font-medium">{nextLevel.title}</span></p>
            )}
          </div>
        </div>
      </div>

      {/* Welcome banner for new users */}
      {profile.xp === 0 && profile.puzzlesSolved === 0 && (
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">👋 Welcome to ChessVault!</h2>
            <p className="text-sm text-muted-foreground">Start with a quick puzzle to earn your first XP and unlock achievements.</p>
          </div>
          <motion.button
            onClick={() => onNavigate('puzzles')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl bg-amber-500 text-white text-sm font-semibold shrink-0 ml-4"
          >
            Solve First Puzzle →
          </motion.button>
        </div>
      )}

      {/* Stats Grid */}
      <RevealGrid className="grid grid-cols-4 gap-5 mb-6" staggerDelay={100}>
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`glass-card p-6 group cursor-default relative overflow-hidden ${stat.hoverCard} hover:border-white/10 transition-all duration-300 hover:shadow-lg`}
          >
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className={`w-11 h-11 rounded-xl ${stat.bgClass} flex items-center justify-center ${stat.colorClass} transition-transform duration-300 group-hover:scale-110`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-4xl font-display font-bold text-foreground mb-1.5 relative z-10">
              <OdometerCounter value={typeof stat.value === 'number' ? stat.value : 0} />
            </p>
            <p className="text-sm text-muted-foreground relative z-10">{stat.label}</p>
          </div>
        ))}
      </RevealGrid>

      {/* Activity Heatmap */}
      <div className="mb-10">
        <div className="glass-card p-5">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">Activity (last 52 weeks)</p>
          <ActivityHeatmap activityDates={profile.activityDates} compact />
        </div>
      </div>

      {/* Streak Warning + Combo + Achievement Progress */}
      <div className="grid grid-cols-3 gap-4">
        <StreakWarning />
        {profile.combo > 0 && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <span className="text-xl">🔥</span>
            <div>
              <span className="text-sm font-bold text-orange-400">{profile.combo}x Combo</span>
              <p className="text-[10px] text-orange-400/70">Keep solving for bonus XP!</p>
            </div>
          </div>
        )}
        <NextAchievementPreview />
      </div>

      <div className="grid grid-cols-3 gap-7">
        {/* Left Column - Quick Actions */}
        <div className="col-span-2 space-y-7">
          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-5 tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" /> Quick Start
            </h2>
            <RevealGrid className="grid grid-cols-2 gap-5" staggerDelay={120}>
              {quickActions.map((action, i) => (
                  <div
                    key={action.id}
                    className="glass-card p-7 text-left group relative overflow-hidden cursor-pointer h-full border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-black/20"
                    onClick={() => handleNavigate(action.id)}
                  >
                    {/* Hover gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500`} />

                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-5 shadow-[0_8px_16px_rgba(0,0,0,0.3)] relative z-10 ring-1 ring-white/20`}>
                      <span className="text-white drop-shadow-md">{action.icon}</span>
                    </div>
                    <h3 className="text-lg font-display font-semibold text-foreground mb-1.5 relative z-10 transition-colors">{action.label}</h3>
                    <p className="text-sm text-muted-foreground relative z-10 leading-relaxed">{action.description}</p>
                    <div className="flex items-center gap-1 mt-6 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-10px] group-hover:translate-x-0 relative z-10">
                      Start now <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
              ))}
            </RevealGrid>
          </div>

          {/* Weekly Missions */}
          {profile.weeklyMissions.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Weekly Missions</h2>
              <WeeklyMissions missions={profile.weeklyMissions} />
            </div>
          )}

          {/* Featured Opening */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-semibold text-foreground">Featured Opening</h2>
              <button
                onClick={() => handleNavigate('openings')}
                className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <motion.button
              onClick={() => handleNavigate('openings')}
              className="w-full glass-card-hover p-6 flex items-center gap-6 text-left group"

            >
              <div className="rounded-2xl overflow-hidden ring-1 ring-white/5 relative z-10" style={{ width: 120, height: 120 }}>
                <MiniChessboard fen={OPENINGS[0].fen} size={120} boardStyle={settings.boardStyle} pieceStyle={settings.pieceStyle} />
              </div>
              <div className="flex-1 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {OPENINGS[0].eco}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary text-muted-foreground capitalize">
                    {OPENINGS[0].difficulty}
                  </span>
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">{OPENINGS[0].name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{OPENINGS[0].description}</p>
              </div>
              <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all relative z-10" />
            </motion.button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-7">
          {/* Daily Challenge */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-semibold text-foreground tracking-tight">Daily Challenge</h2>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-1.5 rounded-xl glass-card border border-white/5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
            <motion.button
              onClick={() => handleNavigate('puzzles')}
              className="w-full glass-card-hover p-7 text-left relative overflow-hidden group border border-white/5 hover:border-white/10"

            >
              {profile.dailyChallengeCompleted && (
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-semibold flex items-center gap-1 border border-amber-500/20 z-10 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                  <Star className="w-3 h-3" /> Completed
                </div>
              )}
              {/* Subtle accent glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 group-hover:bg-primary/10 transition-colors duration-500" />

              <div className="flex justify-center mb-6 relative z-10">
                <div className="rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.4)] ring-1 ring-white/10 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300 transform group-hover:-translate-y-1" style={{ width: 180, height: 180 }}>
                  <MiniChessboard fen={dailyPuzzle?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'} size={180} boardStyle={settings.boardStyle} pieceStyle={settings.pieceStyle} />
                </div>
              </div>
              <div className="flex items-center justify-between mb-5 relative z-10">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${dailyPuzzle?.difficulty === 'easy' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]' :
                  dailyPuzzle?.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]' :
                    'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                  }`}>
                  {dailyPuzzle?.difficulty}
                </span>
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                  <Clock className="w-3 h-3" /> {dailyPuzzle?.moves.length || 0} moves
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-semibold border border-primary/20 group-hover:from-primary/20 group-hover:to-primary/10 transition-all btn-shine relative z-10 shadow-inner inline-flex w-full">
                <Play className="w-4 h-4" fill="currentColor" />
                {profile.dailyChallengeCompleted ? 'Play Again' : 'Solve Now'}
              </div>
            </motion.button>
          </div>

          {/* Recent Games */}
          {profile.recentGames && profile.recentGames.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-display font-semibold text-foreground">Recent Games</h2>
                <button
                  onClick={() => handleNavigate('profile')}
                  className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
                >
                  View all <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="glass-card p-5 space-y-1">
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
                      <p className="text-sm font-medium text-foreground truncate">vs {game.opponent}</p>
                      <p className="text-xs text-muted-foreground">{game.moves} moves</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Achievements */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-semibold text-foreground">Achievements</h2>
              <button
                onClick={() => handleNavigate('profile')}
                className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="glass-card p-5 space-y-2">
              {profile.achievements.slice(0, 4).map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${achievement.earned
                    ? 'bg-primary/[0.04] hover:bg-primary/[0.07]'
                    : 'opacity-40 hover:opacity-60'
                    }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${achievement.earned ? 'bg-primary/10' : 'bg-secondary'
                    }`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                  </div>
                  {achievement.earned && (
                    <Award className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chess Tip of the Day */}
          <div className="rounded-xl bg-blue-500/5 border border-blue-500/15 p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <p className="text-xs font-semibold text-blue-400 mb-1">Chess Tip of the Day</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{tip}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

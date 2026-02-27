'use client'

import { motion } from 'framer-motion'
import { useGame } from '@/lib/game-context'
import { useSettings } from '@/lib/settings-context'
import { getLevelInfo, getDailyPuzzleIndex } from '@/lib/chess-store'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import { MiniChessboard } from '@/components/chess/chessboard'
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
  Crown,
  TrendingUp,
  Calendar,
  Clock,
  Star,
  Award,
  Play,
  Sparkles,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] } },
}

interface DesktopDashboardProps {
  onNavigate: (page: string) => void
}

export function DesktopDashboard({ onNavigate }: DesktopDashboardProps) {
  const { profile } = useGame()
  const { settings } = useSettings()
  const { playSound } = useSoundAndHaptics()
  const { currentLevel, nextLevel, progress, xpIntoLevel, xpForLevel } = getLevelInfo(profile.xp)
  const dailyPuzzleIndex = getDailyPuzzleIndex(PUZZLES.length)
  const dailyPuzzle = PUZZLES[dailyPuzzleIndex]

  const handleNavigate = (page: string) => {
    playSound('click')
    onNavigate(page)
  }

  const stats = [
    { label: 'Puzzles Solved', value: profile.puzzlesSolved, icon: <Puzzle className="w-5 h-5" />, color: 'emerald', colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10', hoverCard: 'stat-card-emerald' },
    { label: 'Current Streak', value: profile.streak, icon: <Flame className="w-5 h-5" />, color: 'orange', colorClass: 'text-orange-400', bgClass: 'bg-orange-500/10', hoverCard: 'stat-card-orange' },
    { label: 'Puzzle Rating', value: profile.puzzleRating || 800, icon: <TrendingUp className="w-5 h-5" />, color: 'blue', colorClass: 'text-blue-400', bgClass: 'bg-blue-500/10', hoverCard: 'stat-card-blue' },
    { label: 'Achievements', value: profile.achievements.filter(a => a.earned).length, icon: <Trophy className="w-5 h-5" />, color: 'amber', colorClass: 'text-amber-400', bgClass: 'bg-amber-500/10', hoverCard: 'stat-card-amber' },
  ]

  const quickActions = [
    { id: 'puzzles', label: 'Tactical Puzzles', description: 'Sharpen your tactical vision', icon: <Puzzle className="w-6 h-6" />, gradient: 'from-emerald-500 to-teal-600', shadowColor: 'shadow-emerald-500/20' },
    { id: 'openings', label: 'Opening Theory', description: 'Master the opening moves', icon: <BookOpen className="w-6 h-6" />, gradient: 'from-blue-500 to-indigo-600', shadowColor: 'shadow-blue-500/20' },
    { id: 'play', label: 'Play vs AI', description: 'Test your skills against computer', icon: <Swords className="w-6 h-6" />, gradient: 'from-violet-500 to-purple-600', shadowColor: 'shadow-violet-500/20' },
    { id: 'traps', label: 'Opening Traps', description: 'Learn devastating traps', icon: <Target className="w-6 h-6" />, gradient: 'from-rose-500 to-pink-600', shadowColor: 'shadow-rose-500/20' },
  ]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-8 max-w-7xl mx-auto"
    >
      {/* Hero Header */}
      <motion.div variants={item} className="mb-8">
        <div className="glass-card p-8 relative overflow-hidden">
          {/* Gradient accent line at top */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/[0.06] to-transparent rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/[0.04] to-transparent rounded-full -translate-x-1/4 translate-y-1/4" />

          <div className="flex items-center justify-between relative">
            <div>
              <motion.p
                className="text-sm font-medium text-primary mb-1 flex items-center gap-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Sparkles className="w-4 h-4" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </motion.p>
              <h1 className="text-4xl font-display font-bold gradient-text-hero mb-2">
                Welcome back, {profile.username}!
              </h1>
              <p className="text-muted-foreground text-base">
                Continue your chess mastery journey
              </p>
            </div>
            <div className="flex items-center gap-5">
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Current Level</p>
                <p className="text-3xl font-display font-bold text-foreground">{currentLevel.level}</p>
                <p className="text-sm text-primary font-medium">{currentLevel.title}</p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-600 flex items-center justify-center relative overflow-hidden">
                <Crown className="w-9 h-9 text-white relative z-10" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* XP Progress */}
      <motion.div variants={item} className="mb-8">
        <div className="glass-card p-6 relative overflow-hidden">
          {/* Subtle animated border glow */}
          <div className="absolute inset-0 rounded-2xl animate-border-glow" style={{ border: '1px solid transparent' }} />

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Experience Points</p>
                <p className="text-lg font-display font-bold text-foreground">{profile.xp.toLocaleString()} XP</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Progress</p>
              <p className="text-lg font-display font-bold text-primary">{Math.round(progress)}%</p>
            </div>
          </div>
          <div className="h-3.5 rounded-full xp-bar-track overflow-hidden">
            <motion.div
              className="h-full rounded-full xp-bar-fill relative"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              {/* Shimmer effect on progress bar */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </motion.div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">{xpIntoLevel} / {xpForLevel} XP</p>
            {nextLevel.level !== currentLevel.level && (
              <p className="text-xs text-muted-foreground">Next: <span className="text-primary font-medium">{nextLevel.title}</span></p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className={`glass-card p-5 group cursor-default transition-all duration-500 ${stat.hoverCard}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * index, duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bgClass} flex items-center justify-center ${stat.colorClass} transition-transform duration-300 group-hover:scale-110`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-3xl font-display font-bold text-foreground mb-1 transition-colors">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Quick Actions */}
        <motion.div variants={item} className="col-span-2 space-y-6">
          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-display font-semibold text-foreground mb-4">Quick Start</h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <motion.button
                  key={action.id}
                  onClick={() => handleNavigate(action.id)}
                  className="glass-card-hover p-6 text-left group relative overflow-hidden"
                >
                  {/* Hover gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-lg ${action.shadowColor}`}>
                    <span className="text-white">{action.icon}</span>
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-1">{action.label}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                  <div className="flex items-center gap-1 mt-4 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1">
                    Start now <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Featured Opening */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold text-foreground">Featured Opening</h2>
              <button
                onClick={() => handleNavigate('openings')}
                className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <motion.button
              onClick={() => handleNavigate('openings')}
              className="w-full glass-card-hover p-5 flex items-center gap-5 text-left group"
            >
              <div className="rounded-xl overflow-hidden ring-1 ring-white/5" style={{ width: 120, height: 120 }}>
                <MiniChessboard fen={OPENINGS[0].fen} size={120} boardStyle={settings.boardStyle} pieceStyle={settings.pieceStyle} />
              </div>
              <div className="flex-1">
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
              <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </motion.button>
          </div>
        </motion.div>

        {/* Right Column */}
        <motion.div variants={item} className="space-y-6">
          {/* Daily Challenge */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold text-foreground">Daily Challenge</h2>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 py-1 rounded-lg bg-secondary/50">
                <Calendar className="w-3.5 h-3.5" />
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
            <motion.button
              onClick={() => handleNavigate('puzzles')}
              className="w-full glass-card-hover p-5 text-left relative overflow-hidden group"
            >
              {profile.dailyChallengeCompleted && (
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium flex items-center gap-1 border border-emerald-500/20">
                  <Star className="w-3 h-3" /> Completed
                </div>
              )}
              <div className="flex justify-center mb-4">
                <div className="rounded-xl overflow-hidden shadow-lg ring-1 ring-white/5 group-hover:shadow-xl transition-shadow" style={{ width: 160, height: 160 }}>
                  <MiniChessboard fen={dailyPuzzle?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'} size={160} boardStyle={settings.boardStyle} pieceStyle={settings.pieceStyle} />
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${dailyPuzzle?.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  dailyPuzzle?.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                  {dailyPuzzle?.difficulty}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {dailyPuzzle?.moves.length || 0} moves
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 text-primary font-semibold border border-primary/10 group-hover:from-primary/15 group-hover:to-primary/10 transition-all">
                <Play className="w-4 h-4" />
                {profile.dailyChallengeCompleted ? 'Play Again' : 'Solve Now'}
              </div>
            </motion.button>
          </div>

          {/* Recent Achievements */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-semibold text-foreground">Achievements</h2>
              <button
                onClick={() => handleNavigate('profile')}
                className="text-sm text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="glass-card p-4 space-y-2">
              {profile.achievements.slice(0, 4).map((achievement) => (
                <motion.div
                  key={achievement.id}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 ${achievement.earned
                    ? 'bg-primary/[0.04] hover:bg-primary/[0.07]'
                    : 'opacity-40 hover:opacity-60'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${achievement.earned ? 'bg-primary/10' : 'bg-secondary'
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
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

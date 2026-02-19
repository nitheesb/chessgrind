'use client'

import { motion } from 'framer-motion'
import { useGame } from '@/lib/game-context'
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
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

interface DesktopDashboardProps {
  onNavigate: (page: string) => void
}

export function DesktopDashboard({ onNavigate }: DesktopDashboardProps) {
  const { profile } = useGame()
  const { playSound } = useSoundAndHaptics()
  const { currentLevel, progress } = getLevelInfo(profile.xp)
  const dailyPuzzleIndex = getDailyPuzzleIndex(PUZZLES.length)
  const dailyPuzzle = PUZZLES[dailyPuzzleIndex]

  const handleNavigate = (page: string) => {
    playSound('click')
    onNavigate(page)
  }

  const stats = [
    { label: 'Puzzles Solved', value: profile.puzzlesSolved, icon: <Puzzle className="w-5 h-5" />, color: 'text-emerald-500' },
    { label: 'Current Streak', value: profile.streak, icon: <Flame className="w-5 h-5" />, color: 'text-orange-500' },
    { label: 'Puzzle Rating', value: profile.puzzleRating || 800, icon: <TrendingUp className="w-5 h-5" />, color: 'text-blue-500' },
    { label: 'Achievements', value: profile.achievements.filter(a => a.earned).length, icon: <Trophy className="w-5 h-5" />, color: 'text-amber-500' },
  ]

  const quickActions = [
    { id: 'puzzles', label: 'Tactical Puzzles', description: 'Sharpen your tactical vision', icon: <Puzzle className="w-6 h-6" />, gradient: 'from-emerald-500 to-teal-600' },
    { id: 'openings', label: 'Opening Theory', description: 'Master the opening moves', icon: <BookOpen className="w-6 h-6" />, gradient: 'from-blue-500 to-indigo-600' },
    { id: 'play', label: 'Play vs AI', description: 'Test your skills against computer', icon: <Swords className="w-6 h-6" />, gradient: 'from-purple-500 to-violet-600' },
    { id: 'traps', label: 'Opening Traps', description: 'Learn devastating traps', icon: <Target className="w-6 h-6" />, gradient: 'from-red-500 to-rose-600' },
  ]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-8 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={item} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              Welcome back, {profile.username}!
            </h1>
            <p className="text-muted-foreground">
              Continue your chess mastery journey
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current Level</p>
              <p className="text-2xl font-bold text-foreground">Level {currentLevel.level}</p>
              <p className="text-xs text-muted-foreground">{currentLevel.title}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* XP Progress */}
      <motion.div variants={item} className="mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Experience Points</p>
                <p className="text-lg font-semibold text-foreground">{profile.xp.toLocaleString()} XP</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Next level in</p>
              <p className="text-lg font-semibold text-foreground">{Math.round(100 - progress)}%</p>
            </div>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            className="glass-card p-5 group hover:border-primary/30 transition-all cursor-default"
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Quick Actions */}
        <motion.div variants={item} className="col-span-2 space-y-6">
          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Start</h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <motion.button
                  key={action.id}
                  onClick={() => handleNavigate(action.id)}
                  className="glass-card-hover p-5 text-left group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}>
                    <span className="text-white">{action.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{action.label}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                  <div className="flex items-center gap-1 mt-3 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Start now <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Featured Opening */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Featured Opening</h2>
              <button
                onClick={() => handleNavigate('openings')}
                className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <motion.button
              onClick={() => handleNavigate('openings')}
              className="w-full glass-card-hover p-5 flex items-center gap-5 text-left"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="rounded-xl overflow-hidden shadow-lg" style={{ width: 120, height: 120 }}>
                <MiniChessboard fen={OPENINGS[0].fen} size={120} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {OPENINGS[0].eco}
                  </span>
                  <span className="px-2 py-1 rounded-lg text-xs font-medium bg-secondary text-muted-foreground capitalize">
                    {OPENINGS[0].difficulty}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{OPENINGS[0].name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{OPENINGS[0].description}</p>
              </div>
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
            </motion.button>
          </div>
        </motion.div>

        {/* Right Column */}
        <motion.div variants={item} className="space-y-6">
          {/* Daily Challenge */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Daily Challenge</h2>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
            <motion.button
              onClick={() => handleNavigate('puzzles')}
              className="w-full glass-card-hover p-5 text-left relative overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {profile.dailyChallengeCompleted && (
                <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" /> Completed
                </div>
              )}
              <div className="flex justify-center mb-4">
                <div className="rounded-xl overflow-hidden shadow-lg" style={{ width: 160, height: 160 }}>
                  <MiniChessboard fen={dailyPuzzle?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'} size={160} />
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${dailyPuzzle?.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-500' :
                    dailyPuzzle?.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-red-500/10 text-red-500'
                  }`}>
                  {dailyPuzzle?.difficulty}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {dailyPuzzle?.moves.length || 0} moves
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 py-2 rounded-lg bg-primary/10 text-primary font-medium">
                <Play className="w-4 h-4" />
                {profile.dailyChallengeCompleted ? 'Play Again' : 'Solve Now'}
              </div>
            </motion.button>
          </div>

          {/* Recent Achievements */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Achievements</h2>
              <button
                onClick={() => handleNavigate('profile')}
                className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="glass-card p-4 space-y-3">
              {profile.achievements.slice(0, 4).map((achievement) => (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-all ${achievement.earned ? 'bg-primary/5' : 'opacity-50'
                    }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${achievement.earned ? 'bg-primary/10' : 'bg-secondary'
                    }`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                  </div>
                  {achievement.earned && (
                    <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

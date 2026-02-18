'use client'

import { motion } from 'framer-motion'
import { useGame } from '@/lib/game-context'
import { getLevelInfo, getDailyPuzzleIndex } from '@/lib/chess-store'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import { XPBar, StatCard } from '@/components/ui/xp-animations'
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
  TrendingUp,
  Calendar,
  Settings,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

interface DashboardProps {
  onNavigate: (page: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { profile } = useGame()
  const { playSound, triggerHaptic } = useSoundAndHaptics()
  const { currentLevel, progress } = getLevelInfo(profile.xp)

  const dailyPuzzleIndex = getDailyPuzzleIndex(PUZZLES.length)
  const dailyPuzzle = PUZZLES[dailyPuzzleIndex]

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
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 pb-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <span className="text-xl font-bold text-white">{profile.username.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">{profile.username}</h1>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Level {currentLevel.level}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-primary font-medium">{currentLevel.title}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => handleNavigate('settings')}
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={item} className="grid grid-cols-3 gap-2">
        <div className="bg-secondary rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
            <Zap className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-foreground">{profile.xp}</p>
          <p className="text-[10px] text-muted-foreground">XP</p>
        </div>
        <div className="bg-secondary rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
            <Flame className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-foreground">{profile.streak}</p>
          <p className="text-[10px] text-muted-foreground">Day Streak</p>
        </div>
        <div className="bg-secondary rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-lg font-bold text-foreground">{profile.rating}</p>
          <p className="text-[10px] text-muted-foreground">Rating</p>
        </div>
      </motion.div>

      {/* Level Progress */}
      <motion.div variants={item} className="bg-secondary rounded-xl p-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-muted-foreground">Level {currentLevel.level}</span>
          <span className="text-primary font-medium">{Math.round(progress)}%</span>
        </div>
        <XPBar />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="grid grid-cols-4 gap-2">
        {quickActions.map((action) => (
          <motion.button
            key={action.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavigate(action.page)}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary active:bg-secondary/70 transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white shadow-sm`}>
              {action.icon}
            </div>
            <span className="text-[11px] font-medium text-foreground">{action.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Daily Challenge */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground">Daily Challenge</h2>
          {profile.dailyChallengeCompleted && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 font-medium">
              Completed ✓
            </span>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => handleNavigate('puzzles')}
          className="w-full bg-secondary rounded-xl p-3 flex items-center gap-3 text-left"
        >
          <div className="relative overflow-hidden rounded-lg flex-shrink-0" style={{ width: 64, height: 64 }}>
            <MiniChessboard fen={dailyPuzzle.fen} size={64} />
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
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </motion.button>
      </motion.div>

      {/* Continue Learning */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground">Continue Learning</h2>
          <button
            onClick={() => handleNavigate('openings')}
            className="text-xs text-primary font-medium"
          >
            See all
          </button>
        </div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => handleNavigate('openings')}
          className="w-full bg-secondary rounded-xl p-3 flex items-center gap-3 text-left"
        >
          <div className="overflow-hidden rounded-lg flex-shrink-0" style={{ width: 64, height: 64 }}>
            <MiniChessboard fen={OPENINGS[0].fen} size={64} />
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
      <motion.div variants={item}>
        <h2 className="text-sm font-semibold text-foreground mb-2">Your Progress</h2>
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            label="Games Played"
            value={profile.gamesPlayed}
            icon={<Swords className="w-4 h-4" />}
          />
          <StatCard
            label="Puzzles Solved"
            value={profile.puzzlesSolved}
            icon={<Puzzle className="w-4 h-4" />}
          />
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-foreground">Achievements</h2>
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

'use client'

import { motion } from 'framer-motion'
import { useGame } from '@/lib/game-context'
import { getLevelInfo } from '@/lib/chess-store'
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
  Crown,
  Shield,
  TrendingUp,
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
  show: { opacity: 1, y: 0 },
}

interface DashboardProps {
  onNavigate: (page: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { profile } = useGame()
  const { currentLevel, progress } = getLevelInfo(profile.xp)

  const quickActions = [
    {
      id: 'puzzles',
      label: 'Puzzles',
      description: 'Train your tactics',
      icon: <Puzzle className="w-5 h-5" />,
      color: 'bg-primary/10 text-primary border-primary/20',
      page: 'puzzles',
    },
    {
      id: 'openings',
      label: 'Openings',
      description: 'Learn new lines',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
      page: 'openings',
    },
    {
      id: 'play',
      label: 'Play AI',
      description: 'Test your skills',
      icon: <Swords className="w-5 h-5" />,
      color: 'bg-accent/10 text-accent border-accent/20',
      page: 'play',
    },
    {
      id: 'traps',
      label: 'Traps',
      description: 'Learn sneaky tricks',
      icon: <Target className="w-5 h-5" />,
      color: 'bg-red-400/10 text-red-400 border-red-400/20',
      page: 'traps',
    },
  ]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-5 pb-8"
    >
      {/* Header / Welcome */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Welcome back</p>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {profile.username}
          </h1>
        </div>
        <button
          onClick={() => onNavigate('profile')}
          className="relative w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center hover:border-primary/60 transition-colors"
        >
          <Crown className="w-6 h-6 text-primary" />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center text-[10px] font-bold text-foreground">
            {currentLevel.level}
          </span>
        </button>
      </motion.div>

      {/* XP Progress */}
      <motion.div variants={item} className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{currentLevel.title}</p>
              <p className="text-xs text-muted-foreground">Level {currentLevel.level}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20">
              <Flame className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-bold text-accent">{profile.streak}</span>
            </div>
          </div>
        </div>
        <XPBar />
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>{profile.xp} total XP</span>
          <span className="text-primary">{Math.round(progress)}% to next level</span>
        </div>
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div variants={item}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Start Learning
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <motion.button
              key={action.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate(action.page)}
              className={`flex flex-col items-start gap-2 p-4 rounded-xl border ${action.color} text-left transition-all active:scale-95`}
            >
              {action.icon}
              <div>
                <p className="text-sm font-semibold">{action.label}</p>
                <p className="text-[10px] opacity-70">{action.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={item}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Your Progress
        </h2>
        <div className="grid grid-cols-2 gap-3">
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
          <StatCard
            label="Rating"
            value={profile.rating}
            icon={<TrendingUp className="w-4 h-4" />}
            trend="+0"
          />
          <StatCard
            label="Achievements"
            value={`${profile.achievements.filter(a => a.earned).length}/${profile.achievements.length}`}
            icon={<Trophy className="w-4 h-4" />}
          />
        </div>
      </motion.div>

      {/* Daily Challenge */}
      <motion.div variants={item}>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Daily Challenge
        </h2>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('puzzles')}
          className="w-full glass-card-hover p-4 flex items-center gap-4 text-left"
        >
          <div className="relative overflow-hidden rounded-lg" style={{ width: 80, height: 80 }}>
            <MiniChessboard fen={PUZZLES[0].fen} size={80} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent/10 text-accent border border-accent/20">
                DAILY
              </span>
              {profile.dailyChallengeCompleted && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                  DONE
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-foreground truncate">{PUZZLES[0].title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{PUZZLES[0].description}</p>
            <div className="flex items-center gap-1 mt-1.5">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-xs text-primary font-medium">+{PUZZLES[0].xpReward} XP</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </motion.button>
      </motion.div>

      {/* Featured Opening */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Featured Opening
          </h2>
          <button
            onClick={() => onNavigate('openings')}
            className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
          >
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('openings')}
          className="w-full glass-card-hover p-4 flex items-center gap-4 text-left"
        >
          <div className="relative overflow-hidden rounded-lg" style={{ width: 80, height: 80 }}>
            <MiniChessboard fen={OPENINGS[0].fen} size={80} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{OPENINGS[0].name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{OPENINGS[0].description}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                {OPENINGS[0].eco}
              </span>
              <span className="text-[10px] text-muted-foreground capitalize">{OPENINGS[0].difficulty}</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </motion.button>
      </motion.div>

      {/* Achievements Preview */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Achievements
          </h2>
          <button
            onClick={() => onNavigate('profile')}
            className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
          >
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {profile.achievements.slice(0, 6).map((achievement) => (
            <div
              key={achievement.id}
              className={`flex-shrink-0 w-20 flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                achievement.earned
                  ? 'bg-primary/5 border-primary/20'
                  : 'bg-secondary/50 border-border/30 opacity-40'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                achievement.earned ? 'bg-primary/20' : 'bg-secondary'
              }`}>
                <Shield className={`w-5 h-5 ${achievement.earned ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <p className="text-[10px] font-medium text-center text-foreground leading-tight line-clamp-2">
                {achievement.name}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

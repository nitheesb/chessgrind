'use client'

import { motion } from 'framer-motion'
import { useGame } from '@/lib/game-context'
import { getLevelInfo } from '@/lib/chess-store'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import {
  Trophy,
  Flame,
  Puzzle,
  Crown,
  Zap,
  TrendingUp,
  Calendar,
  Award,
  Star,
  BookOpen,
  Settings,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 28 } },
}

interface DesktopProfileProps {
  onNavigate: (page: string) => void
}

export function DesktopProfile({ onNavigate }: DesktopProfileProps) {
  const { profile, logout } = useGame()
  const { playSound } = useSoundAndHaptics()
  const { currentLevel, nextLevel, progress, xpIntoLevel, xpForLevel } = getLevelInfo(profile.xp)

  const stats = [
    { label: 'Puzzles Solved', value: profile.puzzlesSolved, icon: <Puzzle className="w-5 h-5" />, colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10', hoverCard: 'stat-card-emerald' },
    { label: 'Current Streak', value: profile.streak, icon: <Flame className="w-5 h-5" />, colorClass: 'text-orange-400', bgClass: 'bg-orange-500/10', hoverCard: 'stat-card-orange' },
    { label: 'Puzzle Rating', value: profile.puzzleRating || 800, icon: <TrendingUp className="w-5 h-5" />, colorClass: 'text-blue-400', bgClass: 'bg-blue-500/10', hoverCard: 'stat-card-blue' },
    { label: 'Total XP', value: profile.xp.toLocaleString(), icon: <Zap className="w-5 h-5" />, colorClass: 'text-primary', bgClass: 'bg-primary/10', hoverCard: 'stat-card-emerald' },
    { label: 'Games Played', value: profile.gamesPlayed || 0, icon: <Trophy className="w-5 h-5" />, colorClass: 'text-amber-400', bgClass: 'bg-amber-500/10', hoverCard: 'stat-card-amber' },
    { label: 'Openings Learned', value: profile.openingsLearned || 0, icon: <BookOpen className="w-5 h-5" />, colorClass: 'text-violet-400', bgClass: 'bg-violet-500/10', hoverCard: 'stat-card-blue' },
  ]

  const earnedAchievements = profile.achievements.filter(a => a.earned)
  const lockedAchievements = profile.achievements.filter(a => !a.earned)

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="p-8 max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={item} className="mb-8">
        <div className="glass-card p-8 relative overflow-hidden">
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/[0.03] to-transparent rounded-full translate-x-1/3 -translate-y-1/3" />

          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center border border-primary/20 relative overflow-hidden">
                  <span className="text-4xl font-display font-bold text-primary relative z-10">{currentLevel.level}</span>
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Info */}
              <div>
                <h1 className="text-3xl font-display font-bold gradient-text-hero mb-1">{profile.username}</h1>
                <p className="text-primary font-medium mb-3">{currentLevel.title}</p>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-sm">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-foreground font-semibold">{profile.streak}</span>
                    <span className="text-muted-foreground">day streak</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Member since {new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                onClick={() => {
                  playSound('click')
                  onNavigate('settings')
                }}
                className="px-5 py-2.5 rounded-xl bg-white/[0.04] text-muted-foreground font-medium flex items-center gap-2 hover:bg-white/[0.07] border border-white/[0.06] transition-all duration-300"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Settings className="w-5 h-5" />
                Settings
              </motion.button>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Level {currentLevel.level} — {currentLevel.title}</span>
              <span className="text-sm text-muted-foreground">{xpIntoLevel} / {xpForLevel} XP</span>
            </div>
            <div className="h-3.5 xp-bar-track rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full xp-bar-fill relative"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </motion.div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {xpForLevel - xpIntoLevel} XP to reach {nextLevel.level !== currentLevel.level ? <span className="text-primary font-medium">Level {nextLevel.level} — {nextLevel.title}</span> : <span className="text-primary font-medium">Max Level</span>}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="mb-8">
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">Statistics</h2>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className={`glass-card p-5 text-center group transition-all duration-500 ${stat.hoverCard}`}
              whileHover={{ y: -4 }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index, type: 'spring', stiffness: 300, damping: 24 }}
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bgClass} flex items-center justify-center mx-auto mb-3 ${stat.colorClass} transition-transform duration-300 group-hover:scale-110`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-display font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div variants={item}>
        <h2 className="text-lg font-display font-semibold text-foreground mb-4">
          Achievements <span className="text-sm font-normal text-muted-foreground">({earnedAchievements.length}/{profile.achievements.length})</span>
        </h2>

        {/* Earned */}
        {earnedAchievements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-primary/70 mb-3 uppercase tracking-wider">Unlocked</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {earnedAchievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  className="glass-card p-4 border-primary/10 group hover:border-primary/20 transition-all duration-500"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-amber-400" />
                        <span className="text-xs text-amber-400 font-medium capitalize">{achievement.rarity}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        {lockedAchievements.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Locked</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {lockedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="glass-card p-4 opacity-40 hover:opacity-55 transition-opacity duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl grayscale">
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                      {achievement.progress !== undefined && achievement.target && (
                        <div className="mt-2">
                          <div className="h-1.5 xp-bar-track rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary/40 rounded-full"
                              style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {achievement.progress} / {achievement.target}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

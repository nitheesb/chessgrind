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
  Target,
  BookOpen,
  Swords,
  Settings,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

interface DesktopProfileProps {
  onNavigate: (page: string) => void
}

export function DesktopProfile({ onNavigate }: DesktopProfileProps) {
  const { profile, logout } = useGame()
  const { playSound } = useSoundAndHaptics()
  const { currentLevel, progress, xpForNext } = getLevelInfo(profile.xp)

  const stats = [
    { label: 'Puzzles Solved', value: profile.puzzlesSolved, icon: <Puzzle className="w-5 h-5" />, color: 'emerald' },
    { label: 'Current Streak', value: profile.streak, icon: <Flame className="w-5 h-5" />, color: 'orange' },
    { label: 'Puzzle Rating', value: profile.puzzleRating || 800, icon: <TrendingUp className="w-5 h-5" />, color: 'blue' },
    { label: 'Total XP', value: profile.xp.toLocaleString(), icon: <Zap className="w-5 h-5" />, color: 'primary' },
    { label: 'Games Won', value: profile.gamesWon || 0, icon: <Trophy className="w-5 h-5" />, color: 'amber' },
    { label: 'Openings Learned', value: profile.openingsLearned || 0, icon: <BookOpen className="w-5 h-5" />, color: 'purple' },
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
        <div className="glass-card p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary/30">
                  <span className="text-4xl font-bold text-primary">{currentLevel}</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              </div>
              
              {/* Info */}
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">{profile.username}</h1>
                <p className="text-muted-foreground mb-3">{profile.email}</p>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-sm">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-foreground font-semibold">{profile.streak}</span>
                    <span className="text-muted-foreground">day streak</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Member since {new Date().toLocaleDateString()}</span>
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
                className="px-5 py-2.5 rounded-xl bg-secondary text-muted-foreground font-medium flex items-center gap-2 hover:bg-secondary/80"
                whileHover={{ scale: 1.02 }}
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
              <span className="text-sm font-medium text-foreground">Level {currentLevel}</span>
              <span className="text-sm text-muted-foreground">{profile.xp} / {profile.xp + xpForNext} XP</span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {xpForNext} XP to reach Level {currentLevel + 1}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Statistics</h2>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              className="glass-card p-5 text-center"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className={`w-10 h-10 rounded-xl bg-${stat.color}-500/10 flex items-center justify-center mx-auto mb-3 text-${stat.color}-500`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Achievements ({earnedAchievements.length}/{profile.achievements.length})
        </h2>
        
        {/* Earned */}
        {earnedAchievements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Unlocked</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {earnedAchievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  className="glass-card p-4 border-primary/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-amber-500" />
                        <span className="text-xs text-amber-500 font-medium capitalize">{achievement.rarity}</span>
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
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Locked</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {lockedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="glass-card p-4 opacity-50"
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
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary/50 rounded-full"
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

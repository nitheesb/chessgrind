'use client'

import { motion } from 'framer-motion'
import { useGame } from '@/lib/game-context'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import { getLevelInfo, LEVELS } from '@/lib/chess-store'
import { getRarityColor } from '@/lib/chess-data'
import { XPBar } from '@/components/ui/xp-animations'
import {
  AnimatedCounter,
  ProgressRing,
  ScrollReveal,
  staggerContainer,
  staggerItem,
} from '@/components/ui/animated-components'
import {
  ArrowLeft,
  Crown,
  Flame,
  Trophy,
  Swords,
  Puzzle,
  BookOpen,
  Target,
  TrendingUp,
  Shield,
  Star,
  LogOut,
  Medal,
  Settings,
  ChevronRight,
} from 'lucide-react'

interface ProfilePageProps {
  onBack: () => void
  onNavigate: (page: string) => void
}

export function ProfilePage({ onBack, onNavigate }: ProfilePageProps) {
  const { profile, logout } = useGame()
  const { playSound, triggerHaptic } = useSoundAndHaptics()
  const { currentLevel, progress } = getLevelInfo(profile.xp)

  const puzzleAccuracy = profile.puzzlesAttempted > 0 ? Math.round((profile.puzzlesCorrect / profile.puzzlesAttempted) * 100) : 0
  const openingsMasteredPct = Math.min(100, (profile.openingsLearned / 15) * 100)
  const trapsLearnedPct = Math.min(100, (profile.trapsLearned / 10) * 100)

  const stats = [
    { label: 'Games Played', value: profile.gamesPlayed, icon: <Swords className="w-4 h-4" /> },
    { label: 'Puzzles Solved', value: profile.puzzlesSolved, icon: <Puzzle className="w-4 h-4" /> },
    { label: 'Openings Learned', value: profile.openingsLearned, icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Traps Mastered', value: profile.trapsLearned, icon: <Target className="w-4 h-4" /> },
    { label: 'Current Streak', value: profile.streak, suffix: ' days', icon: <Flame className="w-4 h-4" /> },
    { label: 'Best Streak', value: profile.bestStreak, suffix: ' days', icon: <Star className="w-4 h-4" /> },
    { label: 'Puzzle Rating', value: profile.puzzleRating, icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Total XP', value: profile.xp, icon: <Trophy className="w-4 h-4" /> },
  ]

  const earnedAchievements = profile.achievements.filter(a => a.earned)
  const lockedAchievements = profile.achievements.filter(a => !a.earned)

  const handleLogout = () => {
    playSound('click')
    triggerHaptic('medium')
    logout()
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-5 pb-8"
    >
      {/* Header */}
      <motion.div variants={staggerItem} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-display font-bold text-foreground">Profile</h1>
        </div>
        <button
          onClick={() => onNavigate('settings')}
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
        >
          <Settings className="w-5 h-5 text-foreground" />
        </button>
      </motion.div>

      {/* Profile Card */}
      <ScrollReveal>
        <motion.div variants={staggerItem} className="relative overflow-hidden glass-card p-6 flex flex-col items-center gap-4 glow-primary breathing-glow">
          <div className="relative z-10 flex flex-col items-center gap-4 w-full">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <Crown className="w-10 h-10 text-primary" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-card border-2 border-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{currentLevel.level}</span>
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-display font-bold text-foreground shimmer-text">{profile.username}</h2>
              <p className="text-sm text-primary font-medium">{currentLevel.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Joined {new Date(profile.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="w-full">
              <XPBar />
            </div>
          </div>
        </motion.div>
      </ScrollReveal>

      {/* Level Roadmap */}
      <ScrollReveal delay={0.1}>
        <motion.div variants={staggerItem}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Level Roadmap
          </h2>
          <div className="glass-card p-4">
            <div className="flex flex-col gap-2">
              {LEVELS.filter((_, i) => i < 8).map((level) => {
                const isReached = currentLevel.level >= level.level
                const isCurrent = currentLevel.level === level.level
                return (
                  <div key={level.level} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isReached
                        ? isCurrent
                          ? 'bg-primary text-primary-foreground pulse-ring'
                          : 'bg-primary/20 text-primary'
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {level.level}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${isReached ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {level.title}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{level.xpRequired} XP</span>
                    {isReached && <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                  </div>
                )
              })}
              {LEVELS.length > 8 && (
                <p className="text-[10px] text-muted-foreground text-center mt-1">
                  +{LEVELS.length - 8} more levels to discover
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </ScrollReveal>

      {/* Stats Grid */}
      <ScrollReveal delay={0.15}>
        <motion.div variants={staggerItem}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Statistics
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground">{stat.icon}</span>
                </div>
                <p className="text-xl font-display font-bold text-foreground">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </ScrollReveal>

      {/* Activity Overview */}
      <ScrollReveal delay={0.2}>
        <motion.div variants={staggerItem}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Activity Overview
          </h2>
          <div className="glass-card p-4 flex flex-col gap-4">
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center gap-2">
                <ProgressRing progress={puzzleAccuracy} size={72} strokeWidth={5} color="hsl(152, 76%, 46%)">
                  <span className="text-xs font-bold text-foreground">{puzzleAccuracy}%</span>
                </ProgressRing>
                <span className="text-[10px] text-muted-foreground">Puzzle Accuracy</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <ProgressRing progress={openingsMasteredPct} size={72} strokeWidth={5} color="hsl(217, 91%, 60%)">
                  <span className="text-xs font-bold text-foreground">{profile.openingsLearned}/15</span>
                </ProgressRing>
                <span className="text-[10px] text-muted-foreground">Openings Mastered</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <ProgressRing progress={trapsLearnedPct} size={72} strokeWidth={5} color="hsl(0, 84%, 60%)">
                  <span className="text-xs font-bold text-foreground">{profile.trapsLearned}/10</span>
                </ProgressRing>
                <span className="text-[10px] text-muted-foreground">Traps Learned</span>
              </div>
            </div>

            {/* Rating display */}
            <div className="pt-2 border-t border-border/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Puzzle Rating</p>
                  <p className="text-lg font-bold text-foreground">{profile.puzzleRating}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Games Rating</p>
                  <p className="text-lg font-bold text-foreground">{profile.rating}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </ScrollReveal>

      {/* Weakness Analysis */}
      {Object.keys(profile.failedPuzzleThemes).length > 0 && (
        <ScrollReveal delay={0.25}>
          <motion.div variants={staggerItem}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Areas to Improve
            </h2>
            <div className="glass-card p-4 flex flex-col gap-3">
              {Object.entries(profile.failedPuzzleThemes)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([theme, count]) => {
                  const maxCount = Math.max(...Object.values(profile.failedPuzzleThemes))
                  return (
                    <div key={theme}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-foreground capitalize">{theme}</span>
                        <span className="text-[10px] text-muted-foreground">{count} missed</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full progress-bar-animated"
                          style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              <p className="text-[10px] text-muted-foreground mt-1">
                Based on incorrect puzzle attempts. Practice these themes to improve!
              </p>
            </div>
          </motion.div>
        </ScrollReveal>
      )}

      {/* Achievements */}
      <ScrollReveal delay={0.3}>
        <motion.div variants={staggerItem}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Achievements ({earnedAchievements.length}/{profile.achievements.length})
            </h2>
          </div>

          {earnedAchievements.length > 0 && (
            <div className="flex flex-col gap-2 mb-4">
              {earnedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`glow-card glass-card p-4 flex items-center gap-3 border ${getRarityColor(achievement.rarity)}`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Medal className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{achievement.name}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-4 gap-2">
            {lockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-secondary/50 border border-border/20 hover-lift transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-[9px] font-medium text-center text-muted-foreground leading-tight">
                  {achievement.name}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </ScrollReveal>

      {/* Logout */}
      <motion.div variants={staggerItem}>
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-sm font-medium flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </motion.div>
    </motion.div>
  )
}

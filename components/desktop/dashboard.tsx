'use client'

import { useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '@/lib/game-context'
import { useSettings } from '@/lib/settings-context'
import { getLevelInfo, getDailyPuzzleIndex } from '@/lib/chess-store'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import { MiniChessboard } from '@/components/chess/chessboard'
import { AnimatedCounter } from '@/components/ui/animated-components'
import { TiltCard, MagneticWrap, OdometerCounter, TypewriterText, RevealGrid } from '@/components/ui/effects'
import { StreakWarning, NextAchievementPreview } from '@/components/ui/game-rewards'
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



interface DesktopDashboardProps {
  onNavigate: (page: string) => void
}


export function DesktopDashboard({ onNavigate }: DesktopDashboardProps) {
  const { profile, claimDailyBonus } = useGame()
  const { settings } = useSettings()
  const { playSound } = useSoundAndHaptics()
  const { currentLevel, nextLevel, progress, xpIntoLevel, xpForLevel } = getLevelInfo(profile.xp)
  const dailyPuzzleIndex = getDailyPuzzleIndex(PUZZLES.length)
  const dailyPuzzle = PUZZLES[dailyPuzzleIndex]
  const dailyBonusChecked = useRef(false)

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
    { label: 'Puzzles Solved', value: profile.puzzlesSolved, icon: <Puzzle className="w-5 h-5" />, colorClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10', hoverCard: 'stat-card-emerald' },
    { label: 'Current Streak', value: profile.streak, icon: <Flame className="w-5 h-5" />, colorClass: 'text-orange-400', bgClass: 'bg-orange-500/10', hoverCard: 'stat-card-orange' },
    { label: 'Puzzle Rating', value: profile.puzzleRating || 800, icon: <TrendingUp className="w-5 h-5" />, colorClass: 'text-blue-400', bgClass: 'bg-blue-500/10', hoverCard: 'stat-card-blue' },
    { label: 'Achievements', value: profile.achievements.filter(a => a.earned).length, icon: <Trophy className="w-5 h-5" />, colorClass: 'text-amber-400', bgClass: 'bg-amber-500/10', hoverCard: 'stat-card-amber' },
  ]

  const quickActions = [
    { id: 'puzzles', label: 'Tactical Puzzles', description: 'Sharpen your tactical vision', icon: <Puzzle className="w-7 h-7" />, gradient: 'from-emerald-500 to-teal-600' },
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
                className="text-5xl xl:text-6xl font-display font-bold hero-text-large mb-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                Welcome back,<br />
                <TypewriterText text={profile.username + '.'} speed={60} delay={600} />
              </motion.h1>
              <motion.p
                className="text-muted-foreground text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                Continue your chess mastery journey
              </motion.p>
            </div>
            <div
              className="flex items-center gap-6"
            >
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Level</p>
                <p className="text-4xl font-display font-bold text-foreground">{currentLevel.level}</p>
                <p className="text-sm text-primary font-medium">{currentLevel.title}</p>
              </div>
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-600 flex items-center justify-center relative overflow-hidden shadow-lg shadow-emerald-500/20">
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
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">👋 Welcome to ChessVault!</h2>
            <p className="text-sm text-muted-foreground">Start with a quick puzzle to earn your first XP and unlock achievements.</p>
          </div>
          <motion.button
            onClick={() => onNavigate('puzzles')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-xl bg-emerald-500 text-white text-sm font-semibold shrink-0 ml-4"
          >
            Solve First Puzzle →
          </motion.button>
        </div>
      )}

      {/* Stats Grid */}
      <RevealGrid className="grid grid-cols-4 gap-5 mb-10" staggerDelay={100}>
        {stats.map((stat, index) => (
          <TiltCard
            key={stat.label}
            className={`glass-card p-6 group cursor-default relative overflow-hidden ${stat.hoverCard}`}
            intensity={10}
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
          </TiltCard>
        ))}
      </RevealGrid>

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
            <h2 className="text-xl font-display font-semibold text-foreground mb-5">Quick Start</h2>
            <RevealGrid className="grid grid-cols-2 gap-5" staggerDelay={120}>
              {quickActions.map((action, i) => (
                <MagneticWrap key={action.id} strength={0.15}>
                  <TiltCard
                    className="glass-card-hover p-7 text-left group relative overflow-hidden cursor-pointer"
                    intensity={12}
                    onClick={() => handleNavigate(action.id)}
                  >
                    {/* Hover gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />

                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-5 shadow-lg relative z-10`}>
                      <span className="text-white">{action.icon}</span>
                    </div>
                    <h3 className="text-lg font-display font-semibold text-foreground mb-1 relative z-10">{action.label}</h3>
                    <p className="text-sm text-muted-foreground relative z-10">{action.description}</p>
                    <div className="flex items-center gap-1 mt-5 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1 relative z-10">
                      Start now <ChevronRight className="w-4 h-4" />
                    </div>
                  </TiltCard>
                </MagneticWrap>
              ))}
            </RevealGrid>
          </div>

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
              <h2 className="text-xl font-display font-semibold text-foreground">Daily Challenge</h2>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-3 py-1.5 rounded-xl glass-card">
                <Calendar className="w-3.5 h-3.5" />
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
            <motion.button
              onClick={() => handleNavigate('puzzles')}
              className="w-full glass-card-hover p-6 text-left relative overflow-hidden group"
              
            >
              {profile.dailyChallengeCompleted && (
                <div className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium flex items-center gap-1 border border-emerald-500/20 z-10">
                  <Star className="w-3 h-3" /> Completed
                </div>
              )}
              <div className="flex justify-center mb-5 relative z-10">
                <div className="rounded-2xl overflow-hidden shadow-lg ring-1 ring-white/5 group-hover:shadow-xl transition-shadow" style={{ width: 180, height: 180 }}>
                  <MiniChessboard fen={dailyPuzzle?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'} size={180} boardStyle={settings.boardStyle} pieceStyle={settings.pieceStyle} />
                </div>
              </div>
              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${dailyPuzzle?.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  dailyPuzzle?.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                  {dailyPuzzle?.difficulty}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {dailyPuzzle?.moves.length || 0} moves
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-semibold border border-primary/15 group-hover:from-primary/20 group-hover:to-primary/10 transition-all btn-shine relative z-10">
                <Play className="w-4 h-4" />
                {profile.dailyChallengeCompleted ? 'Play Again' : 'Solve Now'}
              </div>
            </motion.button>
          </div>

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
        </div>
      </div>
    </div>
  )
}

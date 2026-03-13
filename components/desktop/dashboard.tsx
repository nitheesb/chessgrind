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
  Crosshair,
  Gamepad2,
  Timer,
  Eye,
  HelpCircle,
  PenTool,
  Layers,
  AlertTriangle,
  Calculator,
  FileText,
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
    if (dailyBonusChecked.current) return
    if (profile.username === 'ChessLearner') return
    const today = new Date().toDateString()
    if (profile.dailyBonusClaimed && profile.lastActiveDate === today) return
    dailyBonusChecked.current = true
    setTimeout(() => claimDailyBonus(), 1500)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.username])

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
    { id: 'coords', label: 'Coord Trainer', description: 'Master board coordinates', icon: <Crosshair className="w-7 h-7" />, gradient: 'from-emerald-500 to-teal-600' },
    { id: 'endgame', label: 'Endgame Practice', description: 'Perfect your endgame technique', icon: <Gamepad2 className="w-7 h-7" />, gradient: 'from-cyan-500 to-sky-600' },
    { id: 'puzzle-rush', label: 'Puzzle Rush', description: 'Solve puzzles against the clock', icon: <Timer className="w-7 h-7" />, gradient: 'from-red-500 to-rose-600' },
    { id: 'board-vision', label: 'Board Vision', description: 'Train square recognition speed', icon: <Eye className="w-7 h-7" />, gradient: 'from-emerald-500 to-green-600' },
    { id: 'checkmate-patterns', label: 'Checkmate Patterns', description: 'Learn famous mating patterns', icon: <Crown className="w-7 h-7" />, gradient: 'from-fuchsia-500 to-pink-600' },
    { id: 'blunder-spotter', label: 'Blunder Spotter', description: 'Find the winning refutation', icon: <AlertTriangle className="w-7 h-7" />, gradient: 'from-orange-500 to-red-600' },
    { id: 'pgn-viewer', label: 'PGN Viewer', description: 'Import and replay chess games', icon: <FileText className="w-7 h-7" />, gradient: 'from-slate-500 to-gray-600' },
    { id: 'pawn-structures', label: 'Pawn Structures', description: 'Master strategic pawn play', icon: <Layers className="w-7 h-7" />, gradient: 'from-lime-500 to-green-600' },
    { id: 'notation-trainer', label: 'Notation Trainer', description: 'Practice algebraic notation', icon: <PenTool className="w-7 h-7" />, gradient: 'from-sky-500 to-blue-600' },
    { id: 'piece-quiz', label: 'Piece Value Quiz', description: 'Test your piece value knowledge', icon: <HelpCircle className="w-7 h-7" />, gradient: 'from-teal-500 to-cyan-600' },
    { id: 'move-calculator', label: 'Move Calculator', description: 'Count legal moves for training', icon: <Calculator className="w-7 h-7" />, gradient: 'from-indigo-500 to-violet-600' },
    { id: 'daily-calendar', label: 'Activity Calendar', description: 'Track your daily chess activity', icon: <Calendar className="w-7 h-7" />, gradient: 'from-amber-500 to-yellow-600' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">

      {/* ── ROW 1: Compact header ── */}
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-primary/70 uppercase tracking-widest font-medium mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-display font-bold text-foreground truncate">
            Welcome back, <span className="text-primary">{profile.username}</span> 👋
          </h1>
        </div>

        {/* Level + XP bar */}
        <div className="flex-none flex items-center gap-4 glass-card px-5 py-3 min-w-[260px]">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20 flex-none">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Level {currentLevel.level} — <span className="text-primary font-medium">{currentLevel.title}</span></span>
              <span className="text-xs font-bold text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full xp-bar-track overflow-hidden">
              <div className="h-full rounded-full xp-bar-fill transition-all duration-700" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{xpIntoLevel} / {xpForLevel} XP to next level</p>
          </div>
        </div>

        {/* Streak + Combo chips */}
        <div className="flex-none flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <span className="text-base">🔥</span>
            <div>
              <p className="text-sm font-bold text-orange-400 leading-none">{profile.streak}</p>
              <p className="text-[10px] text-orange-400/60 leading-none">day streak</p>
            </div>
          </div>
          {profile.combo > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <span className="text-base">⚡</span>
              <div>
                <p className="text-sm font-bold text-amber-400 leading-none">{profile.combo}x</p>
                <p className="text-[10px] text-amber-400/60 leading-none">combo</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 2: 4 mode launch cards ── */}
      <RevealGrid className="grid grid-cols-4 gap-4" staggerDelay={80}>
        {quickActions.map((action) => (
          <div
            key={action.id}
            onClick={() => handleNavigate(action.id)}
            className="glass-card p-5 cursor-pointer group relative overflow-hidden hover:border-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-[0.07] transition-opacity duration-300`} />
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-md relative z-10 ring-1 ring-white/10`}>
              <span className="text-white text-xl">{action.icon}</span>
            </div>
            <h3 className="font-semibold text-foreground mb-0.5 relative z-10" style={{ fontSize: 'var(--fs-sm)' }}>{action.label}</h3>
            <p className="text-muted-foreground leading-snug relative z-10" style={{ fontSize: 'var(--fs-xs)' }}>{action.description}</p>
            <div className="flex items-center gap-1 mt-3 text-primary font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 relative z-10" style={{ fontSize: 'var(--fs-xs)' }}>
              Start <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </RevealGrid>

      {/* ── ROW 3: stats + daily challenge ── */}
      <div className="grid grid-cols-[1fr_280px] gap-4">

        {/* Left: stats chips */}
        <div className="space-y-4">
          <RevealGrid className="grid grid-cols-4 gap-3" staggerDelay={60}>
            {stats.map((stat) => (
              <div key={stat.label} className={`glass-card px-4 py-3 group cursor-default relative overflow-hidden ${stat.hoverCard} hover:border-white/10 transition-all duration-200`}>
                <div className={`w-9 h-9 rounded-xl ${stat.bgClass} flex items-center justify-center ${stat.colorClass} mb-2 transition-transform duration-200 group-hover:scale-105`}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-display font-bold text-foreground leading-none mb-0.5">
                  <OdometerCounter value={typeof stat.value === 'number' ? stat.value : 0} />
                </p>
                <p className="text-muted-foreground" style={{ fontSize: 'var(--fs-xs)' }}>{stat.label}</p>
              </div>
            ))}
          </RevealGrid>

          {/* Welcome banner for new users */}
          {profile.xp === 0 && profile.puzzlesSolved === 0 && (
            <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-5 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-foreground mb-0.5" style={{ fontSize: 'var(--fs-sm)' }}>👋 Welcome to ChessGrind!</h2>
                <p className="text-muted-foreground" style={{ fontSize: 'var(--fs-xs)' }}>Start with a quick puzzle to earn your first XP and unlock achievements.</p>
              </div>
              <button onClick={() => handleNavigate('puzzles')} className="px-5 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold shrink-0 ml-4 hover:bg-amber-600 transition-colors">
                Solve First Puzzle →
              </button>
            </div>
          )}

          {/* Streak Warning */}
          <StreakWarning />

          {/* Next Achievement */}
          <NextAchievementPreview />

          {/* Weekly Missions */}
          {profile.weeklyMissions.length > 0 && (
            <div>
              <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2" style={{ fontSize: 'var(--fs-sm)' }}>
                🎯 Weekly Missions
              </h2>
              <WeeklyMissions missions={profile.weeklyMissions} />
            </div>
          )}
        </div>

        {/* Right: Daily Challenge */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground flex items-center gap-2" style={{ fontSize: 'var(--fs-sm)' }}>
              <Star className="w-4 h-4 text-amber-400" /> Daily Challenge
            </h2>
            <span className="text-xs text-muted-foreground px-2 py-1 rounded-lg glass-card border border-white/5 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <motion.button
            onClick={() => handleNavigate('puzzles')}
            className="w-full glass-card-hover p-5 text-left relative overflow-hidden group border border-white/5 hover:border-white/10 transition-all"
            whileHover={{ y: -2 }}
          >
            {profile.dailyChallengeCompleted && (
              <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-semibold flex items-center gap-1 border border-amber-500/20 z-10">
                <Star className="w-3 h-3" /> Done
              </div>
            )}
            <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 group-hover:bg-primary/10 transition-colors duration-500" />
            <div className="flex justify-center mb-4 relative z-10">
              <div className="rounded-xl overflow-hidden shadow-lg ring-1 ring-white/10 group-hover:-translate-y-1 transition-transform duration-300">
                <MiniChessboard fen={dailyPuzzle?.fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'} size={160} boardStyle={settings.boardStyle} pieceStyle={settings.pieceStyle} />
              </div>
            </div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className={`px-2 py-0.5 rounded-lg text-xs font-semibold border ${
                dailyPuzzle?.difficulty === 'hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>{dailyPuzzle?.difficulty}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {dailyPuzzle?.moves.length || 0} moves
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-semibold border border-primary/20 group-hover:from-primary/20 transition-all btn-shine w-full text-sm relative z-10">
              <Play className="w-3.5 h-3.5" fill="currentColor" />
              {profile.dailyChallengeCompleted ? 'Play Again' : 'Solve Now'}
            </div>
          </motion.button>
        </div>
      </div>

      {/* ── BELOW FOLD: Activity + Opening + Games + Achievements ── */}
      <div className="grid grid-cols-3 gap-5 pt-2">

        {/* Activity heatmap */}
        <div className="col-span-3">
          <div className="glass-card p-4">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-3">Activity (last 52 weeks)</p>
            <ActivityHeatmap activityDates={profile.activityDates} compact />
          </div>
        </div>

        {/* Featured Opening */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground" style={{ fontSize: 'var(--fs-sm)' }}>Featured Opening</h2>
            <button onClick={() => handleNavigate('openings')} className="text-xs text-primary flex items-center gap-1 hover:gap-2 transition-all">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <motion.button onClick={() => handleNavigate('openings')} className="w-full glass-card-hover p-5 flex items-center gap-5 text-left group">
            <div className="rounded-xl overflow-hidden ring-1 ring-white/5 flex-none">
              <MiniChessboard fen={OPENINGS[0].fen} size={100} boardStyle={settings.boardStyle} pieceStyle={settings.pieceStyle} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20">{OPENINGS[0].eco}</span>
                <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-secondary text-muted-foreground capitalize">{OPENINGS[0].difficulty}</span>
              </div>
              <h3 className="font-semibold text-foreground mb-1" style={{ fontSize: 'var(--fs-sm)' }}>{OPENINGS[0].name}</h3>
              <p className="text-muted-foreground line-clamp-2" style={{ fontSize: 'var(--fs-xs)' }}>{OPENINGS[0].description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-none" />
          </motion.button>
        </div>

        {/* Chess Tip */}
        <div className="rounded-xl bg-blue-500/5 border border-blue-500/15 p-4 flex items-start gap-3">
          <span className="text-2xl flex-none">💡</span>
          <div>
            <p className="text-xs font-semibold text-blue-400 mb-1.5">Chess Tip of the Day</p>
            <p className="text-muted-foreground leading-relaxed" style={{ fontSize: 'var(--fs-xs)' }}>{tip}</p>
          </div>
        </div>

        {/* Recent Games */}
        {profile.recentGames && profile.recentGames.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-foreground" style={{ fontSize: 'var(--fs-sm)' }}>Recent Games</h2>
              <button onClick={() => handleNavigate('profile')} className="text-xs text-primary flex items-center gap-1 hover:gap-2 transition-all">View all <ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
            <div className="glass-card p-4 space-y-1">
              {profile.recentGames.slice(0, 4).map((game) => (
                <div key={game.id} className="flex items-center gap-3 py-1.5 border-b border-border/20 last:border-0">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-none ${
                    game.result === 'win' ? 'bg-amber-500/10 text-amber-400' :
                    game.result === 'draw' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
                  }`}>{game.result === 'win' ? 'W' : game.result === 'draw' ? 'D' : 'L'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">vs {game.opponent}</p>
                    <p className="text-xs text-muted-foreground">{game.moves} moves</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className={profile.recentGames && profile.recentGames.length > 0 ? '' : 'col-span-2'}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-foreground" style={{ fontSize: 'var(--fs-sm)' }}>Achievements</h2>
            <button onClick={() => handleNavigate('profile')} className="text-xs text-primary flex items-center gap-1 hover:gap-2 transition-all">View all <ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
          <div className="glass-card p-4 space-y-1.5">
            {profile.achievements.slice(0, 4).map((achievement) => (
              <div key={achievement.id} className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${achievement.earned ? 'bg-primary/[0.04] hover:bg-primary/[0.07]' : 'opacity-40 hover:opacity-60'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-none ${achievement.earned ? 'bg-primary/10' : 'bg-secondary'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{achievement.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>
                </div>
                {achievement.earned && <Award className="w-4 h-4 text-amber-400 flex-none" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

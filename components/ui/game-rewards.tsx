'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/lib/game-context'
import { getComboMultiplier } from '@/lib/chess-store'
import { Flame, Gift, Sparkles, Zap, ChevronRight } from 'lucide-react'

// Combo counter overlay — shows current combo streak with fire effect
export function ComboOverlay() {
  const { comboAnimation } = useGame()

  return (
    <AnimatePresence>
      {comboAnimation.show && (
        <motion.div
          key={`combo-${comboAnimation.combo}`}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] pointer-events-none"
        >
          <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-xl border border-orange-400/30 shadow-2xl shadow-orange-500/30">
            <Flame className="w-6 h-6 text-yellow-300 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white leading-none">
                {comboAnimation.combo}x
              </span>
              <span className="text-[10px] font-bold text-orange-200 uppercase tracking-wider">
                Combo
              </span>
            </div>
            {comboAnimation.multiplier > 1 && (
              <div className="ml-1 px-2 py-0.5 rounded-full bg-yellow-400/20 border border-yellow-400/30">
                <span className="text-xs font-bold text-yellow-300">
                  {comboAnimation.multiplier}x XP
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Daily bonus claim popup
export function DailyBonusPopup() {
  const { dailyBonusAnimation, dismissDailyBonus } = useGame()

  return (
    <AnimatePresence>
      {dailyBonusAnimation.show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={dismissDailyBonus}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, rotateX: 20 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative mx-4 w-full max-w-sm overflow-hidden rounded-3xl bg-gradient-to-b from-amber-500/10 to-amber-900/5 border border-amber-500/20 backdrop-blur-2xl p-8"
            onClick={e => e.stopPropagation()}
            style={{ perspective: '800px' }}
          >
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl" />
            
            <div className="relative flex flex-col items-center gap-5">
              {/* Gift icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 15 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/30"
              >
                <Gift className="w-10 h-10 text-white" />
              </motion.div>

              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground mb-1">Daily Bonus!</h3>
                <p className="text-sm text-muted-foreground">Welcome back! Here's your reward</p>
              </div>

              {/* XP amount */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20"
              >
                <Zap className="w-6 h-6 text-amber-400" />
                <span className="text-3xl font-black text-amber-400">+{dailyBonusAnimation.amount}</span>
                <span className="text-lg font-bold text-amber-300">XP</span>
              </motion.div>

              {dailyBonusAnimation.streak > 0 && (
                <p className="text-xs text-muted-foreground">
                  🔥 {dailyBonusAnimation.streak} day streak = bigger bonuses!
                </p>
              )}

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={dismissDailyBonus}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold text-sm btn-shine"
              >
                Claim Reward
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Perfect solve flash
export function PerfectSolveFlash() {
  const { perfectSolveAnimation } = useGame()

  return (
    <AnimatePresence>
      {perfectSolveAnimation.show && (
        <motion.div
          key="perfect-solve"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed top-36 left-1/2 -translate-x-1/2 z-[199] pointer-events-none"
        >
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-500/90 to-purple-600/90 backdrop-blur-xl border border-violet-400/30 shadow-2xl shadow-purple-500/30">
            <Sparkles className="w-5 h-5 text-violet-200" />
            <span className="text-sm font-bold text-white">Perfect Solve! +50% XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Streak at-risk warning for dashboard
export function StreakWarning() {
  const { profile } = useGame()
  
  if (profile.streak === 0) return null
  
  const today = new Date().toDateString()
  const lastActive = profile.lastDailyDate || profile.lastActiveDate
  if (lastActive === today) return null // Already active today
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
    >
      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
        <Flame className="w-4 h-4 text-red-400 animate-pulse" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-red-400">Streak at risk!</p>
        <p className="text-[10px] text-red-400/70">Play today to keep your {profile.streak}-day streak</p>
      </div>
    </motion.div>
  )
}

// Next puzzle prompt shown after solving
interface NextPuzzlePromptProps {
  nextPuzzleTitle: string
  nextPuzzleXP: number
  combo: number
  onNext: () => void
}

export function NextPuzzlePrompt({ nextPuzzleTitle, nextPuzzleXP, combo, onNext }: NextPuzzlePromptProps) {
  const multiplier = getComboMultiplier(combo + 1)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
    >
      <button
        onClick={onNext}
        className="w-full mt-3 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3 text-left group hover:bg-primary/15 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Next Puzzle</p>
          <p className="text-[11px] text-muted-foreground truncate">{nextPuzzleTitle}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-bold text-primary">+{nextPuzzleXP} XP</span>
            {multiplier > 1 && (
              <span className="text-[10px] font-bold text-orange-400">
                🔥 {multiplier}x combo bonus
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-primary group-hover:translate-x-0.5 transition-transform" />
      </button>
    </motion.div>
  )
}

// Achievement progress preview for dashboard
export function NextAchievementPreview() {
  const { profile } = useGame()
  
  // Find the closest-to-completion unearned achievement
  const unearned = profile.achievements
    .filter(a => !a.earned && a.target && a.progress !== undefined)
    .map(a => ({ ...a, pct: ((a.progress || 0) / (a.target || 1)) * 100 }))
    .sort((a, b) => b.pct - a.pct)
  
  const next = unearned[0]
  if (!next) return null
  
  return (
    <div className="p-3 rounded-xl bg-secondary/80 border border-border/20">
      <div className="flex items-center gap-3">
        <span className="text-xl">{next.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-foreground truncate">{next.name}</p>
            <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">{next.progress}/{next.target}</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${next.pct}%` }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

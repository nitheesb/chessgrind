'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/lib/game-context'
import { getLevelInfo } from '@/lib/chess-store'
import { Sparkles } from 'lucide-react'

export function XPPopup() {
  const { xpAnimation } = useGame()

  return (
    <AnimatePresence>
      {xpAnimation.show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.5 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
          <div className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl border border-primary/30 backdrop-blur-2xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.06) 100%)',
              boxShadow: '0 0 40px rgba(34,197,94,0.15), 0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
            <motion.span
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 0.5 }}
              className="text-xl relative z-10"
            >
              <Sparkles className="w-5 h-5 text-primary" />
            </motion.span>
            <span className="text-lg font-display font-bold text-primary text-glow-primary relative z-10">
              +{xpAnimation.amount} XP
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function LevelUpOverlay() {
  const { levelUpAnimation, dismissLevelUp } = useGame()

  return (
    <AnimatePresence>
      {levelUpAnimation.show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          onClick={dismissLevelUp}
          style={{ background: 'rgba(5,8,14,0.85)', backdropFilter: 'blur(12px)' }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex flex-col items-center gap-6 p-12 glass-card text-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ boxShadow: '0 0 80px rgba(34,197,94,0.15), 0 20px 60px rgba(0,0,0,0.4)' }}
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />

            <motion.div
              animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center relative z-10"
              style={{ boxShadow: '0 0 40px rgba(34,197,94,0.2)' }}
            >
              <span className="text-5xl font-display font-bold text-primary text-glow-primary">
                {levelUpAnimation.level}
              </span>
            </motion.div>

            <div className="relative z-10">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm font-semibold text-primary uppercase tracking-[0.2em]"
              >
                Level Up!
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-display font-bold gradient-text-hero mt-2"
              >
                {levelUpAnimation.title}
              </motion.h2>
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={dismissLevelUp}
              className="px-10 py-3 rounded-xl bg-gradient-to-r from-primary to-emerald-400 text-primary-foreground font-semibold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all relative z-10"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function XPBar({ className = '' }: { className?: string }) {
  const { profile } = useGame()
  const { progress, xpIntoLevel, xpForLevel, currentLevel, nextLevel } = getLevelInfo(profile.xp)

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">
          Lv.{currentLevel.level} {currentLevel.title}
        </span>
        <span className="text-muted-foreground">
          {xpIntoLevel}/{xpForLevel} XP
        </span>
      </div>
      <div className="h-2.5 rounded-full xp-bar-track overflow-hidden">
        <motion.div
          className="h-full rounded-full xp-bar-fill relative"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </motion.div>
      </div>
      {nextLevel.level !== currentLevel.level && (
        <p className="text-[10px] text-muted-foreground">
          Next: <span className="text-primary">{nextLevel.title}</span>
        </p>
      )}
    </div>
  )
}

export function StreakBadge() {
  const { profile } = useGame()

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
      <span className="text-sm text-accent font-bold">{profile.streak}</span>
      <span className="text-xs text-accent/70">day streak</span>
    </div>
  )
}

export function StatCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: string
}) {
  return (
    <div className="glass-card p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium">{label}</span>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-display font-bold text-foreground">{value}</span>
        {trend && (
          <span className="text-xs text-primary font-medium pb-1">{trend}</span>
        )}
      </div>
    </div>
  )
}

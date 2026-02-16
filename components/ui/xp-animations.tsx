'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/lib/game-context'
import { getLevelInfo } from '@/lib/chess-store'

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
          <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-primary/20 border border-primary/40 backdrop-blur-xl">
            <motion.span
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="text-xl"
            >
              +
            </motion.span>
            <span className="text-lg font-bold text-primary text-glow-primary">
              {xpAnimation.amount} XP
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
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-md"
          onClick={dismissLevelUp}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex flex-col items-center gap-6 p-10 glass-card glow-primary text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{ rotate: [0, 360], scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center"
            >
              <span className="text-5xl font-display font-bold text-primary text-glow-primary">
                {levelUpAnimation.level}
              </span>
            </motion.div>

            <div>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-sm font-medium text-primary uppercase tracking-widest"
              >
                Level Up!
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-display font-bold text-foreground mt-2"
              >
                {levelUpAnimation.title}
              </motion.h2>
            </div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={dismissLevelUp}
              className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
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
      <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)',
          }}
        />
      </div>
      {nextLevel.level !== currentLevel.level && (
        <p className="text-[10px] text-muted-foreground">
          Next: {nextLevel.title}
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

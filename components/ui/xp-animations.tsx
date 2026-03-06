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
          initial={{ opacity: 0, y: 30, scale: 0.7, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -40, scale: 0.5, filter: 'blur(8px)' }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
          <div className="flex items-center gap-3 px-7 py-4 rounded-2xl border border-primary/30 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.15) 0%, rgba(34,197,94,0.05) 100%)',
              backdropFilter: 'saturate(180%) blur(24px)',
              boxShadow: '0 0 60px rgba(34,197,94,0.2), 0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
            <motion.span
              animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.4, 1] }}
              transition={{ duration: 0.6 }}
              className="text-xl relative z-10"
            >
              <Sparkles className="w-5 h-5 text-primary" />
            </motion.span>
            <span className="text-xl font-display font-bold text-primary relative z-10">
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
          style={{ background: 'rgba(3,5,10,0.88)', backdropFilter: 'saturate(180%) blur(16px)' }}
        >
          {/* Radial burst */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(52,211,153,0.15) 0%, transparent 50%)',
            }} />
          </motion.div>

          {/* Floating particles */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-primary/60"
              style={{ left: '50%', top: '50%' }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{
                x: Math.cos(i * (Math.PI * 2 / 12)) * (120 + Math.random() * 80),
                y: Math.sin(i * (Math.PI * 2 / 12)) * (120 + Math.random() * 80),
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{ duration: 1.2, delay: 0.3 + i * 0.05, ease: 'easeOut' }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.4, opacity: 0, rotateY: -30 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            exit={{ scale: 0.7, opacity: 0, rotateY: 30 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            className="flex flex-col items-center gap-6 p-14 glass-card text-center relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 0 100px rgba(34,197,94,0.2), 0 25px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
              perspective: '600px',
            }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent" />

            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
              className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center relative z-10"
              style={{ boxShadow: '0 0 50px rgba(34,197,94,0.25)' }}
            >
              <motion.span
                className="text-6xl font-display font-bold text-primary"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {levelUpAnimation.level}
              </motion.span>
            </motion.div>

            <div className="relative z-10">
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-sm font-semibold text-primary uppercase tracking-[0.25em]"
              >
                Level Up!
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl font-display font-bold gradient-text-hero mt-2"
              >
                {levelUpAnimation.title}
              </motion.h2>
            </div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={dismissLevelUp}
              aria-label="Dismiss level up notification"
              className="px-12 py-3.5 rounded-xl bg-gradient-to-r from-primary to-emerald-400 text-primary-foreground font-semibold text-sm hover:shadow-xl hover:shadow-primary/25 transition-all relative z-10 btn-shine"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
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
      <div className="h-2.5 rounded-full xp-bar-track overflow-hidden" role="progressbar" aria-valuenow={Math.min(Math.round(progress), 100)} aria-valuemin={0} aria-valuemax={100} aria-label="XP progress to next level">
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

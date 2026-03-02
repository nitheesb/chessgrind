'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import { useEffect } from 'react'

interface AchievementPopupProps {
  show: boolean
  achievement: {
    name: string
    icon: string
    rarity: string
  } | null
  onDismiss: () => void
}

const rarityColors: Record<string, { bg: string; border: string; glow: string }> = {
  common: { bg: 'bg-slate-500/20', border: 'border-slate-400/50', glow: 'shadow-slate-400/20' },
  rare: { bg: 'bg-blue-500/20', border: 'border-blue-400/50', glow: 'shadow-blue-400/30' },
  epic: { bg: 'bg-purple-500/20', border: 'border-purple-400/50', glow: 'shadow-purple-400/40' },
  legendary: { bg: 'bg-amber-500/20', border: 'border-amber-400/50', glow: 'shadow-amber-400/50' },
}

export function AchievementPopup({ show, achievement, onDismiss }: AchievementPopupProps) {
  const { playSound, triggerHaptic } = useSoundAndHaptics()

  useEffect(() => {
    if (show && achievement) {
      playSound('success')
      triggerHaptic('success')
    }
  }, [show, achievement, playSound, triggerHaptic])

  const colors = achievement ? rarityColors[achievement.rarity] || rarityColors.common : rarityColors.common

  return (
    <AnimatePresence>
      {show && achievement && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-4 left-4 right-4 z-[60] pointer-events-none"
        >
          {/* Particle burst */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 w-1 h-1 rounded-full"
              style={{
                background: achievement.rarity === 'legendary' ? '#fbbf24' :
                  achievement.rarity === 'epic' ? '#a855f7' :
                  achievement.rarity === 'rare' ? '#3b82f6' : '#94a3b8',
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos(i * (Math.PI * 2 / 8)) * 80,
                y: Math.sin(i * (Math.PI * 2 / 8)) * 60,
                opacity: 0,
                scale: 0,
              }}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.03, ease: 'easeOut' }}
            />
          ))}
          <motion.div
            className={`mx-auto max-w-sm rounded-2xl ${colors.bg} ${colors.border} border-2 p-4 backdrop-blur-lg shadow-2xl ${colors.glow} relative overflow-hidden`}
            onClick={onDismiss}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center text-3xl`}
              >
                {achievement.icon}
              </motion.div>

              {/* Text */}
              <div className="flex-1">
                <motion.p
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-xs font-semibold text-primary uppercase tracking-wider"
                >
                  Achievement Unlocked!
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg font-bold text-foreground"
                >
                  {achievement.name}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                    achievement.rarity === 'legendary' ? 'bg-amber-500/30 text-amber-300' :
                    achievement.rarity === 'epic' ? 'bg-purple-500/30 text-purple-300' :
                    achievement.rarity === 'rare' ? 'bg-blue-500/30 text-blue-300' :
                    'bg-slate-500/30 text-slate-300'
                  }`}
                >
                  {achievement.rarity}
                </motion.div>
              </div>
            </div>

            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] animate-shimmer" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

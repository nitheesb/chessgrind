'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface SplashScreenProps {
  onComplete: () => void
  minDuration?: number
}

export function SplashScreen({ onComplete, minDuration = 1800 }: SplashScreenProps) {
  const [show, setShow] = useState(true)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200)
    const t2 = setTimeout(() => setPhase(2), 600)
    const t3 = setTimeout(() => {
      setShow(false)
      setTimeout(onComplete, 400)
    }, minDuration)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [minDuration, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(180deg, hsl(222 22% 5%) 0%, hsl(222 22% 3%) 100%)' }}
        >
          {/* Ambient orbs */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, transparent 70%)',
                top: '20%',
                left: '30%',
              }}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute w-[400px] h-[400px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(34, 197, 94, 0.04) 0%, transparent 70%)',
                bottom: '20%',
                right: '30%',
              }}
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Floating chess pieces */}
          {['♔', '♕', '♗', '♘'].map((piece, i) => (
            <motion.div
              key={i}
              className="absolute text-white/[0.03] select-none pointer-events-none"
              style={{
                fontSize: `${60 + i * 10}px`,
                top: `${15 + i * 20}%`,
                left: `${10 + i * 22}%`,
              }}
              initial={{ opacity: 0, y: 20, rotate: -10 + i * 5 }}
              animate={{
                opacity: phase >= 1 ? 1 : 0,
                y: [20, -10, 20],
                rotate: [-10 + i * 5, 5 + i * 3, -10 + i * 5],
              }}
              transition={{
                opacity: { duration: 0.8 },
                y: { duration: 4 + i, repeat: Infinity, ease: 'easeInOut' },
                rotate: { duration: 5 + i, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              {piece}
            </motion.div>
          ))}

          {/* Logo */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
            className="flex items-center gap-4 relative z-10"
          >
            {/* Icon */}
            <motion.div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-600 flex items-center justify-center relative overflow-hidden"
              animate={phase >= 2 ? { rotate: [0, -5, 5, 0] } : {}}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
              <svg viewBox="0 0 24 24" className="w-9 h-9 text-white relative z-10" fill="currentColor">
                <path d="M12 2L13.09 8.26L18 6L15.74 10.91L22 12L15.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L8.26 13.09L2 12L8.26 10.91L6 6L10.91 8.26L12 2Z" />
              </svg>
            </motion.div>

            <motion.span
              className="text-4xl font-display font-bold tracking-tight"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{
                background: 'linear-gradient(135deg, hsl(0 0% 98%), hsl(0 0% 65%))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ChessVault
            </motion.span>
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="text-sm text-muted-foreground mt-4 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            Master Chess Through Play
          </motion.p>

          {/* Loading bar */}
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 160 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="mt-8 h-1 rounded-full overflow-hidden relative z-10 xp-bar-track"
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 1.2, ease: 'easeInOut', repeat: 1 }}
              className="h-full w-1/2 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.6), transparent)',
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

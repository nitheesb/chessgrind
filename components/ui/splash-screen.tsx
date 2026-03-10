'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

interface SplashScreenProps {
  onComplete: () => void
  minDuration?: number
}

// SVG Knight chess piece path for stroke animation
const KNIGHT_PATH = "M21.5,2.5 C21.5,2.5 19,5 16,5.5 C16,5.5 15,3 12,2 C12,2 11,6 8,7 C8,7 4,6 3,8 C2,10 4,11 4,11 C4,11 2,13 3,16 C4,19 6,20 6,20 L6,22 L18,22 L18,20 C18,20 21,18 22,15 C23,12 21,10 21,10 C21,10 23,8 21.5,5 Z"

function Particle({ delay, x, size }: { delay: number; x: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        bottom: '-5%',
        background: `radial-gradient(circle, rgba(245,158,11,${0.3 + Math.random() * 0.3}) 0%, transparent 70%)`,
      }}
      initial={{ y: 0, opacity: 0, scale: 0 }}
      animate={{
        y: [0, -window.innerHeight * (0.6 + Math.random() * 0.4)],
        x: [0, (Math.random() - 0.5) * 100],
        opacity: [0, 0.8, 0.6, 0],
        scale: [0, 1, 0.5],
      }}
      transition={{
        duration: 2 + Math.random() * 1.5,
        delay: delay,
        ease: 'easeOut',
      }}
    />
  )
}

export function SplashScreen({ onComplete, minDuration = 1200 }: SplashScreenProps) {
  const [show, setShow] = useState(true)
  const [phase, setPhase] = useState(0)
  const [particles] = useState(() =>
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      delay: 0.2 + Math.random() * 0.6,
      x: Math.random() * 100,
      size: 3 + Math.random() * 5,
    }))
  )

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100)
    const t2 = setTimeout(() => setPhase(2), 400)
    const t3 = setTimeout(() => setPhase(3), 700)
    const t4 = setTimeout(() => {
      setShow(false)
      setTimeout(onComplete, 300)
    }, minDuration)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [minDuration, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(180deg, hsl(230 20% 4%) 0%, hsl(230 25% 2%) 100%)' }}
        >
          {/* Ambient orbs — morphing */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute w-[700px] h-[700px] rounded-full morph-blob"
              style={{
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 60%)',
                top: '5%',
                left: '15%',
              }}
              animate={{ scale: [1, 1.3, 1], rotate: [0, 30, 0] }}
              transition={{ duration: 3, repeat: 0, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute w-[500px] h-[500px] rounded-full morph-blob"
              style={{
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 60%)',
                bottom: '5%',
                right: '15%',
              }}
              animate={{ scale: [1.2, 1, 1.2], rotate: [30, 0, 30] }}
              transition={{ duration: 3, repeat: 0, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute w-[300px] h-[300px] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255, 180, 50, 0.05) 0%, transparent 60%)',
                top: '40%',
                right: '30%',
              }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2.5, repeat: 0, ease: 'easeInOut' }}
            />
          </div>

          {/* Particle system */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {phase >= 1 && particles.map(p => (
              <Particle key={p.id} delay={p.delay} x={p.x} size={p.size} />
            ))}
          </div>

          {/* Floating chess pieces — 3D rotation */}
          {['♔', '♕', '♗', '♘', '♖', '♙'].map((piece, i) => (
            <motion.div
              key={i}
              className="absolute select-none pointer-events-none"
              style={{
                fontSize: `${40 + i * 12}px`,
                top: `${8 + ((i * 17) % 70)}%`,
                left: `${5 + ((i * 19) % 80)}%`,
                color: 'rgba(255,255,255,0.025)',
                textShadow: '0 0 40px rgba(245,158,11,0.03)',
              }}
              initial={{ opacity: 0, scale: 0.5, rotate: -20 + i * 8 }}
              animate={{
                opacity: phase >= 1 ? 1 : 0,
                scale: phase >= 1 ? 1 : 0.5,
                y: [0, -15 - i * 3, 0],
                rotate: [-20 + i * 8, 10 - i * 3, -20 + i * 8],
              }}
              transition={{
                opacity: { duration: 0.6, delay: i * 0.1 },
                scale: { duration: 0.5, delay: i * 0.1 },
                y: { duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' },
                rotate: { duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              {piece}
            </motion.div>
          ))}

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* 3D Knight piece with stroke animation */}
            <motion.div
              className="mb-6 relative"
              initial={{ scale: 0, rotateY: -90 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              style={{ perspective: '600px' }}
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center relative overflow-hidden shadow-2xl shadow-amber-500/30">
                <svg viewBox="0 0 24 24" className="w-11 h-11 relative z-10">
                  <motion.path
                    d={KNIGHT_PATH}
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <motion.path
                    d={KNIGHT_PATH}
                    fill="white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: phase >= 2 ? 0.9 : 0 }}
                    transition={{ duration: 0.4 }}
                  />
                </svg>
                {/* Shine sweep */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
                  }}
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 0.8, delay: 1.0, ease: 'easeInOut' }}
                />
              </div>
              {/* Glow ring */}
              <motion.div
                className="absolute inset-[-8px] rounded-[28px] border border-amber-400/20"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [0.8, 1.1, 1], opacity: [0, 0.5, 0] }}
                transition={{ duration: 1.5, delay: 0.5, repeat: Infinity, repeatDelay: 1 }}
              />
            </motion.div>

            {/* Title with letter stagger */}
            <div className="flex items-center gap-1 mb-2 overflow-hidden">
              {'ChessGrind'.split('').map((char, i) => (
                <motion.span
                  key={i}
                  className="text-4xl md:text-5xl font-display font-bold tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, hsl(0 0% 98%) 0%, hsl(0 0% 60%) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                  initial={{ y: 40, opacity: 0, rotateX: -45 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.4 + i * 0.04,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </div>

            {/* Tagline with word reveal */}
            <div className="flex gap-2 overflow-hidden">
              {['Master', 'Chess', 'Through', 'Play'].map((word, i) => (
                <motion.span
                  key={i}
                  className="text-sm md:text-base text-muted-foreground font-medium"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: phase >= 2 ? 1 : 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.8 + i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {word}
                </motion.span>
              ))}
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 w-48 h-[3px] rounded-full overflow-hidden xp-bar-track origin-center"
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, hsl(38 92% 50%), hsl(30 80% 45%), hsl(38 92% 50%))',
                  backgroundSize: '200% 100%',
                }}
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: minDuration / 1000 - 0.6, delay: 0.6, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

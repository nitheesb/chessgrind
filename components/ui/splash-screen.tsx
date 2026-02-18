'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface SplashScreenProps {
  onComplete: () => void
  minDuration?: number
}

export function SplashScreen({ onComplete, minDuration = 2000 }: SplashScreenProps) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(onComplete, 500) // Wait for exit animation
    }, minDuration)
    return () => clearTimeout(timer)
  }, [minDuration, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        >
          {/* Background chess pattern */}
          <div className="absolute inset-0 overflow-hidden opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(45deg, #fff 25%, transparent 25%),
                linear-gradient(-45deg, #fff 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, #fff 75%),
                linear-gradient(-45deg, transparent 75%, #fff 75%)
              `,
              backgroundSize: '60px 60px',
              backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0px',
            }} />
          </div>

          {/* Logo animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: 'spring', 
              stiffness: 200, 
              damping: 15,
              delay: 0.2 
            }}
            className="relative mb-8"
          >
            {/* Glow effect */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 rounded-3xl bg-primary/30 blur-xl"
            />
            
            {/* Logo container */}
            <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center shadow-2xl">
              {/* King piece SVG */}
              <motion.svg
                viewBox="0 0 45 45"
                className="w-16 h-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {/* King cross */}
                <motion.path 
                  d="M22.5 11.63V6M20 8h5" 
                  fill="none" 
                  stroke="#ffd700" 
                  strokeWidth="1.5" 
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                />
                {/* Crown */}
                <motion.path 
                  d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
                  fill="#ffd700"
                  stroke="#b8860b"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.3 }}
                />
                {/* Body */}
                <motion.path 
                  d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"
                  fill="#ffd700"
                  stroke="#b8860b"
                  strokeWidth="1.5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                />
                {/* Details */}
                <motion.path 
                  d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" 
                  fill="none" 
                  stroke="#b8860b"
                  strokeWidth="1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.3 }}
                />
              </motion.svg>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">
              Chess<span className="text-primary">Vault</span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="text-sm text-muted-foreground mt-2"
            >
              Master Chess Through Play
            </motion.p>
          </motion.div>

          {/* Loading indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.3 }}
            className="absolute bottom-16"
          >
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

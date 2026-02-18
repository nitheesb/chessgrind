'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback } from 'react'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import {
  Puzzle,
  BookOpen,
  Swords,
  Target,
  Trophy,
  Flame,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'

interface OnboardingProps {
  onComplete: () => void
}

const slides = [
  {
    id: 'welcome',
    icon: <Trophy className="w-12 h-12" />,
    iconBg: 'bg-primary/20 text-primary',
    title: 'Welcome to ChessVault',
    description: 'Your journey to chess mastery starts here. Learn, practice, and improve with gamified lessons.',
  },
  {
    id: 'puzzles',
    icon: <Puzzle className="w-12 h-12" />,
    iconBg: 'bg-green-500/20 text-green-500',
    title: 'Solve Puzzles',
    description: 'Sharpen your tactical vision with hundreds of puzzles. Find the best move and earn XP!',
  },
  {
    id: 'openings',
    icon: <BookOpen className="w-12 h-12" />,
    iconBg: 'bg-blue-500/20 text-blue-500',
    title: 'Learn Openings',
    description: 'Master popular chess openings with interactive lessons. Play through moves and understand key ideas.',
  },
  {
    id: 'play',
    icon: <Swords className="w-12 h-12" />,
    iconBg: 'bg-accent/20 text-accent',
    title: 'Play Against AI',
    description: 'Test your skills against AI opponents of all levels. From beginner-friendly to grandmaster strength.',
  },
  {
    id: 'traps',
    icon: <Target className="w-12 h-12" />,
    iconBg: 'bg-red-500/20 text-red-500',
    title: 'Learn Traps',
    description: 'Discover sneaky opening traps to surprise your opponents. Learn how to set them and avoid falling for them.',
  },
  {
    id: 'progress',
    icon: <Flame className="w-12 h-12" />,
    iconBg: 'bg-orange-500/20 text-orange-500',
    title: 'Track Your Progress',
    description: 'Earn XP, level up, unlock achievements, and maintain daily streaks. Your chess journey, gamified!',
  },
]

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { playSound, triggerHaptic } = useSoundAndHaptics()

  const handleNext = useCallback(() => {
    playSound('click')
    triggerHaptic('light')
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1)
    } else {
      onComplete()
    }
  }, [currentSlide, onComplete, playSound, triggerHaptic])

  const handlePrev = useCallback(() => {
    playSound('click')
    triggerHaptic('light')
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1)
    }
  }, [currentSlide, playSound, triggerHaptic])

  const handleSkip = useCallback(() => {
    playSound('click')
    triggerHaptic('medium')
    onComplete()
  }, [onComplete, playSound, triggerHaptic])

  const slide = slides[currentSlide]
  const isLast = currentSlide === slides.length - 1

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-background"
    >
      {/* Skip button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleSkip}
          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center max-w-sm"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
              className={`w-24 h-24 rounded-3xl ${slide.iconBg} flex items-center justify-center mb-8`}
            >
              {slide.icon}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-display font-bold text-foreground mb-4"
            >
              {slide.title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-base text-muted-foreground leading-relaxed"
            >
              {slide.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation */}
      <div className="px-8 pb-12">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                playSound('click')
                triggerHaptic('selection')
                setCurrentSlide(idx)
              }}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide 
                  ? 'w-6 bg-primary' 
                  : 'w-2 bg-secondary hover:bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {currentSlide > 0 && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={handlePrev}
              className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </motion.button>
          )}
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            className={`flex-1 h-14 rounded-2xl font-semibold flex items-center justify-center gap-2 ${
              isLast 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-primary text-primary-foreground'
            }`}
          >
            {isLast ? "Let's Start!" : 'Continue'}
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/lib/game-context'
import { ChessPiece } from '@/components/chess/chess-pieces'
import {
  Crown,
  ArrowRight,
  Puzzle,
  BookOpen,
  Target,
  Swords,
  Zap,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function LoginPage() {
  const { login, register, authError, isLoading, isBackendEnabled } = useGame()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [localError, setLocalError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async () => {
    if (!username.trim()) return
    setLocalError(null)
    setIsSubmitting(true)

    try {
      if (isBackendEnabled && password) {
        const success = mode === 'register' 
          ? await register(username.trim(), password)
          : await login(username.trim(), password)
        
        if (!success) {
          setLocalError(authError || 'Authentication failed')
        }
      } else {
        // Demo mode - just use username
        await login(username.trim())
      }
    } catch (error) {
      setLocalError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const features = [
    { icon: <Puzzle className="w-5 h-5" />, label: 'Tactical Puzzles', description: 'Train your pattern recognition' },
    { icon: <BookOpen className="w-5 h-5" />, label: 'Opening Explorer', description: 'Master popular openings' },
    { icon: <Target className="w-5 h-5" />, label: 'Opening Traps', description: 'Learn devastating tricks' },
    { icon: <Swords className="w-5 h-5" />, label: 'Play vs AI', description: '8 difficulty levels to challenge' },
  ]

  const error = localError || authError

  // Show loading state
  if (isLoading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-sm flex flex-col items-center gap-8"
      >
        {/* Logo & Hero */}
        <motion.div variants={item} className="flex flex-col items-center gap-4">
          {/* Animated floating pieces */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-0 left-2"
            >
              <ChessPiece piece="wN" size={32} />
            </motion.div>
            <motion.div
              animate={{ y: [4, -4, 4] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-0 right-2"
            >
              <ChessPiece piece="bN" size={32} />
            </motion.div>
            <motion.div
              animate={{ y: [-3, 3, -3], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10"
            >
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center glow-primary">
                <Crown className="w-10 h-10 text-primary" />
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [3, -3, 3] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-0 left-6"
            >
              <ChessPiece piece="wR" size={28} />
            </motion.div>
            <motion.div
              animate={{ y: [-3, 3, -3] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-0 right-6"
            >
              <ChessPiece piece="bQ" size={28} />
            </motion.div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-display font-bold text-foreground">
              Chess<span className="text-primary">Mind</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Master chess through play
            </p>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div variants={item} className="w-full grid grid-cols-2 gap-2.5">
          {features.map((feature) => (
            <div
              key={feature.label}
              className="glass-card p-3 flex flex-col items-center gap-2 text-center"
            >
              <div className="text-primary">{feature.icon}</div>
              <div>
                <p className="text-[11px] font-semibold text-foreground">{feature.label}</p>
                <p className="text-[9px] text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Login/Register Form */}
        <motion.div variants={item} className="w-full flex flex-col gap-4">
          {/* Mode Toggle */}
          {isBackendEnabled && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <button
                onClick={() => setMode('login')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === 'login'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === 'register'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Sign Up
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-xs font-medium text-muted-foreground">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (password || !isBackendEnabled) && handleSubmit()}
                placeholder="Enter your username..."
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                autoFocus
              />
            </div>

            {/* Password field - only shown when backend is enabled */}
            {isBackendEnabled && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Enter your password..."
                    minLength={4}
                    className="w-full px-4 py-3 pr-10 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs text-destructive text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            onClick={handleSubmit}
            disabled={!username.trim() || isSubmitting || (isBackendEnabled && !password)}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
              />
            ) : (
              <>
                {isBackendEnabled ? (mode === 'register' ? 'Create Account' : 'Sign In') : 'Start Learning'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Demo mode note */}
          {!isBackendEnabled && (
            <p className="text-[10px] text-muted-foreground text-center">
              Demo mode - progress won&apos;t be saved between sessions
            </p>
          )}
        </motion.div>

        {/* XP tease */}
        <motion.div variants={item} className="flex items-center gap-2 text-muted-foreground">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs">Earn XP, level up, and track your progress</span>
        </motion.div>
      </motion.div>
    </div>
  )
}

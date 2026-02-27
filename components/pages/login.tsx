'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/lib/game-context'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import {
  ArrowRight,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Loader2,
} from 'lucide-react'
import { TextReveal } from '@/components/ui/animated-components'

export function LoginPage() {
  const { login, register, authError, isLoading, isBackendEnabled } = useGame()
  const { playSound } = useSoundAndHaptics()
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
    const trimmedUsername = username.trim()
    const trimmedPassword = password.trim()
    
    // Validate locally first
    if (!trimmedUsername) {
      setLocalError('Please enter a username')
      return
    }
    
    if (trimmedUsername.length < 2) {
      setLocalError('Username must be at least 2 characters')
      return
    }
    
    if (isBackendEnabled && !trimmedPassword) {
      setLocalError('Please enter a password')
      return
    }
    
    if (isBackendEnabled && trimmedPassword.length < 4) {
      setLocalError('Password must be at least 4 characters')
      return
    }
    
    setLocalError(null)
    setIsSubmitting(true)
    playSound('click')

    try {
      if (isBackendEnabled && trimmedPassword) {
        const result = mode === 'register' 
          ? await register(trimmedUsername, trimmedPassword)
          : await login(trimmedUsername, trimmedPassword)
        
        if (!result.success) {
          setLocalError(result.error || 'Authentication failed')
          playSound('fail')
        } else {
          playSound('success')
        }
      } else {
        await login(trimmedUsername)
        playSound('success')
      }
    } catch {
      setLocalError('An error occurred. Please try again.')
      playSound('fail')
    } finally {
      setIsSubmitting(false)
    }
  }

  const error = localError || authError

  if (isLoading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Mesh gradient background */}
      <div className="mesh-gradient" />
      
      {/* Header */}
      <div className="flex-shrink-0 pt-16 pb-10 px-6 text-center relative overflow-hidden z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center justify-center gap-3 mb-4 relative"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center  relative z-10">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
              <path d="M19 22H5v-2h14v2M12 2c-1.1 0-2 .9-2 2v4h4V4c0-1.1-.9-2-2-2m4 6H8v2H7v8h2v-6h6v6h2v-8h-1V8z"/>
            </svg>
          </div>
        </motion.div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          <TextReveal text="ChessVault" delay={0.1} className="shimmer-text" />
        </h1>
        <div className="text-base text-white/50">
          <TextReveal text="Master chess through practice" delay={0.3} stagger={0.04} />
        </div>
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="flex-1 bg-background rounded-t-[2rem] px-6 pt-8 pb-8 shadow-2xl relative z-10"
      >
        <div className="max-w-sm mx-auto space-y-6">
          {/* Form card */}
          <div className="glass-card rounded-2xl">
            <div className="p-6 space-y-6">
              {/* Mode Toggle with sliding indicator */}
              {isBackendEnabled && (
                <div className="flex bg-secondary rounded-2xl p-1.5 relative">
                  <motion.div
                    layoutId="mode-indicator"
                    className="absolute top-1.5 bottom-1.5 w-[calc(50%-3px)] bg-card rounded-xl shadow-md"
                    style={{ left: mode === 'login' ? '6px' : 'calc(50% + 0px)' }}
                    transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  />
                  <button
                    onClick={() => { setMode('login'); playSound('click'); }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors relative z-10"
                    style={{ color: mode === 'login' ? 'var(--foreground)' : undefined }}
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </button>
                  <button
                    onClick={() => { setMode('register'); playSound('click'); }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors relative z-10"
                    style={{ color: mode === 'register' ? 'var(--foreground)' : undefined }}
                  >
                    <UserPlus className="w-4 h-4" />
                    Sign Up
                  </button>
                </div>
              )}

              {/* Form */}
              <div className="space-y-5">
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-foreground mb-2.5">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (password || !isBackendEnabled) && handleSubmit()}
                    placeholder="Enter your username"
                    maxLength={20}
                    className="w-full h-14 px-4 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground/60 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-300"
                    autoFocus
                  />
                </div>

                {isBackendEnabled && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-foreground mb-2.5">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="Enter your password"
                        minLength={4}
                        className="w-full h-14 px-4 pr-14 rounded-2xl bg-secondary text-foreground placeholder:text-muted-foreground/60 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20"
                    >
                      <p className="text-sm text-destructive font-medium">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button with shimmer overlay */}
                <button
                  onClick={handleSubmit}
                  disabled={!username.trim() || isSubmitting || (isBackendEnabled && !password)}
                  className="relative w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-base flex items-center justify-center gap-2.5 disabled:opacity-40 shadow-amber-500/25 active:scale-[0.98] transition-transform overflow-hidden"
                >
                  <span className="absolute inset-0 pointer-events-none" style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer-sweep 2.5s ease-in-out infinite',
                  }} />
                  <span className="relative z-10 flex items-center gap-2.5">
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        {isBackendEnabled ? (mode === 'register' ? 'Create Account' : 'Sign In') : 'Get Started'}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </span>
                </button>

                {!isBackendEnabled && (
                  <p className="text-sm text-center text-muted-foreground">
                    Demo mode – your progress saves locally
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="pt-6">
            <p className="text-xs font-semibold text-muted-foreground text-center uppercase tracking-wider mb-4">
              Features
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { emoji: '🧩', label: 'Tactical Puzzles' },
                { emoji: '📖', label: 'Opening Theory' },
                { emoji: '🤖', label: 'Play vs AI' },
                { emoji: '🏆', label: 'Achievements' },
              ].map((item) => (
                <div key={item.label} className="hover-lift flex items-center gap-3 p-4 rounded-2xl bg-secondary transition-transform">
                  <span className="text-xl">{item.emoji}</span>
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

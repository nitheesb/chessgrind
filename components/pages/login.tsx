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
    if (!username.trim()) return
    setLocalError(null)
    setIsSubmitting(true)
    playSound('click')

    try {
      if (isBackendEnabled && password) {
        const success = mode === 'register' 
          ? await register(username.trim(), password)
          : await login(username.trim(), password)
        
        if (!success) {
          setLocalError(authError || 'Authentication failed')
          playSound('fail')
        } else {
          playSound('success')
        }
      } else {
        await login(username.trim())
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
    <div className="min-h-screen flex flex-col bg-[#121212]">
      {/* Header */}
      <div className="flex-shrink-0 pt-12 pb-8 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-2.5 mb-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
              <path d="M12 2L13.09 8.26L18 6L15.74 10.91L22 12L15.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L8.26 13.09L2 12L8.26 10.91L6 6L10.91 8.26L12 2Z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ChessVault</h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-sm text-white/60"
        >
          Master chess through practice
        </motion.p>
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex-1 bg-background rounded-t-3xl px-6 pt-8 pb-safe"
      >
        <div className="max-w-sm mx-auto">
          {/* Mode Toggle */}
          {isBackendEnabled && (
            <div className="flex items-center bg-secondary rounded-xl p-1 mb-6">
              <button
                onClick={() => { setMode('login'); playSound('click'); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === 'login'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <button
                onClick={() => { setMode('register'); playSound('click'); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === 'register'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </button>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (password || !isBackendEnabled) && handleSubmit()}
                placeholder="Enter username"
                maxLength={20}
                className="w-full px-4 py-3.5 rounded-xl bg-secondary border border-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                autoFocus
              />
            </div>

            {isBackendEnabled && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Enter password"
                    minLength={4}
                    className="w-full px-4 py-3.5 pr-12 rounded-xl bg-secondary border border-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-sm text-destructive"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              onClick={handleSubmit}
              disabled={!username.trim() || isSubmitting || (isBackendEnabled && !password)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98]"
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isBackendEnabled ? (mode === 'register' ? 'Create Account' : 'Sign In') : 'Continue'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>

            {!isBackendEnabled && (
              <p className="text-xs text-center text-muted-foreground">
                Demo mode – enter any username to start
              </p>
            )}
          </div>

          {/* Features */}
          <div className="mt-10 pt-8 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-4">What you'll get</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { emoji: '🧩', label: 'Tactical puzzles' },
                { emoji: '📚', label: 'Opening theory' },
                { emoji: '🤖', label: 'AI opponents' },
                { emoji: '🏆', label: 'Achievements' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 p-3 rounded-xl bg-secondary/50">
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

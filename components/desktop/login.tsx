'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/lib/game-context'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import { Crown, User, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'

export function DesktopLogin() {
  const { login, register, isBackendEnabled } = useGame()
  const { playSound } = useSoundAndHaptics()
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedUsername = username.trim()
    const trimmedPassword = password.trim()
    
    // Client-side validation
    if (!trimmedUsername) {
      setError('Please enter a username')
      return
    }
    
    if (trimmedUsername.length < 2) {
      setError('Username must be at least 2 characters')
      return
    }
    
    if (trimmedUsername.length > 20) {
      setError('Username must be 20 characters or less')
      return
    }
    
    if (isBackendEnabled && !trimmedPassword) {
      setError('Please enter a password')
      return
    }
    
    if (isBackendEnabled && trimmedPassword.length < 4) {
      setError('Password must be at least 4 characters')
      return
    }
    
    setError('')
    setIsLoading(true)
    playSound('click')

    try {
      if (isBackendEnabled) {
        const result = isLogin 
          ? await login(trimmedUsername, trimmedPassword)
          : await register(trimmedUsername, trimmedPassword)
        
        if (result.success) {
          playSound('success')
        } else {
          setError(result.error || (isLogin ? 'Invalid credentials' : 'Registration failed'))
          playSound('fail')
        }
      } else {
        // Demo mode - just login with username
        const result = await login(trimmedUsername)
        if (result.success) {
          playSound('success')
        }
      }
    } catch {
      setError('An error occurred. Please try again.')
      playSound('fail')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    playSound('click')
    setIsLogin(!isLogin)
    setError('')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(228 25% 5%) 0%, hsl(240 20% 7%) 50%, hsl(220 25% 4%) 100%)',
        }}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Mesh gradient orbs */}
        <div className="absolute inset-0">
          {/* Animated chess grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
          <div className="absolute w-[500px] h-[500px] rounded-full" style={{
            background: 'radial-gradient(circle, rgba(0, 210, 190, 0.12) 0%, transparent 70%)',
            top: '10%', left: '10%',
          }} />
          <div className="absolute w-[400px] h-[400px] rounded-full" style={{
            background: 'radial-gradient(circle, rgba(120, 60, 220, 0.08) 0%, transparent 70%)',
            bottom: '10%', right: '10%',
          }} />
          <div className="absolute w-[300px] h-[300px] rounded-full" style={{
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, transparent 70%)',
            top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          }} />
        </div>

        {/* Floating chess pieces */}
        <motion.div
          className="absolute top-20 left-20 text-white/[0.06] text-8xl"
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          ♔
        </motion.div>
        <motion.div
          className="absolute bottom-32 right-32 text-white/[0.06] text-7xl"
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          ♕
        </motion.div>
        <motion.div
          className="absolute top-1/3 right-20 text-white/[0.05] text-6xl"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        >
          ♘
        </motion.div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center border border-white/[0.1]">
                <Crown className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-5xl font-bold gradient-text-hero">ChessVault</h1>
            </div>

            <p className="text-xl text-white/60 max-w-md leading-relaxed mb-4">
              Your personal chess mastery journey starts here. Master openings, solve puzzles, 
              and become the player you've always wanted to be.
            </p>
            <p className="text-sm text-primary/70 font-medium mb-8">
              Free · No credit card · 50+ puzzles · 20 openings · AI opponents at 8 levels
            </p>

            <div className="space-y-4">
              {[
                { icon: '🧩', text: 'Thousands of tactical puzzles' },
                { icon: '📖', text: 'Learn grandmaster openings' },
                { icon: '🤖', text: 'Practice against AI opponents' },
                { icon: '🏆', text: 'Track your progress & achievements' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 text-white/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-lg">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side - Form */}
      <motion.div
        className="flex-1 flex items-center justify-center p-8 bg-background relative"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mesh-gradient" />
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">ChessVault</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {isLogin ? 'Welcome back!' : 'Create account'}
            </h2>
            <p className="text-muted-foreground mb-8">
              {isLogin 
                ? 'Enter your credentials to access your account' 
                : 'Start your chess mastery journey today'}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder={isLogin ? "Enter your username" : "Choose a username (2-20 chars)"}
                    maxLength={20}
                    autoComplete="username"
                  />
                </div>
              </div>

              {isBackendEnabled && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      placeholder={isLogin ? "Enter your password" : "Create a password (4+ chars)"}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                    className="p-3 rounded-xl bg-destructive/10 border border-destructive/20"
                  >
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all btn-shine relative overflow-hidden group"
                whileHover={{ y: -1, boxShadow: '0 8px 30px rgba(34,197,94,0.3)' }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isBackendEnabled 
                      ? (isLogin ? 'Sign In' : 'Create Account')
                      : 'Get Started'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </motion.form>
          </AnimatePresence>

          {isBackendEnabled && (
            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button
                  onClick={toggleMode}
                  className="ml-2 text-primary font-medium hover:underline"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          )}

          {!isBackendEnabled && (
            <motion.div
              className="mt-6 p-4 rounded-xl bg-secondary/50 border border-border/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-sm text-muted-foreground text-center">
                <span className="font-medium text-foreground">Demo Mode:</span> Your progress will be saved locally
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

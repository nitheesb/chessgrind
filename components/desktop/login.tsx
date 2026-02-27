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
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 relative overflow-hidden"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Floating chess pieces */}
        <motion.div
          className="absolute top-20 left-20 text-white/20 text-8xl"
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          ♔
        </motion.div>
        <motion.div
          className="absolute bottom-32 right-32 text-white/20 text-7xl"
          animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          ♕
        </motion.div>
        <motion.div
          className="absolute top-1/3 right-20 text-white/15 text-6xl"
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
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-white">ChessVault</h1>
            </div>

            <p className="text-xl text-white/90 max-w-md leading-relaxed mb-8">
              Your personal chess mastery journey starts here. Master openings, solve puzzles, 
              and become the player you've always wanted to be.
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
                  className="flex items-center gap-3 text-white/90"
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
        className="flex-1 flex items-center justify-center p-8 bg-background"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
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
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
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

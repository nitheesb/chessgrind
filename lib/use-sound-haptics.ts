'use client'

import { useCallback, useRef, useEffect } from 'react'

// Sound types available in the app
export type SoundType = 'move' | 'capture' | 'check' | 'castle' | 'promote' | 'illegal' | 'success' | 'fail' | 'click' | 'levelup'

// Audio context singleton
let audioContext: AudioContext | null = null

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

// Generate Apple-like sounds procedurally (soft, clean, minimal)
const generateSound = (type: SoundType): ((ctx: AudioContext) => void) => {
  switch (type) {
    case 'move':
      return (ctx) => {
        // Soft wood tap — Apple keyboard-like
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(440, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.06)
        gain.gain.setValueAtTime(0.12, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.06)
      }
    case 'capture':
      return (ctx) => {
        // Slightly more presence than move
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(280, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.08)
        gain.gain.setValueAtTime(0.18, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.08)
      }
    case 'check':
      return (ctx) => {
        // Gentle two-tone alert
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(660, ctx.currentTime)
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08)
        gain.gain.setValueAtTime(0.12, ctx.currentTime)
        gain.gain.setValueAtTime(0.12, ctx.currentTime + 0.08)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.18)
      }
    case 'castle':
      return (ctx) => {
        // Two quick soft taps
        const playTap = (time: number) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.setValueAtTime(350, time)
          osc.frequency.exponentialRampToValueAtTime(200, time + 0.05)
          gain.gain.setValueAtTime(0.1, time)
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05)
          osc.start(time)
          osc.stop(time + 0.05)
        }
        playTap(ctx.currentTime)
        playTap(ctx.currentTime + 0.08)
      }
    case 'promote':
      return (ctx) => {
        // Gentle ascending chime
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(523, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(1047, ctx.currentTime + 0.15)
        gain.gain.setValueAtTime(0.12, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.2)
      }
    case 'illegal':
      return (ctx) => {
        // Soft low thud — like Apple's deny sound
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(180, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08)
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.08)
      }
    case 'success':
      return (ctx) => {
        // Apple-like completion chime: C-E-G triad
        const notes = [523.25, 659.25, 783.99]
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08)
          gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.2)
          osc.start(ctx.currentTime + i * 0.08)
          osc.stop(ctx.currentTime + i * 0.08 + 0.2)
        })
      }
    case 'fail':
      return (ctx) => {
        // Gentle descending tone
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(350, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15)
        gain.gain.setValueAtTime(0.1, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.15)
      }
    case 'click':
      return (ctx) => {
        // Ultra-subtle Apple tap — like iOS keyboard
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(1200, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.015)
        gain.gain.setValueAtTime(0.06, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.015)
      }
    case 'levelup':
      return (ctx) => {
        // Apple achievement — ascending arpeggio
        const melody = [
          { freq: 523.25, time: 0 },
          { freq: 659.25, time: 0.08 },
          { freq: 783.99, time: 0.16 },
          { freq: 1046.50, time: 0.28 },
        ]
        melody.forEach(({ freq, time }) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.setValueAtTime(freq, ctx.currentTime + time)
          gain.gain.setValueAtTime(0.1, ctx.currentTime + time)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + 0.2)
          osc.start(ctx.currentTime + time)
          osc.stop(ctx.currentTime + time + 0.2)
        })
      }
    default:
      return () => {}
  }
}

// Haptic patterns
export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection'

const hapticPatterns: Record<HapticType, number[]> = {
  light: [10],
  medium: [20],
  heavy: [40],
  success: [20, 50, 40],
  warning: [30, 30, 30],
  error: [50, 100, 50],
  selection: [5],
}

// Main hook
export function useSoundAndHaptics() {
  const soundEnabledRef = useRef(true)
  const hapticEnabledRef = useRef(true)

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const settings = localStorage.getItem('chessgrind_settings')
    if (settings) {
      try {
        const parsed = JSON.parse(settings)
        soundEnabledRef.current = parsed.soundEnabled ?? true
        hapticEnabledRef.current = parsed.hapticEnabled ?? true
      } catch {}
    }
  }, [])

  const playSound = useCallback((type: SoundType) => {
    if (!soundEnabledRef.current) return
    
    const ctx = getAudioContext()
    if (!ctx) return
    
    // Resume context if suspended (autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
    
    try {
      generateSound(type)(ctx)
    } catch (e) {
      console.warn('Sound playback failed:', e)
    }
  }, [])

  const triggerHaptic = useCallback((type: HapticType = 'light') => {
    if (!hapticEnabledRef.current) return
    if (typeof navigator === 'undefined' || !navigator.vibrate) return
    
    try {
      navigator.vibrate(hapticPatterns[type])
    } catch (e) {
      // Haptics not supported
    }
  }, [])

  const setSoundEnabled = useCallback((enabled: boolean) => {
    soundEnabledRef.current = enabled
  }, [])

  const setHapticEnabled = useCallback((enabled: boolean) => {
    hapticEnabledRef.current = enabled
  }, [])

  return {
    playSound,
    triggerHaptic,
    setSoundEnabled,
    setHapticEnabled,
  }
}

// Singleton instance for use outside React components
let globalSoundHaptics: ReturnType<typeof useSoundAndHaptics> | null = null

export function getGlobalSoundHaptics() {
  if (!globalSoundHaptics) {
    // Create a simple implementation for non-hook usage
    let soundEnabled = true
    let hapticEnabled = true
    
    if (typeof window !== 'undefined') {
      const settings = localStorage.getItem('chessgrind_settings')
      if (settings) {
        try {
          const parsed = JSON.parse(settings)
          soundEnabled = parsed.soundEnabled ?? true
          hapticEnabled = parsed.hapticEnabled ?? true
        } catch {}
      }
    }
    
    globalSoundHaptics = {
      playSound: (type: SoundType) => {
        if (!soundEnabled) return
        const ctx = getAudioContext()
        if (!ctx) return
        if (ctx.state === 'suspended') ctx.resume()
        try { generateSound(type)(ctx) } catch {}
      },
      triggerHaptic: (type: HapticType = 'light') => {
        if (!hapticEnabled) return
        if (typeof navigator === 'undefined' || !navigator.vibrate) return
        try { navigator.vibrate(hapticPatterns[type]) } catch {}
      },
      setSoundEnabled: (enabled: boolean) => { soundEnabled = enabled },
      setHapticEnabled: (enabled: boolean) => { hapticEnabled = enabled },
    }
  }
  return globalSoundHaptics
}

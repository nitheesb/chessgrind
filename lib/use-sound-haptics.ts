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

// Generate sounds procedurally (no external files needed)
const generateSound = (type: SoundType): ((ctx: AudioContext) => void) => {
  switch (type) {
    case 'move':
      return (ctx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(300, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.1)
      }
    case 'capture':
      return (ctx) => {
        // Thump + crunch
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const noise = ctx.createOscillator()
        const noiseGain = ctx.createGain()
        
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(150, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15)
        gain.gain.setValueAtTime(0.4, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.15)
        
        noise.type = 'square'
        noise.connect(noiseGain)
        noiseGain.connect(ctx.destination)
        noise.frequency.setValueAtTime(100, ctx.currentTime)
        noiseGain.gain.setValueAtTime(0.2, ctx.currentTime)
        noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
        noise.start(ctx.currentTime)
        noise.stop(ctx.currentTime + 0.08)
      }
    case 'check':
      return (ctx) => {
        // Alert tone
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(880, ctx.currentTime)
        osc.frequency.setValueAtTime(660, ctx.currentTime + 0.1)
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2)
        gain.gain.setValueAtTime(0.25, ctx.currentTime)
        gain.gain.setValueAtTime(0.25, ctx.currentTime + 0.25)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.35)
      }
    case 'castle':
      return (ctx) => {
        // Two thuds
        const playThud = (time: number) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.setValueAtTime(250, time)
          osc.frequency.exponentialRampToValueAtTime(150, time + 0.1)
          gain.gain.setValueAtTime(0.3, time)
          gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1)
          osc.start(time)
          osc.stop(time + 0.1)
        }
        playThud(ctx.currentTime)
        playThud(ctx.currentTime + 0.12)
      }
    case 'promote':
      return (ctx) => {
        // Triumphant ascending tone
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(440, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.15)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.3)
      }
    case 'illegal':
      return (ctx) => {
        // Error buzz
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'square'
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(150, ctx.currentTime)
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.15)
      }
    case 'success':
      return (ctx) => {
        // Victory chime
        const notes = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1)
          gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1)
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3)
          osc.start(ctx.currentTime + i * 0.1)
          osc.stop(ctx.currentTime + i * 0.1 + 0.3)
        })
      }
    case 'fail':
      return (ctx) => {
        // Descending tone
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(400, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3)
        gain.gain.setValueAtTime(0.25, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.3)
      }
    case 'click':
      return (ctx) => {
        // Soft click
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(1000, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.03)
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.03)
      }
    case 'levelup':
      return (ctx) => {
        // Epic level up fanfare
        const melody = [
          { freq: 523.25, time: 0 },      // C5
          { freq: 659.25, time: 0.1 },    // E5
          { freq: 783.99, time: 0.2 },    // G5
          { freq: 1046.50, time: 0.35 },  // C6
          { freq: 1318.51, time: 0.5 },   // E6
          { freq: 1567.98, time: 0.65 },  // G6
        ]
        melody.forEach(({ freq, time }) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.setValueAtTime(freq, ctx.currentTime + time)
          gain.gain.setValueAtTime(0.25, ctx.currentTime + time)
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + 0.25)
          osc.start(ctx.currentTime + time)
          osc.stop(ctx.currentTime + time + 0.25)
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
    const settings = localStorage.getItem('chessvault_settings')
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
      const settings = localStorage.getItem('chessvault_settings')
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

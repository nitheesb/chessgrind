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

// Generate chess.com-style sounds — wood piece placement with resonance
const generateSound = (type: SoundType): ((ctx: AudioContext) => void) => {
  switch (type) {
    case 'move':
      return (ctx) => {
        // Chess.com wood piece placement — resonant thunk
        const t = ctx.currentTime
        // Main body — warm wood thud
        const osc1 = ctx.createOscillator()
        const gain1 = ctx.createGain()
        osc1.type = 'triangle'
        osc1.connect(gain1)
        gain1.connect(ctx.destination)
        osc1.frequency.setValueAtTime(200, t)
        osc1.frequency.exponentialRampToValueAtTime(80, t + 0.08)
        gain1.gain.setValueAtTime(0.3, t)
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
        osc1.start(t)
        osc1.stop(t + 0.12)
        // High click transient
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.type = 'square'
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.frequency.setValueAtTime(1800, t)
        osc2.frequency.exponentialRampToValueAtTime(400, t + 0.02)
        gain2.gain.setValueAtTime(0.08, t)
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.02)
        osc2.start(t)
        osc2.stop(t + 0.02)
        // Noise burst for wood texture
        const bufferSize = ctx.sampleRate * 0.03
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3
        const noise = ctx.createBufferSource()
        const noiseGain = ctx.createGain()
        const noiseFilter = ctx.createBiquadFilter()
        noiseFilter.type = 'bandpass'
        noiseFilter.frequency.value = 800
        noiseFilter.Q.value = 1.5
        noise.buffer = buffer
        noise.connect(noiseFilter)
        noiseFilter.connect(noiseGain)
        noiseGain.connect(ctx.destination)
        noiseGain.gain.setValueAtTime(0.15, t)
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04)
        noise.start(t)
        noise.stop(t + 0.04)
      }
    case 'capture':
      return (ctx) => {
        // Chess.com capture — heavier impact with snap
        const t = ctx.currentTime
        // Heavy body
        const osc1 = ctx.createOscillator()
        const gain1 = ctx.createGain()
        osc1.type = 'triangle'
        osc1.connect(gain1)
        gain1.connect(ctx.destination)
        osc1.frequency.setValueAtTime(160, t)
        osc1.frequency.exponentialRampToValueAtTime(60, t + 0.12)
        gain1.gain.setValueAtTime(0.4, t)
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
        osc1.start(t)
        osc1.stop(t + 0.15)
        // Sharp transient snap
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.type = 'sawtooth'
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.frequency.setValueAtTime(2200, t)
        osc2.frequency.exponentialRampToValueAtTime(300, t + 0.03)
        gain2.gain.setValueAtTime(0.12, t)
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.03)
        osc2.start(t)
        osc2.stop(t + 0.03)
        // Wide noise burst
        const bufferSize = ctx.sampleRate * 0.05
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.4
        const noise = ctx.createBufferSource()
        const noiseGain = ctx.createGain()
        const noiseFilter = ctx.createBiquadFilter()
        noiseFilter.type = 'bandpass'
        noiseFilter.frequency.value = 600
        noiseFilter.Q.value = 0.8
        noise.buffer = buffer
        noise.connect(noiseFilter)
        noiseFilter.connect(noiseGain)
        noiseGain.connect(ctx.destination)
        noiseGain.gain.setValueAtTime(0.2, t)
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
        noise.start(t)
        noise.stop(t + 0.06)
      }
    case 'check':
      return (ctx) => {
        // Chess.com check — sharp metallic ring
        const t = ctx.currentTime
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(880, t)
        osc.frequency.setValueAtTime(1100, t + 0.06)
        osc.frequency.exponentialRampToValueAtTime(660, t + 0.2)
        gain.gain.setValueAtTime(0.2, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
        osc.start(t)
        osc.stop(t + 0.25)
        // Low accent
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.type = 'triangle'
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.frequency.setValueAtTime(220, t)
        osc2.frequency.exponentialRampToValueAtTime(110, t + 0.1)
        gain2.gain.setValueAtTime(0.15, t)
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
        osc2.start(t)
        osc2.stop(t + 0.1)
      }
    case 'castle':
      return (ctx) => {
        // Two sequential wood taps (king then rook)
        const t = ctx.currentTime
        const playTap = (time: number, freq: number) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'triangle'
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.setValueAtTime(freq, time)
          osc.frequency.exponentialRampToValueAtTime(freq * 0.4, time + 0.08)
          gain.gain.setValueAtTime(0.25, time)
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1)
          osc.start(time)
          osc.stop(time + 0.1)
          const osc2 = ctx.createOscillator()
          const gain2 = ctx.createGain()
          osc2.type = 'square'
          osc2.connect(gain2)
          gain2.connect(ctx.destination)
          osc2.frequency.setValueAtTime(1500, time)
          osc2.frequency.exponentialRampToValueAtTime(400, time + 0.015)
          gain2.gain.setValueAtTime(0.06, time)
          gain2.gain.exponentialRampToValueAtTime(0.001, time + 0.015)
          osc2.start(time)
          osc2.stop(time + 0.015)
        }
        playTap(t, 200)
        playTap(t + 0.12, 180)
      }
    case 'promote':
      return (ctx) => {
        // Ascending bright chime with fanfare feel
        const t = ctx.currentTime
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(523, t)
        osc.frequency.exponentialRampToValueAtTime(1047, t + 0.15)
        gain.gain.setValueAtTime(0.18, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
        osc.start(t)
        osc.stop(t + 0.25)
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.type = 'triangle'
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.frequency.setValueAtTime(784, t + 0.05)
        osc2.frequency.exponentialRampToValueAtTime(1568, t + 0.2)
        gain2.gain.setValueAtTime(0.1, t + 0.05)
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
        osc2.start(t + 0.05)
        osc2.stop(t + 0.3)
      }
    case 'illegal':
      return (ctx) => {
        // Chess.com illegal — low buzz rejection
        const t = ctx.currentTime
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sawtooth'
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(150, t)
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.1)
        gain.gain.setValueAtTime(0.12, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
        osc.start(t)
        osc.stop(t + 0.1)
      }
    case 'success':
      return (ctx) => {
        // Victory fanfare — bright ascending
        const t = ctx.currentTime
        const notes = [523.25, 659.25, 783.99, 1046.50]
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.setValueAtTime(freq, t + i * 0.1)
          gain.gain.setValueAtTime(0.15, t + i * 0.1)
          gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.25)
          osc.start(t + i * 0.1)
          osc.stop(t + i * 0.1 + 0.25)
        })
      }
    case 'fail':
      return (ctx) => {
        // Descending two-tone defeat
        const t = ctx.currentTime
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(440, t)
        osc.frequency.exponentialRampToValueAtTime(220, t + 0.2)
        gain.gain.setValueAtTime(0.12, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
        osc.start(t)
        osc.stop(t + 0.25)
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.type = 'sine'
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.frequency.setValueAtTime(330, t + 0.15)
        osc2.frequency.exponentialRampToValueAtTime(165, t + 0.35)
        gain2.gain.setValueAtTime(0.1, t + 0.15)
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
        osc2.start(t + 0.15)
        osc2.stop(t + 0.4)
      }
    case 'click':
      return (ctx) => {
        // Chess.com button click — crisp tactile snap
        const t = ctx.currentTime
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'square'
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(1000, t)
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.02)
        gain.gain.setValueAtTime(0.08, t)
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025)
        osc.start(t)
        osc.stop(t + 0.025)
      }
    case 'levelup':
      return (ctx) => {
        // Achievement fanfare
        const t = ctx.currentTime
        const melody = [
          { freq: 523.25, time: 0 },
          { freq: 659.25, time: 0.1 },
          { freq: 783.99, time: 0.2 },
          { freq: 1046.50, time: 0.35 },
        ]
        melody.forEach(({ freq, time }) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.frequency.setValueAtTime(freq, t + time)
          gain.gain.setValueAtTime(0.14, t + time)
          gain.gain.exponentialRampToValueAtTime(0.001, t + time + 0.25)
          osc.start(t + time)
          osc.stop(t + time + 0.25)
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

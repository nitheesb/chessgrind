'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform, useInView } from 'framer-motion'

// ═══════════════════════════
// ANIMATED COUNTER
// ═══════════════════════════

export function AnimatedCounter({
  value,
  duration = 1.2,
  className = '',
  prefix = '',
  suffix = '',
}: {
  value: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { duration: duration * 1000, bounce: 0 })
  const isInView = useInView(ref, { once: true, margin: '-20px' })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (isInView) {
      motionValue.set(value)
    }
  }, [isInView, value, motionValue])

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(Math.round(latest))
    })
    return unsubscribe
  }, [springValue])

  return (
    <span ref={ref} className={className}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  )
}

// ═══════════════════════════
// 3D TILT CARD
// ═══════════════════════════

export function Tilt3DCard({
  children,
  className = '',
  intensity = 10,
  glare = true,
}: {
  children: React.ReactNode
  className?: string
  intensity?: number
  glare?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 300, damping: 30 })
  const glareOpacity = useTransform(
    [x, y],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ([latestX, latestY]: any) => Math.min(0.15, (Math.abs(latestX as number) + Math.abs(latestY as number)) * 0.2)
  )

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }, [x, y])

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      className={className}
    >
      <div style={{ transformStyle: 'preserve-3d' }}>
        {children}
        {glare && (
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none"
            style={{
              opacity: glareOpacity,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
              borderRadius: 'inherit',
            }}
          />
        )}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════
// PROGRESS RING (SVG)
// ═══════════════════════════

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
  color = 'hsl(142, 71%, 45%)',
  bgColor = 'hsl(222, 16%, 12%)',
  children,
  className = '',
}: {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  children?: React.ReactNode
  className?: string
}) {
  const ref = useRef<SVGSVGElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-20px' })
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg ref={ref} width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={isInView ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════
// TEXT REVEAL
// ═══════════════════════════

export function TextReveal({
  text,
  className = '',
  delay = 0,
  stagger = 0.03,
}: {
  text: string
  className?: string
  delay?: number
  stagger?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-20px' })
  const words = text.split(' ')

  return (
    <span ref={ref} className={`inline-flex flex-wrap gap-x-[0.25em] ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="overflow-hidden inline-block">
          <motion.span
            className="inline-block"
            initial={{ y: '100%', opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
            transition={{
              duration: 0.5,
              delay: delay + i * stagger,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

// ═══════════════════════════
// FLOATING PARTICLES
// ═══════════════════════════

export function ParticleField({
  count = 20,
  className = '',
  colors = ['rgba(34,197,94,0.3)', 'rgba(245,158,11,0.2)', 'rgba(59,130,246,0.2)'],
}: {
  count?: number
  className?: string
  colors?: string[]
}) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 1 + Math.random() * 3,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
    }))
  ).current

  return (
    <div className={`particle-field ${className}`}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════
// GLOWING BORDER
// ═══════════════════════════

export function GlowingBorder({
  children,
  className = '',
  color = 'primary',
}: {
  children: React.ReactNode
  className?: string
  color?: 'primary' | 'gold' | 'blue'
}) {
  const colorMap = {
    primary: 'from-emerald-500/40 via-transparent to-emerald-500/40',
    gold: 'from-amber-500/40 via-transparent to-amber-500/40',
    blue: 'from-blue-500/40 via-transparent to-blue-500/40',
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute -inset-[1px] rounded-2xl overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${colorMap[color]} animate-[border-spin_4s_linear_infinite]`}
          style={{ background: `conic-gradient(from var(--border-angle, 0deg), transparent, ${color === 'primary' ? 'rgba(34,197,94,0.4)' : color === 'gold' ? 'rgba(245,158,11,0.4)' : 'rgba(59,130,246,0.4)'}, transparent)` }}
        />
      </div>
      <div className="relative bg-card rounded-2xl">{children}</div>
    </div>
  )
}

// ═══════════════════════════
// SCROLL REVEAL
// ═══════════════════════════

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const directionMap = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { x: 30, y: 0 },
    right: { x: -30, y: 0 },
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...directionMap[direction] }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════
// STAGGER CONTAINER
// ═══════════════════════════

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

export const fadeInScale = {
  hidden: { opacity: 0, scale: 0.97 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

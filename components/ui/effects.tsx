'use client'

import { useEffect, useRef, useCallback, useState, type ReactNode } from 'react'

// ═══════════════════════════════════════════════
// CURSOR SPOTLIGHT — follows mouse across page
// ═══════════════════════════════════════════════

export function CursorSpotlight() {
  const spotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let x = 0, y = 0, targetX = 0, targetY = 0
    let rafId: number | undefined
    let idle = false

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX
      targetY = e.clientY
      if (idle) {
        idle = false
        rafId = requestAnimationFrame(animate)
      }
    }

    const animate = () => {
      x += (targetX - x) * 0.15
      y += (targetY - y) * 0.15
      if (spotRef.current) {
        spotRef.current.style.transform = `translate(${x - 300}px, ${y - 300}px)`
      }
      // Stop when close enough to target
      if (Math.abs(targetX - x) < 0.5 && Math.abs(targetY - y) < 0.5) {
        idle = true
        rafId = undefined
        return
      }
      rafId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      ref={spotRef}
      className="pointer-events-none fixed z-[1] mix-blend-soft-light"
      style={{
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, rgba(99,102,241,0.03) 40%, transparent 70%)',
        willChange: 'transform',
      }}
    />
  )
}

// ═══════════════════════════════════════════════
// TILT CARD — 3D perspective on mouse hover
// ═══════════════════════════════════════════════

export function TiltCard({
  children,
  className = '',
  intensity = 8,
  glare = true,
  scale = 1.02,
  onClick,
}: {
  children: ReactNode
  className?: string
  intensity?: number
  glare?: boolean
  scale?: number
  onClick?: () => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | undefined>(undefined)
  const currentRef = useRef({ rotateX: 0, rotateY: 0, scale: 1 })
  const targetRef = useRef({ rotateX: 0, rotateY: 0, scale: 1 })

  const animate = useCallback(() => {
    const c = currentRef.current
    const t = targetRef.current
    c.rotateX += (t.rotateX - c.rotateX) * 0.12
    c.rotateY += (t.rotateY - c.rotateY) * 0.12
    c.scale += (t.scale - c.scale) * 0.12

    if (cardRef.current) {
      cardRef.current.style.transform =
        `perspective(800px) rotateX(${c.rotateX}deg) rotateY(${c.rotateY}deg) scale3d(${c.scale},${c.scale},${c.scale})`
    }
    if (glareRef.current) {
      const gx = 50 + (c.rotateY / intensity) * 50
      const gy = 50 - (c.rotateX / intensity) * 50
      glareRef.current.style.background =
        `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.08) 0%, transparent 60%)`
    }

    // Stop animating when at rest (back to target)
    const atRest = Math.abs(c.rotateX - t.rotateX) < 0.01 && Math.abs(c.rotateY - t.rotateY) < 0.01 && Math.abs(c.scale - t.scale) < 0.001
    if (atRest && t.rotateX === 0 && t.rotateY === 0) {
      rafRef.current = undefined
      return
    }
    rafRef.current = requestAnimationFrame(animate)
  }, [intensity])

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    targetRef.current = { rotateX: -y * intensity, rotateY: x * intensity, scale }
  }, [intensity, scale])

  const handleEnter = useCallback(() => {
    if (!rafRef.current) rafRef.current = requestAnimationFrame(animate)
  }, [animate])

  const handleLeave = useCallback(() => {
    targetRef.current = { rotateX: 0, rotateY: 0, scale: 1 }
    // Let it animate back to 0, then stop
  }, [])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      ref={cardRef}
      className={className}
      style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={onClick}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          className="absolute inset-0 rounded-[inherit] pointer-events-none z-10"
          style={{ mixBlendMode: 'overlay' }}
        />
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════
// MAGNETIC BUTTON — attracts toward cursor
// ═══════════════════════════════════════════════

export function MagneticWrap({
  children,
  className = '',
  strength = 0.3,
  innerStrength = 0.5,
}: {
  children: ReactNode
  className?: string
  strength?: number
  innerStrength?: number
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  const handleMove = useCallback((e: React.MouseEvent) => {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`
    if (innerRef.current) {
      innerRef.current.style.transform = `translate(${x * innerStrength}px, ${y * innerStrength}px)`
    }
  }, [strength, innerStrength])

  const handleLeave = useCallback(() => {
    if (wrapRef.current) wrapRef.current.style.transform = 'translate(0, 0)'
    if (innerRef.current) innerRef.current.style.transform = 'translate(0, 0)'
  }, [])

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)', willChange: 'transform' }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div ref={innerRef} style={{ transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)' }}>
        {children}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════
// ODOMETER COUNTER — digits roll independently
// ═══════════════════════════════════════════════

export function OdometerCounter({
  value,
  className = '',
  prefix = '',
  suffix = '',
}: {
  value: number
  className?: string
  prefix?: string
  suffix?: string
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || hasAnimated.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return
        hasAnimated.current = true
        observer.disconnect()
        setDisplayValue(value)
      },
      { rootMargin: '-20px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value])

  const digits = String(displayValue).split('')
  const targetDigits = String(value).split('')

  return (
    <span ref={ref} className={`inline-flex items-baseline ${className}`}>
      {prefix && <span>{prefix}</span>}
      <span className="inline-flex overflow-hidden">
        {(hasAnimated.current ? targetDigits : digits).map((digit, i) => (
          <OdometerDigit key={`${i}-${targetDigits.length}`} digit={digit} delay={i * 60} animate={hasAnimated.current} />
        ))}
      </span>
      {suffix && <span>{suffix}</span>}
    </span>
  )
}

function OdometerDigit({ digit, delay, animate }: { digit: string; delay: number; animate: boolean }) {
  const [show, setShow] = useState(!animate)
  
  useEffect(() => {
    if (!animate) return
    const t = setTimeout(() => setShow(true), delay)
    return () => clearTimeout(t)
  }, [animate, delay])

  if (digit === ',' || digit === '.') {
    return <span>{digit}</span>
  }

  const num = parseInt(digit) || 0

  return (
    <span
      className="relative inline-block overflow-hidden"
      style={{ width: '0.65em', height: '1.15em' }}
    >
      <span
        className="absolute left-0 flex flex-col items-center"
        style={{
          transition: show ? `transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms` : 'none',
          transform: show ? `translateY(${-num * 1.15}em)` : 'translateY(0)',
          width: '100%',
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <span key={n} style={{ height: '1.15em', lineHeight: '1.15em', display: 'block', textAlign: 'center' }}>
            {n}
          </span>
        ))}
      </span>
    </span>
  )
}

// ═══════════════════════════════════════════════
// TYPEWRITER TEXT
// ═══════════════════════════════════════════════

export function TypewriterText({
  text,
  className = '',
  speed = 50,
  delay = 300,
  cursor = true,
}: {
  text: string
  className?: string
  speed?: number
  delay?: number
  cursor?: boolean
}) {
  const [displayed, setDisplayed] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) {
          clearInterval(interval)
          setDone(true)
        }
      }, speed)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(startTimeout)
  }, [text, speed, delay])

  // Blink cursor
  useEffect(() => {
    if (!cursor) return
    const interval = setInterval(() => setShowCursor(v => !v), 530)
    return () => clearInterval(interval)
  }, [cursor])

  return (
    <span className={className}>
      {displayed}
      {cursor && !done && (
        <span
          className="inline-block w-[3px] h-[1em] bg-primary ml-0.5 align-middle rounded-full"
          style={{ opacity: showCursor ? 1 : 0, transition: 'opacity 0.1s' }}
        />
      )}
    </span>
  )
}

// ═══════════════════════════════════════════════
// REVEAL ON SCROLL — with spring stagger
// ═══════════════════════════════════════════════

export function RevealGrid({
  children,
  className = '',
  staggerDelay = 80,
}: {
  children: ReactNode
  className?: string
  staggerDelay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '-30px', threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div
              key={i}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
                transition: `opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * staggerDelay}ms, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * staggerDelay}ms`,
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  )
}

// ═══════════════════════════════════════════════
// GLOW BORDER CARD — animated gradient border
// ═══════════════════════════════════════════════

export function GlowBorderCard({
  children,
  className = '',
  active = false,
}: {
  children: ReactNode
  className?: string
  active?: boolean
}) {
  return (
    <div className={`relative group ${className}`}>
      {/* Animated conic gradient border */}
      <div
        className="absolute -inset-[1px] rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'conic-gradient(from var(--border-angle, 0deg), transparent 0%, rgba(245,158,11,0.4) 10%, transparent 20%, transparent 50%, rgba(56,145,255,0.3) 60%, transparent 70%)',
          animation: active ? 'border-spin 3s linear infinite' : 'none',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1px',
        }}
      />
      <div className="relative z-10 rounded-[inherit]">{children}</div>
    </div>
  )
}

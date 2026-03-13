'use client'

import { useEffect, useRef } from 'react'

/**
 * ChessCursorTrail
 *
 * Draws a canvas-based cursor trail of tiny glowing chess pieces (♟ ♞ ♝).
 * Uses requestAnimationFrame + canvas — zero DOM nodes created per frame,
 * zero layout/style reflow, composited entirely on GPU via will-change.
 *
 * Performance profile:
 *   - Single <canvas> element, pointer-events:none, position:fixed
 *   - All rendering via Canvas 2D API (no DOM mutations after mount)
 *   - Particle pool pre-allocated (no GC pressure during move)
 *   - Runs only on non-touch devices
 */

const PIECES = ['♟', '♞', '♝', '♜', '♛', '♚']
const POOL_SIZE = 28
const PARTICLE_LIFE = 38 // frames
const SPAWN_INTERVAL = 3 // spawn every N mousemove events

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  piece: string
  size: number
  hue: number // 38-48 for gold tones
  rotation: number
  rotSpeed: number
}

function makeParticle(): Particle {
  return { x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: PARTICLE_LIFE, piece: '♟', size: 14, hue: 43, rotation: 0, rotSpeed: 0 }
}

export function ChessCursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Skip on touch-only devices
    if (typeof window === 'undefined') return
    const hasMouse = window.matchMedia('(pointer: fine)').matches
    if (!hasMouse) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Size canvas to viewport
    let W = window.innerWidth
    let H = window.innerHeight
    canvas.width = W
    canvas.height = H

    // Pre-allocate particle pool
    const pool: Particle[] = Array.from({ length: POOL_SIZE }, makeParticle)
    let poolHead = 0

    const active: Particle[] = []
    let mouseX = -200
    let mouseY = -200
    let moveCount = 0
    let rafId = 0

    const onResize = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W
      canvas.height = H
    }

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      moveCount++
      if (moveCount % SPAWN_INTERVAL !== 0) return

      // Recycle from pool
      const p = pool[poolHead % POOL_SIZE]
      poolHead++

      const angle = Math.random() * Math.PI * 2
      const speed = 0.4 + Math.random() * 0.8
      p.x = mouseX
      p.y = mouseY
      p.vx = Math.cos(angle) * speed
      p.vy = Math.sin(angle) * speed - 0.6 // slight upward drift
      p.life = PARTICLE_LIFE
      p.maxLife = PARTICLE_LIFE
      p.piece = PIECES[Math.floor(Math.random() * PIECES.length)]
      p.size = 10 + Math.random() * 8
      p.hue = 38 + Math.random() * 15
      p.rotation = Math.random() * Math.PI * 2
      p.rotSpeed = (Math.random() - 0.5) * 0.15

      active.push(p)
    }

    const render = () => {
      ctx.clearRect(0, 0, W, H)

      for (let i = active.length - 1; i >= 0; i--) {
        const p = active[i]
        p.life--
        if (p.life <= 0) {
          active.splice(i, 1)
          continue
        }

        const t = p.life / p.maxLife // 1→0 as particle dies
        const alpha = t < 0.3 ? t / 0.3 * 0.85 : t * 0.85 // fade in fast, fade out slow

        p.x += p.vx
        p.y += p.vy
        p.vy += 0.02 // gentle gravity
        p.rotation += p.rotSpeed

        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.globalAlpha = alpha
        ctx.font = `${p.size}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        // Gold glow
        ctx.shadowColor = `hsl(${p.hue}, 100%, 60%)`
        ctx.shadowBlur = 8 * t
        ctx.fillStyle = `hsl(${p.hue}, 95%, ${50 + t * 20}%)`
        ctx.fillText(p.piece, 0, 0)
        ctx.restore()
      }

      rafId = requestAnimationFrame(render)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    rafId = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ willChange: 'transform' }}
      aria-hidden="true"
    />
  )
}

'use client'

import { useState, useEffect } from 'react'

/**
 * Responsive board size hook for mobile pages.
 * Calculates the largest square board that fits the viewport width
 * minus horizontal padding, capped at `maxSize`.
 * Listens to resize and orientation changes.
 */
export function useMobileBoardSize(maxSize = 520, padding = 24): number {
  const [size, setSize] = useState(() => {
    if (typeof window === 'undefined') return 360
    return Math.min(maxSize, window.innerWidth - padding * 2)
  })

  useEffect(() => {
    const update = () => {
      const next = Math.min(maxSize, window.innerWidth - padding * 2)
      setSize((prev) => (prev === next ? prev : next))
    }
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [maxSize, padding])

  return size
}

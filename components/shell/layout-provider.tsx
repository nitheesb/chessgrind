'use client'

import { useEffect } from 'react'
import { startLayoutManager } from '@/lib/layout-manager'

/**
 * Boots the centralized layout manager once at app root.
 * Must be rendered inside a Client Component boundary.
 */
export function LayoutProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const cleanup = startLayoutManager()
    return cleanup
  }, [])

  return <>{children}</>
}

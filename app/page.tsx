'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { GameProvider } from '@/lib/game-context'
import { SettingsProvider } from '@/lib/settings-context'

const AppShell = lazy(() => import('@/components/shell/app-shell').then(m => ({ default: m.AppShell })))
const DesktopShell = lazy(() => import('@/components/shell/desktop-shell').then(m => ({ default: m.DesktopShell })))

const MOBILE_BREAKPOINT = 768

export default function Page() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  if (isMobile === null) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <SettingsProvider>
      <GameProvider>
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          {isMobile ? (
            <div className="max-w-lg mx-auto min-h-screen">
              <AppShell />
            </div>
          ) : (
            <DesktopShell />
          )}
        </Suspense>
      </GameProvider>
    </SettingsProvider>
  )
}

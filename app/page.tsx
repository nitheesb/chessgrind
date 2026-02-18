'use client'

import { useState, useEffect } from 'react'
import { GameProvider } from '@/lib/game-context'
import { SettingsProvider } from '@/lib/settings-context'
import { AppShell } from '@/components/shell/app-shell'
import { DesktopShell } from '@/components/shell/desktop-shell'

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

  // Show nothing during SSR hydration to prevent flash
  if (isMobile === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 animate-pulse" />
      </div>
    )
  }

  return (
    <SettingsProvider>
      <GameProvider>
        {isMobile ? (
          <div className="max-w-lg mx-auto min-h-screen">
            <AppShell />
          </div>
        ) : (
          <DesktopShell />
        )}
      </GameProvider>
    </SettingsProvider>
  )
}

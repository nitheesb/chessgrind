'use client'

import { GameProvider } from '@/lib/game-context'
import { AppShell } from '@/components/shell/app-shell'

export default function Page() {
  return (
    <GameProvider>
      <div className="max-w-lg mx-auto min-h-screen">
        <AppShell />
      </div>
    </GameProvider>
  )
}

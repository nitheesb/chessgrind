'use client'
import dynamic from 'next/dynamic'

const ChessCursorTrail = dynamic(
  () => import('@/components/ui/chess-cursor-trail').then(m => ({ default: m.ChessCursorTrail })),
  { ssr: false }
)

export function CursorEffects() {
  return <ChessCursorTrail />
}

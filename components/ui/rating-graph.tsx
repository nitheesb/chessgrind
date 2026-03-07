'use client'

import { useMemo } from 'react'

// SVG sparkline for rating history

interface RatingGraphProps {
  data: Array<{ date: string; rating: number }>
  width?: number
  height?: number
  color?: string
}

export function RatingGraph({ data, width = 300, height = 80, color = '#10b981' }: RatingGraphProps) {
  if (data.length < 2) return null

  const ratings = data.map(d => d.rating)
  const minRating = Math.min(...ratings)
  const maxRating = Math.max(...ratings)
  const range = maxRating - minRating || 1

  // Map to SVG coordinates with padding
  const padX = 4, padY = 8
  const w = width - padX * 2
  const h = height - padY * 2

  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * w,
    y: padY + h - ((d.rating - minRating) / range) * h,
  }))

  // Smooth bezier curve
  const pathData = points.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`
    const prev = points[i - 1]
    const cp1x = prev.x + (pt.x - prev.x) / 3
    const cp2x = prev.x + (pt.x - prev.x) * 2 / 3
    return `${acc} C ${cp1x} ${prev.y} ${cp2x} ${pt.y} ${pt.x} ${pt.y}`
  }, '')

  // Fill area under the line
  const fillPath = `${pathData} L ${points[points.length - 1].x} ${height - padY + padY} L ${points[0].x} ${height - padY + padY} Z`

  // Trend: compare last 5 vs first 5
  const firstAvg = data.slice(0, Math.min(5, data.length)).reduce((a, d) => a + d.rating, 0) / Math.min(5, data.length)
  const lastAvg = data.slice(-Math.min(5, data.length)).reduce((a, d) => a + d.rating, 0) / Math.min(5, data.length)
  const diff = lastAvg - firstAvg
  const trendArrow = diff > 5 ? '↑' : diff < -5 ? '↓' : '→'
  const trendColor = diff > 5 ? 'text-amber-400' : diff < -5 ? 'text-red-400' : 'text-muted-foreground'

  const currentRating = data[data.length - 1].rating
  const gradId = useMemo(() => `rg-${Math.random().toString(36).slice(2, 7)}`, [])

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">{currentRating}</span>
          <span className={`text-sm font-semibold ${trendColor}`}>{trendArrow}</span>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground">Min: {minRating}</p>
          <p className="text-[10px] text-muted-foreground">Max: {maxRating}</p>
        </div>
      </div>
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <path d={fillPath} fill={`url(#${gradId})`} />
        <path d={pathData} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Current value dot */}
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill={color} />
      </svg>
    </div>
  )
}

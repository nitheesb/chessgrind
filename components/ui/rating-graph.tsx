'use client'

import { useId, useMemo, useState, useCallback, useRef } from 'react'

interface RatingGraphProps {
  data: Array<{ date: string; rating: number }>
  width?: number
  height?: number
  color?: string
  showTimeFilters?: boolean
}

type TimeRange = '7d' | '30d' | '90d' | 'all'

function filterByTimeRange(data: Array<{ date: string; rating: number }>, range: TimeRange) {
  if (range === 'all') return data
  const now = Date.now()
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const cutoff = now - days * 24 * 60 * 60 * 1000
  return data.filter(d => new Date(d.date).getTime() >= cutoff)
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function RatingGraph({ data, width = 300, height = 80, color = '#f59e0b', showTimeFilters = false }: RatingGraphProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('all')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const filteredData = useMemo(() => filterByTimeRange(data, timeRange), [data, timeRange])

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || filteredData.length < 2) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const padX = 4
    const w = width - padX * 2
    const ratio = Math.max(0, Math.min(1, (x - padX) / w))
    const idx = Math.round(ratio * (filteredData.length - 1))
    setHoveredIndex(idx)
  }, [filteredData.length, width])

  if (filteredData.length < 2) return null

  const ratings = filteredData.map(d => d.rating)
  const minRating = Math.min(...ratings)
  const maxRating = Math.max(...ratings)
  const range = maxRating - minRating || 1

  // Map to SVG coordinates with padding
  const padX = 4, padY = 8
  const w = width - padX * 2
  const h = height - padY * 2

  const points = filteredData.map((d, i) => ({
    x: padX + (i / (filteredData.length - 1)) * w,
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
  const firstAvg = filteredData.slice(0, Math.min(5, filteredData.length)).reduce((a, d) => a + d.rating, 0) / Math.min(5, filteredData.length)
  const lastAvg = filteredData.slice(-Math.min(5, filteredData.length)).reduce((a, d) => a + d.rating, 0) / Math.min(5, filteredData.length)
  const diff = lastAvg - firstAvg
  const trendArrow = diff > 5 ? '↑' : diff < -5 ? '↓' : '→'
  const trendColor = diff > 5 ? 'text-amber-400' : diff < -5 ? 'text-red-400' : 'text-muted-foreground'

  const currentRating = filteredData[filteredData.length - 1].rating
  const gradId = `rg-${useId()}`

  const hoveredPoint = hoveredIndex !== null ? filteredData[hoveredIndex] : null
  const hoveredSvgPoint = hoveredIndex !== null ? points[hoveredIndex] : null

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">{currentRating}</span>
          <span className={`text-sm font-semibold ${trendColor}`}>{trendArrow}</span>
        </div>
        <div className="flex items-center gap-2">
          {showTimeFilters && (
            <div className="flex items-center gap-1 mr-3">
              {(['7d', '30d', '90d', 'all'] as TimeRange[]).map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${timeRange === r ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {r === 'all' ? 'All' : r}
                </button>
              ))}
            </div>
          )}
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Min: {minRating}</p>
            <p className="text-[10px] text-muted-foreground">Max: {maxRating}</p>
          </div>
        </div>
      </div>
      <div className="relative">
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
        >
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
          {/* Hover indicator */}
          {hoveredSvgPoint && (
            <>
              <line x1={hoveredSvgPoint.x} y1={padY} x2={hoveredSvgPoint.x} y2={height - padY} stroke={color} strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5" />
              <circle cx={hoveredSvgPoint.x} cy={hoveredSvgPoint.y} r="4" fill={color} stroke="var(--background)" strokeWidth="2" />
            </>
          )}
        </svg>
        {/* Tooltip */}
        {hoveredPoint && hoveredSvgPoint && (
          <div
            className="absolute pointer-events-none bg-popover border border-border rounded-md px-2 py-1 shadow-lg z-10"
            style={{
              left: Math.min(hoveredSvgPoint.x, width - 80),
              top: -32,
            }}
          >
            <span className="text-xs font-bold text-foreground">{hoveredPoint.rating}</span>
            <span className="text-[10px] text-muted-foreground ml-1.5">{formatDate(hoveredPoint.date)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useMemo } from 'react'

// SVG Radar chart for tactical theme strengths/weaknesses
// Lightweight: pure SVG, no dependencies

interface RadarChartProps {
  data: Record<string, number> // theme -> score (0-100)
  size?: number
}

export function TacticalRadar({ data, size = 240 }: RadarChartProps) {
  const themes = useMemo(() => Object.keys(data), [data])
  const n = themes.length
  if (n < 3) return null

  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 30

  const angleStep = (2 * Math.PI) / n
  const levels = [25, 50, 75, 100]

  // Compute points for each data value
  const dataPoints = useMemo(() =>
    themes.map((theme, i) => {
      const angle = -Math.PI / 2 + i * angleStep
      const r = (data[theme] / 100) * radius
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        label: theme,
        value: data[theme],
        labelX: cx + (radius + 18) * Math.cos(angle),
        labelY: cy + (radius + 18) * Math.sin(angle),
      }
    })
  , [themes, data, cx, cy, radius, angleStep, n])

  const polygonPoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <svg width={size} height={size} className="overflow-visible">
      {/* Grid levels */}
      {levels.map(level => {
        const r = (level / 100) * radius
        const pts = Array.from({ length: n }, (_, i) => {
          const angle = -Math.PI / 2 + i * angleStep
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
        }).join(' ')
        return (
          <polygon
            key={level}
            points={pts}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={1}
          />
        )
      })}

      {/* Axis lines */}
      {themes.map((_, i) => {
        const angle = -Math.PI / 2 + i * angleStep
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + radius * Math.cos(angle)}
            y2={cy + radius * Math.sin(angle)}
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={1}
          />
        )
      })}

      {/* Data polygon */}
      <polygon
        points={polygonPoints}
        fill="hsl(38, 92%, 50%)"
        fillOpacity={0.15}
        stroke="hsl(38, 92%, 50%)"
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="hsl(38, 92%, 50%)" />
      ))}

      {/* Labels */}
      {dataPoints.map((p, i) => (
        <text
          key={i}
          x={p.labelX}
          y={p.labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-muted-foreground"
          fontSize={10}
          fontWeight={500}
        >
          {p.label}
        </text>
      ))}
    </svg>
  )
}

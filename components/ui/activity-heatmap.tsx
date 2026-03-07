'use client'

// GitHub-style contribution heatmap for chess activity
// Shows last 52 weeks (364 days) as a 7×52 grid of colored squares

import { useState } from 'react'

interface ActivityHeatmapProps {
  activityDates: Record<string, number>
  compact?: boolean
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['M', '', 'W', '', 'F', '', '']

function getColor(count: number): string {
  if (count === 0) return 'bg-secondary'
  if (count === 1) return 'bg-amber-500/25'
  if (count <= 3) return 'bg-amber-500/50'
  if (count <= 5) return 'bg-amber-500/75'
  return 'bg-amber-500'
}

export function ActivityHeatmap({ activityDates, compact = false }: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null)

  // Build the 364-day grid (52 weeks × 7 days)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Find the most recent Sunday (start of last visible week column end)
  const dayOfWeek = today.getDay() // 0=Sun
  // We want 52 full weeks; start from 364 days ago
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 363)
  // Align to Monday
  const startDow = startDate.getDay()
  const offset = startDow === 0 ? 6 : startDow - 1
  startDate.setDate(startDate.getDate() - offset)

  const weeks: Array<Array<{ date: Date; count: number }>> = []
  let current = new Date(startDate)

  for (let w = 0; w < 52; w++) {
    const week: Array<{ date: Date; count: number }> = []
    for (let d = 0; d < 7; d++) {
      const dateKey = current.toDateString()
      week.push({ date: new Date(current), count: activityDates[dateKey] || 0 })
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
  }

  // Build month labels
  const monthLabels: Array<{ label: string; col: number }> = []
  weeks.forEach((week, col) => {
    const firstDay = week[0].date
    if (firstDay.getDate() <= 7) {
      monthLabels.push({ label: MONTHS[firstDay.getMonth()], col })
    }
  })

  const totalActivity = Object.values(activityDates).reduce((a, b) => a + b, 0)

  if (compact) {
    return (
      <div className="overflow-x-auto">
        <div className="flex gap-0.5 min-w-max">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`w-2.5 h-2.5 rounded-[2px] ${getColor(day.count)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {tooltip && (
        <div
          className="absolute z-10 px-2 py-1 rounded bg-card border border-border text-[10px] text-foreground whitespace-nowrap pointer-events-none shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y - 28 }}
        >
          {tooltip.text}
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="flex ml-6 mb-1">
            {weeks.map((_, wi) => {
              const label = monthLabels.find(m => m.col === wi)
              return (
                <div key={wi} className="w-3 mr-0.5 text-[9px] text-muted-foreground">
                  {label ? label.label : ''}
                </div>
              )
            })}
          </div>

          {/* Grid with day labels */}
          <div className="flex gap-0">
            {/* Day labels column */}
            <div className="flex flex-col gap-0.5 mr-1">
              {DAY_LABELS.map((label, i) => (
                <div key={i} className="w-4 h-3 text-[9px] text-muted-foreground flex items-center">
                  {label}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-0.5">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      className={`w-3 h-3 rounded-[2px] cursor-pointer transition-opacity hover:opacity-80 ${getColor(day.count)}`}
                      onMouseEnter={(e) => {
                        const rect = (e.target as HTMLElement).getBoundingClientRect()
                        const parentRect = (e.target as HTMLElement).closest('.relative')?.getBoundingClientRect()
                        if (parentRect) {
                          setTooltip({
                            text: `${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${day.count} ${day.count === 1 ? 'activity' : 'activities'}`,
                            x: rect.left - parentRect.left,
                            y: rect.top - parentRect.top,
                          })
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <p className="text-[10px] text-muted-foreground mt-2">Total: {totalActivity} {totalActivity === 1 ? 'activity' : 'activities'} in the last year</p>
    </div>
  )
}

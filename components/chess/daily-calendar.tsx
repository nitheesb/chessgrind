'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, X, Flame, Trophy } from 'lucide-react'
import { useGame } from '@/lib/game-context'

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay()
  // Convert Sunday=0 to Monday-based (Mon=0, Sun=6)
  return day === 0 ? 6 : day - 1
}

function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function getActivityLevel(xp: number): string {
  if (xp <= 0) return 'bg-muted/30'
  if (xp <= 20) return 'bg-green-400/30'
  if (xp <= 50) return 'bg-green-500/50'
  if (xp <= 100) return 'bg-green-600/70'
  return 'bg-green-500'
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function DailyCalendar({ onClose }: { onClose: () => void }) {
  const { profile } = useGame()
  const activityDates = profile.activityDates ?? {}
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate())

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth)

  const calendarCells = useMemo(() => {
    const cells: (number | null)[] = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  }, [firstDay, daysInMonth])

  const { totalActiveDays, totalXP, currentStreak, longestStreak } = useMemo(() => {
    let activeDays = 0
    let xpSum = 0

    for (let d = 1; d <= daysInMonth; d++) {
      const key = formatDateKey(viewYear, viewMonth, d)
      const xp = activityDates[key] ?? 0
      if (xp > 0) {
        activeDays++
        xpSum += xp
      }
    }

    // Calculate streaks from all activity dates
    const allDates = Object.keys(activityDates)
      .filter((k) => (activityDates[k] ?? 0) > 0)
      .sort()

    let longest = 0
    let current = 0
    let streak = 0

    if (allDates.length > 0) {
      streak = 1
      for (let i = 1; i < allDates.length; i++) {
        const prev = new Date(allDates[i - 1])
        const curr = new Date(allDates[i])
        const diffMs = curr.getTime() - prev.getTime()
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
        if (diffDays === 1) {
          streak++
        } else {
          if (streak > longest) longest = streak
          streak = 1
        }
      }
      if (streak > longest) longest = streak

      // Current streak: count backwards from today
      const todayStr = todayKey
      if (activityDates[todayStr] && activityDates[todayStr] > 0) {
        current = 1
        const d = new Date(today)
        while (true) {
          d.setDate(d.getDate() - 1)
          const k = formatDateKey(d.getFullYear(), d.getMonth(), d.getDate())
          if ((activityDates[k] ?? 0) > 0) {
            current++
          } else {
            break
          }
        }
      }
    }

    return { totalActiveDays: activeDays, totalXP: xpSum, currentStreak: current, longestStreak: longest }
  }, [viewYear, viewMonth, daysInMonth, activityDates, todayKey, today])

  // Build set of dates that are part of consecutive streaks for the viewed month
  const streakDays = useMemo(() => {
    const set = new Set<number>()
    for (let d = 1; d <= daysInMonth; d++) {
      const key = formatDateKey(viewYear, viewMonth, d)
      if ((activityDates[key] ?? 0) <= 0) continue

      // Check if previous day also had activity
      const prevDate = new Date(viewYear, viewMonth, d - 1)
      const prevKey = formatDateKey(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate())
      if ((activityDates[prevKey] ?? 0) > 0) {
        set.add(d)
        continue
      }

      // Check if next day also had activity
      const nextDate = new Date(viewYear, viewMonth, d + 1)
      const nextKey = formatDateKey(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate())
      if ((activityDates[nextKey] ?? 0) > 0) {
        set.add(d)
      }
    }
    return set
  }, [viewYear, viewMonth, daysInMonth, activityDates])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card p-6 w-full max-w-md mx-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Activity Calendar</h2>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted/50 transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-foreground" />
        </button>
        <h3 className="text-foreground font-semibold">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </h3>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {calendarCells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="aspect-square" />
          }

          const key = formatDateKey(viewYear, viewMonth, day)
          const xp = activityDates[key] ?? 0
          const isToday = key === todayKey
          const isStreak = streakDays.has(day)
          const levelClass = getActivityLevel(xp)

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.01 }}
              className={`aspect-square rounded-md flex flex-col items-center justify-center text-xs relative ${levelClass} ${
                isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''
              }`}
              title={xp > 0 ? `${key}: ${xp} XP` : key}
            >
              <span className={`font-medium ${xp > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                {day}
              </span>
              {isStreak && xp > 0 && (
                <span className="text-[10px] leading-none">🔥</span>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Monthly stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-primary">{totalActiveDays}</p>
          <p className="text-xs text-muted-foreground">Active Days</p>
        </div>
        <div className="bg-card rounded-lg p-3 text-center">
          <p className="text-lg font-bold text-primary">{totalXP.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total XP</p>
        </div>
        <div className="bg-card rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <p className="text-lg font-bold text-primary">{currentStreak}</p>
          </div>
          <p className="text-xs text-muted-foreground">Current Streak</p>
        </div>
        <div className="bg-card rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-1">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <p className="text-lg font-bold text-primary">{longestStreak}</p>
          </div>
          <p className="text-xs text-muted-foreground">Longest Streak</p>
        </div>
      </div>
    </motion.div>
  )
}

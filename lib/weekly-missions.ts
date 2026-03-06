import type { WeeklyMission } from './chess-store'

export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function generateWeeklyMissions(weekStart: Date): WeeklyMission[] {
  return [
    { id: 'w-puzzles', title: 'Puzzle Grinder', description: 'Solve 20 puzzles this week', target: 20, progress: 0, xpReward: 100, completed: false, icon: '🧩', weekStart: weekStart.toISOString() },
    { id: 'w-games', title: 'Game Player', description: 'Play 5 games vs AI', target: 5, progress: 0, xpReward: 75, completed: false, icon: '⚔️', weekStart: weekStart.toISOString() },
    { id: 'w-streak', title: 'Consistent Learner', description: 'Log in 5 days this week', target: 5, progress: 0, xpReward: 50, completed: false, icon: '📅', weekStart: weekStart.toISOString() },
    { id: 'w-openings', title: 'Opening Student', description: 'Study 3 openings this week', target: 3, progress: 0, xpReward: 60, completed: false, icon: '📚', weekStart: weekStart.toISOString() },
  ]
}

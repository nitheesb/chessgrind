'use client'

// Shows weekly missions card with progress bars
import type { WeeklyMission } from '@/lib/chess-store'

interface WeeklyMissionsProps {
  missions: WeeklyMission[]
}

export function WeeklyMissions({ missions }: WeeklyMissionsProps) {
  if (!missions || missions.length === 0) return null

  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      {missions.map((mission) => (
        <div key={mission.id} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">{mission.icon}</span>
              <div>
                <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                  {mission.title}
                  {mission.completed && <span className="text-amber-400 text-[10px]">✓</span>}
                </p>
                <p className="text-[10px] text-muted-foreground">{mission.description}</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20 shrink-0">
              +{mission.xpReward} XP
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${mission.completed ? 'bg-amber-500' : 'bg-primary'}`}
                style={{ width: `${Math.min(100, (mission.progress / mission.target) * 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground font-mono shrink-0">
              {mission.progress}/{mission.target}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

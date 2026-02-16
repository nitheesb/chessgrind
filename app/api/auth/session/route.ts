import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getUserById, updateStreak } from '@/lib/redis'
import { ALL_ACHIEVEMENTS, LEVELS, getLevelInfo } from '@/lib/chess-store'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ authenticated: false })
    }

    const user = await getUserById(session.userId)
    if (!user) {
      return NextResponse.json({ authenticated: false })
    }

    // Update streak on session check
    const streakData = await updateStreak(user.id)

    // Calculate level info
    const levelInfo = getLevelInfo(user.xp)
    const nextLevelData = LEVELS.find(l => l.level === levelInfo.currentLevel.level + 1)

    // Merge stored achievements with full achievement data
    const mergedAchievements = ALL_ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      earned: user.achievements.includes(achievement.id),
      earnedDate: user.achievements.includes(achievement.id) ? user.lastActive : undefined,
    }))

    const { passwordHash: _, ...userProfile } = user

    return NextResponse.json({
      authenticated: true,
      user: {
        ...userProfile,
        level: levelInfo.currentLevel.level,
        xpToNext: nextLevelData ? nextLevelData.xpRequired - user.xp : 0,
        streak: streakData.streak,
        bestStreak: streakData.bestStreak,
        achievements: mergedAchievements,
      },
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ authenticated: false })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getUserById, updateUser, updateLeaderboard } from '@/lib/redis'
import { LEVELS, getLevelInfo } from '@/lib/chess-store'

// Sync user progress to backend
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()

    // Validate and sanitize updates
    const allowedFields = [
      'xp',
      'gamesPlayed',
      'puzzlesSolved',
      'openingsLearned',
      'trapsLearned',
      'achievements',
      'dailyChallengeCompleted',
    ]

    const sanitizedUpdates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field]
      }
    }

    // Update daily challenge date if completing today
    if (sanitizedUpdates.dailyChallengeCompleted) {
      sanitizedUpdates.dailyChallengeDate = new Date().toISOString().split('T')[0]
    }

    const updatedUser = await updateUser(session.userId, sanitizedUpdates)
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update leaderboard if XP changed
    if (sanitizedUpdates.xp !== undefined) {
      await updateLeaderboard(session.userId, updatedUser.xp)
    }

    // Calculate level info
    const levelInfo = getLevelInfo(updatedUser.xp)
    const nextLevelData = LEVELS.find(l => l.level === levelInfo.currentLevel.level + 1)

    return NextResponse.json({
      success: true,
      user: {
        level: levelInfo.currentLevel.level,
        xp: updatedUser.xp,
        xpToNext: nextLevelData ? nextLevelData.xpRequired - updatedUser.xp : 0,
      },
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json({ error: 'Failed to sync progress' }, { status: 500 })
  }
}

// Get current progress
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await getUserById(session.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const levelInfo = getLevelInfo(user.xp)
    const nextLevelData = LEVELS.find(l => l.level === levelInfo.currentLevel.level + 1)

    return NextResponse.json({
      xp: user.xp,
      level: levelInfo.currentLevel.level,
      xpToNext: nextLevelData ? nextLevelData.xpRequired - user.xp : 0,
      gamesPlayed: user.gamesPlayed,
      puzzlesSolved: user.puzzlesSolved,
      openingsLearned: user.openingsLearned,
      trapsLearned: user.trapsLearned,
      streak: user.streak,
      bestStreak: user.bestStreak,
      achievements: user.achievements,
    })
  } catch (error) {
    console.error('Progress fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}

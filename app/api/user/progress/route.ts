import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getUserById, updateUser, updateLeaderboard } from '@/lib/redis'
import { LEVELS, getLevelInfo } from '@/lib/chess-store'

// Add XP and handle achievements
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, value } = await request.json()

    const user = await getUserById(session.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updates: Record<string, unknown> = {}
    let xpGained = 0

    switch (action) {
      case 'addXP':
        xpGained = Math.min(value || 0, 1000) // Cap XP gain per action
        updates.xp = user.xp + xpGained
        break

      case 'completePuzzle':
        updates.puzzlesSolved = user.puzzlesSolved + 1
        xpGained = value?.xp || 10
        updates.xp = user.xp + xpGained
        
        // Check puzzle achievements
        if (user.puzzlesSolved + 1 >= 10 && !user.achievements.includes('puzzle-solver')) {
          updates.achievements = [...user.achievements, 'puzzle-solver']
        }
        if (user.puzzlesSolved + 1 >= 50 && !user.achievements.includes('puzzle-50')) {
          updates.achievements = [...(updates.achievements as string[] || user.achievements), 'puzzle-50']
        }
        break

      case 'completeOpening':
        updates.openingsLearned = user.openingsLearned + 1
        xpGained = value?.xp || 20
        updates.xp = user.xp + xpGained
        
        // Check opening achievements
        if (user.openingsLearned + 1 >= 5 && !user.achievements.includes('opening-student')) {
          updates.achievements = [...user.achievements, 'opening-student']
        }
        break

      case 'completeTrap':
        updates.trapsLearned = user.trapsLearned + 1
        xpGained = value?.xp || 30
        updates.xp = user.xp + xpGained
        break

      case 'completeGame':
        updates.gamesPlayed = user.gamesPlayed + 1
        xpGained = value?.xp || 5
        updates.xp = user.xp + xpGained
        
        // First game achievement
        if (user.gamesPlayed === 0 && !user.achievements.includes('first-move')) {
          updates.achievements = [...user.achievements, 'first-move']
        }
        
        // AI crusher achievement
        if (value?.beatLevel >= 5 && !user.achievements.includes('ai-crusher')) {
          updates.achievements = [...(updates.achievements as string[] || user.achievements), 'ai-crusher']
        }
        break

      case 'earnAchievement':
        if (value?.achievementId && !user.achievements.includes(value.achievementId)) {
          updates.achievements = [...user.achievements, value.achievementId]
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const updatedUser = await updateUser(session.userId, updates)
    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
    }

    // Update leaderboard
    if (updates.xp) {
      await updateLeaderboard(session.userId, updatedUser.xp)
    }

    // Check for level up
    const oldLevelInfo = getLevelInfo(user.xp)
    const newLevelInfo = getLevelInfo(updatedUser.xp)
    const leveledUp = newLevelInfo.currentLevel.level > oldLevelInfo.currentLevel.level

    // Check grandmaster achievement
    if (newLevelInfo.currentLevel.level >= 13 && !updatedUser.achievements.includes('grandmaster')) {
      await updateUser(session.userId, {
        achievements: [...updatedUser.achievements, 'grandmaster'],
      })
    }

    const nextLevelData = LEVELS.find(l => l.level === newLevelInfo.currentLevel.level + 1)

    return NextResponse.json({
      success: true,
      xpGained,
      leveledUp,
      newLevel: leveledUp ? newLevelInfo.currentLevel : null,
      user: {
        xp: updatedUser.xp,
        level: newLevelInfo.currentLevel.level,
        xpToNext: nextLevelData ? nextLevelData.xpRequired - updatedUser.xp : 0,
      },
    })
  } catch (error) {
    console.error('Progress update error:', error)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}

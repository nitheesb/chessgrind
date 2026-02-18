import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserByUsername, isRedisConfigured } from '@/lib/redis'
import { signToken, setSessionCookie } from '@/lib/auth'
import { ALL_ACHIEVEMENTS, LEVELS, getLevelInfo } from '@/lib/chess-store'

export async function POST(request: NextRequest) {
  try {
    // Check if Redis is configured
    if (!isRedisConfigured) {
      return NextResponse.json(
        { error: 'Backend not configured. Use demo mode.' },
        { status: 503 }
      )
    }

    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Find user
    const user = await getUserByUsername(username)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Create session token
    const token = await signToken({ userId: user.id, username: user.username })
    await setSessionCookie(token)

    // Calculate level info
    const levelInfo = getLevelInfo(user.xp)
    const nextLevelData = LEVELS.find(l => l.level === levelInfo.currentLevel.level + 1)

    // Merge stored achievements with full achievement data
    const mergedAchievements = ALL_ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      earned: user.achievements.includes(achievement.id),
      earnedDate: user.achievements.includes(achievement.id) ? user.lastActive : undefined,
    }))

    // Return user profile (without password hash)
    const { passwordHash: _, ...userProfile } = user

    return NextResponse.json({
      success: true,
      user: {
        ...userProfile,
        level: levelInfo.currentLevel.level,
        xpToNext: nextLevelData ? nextLevelData.xpRequired - user.xp : 0,
        achievements: mergedAchievements,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}

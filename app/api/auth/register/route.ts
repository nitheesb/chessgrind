import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createUser, getUserByUsername, type StoredUserProfile } from '@/lib/redis'
import { signToken, setSessionCookie, generateUserId } from '@/lib/auth'
import { ALL_ACHIEVEMENTS } from '@/lib/chess-store'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Validate input
    if (!username || typeof username !== 'string' || username.length < 2 || username.length > 20) {
      return NextResponse.json(
        { error: 'Username must be between 2 and 20 characters' },
        { status: 400 }
      )
    }

    if (!password || typeof password !== 'string' || password.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUser = await getUserByUsername(username)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const userId = generateUserId()
    const now = new Date().toISOString()

    const newUser: StoredUserProfile = {
      id: userId,
      username,
      passwordHash,
      avatar: 'K',
      level: 1,
      xp: 0,
      rating: 800,
      streak: 0,
      bestStreak: 0,
      gamesPlayed: 0,
      puzzlesSolved: 0,
      openingsLearned: 0,
      trapsLearned: 0,
      achievements: [],
      dailyChallengeCompleted: false,
      dailyChallengeDate: '',
      joinDate: now,
      lastActive: now,
    }

    await createUser(newUser)

    // Create session token
    const token = await signToken({ userId, username })
    await setSessionCookie(token)

    // Return user profile (without password hash)
    const { passwordHash: _, ...userProfile } = newUser

    return NextResponse.json({
      success: true,
      user: {
        ...userProfile,
        xpToNext: 100,
        achievements: ALL_ACHIEVEMENTS,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
}

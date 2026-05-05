import { NextRequest, NextResponse } from 'next/server'
import redis, { isRedisConfigured } from '@/lib/redis'

export const dynamic = 'force-dynamic'

const HEARTBEAT_KEY = 'system:redis-heartbeat'
const VERCEL_CRON_USER_AGENT = 'vercel-cron/1.0'

function isAuthorizedCronRequest(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET
  const authorization = request.headers.get('authorization')

  if (cronSecret) {
    return authorization === `Bearer ${cronSecret}`
  }

  if (process.env.NODE_ENV !== 'production') {
    return true
  }

  return request.headers.get('user-agent')?.includes(VERCEL_CRON_USER_AGENT) ?? false
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isRedisConfigured || !redis) {
    return NextResponse.json(
      { error: 'Redis is not configured' },
      { status: 503 },
    )
  }

  try {
    const touchedAt = new Date().toISOString()
    await redis.set(HEARTBEAT_KEY, touchedAt)

    return NextResponse.json({
      ok: true,
      key: HEARTBEAT_KEY,
      touchedAt,
    })
  } catch (error) {
    console.error('Redis heartbeat failed:', error)
    return NextResponse.json(
      { error: 'Redis heartbeat failed' },
      { status: 500 },
    )
  }
}

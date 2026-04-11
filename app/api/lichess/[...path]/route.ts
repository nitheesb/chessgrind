import { NextRequest, NextResponse } from 'next/server'

const LICHESS_API = 'https://lichess.org'
const LICHESS_EXPLORER = 'https://explorer.lichess.org'

// Only allow these path prefixes through the proxy
const ALLOWED_PREFIXES = ['puzzle', 'explorer', 'game-export', 'games/user']

// Simple in-memory rate limiter: 30 requests per minute per IP
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT = 30
const RATE_WINDOW_MS = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) || []
  const recent = timestamps.filter(t => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_LIMIT) return false
  recent.push(now)
  rateLimitMap.set(ip, recent)
  // Periodically clean stale entries
  if (rateLimitMap.size > 1000) {
    for (const [key, ts] of rateLimitMap) {
      if (ts.every(t => now - t > RATE_WINDOW_MS)) rateLimitMap.delete(key)
    }
  }
  return true
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const token = process.env.LICHESS_API_TOKEN
  if (!token) {
    return NextResponse.json(
      { error: 'Lichess API token not configured' },
      { status: 503 },
    )
  }

  const { path } = await params
  if (!path || path.length === 0) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 })
  }

  // Validate path against allowlist
  const pathStr = path.join('/')
  if (!ALLOWED_PREFIXES.some(prefix => pathStr.startsWith(prefix))) {
    return NextResponse.json({ error: 'Path not allowed' }, { status: 403 })
  }

  // Rate limit by IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': '60' } },
    )
  }

  // Build target URL
  let targetUrl: string
  if (path[0] === 'explorer') {
    const subPath = path.slice(1).join('/')
    targetUrl = `${LICHESS_EXPLORER}/${subPath}`
  } else if (path[0] === 'game-export') {
    const subPath = path.slice(1).join('/')
    targetUrl = `${LICHESS_API}/game/export/${subPath}`
  } else {
    const subPath = path.join('/')
    targetUrl = `${LICHESS_API}/api/${subPath}`
  }

  // Forward query parameters
  const { searchParams } = request.nextUrl
  const qs = searchParams.toString()
  if (qs) targetUrl += `?${qs}`

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: request.headers.get('accept') || 'application/json',
    }

    const resp = await fetch(targetUrl, { headers })

    return new NextResponse(resp.body, {
      status: resp.status,
      headers: {
        'Content-Type': resp.headers.get('content-type') || 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to proxy Lichess request' },
      { status: 502 },
    )
  }
}

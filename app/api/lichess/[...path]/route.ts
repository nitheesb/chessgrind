import { NextRequest, NextResponse } from 'next/server'

const LICHESS_API = 'https://lichess.org'
const LICHESS_EXPLORER = 'https://explorer.lichess.org'

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

  // Build target URL
  let targetUrl: string
  if (path[0] === 'explorer') {
    // /api/lichess/explorer/lichess?fen=... -> https://explorer.lichess.org/lichess?fen=...
    const subPath = path.slice(1).join('/')
    targetUrl = `${LICHESS_EXPLORER}/${subPath}`
  } else if (path[0] === 'game-export') {
    // /api/lichess/game-export/:id -> https://lichess.org/game/export/:id
    const subPath = path.slice(1).join('/')
    targetUrl = `${LICHESS_API}/game/export/${subPath}`
  } else {
    // /api/lichess/puzzle/daily -> https://lichess.org/api/puzzle/daily
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

    // Stream the response through
    return new NextResponse(resp.body, {
      status: resp.status,
      headers: {
        'Content-Type': resp.headers.get('content-type') || 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
    })
  } catch (e) {
    console.error('[lichess-proxy] error:', e)
    return NextResponse.json(
      { error: 'Failed to proxy Lichess request' },
      { status: 502 },
    )
  }
}

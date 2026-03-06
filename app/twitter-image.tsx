import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'ChessVault — Master Chess Through Play'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #060710 0%, #0f1923 40%, #1a1040 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: '0',
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100px',
            height: '100px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #ffd700 0%, #ffb347 100%)',
            marginBottom: '32px',
            boxShadow: '0 0 60px rgba(255,215,0,0.3)',
            fontSize: '56px',
          }}
        >
          ♚
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '72px', fontWeight: 800, color: '#ffffff', letterSpacing: '-2px' }}>
            ChessVault
          </div>
          <div style={{ fontSize: '28px', color: 'rgba(255,255,255,0.6)', fontWeight: 400, letterSpacing: '2px' }}>
            MASTER CHESS THROUGH PLAY
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
          {['Puzzles', 'Openings', 'Traps', 'AI Play'].map((f) => (
            <div
              key={f}
              style={{
                padding: '10px 24px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '18px',
                fontWeight: 500,
              }}
            >
              {f}
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: '32px', fontSize: '16px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1px' }}>
          chess-vault.vercel.app · Free · No Sign-up Required
        </div>
      </div>
    ),
    { ...size }
  )
}

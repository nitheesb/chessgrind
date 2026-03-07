'use client'

import React, { memo } from 'react'

export type PieceStyleType = 'standard' | 'neo' | 'classic' | 'minimal' | 'pink'

interface ChessPieceProps {
  piece: string
  size?: number
  className?: string
  pieceStyle?: PieceStyleType
}

// Chess.com style piece images using standard Staunton design
const PieceSVGs: Record<string, (isWhite: boolean) => React.ReactNode> = {
  K: (isWhite) => (
    <g>
      {/* King cross */}
      <path d="M22.5 11.63V6M20 8h5" fill="none" stroke={isWhite ? '#000' : '#000'} strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Crown */}
      <path 
        d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
        fill={isWhite ? '#fff' : '#000'}
        stroke={isWhite ? '#000' : '#000'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Body */}
      <path 
        d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"
        fill={isWhite ? '#fff' : '#000'}
        stroke={isWhite ? '#000' : '#000'}
        strokeWidth="1.5"
      />
      {/* Details */}
      <path 
        d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" 
        fill="none" 
        stroke={isWhite ? '#000' : '#fff'}
        strokeWidth="1.5"
      />
    </g>
  ),
  Q: (isWhite) => (
    <g>
      {/* Crown balls */}
      {[6, 14, 22.5, 31, 39].map((cx, i) => (
        <circle key={i} cx={cx} cy={[12, 9, 8, 9, 12][i]} r="2.5" fill={isWhite ? '#fff' : '#000'} stroke="#000" strokeWidth="1.5"/>
      ))}
      {/* Body */}
      <path 
        d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-3.5-14.5-5 13.5-5-14-5 13.5L9 25l-2.5 1z"
        fill={isWhite ? '#fff' : '#000'}
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path 
        d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"
        fill={isWhite ? '#fff' : '#000'}
        stroke="#000"
        strokeWidth="1.5"
      />
      {/* Details */}
      <path d="M11 38.5a35 35 1 0 0 23 0M11 29a35 35 1 0 1 23 0m-21.5 2.5h20m-21 3a35 35 1 0 0 22 0m-23 3a35 35 1 0 0 24 0" fill="none" stroke={isWhite ? '#000' : '#fff'} strokeWidth="1"/>
    </g>
  ),
  R: (isWhite) => (
    <g fill={isWhite ? '#fff' : '#000'} stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"/>
      <path d="M34 14l-3 3H14l-3-3"/>
      <path d="M31 17v12.5H14V17" strokeLinejoin="miter"/>
      <path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/>
      <path d="M11 14h23" fill="none"/>
    </g>
  ),
  B: (isWhite) => (
    <g fill={isWhite ? '#fff' : '#000'} stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/>
      <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
      <circle cx="22.5" cy="8" r="2.5"/>
      <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" fill="none" stroke={isWhite ? '#000' : '#fff'}/>
    </g>
  ),
  N: (isWhite) => (
    <g fill={isWhite ? '#fff' : '#000'} stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/>
      <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/>
      <circle cx="9" cy="25.5" r="0.5" fill="#000"/>
      <path d="M14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z" fill="#000"/>
    </g>
  ),
  P: (isWhite) => (
    <path 
      d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
      fill={isWhite ? '#fff' : '#000'}
      stroke="#000"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  ),
}

// Neo style — chess.com-style high-contrast Staunton pieces
const NeoPieceSVGs: Record<string, (isWhite: boolean) => React.ReactNode> = {
  K: (isWhite) => (
    <g>
      <path d="M22.5 11.63V6" fill="none" stroke={isWhite ? '#000' : '#000'} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M20 8h5" fill="none" stroke={isWhite ? '#000' : '#000'} strokeWidth="1.5" strokeLinejoin="round"/>
      <path 
        d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
        fill={isWhite ? '#fff' : '#000'}
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path 
        d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"
        fill={isWhite ? '#fff' : '#000'}
        stroke="#000"
        strokeWidth="1.5"
      />
      <path 
        d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" 
        fill="none" 
        stroke={isWhite ? '#000' : '#fff'}
        strokeWidth="1"
      />
    </g>
  ),
  Q: (isWhite) => (
    <g>
      {[6, 14, 22.5, 31, 39].map((cx, i) => (
        <circle key={i} cx={cx} cy={[12, 9, 8, 9, 12][i]} r="2.5" fill={isWhite ? '#fff' : '#000'} stroke="#000" strokeWidth="1.5"/>
      ))}
      <path 
        d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-3.5-14.5-5 13.5-5-14-5 13.5L9 25l-2.5 1z"
        fill={isWhite ? '#fff' : '#000'}
        stroke="#000"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path 
        d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"
        fill={isWhite ? '#fff' : '#000'}
        stroke="#000"
        strokeWidth="1.5"
      />
      <path d="M11 38.5a35 35 1 0 0 23 0M11 29a35 35 1 0 1 23 0m-21.5 2.5h20m-21 3a35 35 1 0 0 22 0m-23 3a35 35 1 0 0 24 0" fill="none" stroke={isWhite ? '#000' : '#fff'} strokeWidth="1"/>
    </g>
  ),
  R: (isWhite) => (
    <g fill={isWhite ? '#fff' : '#000'} stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"/>
      <path d="M34 14l-3 3H14l-3-3"/>
      <path d="M31 17v12.5H14V17" strokeLinejoin="miter"/>
      <path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/>
      <path d="M11 14h23" fill="none"/>
      {!isWhite && <><path d="M12 36v-4h21v4H12z" fill="none" stroke="#fff" strokeWidth="1" strokeLinejoin="round"/><path d="M14 29.5h17M14 16h17" fill="none" stroke="#fff" strokeWidth="1"/></>}
    </g>
  ),
  B: (isWhite) => (
    <g fill={isWhite ? '#fff' : '#000'} stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/>
      <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
      <circle cx="22.5" cy="8" r="2.5"/>
      <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" fill="none" stroke={isWhite ? '#000' : '#fff'}/>
    </g>
  ),
  N: (isWhite) => (
    <g fill={isWhite ? '#fff' : '#000'} stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/>
      <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/>
      <circle cx="9" cy="25.5" r="0.5" fill={isWhite ? '#000' : '#fff'}/>
      <path d="M14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z" fill={isWhite ? '#000' : '#fff'}/>
    </g>
  ),
  P: (isWhite) => (
    <path 
      d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
      fill={isWhite ? '#fff' : '#000'}
      stroke="#000"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  ),
}

// Classic style - traditional wood-carved look with thicker outlines
const ClassicPieceSVGs: Record<string, (isWhite: boolean) => React.ReactNode> = {
  K: (isWhite) => (
    <g>
      <path d="M22.5 11.63V6M20 8h5" fill="none" stroke={isWhite ? '#4a3728' : '#4a3728'} strokeWidth="2" strokeLinejoin="round"/>
      <path 
        d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
        fill={isWhite ? '#f5e6c8' : '#3d2b1f'}
        stroke="#4a3728"
        strokeWidth="2"
      />
      <path 
        d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"
        fill={isWhite ? '#f5e6c8' : '#3d2b1f'}
        stroke="#4a3728"
        strokeWidth="2"
      />
      <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" fill="none" stroke={isWhite ? '#8b7355' : '#c4a882'} strokeWidth="1.5"/>
    </g>
  ),
  Q: (isWhite) => (
    <g>
      {[6, 14, 22.5, 31, 39].map((cx, i) => (
        <circle key={i} cx={cx} cy={[12, 9, 8, 9, 12][i]} r="2.5" fill={isWhite ? '#f5e6c8' : '#3d2b1f'} stroke="#4a3728" strokeWidth="2"/>
      ))}
      <path 
        d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-3.5-14.5-5 13.5-5-14-5 13.5L9 25l-2.5 1z"
        fill={isWhite ? '#f5e6c8' : '#3d2b1f'}
        stroke="#4a3728"
        strokeWidth="2"
      />
      <path 
        d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"
        fill={isWhite ? '#f5e6c8' : '#3d2b1f'}
        stroke="#4a3728"
        strokeWidth="2"
      />
      <path d="M11 38.5a35 35 1 0 0 23 0M11 29a35 35 1 0 1 23 0m-21.5 2.5h20m-21 3a35 35 1 0 0 22 0m-23 3a35 35 1 0 0 24 0" fill="none" stroke={isWhite ? '#8b7355' : '#c4a882'} strokeWidth="1"/>
    </g>
  ),
  R: (isWhite) => (
    <g fill={isWhite ? '#f5e6c8' : '#3d2b1f'} stroke="#4a3728" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"/>
      <path d="M34 14l-3 3H14l-3-3"/>
      <path d="M31 17v12.5H14V17" strokeLinejoin="miter"/>
      <path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/>
      <path d="M11 14h23" fill="none"/>
    </g>
  ),
  B: (isWhite) => (
    <g fill={isWhite ? '#f5e6c8' : '#3d2b1f'} stroke="#4a3728" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/>
      <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
      <circle cx="22.5" cy="8" r="2.5"/>
      <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" fill="none" stroke={isWhite ? '#8b7355' : '#c4a882'}/>
    </g>
  ),
  N: (isWhite) => (
    <g fill={isWhite ? '#f5e6c8' : '#3d2b1f'} stroke="#4a3728" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/>
      <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/>
      <circle cx="9" cy="25.5" r="0.5" fill="#4a3728"/>
      <path d="M14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z" fill="#4a3728"/>
    </g>
  ),
  P: (isWhite) => (
    <path 
      d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
      fill={isWhite ? '#f5e6c8' : '#3d2b1f'}
      stroke="#4a3728"
      strokeWidth="2"
      strokeLinecap="round"
    />
  ),
}

// Minimal style - clean, simplified geometric shapes
const MinimalPieceSVGs: Record<string, (isWhite: boolean) => React.ReactNode> = {
  K: (isWhite) => (
    <g>
      <path d="M22.5 11.63V6M20 8h5" fill="none" stroke={isWhite ? '#666' : '#666'} strokeWidth="1" strokeLinejoin="round"/>
      <path 
        d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
        fill={isWhite ? '#fff' : '#333'}
        stroke={isWhite ? '#999' : '#999'}
        strokeWidth="1"
      />
      <path 
        d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"
        fill={isWhite ? '#fff' : '#333'}
        stroke={isWhite ? '#999' : '#999'}
        strokeWidth="1"
      />
    </g>
  ),
  Q: (isWhite) => (
    <g>
      {[6, 14, 22.5, 31, 39].map((cx, i) => (
        <circle key={i} cx={cx} cy={[12, 9, 8, 9, 12][i]} r="2" fill={isWhite ? '#fff' : '#333'} stroke={isWhite ? '#999' : '#999'} strokeWidth="1"/>
      ))}
      <path 
        d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-3.5-14.5-5 13.5-5-14-5 13.5L9 25l-2.5 1z"
        fill={isWhite ? '#fff' : '#333'}
        stroke={isWhite ? '#999' : '#999'}
        strokeWidth="1"
      />
      <path 
        d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"
        fill={isWhite ? '#fff' : '#333'}
        stroke={isWhite ? '#999' : '#999'}
        strokeWidth="1"
      />
    </g>
  ),
  R: (isWhite) => (
    <g fill={isWhite ? '#fff' : '#333'} stroke={isWhite ? '#999' : '#999'} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"/>
      <path d="M34 14l-3 3H14l-3-3"/>
      <path d="M31 17v12.5H14V17" strokeLinejoin="miter"/>
      <path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/>
      <path d="M11 14h23" fill="none"/>
    </g>
  ),
  B: (isWhite) => (
    <g fill={isWhite ? '#fff' : '#333'} stroke={isWhite ? '#999' : '#999'} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/>
      <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
      <circle cx="22.5" cy="8" r="2.5"/>
    </g>
  ),
  N: (isWhite) => (
    <g fill={isWhite ? '#fff' : '#333'} stroke={isWhite ? '#999' : '#999'} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/>
      <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/>
      <circle cx="9" cy="25.5" r="0.5" fill={isWhite ? '#999' : '#999'}/>
      <path d="M14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z" fill={isWhite ? '#999' : '#999'}/>
    </g>
  ),
  P: (isWhite) => (
    <path 
      d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
      fill={isWhite ? '#fff' : '#333'}
      stroke={isWhite ? '#999' : '#999'}
      strokeWidth="1"
      strokeLinecap="round"
    />
  ),
}

// Pink style - soft rose tones with warm accents
const PinkPieceSVGs: Record<string, (isWhite: boolean) => React.ReactNode> = {
  K: (isWhite) => (
    <g>
      <path d="M22.5 11.63V6M20 8h5" fill="none" stroke={isWhite ? '#c4507a' : '#c4507a'} strokeWidth="1.5" strokeLinejoin="round"/>
      <path 
        d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
        fill={isWhite ? '#fce4ec' : '#880e4f'}
        stroke={isWhite ? '#d4778a' : '#f48fb1'}
        strokeWidth="1.5"
      />
      <path 
        d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10V37z"
        fill={isWhite ? '#fce4ec' : '#880e4f'}
        stroke={isWhite ? '#d4778a' : '#f48fb1'}
        strokeWidth="1.5"
      />
      <path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" fill="none" stroke={isWhite ? '#f8bbd0' : '#ad1457'} strokeWidth="1"/>
    </g>
  ),
  Q: (isWhite) => (
    <g>
      {[6, 14, 22.5, 31, 39].map((cx, i) => (
        <circle key={i} cx={cx} cy={[12, 9, 8, 9, 12][i]} r="2.5" fill={isWhite ? '#fce4ec' : '#880e4f'} stroke={isWhite ? '#d4778a' : '#f48fb1'} strokeWidth="1.5"/>
      ))}
      <path 
        d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-3.5-14.5-5 13.5-5-14-5 13.5L9 25l-2.5 1z"
        fill={isWhite ? '#fce4ec' : '#880e4f'}
        stroke={isWhite ? '#d4778a' : '#f48fb1'}
        strokeWidth="1.5"
      />
      <path 
        d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"
        fill={isWhite ? '#fce4ec' : '#880e4f'}
        stroke={isWhite ? '#d4778a' : '#f48fb1'}
        strokeWidth="1.5"
      />
      <path d="M11 38.5a35 35 1 0 0 23 0M11 29a35 35 1 0 1 23 0m-21.5 2.5h20m-21 3a35 35 1 0 0 22 0m-23 3a35 35 1 0 0 24 0" fill="none" stroke={isWhite ? '#f8bbd0' : '#ad1457'} strokeWidth="1"/>
    </g>
  ),
  R: (isWhite) => (
    <g fill={isWhite ? '#fce4ec' : '#880e4f'} stroke={isWhite ? '#d4778a' : '#f48fb1'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"/>
      <path d="M34 14l-3 3H14l-3-3"/>
      <path d="M31 17v12.5H14V17" strokeLinejoin="miter"/>
      <path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/>
      <path d="M11 14h23" fill="none"/>
    </g>
  ),
  B: (isWhite) => (
    <g fill={isWhite ? '#fce4ec' : '#880e4f'} stroke={isWhite ? '#d4778a' : '#f48fb1'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/>
      <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
      <circle cx="22.5" cy="8" r="2.5"/>
    </g>
  ),
  N: (isWhite) => (
    <g fill={isWhite ? '#fce4ec' : '#880e4f'} stroke={isWhite ? '#d4778a' : '#f48fb1'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/>
      <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/>
      <circle cx="9" cy="25.5" r="0.5" fill={isWhite ? '#d4778a' : '#f48fb1'}/>
      <path d="M14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5z" fill={isWhite ? '#d4778a' : '#f48fb1'}/>
    </g>
  ),
  P: (isWhite) => (
    <path 
      d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
      fill={isWhite ? '#fce4ec' : '#880e4f'}
      stroke={isWhite ? '#d4778a' : '#f48fb1'}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  ),
}

const PIECE_STYLE_MAP: Record<PieceStyleType, Record<string, (isWhite: boolean) => React.ReactNode>> = {
  standard: PieceSVGs,
  neo: NeoPieceSVGs,
  classic: ClassicPieceSVGs,
  minimal: MinimalPieceSVGs,
  pink: PinkPieceSVGs,
}

// Memoized piece component for performance
export const ChessPiece = memo(function ChessPiece({ piece, size = 45, className = '', pieceStyle = 'standard' }: ChessPieceProps) {
  const pieceType = piece[1]
  const isWhite = piece[0] === 'w'
  const styleSVGs = PIECE_STYLE_MAP[pieceStyle] || PieceSVGs
  const PieceSVG = styleSVGs[pieceType]
  if (!PieceSVG) return null

  return (
    <svg
      viewBox="0 0 45 45"
      width={size}
      height={size}
      className={className}
      style={{ 
        willChange: 'transform',
        filter: 'drop-shadow(2px 4px 2px rgba(0,0,0,0.4))',
      }}
    >
      {PieceSVG(isWhite)}
    </svg>
  )
})

// Convert FEN piece character to our piece format
export function fenToPiece(fenChar: string): string | null {
  const map: Record<string, string> = {
    'K': 'wK', 'Q': 'wQ', 'R': 'wR', 'B': 'wB', 'N': 'wN', 'P': 'wP',
    'k': 'bK', 'q': 'bQ', 'r': 'bR', 'b': 'bB', 'n': 'bN', 'p': 'bP',
  }
  return map[fenChar] || null
}

// Parse FEN string into board array
export function parseFEN(fen: string): (string | null)[][] {
  const rows = fen.split(' ')[0].split('/')
  const board: (string | null)[][] = []

  for (const row of rows) {
    const boardRow: (string | null)[] = []
    for (const char of row) {
      if (/\d/.test(char)) {
        for (let i = 0; i < parseInt(char); i++) {
          boardRow.push(null)
        }
      } else {
        boardRow.push(fenToPiece(char))
      }
    }
    board.push(boardRow)
  }

  return board
}

export function getPieceSymbol(type: string): string {
  const symbols: Record<string, string> = {
    'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  }
  return symbols[type.toUpperCase()] || ''
}

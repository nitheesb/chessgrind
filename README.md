# ChessVault - Gamified Chess Learning App

A modern, gamified chess learning application built with Next.js 16, designed for mobile-first experience (optimized for iPhone 16 Pro Max).

## Features

- 🎯 **Tactical Puzzles** - Solve puzzles to improve pattern recognition
- 📚 **Opening Explorer** - Learn popular chess openings with detailed explanations
- 🪤 **Opening Traps** - Master devastating tricks to surprise opponents
- 🤖 **Play vs AI** - 8 difficulty levels powered by intelligent evaluation
- 🏆 **Gamification** - XP system, levels, achievements, and daily streaks
- 📊 **Progress Tracking** - Synced across devices with Upstash Redis

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Animations**: Framer Motion
- **Chess Logic**: chess.js
- **Database**: Upstash Redis
- **Auth**: JWT tokens with HTTP-only cookies
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Upstash Redis account (for production)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd chessvault
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Edit `.env.local` with your credentials:
```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
JWT_SECRET=your-secure-random-string
```

5. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment to Vercel

### Option 1: Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard or CLI:
```bash
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
vercel env add JWT_SECRET
```

### Option 2: Git Integration

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel project settings
4. Deploy automatically on push

### Environment Variables for Vercel

| Variable | Description |
|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | Your Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash Redis REST token |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) |

## Setting Up Upstash Redis

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Select a region close to your Vercel deployment
4. Copy the REST URL and Token to your environment variables

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/          # Authentication endpoints
│   │   └── user/          # User progress endpoints
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── chess/             # Chessboard and pieces
│   ├── pages/             # Page components
│   ├── shell/             # App shell and navigation
│   └── ui/                # UI components
├── lib/
│   ├── api-client.ts      # Frontend API client
│   ├── auth.ts            # Auth utilities
│   ├── chess-data.ts      # Openings, puzzles, traps data
│   ├── chess-store.ts     # Game state types
│   ├── game-context.tsx   # React context for game state
│   ├── redis.ts           # Redis client
│   └── utils.ts           # Utility functions
├── public/
│   └── manifest.json      # PWA manifest
├── vercel.json            # Vercel configuration
└── next.config.mjs        # Next.js configuration
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/session` - Check session status

### User Progress

- `GET /api/user/sync` - Get user progress
- `POST /api/user/sync` - Sync progress to server
- `POST /api/user/progress` - Update specific progress (XP, achievements, etc.)

## PWA Support

The app includes a manifest.json for Progressive Web App support. Users can add it to their home screen on iOS for a native-like experience.

To add to home screen on iPhone:
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

## Demo Mode

If the backend is not configured (no Redis credentials), the app will run in demo mode:
- All features work locally
- Progress is not saved between sessions
- No authentication required

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

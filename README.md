<div align="center">

# ♟️ ChessGrind

**A chess.com-quality chess training platform built with Next.js 16**

[![Live Demo](https://img.shields.io/badge/Live-chessgrind.vercel.app-f59e0b?style=for-the-badge&logo=vercel&logoColor=white)](https://chessgrind.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)

*65+ puzzles · 80+ openings · 8 AI difficulty levels · Full gamification*

</div>

---

## ✨ Features at a Glance

| Category | Highlights |
|----------|-----------|
| 🎯 **Puzzles** | 65 tactical puzzles, Puzzle Rush mode, multi-level hints, theme filtering, combo streaks |
| 🤖 **Play vs AI** | 8 levels (400–2000 ELO), pre-move system, time controls, eval bar, opening detection |
| 📚 **Learn** | 80+ openings with ECO codes, 10 opening traps, interactive move-by-move lessons |
| 🏋️ **Training** | Coordinate trainer, 12 endgame practice positions, blindfold mode |
| 🏆 **Gamification** | 15 levels, 24+ achievements, daily challenges, weekly missions, XP combos |
| 📊 **Analytics** | Rating graphs, tactical radar chart, activity heatmap, move quality annotations |
| 🎨 **Customization** | 7 board themes, 5 piece styles, dark/light mode, zen mode |
| 📱 **Platform** | Fully responsive mobile + desktop, PWA installable, keyboard shortcuts |

---

## 🎮 Core Modules

### ♟️ Play vs AI

Challenge a custom-built chess engine with 8 difficulty levels — from beginner-friendly random play to a depth-6 tactical monster.

- **8 AI opponents** — Beginner Bot (400) → Stockfish Beast (2000)
- **Engine** — Negamax with alpha-beta pruning, quiescence search, piece-square tables, MVV-LVA move ordering, and opening book
- **Time controls** — Unlimited, 1/3/5/10 min, or increment (5|3, 10|5)
- **Pre-move system** — Queue your next move while AI thinks
- **Evaluation bar** — Real-time position assessment beside the board
- **Opening detection** — Automatically identifies 66+ openings by ECO code
- **Move quality annotations** — Post-game analysis marks moves as `!!` `!` `?!` `?` `??`
- **Keyboard move input** — Type moves in SAN (`Nf3`) or coordinate (`e2e4`) notation
- **Board controls** — Resize (280–600px), flip, coordinates toggle, blindfold mode
- **FEN copy** — One-click copy of current position
- **PGN export** — Download or copy full game notation
- **Captured pieces** — Material balance display
- **Resign** — With confirmation dialog

### 🎯 Tactical Puzzles

65 hand-picked puzzles across multiple themes and difficulty levels with a satisfying progression system.

- **Puzzle categories** — Forks, pins, skewers, back-rank mates, discovered attacks, and more
- **Difficulty tiers** — Easy, Medium, Hard, Expert with color-coded badges
- **Theme filtering** — Filter by tactical motif
- **Multi-level hints** — 4 progressive hint levels (highlight piece → show square → draw arrow → reveal answer) at 5 XP each
- **Puzzle Rush** — Speed mode: solve as many as possible in 3 or 5 minutes
- **Combo system** — Chain correct solves for 2x–3x XP multipliers
- **Perfect solve bonus** — Extra XP for solving without hints or mistakes
- **Tactical radar chart** — SVG radar visualization of your strengths/weaknesses across puzzle themes
- **Share buttons** — Share your solve on social media

### 📚 Opening Explorer

80+ chess openings with interactive board visualization, move annotations, and win-rate statistics.

- **Categories** — King's Pawn (1.e4), Queen's Pawn (1.d4), and Flank openings
- **Interactive lessons** — Step through each opening move-by-move with annotations
- **Win rate stats** — White/Draw/Black percentages for each opening
- **Key ideas** — Strategic concepts explained for every opening
- **Difficulty ratings** — Beginner to Advanced
- **ECO classification** — Standard Encyclopedia of Chess Openings codes

### 🪤 Opening Traps

10 deadly traps with step-by-step explanations to catch opponents off guard.

- **Famous traps** — Legal Trap, Fried Liver, Stafford Gambit, and more
- **For both sides** — Traps for White and Black
- **Interactive board** — Walk through each trap move-by-move
- **Strategic context** — Why each trap works and how to set it up

### 🏋️ Training Tools

#### Coordinate Trainer
- 30-second timed challenge — find the named square on the board
- Score, accuracy, streak, and best streak tracking
- Visual feedback with color-coded correct/incorrect flashes

#### Endgame Practice
- 12 curated positions across Basic, Intermediate, and Advanced categories
- K+Q vs K, K+R vs K, Lucena Position, Philidor Position, and more
- Play against AI (depth 4) to practice technique
- Tips and explanations for each position

#### Blindfold Mode
- Toggle in Settings to hide all pieces on the board
- Train board visualization and memory
- Works in Play vs AI and practice modes

---

## 🏆 Gamification System

### XP & Levels

15 progression levels with unique titles and exponential XP requirements:

| Level | Title | XP Required |
|-------|-------|-------------|
| 1 | Pawn | 0 |
| 2 | Knight Initiate | 100 |
| 3 | Bishop's Student | 250 |
| 5 | Queen's Guard | 800 |
| 8 | Expert | 2,500 |
| 10 | Grandmaster | 5,000 |
| 15 | Chess Immortal | 17,000 |

### Achievements

24+ achievements across 4 rarity tiers:

- 🟢 **Common** — First Steps, Opening Scholar, Trap Apprentice
- 🔵 **Rare** — Tactician (50 puzzles), Rating milestones (1200+)
- 🟣 **Epic** — Grandmaster (1600+ rating), 10-game streak
- 🟡 **Legendary** — Chess Master (2000+ rating), 20x combo

### Daily & Weekly

- **Daily puzzle** — Fresh challenge each day with bonus XP
- **Daily login bonus** — 5–50 XP based on streak length
- **Weekly missions** — 4–5 rotating challenges (e.g., "Solve 20 puzzles", "Learn 3 openings")
- **Streak tracking** — Current and best streak with visual calendar

---

## 🎨 Customization

### Board Themes (7)
Classic Green · Wooden Brown · Ocean Blue · Royal Purple · Rose Pink · Tournament · Deep Sea

### Piece Styles (5)
Standard · Neo · Classic · Minimal · Rose

### App Themes
Dark mode (default) · Light mode · System auto-detect

### Accessibility
- **Zen Mode** — Fades away all non-essential UI for distraction-free play
- **Reduced Motion** — Respects `prefers-reduced-motion`; manual toggle available
- **Keyboard shortcuts** — `Cmd/Ctrl+K` command palette, `Cmd+1–5` quick nav, `H` for hint, `N` for next
- **Sound & haptic toggles** — Independent controls for sound effects and vibration

---

## 📊 Analytics & Profile

- **Rating graph** — Puzzle rating history with trend indicators
- **Activity heatmap** — GitHub-style 52-week contribution calendar
- **Tactical radar** — SVG radar chart showing strengths across puzzle themes
- **Move quality analysis** — Post-game move annotations with color coding
- **8 profile stats** — Games Played, Puzzles Solved, Openings Learned, Traps Mastered, Current Streak, Best Streak, Puzzle Rating, Total XP
- **Recent games** — Last 8 games with W/D/L indicators
- **Areas to improve** — Top failed puzzle themes with progress bars

---

## 🖥️ Platform & UX

### Responsive Design
- **Mobile** — Bottom navigation, touch-optimized 44px+ tap targets, swipe-friendly
- **Desktop** — Persistent sidebar, command palette (`Cmd+K`), hover preloading, keyboard shortcuts

### Progressive Web App
- Installable on iOS, Android, and desktop
- Standalone display mode with custom splash screen
- App icons at 192px, 512px, and SVG

### Performance
- Lazy-loaded pages with React `Suspense` and skeleton fallbacks
- Memoized chessboard rendering (64 squares, piece caching)
- Code-split routes — only dashboard loads eagerly
- Turbopack builds in ~5 seconds

### UI Polish
- Glassmorphism card styling with backdrop blur
- Framer Motion page transitions and micro-interactions
- XP floating text, level-up celebrations, achievement particle bursts
- Confetti on puzzle completion, combo fire effects
- Animated counters, progress rings, and shimmer text

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16.1.6](https://nextjs.org) (App Router, Turbopack) |
| **UI** | [React 19.2](https://react.dev) + [TypeScript](https://typescriptlang.org) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com) + custom CSS |
| **Animations** | [Framer Motion 11](https://www.framer.com/motion/) |
| **Chess Logic** | [chess.js 1.0](https://github.com/jhlywa/chess.js) + custom engine |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Auth** | JWT ([jose](https://github.com/panva/jose)) + [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **Database** | [Upstash Redis](https://upstash.com/) |
| **Fonts** | Inter + Space Grotesk (Google Fonts) |
| **Deployment** | [Vercel](https://vercel.com) |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Upstash Redis account (optional — works in demo mode without it)

### Installation

```bash
# Clone the repository
git clone https://github.com/nitheesb/chessmind.git
cd chessmind

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

Edit `.env.local`:

```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
JWT_SECRET=your-secure-random-string-min-32-chars
```

```bash
# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Demo Mode

No Redis credentials? No problem. The app runs fully in demo mode:
- All features work using localStorage
- Progress persists per browser
- No authentication required

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Option 1: CLI
npm i -g vercel
vercel

# Option 2: Git integration
# Push to GitHub → Connect to Vercel → Auto-deploy on push
```

Add environment variables in Vercel dashboard:

| Variable | Description |
|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) |

### Setting Up Upstash Redis

1. Go to [console.upstash.com](https://console.upstash.com/)
2. Create a new Redis database
3. Select a region close to your Vercel deployment
4. Copy the REST URL and Token to your environment variables

---

## 📁 Project Structure

```
chessgrind/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── auth/                 # Login, register, logout, session
│   │   └── user/                 # Progress sync & updates
│   ├── learn/                    # SEO-friendly learning pages
│   ├── layout.tsx                # Root layout with SEO metadata
│   └── page.tsx                  # Entry point
├── components/
│   ├── chess/                    # Chessboard, eval bar, coordinate trainer
│   ├── desktop/                  # Desktop-specific page variants
│   ├── pages/                    # Mobile-first page components
│   ├── shell/                    # App shell (mobile + desktop)
│   └── ui/                       # Shared UI (radar, heatmap, animations, etc.)
├── lib/
│   ├── chess-engine.ts           # Custom AI engine (negamax, alpha-beta, PSTs)
│   ├── chess-data/               # Openings, puzzles, traps datasets
│   ├── opening-detection.ts      # ECO opening book (66 entries)
│   ├── endgame-positions.ts      # 12 curated endgame positions
│   ├── move-quality.ts           # Post-game move annotation analyzer
│   ├── game-context.tsx          # Global game state (React Context)
│   ├── settings-context.tsx      # App settings (theme, sound, etc.)
│   └── chess-store.ts            # Levels, achievements, XP calculations
├── styles/globals.css            # Tailwind + custom styles
├── public/manifest.json          # PWA manifest
└── vercel.json                   # Vercel configuration
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/session` | Check session status |

### User Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/sync` | Fetch user progress |
| POST | `/api/user/sync` | Sync progress to server |
| POST | `/api/user/progress` | Update specific progress fields |

---

## 📱 Install as App

### iPhone / iPad
1. Open [chessgrind.vercel.app](https://chessgrind.vercel.app) in Safari
2. Tap the **Share** button
3. Select **Add to Home Screen**

### Android
1. Open in Chrome
2. Tap **⋮** menu → **Install app**

### Desktop
1. Open in Chrome/Edge
2. Click the install icon in the address bar

---

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

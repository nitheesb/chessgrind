# ChessGrind - Project Context

## Overview
ChessGrind is a chess training web app with puzzles, openings, traps, AI play, and progress tracking. Single-page app with mobile and desktop shells.

## Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript, React 19
- **Chess logic:** chess.js
- **Styling:** Tailwind CSS 3.4 + framer-motion animations
- **State:** React Context only (no Redux/Zustand)
- **Backend:** Upstash Redis, JWT auth (jose + bcryptjs)
- **Package manager:** pnpm
- **Deploy:** Vercel

## Commands
- `pnpm dev` — dev server (Turbopack)
- `pnpm build` — production build
- `pnpm lint` — ESLint
- No test framework configured

## Architecture

### Routing & Layout
- App Router (`app/`) with API routes at `app/api/`
- Root `app/page.tsx` detects viewport (768px breakpoint) and renders either `AppShell` (mobile) or `DesktopShell` (desktop)
- Provider hierarchy: `LayoutProvider` > `SettingsProvider` > `GameProvider` > Shell
- Dynamic routes: `/learn/openings/[id]`, `/learn/puzzles/[id]`, `/learn/traps/[id]`

### Component Organization
- `components/pages/` — Mobile page views
- `components/desktop/` — Desktop page views (parallel structure)
- `components/chess/` — Shared chess UI (board, pieces, eval-bar, trainers)
- `components/shell/` — App shells (mobile nav, desktop sidebar/topbar)
- `components/ui/` — Shared UI (animations, achievements, heatmap)

Features have **separate mobile and desktop implementations** in their respective directories. Both share chess components from `components/chess/`.

### State Management
- `lib/game-context.tsx` — User profile, auth, XP, achievements, backend sync
- `lib/settings-context.tsx` — App settings (sound, theme, board style)
- `lib/chess-store.ts` — Pure types/data: levels, achievements, ELO calculation
- Profile persists to `localStorage` + debounced sync to Redis via `/api/user/sync`

### Chess Engine (`lib/chess-engine.ts`)
Client-side TypeScript engine running in a **Web Worker** (`lib/engine.worker.ts`):
- Negamax with alpha-beta pruning + quiescence search
- Piece-square tables (middlegame + endgame king)
- MVV-LVA move ordering
- Hardcoded opening book
- Time budget per search (aborts gracefully)
- 6 depth presets with scaling randomness
- Used for levels 1-3 (low difficulty, instant response)

### Stockfish WASM (`lib/stockfish-client.ts`)
Stockfish 18 running client-side via WebAssembly (~7MB lite single-threaded build):
- Communicates via UCI protocol over a Web Worker
- Lazy-loaded only when needed (levels 4-8 or analysis)
- `getStockfishMove(fen, options)` — returns best move in SAN
- `analyzeWithStockfish(fen, options, onProgress)` — streams eval + PV
- Static assets in `public/stockfish/` (auto-copied via postinstall script)
- Used for levels 4-8 (true ~1200-2800 Elo play) and live analysis

Worker communication via `lib/chess-worker-client.ts`:
- `getBestMoveAsync(fen, config)` — routes to custom engine or Stockfish based on `config.useStockfish`
- `analyzePositionAsync(fen, depth)` — defaults to Stockfish for analysis
- `stopAnalysis()` — stops running Stockfish search
- Lazy worker creation, auto-reconnect on error

### Lichess API (`lib/lichess-api.ts`)
Client for Lichess API with rate limiting and caching:
- `getDailyPuzzle()` — daily puzzle (no auth)
- `getPuzzleById(id)` — puzzle by ID (no auth)
- `getOpeningExplorer(fen, source)` — opening explorer stats for a position
- `getPlayerGames(username, options)` — fetch recent games for a user
- Optional auth token stored in settings (`lichessToken`)
- Rate limiters: 2 req/s main API, 1 req/s explorer API
- 5-minute in-memory cache for repeated queries

### Styling
- Tailwind utilities + shadcn/ui-style HSL CSS variables (`--background`, `--primary`, etc.)
- Dark mode by default (`darkMode: ['class']`)
- `cn()` utility in `lib/utils.ts` (clsx + tailwind-merge)
- `lib/layout-manager.ts` injects `--lm-*` CSS variables via ResizeObserver
- Fonts: Inter (body), Space Grotesk (display)

## Key Files
| File | Purpose |
|------|---------|
| `lib/chess-engine.ts` | Core engine: negamax, eval, opening book, `getBestMove()`, `analyzePosition()` |
| `lib/stockfish-client.ts` | Stockfish 18 WASM UCI client: `getStockfishMove()`, `analyzeWithStockfish()` |
| `lib/engine.worker.ts` | Web Worker wrapper for custom engine |
| `lib/chess-worker-client.ts` | Async client — routes to custom engine or Stockfish |
| `lib/lichess-api.ts` | Lichess API client: puzzles, opening explorer, player games |
| `lib/game-context.tsx` | Global game/auth state provider |
| `lib/settings-context.tsx` | App settings provider (includes Lichess token/username) |
| `lib/chess-store.ts` | Types, levels, achievements, ELO |
| `lib/chess-data.ts` | AI level configs, chess data utilities |
| `lib/chess-data/` | Static data: openings.ts, puzzles.ts, traps.ts |
| `components/chess/chessboard.tsx` | Main board component (framer-motion animations, spring drag) |
| `components/chess/opening-explorer.tsx` | Lichess opening explorer widget |
| `components/shell/desktop-shell.tsx` | Desktop layout shell |
| `components/shell/app-shell.tsx` | Mobile navigation shell |
| `app/page.tsx` | Root page (mobile/desktop switcher) |
| `app/layout.tsx` | Root layout (fonts, metadata, JSON-LD) |
| `public/stockfish/` | Stockfish 18 WASM static assets (~7MB) |

## API Routes
- `POST /api/auth/login|logout|register` — Auth
- `GET /api/auth/session` — Session check
- `GET|POST /api/user/progress` — User progress
- `POST /api/user/sync` — Profile sync to Redis

## Environment Variables
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — Redis
- `JWT_SECRET` — JWT signing
- `NODE_ENV`

## Important Notes
- `typescript.ignoreBuildErrors: true` is set in `next.config.mjs`
- No test framework — verify changes via build + manual testing
- framer-motion springs can generate invalid CSS (e.g. negative blur) — use tween or avoid animating `filter` with springs
- The chess engine's `searchDeadline`/`searchAborted` are module-level globals — `analyzePosition` must save/restore them to avoid corrupting `getBestMove` state

/**
 * Centralized layout manager.
 *
 * Monitors viewport and root container via ResizeObserver, calculates all
 * major layout dimensions (whole pixels, sub-pixel-free), and publishes them
 * as CSS custom properties on :root so every component can consume them.
 *
 * Calculated vars:
 *   --lm-vw           viewport width (px)
 *   --lm-vh           viewport height (px)
 *   --lm-topbar-h     top navigation bar height (px)
 *   --lm-content-h    remaining height below topbar (px)
 *   --lm-board-panel-w  width of left board panel (px)
 *   --lm-board-size   optimal chessboard size (px, square)
 *   --lm-right-panel-w  width of right controls panel (px)
 *   --lm-sidebar-w    sidebar width for list-detail views (px)
 *   --lm-gap          main horizontal gap (px)
 *   --lm-scale        0–1 scale factor relative to 1440px reference
 */

export interface LayoutVars {
  vw: number
  vh: number
  topbarH: number
  contentH: number
  boardPanelW: number
  boardSize: number
  rightPanelW: number
  sidebarW: number
  gap: number
  scale: number
}

// Reference design width used for proportional scaling
const REF_W = 1440

// Snap a float to the nearest whole pixel to avoid sub-pixel blur
const snap = (n: number) => Math.round(n)

function calculate(vw: number, vh: number): LayoutVars {
  const scale = Math.min(Math.max(vw / REF_W, 0.5), 1.4)

  const topbarH = snap(56) // fixed design value
  const contentH = snap(vh - topbarH)

  // Gap between panels
  const gap = snap(Math.max(0, vw * 0.005))

  // Board panel: contains eval-bar (18px) + gap (8px) + board + padding
  // Board itself fills as much content height as feasible (square)
  // We leave padding top+bottom of 32px inside the panel
  const maxBoardFromH = contentH - 32
  // Width budget: we want board panel ~46% of viewport, min 420px, max 700px
  const boardPanelW = snap(Math.min(700, Math.max(420, vw * 0.46)))
  // Actual board fits inside panel accounting for eval-bar (18px) + 2×gap (8px each side) + panel padding (2×20px)
  const boardFitW = boardPanelW - 18 - 8 - 40
  const boardSize = snap(Math.min(boardFitW, maxBoardFromH, 620))

  // Right panel: remainder of viewport
  const rightPanelW = snap(vw - boardPanelW - gap)

  // Sidebar (list-view left column, e.g. traps list / openings filter)
  const sidebarW = snap(Math.min(360, Math.max(240, vw * 0.22)))

  return {
    vw: snap(vw),
    vh: snap(vh),
    topbarH,
    contentH,
    boardPanelW,
    boardSize,
    rightPanelW,
    sidebarW,
    gap,
    scale,
  }
}

function inject(vars: LayoutVars) {
  const root = document.documentElement
  root.style.setProperty('--lm-vw', `${vars.vw}px`)
  root.style.setProperty('--lm-vh', `${vars.vh}px`)
  root.style.setProperty('--lm-topbar-h', `${vars.topbarH}px`)
  root.style.setProperty('--lm-content-h', `${vars.contentH}px`)
  root.style.setProperty('--lm-board-panel-w', `${vars.boardPanelW}px`)
  root.style.setProperty('--lm-board-size', `${vars.boardSize}px`)
  root.style.setProperty('--lm-right-panel-w', `${vars.rightPanelW}px`)
  root.style.setProperty('--lm-sidebar-w', `${vars.sidebarW}px`)
  root.style.setProperty('--lm-gap', `${vars.gap}px`)
  root.style.setProperty('--lm-scale', `${vars.scale}`)
}

let rafId: number | null = null
let observer: ResizeObserver | null = null

export function startLayoutManager(): () => void {
  if (typeof window === 'undefined') return () => {}

  const update = () => {
    if (rafId !== null) return
    rafId = requestAnimationFrame(() => {
      rafId = null
      const vars = calculate(
        document.documentElement.clientWidth,
        document.documentElement.clientHeight,
      )
      inject(vars)
    })
  }

  // Seed immediately
  update()

  // ResizeObserver on <html> catches all resize events including virtual keyboard
  observer = new ResizeObserver(update)
  observer.observe(document.documentElement)

  // Fallback for orientationchange
  window.addEventListener('orientationchange', update, { passive: true })

  return () => {
    observer?.disconnect()
    observer = null
    window.removeEventListener('orientationchange', update)
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }
}

/** Synchronously read a --lm-* value as a number (integer) */
export function readLayoutVar(name: keyof LayoutVars): number {
  if (typeof window === 'undefined') {
    // SSR fallbacks
    const fallbacks: Record<string, number> = {
      vw: 1440, vh: 900, topbarH: 56, contentH: 844,
      boardPanelW: 660, boardSize: 580, rightPanelW: 780,
      sidebarW: 320, gap: 0, scale: 1,
    }
    return fallbacks[name] ?? 0
  }
  const prop = `--lm-${name.replace(/([A-Z])/g, '-$1').toLowerCase()}`
  const val = getComputedStyle(document.documentElement).getPropertyValue(prop).trim()
  return parseInt(val, 10) || 0
}

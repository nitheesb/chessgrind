'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Home,
  Puzzle,
  BookOpen,
  Swords,
  Target,
  User,
  Settings,
  Zap,
  Command,
} from 'lucide-react'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  action: () => void
  keywords?: string[]
}

interface CommandPaletteProps {
  onNavigate: (page: string) => void
}

export function CommandPalette({ onNavigate }: CommandPaletteProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const commands: CommandItem[] = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', description: 'Go to home', icon: <Home className="w-4 h-4" />, action: () => onNavigate('dashboard'), keywords: ['home'] },
    { id: 'puzzles', label: 'Puzzles', description: 'Solve tactical puzzles', icon: <Puzzle className="w-4 h-4" />, action: () => onNavigate('puzzles'), keywords: ['tactics', 'problems'] },
    { id: 'openings', label: 'Openings', description: 'Learn opening theory', icon: <BookOpen className="w-4 h-4" />, action: () => onNavigate('openings'), keywords: ['learn', 'theory', 'study'] },
    { id: 'play', label: 'Play AI', description: 'Play against computer', icon: <Swords className="w-4 h-4" />, action: () => onNavigate('play'), keywords: ['game', 'computer', 'match'] },
    { id: 'traps', label: 'Traps', description: 'Learn opening traps', icon: <Target className="w-4 h-4" />, action: () => onNavigate('traps'), keywords: ['tricks', 'gambits'] },
    { id: 'profile', label: 'Profile', description: 'View your profile', icon: <User className="w-4 h-4" />, action: () => onNavigate('profile'), keywords: ['account', 'stats'] },
    { id: 'settings', label: 'Settings', description: 'App settings', icon: <Settings className="w-4 h-4" />, action: () => onNavigate('settings'), keywords: ['preferences', 'config'] },
  ], [onNavigate])

  const filtered = useMemo(() => {
    if (!query) return commands
    const q = query.toLowerCase()
    return commands.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.keywords?.some(k => k.includes(q))
    )
  }, [query, commands])

  const handleOpen = useCallback(() => {
    setOpen(true)
    setQuery('')
    setSelectedIndex(0)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [])

  const handleSelect = useCallback((item: CommandItem) => {
    item.action()
    handleClose()
  }, [handleClose])

  // Keyboard shortcut
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(prev => !prev)
        setQuery('')
        setSelectedIndex(0)
      }
      if (e.key === 'Escape' && open) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [open, handleClose])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Keyboard navigation inside palette
  const handleInputKeydown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      handleSelect(filtered[selectedIndex])
    }
  }, [filtered, selectedIndex, handleSelect])

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const selected = list.children[selectedIndex] as HTMLElement
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-[201] w-full max-w-lg"
          >
            <div
              className="rounded-2xl overflow-hidden border border-white/[0.1]"
              style={{
                background: 'rgba(20, 22, 30, 0.95)',
                backdropFilter: 'saturate(180%) blur(24px)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
              }}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.06]">
                <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleInputKeydown}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-[15px]"
                />
                <kbd className="hidden sm:flex items-center gap-0.5 px-2 py-1 rounded-md bg-white/[0.06] text-[11px] text-muted-foreground font-mono border border-white/[0.08]">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[320px] overflow-y-auto py-2 px-2">
                {filtered.length === 0 ? (
                  <div className="px-3 py-8 text-center text-muted-foreground text-sm">
                    No results found
                  </div>
                ) : (
                  filtered.map((item, i) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors duration-75 ${
                        i === selectedIndex
                          ? 'bg-white/[0.08] text-foreground'
                          : 'text-muted-foreground hover:bg-white/[0.04]'
                      }`}
                    >
                      <span className={`flex-shrink-0 ${i === selectedIndex ? 'text-primary' : ''}`}>
                        {item.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.label}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                        )}
                      </div>
                      {i === selectedIndex && (
                        <span className="text-xs text-muted-foreground">↵</span>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2 border-t border-white/[0.06] text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono border border-white/[0.08]">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono border border-white/[0.08]">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] font-mono border border-white/[0.08]">esc</kbd>
                  Close
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Small trigger hint for the sidebar
export function CommandPaletteTrigger({ onClick }: { onClick?: () => void }) {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // Dispatch Cmd+K to open the command palette
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }))
    }
  }

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-muted-foreground hover:bg-white/[0.05] hover:text-foreground transition-all duration-150"
    >
      <Search className="w-5 h-5" />
      <span className="text-[13px] font-medium flex-1 text-left">Search</span>
      <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/[0.04] text-[10px] text-muted-foreground font-mono border border-white/[0.06]">
        <Command className="w-3 h-3" />K
      </kbd>
    </button>
  )
}

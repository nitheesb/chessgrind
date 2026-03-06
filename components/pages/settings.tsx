'use client'

import { motion } from 'framer-motion'
import { useSettings } from '@/lib/settings-context'
import { useSoundAndHaptics } from '@/lib/use-sound-haptics'
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Vibrate,
  Grid3X3,
  Crown,
  Lightbulb,
  Palette,
  RotateCcw,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Zap,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

interface SettingsPageProps {
  onBack: () => void
}

// Toggle switch component
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  const { playSound, triggerHaptic } = useSoundAndHaptics()
  
  return (
    <button
      onClick={() => {
        playSound('click')
        triggerHaptic('selection')
        onChange(!enabled)
      }}
      className={`relative w-12 h-7 rounded-full transition-colors ${
        enabled ? 'bg-primary' : 'bg-secondary'
      }`}
    >
      <motion.div
        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
        animate={{ left: enabled ? 26 : 4 }}
        transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      />
    </button>
  )
}

// Setting row component
function SettingRow({
  icon,
  label,
  description,
  children,
}: {
  icon: React.ReactNode
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

// Board style preview
function BoardStylePreview({ style, selected, onSelect }: { 
  style: 'green' | 'brown' | 'blue' | 'purple' | 'pink' | 'tournament' | 'ocean'
  selected: boolean
  onSelect: () => void 
}) {
  const colors: Record<string, { light: string; dark: string }> = {
    green: { light: '#ebecd0', dark: '#739552' },
    brown: { light: '#f0d9b5', dark: '#b58863' },
    blue: { light: '#dee3e6', dark: '#8ca2ad' },
    purple: { light: '#e8dff0', dark: '#9068b0' },
    pink: { light: '#f5dce0', dark: '#d4778a' },
    tournament: { light: '#f5f5f5', dark: '#2d2d2d' },
    ocean: { light: '#c9e8f0', dark: '#4a8fa8' },
  }
  const c = colors[style]
  
  return (
    <button
      onClick={onSelect}
      className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
        selected ? 'border-primary scale-105' : 'border-transparent'
      }`}
    >
      <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
        <div style={{ backgroundColor: c.light }} />
        <div style={{ backgroundColor: c.dark }} />
        <div style={{ backgroundColor: c.dark }} />
        <div style={{ backgroundColor: c.light }} />
      </div>
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-primary/30"
        >
          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </motion.div>
      )}
    </button>
  )
}

// Piece style preview
function PieceStylePreview({ style, label, selected, onSelect }: { 
  style: 'standard' | 'neo' | 'classic' | 'minimal' | 'pink'
  label: string
  selected: boolean
  onSelect: () => void 
}) {
  return (
    <button
      onClick={onSelect}
      className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
        selected ? 'border-primary bg-primary/10' : 'border-transparent bg-secondary/50'
      }`}
    >
      <div className="w-10 h-10 flex items-center justify-center">
        <svg viewBox="0 0 45 45" width={32} height={32}>
          {style === 'standard' && (
            <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#000" strokeWidth="1.5"/>
          )}
          {style === 'neo' && (
            <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#f8f8f8" stroke="#555" strokeWidth="1.5"/>
          )}
          {style === 'classic' && (
            <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#f5e6c8" stroke="#4a3728" strokeWidth="2"/>
          )}
          {style === 'minimal' && (
            <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="#fff" stroke="#999" strokeWidth="1"/>
          )}
        </svg>
      </div>
      <span className={`text-[10px] font-medium ${selected ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
    </button>
  )
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { settings, updateSetting, resetSettings } = useSettings()
  const { playSound, triggerHaptic } = useSoundAndHaptics()

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4 pb-8"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3">
        <button
          onClick={() => {
            playSound('click')
            triggerHaptic('light')
            onBack()
          }}
          className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Settings</h1>
          <p className="text-xs text-muted-foreground">Customize your experience</p>
        </div>
      </motion.div>

      {/* Sound & Haptics */}
      <motion.div variants={item} className="glass-card p-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Sound & Haptics
        </h2>
        
        <SettingRow
          icon={settings.soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          label="Sound Effects"
          description="Move, capture, and game sounds"
        >
          <Toggle
            enabled={settings.soundEnabled}
            onChange={(v) => updateSetting('soundEnabled', v)}
          />
        </SettingRow>

        <SettingRow
          icon={<Vibrate className="w-5 h-5" />}
          label="Haptic Feedback"
          description="Vibration on interactions"
        >
          <Toggle
            enabled={settings.hapticEnabled}
            onChange={(v) => updateSetting('hapticEnabled', v)}
          />
        </SettingRow>
      </motion.div>

      {/* Gameplay */}
      <motion.div variants={item} className="glass-card p-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Gameplay
        </h2>
        
        <SettingRow
          icon={<Grid3X3 className="w-5 h-5" />}
          label="Show Coordinates"
          description="Display a-h and 1-8 on board"
        >
          <Toggle
            enabled={settings.showCoordinates}
            onChange={(v) => updateSetting('showCoordinates', v)}
          />
        </SettingRow>

        <SettingRow
          icon={<Crown className="w-5 h-5" />}
          label="Auto-Queen"
          description="Auto-promote pawns to queen"
        >
          <Toggle
            enabled={settings.autoQueen}
            onChange={(v) => updateSetting('autoQueen', v)}
          />
        </SettingRow>

        <SettingRow
          icon={<Lightbulb className="w-5 h-5" />}
          label="Show Hints"
          description="Display move hints in puzzles"
        >
          <Toggle
            enabled={settings.showHints}
            onChange={(v) => updateSetting('showHints', v)}
          />
        </SettingRow>
      </motion.div>

      {/* Appearance */}
      <motion.div variants={item} className="glass-card p-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Appearance
        </h2>

        {/* Theme selector */}
        <div className="py-3 border-b border-border/50">
          <p className="text-sm font-medium text-foreground mb-2">Theme</p>
          <div className="flex gap-2">
            {([
              { id: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
              { id: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
              { id: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  playSound('click')
                  triggerHaptic('selection')
                  updateSetting('theme', t.id)
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  settings.theme === t.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <SettingRow
          icon={<Zap className="w-5 h-5" />}
          label="Reduce Motion"
          description="Minimize animations and transitions"
        >
          <Toggle
            enabled={settings.reducedMotion}
            onChange={(v) => updateSetting('reducedMotion', v)}
          />
        </SettingRow>
      </motion.div>

      {/* Board Style */}
      <motion.div variants={item} className="glass-card p-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Board Style
        </h2>
        
        <div className="flex flex-wrap gap-3 py-3">
          {(['green', 'brown', 'blue', 'purple', 'pink', 'tournament', 'ocean'] as const).map((style) => (
            <BoardStylePreview
              key={style}
              style={style}
              selected={settings.boardStyle === style}
              onSelect={() => {
                playSound('click')
                triggerHaptic('selection')
                updateSetting('boardStyle', style)
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Piece Style */}
      <motion.div variants={item} className="glass-card p-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Piece Style
        </h2>
        
        <div className="grid grid-cols-4 gap-2 py-3">
          {([
            { id: 'standard', label: 'Standard' },
            { id: 'neo', label: 'Neo' },
            { id: 'classic', label: 'Classic' },
            { id: 'minimal', label: 'Minimal' },
            { id: 'pink', label: 'Rose' },
          ] as const).map((ps) => (
            <PieceStylePreview
              key={ps.id}
              style={ps.id}
              label={ps.label}
              selected={settings.pieceStyle === ps.id}
              onSelect={() => {
                playSound('click')
                triggerHaptic('selection')
                updateSetting('pieceStyle', ps.id)
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* About */}
      <motion.div variants={item} className="glass-card p-4">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          About
        </h2>
        
        <div className="py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">ChessVault</p>
              <p className="text-xs text-muted-foreground">Version 1.0.0</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            playSound('click')
            triggerHaptic('medium')
            if (window.confirm('Reset all settings to defaults? This cannot be undone.')) {
              resetSettings()
            }
          }}
          className="w-full flex items-center justify-between py-4 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Reset Settings</p>
              <p className="text-xs text-muted-foreground">Restore default settings</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </motion.div>
    </motion.div>
  )
}
